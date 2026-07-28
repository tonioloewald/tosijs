import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface } from './agent'
import { tosi } from './xin-proxy'
import { xin } from './xin'
import { updates } from './path-listener'
import { elements } from './elements'
import { bind, on } from './bind'
import { bindings } from './bindings'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
})

describe('agent interface — read/write/observe', () => {
  test('read returns serializable state; write flows through observers to the DOM', async () => {
    tosi({ agentRW: { name: 'Ada', tags: ['x'] } })
    const agent = (current = enableAgentInterface({ global: false }))

    expect(agent.read('agentRW.name')).toBe('Ada')
    expect(agent.read('agentRW')).toEqual({ name: 'Ada', tags: ['x'] })

    // a human-facing bound element updates from an agent write
    const input = elements.input()
    document.body.append(input)
    bind(input, 'agentRW.name', bindings.value)
    await updates()
    expect(input.value).toBe('Ada')

    agent.write('agentRW.name', 'Grace')
    await updates()
    expect(input.value).toBe('Grace')
    expect(agent.read('agentRW.name')).toBe('Grace')
    input.remove()
  })

  test('observe pushes on change; unsubscribe stops it', async () => {
    tosi({ agentObs: { count: 0 } })
    await updates() // drain the registration touch — agents act on settled apps
    const agent = (current = enableAgentInterface({ global: false }))
    const seen: string[] = []
    const off = agent.observe('agentObs.count', (path) => seen.push(path))

    agent.write('agentObs.count', 1)
    await updates()
    expect(seen).toEqual(['agentObs.count'])

    off()
    agent.write('agentObs.count', 2)
    await updates()
    expect(seen).toEqual(['agentObs.count']) // no further pushes
  })

  test('subscribe-before-data: observing a path that does not exist yet works', async () => {
    const agent = (current = enableAgentInterface({ global: false }))
    const seen: string[] = []
    agent.observe('agentLate.order.confirmation', (path) => seen.push(path))

    tosi({ agentLate: { order: { confirmation: 'ok!' } } })
    await updates()
    expect(seen.length).toBeGreaterThan(0)
    expect(agent.read('agentLate.order.confirmation')).toBe('ok!')
  })
})

describe('agent interface — actions', () => {
  test('call invokes a function in state by path', async () => {
    const store = {
      agentAct: {
        list: [] as string[],
        add(item: string) {
          ;(xin as any).agentAct.list.push(item)
        },
      },
    }
    tosi(store)
    const agent = (current = enableAgentInterface({ global: false }))
    agent.call('agentAct.add', 'hello')
    await updates()
    expect(agent.read('agentAct.list')).toEqual(['hello'])
  })

  test('call on a non-function throws', () => {
    tosi({ agentNotFn: { x: 1 } })
    const agent = (current = enableAgentInterface({ global: false }))
    expect(() => agent.call('agentNotFn.x')).toThrow('not an action')
  })
})

describe('agent interface — changes (turn-based drain)', () => {
  test('coalesces to final-value-per-path since cursor; cursor advances', async () => {
    tosi({ agentDrain: { a: 0, b: 0 } })
    await updates() // drain the registration touch — agents act on settled apps
    const agent = (current = enableAgentInterface({ global: false }))
    const { cursor: start } = agent.changes()

    agent.write('agentDrain.a', 1)
    agent.write('agentDrain.a', 2)
    agent.write('agentDrain.b', 10)
    await updates()

    const { cursor, changes } = agent.changes(start)
    expect(cursor).toBeGreaterThan(start)
    const byPath = Object.fromEntries(changes.map((c) => [c.path, c.value]))
    // one entry per path, final value — not three entries
    expect(byPath['agentDrain.a']).toBe(2)
    expect(byPath['agentDrain.b']).toBe(10)
    expect(
      changes.filter((c) => c.path === 'agentDrain.a').length
    ).toBe(1)

    // draining from the new cursor is empty until something changes
    expect(agent.changes(cursor).changes).toEqual([])
  })
})

describe('agent interface — manifest mode (scoping)', () => {
  test('reads/writes/observes outside exposed roots throw; inside work', () => {
    tosi({ agentPub: { greeting: 'hi' }, agentSecret: { token: 'xyz' } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentPub'] },
    }))

    expect(agent.read('agentPub.greeting')).toBe('hi')
    agent.write('agentPub.greeting', 'yo')
    expect(agent.read('agentPub.greeting')).toBe('yo')

    expect(() => agent.read('agentSecret.token')).toThrow('not exposed')
    expect(() => agent.write('agentSecret.token', 'stolen')).toThrow(
      'not exposed'
    )
    expect(() => agent.observe('agentSecret.token', () => {})).toThrow(
      'not exposed'
    )
    // prefix must be segment-exact: agentPublic !== agentPub
    expect(() => agent.read('agentPublicity')).toThrow('not exposed')
  })

  test('undeclared actions cannot be called; declared ones can', () => {
    tosi({
      agentActs: {
        allowed() {
          return 'ran'
        },
        forbidden() {
          return 'no'
        },
      },
    })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: [], actions: ['agentActs.allowed'] },
    }))
    expect(agent.call('agentActs.allowed')).toBe('ran')
    expect(() => agent.call('agentActs.forbidden')).toThrow('not exposed')
  })

  test('the ledger only records in-scope paths', async () => {
    tosi({ agentLedgerPub: { a: 0 }, agentLedgerPriv: { b: 0 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentLedgerPub'] },
    }))
    ;(xin as any).agentLedgerPub.a = 1
    ;(xin as any).agentLedgerPriv.b = 1 // outside scope — direct app write
    await updates()
    const paths = agent.log().map((e) => e.path)
    expect(paths.some((p) => p.startsWith('agentLedgerPub'))).toBe(true)
    expect(paths.some((p) => p.startsWith('agentLedgerPriv'))).toBe(false)
  })
})

describe('agent interface — describe()', () => {
  test('wiring reports the affordance join: label × path × writability × handlers', async () => {
    tosi({
      agentDesc: {
        filter: '',
        total: 42,
        submit() {},
      },
    })
    const agent = (current = enableAgentInterface({ global: false }))

    // an input: two-way bound (writable), semantically labeled, event-wired by path
    const input = elements.input({
      id: 'agent-desc-input',
      placeholder: 'search…',
    })
    document.body.append(input)
    bind(input, 'agentDesc.filter', bindings.value)
    on(input, 'keydown', 'agentDesc.submit' as any)
    // a display: one-way bound (read-only)
    const span = elements.span({ id: 'agent-desc-span' })
    document.body.append(span)
    bind(span, 'agentDesc.total', bindings.text)
    await updates()

    const description = agent.describe()
    expect(description.exposure).toBe('introspection')
    expect(description.roots.agentDesc).toBe('object')
    expect(description.actions).toContain('agentDesc.submit')

    const inputRecord = description.wiring.find(
      (w) => w.element.id === 'agent-desc-input'
    )!
    expect(inputRecord).toBeDefined()
    expect(inputRecord.element.label).toBe('search…') // harvested placeholder
    const filterBinding = inputRecord.bindings!.find(
      (b) => b.path === 'agentDesc.filter'
    )!
    expect(filterBinding.writable).toBe(true) // bindings.value has fromDOM
    expect(inputRecord.handlers!.keydown).toContain('agentDesc.submit') // by-path handler is nameable

    const spanRecord = description.wiring.find(
      (w) => w.element.id === 'agent-desc-span'
    )!
    const totalBinding = spanRecord.bindings!.find(
      (b) => b.path === 'agentDesc.total'
    )!
    expect(totalBinding.readable).toBe(true)
    expect(totalBinding.writable).toBe(false) // bindText is display-only

    input.remove()
    span.remove()
  })

  test('manifest mode limits described roots and actions to the declaration', () => {
    tosi({ agentDescPub: { x: 1 }, agentDescPriv: { y: 2 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentDescPub'], actions: [] },
    }))
    const description = agent.describe()
    expect(description.exposure).toBe('manifest')
    expect(Object.keys(description.roots)).toEqual(['agentDescPub'])
  })
})

describe('agent interface — lifecycle', () => {
  test('global installs and disable removes it', () => {
    tosi({ agentGlobal: { ok: true } })
    const agent = (current = enableAgentInterface())
    expect((globalThis as any).tosiAgent).toBe(agent)
    agent.disable()
    current = undefined
    expect((globalThis as any).tosiAgent).toBeUndefined()
  })
})
