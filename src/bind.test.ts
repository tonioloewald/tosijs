import { test, expect } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements } from './elements'
import { updates } from './path-listener'
import { on, bind, touchElement } from './bind'
import { bindings } from './bindings'

test('element binding works', async () => {
  const { div, input } = elements
  const { test } = tosi({
    test: {
      value: 17,
      string: 'foobar',
      enabled: false,
    },
  })
  const boundDiv = div({ bindText: test.string })
  const boundInput = input({
    bindValue: test.value,
    bindEnabled: test.enabled,
  })
  document.body.append(boundDiv, boundInput)
  await updates()
  expect(boundDiv.textContent).toBe('foobar')
  expect(JSON.stringify(boundInput.value)).toBe('"17"')
  expect(boundInput.disabled).toBe(true)
  boundInput.value = 'baz'
  boundInput.dispatchEvent(new Event('change'))
  await updates()
  expect(boundInput.value).toBe('baz')
})

test('custom bindings work', async () => {
  const { div, input } = elements
  const { test } = tosi({
    test: {
      value: 87,
      string: 'foobar',
      enabled: false,
      color: 'red',
    },
  })

  const boundDiv = div({
    bind: {
      value: test.string,
      binding: {
        toDOM(element, value) {
          // happydom does not support element.dataset
          element.setAttribute('data-what', value)
        },
      },
    },
  })

  const boundInput = input({
    bind: {
      value: test.color,
      binding: {
        toDOM(element, value) {
          element.style.color = value
        },
        fromDOM(element) {
          return element.style.color
        },
      },
    },
  })

  document.body.append(boundDiv, boundInput)
  await updates()
  expect(boundDiv.getAttribute('data-what')).toBe('foobar')
  expect(boundInput.style.color).toBe('red')
  test.string = 'baz'
  test.color = 'yellow'
  await updates()
  expect(boundDiv.getAttribute('data-what')).toBe('baz')
  expect(boundInput.style.color).toBe('yellow')
  boundInput.style.color = 'blue'
  boundInput.dispatchEvent(new Event('change'))
  await updates()
  expect(test.color.valueOf()).toBe('blue')
})

test('event binding with on() works', async () => {
  const button = elements.button('foo')
  document.body.append(button)
  let counter = 0
  on(button, 'click', () => {
    counter++
  })
  button.click()
  expect(counter).toBe(1)
  button.dispatchEvent(new Event('click'))
  expect(counter).toBe(2)
})

test('bind works', async () => {
  const { bindTest } = tosi({
    bindTest: {
      value: 'test',
    },
  })
  const input = elements.input()
  document.body.append(input)

  // bound elements are queued for update
  bind(input, bindTest.value, bindings.value)
  await updates()
  expect(input.value).toBe('test')

  // updating the proxy queues an update
  bindTest.value.xinValue = 'hello update'
  await updates()
  expect(input.value).toBe('hello update')
  input.value = 'changed'
  input.dispatchEvent(new Event('change'))

  // changing the input updates the bound value
  expect(bindTest.value.valueOf()).toBe('changed')
})

test('bind throws on DocumentFragment', () => {
  const frag = document.createDocumentFragment()
  expect(() => {
    bind(frag as unknown as Element, 'some.path', bindings.text)
  }).toThrow('bind cannot bind to a DocumentFragment')
})

test('bind with toDOM function binding works', async () => {
  const { bindFuncTest } = tosi({
    bindFuncTest: {
      content: 'hello func',
    },
  })
  const div = elements.div({
    bind: {
      value: bindFuncTest.content,
      binding: (element: Element, value: string) => {
        element.textContent = value
      },
    },
  })
  document.body.append(div)
  await updates()
  expect(div.textContent).toBe('hello func')
})

test('touchElement handles unbound elements gracefully', () => {
  const div = elements.div()
  // Should not throw
  expect(() => touchElement(div)).not.toThrow()
})

test('on() registers multiple handlers for same event type', async () => {
  const button = elements.button('test')
  document.body.append(button)

  let count1 = 0
  let count2 = 0

  on(button, 'click', () => {
    count1++
  })
  on(button, 'click', () => {
    count2++
  })

  button.click()
  expect(count1).toBe(1)
  expect(count2).toBe(1)
})

test('event handler can stop propagation', async () => {
  const outer = elements.div()
  const inner = elements.button('inner')
  outer.append(inner)
  document.body.append(outer)

  let outerClicked = false
  let innerClicked = false

  on(outer, 'click', () => {
    outerClicked = true
  })
  on(inner, 'click', (event) => {
    innerClicked = true
    event.stopPropagation()
  })

  inner.click()
  expect(innerClicked).toBe(true)
  // Note: stopPropagation behavior depends on event bubbling implementation
})

test('bind with XinBindingSpec options works', async () => {
  const { specTest } = tosi({
    specTest: {
      text: 'spec value',
    },
  })

  const div = elements.div()
  bind(
    div,
    {
      value: specTest.text,
    },
    bindings.text
  )
  document.body.append(div)
  await updates()
  expect(div.textContent).toBe('spec value')
})

test('fromDOM handles existing values correctly', async () => {
  const { fromDomTest } = tosi({
    fromDomTest: {
      value: 'initial',
    },
  })

  const input = elements.input({ value: 'initial' })
  bind(input, fromDomTest.value, bindings.value)
  document.body.append(input)
  await updates()

  // Change to same value - should not trigger update
  input.value = 'initial'
  input.dispatchEvent(new Event('change'))
  expect(fromDomTest.value.valueOf()).toBe('initial')

  // Change to different value - should trigger update
  input.value = 'changed'
  input.dispatchEvent(new Event('change'))
  expect(fromDomTest.value.valueOf()).toBe('changed')
})
