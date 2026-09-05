import { test, expect, spyOn, describe } from 'bun:test'
import { xin } from './xin'
import { updates } from './path-listener'
import { xinPath, _resetDeprecationWarnings, XIN_OBSERVE } from './metadata'
import { tosi, tosiUnique, xinProxy, boxedProxy } from './xin-proxy'

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

test('xinProxy assigns to xin and returns TosiProxy', () => {
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

test('tosiUnique creates isolated proxy with cleanup', () => {
  const [proxy, remove] = tosiUnique({ count: 0, name: 'test' })

  // proxy works like a normal boxed proxy
  expect(proxy.count.valueOf()).toBe(0)
  expect(proxy.name.valueOf()).toBe('test')

  // mutations work
  // @ts-expect-error boxed proxy assignment
  proxy.count = 5
  expect(proxy.count.valueOf()).toBe(5)

  // path is under a unique key
  const path = proxy.count.tosiPath
  expect(path).toMatch(/\.count$/)

  // the key exists in xin
  const key = path.split('.')[0]
  expect(xin[key]).toBeDefined()
  expect(xin[key].count).toBe(5)

  // cleanup removes it
  remove()
  expect(xin[key]).toBeUndefined()
})

test('tosiUnique creates distinct keys for each call', () => {
  const [proxy1, remove1] = tosiUnique({ x: 1 })
  const [proxy2, remove2] = tosiUnique({ x: 2 })

  const key1 = proxy1.x.tosiPath.split('.')[0]
  const key2 = proxy2.x.tosiPath.split('.')[0]

  expect(key1).not.toBe(key2)
  expect(proxy1.x.valueOf()).toBe(1)
  expect(proxy2.x.valueOf()).toBe(2)

  remove1()
  remove2()
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

describe('the direct .observe delegates to the accessor — same signature', () => {
  /*
   * Its type said `(path: string) => void`, exactly inverted from the runtime.
   * The working call was a type error and the type-prescribed call THREW
   * ("expect callback to be a path or function"), so the typing pointed a
   * consumer at the one spelling that cannot work. Nothing caught it because
   * no lane typechecks `*.test.ts` — two of our own tests call it correctly
   * and were reported as errors by a check nobody ran.
   *
   * Pins the SHAPE for all four spellings, since they are one implementation.
   */
  test('every direct spelling takes a callback and returns an unsubscribe', async () => {
    const { obsShape } = tosi({
      obsShape: { a: { n: 0 }, b: { n: 0 }, c: { n: 0 }, d: { n: 0 } },
    })
    await updates()
    const spellings: Array<[string, string, (o: any, cb: any) => any]> = [
      ['observe', 'a', (o, cb) => o.observe(cb)],
      ['tosiObserve', 'b', (o, cb) => o.tosiObserve(cb)],
      ['xinObserve', 'c', (o, cb) => o.xinObserve(cb)],
      ['[XIN_OBSERVE]', 'd', (o, cb) => o[XIN_OBSERVE](cb)],
    ]
    for (const [name, key, call] of spellings) {
      let fired = 0
      const off = call((obsShape as any)[key], () => {
        fired++
      })
      // each spelling gets its OWN subtree: sharing one made every case after
      // the first write an unchanged value, so nothing touched and three of
      // four looked broken
      ;(obsShape as any)[key].n = 99
      await updates()
      expect(`${name}:${fired}`).toBe(`${name}:1`)
      expect(typeof off).toBe('function')
      off()
      // and unsubscribing actually stops it
      ;(obsShape as any)[key].n = 100
      await updates()
      expect(`${name}:${fired}`).toBe(`${name}:1`)
    }
  })
})

describe('the accessor spellings a proxy actually carries', () => {
  /*
   * Found by typechecking the tests: `tosiBinding` worked on both proxy kinds
   * and `BoxedScalarAPI` declared it, but `TosiProps` did not — so the same
   * call was typed on a scalar and a type error on an object.
   *
   * Pinning the WHOLE set rather than that one name, because the defect is
   * drift between two hand-maintained type surfaces over one implementation.
   * The absent ones are asserted too: `xinBinding` is undefined on a scalar
   * and a PHANTOM NESTED PROXY on an object (an unknown key yields a proxy
   * for that path, which is why it reads as an object rather than undefined),
   * and `tosiTouch`/`xinTouch` were never spellings at all.
   */
  const SUPPORTED = [
    'binding',
    'tosiBinding',
    'bind',
    'tosiBind',
    'xinBind',
    'observe',
    'tosiObserve',
    'xinObserve',
    'touch',
  ]
  const NOT_SPELLINGS = ['tosiTouch', 'xinTouch']

  test('object and scalar proxies carry the same accessor spellings', async () => {
    const { spell } = tosi({ spell: { obj: { x: 1 }, s: 'str' } })
    await updates()
    for (const [kind, target] of [
      ['object', (spell as any).obj],
      ['scalar', (spell as any).s],
    ] as Array<[string, any]>) {
      for (const name of SUPPORTED) {
        expect(`${kind}.${name}:${typeof target[name]}`).toBe(
          `${kind}.${name}:function`
        )
      }
      for (const name of NOT_SPELLINGS) {
        expect(`${kind}.${name}:${typeof target[name]}`).not.toBe(
          `${kind}.${name}:function`
        )
      }
    }
  })
})
