// Read-side path safety: binding to / observing a path that will never exist.
// Same bug class as a fabricated write, and just as invisible — the boxed proxies
// never fail on the way down, so `boxed.appp.user` is a happy path string whose
// binding simply never fires, forever.
import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
  beforeAll,
} from 'bun:test'
import { tosi, observe, unobserve, bind, bindings, elements } from './index'
import { settings } from './settings'

const { div } = elements

let warnings: string[] = []
let errors: string[] = []
const realWarn = console.warn
const realError = console.error

// let the deferred (microtask) check run
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeAll(() => {
  tosi({
    pathCheck: {
      user: { name: 'ada', email: 'ada@example.com' },
      pending: null, // the idiomatic stub: declared, not yet filled
      empty: {}, // no shape to contradict
    },
  })
})

beforeEach(() => {
  warnings = []
  errors = []
  console.warn = (...args: any[]) => warnings.push(String(args[0]))
  console.error = (...args: any[]) => errors.push(String(args[0]))
  settings.bindingPaths = 'warn'
})

afterEach(() => {
  console.warn = realWarn
  console.error = realError
  settings.bindingPaths = 'warn'
})

describe('observe', () => {
  test('a real path is silent', async () => {
    const listener = observe('pathCheck.user.name', () => {})
    await settle()
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    unobserve(listener)
  })

  test('TYPO — a key absent from a populated object reports sternly', async () => {
    const listener = observe('pathCheck.usre.name', () => {})
    await settle()
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('"usre" does not exist')
    expect(errors[0]).toContain('never fire')
    expect(warnings).toEqual([])
    unobserve(listener)
  })

  test('TYPO at the root is caught too — the `appp.user` case', async () => {
    const listener = observe('pathChekc.user.name', () => {})
    await settle()
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('pathChekc')
    unobserve(listener)
  })

  test('a declared-but-null stub is NOT a typo — soft warn, not stern', async () => {
    const listener = observe('pathCheck.pending.name', () => {})
    await settle()
    expect(errors).toEqual([]) // not the stern one — `pending` IS declared
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('does not resolve')
    unobserve(listener)
  })

  test('an empty object carries no shape, so it cannot contradict — soft only', async () => {
    const listener = observe('pathCheck.empty.whatever', () => {})
    await settle()
    expect(errors).toEqual([])
    expect(warnings.length).toBe(1)
    unobserve(listener)
  })

  test('a RegExp observer is never checked — it is MEANT to match unborn paths', async () => {
    const listener = observe(/^nope\.nothing/, () => {})
    await settle()
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    unobserve(listener)
  })
})

describe('bind', () => {
  test('binding to a real path is silent', async () => {
    bind(div(), 'pathCheck.user.name', bindings.text)
    await settle()
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })

  test('binding to a typo reports sternly', async () => {
    bind(div(), 'pathCheck.user.nmae', bindings.text)
    await settle()
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('nmae')
  })
})

describe('deeply async is preserved', () => {
  test('binding BEFORE the data is registered does not warn — the check is deferred', async () => {
    // tosi() is synchronous and binding is async, so a microtask-deferred check
    // sees the registration that lands later in the same tick
    bind(div(), 'lateArrival.title', bindings.text)
    tosi({ lateArrival: { title: 'hello' } })
    await settle()
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })
})

describe('modes', () => {
  test("'off' says nothing at all", async () => {
    settings.bindingPaths = 'off'
    const listener = observe('pathCheck.totally.bogus', () => {})
    await settle()
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    unobserve(listener)
  })
})
