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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.call('agentAct.add', 'hello')
    await updates()
    expect(agent.read('agentAct.list')).toEqual(['hello'])
  })

  test('call on a non-function throws', () => {
    tosi({ agentNotFn: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(() => agent.call('agentNotFn.x')).toThrow('not an action')
  })
})

describe('agent interface — when (await a condition)', () => {
  test('resolves immediately when the condition already holds', async () => {
    tosi({ agentWhenNow: { status: 'ready' } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // no touch will occur — only immediate satisfaction can resolve this
    const value = await agent.when('agentWhenNow.status', (s) => s === 'ready')
    expect(value).toBe('ready')
  })

  test('resolves when the condition becomes true; ignores non-satisfying changes', async () => {
    tosi({ agentWhen: { status: 'pending' } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const wait = agent.when('agentWhenBye.done', (d) => d === true)
    agent.disable()
    current = undefined
    await expect(wait).rejects.toThrow('agent interface disabled')
  })

  test('a throwing predicate rejects the wait — both immediately and later', async () => {
    tosi({ agentWhenThrow: { v: 0 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
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
    expect(changes.filter((c) => c.path === 'agentDrain.a').length).toBe(1)

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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const scoped = agent.describe({ scope: hereBox })
    const paths = scoped.wiring.flatMap((w) =>
      Object.values(w).filter(
        (v) => typeof v === 'string' && v.includes('scopeApp')
      )
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
      ({ x: 10, y: 10, width: 300, height: 24 } as DOMRect)
    ;(box as any).getBoundingClientRect = () =>
      ({ x: 10, y: 40, width: 300, height: 60 } as DOMRect)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

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
      ({ x: 50, y: 100, width: 200, height: 30 } as DOMRect)
    ;(offScreen as any).getBoundingClientRect = () =>
      ({ x: 50, y: 5000, width: 200, height: 30 } as DOMRect)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

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
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const d = agent.describe()
    const rec = d.wiring.find((w) => JSON.stringify(w).includes('ariaApp.qty'))!
    expect(rec.label).toBe('Quantity') // resolved, not the raw id list
    expect(rec.description).toBe('between 1 and 99')
    expect(rec.required).toBe(true)
    expect(rec.disabled).toBe(true)
    // aria-hidden = hidden from assistive tech = hidden from the agent
    expect(JSON.stringify(d.wiring)).not.toContain('ariaApp.ghost')
    for (const el of [caption, hint, field, invisible]) el.remove()
  })

  test('curation materializes into the MATCHING slot: description, role — never the name', async () => {
    const { Component } = await import('./component')
    const described = {
      description: 'counts things, between 1 and 99',
      role: 'spinbutton',
    } as const
    class DescribedThing extends (Component as any) {
      static preferredTagName = 'described-thing'
      static contract = described
      content = ({ span }: any) => span('42')
    }
    const el = DescribedThing.elementCreator()() as any
    document.body.append(el)
    await updates()

    // a description projects to the DESCRIPTION slot…
    expect(el.getAttribute('aria-description')).toBe(
      'counts things, between 1 and 99'
    )
    // …never to the name slot: the visible content still names it, and our
    // own audit's anonymous-affordance rule stays honest
    expect(el.hasAttribute('aria-label')).toBe(false)
    // a declared role materializes — the audit's missing-role fix, declared
    expect(el.getAttribute('role')).toBe('spinbutton')

    // and the harvest reads it back
    const agent = enableAgentInterface({ global: false })
    try {
      const record = agent
        .describe()
        .wiring.find((w) => w.tag === 'described-thing')
      expect(record?.description).toBe('counts things, between 1 and 99')
      expect(record?.role).toBe('spinbutton')
    } finally {
      agent.disable()
    }
    el.remove()
  })

  test('an author-set description or role always wins', async () => {
    const { Component } = await import('./component')
    const declared = {
      description: 'the library says this',
      role: 'button',
    } as const
    class AuthorWins extends (Component as any) {
      static preferredTagName = 'author-wins'
      static contract = declared
      content = null
    }
    const creator = AuthorWins.elementCreator()
    const el = creator() as any
    el.setAttribute('aria-description', 'the author says this')
    el.setAttribute('role', 'link')
    document.body.append(el)
    await updates()
    expect(el.getAttribute('aria-description')).toBe('the author says this')
    expect(el.getAttribute('role')).toBe('link')
    el.remove()
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

    const agent = enableAgentInterface({ global: false, expose: 'all' })
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

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.id === 'focus-me')?.focused).toBe(true)
      expect(d.wiring.find((w) => w.id === 'not-me')?.focused).toBeUndefined()
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

    const agent = enableAgentInterface({ global: false, expose: 'all' })
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

    const agent = enableAgentInterface({ global: false, expose: 'all' })
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
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.id === 'raw-named')!.on!.click).toBe(
        'ƒ retallyEverything'
      )
      expect(d.wiring.find((w) => w.id === 'raw-artifact')!.on!.click).toBe('ƒ')
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
    const agent = enableAgentInterface({ global: false, expose: 'all' })
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

describe('describe() — contenteditable surfaces as an input field', () => {
  test('existence leads: mapped even unbound, live text as value, aria-placeholder as hint', async () => {
    const region = elements.div({ id: 'ce-region' })
    region.setAttribute('contenteditable', '')
    region.setAttribute('aria-placeholder', 'jot something…')
    region.textContent = 'draft text'
    const empty = elements.div({ id: 'ce-empty' })
    empty.setAttribute('contenteditable', 'true')
    empty.setAttribute('aria-placeholder', 'jot something…')
    document.body.append(region, empty)
    await updates()
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const rec = d.wiring.find((w) => w.id === 'ce-region')!
      // no bindings, no handlers — surfaced anyway: the region EXISTS
      expect(rec).toBeDefined()
      expect(rec.contentEditable).toBe(true)
      expect(rec.value).toBe('draft text') // live text, no provenance arrow
      const hint = d.wiring.find((w) => w.id === 'ce-empty')!
      expect(hint.placeholder).toBe('jot something…')
      expect(hint.value).toBeUndefined()
    } finally {
      agent.disable()
      region.remove()
      empty.remove()
    }
  })
})

describe('describe() — links are affordances (the href field)', () => {
  test('a bare <a href> is on the map; destination is distinct from text', async () => {
    const named = elements.a({ href: '/pricing' }, 'Pricing')
    const nameless = elements.a({ href: 'https://example.com/deep/path' })
    document.body.append(named, nameless)
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const link = d.wiring.find((w) => w.href === '/pricing')!
      expect(link).toBeDefined() // no bindings, no handlers — mapped anyway
      expect(link.tag).toBe('a')
      expect(link.text).toBe('Pricing') // "says X" …
      expect(link.href).toBe('/pricing') // … "goes to Y" — both facts
      expect(
        d.wiring.some((w) => w.href === 'https://example.com/deep/path')
      ).toBe(true)
    } finally {
      agent.disable()
      named.remove()
      nameless.remove()
    }
  })
})

describe('surface identity — ask, do not assume (tosijs#23)', () => {
  test('agent.version and describe().version carry shape, library, capabilities', async () => {
    const { AGENT_SURFACE_VERSION, AGENT_CAPABILITIES } = await import(
      './agent'
    )
    const { version: libVersion } = await import('./version')
    tosi({ verApp: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    expect(agent.version.surface).toBe(AGENT_SURFACE_VERSION)
    expect(agent.version.tosijs).toBe(libVersion)
    expect(agent.version.capabilities).toEqual([...AGENT_CAPABILITIES])
    // the identity travels WITH the map — a serialized description is
    // self-describing wherever it lands
    const d = agent.describe()
    expect(d.version).toEqual(agent.version)
    expect(JSON.parse(JSON.stringify(d)).version.surface).toBe(
      AGENT_SURFACE_VERSION
    )
    // capabilities are membership-tested, not semver-inferred
    for (const capability of ['describe', 'bounds', 'aria', 'validity']) {
      expect(agent.version.capabilities.includes(capability)).toBe(true)
    }
  })

  test('the shape contract and the capability list are honest about THIS build', async () => {
    tosi({ verHonest: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe({ styles: true, view: 'viewport' })
    // every claimed describe-shaping capability is one this build supports
    expect(agent.version.capabilities.includes('viewport')).toBe(true)
    expect(agent.version.capabilities.includes('styles')).toBe(true)
    expect(Array.isArray(d.wiring)).toBe(true) // the shape haltija reads
    expect(typeof d.exposure).toBe('string')
  })
})

describe('the posture: safe by default, full access behind one line', () => {
  test('default = READ-ONLY introspection: the map works, the verbs refuse', async () => {
    tosi({ postureApp: { n: 1, go() {} } })
    await updates()
    const agent = (current = enableAgentInterface({ global: false }))

    // looking is the point, and it works over everything
    expect(agent.read('postureApp.n')).toBe(1)
    expect(agent.describe().exposure).toBe('read-only')
    expect(Object.keys(agent.describe().roots)).toContain('postureApp')
    const seen: string[] = []
    const off = agent.observe('postureApp.n', (p) => seen.push(p))
    expect(typeof off).toBe('function')
    off()

    // the verbs that change the world need consent — and say how to give it
    expect(() => agent.write('postureApp.n', 2)).toThrow(/read-only/)
    expect(() => agent.write('postureApp.n', 2)).toThrow(/expose/)
    expect(() => agent.call('postureApp.go')).toThrow(/read-only/)
    expect(agent.read('postureApp.n')).toBe(1) // nothing happened
  })

  test("expose: 'all' is the deliberate override — everything, with a warning", async () => {
    tosi({ postureAll: { n: 1, go() {} } })
    await updates()
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    const { _resetPostureNotices } = await import('./agent')
    _resetPostureNotices() // the latch is once-per-process; spend it here
    let agent: ReturnType<typeof enableAgentInterface>
    try {
      agent = current = enableAgentInterface({ global: false, expose: 'all' })
    } finally {
      console.warn = original
    }
    agent!.write('postureAll.n', 7)
    expect(agent!.read('postureAll.n')).toBe(7)
    expect(agent!.describe().exposure).toBe('introspection')
    // asserted UNCONDITIONALLY — the old form was `… || warnings.length === 0`,
    // which passes even if the warning is deleted outright
    expect(warnings.some((w) => w.includes('WRITABLE'))).toBe(true)
    expect(warnings.some((w) => w.includes('any script on this page'))).toBe(
      true
    )
  })

  test('the read-only notice fires, names the escape hatches, and respects quiet', async () => {
    const { _resetPostureNotices } = await import('./agent')
    const { settings } = await import('./settings')
    tosi({ noticeApp: { n: 1 } })
    await updates()

    _resetPostureNotices()
    const infos: string[] = []
    const original = console.info
    console.info = (...args: any[]) => infos.push(args.map(String).join(' '))
    try {
      ;(current = enableAgentInterface({ global: false })).disable()
    } finally {
      console.info = original
    }
    expect(infos.some((i) => i.includes('read-only'))).toBe(true)
    expect(infos.some((i) => i.includes('expose'))).toBe(true)

    // …and settings.quiet actually silences it
    _resetPostureNotices()
    const quiet: string[] = []
    console.info = (...args: any[]) => quiet.push(args.map(String).join(' '))
    settings.quiet = true
    try {
      ;(current = enableAgentInterface({ global: false })).disable()
    } finally {
      console.info = original
      settings.quiet = false
      current = undefined
    }
    expect(quiet).toEqual([])
  })

  test('manifest mode is unchanged and remains the production shape', async () => {
    tosi({ postureManifest: { open: 1, secret: 'shh', go() {} } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['postureManifest.open'],
        actions: ['postureManifest.go'],
      },
    }))
    expect(agent.describe().exposure).toBe('manifest')
    agent.write('postureManifest.open', 2) // allowed
    expect(agent.read('postureManifest.open')).toBe(2)
    expect(() => agent.read('postureManifest.secret')).toThrow(/not exposed/)
    expect(() => agent.write('postureManifest.secret', 'x')).toThrow(
      /not exposed/
    )
  })
})

describe('the audit ledger is bounded (review M8)', () => {
  test('a long-lived surface does not grow without bound, and says when it dropped', async () => {
    tosi({ ledgerApp: { n: 0 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
      maxLog: 50,
    }))
    const { cursor } = agent.changes()
    for (let i = 1; i <= 200; i++) {
      agent.write('ledgerApp.n', i)
      await updates()
    }
    // bounded…
    expect(agent.log().length).toBeLessThanOrEqual(50)
    // …and honest: a drain from before the trim admits it saw a window
    const drained = agent.changes(cursor)
    expect(drained.truncated).toBe(true)
    // seq stays monotonic, so cursors keep working
    expect(drained.cursor).toBeGreaterThanOrEqual(200)
    // a drain from a live cursor is complete and says nothing
    expect(agent.changes(drained.cursor).truncated).toBeUndefined()
  })
})

describe('list bindings on the agent surface (review M17)', () => {
  test('every rendered row is a record with its OWN resolved paths', async () => {
    const { listRows } = tosi({
      listRows: {
        items: [
          { id: 1, label: 'alpha', done: false },
          { id: 2, label: 'beta', done: true },
        ],
      },
    })
    await updates()
    const { ul } = elements
    const list = ul(
      ...(listRows.items as any).listBinding(
        ({ li, input: check, span }: any, item: any) =>
          li(
            check({ type: 'checkbox', bindValue: item.done }),
            span({ textContent: item.label })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const wiring = agent.describe().wiring
      // one checkbox record per row, each bound to ITS OWN id-path
      const checks = wiring.filter((w) => w.type === 'checkbox')
      expect(checks.length).toBe(2)
      const paths = checks.map((w) => String(w.value))
      expect(paths.some((p) => p.includes('listRows.items[id=1].done'))).toBe(
        true
      )
      expect(paths.some((p) => p.includes('listRows.items[id=2].done'))).toBe(
        true
      )
      // live state per row, not the template's
      expect(
        checks.find((w) => String(w.value).includes('id=2'))?.checked
      ).toBe(true)
      // and an agent write reaches the right row
      agent.write('listRows.items[id=1].done', true)
      await updates()
      const after = agent
        .describe()
        .wiring.filter((w) => w.type === 'checkbox')
        .find((w) => String(w.value).includes('id=1'))
      expect(after?.checked).toBe(true)
    } finally {
      agent.disable()
      list.remove()
    }
  })

  test('a per-row inline contract survives cloning and is ENFORCED per row', async () => {
    const { rowContracts } = tosi({
      rowContracts: {
        items: [
          { id: 1, qty: 1 },
          { id: 2, qty: 2 },
        ],
      },
    })
    await updates()
    const { ul } = elements
    const list = ul(
      ...(rowContracts.items as any).listBinding(
        ({ li, input }: any, item: any) =>
          li(
            input({
              type: 'number',
              bindValue: item.qty,
              contract: { type: 'integer' },
            })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      // the template's contract reached EVERY cloned row (cloneWithBindings)
      const contract = agent.describe().contract ?? {}
      const keys = Object.keys(contract).filter((k) =>
        k.includes('rowContracts')
      )
      expect(keys.length).toBe(2)
      // …and it is enforced per row, not just declared
      expect(() =>
        agent.write('rowContracts.items[id=1].qty', 'not a number')
      ).toThrow(/contract/)
      agent.write('rowContracts.items[id=1].qty', 7)
      expect(agent.read('rowContracts.items[id=1].qty')).toBe(7)
    } finally {
      agent.disable()
      list.remove()
    }
  })
})

describe('review round 2: the surface must not leak or lie', () => {
  test('B2: manifest mode scopes HANDLERS, not just data bindings', async () => {
    tosi({
      scopePub: { n: 1 },
      scopePriv: { wipe() {}, token: 'sekrit' },
    })
    await updates()
    const publicBtn = elements.button('ok', { id: 'scope-public' })
    const privateBtn = elements.button('wipe', { id: 'scope-private' })
    on(publicBtn, 'click', 'scopePub.noop' as any)
    on(privateBtn, 'click', 'scopePriv.wipe' as any)
    document.body.append(publicBtn, privateBtn)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['scopePub'], actions: ['scopePub.noop'] },
    }))
    const wiring = agent.describe().wiring
    const serialized = JSON.stringify(wiring)
    // the private action PATH must not appear anywhere in the map
    expect(serialized.includes('scopePriv.wipe')).toBe(false)
    // and the out-of-scope element contributes no harvested content
    expect(wiring.find((w) => w.id === 'scope-private')).toBeUndefined()
    // the allowlisted one is fully described
    expect(wiring.find((w) => w.id === 'scope-public')?.on?.click).toBe(
      'scopePub.noop'
    )
  })

  test('B3: a password value is NEVER emitted — the affordance still is', async () => {
    tosi({ secretApp: { password: 'hunter2', note: 'fine' } })
    await updates()
    const secret = elements.input({ type: 'password', id: 'pw' })
    const otp = elements.input({ id: 'otp', autocomplete: 'one-time-code' })
    const plain = elements.input({ id: 'plain' })
    document.body.append(secret, otp, plain)
    bind(secret, 'secretApp.password', bindings.value)
    bind(otp, 'secretApp.password', bindings.value)
    bind(plain, 'secretApp.note', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe()
    expect(JSON.stringify(d).includes('hunter2')).toBe(false)
    const pw = d.wiring.find((w) => w.id === 'pw')!
    expect(pw.secret).toBe(true)
    // the PATH still travels — an agent can see what it's bound to
    expect(String(pw.value)).toContain('secretApp.password')
    expect(d.wiring.find((w) => w.id === 'otp')?.secret).toBe(true)
    // a normal field is unaffected
    expect(String(d.wiring.find((w) => w.id === 'plain')?.value)).toContain(
      'fine'
    )
    for (const el of [secret, otp, plain]) el.remove()
  })

  test('B4: disable() and un-subscribe are idempotent and complete', async () => {
    tosi({ teardownApp: { n: 1 } })
    await updates()
    const agent = enableAgentInterface({ expose: 'all' })
    expect((globalThis as any).tosiAgent).toBe(agent)
    const off = agent.observe('teardownApp.n', () => {})
    off()
    expect(() => off()).not.toThrow() // second unsubscribe is a no-op

    agent.disable()
    expect(() => agent.disable()).not.toThrow() // second disable is a no-op
    expect((globalThis as any).tosiAgent).toBeUndefined()

    // a STALE surface must not delete the CURRENT surface's global
    const fresh = (current = enableAgentInterface({ expose: 'all' }))
    agent.disable()
    expect((globalThis as any).tosiAgent).toBe(fresh)
    fresh.disable()
    current = undefined
  })
})
