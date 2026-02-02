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
import { elements } from './elements'
import {
  XIN_VALUE,
  XIN_PATH,
  xinPath,
  xinValue,
  tosiPath,
  tosiValue,
  tosiSetValue,
} from './metadata'

type Change = { path: string; value: any; observed?: any }
const changes: Change[] = []
const recordChange = (change: Change) => {
  changes.push(change)
}
async function resetChanges() {
  await updates()
  changes.splice(0)
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
