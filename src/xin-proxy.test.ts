import { test, expect, spyOn } from 'bun:test'
import { xin } from './xin'
import { xinPath, _resetDeprecationWarnings } from './metadata'
import { tosi, xinProxy, boxedProxy } from './xin-proxy'

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

test('xinProxy assigns to xin and returns XinProxy', () => {
  const data = {
    xinProxyTest: {
      name: 'test',
      count: 42,
    },
  }

  const result = xinProxy(data)

  // Values should be accessible via xin
  expect(xin.xinProxyTest.name).toBe('test')
  expect(xin.xinProxyTest.count).toBe(42)

  // Result should reflect the same values
  expect(result.xinProxyTest.name).toBe('test')
  expect(result.xinProxyTest.count).toBe(42)
})

test('xinProxy with boxed=true warns and calls tosi', () => {
  const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})

  const data = {
    boxedTest: {
      value: 'hello',
    },
  }

  // @ts-expect-error testing deprecated parameter
  const result = xinProxy(data, true)

  expect(warnSpy).toHaveBeenCalled()
  expect(result.boxedTest.value.valueOf()).toBe('hello')

  warnSpy.mockRestore()
})

test('boxedProxy warns and delegates to tosi', () => {
  _resetDeprecationWarnings()
  const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})

  const data = {
    boxedProxyTest: {
      item: 'world',
    },
  }

  const result = boxedProxy(data)

  expect(warnSpy).toHaveBeenCalled()
  expect(result.boxedProxyTest.item.valueOf()).toBe('world')

  warnSpy.mockRestore()
})
