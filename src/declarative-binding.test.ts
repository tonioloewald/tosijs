import { test, expect, describe, afterEach, spyOn } from 'bun:test'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'
import { enableDeclarativeBinding } from './declarative-binding'
import type { DeclarativeBinding } from './declarative-binding'

let current: DeclarativeBinding | undefined
afterEach(() => {
  current?.disable()
  current = undefined
  document.body.textContent = ''
})

const mount = (html: string): HTMLElement => {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
}

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('enableDeclarativeBinding', () => {
  test('text, attribute and property bindings follow state', async () => {
    const { dbA } = tosi({ dbA: { name: 'Ada', label: 'hi', rows: 3 } })
    await updates()
    const host = mount(
      '<span data-tosi-text="dbA.name"></span>' +
        '<b data-tosi-attr-aria-label="dbA.label"></b>' +
        '<i data-tosi-prop-title="dbA.name"></i>'
    )
    current = enableDeclarativeBinding({ read: ['dbA'], root: host })
    await updates()
    const [span, b, i] = Array.from(host.children) as HTMLElement[]
    expect(span.textContent).toBe('Ada')
    expect(b.getAttribute('aria-label')).toBe('hi')
    expect(i.title).toBe('Ada')
    dbA.name.value = 'Grace'
    dbA.label.value = null as any
    await updates()
    expect(span.textContent).toBe('Grace')
    expect(b.hasAttribute('aria-label')).toBe(false)
    expect(i.title).toBe('Grace')
    // bound attributes are removed: an element hydrates once
    expect(span.hasAttribute('data-tosi-text')).toBe(false)
  })

  test('two-way value writes back only under a write grant', async () => {
    const { dbB } = tosi({ dbB: { form: { name: 'Ada' }, other: 'x' } })
    await updates()
    const host = mount(
      '<input class="ok" data-tosi-bind-value="dbB.form.name">' +
        '<input class="no" data-tosi-bind-value="dbB.other">'
    )
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    current = enableDeclarativeBinding({
      read: [dbB],
      write: [dbB.form],
      root: host,
    })
    await updates()
    const ok = host.querySelector('.ok') as HTMLInputElement
    expect(ok.value).toBe('Ada')
    ok.value = 'Grace'
    ok.dispatchEvent(new Event('input', { bubbles: true }))
    await updates()
    expect(dbB.form.name.value).toBe('Grace')
    const no = host.querySelector('.no') as HTMLInputElement
    expect(no.getAttribute('data-tosi-bind-value')).toBe('dbB.other')
    expect(warn.mock.calls.some(([m]) => /not granted to write/.test(m))).toBe(
      true
    )
    warn.mockRestore()
  })

  test('an event calls the action at the path, resolved per event', async () => {
    let calls = 0
    const { dbC } = tosi({ dbC: { go: () => calls++ } })
    await updates()
    const host = mount('<button data-tosi-on-click="dbC.go">go</button>')
    current = enableDeclarativeBinding({ actions: [dbC.go], root: host })
    const button = host.querySelector('button')!
    button.click()
    expect(calls).toBe(1)
    // replacing the function in state takes effect
    dbC.go = (() => (calls += 10)) as any
    button.click()
    expect(calls).toBe(11)
  })

  test('closed by default: with no grants nothing binds', async () => {
    tosi({ dbD: { name: 'Ada', go() {} } })
    await updates()
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const host = mount(
      '<span data-tosi-text="dbD.name"></span>' +
        '<button data-tosi-on-click="dbD.go"></button>'
    )
    current = enableDeclarativeBinding({ root: host })
    await updates()
    expect(host.querySelector('span')!.textContent).toBe('')
    expect(host.querySelector('[data-tosi-text]')).not.toBeNull()
    expect(host.querySelector('[data-tosi-on-click]')).not.toBeNull()
    warn.mockRestore()
  })

  test('refusals: each is left unbound and warned once with its reason', async () => {
    tosi({
      dbE: { name: 'Ada', go() {}, link: 'https://example.com' },
      dbEvil: { secret: 's' },
    })
    await updates()
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const cases: Array<[string, RegExp]> = [
      ['<span data-tosi-text="dbEvil.secret"></span>', /not granted to read/],
      ['<span data-tosi-text="dbEvil"></span>', /not granted to read/],
      ['<span data-tosi-text="dbE.name + 1"></span>', /not a plain state path/],
      ['<span data-tosi-text="dbE[id=1]"></span>', /not a plain state path/],
      ['<span data-tosi-frobnicate="dbE.name"></span>', /unknown/],
      ['<span data-tosi-attr="dbE.name"></span>', /unknown/],
      [
        '<button data-tosi-on-click="dbE.nope"></button>',
        /not a granted action/,
      ],
      ['<img data-tosi-on-error="dbE.go">', /not an event a person causes/],
      ['<a data-tosi-attr-href="dbE.link"></a>', /can act on its value/],
      ['<div data-tosi-prop-inner-h-t-m-l="dbE.name"></div>', /never bound/],
      ['<div data-tosi-attr-onclick="dbE.name"></div>', /never bound/],
      ['<iframe data-tosi-attr-srcdoc="dbE.name"></iframe>', /never bound/],
    ]
    for (const [html, reason] of cases) {
      warn.mockClear()
      const host = mount(html)
      current?.disable()
      current = enableDeclarativeBinding({
        read: ['dbE'],
        actions: ['dbE.go'],
        root: host,
      })
      await updates()
      const element = host.firstElementChild!
      expect([
        html,
        element.getAttributeNames().some((n) => n.startsWith('data-tosi-')),
      ]).toEqual([html, true])
      expect([html, String(warn.mock.calls[0]?.[0])]).toEqual([
        html,
        expect.stringMatching(reason),
      ])
    }
    warn.mockRestore()
  })

  test('a lookalike prefix is not a grant', async () => {
    tosi({ dbF: { a: 1 }, dbFEvil: { a: 2 } })
    await updates()
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const host = mount('<span data-tosi-text="dbFEvil.a"></span>')
    current = enableDeclarativeBinding({ read: ['dbF'], root: host })
    await updates()
    expect(host.querySelector('span')!.textContent).toBe('')
    warn.mockRestore()
  })

  test('an acting target binds when the path is also a granted action', async () => {
    tosi({ dbG: { link: 'https://example.com/' } })
    await updates()
    const host = mount('<a data-tosi-attr-href="dbG.link"></a>')
    current = enableDeclarativeBinding({
      read: ['dbG'],
      actions: ['dbG.link'],
      root: host,
    })
    await updates()
    expect(host.querySelector('a')!.getAttribute('href')).toBe(
      'https://example.com/'
    )
  })

  test('markup inserted later is hydrated; disable() stops that', async () => {
    const { dbH } = tosi({ dbH: { name: 'Ada' } })
    await updates()
    const host = mount('')
    current = enableDeclarativeBinding({ read: [dbH], root: host })
    host.innerHTML = '<span data-tosi-text="dbH.name"></span>'
    await tick()
    await updates()
    expect(host.querySelector('span')!.textContent).toBe('Ada')
    current.disable()
    host.innerHTML = '<span data-tosi-text="dbH.name"></span>'
    await tick()
    await updates()
    expect(host.querySelector('span')!.textContent).toBe('')
  })

  test('a function grant decides per path', async () => {
    tosi({ dbI: { open: 'yes', closed: 'no' } })
    await updates()
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const host = mount(
      '<span class="a" data-tosi-text="dbI.open"></span>' +
        '<span class="b" data-tosi-text="dbI.closed"></span>'
    )
    current = enableDeclarativeBinding({
      read: (path) => path === 'dbI.open',
      root: host,
    })
    await updates()
    expect(host.querySelector('.a')!.textContent).toBe('yes')
    expect(host.querySelector('.b')!.textContent).toBe('')
    warn.mockRestore()
  })
})
