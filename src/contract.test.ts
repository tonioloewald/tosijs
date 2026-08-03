import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface, AgentContract, ComponentMap } from './agent'
import { exerciseContract, exerciseComponent } from './contract'
import { Component } from './component'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'
import { validate } from 'tosijs-schema'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
})

// ---------------------------------------------------------------------------
// the blessed adapter shape: a few lines over tosijs-schema. The core seam
// knows nothing about schemas — this is what an app (or eventually
// tosijs-schema itself) supplies.
const schemaContract = (schemas: Record<string, any>): AgentContract => ({
  check(path, value) {
    const schema = schemas[path]
    if (schema == null) return true // no contract at this root — allow
    const reasons: string[] = []
    const ok = validate(value, schema, {
      onError: (at: string, msg: string) => void reasons.push(`${at}: ${msg}`),
    })
    return ok ? true : new Error(`contract violation at ${path} — ${reasons.join('; ')}`)
  },
  describe: () => schemas,
})
// ---------------------------------------------------------------------------

const orderSchema = {
  type: 'object',
  properties: {
    item: { type: 'string' },
    qty: { type: 'number' },
  },
  required: ['item', 'qty'],
  examples: [
    { item: 'kumquat', qty: 3 },
    { item: 'fig', qty: 1 },
  ],
  $counterexamples: [
    { item: 'kumquat' }, // missing qty
    { item: 42, qty: 1 }, // wrong type
    'not even an object',
  ],
}

describe('agent contract seam — write() enforces, describe() declares', () => {
  test('valid writes pass; invalid writes throw the reason and leave state untouched', async () => {
    tosi({ conApp: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conApp'],
        contract: schemaContract({ 'conApp.order': orderSchema }),
      },
    }))

    agent.write('conApp.order', { item: 'kumquat', qty: 3 })
    expect(agent.read('conApp.order')).toEqual({ item: 'kumquat', qty: 3 })

    expect(() => agent.write('conApp.order', { item: 'yuzu' })).toThrow(
      'contract violation'
    )
    // the refused write changed nothing
    expect(agent.read('conApp.order')).toEqual({ item: 'kumquat', qty: 3 })
  })

  test('refusals are audit events, invisible to the changes() drain', async () => {
    tosi({ conAudit: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conAudit'],
        contract: schemaContract({ 'conAudit.order': orderSchema }),
      },
    }))
    const { cursor } = agent.changes()
    expect(() => agent.write('conAudit.order', 'nope')).toThrow()
    const rejection = agent
      .log()
      .find((entry) => entry.note?.startsWith('write rejected'))
    expect(rejection).toBeDefined()
    expect(rejection!.note).toContain('contract violation')
    // the drain reports only real state changes — a refusal is not one
    expect(agent.changes(cursor).changes).toEqual([])
  })

  test('describe() carries the serialized contract — what is LEGAL, not just what exists', async () => {
    tosi({ conDesc: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conDesc'],
        contract: schemaContract({ 'conDesc.order': orderSchema }),
      },
    }))
    const description = agent.describe()
    expect(description.contract).toBeDefined()
    expect(description.contract!['conDesc.order'].required).toEqual([
      'item',
      'qty',
    ])
    // examples travel with the contract: the spec is executable by any reader
    expect(description.contract!['conDesc.order'].examples.length).toBe(2)
  })
})

describe('exerciseContract — the contract is a test', () => {
  test('a truthful contract: every example accepted, every counterexample refused, state restored', async () => {
    tosi({ conRun: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conRun'],
        contract: schemaContract({ 'conRun.order': orderSchema }),
      },
    }))

    const report = exerciseContract(agent)
    expect(report.failed).toBe(0)
    expect(report.passed).toBe(5) // 2 examples + 3 counterexamples
    // trials ran through the REAL surface, and state came back
    expect(agent.read('conRun.order')).toEqual({ item: 'plum', qty: 2 })
  })

  test('a lying contract is caught: a gate that never refuses fails its counterexamples', async () => {
    tosi({ conLiar: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conLiar'],
        contract: {
          check: () => true, // "enforcement" that enforces nothing
          describe: () => ({ 'conLiar.order': orderSchema }),
        },
      },
    }))
    const report = exerciseContract(agent)
    expect(report.failed).toBe(3) // all counterexamples ACCEPTED = all fail
    expect(
      report.trials
        .filter((t) => !t.passed)
        .every((t) => t.error === 'counterexample was ACCEPTED')
    ).toBe(true)
  })

  test('round-trip fidelity catches examples that cannot survive the surface', async () => {
    // the surface serializes (JSON semantics) — an example carrying a Date
    // is a contract whose own spec can't round-trip, and the harness says so
    tosi({ conDate: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conDate'],
        contract: {
          check: () => true,
          describe: () => ({
            'conDate.order': {
              examples: [{ item: 'x', qty: 1, at: new Date(0) }],
            },
          }),
        },
      },
    }))
    const report = exerciseContract(agent)
    expect(report.failed).toBe(1)
    expect(report.trials[0].error).toContain('round-trip mismatch')
  })
})

describe('exerciseComponent — the component is its own test fixture', () => {
  // declared first so `typeof counterContract` can type the class generic:
  // THE DECLARATION IS THE TYPE (as const keeps part tags literal)
  const counterContract = {
    description: 'a counter with a labeled readout and a reset',
    value: { type: 'number', examples: [0, 42] },
    methods: { reset: { description: 'set the count back to zero' } },
    parts: { readout: 'span', increment: 'button' },
    tests: [
      {
        name: 'increment increments and renders',
        steps: [
          { set: { value: 3 } },
          { click: 'increment' },
          { expect: { value: 4, text: { readout: '4' } } },
        ],
      },
    ],
  } as const satisfies ComponentMap

  class HonestCounter extends Component<typeof counterContract> {
    static preferredTagName = 'honest-counter'
    static contract = counterContract
    value = 0
    reset() {
      this.value = 0
    }
    content = ({ span, button }: any) => [
      span({ part: 'readout' }),
      button(
        {
          part: 'increment',
          onClick: () => {
            this.value = (this.value as number) + 1
          },
        },
        '+1'
      ),
    ]
    render() {
      super.render()
      if (!this.hydrated) return
      // typed by the contract: readout is HTMLSpanElement, not Element
      this.parts.readout.textContent = String(this.value)
    }
  }
  const honestCounter = HonestCounter.elementCreator()

  test('the contract types this.parts — the declaration is the type', async () => {
    const el = honestCounter() as HonestCounter
    document.body.append(el)
    await updates()
    // compile-time: readout is an HTMLSpanElement (style exists on it)…
    el.parts.readout.style.fontWeight = 'bold'
    // …and increment is an HTMLButtonElement-flavored element
    expect(el.parts.increment.tagName).toBe('BUTTON')
    // @ts-expect-error — a span has no `href`
    void el.parts.readout.href
    el.remove()
  })

  test('a truthful contract passes every claim, including declared step tests', async () => {
    const el = honestCounter() as HonestCounter
    document.body.append(el)
    await updates()
    const report = await exerciseComponent(el)
    expect(report.trials.filter((t) => !t.passed)).toEqual([])
    // 2 parts + 1 method + 2 value examples + 1 declared test
    expect(report.passed).toBe(6)
    expect(el.value).toBe(0) // snapshot restored
    el.remove()
  })

  test('a lying contract is caught, claim by claim', async () => {
    const el = honestCounter() as HonestCounter
    document.body.append(el)
    await updates()
    const liar: ComponentMap = {
      parts: { readout: 'div', missing: 'input' }, // wrong tag + nonexistent
      methods: { reset: {}, explode: {} }, // one real, one imaginary
      tests: [
        {
          name: 'a behavioral lie',
          steps: [
            { set: { value: 1 } },
            { click: 'increment' },
            { expect: { value: 999 } }, // the component honestly disagrees
          ],
        },
      ],
    }
    const report = await exerciseComponent(el, liar)
    const failures = report.trials.filter((t) => !t.passed)
    expect(failures.map((t) => t.claim)).toEqual([
      'part "readout" is <div>',
      'part "missing" resolves',
      'method "explode" exists',
      'test "a behavioral lie"',
    ])
    expect(failures[3].error).toContain('expected value 999')
    el.remove()
  })

  test('describe() harvests a wired custom element self-declaration (own static only)', async () => {
    const { counterApp } = tosi({ counterApp: { n: 5 } })
    const el = honestCounter() as HonestCounter
    document.body.append(el)
    // wire it so it appears in describe()'s wiring at all
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    bind(el, 'counterApp.n', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))
    const record = agent
      .describe()
      .wiring.find((w) => w.tag === 'honest-counter')!
    expect(record).toBeDefined()
    expect(record.component).toBeDefined()
    expect(record.component!.description).toContain('counter')
    expect(record.component!.parts!.readout).toBe('span')
    // the shipped tests travel with the description — an agent can
    // self-verify the component wherever it mounts
    expect(record.component!.tests!.map((t) => t.name)).toEqual([
      'increment increments and renders',
    ])
    void counterApp
    el.remove()
  })

  test('a subclass does not inherit its parent contract silently', async () => {
    class Grandchild extends HonestCounter {
      static preferredTagName = 'grandchild-counter'
    }
    const grandchild = Grandchild.elementCreator()
    const el = grandchild() as Grandchild
    document.body.append(el)
    await updates()
    const report = await exerciseComponent(el)
    expect(report.failed).toBe(1)
    expect(report.trials[0].error).toContain('no own static contract')
    el.remove()
  })
})

describe('contract.attributes subsumes initAttributes', () => {
  test('contract-declared attributes drive the machinery (defaults, types, attr sync)', async () => {
    const contract = {
      attributes: {
        count: { type: 'number', default: 0 },
        label: { type: 'string', default: 'untitled' },
      },
    } as const satisfies ComponentMap
    class ContractAttrs extends Component<typeof contract> {
      static preferredTagName = 'contract-attrs'
      static contract = contract
    }
    const creator = ContractAttrs.elementCreator()
    const el = creator() as ContractAttrs
    document.body.append(el)
    await updates()
    expect(el.count).toBe(0)
    expect(el.label).toBe('untitled')
    el.setAttribute('count', '5')
    await updates()
    expect(el.count).toBe(5) // number, inferred from the default's type
    el.remove()
  })

  test('declaring BOTH initAttributes and contract.attributes throws — one source of truth', () => {
    class BothDeclared extends Component {
      static preferredTagName = 'both-declared'
      static initAttributes = { count: 0 }
      static contract: ComponentMap = {
        attributes: { count: { type: 'number', default: 0 } },
      }
    }
    expect(() => BothDeclared._resolveInitAttributes()).toThrow(
      'single source of truth'
    )
  })

  test('a contract.attributes entry without a default throws, naming it', () => {
    class NoDefault extends Component {
      static preferredTagName = 'no-default'
      static contract: ComponentMap = {
        attributes: { count: { type: 'number' } },
      }
    }
    expect(() => NoDefault._resolveInitAttributes()).toThrow(
      "missing 'default': count"
    )
  })

  test('initAttributes beside a contract without attributes warns once toward the ideal', () => {
    class Nudged extends Component {
      static preferredTagName = 'nudged-attrs'
      static initAttributes = { count: 0 }
      static contract: ComponentMap = { description: 'no attributes here' }
    }
    const warnings: string[] = []
    const original = console.warn
    console.warn = (msg: string) => void warnings.push(String(msg))
    try {
      const resolved = Nudged._resolveInitAttributes()
      Nudged._resolveInitAttributes() // second call — no second warning
      expect(resolved).toEqual({ count: 0 }) // still works as before
    } finally {
      console.warn = original
    }
    expect(warnings.filter((w) => w.includes('Ideally attributes live in the contract')).length).toBe(1)
  })
})

describe('value-setter enforcement — a contract is an opt-in to being held to it', () => {
  const gated = {
    value: { type: 'number' },
  } as const satisfies ComponentMap
  class GatedValue extends Component<typeof gated> {
    static preferredTagName = 'gated-value'
    static contract = gated
    value = 0
  }
  const gatedValue = GatedValue.elementCreator()

  test('violating writes throw with the reason; valid writes pass', async () => {
    const el = gatedValue() as GatedValue
    document.body.append(el)
    await updates()
    el.value = 7
    expect(el.value).toBe(7)
    expect(() => {
      ;(el as any).value = 'seven'
    }).toThrow('expected type number, got string')
    expect(el.value).toBe(7) // the refused write changed nothing
    el.remove()
  })

  test('no contract, no check — components without one behave as before', async () => {
    class Unfenced extends Component {
      static preferredTagName = 'unfenced-value'
      value: any = 0
    }
    const creator = Unfenced.elementCreator()
    const el = creator() as Unfenced
    document.body.append(el)
    await updates()
    el.value = 'anything at all'
    expect(el.value).toBe('anything at all')
    el.remove()
  })

  test('a registered full validator extends enforcement beyond the native subset', async () => {
    const { setContractValidator } = await import('./component')
    const strict = {
      value: {
        type: 'object',
        properties: { qty: { type: 'number' } },
        required: ['qty'],
      },
    } as const satisfies ComponentMap
    class StrictValue extends Component<typeof strict> {
      static preferredTagName = 'strict-value'
      static contract = strict
      value: any = { qty: 1 }
    }
    const creator = StrictValue.elementCreator()
    const el = creator() as StrictValue
    document.body.append(el)
    await updates()
    // native subset alone: any object passes
    el.value = { wrong: true }
    // with tosijs-schema registered, required-field checking kicks in
    setContractValidator((value, schema) => {
      const reasons: string[] = []
      const ok = validate(value, schema, {
        onError: (at: string, msg: string) => void reasons.push(`${at}: ${msg}`),
      })
      return ok ? true : new Error(reasons.join('; '))
    })
    try {
      expect(() => {
        el.value = { alsoWrong: 1 }
      }).toThrow()
      el.value = { qty: 3 } // legal per schema
      expect(el.value).toEqual({ qty: 3 })
    } finally {
      setContractValidator(null)
    }
    el.remove()
  })
})
