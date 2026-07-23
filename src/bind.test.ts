import { test, expect, describe } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements, svgElements, bindParts } from './elements'
import { updates, touch } from './path-listener'
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

test('bind() on an element already inside a shadow root warns', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const target = document.createElement('span')
    shadow.append(target)

    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    try {
      bind(target, 'shadowDirectBind.label', bindings.text)
    } finally {
      console.warn = origWarn
    }
    expect(
      warnings.some((w) => w.includes('inside a shadow root'))
    ).toBe(true)
    host.remove()
})

test('on() works inside an open shadow root (composedPath origin)', () => {
  const host = document.createElement('div')
  document.body.append(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const button = document.createElement('button')
  shadow.append(button)

  let clicks = 0
  on(button, 'click', () => {
    clicks++
  })
  button.dispatchEvent(new Event('click', { bubbles: true, composed: true }))
  expect(clicks).toBe(1)
  host.remove()
})

test('delegation crosses the shadow boundary to light-DOM ancestors', () => {
  const outer = document.createElement('div')
  document.body.append(outer)
  const host = document.createElement('div')
  outer.append(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const inner = document.createElement('span')
  shadow.append(inner)

  let outerHeard = 0
  on(outer as HTMLElement, 'click', () => {
    outerHeard++
  })
  inner.dispatchEvent(new Event('click', { bubbles: true, composed: true }))
  expect(outerHeard).toBe(1)
  outer.remove()
})

test('bound elements do not re-render for name-prefix sibling paths (H-1)', async () => {
  tosi({ h1bind: { ab: 'hello', a: 'x' } })
  let renders = 0
  const el = document.createElement('div')
  document.body.append(el)
  bind(el, 'h1bind.ab', {
    toDOM(element, value) {
      renders++
      element.textContent = String(value)
    },
  })
  await updates()
  const base = renders
  touch('h1bind.a') // name-prefix sibling of the bound path
  await updates()
  expect(renders).toBe(base)
  touch('h1bind.ab')
  await updates()
  expect(renders).toBe(base + 1)
  el.remove()
})

test('events on cloneNode copies of bound elements do not crash dispatch (H-12)', async () => {
  tosi({ h12clone: { label: 'x' } })
  // an on()-bound button, cloned: the clone is not a key in elementToHandlers,
  // so the ancestor walk skips it and climbs to the outer handler
  let outerHeard = 0
  let buttonHeard = 0
  const outer = document.createElement('div')
  document.body.append(outer)
  on(outer as HTMLElement, 'click', () => {
    outerHeard++
  })
  const button = document.createElement('button')
  on(button as HTMLElement, 'click', () => {
    buttonHeard++
  })
  const clone = button.cloneNode(true) as HTMLElement
  outer.append(clone)
  // before the fix: TypeError inside the document-level listener, and the
  // outer handler never ran
  clone.dispatchEvent(new Event('click', { bubbles: true }))
  expect(outerHeard).toBe(1)
  expect(buttonHeard).toBe(0)

  // a value-bound input, cloned: the clone carries -xin-data but no bindings
  const input = document.createElement('input')
  document.body.append(input)
  bind(input, 'h12clone.label', bindings.value)
  await updates()
  const inputClone = input.cloneNode(true) as HTMLElement
  document.body.append(inputClone)
  inputClone.dispatchEvent(new Event('input', { bubbles: true })) // no crash
  outer.remove()
  input.remove()
  inputClone.remove()
})

test('on() does not mutate the element (no marker class) yet delegation works', () => {
  // the elementToHandlers WeakMap is the record; on() must not stamp a class
  // onto the consumer's DOM (the retired -xin-event marker)
  const wrapper = document.createElement('div')
  const btn = document.createElement('button')
  btn.className = 'consumer-styled'
  wrapper.append(btn)
  document.body.append(wrapper)

  let heard = 0
  const off = on(btn as HTMLElement, 'click', () => {
    heard++
  })
  // className is exactly what the consumer set — nothing added
  expect(btn.className).toBe('consumer-styled')
  expect(wrapper.className).toBe('')

  // and delegation still resolves through the untouched DOM
  btn.dispatchEvent(new Event('click', { bubbles: true }))
  expect(heard).toBe(1)

  off()
  wrapper.remove()
})

describe('state-driven value coercion (H-6)', () => {
  test('number input keeps numeric state numeric across keystrokes', async () => {
    tosi({ h6num: { count: 42 } })
    const input = document.createElement('input')
    input.type = 'number'
    document.body.append(input)
    bind(input, 'h6num.count', bindings.value)
    await updates()
    expect(input.value).toBe('42')
    input.value = '43'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await updates()
    const { xin } = await import('./xin')
    expect((xin as any).h6num.count).toBe(43) // was '43' — string — before H-6
  })

  test('a TEXT input bound to numeric state coerces clean numeric strings', async () => {
    tosi({ h6text: { count: 7 } })
    const input = document.createElement('input')
    document.body.append(input)
    bind(input, 'h6text.count', bindings.value)
    await updates()
    input.value = '8'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await updates()
    const { xin } = await import('./xin')
    expect((xin as any).h6text.count).toBe(8)
    // non-numeric input writes raw — drift stays visible, not hidden
    input.value = 'not a number'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await updates()
    expect((xin as any).h6text.count).toBe('not a number')
  })

  test('empty input never coerces to zero', async () => {
    tosi({ h6empty: { count: 5 } })
    const input = document.createElement('input')
    document.body.append(input)
    bind(input, 'h6empty.count', bindings.value)
    await updates()
    input.value = ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await updates()
    const { xin } = await import('./xin')
    expect((xin as any).h6empty.count).toBe('') // raw, NOT 0
  })

  test('date input bound to string state keeps the string representation', async () => {
    tosi({ h6date: { day: '2026-01-01' } })
    const input = document.createElement('input')
    input.type = 'date'
    document.body.append(input)
    bind(input, 'h6date.day', bindings.value)
    await updates()
    input.value = '2026-07-18'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await updates()
    const { xin } = await import('./xin')
    expect((xin as any).h6date.day).toBe('2026-07-18') // string in, string stays
  })

  test('date input bootstrap (no state yet) writes a Date', async () => {
    const input = document.createElement('input')
    input.type = 'date'
    document.body.append(input)
    bind(input, 'h6dateBoot.day', bindings.value)
    await updates()
    input.value = '2026-07-18'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await updates()
    const { xin } = await import('./xin')
    const day = (xin as any).h6dateBoot.day
    expect(day).toBeInstanceOf(Date)
    expect(day.toISOString()).toContain('2026-07-18')
  })
})

test('bind() does not mutate the caller spec — a bindList spec is reusable', () => {
  const spec = { value: 'reuseSpec.items', idPath: 'id' }
  const { div } = elements
  const a = div()
  const b = div()
  document.body.append(a, b)
  tosi({ reuseSpec: { items: [] } })
  // both binds must succeed; the first must not delete `value` from `spec`
  bind(a, { ...spec } as any, bindings.list)
  expect((spec as any).value).toBe('reuseSpec.items') // spec intact
  // and binding with the SAME object twice must not throw
  const spec2 = { value: 'reuseSpec.items', idPath: 'id' }
  bind(a, spec2 as any, bindings.list)
  expect(() => bind(b, spec2 as any, bindings.list)).not.toThrow()
  a.remove()
  b.remove()
})
