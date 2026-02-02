import { test, expect } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements, svgElements, mathML } from './elements'
import { updates } from './path-listener'

test('element creation works', () => {
  const { div, input } = elements
  expect(div().tagName).toBe('DIV')
  expect(input({ value: 17 }).value).toBe('17')
})

test('element attributes work', () => {
  const { div } = elements
  expect(div({ dataFoo: 'bar' }).dataset.foo).toBe('bar')
  expect(div({ id: 'whatevs' }).id).toBe('whatevs')
})

test('data binding works', async () => {
  const { test } = tosi({
    test: {
      value: 'hello world',
    },
  })

  expect(test.value.valueOf()).toBe('hello world')

  const div = elements.div({ bindText: test.value })
  document.body.append(div)

  await updates()
  expect(div.textContent).toBe('hello world')
})

test('event binding works', async () => {
  const { test } = tosi({
    test: {
      count: 0,
      handler() {
        // @ts-expect-error tsc is stupid
        test.count += 1
      },
    },
  })

  test.handler()
  expect(test.count.valueOf()).toBe(1)

  const button = elements.button({ onClick: test.handler })
  document.body.append(button)
  button.click()
  expect(test.count.valueOf()).toBe(2)

  button.remove()
})

test('style binding works', async () => {
  const div = elements.div({
    style: {
      _fooBar: '17px',
      __barBaz: 'green',
      textAlign: 'center',
    },
  })

  expect(div.style.textAlign).toBe('center')
  expect(div.style.getPropertyValue('--foo-bar')).toBe('17px')
  expect(div.style.getPropertyValue('--bar-baz')).toBe(
    'var(--bar-baz-default, green)'
  )
})

test('svgElements creates SVG elements', () => {
  const { circle, rect, svg } = svgElements
  const svgEl = svg()
  const circleEl = circle({ cx: '50', cy: '50', r: '40' })
  const rectEl = rect({ width: '100', height: '100' })

  expect(svgEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(circleEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(rectEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(circleEl.getAttribute('cx')).toBe('50')
})

test('mathML creates MathML elements', () => {
  const { math, mi, mn } = mathML
  const mathEl = math()
  const miEl = mi('x')
  const mnEl = mn('2')

  expect(mathEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
  expect(miEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
  expect(mnEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
})

test('class attribute handles space-separated classes', () => {
  const div = elements.div({ class: 'foo bar baz' })
  expect(div.classList.contains('foo')).toBe(true)
  expect(div.classList.contains('bar')).toBe(true)
  expect(div.classList.contains('baz')).toBe(true)
})

test('boolean attributes work correctly', () => {
  const { input, button } = elements
  const disabledInput = input({ disabled: true })
  const enabledInput = input({ disabled: false })
  const checkedInput = input({ type: 'checkbox', checked: true })

  expect(disabledInput.hasAttribute('disabled')).toBe(true)
  expect(enabledInput.hasAttribute('disabled')).toBe(false)
  expect(checkedInput.checked).toBe(true)
})

test('elements proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    elements.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('svgElements proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    svgElements.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('mathML proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    mathML.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('style as string attribute works', () => {
  const div = elements.div({ style: 'color: red; font-size: 12px' })
  expect(div.getAttribute('style')).toBe('color: red; font-size: 12px')
})

test('template element appends to content', () => {
  const { template, div } = elements
  const tmpl = template(div('inside template'))

  expect(tmpl.content.children.length).toBe(1)
  expect(tmpl.content.children[0].tagName).toBe('DIV')
})

test('fragment creates DocumentFragment', () => {
  const { fragment, div, span } = elements
  const frag = fragment(div('first'), span('second'))

  expect(frag).toBeInstanceOf(DocumentFragment)
  expect(frag.children.length).toBe(2)
})

test('camelCase tag names convert to kebab-case', () => {
  const { myCustomElement } = elements
  const el = myCustomElement()
  expect(el.tagName.toLowerCase()).toBe('my-custom-element')
})

// Test for observedAttributes handling (third-party web component compatibility)
test('respects observedAttributes for web components with undefined properties', () => {
  // Pathological web component: declares observedAttributes but property is undefined
  class PathologicalComponent extends HTMLElement {
    static observedAttributes = ['my-attr', 'another-attr']

    // Properties start undefined (bad practice, but common in the wild)
    myAttr: string | undefined
    anotherAttr: string | undefined

    attributeChangedCallback(name: string, _old: string, value: string) {
      if (name === 'my-attr') this.myAttr = value
      if (name === 'another-attr') this.anotherAttr = value
    }
  }

  customElements.define('pathological-component', PathologicalComponent)

  const { pathologicalComponent } = elements
  const el = pathologicalComponent({
    myAttr: 'test-value',
    anotherAttr: 'another-value',
  }) as PathologicalComponent

  // Should have set attributes, not tried to set undefined properties
  expect(el.getAttribute('my-attr')).toBe('test-value')
  expect(el.getAttribute('another-attr')).toBe('another-value')
})

test('respects observedAttributes with camelCase conversion', () => {
  class CamelCaseAttrsComponent extends HTMLElement {
    static observedAttributes = ['data-value', 'is-disabled']

    dataValue: string | undefined
    isDisabled: boolean | undefined

    attributeChangedCallback(name: string, _old: string, value: string | null) {
      if (name === 'data-value') this.dataValue = value ?? undefined
      if (name === 'is-disabled') this.isDisabled = value !== null
    }
  }

  customElements.define('camel-attrs-component', CamelCaseAttrsComponent)

  const { camelAttrsComponent } = elements
  const el = camelAttrsComponent({
    dataValue: 'foo',
    isDisabled: true,
  }) as CamelCaseAttrsComponent

  expect(el.getAttribute('data-value')).toBe('foo')
  expect(el.hasAttribute('is-disabled')).toBe(true)
})

test('boolean observedAttributes handled correctly', () => {
  class BooleanAttrComponent extends HTMLElement {
    static observedAttributes = ['disabled', 'hidden']
  }

  customElements.define('boolean-attr-component', BooleanAttrComponent)

  const { booleanAttrComponent } = elements

  const elTrue = booleanAttrComponent({ disabled: true })
  expect(elTrue.hasAttribute('disabled')).toBe(true)

  const elFalse = booleanAttrComponent({ disabled: false })
  expect(elFalse.hasAttribute('disabled')).toBe(false)
})
