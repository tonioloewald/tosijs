// Validates the 2.0 boxed-scalar design on the REAL library: boxed scalars proxy
// over primitive wrappers (Number/Boolean/String), so `instanceof` is honest and
// TJS's `Eq` (== / !=) unwraps them via valueOf — no `.value` ceremony, live.
import { test, expect } from 'bun:test'
import { tosi } from './xin-proxy'
import { boxed } from './xin'
// @ts-expect-error — .tjs has no ambient types; loaded via the tjs Bun plugin
import { eq, ne } from './boxed-eq-helper.tjs'

test('boxed number: instanceof Number + TJS Eq, live', () => {
  tosi({ eqNum: { n: 42 } })
  const b = (boxed as any).eqNum.n
  expect(b instanceof Number).toBe(true)
  expect(b == 42).toBe(true) // plain JS coercion
  expect(eq(b, 42)).toBe(true) // through TJS Eq
  expect(ne(b, 42)).toBe(false)
  expect(eq(b, 7)).toBe(false)
  ;(boxed as any).eqNum.n = 7 // live
  expect(eq(b, 7)).toBe(true)
  expect(eq(b, 42)).toBe(false)
})

test('boxed string: instanceof String + Eq + length/index/methods', () => {
  tosi({ eqStr: { s: 'hello' } })
  const b = (boxed as any).eqStr.s
  expect(b instanceof String).toBe(true)
  expect(eq(b, 'hello')).toBe(true)
  expect(ne(b, 'world')).toBe(true)
  // own props (length/index) must survive the Proxy invariant
  expect(b.length).toBe(5)
  expect(b[0]).toBe('h')
  // prototype methods delegate to the live value
  expect(b.toUpperCase()).toBe('HELLO')
  expect(String(b)).toBe('hello')
})

test('boxed boolean: instanceof Boolean + Eq', () => {
  tosi({ eqBool: { t: true, f: false } })
  const t = (boxed as any).eqBool.t
  const f = (boxed as any).eqBool.f
  expect(t instanceof Boolean).toBe(true)
  expect(f instanceof Boolean).toBe(true)
  expect(eq(t, true)).toBe(true)
  expect(eq(f, false)).toBe(true)
  expect(eq(t, false)).toBe(false)
})

test('.value still returns the live primitive for all three types', () => {
  tosi({ eqVal: { n: 1, s: 'a', b: true } })
  expect((boxed as any).eqVal.n.value).toBe(1)
  expect((boxed as any).eqVal.s.value).toBe('a')
  expect((boxed as any).eqVal.b.value).toBe(true)
})

test('a real String stored in state is NOT treated as a boxed scalar', () => {
  // isBoxedScalar must not false-positive on user-supplied wrapper objects.
  const wrapped = new String('user')
  tosi({ eqUser: { w: wrapped } })
  // objects are proxied directly, not boxed; value round-trips
  expect(`${(boxed as any).eqUser.w}`).toBe('user')
})
