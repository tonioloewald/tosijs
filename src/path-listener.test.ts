import { test, expect, describe } from 'bun:test'
import { xin, observe, unobserve, updates } from './xin'

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
