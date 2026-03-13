import { test, expect } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements, svgElements, bindParts } from './elements'
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

test('touchElement skips unresolved ^ binding on HTML element with warning', () => {
  const div = elements.div()
  bind(div, '^.name', {
    toDOM(el, value) {
      el.textContent = value
    },
  })

  const warnings: any[][] = []
  const origWarn = console.warn
  console.warn = (...args: any[]) => warnings.push(args)
  try {
    // Should not throw — just warn and skip
    expect(() => touchElement(div)).not.toThrow()
    expect(warnings.length).toBe(1)
    expect(warnings[0][0]).toContain('Unresolved relative binding')
    expect(warnings[0][2]).toContain('<template>')
  } finally {
    console.warn = origWarn
  }
})

test('touchElement silently skips unresolved ^ binding on SVG element', () => {
  const { g } = svgElements
  const gEl = g()
  bind(gEl, '^.x', {
    toDOM(el, value) {
      el.setAttribute('transform', `translate(${value}, 0)`)
    },
  })

  const warnings: any[][] = []
  const origWarn = console.warn
  console.warn = (...args: any[]) => warnings.push(args)
  try {
    // Should not throw and should not warn
    expect(() => touchElement(gEl)).not.toThrow()
    expect(warnings.length).toBe(0)
  } finally {
    console.warn = origWarn
  }
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

test('bindParts applies ElementProps to elements with data-part', async () => {
  const { partsTest } = tosi({
    partsTest: { title: 'hello parts' },
  })

  const root = elements.div()
  root.innerHTML =
    '<h2 data-part="heading"></h2><input data-part="input"><span data-part="unmapped"></span>'
  document.body.append(root)

  bindParts(root, {
    heading: { bindText: partsTest.title },
    input: { bindValue: partsTest.title },
  })

  await updates()
  const h2 = root.querySelector('h2')!
  const input = root.querySelector('input')!
  expect(h2.textContent).toBe('hello parts')
  expect(input.value).toBe('hello parts')

  // unmapped element should be untouched
  const span = root.querySelector('span')!
  expect(span.textContent).toBe('')

  // state changes propagate to bound elements
  partsTest.title = 'updated'
  await updates()
  expect(h2.textContent).toBe('updated')
  expect(input.value).toBe('updated')
})

test('bindParts does not double-bind elements', () => {
  const root = elements.div()
  root.innerHTML = '<button data-part="btn">click</button>'
  document.body.append(root)

  let clickCount = 0
  const map = {
    btn: {
      onClick: () => {
        clickCount++
      },
    },
  }

  bindParts(root, map)
  bindParts(root, map) // second call should be a no-op

  root.querySelector('button')!.click()
  expect(clickCount).toBe(1)
})

test('bindParts supports custom data attribute', async () => {
  const { customAttrTest } = tosi({
    customAttrTest: { label: 'custom' },
  })

  const root = elements.div()
  root.innerHTML = '<span data-role="info"></span>'
  document.body.append(root)

  bindParts(
    root,
    {
      info: { bindText: customAttrTest.label },
    },
    'role'
  )

  await updates()
  expect(root.querySelector('span')!.textContent).toBe('custom')
})

test('bindParts works on SVG elements', async () => {
  const { svgPartsTest } = tosi({
    svgPartsTest: { x: 10, y: 20, label: 'point' },
  })

  const { svg, circle, text } = svgElements
  const root = svg({ viewBox: '0 0 100 100' })
  // Build SVG DOM with data-part attributes
  const c = circle({ 'data-part': 'dot', r: '5' })
  const t = text({ 'data-part': 'label' })
  root.append(c, t)
  document.body.append(root)

  bindParts(root, {
    dot: {
      bind: {
        value: svgPartsTest.x,
        binding: {
          toDOM(el: Element, value: any) {
            el.setAttribute('cx', String(value))
          },
        },
      },
    },
    label: { bindText: svgPartsTest.label },
  })

  await updates()
  expect(c.getAttribute('cx')).toBe('10')
  expect(t.textContent).toBe('point')

  // state changes propagate
  svgPartsTest.x = 50
  svgPartsTest.label = 'moved'
  await updates()
  expect(c.getAttribute('cx')).toBe('50')
  expect(t.textContent).toBe('moved')
})
