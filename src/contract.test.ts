import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface, AgentContract, ComponentMap } from './agent'
import { exerciseContract, exerciseComponent } from './contract'
import { Component } from './component'
import { tosi } from './xin-proxy'
import { updates, touch } from './path-listener'
import { validate, agentContract } from 'tosijs-schema'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
})

// ---------------------------------------------------------------------------
// the blessed adapter now ships FROM tosijs-schema (1.5.0, closing
// tosijs-schema#2): `agentContract(schemas)` — stricter than the hand-rolled
// original it replaced: fails CLOSED on contracted writes without a
// proposal, and refuses (at construction) schemas using keywords validate
// doesn't enforce. The core seam still knows nothing about schemas.
const schemaContract = (schemas: Record<string, any>): AgentContract =>
  agentContract(schemas)
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
        write: true,
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
        write: true,
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
        write: true,
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
        write: true,
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
        write: true,
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
        write: true,
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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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

  /*
   * WAS: "declaring BOTH throws — one source of truth". Reversed deliberately
   * in tosijs#29. That rule was wrong twice over — the same two declarations
   * split across a prototype chain already merged cleanly (identical intent,
   * opposite outcome, decided only by placement), and "one source of truth" is
   * a property of an attribute NAME, not of a class.
   */
  test('declaring BOTH composes — initAttributes declares, the contract enriches', () => {
    class BothDeclared extends Component {
      static preferredTagName = 'both-declared'
      static initAttributes = { count: 0, label: 'untitled' }
      static contract: ComponentMap = {
        attributes: { count: { type: 'number', default: 3 } },
      }
    }
    // no throw; the contract wins on `count`, `label` survives from init
    expect(BothDeclared._resolveInitAttributes()).toEqual({
      count: 3,
      label: 'untitled',
    })
  })

  test('a contract entry may omit default when initAttributes supplies one', () => {
    class Enriched extends Component {
      static preferredTagName = 'enriched-attrs'
      static initAttributes = { mode: 'a' }
      static contract: ComponentMap = {
        attributes: { mode: { enum: ['a', 'b'] } },
      } as any
    }
    expect(Enriched._resolveInitAttributes()).toEqual({ mode: 'a' })
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

  /*
   * WAS: "warns once toward the ideal". The nudge is GONE (tosijs#29). Its
   * only real force was "so one declaration feeds … the agents", and that was
   * true only because `initAttributes` never reached `describe()`. It does
   * now — so the warning pushed people toward the verbose form for a reason
   * that no longer exists, and toward the API with far fewer users.
   */
  test('initAttributes beside a contract without attributes is silent', () => {
    class NotNudged extends Component {
      static preferredTagName = 'nudged-attrs'
      static initAttributes = { count: 0 }
      static contract: ComponentMap = { description: 'no attributes here' }
    }
    const warnings: string[] = []
    const original = console.warn
    console.warn = (msg: string) => void warnings.push(String(msg))
    try {
      expect(NotNudged._resolveInitAttributes()).toEqual({ count: 0 })
    } finally {
      console.warn = original
    }
    expect(warnings.filter((w) => w.includes('Ideally attributes'))).toEqual([])
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
        onError: (at: string, msg: string) =>
          void reasons.push(`${at}: ${msg}`),
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

describe('sub-path schema routing — a write is judged as the root it would produce', () => {
  const docsSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: { title: { type: 'string' }, body: { type: 'string' } },
      required: ['title', 'body'],
    },
  }

  test('word processor: edits inside docs[n] validate against the whole docs contract', async () => {
    tosi({
      wp: {
        docs: [
          { title: 'Alpha', body: 'aaa' },
          { title: 'Beta', body: 'bbb' },
        ],
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['wp'],
        contract: schemaContract({ 'wp.docs': docsSchema }),
      },
    }))

    // a deep, valid edit lands
    agent.write('wp.docs[1].title', 'Beta (edited)')
    expect(agent.read('wp.docs[1].title')).toBe('Beta (edited)')

    // a deep edit of the wrong type is refused — the sub-path bypass is closed
    expect(() => agent.write('wp.docs[1].title', 42)).toThrow(
      'contract violation'
    )

    // replacing an item with an incomplete document: only ROOT context can
    // see the missing required field — a leaf check never would
    expect(() => agent.write('wp.docs[0]', { title: 'orphan' })).toThrow(
      'contract violation'
    )

    // refused writes changed nothing
    expect(agent.read('wp.docs[0]')).toEqual({ title: 'Alpha', body: 'aaa' })
    expect(agent.read('wp.docs[1].title')).toBe('Beta (edited)')
  })

  test('writes outside any contracted root still pass through (scope allows, contract silent)', async () => {
    tosi({ wpFree: { docs: [{ title: 'x', body: 'y' }], scratch: 'anything' } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['wpFree'],
        contract: schemaContract({ 'wpFree.docs': docsSchema }),
      },
    }))
    agent.write('wpFree.scratch', { totally: 'unconstrained' })
    expect(agent.read('wpFree.scratch')).toEqual({ totally: 'unconstrained' })
  })
})

// ---------------------------------------------------------------------------
// inline contracts: declared where the element is built, harvested into the
// map, aggregated into describe().contract by bound path, enforced on
// write() — and curated away by a top-level contract, which always wins
describe('inline element contracts', () => {
  test('declared at the element, they surface in the record AND the aggregated contract', async () => {
    const { elements } = await import('./elements')
    const schema = {
      type: 'integer',
      minimum: 1,
      maximum: 99,
      description: 'quantity on hand',
      examples: [1, 42],
    }
    tosi({ inlineShop: { qty: 5 } })
    const el = elements.input({
      bindValue: 'inlineShop.qty',
      contract: schema,
    })
    document.body.append(el)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe()
    const record = d.wiring.find((w) => w.contract != null)
    expect(record?.contract).toEqual(schema)
    // aggregation: the contract lands under the element's BOUND path
    expect(d.contract?.['inlineShop.qty']).toEqual(schema)
    el.remove()
  })

  test('write() enforces the inline contract (native subset) and audits the refusal', async () => {
    const { elements } = await import('./elements')
    tosi({ inlineGate: { level: 3 } })
    const el = elements.input({
      bindValue: 'inlineGate.level',
      contract: { type: 'integer' },
    })
    document.body.append(el)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.write('inlineGate.level', 7) // conforming: accepted
    expect(agent.read('inlineGate.level')).toBe(7)
    expect(() => agent.write('inlineGate.level', 'seven')).toThrow(
      /inline contract violation/
    )
    expect(agent.read('inlineGate.level')).toBe(7) // refused = not written
    const refusal = agent.log().find((e) => e.note?.includes('write rejected'))
    expect(refusal?.path).toBe('inlineGate.level')
    el.remove()
  })

  test('curation wins: a top-level contract covering the root supersedes inline', async () => {
    const { elements } = await import('./elements')
    tosi({ inlineCurated: { mode: 'auto' } })
    const el = elements.input({
      bindValue: 'inlineCurated.mode',
      // the inline declaration is STRICTER than the curated one
      contract: { enum: ['auto'] },
    })
    document.body.append(el)
    await updates()

    const curatedSchema = {
      type: 'object',
      properties: { mode: { type: 'string' } },
    }
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['inlineCurated'],
        contract: {
          check: () => true, // curated: anything goes
          describe: () => ({ inlineCurated: curatedSchema }),
        },
      },
    }))
    // inline would refuse 'manual'; curation covers the root, so it passes
    agent.write('inlineCurated.mode', 'manual')
    expect(agent.read('inlineCurated.mode')).toBe('manual')
    // and in the aggregate, the curated key wins over the inline one
    expect(agent.describe().contract?.['inlineCurated']).toEqual(curatedSchema)
    el.remove()
  })

  test('inline examples are exercised by the existing harness — declaration IS test', async () => {
    const { elements } = await import('./elements')
    tosi({ inlineExercised: { name: 'ada' } })
    const el = elements.input({
      bindValue: 'inlineExercised.name',
      contract: {
        type: 'string',
        examples: ['grace', 'ada'],
        $counterexamples: [17, false],
      },
    })
    document.body.append(el)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const report = exerciseContract(agent)
    const mine = report.trials.filter((t) => t.root === 'inlineExercised.name')
    expect(mine.length).toBe(4) // 2 examples + 2 counterexamples
    expect(mine.every((t) => t.passed)).toBe(true)
    expect(agent.read('inlineExercised.name')).toBe('ada') // snapshot restored
    el.remove()
  })
})

// ---------------------------------------------------------------------------
// the seam guarantee, pinned from OUR side (tosijs#25): tosijs-schema 1.5.0's
// agentContract fails closed if a contracted write ever arrives without a
// proposal — this test proves we never send one, at every write shape
describe('seam guarantee — contracted writes always carry a whole-root proposal', () => {
  test('root, dot sub-path, and bracket sub-path writes all propose the whole root', async () => {
    tosi({
      seamApp: { docs: [{ id: 1, title: 'a' }], count: 2 },
      seamFree: { x: 1 },
    })
    await updates()
    const calls: Array<{ path: string; proposal: any }> = []
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['seamApp', 'seamFree'],
        contract: {
          check(path, _value, proposal) {
            // snapshot: later writes mutate the live objects a captured
            // reference would alias
            calls.push({
              path,
              proposal: proposal == null ? proposal : structuredClone(proposal),
            })
            return true
          },
          describe: () => ({ seamApp: { type: 'object' } }),
        },
      },
    }))

    agent.write('seamApp', { docs: [], count: 0 }) // at the root
    agent.write('seamApp.count', 5) // dot sub-path
    agent.write('seamApp.docs[0]', { id: 9, title: 'b' }) // bracket sub-path
    await updates()
    agent.write('seamApp.docs[id=9].title', 'c') // id-path sub-path
    agent.write('seamFree.x', 2) // NOT under the contracted root

    const [root, dot, bracket, idPath, free] = calls
    // every contracted write: proposal present, root correct, proposed is
    // the WHOLE-ROOT hypothetical (the edit in context, not the fragment)
    for (const call of [root, dot, bracket, idPath]) {
      expect(call.proposal).not.toBeNull()
      expect(call.proposal.root).toBe('seamApp')
    }
    expect(root.proposal.proposed).toEqual({ docs: [], count: 0 })
    expect(dot.proposal.proposed.count).toBe(5)
    expect(dot.proposal.proposed.docs).toEqual([]) // context intact
    expect(bracket.proposal.proposed.docs[0]).toEqual({ id: 9, title: 'b' })
    expect(bracket.proposal.proposed.count).toBe(5)
    expect(idPath.proposal.proposed.docs[0].title).toBe('c')
    // outside every contracted root: no proposal (and agentContract's
    // no-roots-affected branch returns true for exactly this shape)
    expect(free.proposal).toBeUndefined()
  })
})

// the shared validator plug upgrades INLINE contracts too — one gate, every
// declaration site: minimum is inert natively, enforced once plugged
describe('inline contracts + plugged full validator', () => {
  test('setContractValidator(validate) makes inline minimum/required real', async () => {
    const { elements } = await import('./elements')
    const { setContractValidator } = await import('./component')
    tosi({ inlineFull: { qty: 5 } })
    const el = elements.input({
      bindValue: 'inlineFull.qty',
      contract: { type: 'integer', minimum: 1 },
    })
    document.body.append(el)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.write('inlineFull.qty', 0) // native subset: integer, passes
    expect(agent.read('inlineFull.qty')).toBe(0)
    setContractValidator((value, schema) => {
      const reasons: string[] = []
      const ok = validate(value, schema, {
        onError: (at: string, msg: string) =>
          void reasons.push(`${at}: ${msg}`),
      })
      return ok ? true : new Error(reasons.join('; '))
    })
    try {
      expect(() => agent.write('inlineFull.qty', 0)).toThrow(
        /inline contract violation/
      )
      agent.write('inlineFull.qty', 3)
      expect(agent.read('inlineFull.qty')).toBe(3)
    } finally {
      setContractValidator(null)
    }
    el.remove()
  })
})

// ---------------------------------------------------------------------------
// blueprints are not left behind: a spec-level contract makes a hydrated
// blueprint component a first-class citizen of the agent surface
describe('blueprint contract — hydrated components self-describe', () => {
  test('spec.contract is stamped, harvested, enforced, and exercisable', async () => {
    const { makeComponent } = await import('./make-component')
    const { exerciseComponent: exercise } = await import('./contract')
    const { enableAgentInterface } = await import('./agent')
    const { updates } = await import('./path-listener')

    const bpContract = {
      description: 'a blueprint-delivered counter',
      value: { type: 'number', examples: [0, 5] },
      parts: { readout: 'span' },
      tests: [
        {
          name: 'value renders',
          steps: [{ set: { value: 7 }, expect: { text: { readout: '7' } } }],
        },
      ],
    } as const

    const { creator, type } = await makeComponent(
      'bp-counter',
      (tag, { Component: C }) => {
        class BpCounter extends (C as any) {
          value = 0
          content = ({ span }: any) => span({ part: 'readout' })
          render() {
            ;(this as any).parts.readout.textContent = String(
              (this as any).value
            )
          }
        }
        return { type: BpCounter as any, contract: bpContract as any }
      }
    )
    // stamped as an OWN static at hydration
    expect(Object.prototype.hasOwnProperty.call(type, 'contract')).toBe(true)

    const el = creator() as any
    document.body.append(el)
    await updates()
    // harvested: the wired instance carries its self-declaration in the map
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      // no bindings, no handlers — the DECLARATION is what puts it on the map
      const rec = agent.describe().wiring.find((w) => w.tag === 'bp-counter')
      expect(rec?.component?.description).toBe('a blueprint-delivered counter')
      // enforced: the value contract gates the setter
      expect(() => {
        el.value = 'not a number'
      }).toThrow(/contract violation/)
      // exercisable: the declaration is its own harness
      const report = await exercise(el)
      expect(report.failed).toBe(0)
      expect(report.passed).toBeGreaterThanOrEqual(3) // part + examples + test
    } finally {
      agent.disable()
      el.remove()
    }
  })
})

// ---------------------------------------------------------------------------
// B1 (pre-release review, 1.8.0-rc.1): a contract violation must never strand
// the rest of the binding-dispatch pass, and must not fire at all under the
// documented bind-before-data pattern.
describe('contract violations cannot strand the dispatch loop', () => {
  test('a violating write reports, applies, and leaves SIBLINGS updated', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { updates } = await import('./path-listener')
    const { xin } = await import('./xin')

    const strict = {
      description: 'a strictly numeric counter',
      value: { type: 'number' },
    } as const satisfies ComponentMap
    class StrandCounter extends Component<typeof strict> {
      static preferredTagName = 'strand-counter'
      static contract = strict
      value: any = 0
      content = null
    }
    const creator = StrandCounter.elementCreator()

    tosi({ strandApp: { n: 1 } })
    await updates()
    const contracted = creator() as any
    const sibling = elements.input()
    document.body.append(contracted, sibling)
    // one-way (toDOM only) for the contracted component: a two-way value
    // binding would echo the component's own value back into state and mask
    // what this test is about — a violating value FLOWING to the DOM
    const { setValue } = await import('./dom')
    bind(contracted, 'strandApp.n', { toDOM: setValue })
    bind(sibling, 'strandApp.n', bindings.value)
    await updates()
    expect(sibling.value).toBe('1')

    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    try {
      // state goes wrong-typed: the contracted component's toDOM violates
      ;(xin as any).strandApp.n = 'not a number'
      await updates()
    } finally {
      console.error = originalError
    }

    // the violation was REPORTED, not thrown…
    expect(errors.some((e) => e.includes('contract violation'))).toBe(true)
    // …the DOM still reflects state (state is authoritative on this path)…
    expect(contracted.value).toBe('not a number')
    // …and — the actual blocker — the SIBLING still updated
    expect(sibling.value).toBe('not a number')

    contracted.remove()
    sibling.remove()
  })

  test('bind-before-data does NOT report: pre-data values are not violations', async () => {
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { updates } = await import('./path-listener')

    const numeric = {
      value: { type: 'number' },
    } as const satisfies ComponentMap
    class PreDataCounter extends Component<typeof numeric> {
      static preferredTagName = 'pre-data-counter'
      static contract = numeric
      value: any = 0
      content = null
    }
    const el = PreDataCounter.elementCreator()() as any
    document.body.append(el)

    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    try {
      // the documented deeply-async pattern: bind to a path with no data yet
      bind(el, 'notYetThere.someNumber', bindings.value)
      await updates()
    } finally {
      console.error = originalError
    }
    expect(errors).toEqual([])
    el.remove()
  })

  test('a DIRECT write still throws — the developer error is caught immediately', async () => {
    const numeric = {
      value: { type: 'number' },
    } as const satisfies ComponentMap
    class DirectCounter extends Component<typeof numeric> {
      static preferredTagName = 'direct-counter'
      static contract = numeric
      value: any = 0
      content = null
    }
    const el = DirectCounter.elementCreator()() as any
    document.body.append(el)
    expect(() => {
      el.value = 'seven'
    }).toThrow(/contract violation/)
    el.remove()
  })

  test('ANY throwing binding is isolated — not just contract violations', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { updates } = await import('./path-listener')
    const { xin } = await import('./xin')

    tosi({ isolateApp: { n: 1 } })
    await updates()
    const exploding = elements.div()
    const sibling = elements.input()
    document.body.append(exploding, sibling)
    bind(exploding, 'isolateApp.n', {
      toDOM() {
        throw new Error('boom')
      },
    })
    bind(sibling, 'isolateApp.n', bindings.value)

    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    try {
      ;(xin as any).isolateApp.n = 7
      await updates()
    } finally {
      console.error = originalError
    }
    expect(errors.some((e) => e.includes('boom'))).toBe(true)
    expect(sibling.value).toBe('7') // survived its neighbour's explosion
    exploding.remove()
    sibling.remove()
  })
})

describe('contract.attributes inheritance (review M3)', () => {
  test('a subclass with contract.attributes KEEPS the base class initAttributes', async () => {
    class AttrBase extends Component {
      static preferredTagName = 'attr-base'
      static initAttributes = { size: 10, tone: 'quiet' }
      content = null
    }
    AttrBase.elementCreator()

    const childContract = {
      attributes: { flavour: { type: 'string', default: 'mango' } },
    } as const satisfies ComponentMap
    class AttrChild extends AttrBase {
      static preferredTagName = 'attr-child'
      static contract = childContract
    }
    const creator = AttrChild.elementCreator()

    // both the inherited names and the contracted one are observed…
    const observed = (AttrChild as any).observedAttributes as string[]
    for (const name of ['size', 'tone', 'flavour']) {
      expect(observed).toContain(name)
    }
    // …and reflection works in BOTH directions for the inherited ones
    const el = creator({ size: 42 }) as any
    document.body.append(el)
    expect(el.size).toBe(42)
    expect(el.getAttribute('size')).toBe('42')
    expect(el.tone).toBe('quiet') // inherited default survives
    expect(el.flavour).toBe('mango') // contracted default
    el.remove()
  })

  /*
   * WAS: "declaring BOTH on the SAME class still throws". That assertion sat
   * directly beneath the inheritance-merge tests above, and the pair was the
   * defect: the SAME two declarations merged cleanly when split across a
   * prototype chain and threw when written on one class. Identical intent,
   * opposite outcomes, decided only by placement — and the same-class form is
   * arguably the safer one, since both declarations are visible in one file.
   *
   * So this now pins the CONSISTENCY rather than the exception (tosijs#29).
   */
  test('same-class and split-across-a-chain resolve identically', () => {
    class SameClass extends Component {
      static preferredTagName = 'attr-same-class'
      static initAttributes = { a: 1 }
      static contract = {
        attributes: { b: { type: 'number', default: 2 } },
      } as any
      content = null
    }
    class SplitBase extends Component {
      static preferredTagName = 'attr-split-base'
      static initAttributes = { a: 1 }
      content = null
    }
    class SplitChild extends SplitBase {
      static preferredTagName = 'attr-split-child'
      static contract = {
        attributes: { b: { type: 'number', default: 2 } },
      } as any
    }
    const expected = { a: 1, b: 2 }
    expect((SameClass as any)._resolveInitAttributes()).toEqual(expected)
    expect((SplitChild as any)._resolveInitAttributes()).toEqual(expected)
  })
})

describe('the harness cannot report green without validating (round-2 review)', () => {
  test('a surface that cannot write is refused up front, not reported as passing', async () => {
    tosi({ inconclusive: { qty: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({ global: false })) // read-only
    expect(() => exerciseContract(agent)).toThrow(/cannot write/)
  })

  // a MANIFEST is now read-only too until it says write: true, and that is
  // the posture most likely to produce a silently-green contract report
  test('a manifest without write: true is refused up front too', async () => {
    tosi({ noWriteEx: { qty: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['noWriteEx'],
        contract: {
          check: () => true,
          describe: () => ({
            'noWriteEx.qty': { type: 'integer', examples: [2] },
          }),
        },
      },
    }))
    expect(agent.describe().writable).toBe(false)
    expect(() => exerciseContract(agent)).toThrow(/cannot write/)
  })

  test('a manifest refusal is INCONCLUSIVE, never a pass', async () => {
    tosi({ exPub: { n: 1 }, exPriv: { n: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['exPub'],
        contract: {
          check: () => true,
          // a contract naming a root the manifest does NOT expose
          describe: () => ({
            'exPriv.n': { type: 'integer', $counterexamples: ['nope'] },
          }),
        },
      },
    }))
    const report = exerciseContract(agent)
    const trial = report.trials.find((t) => t.root === 'exPriv.n')!
    expect(trial.passed).toBe(false)
    expect(trial.error).toContain('inconclusive')
    expect(report.failed).toBeGreaterThan(0) // a green report would be a lie
  })
})

// Review round 3, M2: the check only ever ran from the accessor initValue
// installs, and initValue returned early when the class had no own `value`
// field — so a declared value contract was completely inert, and the harness
// reported its examples AND its counterexamples green.
describe('a declared value contract is enforced even without a value field', () => {
  test('a class with contract.value but no `value = …` still enforces it', async () => {
    const map = {
      value: { type: 'number', examples: [1, 42], $counterexamples: ['nope'] },
    } as const satisfies ComponentMap

    class ContractOnlyValue extends Component<typeof map> {
      static preferredTagName = 'contract-only-value'
      static contract = map
      content = null
    }
    const create = ContractOnlyValue.elementCreator()
    const el = create() as any
    document.body.append(el)
    await el.whenHydrated

    expect(() => {
      el.value = 'nope'
    }).toThrow(/contract violation/)
    el.value = 42
    expect(el.value).toBe(42)

    // and the harness now agrees with reality: the counterexample must FAIL
    // to be accepted, which is a pass for the contract
    const report = await exerciseComponent(el)
    expect(report.failed).toBe(0)
    el.remove()
  })

  test('a class that owns `value` itself is told the contract cannot be enforced', async () => {
    const map = { value: { type: 'number' } } as const satisfies ComponentMap

    class OwnAccessorValue extends Component<typeof map> {
      static preferredTagName = 'own-accessor-value'
      static contract = map
      private _v: any = 0
      get value() {
        return this._v
      }
      set value(v: any) {
        this._v = v
      }
      content = null
    }
    const create = OwnAccessorValue.elementCreator()
    const errors: any[] = []
    const realError = console.error
    console.error = (...args: any[]) => errors.push(args)
    try {
      const el = create() as any
      document.body.append(el)
      await el.whenHydrated
      el.value = 'anything' // the class's own setter — we never see it
      expect(el.value).toBe('anything')
      el.remove()
    } finally {
      console.error = realError
    }
    // silence would be the bug: the map publishes a rule nothing checks
    expect(
      errors.some((args) => String(args[0]).includes('cannot enforce'))
    ).toBe(true)
  })
})

// The `contractviolation` event was shipped in 1.8.0-rc.1 undocumented AND
// untested, dispatching unthrottled on every binding pass for object-valued
// contracts — so every dispatch was pure waste. These pin both halves: it
// fires, and it fires once per (element, reason).
describe('the contractviolation channel (round-3 follow-up)', () => {
  test('an object-valued contract dispatches ONCE, not once per binding pass', async () => {
    const { bind } = await import('./bind')
    const { updates } = await import('./path-listener')
    const { setValue } = await import('./dom')
    const { xin } = await import('./xin')

    const shaped = {
      value: {
        type: 'object',
        properties: { qty: { type: 'number' } },
        required: ['qty'],
      },
    } as const satisfies ComponentMap

    class ShapedValue extends Component<typeof shaped> {
      static preferredTagName = 'shaped-value'
      static contract = shaped
      value: any = { qty: 1 }
      content = null
    }
    const creator = ShapedValue.elementCreator()

    tosi({ cvApp: { order: { qty: 1 } } })
    await updates()
    const el = creator() as any
    document.body.append(el)
    const events: any[] = []
    el.addEventListener('contractviolation', (e: any) => events.push(e.detail))

    bind(el, 'cvApp.order', { toDOM: setValue })
    await updates()

    // the built-in subset only enforces type/enum/const, so `required` needs
    // the real validator plugged — which is also the realistic configuration
    // for anyone who declares an object-valued contract at all
    const { setContractValidator } = await import('./component')
    setContractValidator((value, schema) => {
      const reasons: string[] = []
      const ok = validate(value, schema, {
        onError: (at: string, msg: string) =>
          void reasons.push(`${at}: ${msg}`),
      })
      return ok ? true : new Error(reasons.join('; '))
    })

    const errors: string[] = []
    const originalError = console.error
    console.error = () => errors.push('x')
    try {
      // an object that violates the contract, written through the BINDING
      ;(xin as any).cvApp.order = { nope: true }
      await updates()
      // ...and now several more binding passes over the same bad value. The
      // identity guard upstream cannot suppress these: the proxy returns a
      // fresh object per access, so `value !== newValue` is always true.
      for (let i = 0; i < 5; i++) {
        touch('cvApp.order')
        await updates()
      }
    } finally {
      console.error = originalError
    }

    setContractValidator(null)
    // the identity guard cannot suppress ANY of those passes (fresh proxy per
    // access), so before the fix this was 6 events, and would have kept
    // growing for the life of the page
    expect(events.length).toBe(1)
    expect(events[0].reason).toBeDefined()
    expect('repeated' in events[0]).toBe(false)
    el.remove()
  })

  test('a DIFFERENT reason on the same element is a new event', async () => {
    const { bind } = await import('./bind')
    const { updates } = await import('./path-listener')
    const { setValue } = await import('./dom')
    const { xin } = await import('./xin')

    const typed = { value: { type: 'number' } } as const satisfies ComponentMap
    class TwoReasons extends Component<typeof typed> {
      static preferredTagName = 'two-reasons'
      static contract = typed
      value: any = 0
      content = null
    }
    const creator = TwoReasons.elementCreator()

    tosi({ cvTwo: { n: 1 } })
    await updates()
    const el = creator() as any
    document.body.append(el)
    const reasons: string[] = []
    el.addEventListener('contractviolation', (e: any) =>
      reasons.push(e.detail.reason)
    )
    bind(el, 'cvTwo.n', { toDOM: setValue })
    await updates()

    const originalError = console.error
    console.error = () => {}
    try {
      ;(xin as any).cvTwo.n = 'a string'
      await updates()
      ;(xin as any).cvTwo.n = true
      await updates()
    } finally {
      console.error = originalError
    }

    // deduping is per REASON, so a genuinely different failure still speaks
    expect(new Set(reasons).size).toBe(reasons.length)
    expect(reasons.length).toBeGreaterThanOrEqual(1)
    el.remove()
  })
})

// "THE MAP MUST NOT ADVERTISE WHAT write() WILL NOT ENFORCE" is the strongest
// claim this release makes, and it was guarded by a comment plus two copies of
// one expression. The predicate is hoisted now; this is the test that proves
// the two USES still line up, which hoisting alone cannot.
describe('every schema describe() publishes is one write() actually enforces', () => {
  test('an inline schema superseded by curation is neither advertised nor enforced', async () => {
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { elements } = await import('./elements')

    tosi({ honestMap: { qty: 1, free: 0 } })
    await updates()

    // an inline contract UNDER a curated root — curation must win in both
    // directions, or the map lies
    const curatedField = elements.input({
      id: 'honest-curated',
      contract: { type: 'number', maximum: 5 },
    } as any)
    // …and one outside every curated root, which must survive in both
    const freeField = elements.input({
      id: 'honest-free',
      contract: { type: 'number' },
    } as any)
    document.body.append(curatedField, freeField)
    bind(curatedField, 'honestMap.qty', bindings.value)
    bind(freeField, 'honestMap.free', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        write: true,
        roots: ['honestMap'],
        contract: {
          // curation deliberately accepts everything: if the inline maximum
          // were still advertised, the map would promise a rule this accepts
          // a violation of
          check: () => true,
          describe: () => ({ 'honestMap.qty': { type: 'number' } }),
        },
      },
    }))

    const published = agent.describe().contract ?? {}
    // the superseded inline schema is gone from the map…
    expect(published['honestMap.qty']?.maximum).toBeUndefined()
    // …and write() agrees: curation accepts what the inline rule forbade
    agent.write('honestMap.qty', 99)
    expect(agent.read('honestMap.qty')).toBe(99)

    // the uncurated inline schema is still BOTH published and enforced
    expect(published['honestMap.free']).toBeDefined()
    expect(() => agent.write('honestMap.free', 'not a number')).toThrow(
      /contract/i
    )

    curatedField.remove()
    freeField.remove()
  })
})

// The own-not-inherited rule behind `ownContract()`. It was copy-pasted at six
// sites across four modules with the rationale re-written at four of them, and
// the sites had already begun to differ in what they did next.
describe('a subclass does not wear its parent contract (ownContract)', () => {
  test('an inherited contract governs neither the value gate nor the map', async () => {
    const parentMap = {
      description: 'the parent',
      value: { type: 'number' },
    } as const satisfies ComponentMap

    class ContractParent extends Component<typeof parentMap> {
      static preferredTagName = 'contract-parent'
      static contract = parentMap
      value: any = 0
      content = null
    }
    ContractParent.elementCreator()

    // declares NOTHING of its own — `static` reaches it through the prototype
    // chain, which is exactly the trap
    class ContractChild extends ContractParent {
      static preferredTagName = 'contract-child'
    }
    const childCreator = ContractChild.elementCreator()

    const child = childCreator() as any
    document.body.append(child)
    await child.whenHydrated

    // the parent's value schema must NOT be enforced on the child…
    child.value = 'not a number'
    expect(child.value).toBe('not a number')

    // …and the parent's description must not be stamped on it either, or the
    // map would announce the child as something it never claimed to be
    expect(child.getAttribute('aria-description')).not.toBe('the parent')

    // while the parent itself still honours its own declaration
    const parent = (ContractParent as any)._elementCreator() as any
    document.body.append(parent)
    await parent.whenHydrated
    expect(() => {
      parent.value = 'not a number'
    }).toThrow(/contract/i)

    child.remove()
    parent.remove()
  })
})

// Round-4 M1: the dedupe was one-way. bad → event, valid → nothing, the SAME
// bad again → silence, on both channels. An app showing a validation banner on
// `contractviolation` could never re-show it after the user corrected and
// re-broke the value — which is the thing the channel is most obviously for.
test('the violation latch clears on recovery, so re-entering a bad state fires again', async () => {
  const { bind } = await import('./bind')
  const { setValue } = await import('./dom')
  const { xin } = await import('./xin')

  const numeric = { value: { type: 'number' } } as const satisfies ComponentMap
  class RecoveringValue extends Component<typeof numeric> {
    static preferredTagName = 'recovering-value'
    static contract = numeric
    value: any = 0
    content = null
  }
  const creator = RecoveringValue.elementCreator()
  const el = creator() as any
  document.body.append(el)
  const reasons: string[] = []
  el.addEventListener('contractviolation', (e: any) =>
    reasons.push(e.detail.reason)
  )

  tosi({ recoverApp: { n: 1 } })
  await updates()
  bind(el, 'recoverApp.n', { toDOM: setValue })
  await updates()

  const originalError = console.error
  console.error = () => {}
  try {
    ;(xin as any).recoverApp.n = 'bad'
    await updates()
    expect(reasons.length).toBe(1) // entered a bad state
    ;(xin as any).recoverApp.n = 5
    await updates()
    expect(reasons.length).toBe(1) // recovery is not an event
    ;(xin as any).recoverApp.n = 'bad'
    await updates()
    expect(reasons.length).toBe(2) // re-entered — must speak again
  } finally {
    console.error = originalError
  }
  el.remove()
})

// Round-5 M4: the rc.3 latch fix recovered via a VALID value, which stepped
// around the sequence users actually perform — type bad, select-all-delete,
// type the same bad again. `''` is not valid against { type: 'number' }, and
// the pre-data return fired before any latch handling, so that was one event.
test('an empty field clears the violation latch, and so does null', async () => {
  const { bind } = await import('./bind')
  const { setValue } = await import('./dom')
  const { xin } = await import('./xin')

  const numeric = { value: { type: 'number' } } as const satisfies ComponentMap
  class EmptyRecover extends Component<typeof numeric> {
    static preferredTagName = 'empty-recover'
    static contract = numeric
    value: any = 0
    content = null
  }
  const el = EmptyRecover.elementCreator()() as any
  document.body.append(el)
  const reasons: string[] = []
  el.addEventListener('contractviolation', (e: any) =>
    reasons.push(e.detail.reason)
  )
  tosi({ emptyRecoverApp: { n: 1 } })
  await updates()
  bind(el, 'emptyRecoverApp.n', { toDOM: setValue })
  await updates()

  const originalError = console.error
  console.error = () => {}
  try {
    ;(xin as any).emptyRecoverApp.n = 'bad'
    await updates()
    expect(reasons.length).toBe(1)
    ;(xin as any).emptyRecoverApp.n = '' // select-all-delete
    await updates()
    ;(xin as any).emptyRecoverApp.n = 'bad' // retype the same mistake
    await updates()
    expect(reasons.length).toBe(2)
    ;(xin as any).emptyRecoverApp.n = null // a model reset
    await updates()
    ;(xin as any).emptyRecoverApp.n = 'bad'
    await updates()
    expect(reasons.length).toBe(3)
  } finally {
    console.error = originalError
  }
  el.remove()
})

describe('a surface refusal is INCONCLUSIVE, never a pass', () => {
  test('every refusal the surface can throw is recognised as one', async () => {
    /*
     * `refusedBySurface` used to substring-match the refusal's PROSE, coupling
     * a security gate to its own wording. 1.9.0 rewrote every message and the
     * coupling broke silently: all three substrings became unreachable, and
     * the refusal that DOES fire here — "is callable, not writable", thrown
     * when a write lands on a root CONTAINING a declared action — matched none
     * of them, so the catch took the `passed = true` branch. This exact
     * contract returned { passed: 2, failed: 0 }, byte-identical to a real run.
     *
     * The gate now asks `err.tosiRefusal`, which survives message edits.
     */
    const { enableAgentInterface } = await import('./agent')
    const { tosi } = await import('./xin-proxy')
    const { updates } = await import('./path-listener')
    tosi({ refApp: { qty: 5, checkout() {} } })
    await updates()
    const contract = {
      describe: () => ({
        refApp: {
          type: 'object',
          $counterexamples: [{ qty: 999 }, { qty: -1 }],
        },
      }),
    }
    const agent = enableAgentInterface({
      quiet: true,
      global: false,
      expose: {
        roots: ['refApp'],
        actions: ['refApp.checkout'],
        contract,
        write: true,
      },
    } as any)
    try {
      const report = exerciseContract(agent)
      // NOT a pass: nothing was validated
      expect(report.passed).toBe(0)
      expect(report.failed).toBe(2)
      for (const trial of report.trials) {
        expect(trial.passed).toBe(false)
        expect(trial.error).toContain('inconclusive')
      }
    } finally {
      agent.disable()
    }
  })

  test('the refusal tag is set at every site that refuses', async () => {
    const { enableAgentInterface, isAgentRefusal } = await import('./agent')
    const { tosi } = await import('./xin-proxy')
    const { updates } = await import('./path-listener')
    tosi({ tagApp: { n: 1, go() {} } })
    await updates()
    const grab = (fn: () => any) => {
      try {
        fn()
        return null
      } catch (e) {
        return e
      }
    }
    // closed: scope refusal on read, mutability refusal on write/call
    const closed = enableAgentInterface({ quiet: true, global: false })
    expect(isAgentRefusal(grab(() => closed.read('tagApp.n')))).toBe(true)
    expect(isAgentRefusal(grab(() => closed.write('tagApp.n', 2)))).toBe(true)
    expect(isAgentRefusal(grab(() => closed.call('tagApp.go')))).toBe(true)
    closed.disable()
    // manifest without write: the "reading only" refusal
    const ro = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['tagApp'] },
    })
    expect(isAgentRefusal(grab(() => ro.write('tagApp.n', 2)))).toBe(true)
    ro.disable()
    // manifest WITH write: the callable-not-writable refusal
    const rw = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['tagApp'], actions: ['tagApp.go'], write: true },
    })
    expect(isAgentRefusal(grab(() => rw.write('tagApp', {})))).toBe(true)
    // …and an ordinary in-scope write is NOT a refusal
    expect(grab(() => rw.write('tagApp.n', 7))).toBe(null)
    rw.disable()
  })
})
