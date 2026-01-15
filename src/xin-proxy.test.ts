import { test, expect } from 'bun:test'
import { xin } from './xin'
import { xinPath } from './metadata'
import { tosi } from './xin-proxy'

test('tosi works', () => {
  const { test } = tosi({
    test: {
      foo: 'bar',
    },
  })
  expect(test.foo.valueOf()).toBe('bar')
  test.foo.xinValue = 'baz'
  expect(test.foo.valueOf()).toBe('baz')

  const { box } = tosi({
    box: {
      foo: 'bar',
      deep: [{ id: 'thought', answer: 42 }],
      nullity: null,
    },
  })

  expect(xin.box.foo).toBe('bar')
  expect(box.foo.valueOf()).toBe('bar')

  // @ts-expect-error it's a test ffs
  box.foo = 'hello'
  expect(xin.box.foo).toBe('hello')
  expect(box.foo.valueOf()).toBe('hello')

  box.foo.xinValue = 'using xinValue'
  expect(xin.box.foo).toBe('using xinValue')
  expect(box.foo.valueOf()).toBe('using xinValue')

  expect(xinPath(box.foo)).toBe('box.foo')
  expect(box.deep['id=thought'].answer.valueOf()).toBe(42)
  expect(xinPath(box.deep['id=thought'].answer)).toBe(
    'box.deep[id=thought].answer'
  )
  // @ts-expect-error it's a test ffs
  expect(box.whatevs.xinPath).toBe('box.whatevs')
  // @ts-expect-error it's a test ffs
  expect(box.whatevs.xinValue).toBe(undefined)
  expect(box.nullity.xinValue).toBe(null)

  // @ts-expect-error it's a test ffs
  box.whatevs.sub = 17
  // @ts-expect-error it's a test ffs
  expect(typeof box.whatevs.xinValue).toBe('object')
  // @ts-expect-error it's a test ffs
  expect(box.whatevs.sub.xinValue).toBe(17)
})
