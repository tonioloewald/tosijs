import { test, expect } from 'bun:test'
import { XinObject, XinProxyArray, XinProxyObject, XinArray } from './xin-types'
import {
  xin,
  boxed,
  observe,
  unobserve,
  touch,
  updates,
  isValidPath,
} from './xin'
import { tosi } from './xin-proxy'
import { bind } from './bind'
import { bindings } from './bindings'
import { elements } from './elements'
import {
  XIN_VALUE,
  XIN_PATH,
  xinPath,
  xinValue,
  tosiPath,
  tosiValue,
  tosiSetValue,
  tosiAccessor,
  TOSI_ACCESSOR,
  TAKE_DESCRIPTOR,
} from './metadata'

type Change = { path: string; value: any; observed?: any }
const changes: Change[] = []
const recordChange = (change: Change) => {
  changes.push(change)
}
async function resetChanges() {
  await updates()
  changes.length = 0
}

const obj = {
  message: 'hello xin',
  value: 17,
  people: ['tomasina', 'juanita', 'harriet'],
  things: [
    { id: 1701, name: 'Enterprise' },
    { id: 666, name: 'The Beast' },
    { id: 1, name: 'The Best' },
  ],
  cb(path: string) {
    if (path !== 'test.changes') recordChange({ path, value: xin[path] })
  },
  sub: {
    foo: 'bar',
  },
}

xin.test = obj as unknown as XinProxyObject

test('recovers simple values', () => {
  const _test = xin.test as XinProxyObject
  expect(_test.message).toBe('hello xin')
  expect(_test.value).toBe(17)
})

test('handles arrays', () => {
  const _test = xin.test as XinProxyObject
  const people = _test.people as string[]
  const things = _test.things as XinProxyArray
  expect(people[0]).toBe('tomasina')
  expect(things['id=1701'].name).toBe('Enterprise')
})

test('boxed proxies', () => {
  const _test = boxed.test
  expect(_test.message.valueOf()).toBe('hello xin')
  expect(xinPath(_test.message)).toBe('test.message')
  expect(_test.people[1].valueOf()).toBe('juanita')
  expect(xinPath(_test.people[1])).toBe('test.people[1]')
  expect(_test.things['id=1701'].name.valueOf()).toBe('Enterprise')
  expect(xinPath(_test.things['id=1701'].name)).toBe(
    'test.things[id=1701].name'
  )
})

test('valueOf works', () => {
  expect(boxed.test.message.valueOf()).toBe('hello xin')
  expect(boxed.test.message).not.toBe('hello xin')
  expect(boxed.test.valueOf().message).toBe('hello xin')
  expect(boxed.test.things['id=666'].name.valueOf()).toBe('The Beast')
})

test('xinPath property works', () => {
  expect(boxed.test.xinPath).toBe('test')
  expect(boxed.test.message.xinPath).toBe('test.message')
  expect(boxed.test.things['id=666'].xinPath).toBe('test.things[id=666]')
  expect(boxed.test.things[2].xinPath).toBe('test.things[2]')
})

test('updates simple values', () => {
  const _test = xin.test as XinProxyObject
  _test.message = 'xin rules!'
  // @ts-expect-error it's just a test
  _test.value++
  expect(_test.message).toBe('xin rules!')
  expect(_test.value).toBe(18)
})

test('array iterators', () => {
  let count = 0
  for (const item of xin.test.people) {
    if (item !== undefined) {
      count++
    }
  }
  expect(count).toBe(3)
})

test('isValidPath', () => {
  expect(isValidPath('')).toBe(false)
  expect(isValidPath('.')).toBe(false)
  expect(isValidPath('.foo')).toBe(true)
  expect(isValidPath('airtime-rooms[id=1234].')).toBe(false)
  expect(isValidPath('foo')).toBe(true)
  expect(isValidPath('_foo')).toBe(true)
  expect(isValidPath('foo_17')).toBe(true)
  expect(isValidPath('foo.bar')).toBe(true)
  expect(isValidPath('path.to.value,another.path')).toBe(false)
  expect(isValidPath('foo()')).toBe(false)
  expect(isValidPath('foo(path.to.value,another.path)')).toBe(false)
  expect(isValidPath('/')).toBe(true)
  expect(isValidPath('airtime-rooms[1234]')).toBe(true)
  expect(isValidPath('airtime-rooms[=abcd]')).toBe(true)
  expect(isValidPath('airtime-rooms[/=abcd]')).toBe(true)
  expect(isValidPath('airtime-rooms[id=1234]')).toBe(true)
  expect(isValidPath('airtime-rooms[url=https://foo.bar/baz?x=y]')).toBe(true)
  expect(
    isValidPath(
      'airtime-rooms[url=https://foo.bar/baz?x=y&foo=this, that, and the other.jpg]'
    )
  ).toBe(true)
  expect(isValidPath('airtime-rooms]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234')).toBe(false)
  expect(isValidPath('airtime-rooms[id]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234]]')).toBe(false)
  expect(isValidPath('airtime-rooms[]]')).toBe(false)
})

test('triggers listeners', async () => {
  await resetChanges()
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.value')
  expect(changes[0].value).toBe(Math.PI)
  test.message = 'kiss me xin'
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.message')
  expect(changes[1].value).toBe('kiss me xin')
  ;(test.things as XinProxyArray)['id=1701'].name =
    'formerly known as Enterprise'
  await updates()
  expect(changes.length).toBe(3)
  expect(changes[2].path).toBe('test.things[id=1701].name')
  expect(changes[2].value).toBe('formerly known as Enterprise')
  ;(test.people as XinProxyArray).sort()
  // expect sort to trigger change
  await updates()
  expect(changes.length).toBe(4)
  expect(changes[3].path).toBe('test.people')
  // expect map to NOT trigger change
  const ignore = (test.people as XinProxyArray).map(
    (person) => `hello ${String(person)}`
  )
  expect(ignore === undefined).toBe(false)
  await updates()
  expect(changes.length).toBe(4)
  unobserve(listener)
})

test('listener paths are selective', async () => {
  await resetChanges()
  const listener = observe('test.value', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.message = 'ignore this'
  test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('listener tests are selective', async () => {
  await resetChanges()
  const listener = observe(/message/, (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  _test.value = Math.random()
  _test.message = 'hello'
  _test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('async updates skip multiple updates to the same path', async () => {
  await resetChanges()
  const listener = observe('test.value', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.value = (test.value as number) - 1
  test.value = 17
  test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  test.value = 17
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('listener callback paths work', async () => {
  await resetChanges()
  const listener = observe('test', 'test.cb')
  const test = xin.test as XinProxyObject
  test.message = 'hello'
  test.value = Math.random()
  test.message = 'good-bye'
  test.value = Math.random()
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('you can touch objects', async () => {
  await resetChanges()
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })

  const test = xin.test as XinProxyObject
  ;(test[XIN_VALUE] as XinObject).message = 'wham-o'
  expect(test.message).toBe('wham-o')
  await updates()
  expect(changes.length).toBe(0)
  touch('test')
  await updates()
  expect(changes.length).toBe(1)
  test.message = 'because'
  await updates()
  expect(changes.length).toBe(2)
  ;(test[XIN_VALUE] as XinObject).message = 'i said so'
  await updates()
  expect(changes.length).toBe(2)
  touch('test.message')
  await updates()
  expect(changes.length).toBe(3)
  expect(changes[2].value).toBe('i said so')
  unobserve(listener)
})

test('instance changes trigger observers', async () => {
  await resetChanges()

  class Bar {
    parent: Baz

    constructor(parent: Baz) {
      this.parent = parent
    }

    inc() {
      this.parent.inc()
    }
  }

  class Baz {
    x: number = 0
    child: Bar

    constructor(x: number = 0) {
      this.x = x
      this.child = new Bar(this)
    }

    get y() {
      return this.x
    }

    set y(newValue: number) {
      this.x = newValue
    }

    inc() {
      this.x++
    }
  }

  const baz = new Baz(17)
  const _test = xin.test as XinProxyObject
  _test.baz = baz as unknown as XinProxyObject

  const listener = observe(
    () => true,
    (path) => {
      recordChange({ path, value: xin[path] })
    }
  )

  await updates()
  expect(changes.length).toBe(1)

  await resetChanges()
  expect((_test.baz as XinProxyObject)[XIN_VALUE]).toBe(baz)
  expect(_test.baz.x).toBe(17)
  expect(_test.baz.y).toBe(17)
  await updates()
  expect(changes.length).toBe(0)
  _test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  _test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  _test.baz.y = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  _test.baz.y = -10
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.baz.y')
  ;(_test.baz.inc as () => void)()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-9)
  _test.baz.child.inc()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-8)
  expect(_test.baz.x).toBe(_test.baz.child.parent.x)

  unobserve(listener)
})

test('handles array changes', async () => {
  await resetChanges()
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  const people = _test.people as XinArray
  expect(people === undefined).toBe(false)
  // @ts-expect-error it's a test
  _test.people.push('stanton')
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.people')
  ;(_test.people as XinProxyArray).sort()
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.people')
  unobserve(listener)
})

test('objects are replaced', () => {
  const _test = xin.test as XinProxyObject
  // @ts-expect-error it's a test
  expect(_test.sub.foo).toBe('bar')
  _test.sub = {
    bar: 'baz',
  } as unknown as XinProxyObject
  expect(_test.sub.foo).toBe(undefined)
  expect(_test.sub.bar).toBe('baz')
})

test('unobserve works', async () => {
  await resetChanges()
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  _test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
  things['id=1701'].name = 'Enterprise II'
  _test.value = 0
  await updates()
  expect(changes.length).toBe(1)
})

test('xinPath() works', () => {
  const _test = xin.test as XinProxyObject
  const people = _test.people as XinProxyArray
  expect(_test.xinPath).toBe('test')
  expect(people.xinPath).toBe('test.people')
})

test('xinValue works, xin does not corrupt content', () => {
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  const people = _test.people as XinProxyArray
  expect(_test[XIN_VALUE]).toBe(obj)
  expect(people[XIN_VALUE] as string[]).toBe(obj.people)
  expect(people.xinValue as string[]).toBe(obj.people)
  expect((things['id=666'] as XinProxyObject)[XIN_VALUE]).toBe(
    (things[1] as XinProxyObject)[XIN_VALUE]
  )
})

test('xinObserve works', async () => {
  const { xinObserveTest } = tosi({ xinObserveTest: { val: 'initial' } })
  let observedValue: any = null
  const unobserveValue = xinObserveTest.val.xinObserve(() => {
    observedValue = xinObserveTest.val.value
  })
  xinObserveTest.val.value = 'hello'
  await updates()
  expect(observedValue).toBe('hello')
  xinObserveTest.val.value = 17
  await updates()
  expect(observedValue).toBe(17)
  unobserveValue()
  xinObserveTest.val.value = 'goodbye'
  await updates()
  expect(observedValue).toBe(17) // unchanged because unobserved
})

test('xinOn works', async () => {
  const { test } = boxed
  let count = 0
  test.onTest = {
    handler: () => {
      count += 1
    },
  }
  const button = elements.button()
  const cancel = test.onTest.handler.xinOn(button, 'click')
  document.body.append(button)
  button.dispatchEvent(new Event('click'))
  await updates()
  expect(count).toBe(1)
  button.dispatchEvent(new Event('click'))
  await updates()
  expect(count).toBe(2)
  cancel()
  button.dispatchEvent(new Event('click'))
  await updates()
  expect(count).toBe(2)
  button.remove()
})

test('tosiListBinding works', async () => {
  document.body.textContent = ''

  const { tosiListBindingTest } = tosi({
    tosiListBindingTest: {
      array: ['this', 'that', 'the other', 'and one more'],
      objects: [
        {
          name: 'Enterprise',
          faction: 'Federation',
        },
        {
          name: 'No More Mr Nice Guy',
          faction: 'Culture',
        },
        {
          name: 'Heart of Gold',
          faction: 'Zaphod Beeblebrox',
        },
      ],
    },
  })

  const { ul, div } = elements
  document.body.append(
    ul(
      { id: 'simple-array-binding' },
      ...tosiListBindingTest.array.tosiListBinding(({ li }, item) => li(item))
    ),
    div(
      { id: 'array-binding' },
      ...tosiListBindingTest.objects.tosiListBinding(({ div, h4, p }, item) =>
        div(h4(item.name), p(item.faction))
      )
    )
  )
  await updates()
  expect(document.querySelectorAll('#simple-array-binding li').length).toBe(4)
  expect(document.querySelectorAll('#array-binding h4').length).toBe(3)
  expect(document.querySelector('#array-binding h4')?.textContent).toBe(
    'Enterprise'
  )
})

test('instance properties, computed properties', () => {
  class Foo {
    x: string = ''

    constructor(x: string) {
      this.x = x
    }

    get computedX() {
      return this.x
    }
  }

  xin.foo = new Foo('test') as unknown as XinProxyObject
  expect(xin.foo.x).toBe('test')
  expect(xin.foo.computedX).toBe('test')
})

test('parents and children', async () => {
  xin.grandparent = {
    name: 'Bobby',
    parent: { child: 17 },
  } as unknown as XinProxyObject
  const grandparent = xin.grandparent as XinObject
  await resetChanges()
  observe('grandparent.parent', (path) => {
    recordChange({ path, value: xin[path], observed: 'parent' })
  })
  observe('grandparent.parent.child', (path) => {
    recordChange({ path, value: xin[path], observed: 'parent.child' })
  })
  grandparent.parent = { child: 20 }
  await updates()
  expect(changes.length).toBe(2)
  grandparent.parent.child = 20
  await updates()
  expect(changes.length).toBe(2)
  grandparent.parent.child = 17
  await updates()
  expect(changes.length).toBe(4)
  grandparent.parent = { child: 11 }
  await updates()
  expect(changes.length).toBe(6)
  grandparent.name = 'Drop Tables'
  await updates()
  expect(changes.length).toBe(6)
})

test('no double wrapping', () => {
  const fubar = { barfu: { bazfu: 17 } }
  xin.fubar = fubar
  expect(xin.fubar[XIN_VALUE]).toBe(fubar)
  expect(xin.fubar.barfu[XIN_VALUE]).toBe(fubar.barfu)
  xin.fubar = { ...xin.fubar }
  expect(xin.fubar[XIN_VALUE]).not.toBe(fubar)
  expect(xin.fubar.barfu[XIN_VALUE]).toBe(fubar.barfu)
  delete xin.fubar
  expect(xin.fubar).toBe(undefined)
})

test('boxed scalar new API - path property', () => {
  const { pathTest } = tosi({ pathTest: { str: 'hello', num: 42 } })
  expect(pathTest.str.path).toBe('pathTest.str')
  expect(pathTest.num.path).toBe('pathTest.num')
})

test('boxed scalar new API - value property', () => {
  const { valueTest } = tosi({ valueTest: { str: 'hello', num: 42 } })
  expect(valueTest.str.value).toBe('hello')
  expect(valueTest.num.value).toBe(42)
})

test('boxed scalar new API - observe method', async () => {
  const { observeTest } = tosi({ observeTest: { count: 0 } })
  let observed = false
  const unobserveFn = observeTest.count.observe(() => {
    observed = true
  })
  observeTest.count.value = 1
  await updates()
  expect(observed).toBe(true)
  unobserveFn()
})

test('boxed scalar new API - bind method', async () => {
  const { bindMethodTest } = tosi({ bindMethodTest: { text: 'initial' } })
  const div = elements.div()
  document.body.append(div)
  bindMethodTest.text.bind(div, {
    toDOM(element, value) {
      element.textContent = value
    },
  })
  await updates()
  expect(div.textContent).toBe('initial')
  bindMethodTest.text.value = 'updated'
  await updates()
  expect(div.textContent).toBe('updated')
  div.remove()
})

test('boxed scalar new API - binding method', () => {
  const { bindingMethodTest } = tosi({ bindingMethodTest: { val: 'test' } })
  const binding = bindingMethodTest.val.binding({
    toDOM(element, value) {
      element.textContent = value
    },
  })
  expect(binding.bind.value).toBe('bindingMethodTest.val')
  expect(binding.bind.binding).toBeDefined()
})

test('boxed scalar touch method', async () => {
  const { touchScalarTest } = tosi({
    touchScalarTest: { score: 42 },
  })
  await updates()

  let touched = false
  const unsub = touchScalarTest.score.observe(() => {
    touched = true
  })
  touchScalarTest.score.touch()
  await updates()
  expect(touched).toBe(true)
  unsub()
})

test('boxed object touch method', async () => {
  const { touchObjTest } = tosi({
    touchObjTest: { name: 'Alice', score: 10 },
  })
  await updates()

  let touched = false
  const unsub = touchObjTest.observe(() => {
    touched = true
  })
  touchObjTest.touch()
  await updates()
  expect(touched).toBe(true)
  unsub()
})

test('boxed scalar delegates to underlying value methods', () => {
  const { methodTest } = tosi({
    methodTest: { str: 'Hello World', num: 3.14159, bool: true },
  })

  // String methods - no cast needed, BoxedScalar<string> includes String methods
  expect(methodTest.str.toLocaleLowerCase()).toBe('hello world')
  expect(methodTest.str.startsWith('Hello')).toBe(true)
  expect(methodTest.str.includes('World')).toBe(true)
  expect(methodTest.str.slice(0, 5)).toBe('Hello')
  expect(methodTest.str.trim()).toBe('Hello World')
  expect(methodTest.str.length).toBe(11)
  expect(methodTest.str[0]).toBe('H')

  // Number methods
  expect(methodTest.num.toFixed(2)).toBe('3.14')

  // Boolean method
  expect(methodTest.bool.toString()).toBe('true')
})

test('.tosi accessor on boxed scalars', async () => {
  const { tosiAccTest } = tosi({
    tosiAccTest: { name: 'Alice', count: 42 },
  })

  // .tosi.path and .tosi.value
  expect(tosiAccTest.name.tosi.path).toBe('tosiAccTest.name')
  expect(tosiAccTest.name.tosi.value).toBe('Alice')
  expect(tosiAccTest.count.tosi.path).toBe('tosiAccTest.count')
  expect(tosiAccTest.count.tosi.value).toBe(42)

  // .tosi.value setter
  tosiAccTest.name.tosi.value = 'Bob'
  expect(tosiAccTest.name.tosi.value).toBe('Bob')
  expect(xin.tosiAccTest.name).toBe('Bob')

  // .tosi.touch and .tosi.observe
  let observed = false
  const unsub = tosiAccTest.count.tosi.observe(() => {
    observed = true
  })
  tosiAccTest.count.tosi.touch()
  await updates()
  expect(observed).toBe(true)
  unsub()
})

test('.tosi accessor on boxed objects', async () => {
  const { tosiObjTest } = tosi({
    tosiObjTest: { nested: { deep: 'val' } },
  })

  // .tosi on object proxy
  expect(tosiObjTest.tosi.path).toBe('tosiObjTest')
  expect(tosiObjTest.tosi.value).toEqual({ nested: { deep: 'val' } })
  expect(tosiObjTest.nested.tosi.path).toBe('tosiObjTest.nested')

  // .tosi.value setter on object
  tosiObjTest.nested.tosi.value = { deep: 'updated' }
  expect(xin.tosiObjTest.nested.deep).toBe('updated')
})

test('.tosi accessor avoids property name collisions', () => {
  const { collisionTest } = tosi({
    collisionTest: {
      value: 'actual-value',
      path: '/actual/path',
      observe: 'not-a-function',
    },
  })

  // Direct access returns the real properties (shadowed)
  expect(collisionTest.value.tosi.value).toBe('actual-value')
  expect(collisionTest.path.tosi.value).toBe('/actual/path')
  expect(collisionTest.observe.tosi.value).toBe('not-a-function')

  // .tosi gives the observer API regardless
  expect(collisionTest.tosi.path).toBe('collisionTest')
  expect(collisionTest.tosi.value).toEqual({
    value: 'actual-value',
    path: '/actual/path',
    observe: 'not-a-function',
  })
})

test('tosiAccessor() utility function', () => {
  const { accUtilTest } = tosi({
    accUtilTest: { name: 'test', count: 5 },
  })

  // Works on proxied objects
  const acc = tosiAccessor(accUtilTest)
  expect(acc).toBeDefined()
  expect(acc.path).toBe('accUtilTest')
  expect(acc.value).toEqual({ name: 'test', count: 5 })

  // Works on proxied scalars
  const scalarAcc = tosiAccessor(accUtilTest.name)
  expect(scalarAcc).toBeDefined()
  expect(scalarAcc.path).toBe('accUtilTest.name')
  expect(scalarAcc.value).toBe('test')

  // Returns undefined for non-proxy values
  expect(tosiAccessor('hello')).toBeUndefined()
  expect(tosiAccessor(42)).toBeUndefined()
  expect(tosiAccessor(null)).toBeUndefined()
  expect(tosiAccessor({ foo: 'bar' })).toBeUndefined()

  // TOSI_ACCESSOR symbol works directly on proxies
  const symAcc = accUtilTest[TOSI_ACCESSOR]
  expect(symAcc).toBeDefined()
  expect(symAcc.path).toBe('accUtilTest')
  expect(symAcc.value).toEqual({ name: 'test', count: 5 })

  // Symbol returns undefined on plain objects
  expect(({ foo: 'bar' } as any)[TOSI_ACCESSOR]).toBeUndefined()

  // Even if data has a 'tosi' property, .tosi returns the accessor
  const { shadowTest } = tosi({
    shadowTest: { tosi: 'shadowed value', real: 42 },
  })
  // .tosi always returns the accessor (not the data property)
  expect(shadowTest.tosi.path).toBe('shadowTest')
  // TOSI_ACCESSOR symbol also returns the accessor
  const shadowAcc = tosiAccessor(shadowTest)
  expect(shadowAcc).toBeDefined()
  expect(shadowAcc.path).toBe('shadowTest')
  expect(shadowAcc.value).toEqual({ tosi: 'shadowed value', real: 42 })
})

test('boxed null and undefined', () => {
  const { nullTest } = tosi({
    nullTest: { nullVal: null, undefVal: undefined },
  })
  expect(nullTest.nullVal.value).toBe(null)
  expect(nullTest.nullVal.path).toBe('nullTest.nullVal')
  expect(nullTest.undefVal.value).toBe(undefined)
  expect(nullTest.undefVal.path).toBe('nullTest.undefVal')
})

test('observe with function test', async () => {
  const changes: string[] = []
  const listener = observe(
    (path: string) => path.startsWith('funcTest'),
    (path) => {
      changes.push(path)
    }
  )
  xin.funcTest = { a: 1 }
  await updates()
  xin.funcTest.a = 2
  await updates()
  xin.otherPath = { b: 3 }
  await updates()
  // funcTest creation and funcTest.a update
  expect(changes.filter((p) => p.startsWith('funcTest')).length).toBe(2)
  unobserve(listener)
  delete xin.funcTest
  delete xin.otherPath
})

test('observe throws for invalid callback', () => {
  expect(() => {
    observe('test', 'nonexistent.path')
  }).toThrow()
})

test('compound path access', () => {
  xin.compound = {
    nested: {
      deep: {
        value: 'found',
      },
    },
    arr: [{ id: 1, name: 'first' }],
  }
  // compound paths with dots
  expect(xin['compound.nested.deep.value']).toBe('found')
  // compound paths with brackets
  expect(xin['compound.arr[id=1].name']).toBe('first')
  delete xin.compound
})

test('symbol property access on proxy', () => {
  const sym = Symbol('test')
  xin.symbolTest = { [sym]: 'symbol value', normal: 'regular' }
  expect(xin.symbolTest[sym]).toBe('symbol value')
  expect(xin.symbolTest.normal).toBe('regular')
  delete xin.symbolTest
})

test('tosiListBinding method on boxed arrays', async () => {
  const { listBindTest2 } = tosi({
    listBindTest2: {
      items: ['a', 'b', 'c'],
    },
  })
  // tosiListBinding is the array method (listBinding is only on scalars)
  const [props, template] = listBindTest2.items.tosiListBinding(
    ({ li }, item) => li(item)
  )
  expect(props.bindList).toBeDefined()
  expect(props.bindList.value).toBe('listBindTest2.items')
  expect(template).toBeInstanceOf(HTMLTemplateElement)
})

test('boxed scalar deprecated tosiBind method', async () => {
  const { tosiBindTest } = tosi({ tosiBindTest: { text: 'start' } })
  const div = elements.div()
  document.body.append(div)
  tosiBindTest.text.tosiBind(div, {
    toDOM(element, value) {
      element.textContent = value
    },
  })
  await updates()
  expect(div.textContent).toBe('start')
  div.remove()
})

test('boxed scalar deprecated tosiBinding method', () => {
  const { tosiBindingTest } = tosi({ tosiBindingTest: { val: 'test' } })
  const binding = tosiBindingTest.val.tosiBinding({
    toDOM(element, value) {
      element.textContent = value
    },
  })
  expect(binding.bind.value).toBe('tosiBindingTest.val')
  expect(binding.bind.binding).toBeDefined()
})

test('non-boxed-scalar tosiPath and tosiValue', () => {
  const { objTest } = tosi({ objTest: { nested: { deep: 'value' } } })
  expect(objTest.nested.tosiPath).toBe('objTest.nested')
  expect(objTest.nested.tosiValue).toEqual({ deep: 'value' })
})

test('non-boxed-scalar tosiObserve', async () => {
  const { tosiObsTest } = tosi({ tosiObsTest: { obj: { a: 1 } } })
  let observed = false
  const unobserveFn = tosiObsTest.obj.tosiObserve(() => {
    observed = true
  })
  tosiObsTest.obj.a = 2
  await updates()
  expect(observed).toBe(true)
  unobserveFn()
})

test('non-boxed-scalar tosiBind', async () => {
  const { objBindTest } = tosi({ objBindTest: { data: { text: 'hello' } } })
  const div = elements.div()
  document.body.append(div)
  objBindTest.data.tosiBind(div, {
    toDOM(element, value) {
      element.textContent = JSON.stringify(value)
    },
  })
  await updates()
  expect(div.textContent).toContain('hello')
  div.remove()
})

test('non-boxed-scalar tosiBinding', () => {
  const { objBindingTest } = tosi({
    objBindingTest: { data: { x: 1 } },
  })
  const binding = objBindingTest.data.tosiBinding({
    toDOM(element, value) {
      element.textContent = JSON.stringify(value)
    },
  })
  expect(binding.bind.value).toBe('objBindingTest.data')
})

test('proxy invariant: JSON.stringify works on boxed proxies', () => {
  const { jsonTest } = tosi({ jsonTest: { name: 'test', count: 42 } })
  // Should not throw proxy invariant violation
  const result = JSON.stringify(jsonTest)
  expect(result).toContain('name')
  expect(result).toContain('count')
})

test('proxy invariant: string character index access works', () => {
  const { strIndexTest } = tosi({ strIndexTest: { str: 'abc' } })
  // Accessing character indices on boxed String should return primitives
  const char = (strIndexTest.str as any)[0]
  expect(char).toBe('a')
  expect(typeof char).toBe('string')
})

test('proxy invariant: boxed string JSON.stringify works', () => {
  const { strJsonTest } = tosi({ strJsonTest: { str: 'hello' } })
  // Should not throw proxy invariant violation
  const result = JSON.stringify(strJsonTest.str)
  expect(result).toContain('h')
})

test('array mutations unwrap boxed values', () => {
  const { arrMutTest } = tosi({
    arrMutTest: { items: ['a'], str: 'b', num: 42, bool: true },
  })
  arrMutTest.items.push(arrMutTest.str)
  const raw = xinValue(arrMutTest.items)
  expect(typeof raw[1]).toBe('string')
  expect(raw[1]).toBe('b')
})

test('array mutations unwrap falsy boxed values', () => {
  const { falsyTest } = tosi({
    falsyTest: { items: [] as any[], zero: 0, empty: '', falseBool: false },
  })
  falsyTest.items.push(falsyTest.zero)
  falsyTest.items.push(falsyTest.empty)
  falsyTest.items.push(falsyTest.falseBool)
  const raw = xinValue(falsyTest.items)
  expect(raw[0]).toBe(0)
  expect(typeof raw[0]).toBe('number')
  expect(raw[1]).toBe('')
  expect(typeof raw[1]).toBe('string')
  expect(raw[2]).toBe(false)
  expect(typeof raw[2]).toBe('boolean')
})

test('array fill unwraps boxed values', () => {
  const { fillTest } = tosi({ fillTest: { items: [1, 2, 3], val: 99 } })
  fillTest.items.fill(fillTest.val)
  const raw = xinValue(fillTest.items)
  expect(raw).toEqual([99, 99, 99])
  expect(typeof raw[0]).toBe('number')
})

test('array splice unwraps boxed values', () => {
  const { spliceTest } = tosi({ spliceTest: { items: [1, 3], val: 2 } })
  spliceTest.items.splice(1, 0, spliceTest.val)
  const raw = xinValue(spliceTest.items)
  expect(raw).toEqual([1, 2, 3])
  expect(typeof raw[1]).toBe('number')
})

test('array unshift unwraps boxed values', () => {
  const { unshiftTest } = tosi({ unshiftTest: { items: ['b'], val: 'a' } })
  unshiftTest.items.unshift(unshiftTest.val)
  const raw = xinValue(unshiftTest.items)
  expect(raw).toEqual(['a', 'b'])
  expect(typeof raw[0]).toBe('string')
})

// Tests for boxed object/array API parity with BoxedScalar
test('boxed object new API - path property', () => {
  const { objPathTest } = tosi({ objPathTest: { nested: { deep: 'value' } } })
  expect(objPathTest.path).toBe('objPathTest')
  expect(objPathTest.nested.path).toBe('objPathTest.nested')
})

test('boxed object new API - value property', () => {
  const { objValueTest } = tosi({
    objValueTest: { nested: { a: 1, b: 2 } },
  })
  expect(objValueTest.value).toEqual({ nested: { a: 1, b: 2 } })
  expect(objValueTest.nested.value).toEqual({ a: 1, b: 2 })
})

test('boxed object new API - valueOf and toJSON methods', () => {
  const { objMethodsTest } = tosi({
    objMethodsTest: { data: { x: 10 } },
  })
  expect(objMethodsTest.valueOf()).toEqual({ data: { x: 10 } })
  expect(objMethodsTest.toJSON()).toEqual({ data: { x: 10 } })
  expect(objMethodsTest.data.valueOf()).toEqual({ x: 10 })
})

test('boxed object new API - observe method', async () => {
  const { objObserveTest } = tosi({ objObserveTest: { count: 0 } })
  let observed = false
  const unobserveFn = objObserveTest.observe(() => {
    observed = true
  })
  objObserveTest.count = 1
  await updates()
  expect(observed).toBe(true)
  unobserveFn()
})

test('boxed object new API - bind method', async () => {
  const { objBindTest2 } = tosi({ objBindTest2: { text: 'initial' } })
  const div = elements.div()
  document.body.append(div)
  // Bind to the text property specifically (matching how bindings work)
  objBindTest2.text.bind(div, {
    toDOM(element, value) {
      element.textContent = value
    },
  })
  await updates()
  expect(div.textContent).toBe('initial')
  objBindTest2.text = 'updated'
  await updates()
  expect(div.textContent).toBe('updated')
  div.remove()
})

test('boxed object new API - binding method', () => {
  const { objBindingTest2 } = tosi({ objBindingTest2: { val: 'test' } })
  const binding = objBindingTest2.binding({
    toDOM(element, value) {
      element.textContent = JSON.stringify(value)
    },
  })
  expect(binding.bind.value).toBe('objBindingTest2')
  expect(binding.bind.binding).toBeDefined()
})

test('boxed array new API - path property', () => {
  const { arrPathTest } = tosi({ arrPathTest: { items: [1, 2, 3] } })
  expect(arrPathTest.items.path).toBe('arrPathTest.items')
})

test('boxed array new API - value property', () => {
  const { arrValueTest } = tosi({ arrValueTest: { items: ['a', 'b'] } })
  expect(arrValueTest.items.value).toEqual(['a', 'b'])
})

test('boxed array new API - listBinding method', async () => {
  const { arrListBindTest } = tosi({
    arrListBindTest: { items: ['x', 'y', 'z'] },
  })
  const [props, template] = arrListBindTest.items.listBinding(({ li }, item) =>
    li(item)
  )
  expect(props.bindList).toBeDefined()
  expect(props.bindList.value).toBe('arrListBindTest.items')
  expect(template).toBeInstanceOf(HTMLTemplateElement)
})

test('listBinding with itemsPerRow generates multiple templates', () => {
  const { gridBindTest } = tosi({
    gridBindTest: { items: [{ id: 1, a: 'x', b: 'y' }] },
  })
  const [props, template] = gridBindTest.items.listBinding(
    ({ span }, item, columnIndex) => {
      const fields = [item.a, item.b]
      return span({ bindText: fields[columnIndex!] })
    },
    { idPath: 'id', virtual: { height: 30, itemsPerRow: 2 } }
  )
  expect(props.bindList).toBeDefined()
  expect(template).toBeInstanceOf(HTMLTemplateElement)
  expect(template.content.children.length).toBe(2)
})

test('boxed array new API - observe method', async () => {
  const { arrObserveTest } = tosi({ arrObserveTest: { items: [1] } })
  let observed = false
  const unobserveFn = arrObserveTest.items.observe(() => {
    observed = true
  })
  arrObserveTest.items.push(2)
  await updates()
  expect(observed).toBe(true)
  unobserveFn()
})

test('API consistency: scalar, object, and array all have same methods', () => {
  const { apiConsistencyTest } = tosi({
    apiConsistencyTest: {
      scalar: 'hello',
      obj: { a: 1 },
      arr: [1, 2, 3],
    },
  })

  // All should have path
  expect(typeof apiConsistencyTest.scalar.path).toBe('string')
  expect(typeof apiConsistencyTest.obj.path).toBe('string')
  expect(typeof apiConsistencyTest.arr.path).toBe('string')

  // All should have value
  expect(apiConsistencyTest.scalar.value).toBe('hello')
  expect(apiConsistencyTest.obj.value).toEqual({ a: 1 })
  expect(apiConsistencyTest.arr.value).toEqual([1, 2, 3])

  // All should have observe
  expect(typeof apiConsistencyTest.scalar.observe).toBe('function')
  expect(typeof apiConsistencyTest.obj.observe).toBe('function')
  expect(typeof apiConsistencyTest.arr.observe).toBe('function')

  // All should have bind
  expect(typeof apiConsistencyTest.scalar.bind).toBe('function')
  expect(typeof apiConsistencyTest.obj.bind).toBe('function')
  expect(typeof apiConsistencyTest.arr.bind).toBe('function')

  // All should have binding
  expect(typeof apiConsistencyTest.scalar.binding).toBe('function')
  expect(typeof apiConsistencyTest.obj.binding).toBe('function')
  expect(typeof apiConsistencyTest.arr.binding).toBe('function')

  // All should have listBinding
  expect(typeof apiConsistencyTest.scalar.listBinding).toBe('function')
  expect(typeof apiConsistencyTest.obj.listBinding).toBe('function')
  expect(typeof apiConsistencyTest.arr.listBinding).toBe('function')
})

// Tests for new tosiPath, tosiValue, tosiSetValue utilities

test('tosiPath returns path for scalars', () => {
  const { tosiPathScalar } = tosi({ tosiPathScalar: { count: 42 } })
  expect(tosiPath(tosiPathScalar.count)).toBe('tosiPathScalar.count')
})

test('tosiPath returns path for objects', () => {
  const { tosiPathObj } = tosi({ tosiPathObj: { nested: { a: 1 } } })
  expect(tosiPath(tosiPathObj.nested)).toBe('tosiPathObj.nested')
})

test('tosiPath returns path for arrays', () => {
  const { tosiPathArr } = tosi({ tosiPathArr: { items: [1, 2, 3] } })
  expect(tosiPath(tosiPathArr.items)).toBe('tosiPathArr.items')
})

test('tosiPath returns undefined for non-proxies', () => {
  const plainObj = { a: 1 }
  expect(tosiPath(plainObj)).toBeUndefined()
  expect(tosiPath(42)).toBeUndefined()
  expect(tosiPath('hello')).toBeUndefined()
  expect(tosiPath(null)).toBeUndefined()
  expect(tosiPath(undefined)).toBeUndefined()
})

test('tosiValue returns value for scalars', () => {
  const { tosiValueScalar } = tosi({ tosiValueScalar: { count: 42 } })
  expect(tosiValue(tosiValueScalar.count)).toBe(42)
})

test('tosiValue returns value for objects', () => {
  const original = { a: 1, b: 2 }
  const { tosiValueObj } = tosi({ tosiValueObj: { nested: original } })
  expect(tosiValue(tosiValueObj.nested)).toBe(original)
})

test('tosiValue returns value for arrays', () => {
  const original = [1, 2, 3]
  const { tosiValueArr } = tosi({ tosiValueArr: { items: original } })
  expect(tosiValue(tosiValueArr.items)).toBe(original)
})

test('tosiValue passes through non-proxies', () => {
  const plainObj = { a: 1 }
  expect(tosiValue(plainObj)).toBe(plainObj)
  expect(tosiValue(42)).toBe(42)
  expect(tosiValue('hello')).toBe('hello')
  expect(tosiValue(null)).toBe(null)
  expect(tosiValue(undefined)).toBe(undefined)
})

test('tosiValue handles falsy values correctly', () => {
  const { tosiValueFalsy } = tosi({
    tosiValueFalsy: { zero: 0, empty: '', bool: false },
  })
  expect(tosiValue(tosiValueFalsy.zero)).toBe(0)
  expect(tosiValue(tosiValueFalsy.empty)).toBe('')
  expect(tosiValue(tosiValueFalsy.bool)).toBe(false)
})

test('tosiSetValue replaces array value', async () => {
  const { tosiSetArr } = tosi({ tosiSetArr: { items: [1, 2, 3] } })
  const newArray = [4, 5, 6]
  tosiSetValue(tosiSetArr.items, newArray)
  await updates()
  expect(tosiValue(tosiSetArr.items)).toEqual([4, 5, 6])
})

test('tosiSetValue replaces object value', async () => {
  const { tosiSetObj } = tosi({ tosiSetObj: { data: { a: 1 } } })
  const newObj = { b: 2 }
  tosiSetValue(tosiSetObj.data, newObj)
  await updates()
  expect(tosiValue(tosiSetObj.data)).toEqual({ b: 2 })
})

test('tosiSetValue triggers observers', async () => {
  const { tosiSetObs } = tosi({ tosiSetObs: { items: [1] } })
  let observed = false
  const unsub = tosiSetObs.items.observe(() => {
    observed = true
  })
  tosiSetValue(tosiSetObs.items, [2, 3])
  await updates()
  expect(observed).toBe(true)
  unsub()
})

test('tosiSetValue throws for non-proxies', () => {
  const plainObj = { a: 1 }
  expect(() => tosiSetValue(plainObj, { b: 2 })).toThrow(
    'tosiSetValue requires a xin or boxed proxy'
  )
})

// Tests for symbol-based API (XIN_VALUE and XIN_PATH are now symbols)

test('XIN_VALUE symbol returns value for scalars', () => {
  const { symScalar } = tosi({ symScalar: { count: 42 } })
  expect(symScalar.count[XIN_VALUE]).toBe(42)
})

test('XIN_VALUE symbol returns value for objects', () => {
  const original = { a: 1 }
  const { symObj } = tosi({ symObj: { nested: original } })
  expect(symObj.nested[XIN_VALUE]).toBe(original)
})

test('XIN_VALUE symbol returns value for arrays', () => {
  const original = [1, 2, 3]
  const { symArr } = tosi({ symArr: { items: original } })
  expect(symArr.items[XIN_VALUE]).toBe(original)
})

test('XIN_PATH symbol returns path for scalars', () => {
  const { symPathScalar } = tosi({ symPathScalar: { count: 42 } })
  expect(symPathScalar.count[XIN_PATH]).toBe('symPathScalar.count')
})

test('XIN_PATH symbol returns path for objects', () => {
  const { symPathObj } = tosi({ symPathObj: { nested: { a: 1 } } })
  expect(symPathObj.nested[XIN_PATH]).toBe('symPathObj.nested')
})

test('XIN_PATH symbol returns path for arrays', () => {
  const { symPathArr } = tosi({ symPathArr: { items: [1, 2, 3] } })
  expect(symPathArr.items[XIN_PATH]).toBe('symPathArr.items')
})

test('XIN_VALUE symbol setter replaces value', async () => {
  const { symSetArr } = tosi({ symSetArr: { items: [1, 2, 3] } })
  symSetArr.items[XIN_VALUE] = [4, 5, 6]
  await updates()
  expect(tosiValue(symSetArr.items)).toEqual([4, 5, 6])
})

test('symbol API works on objects with value/path properties', () => {
  // This is the key use case: objects that have 'value' or 'path' as actual properties
  const { symShadow } = tosi({
    symShadow: {
      config: { value: 100, path: '/home/user' },
    },
  })

  // String properties return the actual object properties
  expect(symShadow.config.value.value).toBe(100)
  expect(symShadow.config.path.value).toBe('/home/user')

  // Symbol properties return the proxy metadata
  expect(symShadow.config[XIN_PATH]).toBe('symShadow.config')
  expect(symShadow.config[XIN_VALUE]).toEqual({
    value: 100,
    path: '/home/user',
  })
})

test('id-path touch synthesis', async () => {
  // This tests that when an array has a registered idPath, touching via
  // index also triggers observers on the id-path (used by list bindings)
  const { idPathTest } = tosi({
    idPathTest: {
      list: [
        { id: 1, name: 'foo', color: 'red' },
        { id: 16, name: 'bar', color: 'green' },
        { id: 65, name: 'baz', color: 'blue' },
      ],
    },
  })

  // Import and register the idPath (simulating what ListBinding does)
  const { registerArrayIdPath, unregisterArrayIdPath } = await import(
    './metadata'
  )
  registerArrayIdPath('idPathTest.list', 'id')

  await resetChanges()

  // Observer on id-path notation (like list bindings use)
  const idPathChanges: string[] = []
  const idPathListener = observe(
    (path) => path.startsWith('idPathTest.list[id='),
    (path) => {
      idPathChanges.push(path)
    }
  )

  // Observer on index notation
  const indexChanges: string[] = []
  const indexListener = observe(
    (path) => /^idPathTest\.list\[\d+\]/.test(path),
    (path) => {
      indexChanges.push(path)
    }
  )

  // Touch via index (this is how proxy setters work) - should also trigger id-path observer
  idPathTest.list[0].color = 'orange'
  await updates()

  expect(indexChanges.length).toBe(1)
  expect(indexChanges[0]).toBe('idPathTest.list[0].color')
  expect(idPathChanges.length).toBe(1)
  expect(idPathChanges[0]).toBe('idPathTest.list[id=1].color')

  // Test second item
  indexChanges.length = 0
  idPathChanges.length = 0

  idPathTest.list[1].name = 'updated bar'
  await updates()

  expect(indexChanges.length).toBe(1)
  expect(indexChanges[0]).toBe('idPathTest.list[1].name')
  expect(idPathChanges.length).toBe(1)
  expect(idPathChanges[0]).toBe('idPathTest.list[id=16].name')

  unobserve(idPathListener)
  unobserve(indexListener)

  // Clean up
  unregisterArrayIdPath('idPathTest.list', 'id')
})

test('array find/findLast/at return proxied objects', async () => {
  // Array methods that return items by reference should return proxied objects
  // so that mutations go through the correct path
  const { proxyMethodTest } = tosi({
    proxyMethodTest: {
      items: [
        { id: 'a', score: 10 },
        { id: 'b', score: 20 },
        { id: 'c', score: 30 },
      ],
    },
  })

  const changes: string[] = []
  const listener = observe(
    (path) => path.startsWith('proxyMethodTest.items'),
    (path) => {
      changes.push(path)
    }
  )
  await updates()

  // Test find() returns a proxied object
  // With tosi(), scalar properties are boxed - use .value to get/set
  const foundB = proxyMethodTest.items.find((item: any) => item.id === 'b')
  expect(foundB).toBeDefined()
  expect(foundB.id.value).toBe('b')
  expect(foundB.score.value).toBe(20)

  // Check that tosiPath works on the found item
  expect(tosiPath(foundB)).toBe('proxyMethodTest.items[1]')

  // Mutate via the found proxy's boxed scalar - this should trigger observers
  foundB.score.value = 25
  await updates()
  expect(changes).toContain('proxyMethodTest.items[1].score')
  expect(proxyMethodTest.items[1].score.value).toBe(25)
  changes.length = 0

  // Test findLast() returns a proxied object
  const lastGreaterThan15 = proxyMethodTest.items.findLast(
    (item: any) => item.score > 15
  )
  expect(lastGreaterThan15).toBeDefined()
  expect(lastGreaterThan15.id.value).toBe('c')
  expect(tosiPath(lastGreaterThan15)).toBe('proxyMethodTest.items[2]')

  lastGreaterThan15.score.value = 35
  await updates()
  expect(changes).toContain('proxyMethodTest.items[2].score')
  expect(proxyMethodTest.items[2].score.value).toBe(35)
  changes.length = 0

  // Test at() returns a proxied object
  const first = proxyMethodTest.items.at(0)
  expect(first).toBeDefined()
  expect(first.id.value).toBe('a')
  expect(tosiPath(first)).toBe('proxyMethodTest.items[0]')

  first.score.value = 15
  await updates()
  expect(changes).toContain('proxyMethodTest.items[0].score')
  expect(proxyMethodTest.items[0].score.value).toBe(15)
  changes.length = 0

  // Test at() with negative index
  const last = proxyMethodTest.items.at(-1)
  expect(last).toBeDefined()
  expect(last.id.value).toBe('c')
  expect(tosiPath(last)).toBe('proxyMethodTest.items[2]')

  last.score.value = 40
  await updates()
  expect(changes).toContain('proxyMethodTest.items[2].score')
  expect(proxyMethodTest.items[2].score.value).toBe(40)

  unobserve(listener)
})

test('observer callback touches are not lost', (done) => {
  // When an observer callback sets state (touching a new path), the new
  // touch schedules a fresh update cycle instead of being silently dropped.
  const { cascadeSource, cascadeTarget } = tosi({
    cascadeSource: { trigger: 'off' },
    cascadeTarget: { result: 'initial' },
  })

  // Observer on source that sets target state
  const unsub1 = cascadeSource.observe(() => {
    cascadeTarget.result.value =
      cascadeSource.trigger.value === 'on' ? 'activated' : 'deactivated'
  })

  let targetObserved = false
  const unsub2 = cascadeTarget.observe(() => {
    targetObserved = true
  })

  // Trigger: source observer fires, sets target, which schedules a second cycle
  cascadeSource.trigger.value = 'on'

  // After enough time for both cycles to complete
  setTimeout(() => {
    expect(cascadeTarget.result.value).toBe('activated')
    expect(targetObserved).toBe(true)
    unsub1()
    unsub2()
    done()
  }, 50)
})

// .take() tests

test('take returns a TakeDescriptor with correct shape', () => {
  const { takeShapeTest } = tosi({
    takeShapeTest: { count: 5, label: 'hello' },
  })

  const desc = takeShapeTest.count.tosi.take((v: number) => v * 2)
  expect(desc[TAKE_DESCRIPTOR]).toBe(true)
  expect(desc.paths).toEqual(['takeShapeTest.count'])
  expect(typeof desc.transform).toBe('function')
  expect(desc.transform(5)).toBe(10)
})

test('take multi-path returns descriptor with all paths', () => {
  const { takeMultiTest } = tosi({
    takeMultiTest: { items: [1, 2, 3], filter: 'odd' },
  })

  const desc = takeMultiTest.items.tosi.take(
    takeMultiTest.filter,
    (items: number[], filter: string) =>
      filter === 'odd' ? items.filter((n) => n % 2) : items
  )
  expect(desc[TAKE_DESCRIPTOR]).toBe(true)
  expect(desc.paths).toEqual(['takeMultiTest.items', 'takeMultiTest.filter'])
  expect(desc.transform([1, 2, 3], 'odd')).toEqual([1, 3])
})

test('take with bindText updates DOM on state change', async () => {
  const { takeBindTest } = tosi({
    takeBindTest: { count: 3 },
  })

  const span = elements.span({ bindText: takeBindTest.count.tosi.take((n: number) => `Count: ${n}`) })
  document.body.append(span)
  await updates()

  expect(span.textContent).toBe('Count: 3')

  takeBindTest.count.value = 7
  await updates()

  expect(span.textContent).toBe('Count: 7')
  span.remove()
})

test('take with bindEnabled inverts boolean', async () => {
  const { takeEnabledTest } = tosi({
    takeEnabledTest: { items: [] as string[] },
  })

  const btn = elements.button('Delete', {
    bindEnabled: takeEnabledTest.items.tosi.take((list: string[]) => list.length > 0),
  })
  document.body.append(btn)
  await updates()

  expect(btn.disabled).toBe(true)

  takeEnabledTest.items.push('item1')
  touch(takeEnabledTest.items)
  await updates()

  expect(btn.disabled).toBe(false)
  btn.remove()
})

test('take multi-path binding reacts to any path change', async () => {
  const { takeMultiBindTest } = tosi({
    takeMultiBindTest: { firstName: 'Alice', lastName: 'Smith' },
  })

  const span = elements.span({
    bindText: takeMultiBindTest.firstName.tosi.take(
      takeMultiBindTest.lastName,
      (first: string, last: string) => `${first} ${last}`
    ),
  })
  document.body.append(span)
  await updates()

  expect(span.textContent).toBe('Alice Smith')

  takeMultiBindTest.lastName.value = 'Jones'
  await updates()

  expect(span.textContent).toBe('Alice Jones')

  takeMultiBindTest.firstName.value = 'Bob'
  await updates()

  expect(span.textContent).toBe('Bob Jones')
  span.remove()
})

test('take deduplicates — transform skipped when inputs unchanged', async () => {
  const { takeDedupTest } = tosi({
    takeDedupTest: { value: 'hello', other: 'world' },
  })

  let transformCallCount = 0
  const span = elements.span({
    bindText: takeDedupTest.value.tosi.take((v: string) => {
      transformCallCount++
      return v.toUpperCase()
    }),
  })
  document.body.append(span)
  await updates()

  const initialCalls = transformCallCount
  expect(span.textContent).toBe('HELLO')

  // Touch the same path without changing the value
  touch(takeDedupTest.value)
  await updates()

  // Transform should not have run again (same input)
  expect(transformCallCount).toBe(initialCalls)
  expect(span.textContent).toBe('HELLO')

  // Now actually change the value
  takeDedupTest.value.value = 'world'
  await updates()

  expect(transformCallCount).toBe(initialCalls + 1)
  expect(span.textContent).toBe('WORLD')
  span.remove()
})

// Bare proxy property binding tests

test('bare proxy binds to textContent', async () => {
  const { barePropTest } = tosi({
    barePropTest: { label: 'hello' },
  })

  const span = elements.span({ textContent: barePropTest.label })
  document.body.append(span)
  await updates()

  expect(span.textContent).toBe('hello')

  barePropTest.label.value = 'world'
  await updates()

  expect(span.textContent).toBe('world')
  span.remove()
})

test('bare proxy binds to disabled', async () => {
  const { bareDisabledTest } = tosi({
    bareDisabledTest: { isDisabled: true },
  })

  const btn = elements.button('Click', { disabled: bareDisabledTest.isDisabled })
  document.body.append(btn)
  await updates()

  expect(btn.disabled).toBe(true)

  bareDisabledTest.isDisabled.value = false
  await updates()

  expect(btn.disabled).toBe(false)
  btn.remove()
})

test('take descriptor works as bare property binding', async () => {
  const { bareTakeTest } = tosi({
    bareTakeTest: { items: ['a', 'b', 'c'] },
  })

  const btn = elements.button('Delete', {
    disabled: bareTakeTest.items.tosi.take((list: string[]) => list.length === 0),
  })
  document.body.append(btn)
  await updates()

  expect(btn.disabled).toBe(false)

  bareTakeTest.items.value = []
  await updates()

  expect(btn.disabled).toBe(true)
  btn.remove()
})
