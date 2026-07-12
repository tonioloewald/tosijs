// Write-path safety: writing to an undefined path fabricates the structure it
// walks through, growing a branch of state nothing is observing. That's the
// typo bug (`app.usre.name`) that is expensive to find, and it's detectable
// exactly where it happens — in setByPath.
//
// The boxed proxies are *why* it needs catching here: `boxed.app.usre.name`
// never fails on the way down (the proxy is accumulating a path string, not
// touching data). The write is the first moment the mistake is observable.
import { test, expect, describe, beforeEach, afterEach } from 'bun:test'
// @ts-expect-error — .tjs has no ambient types; loaded via the tjs Bun plugin
import { setByPath } from './by-path.tjs'
import { settings } from './settings'

let warnings: string[] = []
let errors: string[] = []
const realWarn = console.warn
const realError = console.error

beforeEach(() => {
  warnings = []
  errors = []
  console.warn = (...args: any[]) => warnings.push(String(args[0]))
  console.error = (...args: any[]) => errors.push(String(args[0]))
  settings.pathCreation = 'warn'
})

afterEach(() => {
  console.warn = realWarn
  console.error = realError
  settings.pathCreation = 'warn'
})

describe('legitimate writes stay silent', () => {
  test('updating an existing leaf says nothing', () => {
    const obj = { app: { user: { name: 'ada' } } }
    setByPath(obj, 'app.user.name', 'grace')
    expect(obj.app.user.name).toBe('grace')
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })

  test('adding a NEW leaf to an existing parent says nothing', () => {
    // this is how you grow state — it must not be noisy
    const obj: any = { app: { user: { name: 'ada' } } }
    setByPath(obj, 'app.user.email', 'ada@example.com')
    expect(obj.app.user.email).toBe('ada@example.com')
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })
})

describe('fabricated structure is reported, graded by depth', () => {
  test('one invented intermediate warns', () => {
    const obj: any = { app: { user: { name: 'ada' } } }
    setByPath(obj, 'app.usre.name', 'typo') // `usre` does not exist
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('app.usre.name')
    expect(warnings[0]).toContain('usre')
    expect(errors).toEqual([]) // one level is a warning, not the stern one
  })

  test('two or more invented levels is sterner (console.error)', () => {
    const obj: any = { app: {} }
    setByPath(obj, 'app.a.b.c', 1) // invents `a` and `b`
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('fabricated 2 levels')
    expect(warnings).toEqual([])
  })

  test('the warning names the branch nobody is observing', () => {
    const obj: any = { app: {} }
    setByPath(obj, 'app.a.b.c', 1)
    expect(errors[0]).toContain('nothing is observing')
  })
})

// What arrays ACTUALLY do (probed, not assumed):
//   list[3].n  — missing INTERMEDIATE index: does not fabricate, walk falls
//                through to a throw. Already loud, nothing to add.
//   list[id=x] — unresolvable id-path: throws too.
//   list[5]=x  — LEAF write past the end: silently grows the array with empty
//                slots. THIS is the array hole, and it's what we now report.
describe('arrays: writing past the end is the real hole', () => {
  test('a missing intermediate index throws — it never fabricates', () => {
    const obj: any = { list: [{ n: 1 }, { n: 2 }] }
    expect(() => setByPath(obj, 'list[3].n', 99)).toThrow()
    expect(obj.list.length).toBe(2) // nothing invented
  })

  test('an unresolvable id-path throws — it never fabricates', () => {
    const obj: any = { list: [{ id: 'a', n: 1 }] }
    expect(() => setByPath(obj, 'list[id=nope].n', 5)).toThrow()
    expect(obj.list.length).toBe(1)
  })

  test('writing past the end warns and names the empty slots', () => {
    const obj: any = { list: [{ n: 1 }, { n: 2 }] }
    setByPath(obj, 'list[5]', { n: 9 }) // leaves holes at 2, 3, 4
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('past the end')
    expect(warnings[0]).toContain('3 empty slot')
    expect(obj.list.length).toBe(6)
  })

  test('appending at exactly length is legitimate — silent', () => {
    const obj: any = { list: [{ n: 1 }, { n: 2 }] }
    setByPath(obj, 'list[2]', { n: 3 })
    expect(obj.list.length).toBe(3)
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })

  test('updating an existing index is silent', () => {
    const obj: any = { list: [{ n: 1 }, { n: 2 }] }
    setByPath(obj, 'list[0].n', 42)
    expect(obj.list[0].n).toBe(42)
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })

  test("'throw' restores the array's length — no holes left behind", () => {
    settings.pathCreation = 'throw'
    const obj: any = { list: [{ n: 1 }, { n: 2 }] }
    expect(() => setByPath(obj, 'list[5]', { n: 9 })).toThrow()
    // `delete list[5]` alone would leave length at 6 with holes — that isn't a
    // rollback, it's a different corruption
    expect(obj.list.length).toBe(2)
    expect(obj.list).toEqual([{ n: 1 }, { n: 2 }])
  })
})

describe('modes', () => {
  test("'off' is silent even for a deep fabrication", () => {
    settings.pathCreation = 'off'
    const obj: any = { app: {} }
    setByPath(obj, 'app.a.b.c', 1)
    expect(obj.app.a.b.c).toBe(1) // still written
    expect(warnings).toEqual([])
    expect(errors).toEqual([])
  })

  test("'warn' keeps the write", () => {
    const obj: any = { app: {} }
    setByPath(obj, 'app.a.b.c', 1)
    expect(obj.app.a.b.c).toBe(1)
    expect(errors.length).toBe(1)
  })

  test("'throw' blocks the write AND leaves no phantom branch behind", () => {
    settings.pathCreation = 'throw'
    const obj: any = { app: { user: { name: 'ada' } } }
    expect(() => setByPath(obj, 'app.usre.name', 'typo')).toThrow()
    // the rollback is the point: a throw that left `app.usre` behind would be
    // worse than the warning it replaced
    expect(obj.app.usre).toBeUndefined()
    expect(Object.keys(obj.app)).toEqual(['user'])
    // and the pre-existing state is untouched
    expect(obj.app.user.name).toBe('ada')
  })

  test("'throw' rolls back a DEEP fabrication entirely", () => {
    settings.pathCreation = 'throw'
    const obj: any = { app: {} }
    expect(() => setByPath(obj, 'app.a.b.c', 1)).toThrow()
    expect(obj.app.a).toBeUndefined()
    expect(Object.keys(obj.app)).toEqual([])
  })

  test("'throw' does NOT block a legitimate new leaf", () => {
    settings.pathCreation = 'throw'
    const obj: any = { app: { user: {} } }
    setByPath(obj, 'app.user.email', 'ada@example.com')
    expect(obj.app.user.email).toBe('ada@example.com')
  })
})
