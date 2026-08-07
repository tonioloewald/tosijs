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

describe('agent interface — when (await a condition)', () => {
  test('resolves immediately when the condition already holds', async () => {
    tosi({ agentWhenNow: { status: 'ready' } })
    const agent = (current = enableAgentInterface({ global: false }))
    // no touch will occur — only immediate satisfaction can resolve this
    const value = await agent.when('agentWhenNow.status', (s) => s === 'ready')
    expect(value).toBe('ready')
  })

  test('resolves when the condition becomes true; ignores non-satisfying changes', async () => {
    tosi({ agentWhen: { status: 'pending' } })
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))
    let settled = false
    const wait = agent
      .when('agentWhen.status', (s) => s === 'confirmed')
      .then((v) => {
        settled = true
        return v
      })

    agent.write('agentWhen.status', 'processing') // not the named condition
    await updates()
    expect(settled).toBe(false)

    agent.write('agentWhen.status', 'confirmed')
    expect(await wait).toBe('confirmed')
  })

  test('scope-checked, audit-logged, and invisible to the changes() drain', async () => {
    tosi({ agentWhenPub: { n: 0 }, agentWhenPriv: { x: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentWhenPub'] },
    }))
    expect(() => agent.when('agentWhenPriv.x', () => true)).toThrow(
      'not exposed'
    )

    const { cursor } = agent.changes()
    const wait = agent.when('agentWhenPub.n', (n) => n === 2)
    agent.write('agentWhenPub.n', 2)
    expect(await wait).toBe(2)
    // the wait is in the audit trail…
    const notes = agent.log().filter((e) => e.note != null)
    expect(notes.some((e) => e.note!.startsWith('when: armed'))).toBe(true)
    expect(notes.some((e) => e.note === 'when: resolved')).toBe(true)
    // …but the drain reports only real state changes
    const { changes } = agent.changes(cursor)
    expect(changes).toEqual([{ path: 'agentWhenPub.n', value: 2 }])
  })

  test('disable() rejects pending waits', async () => {
    tosi({ agentWhenBye: { done: false } })
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))
    const wait = agent.when('agentWhenBye.done', (d) => d === true)
    agent.disable()
    current = undefined
    await expect(wait).rejects.toThrow('agent interface disabled')
  })

  test('a throwing predicate rejects the wait — both immediately and later', async () => {
    tosi({ agentWhenThrow: { v: 0 } })
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))
    // throws on the immediate check → rejected promise, not a sync throw
    await expect(
      agent.when('agentWhenThrow.v', () => {
        throw new Error('bad predicate')
      })
    ).rejects.toThrow('bad predicate')
    // throws only once observation delivers the new value
    const wait = agent.when('agentWhenThrow.v', (v) => {
      if (v === 1) throw new Error('late bad predicate')
      return false
    })
    agent.write('agentWhenThrow.v', 1)
    await expect(wait).rejects.toThrow('late bad predicate')
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

  test('a declared action is callable, NOT writable — declaring it must not let an agent replace app code', () => {
    tosi({
      agentActWrite: {
        data: { x: 1 },
        checkout() {
          return 'ok'
        },
      },
    })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['agentActWrite.data'],
        actions: ['agentActWrite.checkout'],
      },
    }))
    expect(agent.call('agentActWrite.checkout')).toBe('ok')
    // the hole this pins shut: action-allowlisted paths passed the same
    // scope check as reads, so write() could overwrite the function itself
    expect(() =>
      agent.write('agentActWrite.checkout', 'not code anymore')
    ).toThrow('callable, not writable')
    expect(agent.call('agentActWrite.checkout')).toBe('ok') // still the app's code
    // and children of an action path are not a writable side door
    expect(() => agent.write('agentActWrite.checkout.evil', 1)).toThrow(
      'callable, not writable'
    )
    // root-declared paths still write normally
    agent.write('agentActWrite.data.x', 2)
    expect(agent.read('agentActWrite.data.x')).toBe(2)
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

    // flat records: semantically visible facts at the top level
    const inputRecord = description.wiring.find(
      (w) => w.id === 'agent-desc-input'
    )!
    expect(inputRecord).toBeDefined()
    // a placeholder is a HINT, not a name — its own field, never `label`
    expect(inputRecord.placeholder).toBe('search…')
    expect(inputRecord.label).toBeUndefined()
    // two-way arrow = user-writable affordance, provenance inline
    expect(inputRecord.value).toBe('⟷ agentDesc.filter') // '' value elided
    expect(inputRecord.on!.keydown).toBe('agentDesc.submit') // by-path handler is nameable

    const spanRecord = description.wiring.find(
      (w) => w.id === 'agent-desc-span'
    )!
    // one-way arrow = display-only, current value on the left
    expect(spanRecord.text).toBe('42 ⟵ agentDesc.total')

    // geometry rides in the map (happy-dom reports zeros; the shape is there)
    expect(inputRecord.bounds).toBeDefined()
    expect(typeof inputRecord.bounds!.width).toBe('number')

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

describe('post-hoc component contracts — lofting classes you do not control', () => {
  test('components option fills the gap; an own static contract always wins', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    // a "legacy" custom element with no static contract at all
    class LegacyThing extends HTMLElement {}
    if (customElements.get('legacy-thing') == null) {
      customElements.define('legacy-thing', LegacyThing)
    }
    tosi({ loftApp: { x: 1 } })
    const el = document.createElement('legacy-thing') as HTMLElement
    document.body.append(el)
    bind(el as any, 'loftApp.x', bindings.value)
    const span = elements.span()
    document.body.append(span)
    bind(span, 'loftApp.x', bindings.text)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      components: {
        'legacy-thing': {
          description: 'lofted from outside — the class never knew',
          value: { type: 'number' },
        },
      },
    }))
    const record = agent
      .describe()
      .wiring.find((w) => w.tag === 'legacy-thing')!
    expect(record.component).toBeDefined()
    expect(record.component!.description).toContain('lofted from outside')
    el.remove()
    span.remove()
  })
})

describe('describe({ scope }) — hierarchy scoping', () => {
  test('scope confines the wiring walk to one subtree, size be damned', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ scopeApp: { a: 1, b: 2 } })
    const hereBox = elements.div()
    const thereBox = elements.div()
    document.body.append(hereBox, thereBox)
    const here = elements.input()
    hereBox.append(here)
    bind(here, 'scopeApp.a', bindings.value)
    const there = elements.input()
    thereBox.append(there)
    bind(there, 'scopeApp.b', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))

    const scoped = agent.describe({ scope: hereBox })
    const paths = scoped.wiring.flatMap((w) =>
      Object.values(w).filter((v) => typeof v === 'string' && v.includes('scopeApp'))
    )
    expect(paths.some((p) => (p as string).includes('scopeApp.a'))).toBe(true)
    expect(paths.some((p) => (p as string).includes('scopeApp.b'))).toBe(false)
    // unscoped sees both
    const full = agent.describe()
    const fullPaths = JSON.stringify(full.wiring)
    expect(fullPaths).toContain('scopeApp.a')
    expect(fullPaths).toContain('scopeApp.b')
    hereBox.remove()
    thereBox.remove()
  })
})

describe('the structural tier', () => {
  test('headings and containers of wired elements appear, flagged structural', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ structApp: { q: '' } })
    const section = elements.section()
    const heading = elements.h2('Search Settings')
    const box = document.createElement('demo-box') // custom container
    const field = elements.input()
    box.append(field)
    section.append(heading, box)
    document.body.append(section)
    bind(field, 'structApp.q', bindings.value)
    // happy-dom reports zero-size for everything; structural records
    // correctly skip sizeless elements, so give these real geometry
    ;(heading as any).getBoundingClientRect = () =>
      ({ x: 10, y: 10, width: 300, height: 24 }) as DOMRect
    ;(box as any).getBoundingClientRect = () =>
      ({ x: 10, y: 40, width: 300, height: 60 }) as DOMRect
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))

    const d = agent.describe({ scope: section })
    const h = d.wiring.find((w) => w.tag === 'h2')
    expect(h?.structural).toBe(true)
    expect(h?.text).toBe('Search Settings')
    const container = d.wiring.find((w) => w.tag === 'demo-box')
    expect(container?.structural).toBe(true)
    // and structure: false yields affordances only
    const bare = agent.describe({ scope: section, structure: false })
    expect(bare.wiring.some((w) => w.structural)).toBe(false)
    section.remove()
  })
})

describe("describe({ view: 'viewport' }) — the camera", () => {
  test('only on-screen records, in screen coordinates', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ camApp: { a: 1, b: 2 } })
    const onScreen = elements.input()
    const offScreen = elements.input()
    document.body.append(onScreen, offScreen)
    bind(onScreen, 'camApp.a', bindings.value)
    bind(offScreen, 'camApp.b', bindings.value)
    ;(onScreen as any).getBoundingClientRect = () =>
      ({ x: 50, y: 100, width: 200, height: 30 }) as DOMRect
    ;(offScreen as any).getBoundingClientRect = () =>
      ({ x: 50, y: 5000, width: 200, height: 30 }) as DOMRect
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))

    const cam = agent.describe({ view: 'viewport' })
    const paths = JSON.stringify(cam.wiring)
    expect(paths).toContain('camApp.a')
    expect(paths).not.toContain('camApp.b') // the camera can't see it
    const rec = cam.wiring.find((w) => JSON.stringify(w).includes('camApp.a'))!
    expect(rec.bounds!.y).toBe(100) // screen coordinates, no scroll math

    // the atlas still sees both
    const atlas = agent.describe()
    expect(JSON.stringify(atlas.wiring)).toContain('camApp.b')
    onScreen.remove()
    offScreen.remove()
  })
})

describe('ARIA is a two-way street', () => {
  test('the harvest speaks screen reader: labelledby/describedby resolve, states surface, aria-hidden is hidden', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ ariaApp: { qty: 1, ghost: 0 } })
    const caption = elements.span({ id: 'qty-caption' }, 'Quantity')
    const hint = elements.span({ id: 'qty-hint' }, 'between 1 and 99')
    const field = elements.input({
      ariaLabelledby: 'qty-caption',
      ariaDescribedby: 'qty-hint',
      ariaRequired: 'true',
      ariaDisabled: 'true',
    })
    const invisible = elements.input({ ariaHidden: 'true' })
    document.body.append(caption, hint, field, invisible)
    bind(field, 'ariaApp.qty', bindings.value)
    bind(invisible, 'ariaApp.ghost', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))

    const d = agent.describe()
    const rec = d.wiring.find((w) =>
      JSON.stringify(w).includes('ariaApp.qty')
    )!
    expect(rec.label).toBe('Quantity') // resolved, not the raw id list
    expect(rec.description).toBe('between 1 and 99')
    expect(rec.required).toBe(true)
    expect(rec.disabled).toBe(true)
    // aria-hidden = hidden from assistive tech = hidden from the agent
    expect(JSON.stringify(d.wiring)).not.toContain('ariaApp.ghost')
    for (const el of [caption, hint, field, invisible]) el.remove()
  })

  test('curation materializes: contract.description becomes aria-label unless the author wrote one', async () => {
    const { Component } = await import('./component')
    class DescribedThing extends Component {
      static preferredTagName = 'described-thing'
      static contract = { description: 'a self-describing widget' }
    }
    const creator = DescribedThing.elementCreator()
    const el = creator() as DescribedThing
    document.body.append(el)
    await updates()
    expect(el.getAttribute('aria-label')).toBe('a self-describing widget')

    // explicit content always wins
    const el2 = creator() as DescribedThing
    el2.setAttribute('aria-label', 'the author knows best')
    document.body.append(el2)
    await updates()
    expect(el2.getAttribute('aria-label')).toBe('the author knows best')
    el.remove()
    el2.remove()
  })
})

describe('describe() — form-control state harvest', () => {
  test('type, live checked state, and live unbound values are map facts', async () => {
    tosi({ sinkApp: { on: true } })
    const { elements } = await import('./elements')
    const check = elements.input({ type: 'checkbox', bindValue: 'sinkApp.on' })
    const radio = elements.input({ type: 'radio', checked: true })
    on(radio, 'click', 'sinkApp.noop' as any) // wire it so it maps
    const loose = elements.input({ value: 'typed by hand' })
    on(loose, 'change', 'sinkApp.noop' as any)
    document.body.append(check, radio, loose)
    await updates()

    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      const checkRec = d.wiring.find((w) => w.type === 'checkbox')!
      expect(checkRec.checked).toBe(true) // live DOM truth
      const radioRec = d.wiring.find((w) => w.type === 'radio')
      expect(radioRec?.checked).toBe(true)
      const looseRec = d.wiring.find((w) => w.value === 'typed by hand')!
      // no arrow: current-but-unbound — honest provenance
      expect(looseRec).toBeDefined()
    } finally {
      agent.disable()
      check.remove()
      radio.remove()
      loose.remove()
    }
  })
})

describe('describe() — focus harvest', () => {
  test('the focused element is marked: where the user is, in the map', async () => {
    tosi({ focusApp: { q: '' } })
    const focused = elements.input({ id: 'focus-me' })
    const other = elements.input({ id: 'not-me' })
    document.body.append(focused, other)
    bind(focused, 'focusApp.q', bindings.value)
    bind(other, 'focusApp.q', bindings.value)
    focused.focus()
    await updates()

    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.id === 'focus-me')?.focused).toBe(true)
      expect(
        d.wiring.find((w) => w.id === 'not-me')?.focused
      ).toBeUndefined()
    } finally {
      agent.disable()
      focused.remove()
      other.remove()
    }
  })
})

describe('describe() — label association (the kitchen-sink lesson)', () => {
  test('a wrapping <label> or label[for] names the control, like a screen reader', async () => {
    tosi({ labelApp: { qty: 3 } })
    const { label } = elements
    const wrapped = elements.input({ type: 'number' })
    const wrapper = label(wrapped, ' qty')
    const pointed = elements.input({ id: 'label-target' })
    const pointer = label({ htmlFor: 'label-target' }, 'volume')
    document.body.append(wrapper, pointed, pointer)
    bind(wrapped, 'labelApp.qty', bindings.value)
    bind(pointed, 'labelApp.qty', bindings.value)
    await updates()

    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.label === 'qty')).toBeDefined()
      expect(d.wiring.find((w) => w.label === 'volume')).toBeDefined()
    } finally {
      agent.disable()
      wrapper.remove()
      pointed.remove()
      pointer.remove()
    }
  })
})

describe('describe() — proxy handlers are nameable', () => {
  test('onEvent: proxy names by its path, exactly like the string form', async () => {
    const { proxyHandler } = tosi({
      proxyHandler: {
        n: 0,
        bump() {
          ;(proxyHandler as any).n = (proxyHandler as any).n.value + 1
        },
      },
    })
    await updates()
    const viaString = elements.button('s', { id: 'via-string' })
    const viaProxy = elements.button('p', { id: 'via-proxy' })
    on(viaString, 'click', 'proxyHandler.bump' as any)
    on(viaProxy, 'click', (proxyHandler as any).bump)
    document.body.append(viaString, viaProxy)

    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      const s = d.wiring.find((w) => w.id === 'via-string')!
      const p = d.wiring.find((w) => w.id === 'via-proxy')!
      expect(s.on!.click).toBe('proxyHandler.bump')
      expect(p.on!.click).toBe('proxyHandler.bump') // not 'ƒ'
      // …because on() NORMALIZED the proxy to its path at registration —
      // the stored metadata is identical for both forms
      const { getElementBindings } = await import('./metadata')
      const stored = [
        ...(getElementBindings(viaProxy).eventBindings!.click as Set<any>),
      ]
      expect(stored).toEqual(['proxyHandler.bump'])
      // and the proxy handler DISPATCHES live, like the string
      viaProxy.click()
      await updates()
      expect(agent.read('proxyHandler.n')).toBe(1)
    } finally {
      agent.disable()
      viaString.remove()
      viaProxy.remove()
    }
  })

  test('a NAMED raw function leaves a breadcrumb; prop-key artifacts stay ƒ', async () => {
    const named = elements.button('n', { id: 'raw-named' })
    const artifact = elements.button('a', { id: 'raw-artifact' })
    function retallyEverything() {}
    on(named, 'click', retallyEverything as any)
    // method-shorthand names (onClick, handleClick) are prop-key noise
    on(artifact, 'click', { handleClick() {} }.handleClick as any)
    document.body.append(named, artifact)
    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      expect(
        d.wiring.find((w) => w.id === 'raw-named')!.on!.click
      ).toBe('ƒ retallyEverything')
      expect(
        d.wiring.find((w) => w.id === 'raw-artifact')!.on!.click
      ).toBe('ƒ')
    } finally {
      agent.disable()
      named.remove()
      artifact.remove()
    }
  })
})

describe('describe() — validity harvest (the haltija exchange)', () => {
  test('live ValidityState and aria-invalid become map facts', async () => {
    tosi({ validApp: { email: '', other: 'ok' } })
    const missing = elements.input({ id: 'v-missing', required: true })
    const mismatch = elements.input({
      id: 'v-mismatch',
      type: 'email',
      value: 'not-an-email',
    })
    const fine = elements.input({ id: 'v-fine', value: 'ok' })
    const ariaBad = elements.input({ id: 'v-aria' })
    ariaBad.setAttribute('aria-invalid', 'true')
    document.body.append(missing, mismatch, fine, ariaBad)
    // NB: value-binding the mismatch input would OVERWRITE its bad value
    // with state — wire it (and aria) via handlers, bind the other two
    bind(missing, 'validApp.email', bindings.value)
    bind(fine, 'validApp.other', bindings.value)
    on(mismatch, 'change', 'validApp.noop' as any)
    on(ariaBad, 'change', 'validApp.noop' as any)
    await updates()
    const agent = enableAgentInterface({ global: false })
    try {
      const d = agent.describe()
      const rec = (id: string) => d.wiring.find((w) => w.id === id)!
      expect(rec('v-missing').invalid).toBe(true) // required + empty
      expect(rec('v-missing').required).toBe(true)
      expect(rec('v-mismatch').invalid).toBe(true) // typeMismatch
      expect(rec('v-fine').invalid).toBeUndefined()
      expect(rec('v-aria').invalid).toBe(true) // author's own claim
    } finally {
      agent.disable()
      for (const el of [missing, mismatch, fine, ariaBad]) el.remove()
    }
  })
})
