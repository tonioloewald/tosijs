import { test, expect, describe } from 'bun:test'
import { xin, observe, unobserve, updates, touch } from './xin'

describe('updates() across cascaded drains', () => {
  test('a synchronous cascade inside an observer does not orphan updates()', async () => {
    ;(xin as any).cascadeA = { x: 1, y: 0 }
    await updates()
    const listener = observe('cascadeA.x', () => {
      ;(xin as any).cascadeA.y = ((xin as any).cascadeA.x as number) * 2
    })
    ;(xin as any).cascadeA.x = 5
    // before the fix this await hung forever: the cascade's touch() replaced
    // the module-level resolver, orphaning the promise we hold here
    await updates()
    expect((xin as any).cascadeA.y).toBe(10)
    unobserve(listener)
  })

  test('two settling rounds still need two awaits (per-round semantics preserved)', async () => {
    ;(xin as any).cascadeB = { x: 1, y: 0 }
    await updates()
    let yNotifications = 0
    const lx = observe('cascadeB.x', () => {
      ;(xin as any).cascadeB.y = ((xin as any).cascadeB.x as number) + 1
    })
    const ly = observe('cascadeB.y', () => {
      yNotifications++
    })
    ;(xin as any).cascadeB.x = 7
    // round 1: x observers fire and the y write lands, but y's own
    // notifications belong to round 2 — the long-standing double-await idiom
    await updates()
    expect((xin as any).cascadeB.y).toBe(8)
    expect(yNotifications).toBe(0)
    await updates()
    expect(yNotifications).toBe(1)
    unobserve(lx)
    unobserve(ly)
  })

  test('a throwing test function does not abort the batch or hang updates()', async () => {
    ;(xin as any).poisonPt = { ok: 0 }
    await updates()
    let heard = 0
    const bad = observe(() => {
      throw new Error('bad predicate')
    }, () => {})
    const good = observe('poisonPt.ok', () => {
      heard++
    })
    ;(xin as any).poisonPt.ok = 1
    // before the fix the rethrow aborted the drain after touchedPaths was
    // cleared: the good observer never fired and this await hung forever
    await updates()
    expect(heard).toBe(1)
    unobserve(bad)
    unobserve(good)
  })
})

describe('segment-boundary path matching (H-1)', () => {
  test('a string observer does not hear name-prefix siblings', async () => {
    ;(xin as any).h1a = { user: 'u', username: 'un' }
    await updates()
    const heard: string[] = []
    const listener = observe('h1a.user', (p) => {
      heard.push(p)
    })
    ;(xin as any).h1a.username = 'changed'
    await updates()
    expect(heard).toEqual([]) // 'h1a.user' must not hear 'h1a.username'
    ;(xin as any).h1a.user = 'changed'
    await updates()
    expect(heard).toEqual(['h1a.user'])
    unobserve(listener)
  })

  test('touch dedupe does not swallow distinct sibling paths', async () => {
    ;(xin as any).h1b = { foo: 1, foobar: 2 }
    await updates()
    const heard: string[] = []
    const listener = observe(/^h1b\.foobar$/, (p) => {
      heard.push(p)
    })
    touch('h1b.foo')
    touch('h1b.foobar') // was swallowed: 'h1b.foobar'.startsWith('h1b.foo')
    await updates()
    expect(heard).toEqual(['h1b.foobar'])
    unobserve(listener)
  })

  test('hierarchical matching still works in both directions', async () => {
    ;(xin as any).h1c = { user: { name: 'x' } }
    await updates()
    const parentHeard: string[] = []
    const childHeard: string[] = []
    const lp = observe('h1c.user', (p) => parentHeard.push(p))
    const lc = observe('h1c.user.name', (p) => childHeard.push(p))
    touch('h1c.user.name')
    await updates()
    expect(parentHeard).toEqual(['h1c.user.name']) // parent hears child
    touch('h1c.user')
    await updates()
    expect(childHeard).toContain('h1c.user') // child hears parent
    unobserve(lp)
    unobserve(lc)
  })

  test('array-index paths respect boundaries', async () => {
    ;(xin as any).h1d = { list: Array.from({ length: 60 }, (_, i) => i) }
    await updates()
    const heard: string[] = []
    const listener = observe('h1d.list[5]', (p) => heard.push(p))
    touch('h1d.list[50]')
    await updates()
    expect(heard).toEqual([]) // list[5] must not hear list[50]
    touch('h1d.list[5]')
    await updates()
    expect(heard).toEqual(['h1d.list[5]'])
    unobserve(listener)
  })
})
