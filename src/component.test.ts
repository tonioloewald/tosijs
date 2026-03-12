import { expect, test, describe, beforeAll } from 'bun:test'
import { Component, xinSlot } from './component'
import { elements } from './elements'

// Simple test component
class TestComponent extends Component {
  static preferredTagName = 'test-component'
  testProp = 'initial'
  counter = 0

  constructor() {
    super()
    this.initAttributes('testProp')
  }

  content = ({ div, span }: typeof elements) => [
    div({ part: 'container' }, span({ part: 'label' }, 'Test')),
  ]

  render() {
    super.render()
    this.counter++
  }
}

// Component with static shadowStyleSpec
class StyledComponent extends Component {
  static preferredTagName = 'styled-component'
  static shadowStyleSpec = {
    ':host': {
      display: 'block',
      padding: '10px',
    },
  }

  content = ({ div }: typeof elements) => div('Styled content')
}

// Component with value
class ValueComponent extends Component {
  static preferredTagName = 'value-component'
  value = ''

  content = ({ input }: typeof elements) =>
    input({ part: 'input', type: 'text' })

  connectedCallback() {
    super.connectedCallback()
    const { input } = this.parts as { input: HTMLInputElement }
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const { input } = this.parts as { input: HTMLInputElement }
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

// Component with onResize
class ResizableComponent extends Component {
  static preferredTagName = 'resizable-component'
  resizeCount = 0

  content = ({ div }: typeof elements) => div({ part: 'box' }, 'Resizable')

  onResize() {
    this.resizeCount++
  }
}

// Component with slots
class SlottedComponent extends Component {
  static preferredTagName = 'slotted-component'
  content = ({ div, slot }: typeof elements) => [
    div({ part: 'header' }, slot({ name: 'header' })),
    div({ part: 'main' }, slot()),
    div({ part: 'footer' }, slot({ name: 'footer' })),
  ]
}

// Component with null content
class EmptyComponent extends Component {
  static preferredTagName = 'empty-component'
  content = null
}

// Component with function content that uses props
class DynamicComponent extends Component {
  static preferredTagName = 'dynamic-component'
  greeting = 'Hello'

  constructor() {
    super()
    this.initAttributes('greeting')
  }

  content = ({ div }: typeof elements) =>
    div({ part: 'message' }, this.greeting)
}

let testComponent: ReturnType<typeof TestComponent.elementCreator>
let styledComponent: ReturnType<typeof StyledComponent.elementCreator>
let valueComponent: ReturnType<typeof ValueComponent.elementCreator>
let resizableComponent: ReturnType<typeof ResizableComponent.elementCreator>
let slottedComponent: ReturnType<typeof SlottedComponent.elementCreator>
let emptyComponent: ReturnType<typeof EmptyComponent.elementCreator>
let dynamicComponent: ReturnType<typeof DynamicComponent.elementCreator>

beforeAll(() => {
  testComponent = TestComponent.elementCreator()
  styledComponent = StyledComponent.elementCreator()
  valueComponent = ValueComponent.elementCreator()
  resizableComponent = ResizableComponent.elementCreator()
  slottedComponent = SlottedComponent.elementCreator()
  emptyComponent = EmptyComponent.elementCreator()
  dynamicComponent = DynamicComponent.elementCreator()
})

describe('Component', () => {
  describe('elementCreator', () => {
    test('creates element with specified tag', () => {
      const el = testComponent()
      expect(el.tagName.toLowerCase()).toBe('test-component')
    })

    test('creates unique tag if not specified', () => {
      class AnonComponent extends Component {}
      const creator = AnonComponent.elementCreator()
      const el = creator()
      expect(el.tagName.toLowerCase()).toMatch(/^(anon-component|custom-elt)/)
    })

    test('static tagName is set after elementCreator', () => {
      expect(TestComponent.tagName).toBe('test-component')
    })

    test('returns same creator on subsequent calls', () => {
      const creator1 = TestComponent.elementCreator()
      const creator2 = TestComponent.elementCreator()
      expect(creator1).toBe(creator2)
    })
  })

  describe('lifecycle', () => {
    test('constructor sets instanceId', () => {
      const el = testComponent()
      expect(el.instanceId).toMatch(/^test-component-\d+$/)
    })

    test('connectedCallback hydrates content', () => {
      const el = testComponent()
      document.body.appendChild(el)
      expect(el.querySelector('[part="container"]')).not.toBeNull()
      expect(el.querySelector('[part="label"]')).not.toBeNull()
      el.remove()
    })

    test('render is called after connection', async () => {
      const el = testComponent()
      expect(el.counter).toBe(0)
      document.body.appendChild(el)
      // Wait for requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBeGreaterThan(0)
      el.remove()
    })

    test('disconnectedCallback cleans up', () => {
      const el = resizableComponent()
      document.body.appendChild(el)
      el.remove()
      // No error means cleanup worked
      expect(true).toBe(true)
    })
  })

  describe('initAttributes', () => {
    test('initializes attribute from property default', () => {
      const el = testComponent()
      expect(el.testProp).toBe('initial')
    })

    test('reads attribute from DOM', () => {
      const el = testComponent({ testProp: 'from-attr' })
      document.body.appendChild(el)
      expect(el.testProp).toBe('from-attr')
      el.remove()
    })

    test('setting property updates attribute', () => {
      const el = testComponent()
      document.body.appendChild(el)
      el.testProp = 'updated'
      expect(el.getAttribute('test-prop')).toBe('updated')
      el.remove()
    })

    test('boolean attributes work correctly', () => {
      const el = testComponent()
      document.body.appendChild(el)
      el.hidden = true
      expect(el.hasAttribute('hidden')).toBe(true)
      el.hidden = false
      expect(el.hasAttribute('hidden')).toBe(false)
      el.remove()
    })
  })

  describe('parts', () => {
    test('provides access to elements by part attribute', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const container = el.parts.container
      expect(container).toBeInstanceOf(HTMLDivElement)
      el.remove()
    })

    test('provides access to elements by CSS selector', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const span = el.parts.span
      expect(span).toBeInstanceOf(HTMLSpanElement)
      el.remove()
    })

    test('throws error for non-existent ref', () => {
      const el = testComponent()
      document.body.appendChild(el)
      expect(() => el.parts.nonexistent).toThrow()
      el.remove()
    })

    test('memoizes part lookups', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const container1 = el.parts.container
      const container2 = el.parts.container
      expect(container1).toBe(container2)
      el.remove()
    })
  })

  describe('queueRender', () => {
    test('queues render via requestAnimationFrame', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const initialCount = el.counter
      el.queueRender()
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBe(initialCount + 1)
      el.remove()
    })

    test('triggers change event when requested', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      let changeTriggered = false
      el.addEventListener('change', () => {
        changeTriggered = true
      })
      el.queueRender(true)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(changeTriggered).toBe(true)
      el.remove()
    })

    test('batches multiple queueRender calls', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const initialCount = el.counter
      el.queueRender()
      el.queueRender()
      el.queueRender()
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBe(initialCount + 1)
      el.remove()
    })
  })

  describe('value property', () => {
    test('initializes value from property', () => {
      const el = valueComponent()
      expect(el.value).toBe('')
    })

    test('setting value triggers change event', async () => {
      const el = valueComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      let changeTriggered = false
      el.addEventListener('change', () => {
        changeTriggered = true
      })
      el.value = 'new value'
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(changeTriggered).toBe(true)
      el.remove()
    })
  })

  describe('content', () => {
    test('null content creates empty component', () => {
      const el = emptyComponent()
      document.body.appendChild(el)
      expect(el.children.length).toBe(0)
      el.remove()
    })

    test('function content is evaluated', () => {
      const el = dynamicComponent({ greeting: 'Hi there' })
      document.body.appendChild(el)
      const message = el.querySelector('[part="message"]')
      expect(message?.textContent).toBe('Hi there')
      el.remove()
    })
  })

  describe('slots (xin-slot)', () => {
    test('creates xin-slot elements', () => {
      const el = slottedComponent()
      document.body.appendChild(el)
      const slots = el.querySelectorAll('xin-slot')
      expect(slots.length).toBe(3)
      el.remove()
    })

    test('named slots receive slotted content', () => {
      const { div } = elements
      const el = slottedComponent(
        div({ slot: 'header' }, 'Header Content'),
        div('Main Content'),
        div({ slot: 'footer' }, 'Footer Content')
      )
      document.body.appendChild(el)

      const headerSlot = el.querySelector('xin-slot[name="header"]')
      const footerSlot = el.querySelector('xin-slot[name="footer"]')

      expect(headerSlot?.textContent).toContain('Header Content')
      expect(footerSlot?.textContent).toContain('Footer Content')
      el.remove()
    })

    test('default slot receives unslotted content', () => {
      const { div } = elements
      const el = slottedComponent(div('Default Content'))
      document.body.appendChild(el)

      const defaultSlot = el.querySelector('xin-slot:not([name])')
      expect(defaultSlot?.textContent).toContain('Default Content')
      el.remove()
    })
  })

  describe('shadowStyleSpec', () => {
    test('static shadowStyleSpec creates shadow DOM', () => {
      const el = styledComponent()
      document.body.appendChild(el)
      expect(el.shadowRoot).not.toBeNull()
      el.remove()
    })

    test('shadow DOM contains style element', () => {
      const el = styledComponent()
      document.body.appendChild(el)
      const style = el.shadowRoot?.querySelector('style')
      expect(style).not.toBeNull()
      expect(style?.textContent).toContain('display')
      el.remove()
    })
  })

  describe('Component.elements', () => {
    test('provides access to elements proxy', () => {
      expect(Component.elements).toBe(elements)
      expect(typeof Component.elements.div).toBe('function')
    })
  })
})

describe('xinSlot', () => {
  test('creates xin-slot element', () => {
    const slot = xinSlot()
    expect(slot.tagName.toLowerCase()).toBe('xin-slot')
  })

  test('accepts name attribute', () => {
    const slot = xinSlot({ name: 'test-slot' })
    document.body.appendChild(slot)
    expect(slot.getAttribute('name')).toBe('test-slot')
    slot.remove()
  })
})

// Tests for static initAttributes
describe('static initAttributes', () => {
  class StaticAttrsComponent extends Component {
    static preferredTagName = 'static-attrs-component'
    static initAttributes = {
      caption: 'default',
      count: 42,
      disabled: false,
    }

    content = ({ div }: typeof elements) => div({ part: 'content' })
  }

  let staticAttrsComponent: ReturnType<
    typeof StaticAttrsComponent.elementCreator
  >

  beforeAll(() => {
    staticAttrsComponent = StaticAttrsComponent.elementCreator()
  })

  test('observedAttributes is auto-generated from initAttributes', () => {
    const observed = StaticAttrsComponent.observedAttributes
    expect(observed).toContain('hidden')
    expect(observed).toContain('caption')
    expect(observed).toContain('count')
    expect(observed).toContain('disabled')
  })

  test('string attribute has correct default', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.caption).toBe('default')
    el.remove()
  })

  test('string attribute syncs with DOM', () => {
    const el = staticAttrsComponent({ caption: 'from-attr' })
    document.body.appendChild(el)
    expect(el.caption).toBe('from-attr')
    expect(el.getAttribute('caption')).toBe('from-attr')
    el.remove()
  })

  test('string attribute can be set via property', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.caption = 'updated'
    expect(el.getAttribute('caption')).toBe('updated')
    el.remove()
  })

  test('number attribute has correct default', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.count).toBe(42)
    el.remove()
  })

  test('number attribute is parsed from DOM', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.setAttribute('count', '100')
    expect(el.count).toBe(100)
    el.remove()
  })

  test('boolean attribute defaults to false', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.disabled).toBe(false)
    el.remove()
  })

  test('boolean attribute true when present', () => {
    const el = staticAttrsComponent({ disabled: true })
    document.body.appendChild(el)
    expect(el.disabled).toBe(true)
    expect(el.hasAttribute('disabled')).toBe(true)
    el.remove()
  })

  test('boolean attribute toggled via property', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.disabled = true
    expect(el.hasAttribute('disabled')).toBe(true)
    el.disabled = false
    expect(el.hasAttribute('disabled')).toBe(false)
    el.remove()
  })

  test('warns when value is used in initAttributes', () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(msg)

    class BadValueComponent extends Component {
      static preferredTagName = 'bad-value-component'
      static initAttributes = { value: 'bad' }
    }
    BadValueComponent.elementCreator()()

    console.warn = originalWarn
    expect(
      warnings.some(
        (w) => w.includes('value') && w.includes('cannot be an attribute')
      )
    ).toBe(true)
  })
})

// Tests for light DOM :host selector rewriting
describe('light DOM :host rewriting', () => {
  class HostRewriteComponent extends Component {
    static preferredTagName = 'host-rewrite-test'
    static lightStyleSpec = {
      ':host': { display: 'block' },
    }
    content = ({ div }: typeof elements) => div('host rewrite test')
  }

  test(':host is replaced with tagName', () => {
    const creator = HostRewriteComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('host-rewrite-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('host-rewrite-test')
    expect(style?.textContent).not.toContain(':host')
    el.remove()
  })

  class HostParenComponent extends Component {
    static preferredTagName = 'host-paren-test'
    static lightStyleSpec = {
      ':host(.active)': { color: 'red' },
      ':host(.active) > span': { fontWeight: 'bold' },
    }
    content = ({ div }: typeof elements) => div('host paren test')
  }

  test(':host(.foo) is replaced with tagName.foo', () => {
    const creator = HostParenComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('host-paren-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('host-paren-test.active')
    expect(style?.textContent).not.toContain(':host')
    expect(style?.textContent).toContain('host-paren-test.active > span')
    el.remove()
  })
})

// Tests for formAssociated / ElementInternals
describe('formAssociated', () => {
  class FormComponent extends Component {
    static preferredTagName = 'form-component'
    static formAssociated = true
    value = '' // value is a property, not an attribute

    content = ({ input }: typeof elements) => input({ part: 'input' })
  }

  let formComponent: ReturnType<typeof FormComponent.elementCreator>

  beforeAll(() => {
    formComponent = FormComponent.elementCreator()
  })

  test('has internals when formAssociated is true (if supported)', () => {
    const el = formComponent()
    document.body.appendChild(el)
    // Happy DOM doesn't support attachInternals, so internals may be undefined
    if (typeof HTMLElement.prototype.attachInternals === 'function') {
      expect(el.internals).toBeDefined()
    } else {
      expect(el.internals).toBeUndefined()
    }
    el.remove()
  })

  test('formAssociated component is focusable by default', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect(el.getAttribute('tabindex')).toBe('0')
    el.remove()
  })

  test('formAssociated component respects explicit tabindex', () => {
    const el = formComponent({ tabindex: '-1' })
    document.body.appendChild(el)
    expect(el.getAttribute('tabindex')).toBe('-1')
    el.remove()
  })

  test('component works even without internals support', () => {
    const el = formComponent()
    document.body.appendChild(el)
    // Should not throw, value should work
    el.value = 'test'
    expect(el.value).toBe('test')
    el.remove()
  })

  test('form element survives being moved between forms', () => {
    const { form } = elements
    const form1 = form({ id: 'form1' })
    const form2 = form({ id: 'form2' })
    document.body.appendChild(form1)
    document.body.appendChild(form2)

    const el = formComponent()
    form1.appendChild(el)
    el.value = 'initial'
    expect(el.value).toBe('initial')

    // Move to second form
    form2.appendChild(el)
    expect(el.value).toBe('initial') // Value should persist
    el.value = 'updated'
    expect(el.value).toBe('updated')

    // Move back to first form
    form1.appendChild(el)
    expect(el.value).toBe('updated')

    // Clean up
    form1.remove()
    form2.remove()
  })

  test('form element survives removal and re-insertion', () => {
    const { form } = elements
    const form1 = form({ id: 'form-reinsert' })
    document.body.appendChild(form1)

    const el = formComponent()
    form1.appendChild(el)
    el.value = 'before-remove'

    // Remove from DOM
    el.remove()
    expect(el.value).toBe('before-remove')

    // Re-insert
    form1.appendChild(el)
    expect(el.value).toBe('before-remove')
    el.value = 'after-reinsert'
    expect(el.value).toBe('after-reinsert')

    form1.remove()
  })

  test('_valueChanged flag is set when value changes', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect((el as any)._valueChanged).toBe(false)
    el.value = 'new value'
    expect((el as any)._valueChanged).toBe(true)
    el.remove()
  })

  test('_valueChanged flag is cleared after render', async () => {
    const el = formComponent()
    document.body.appendChild(el)
    el.value = 'trigger render'
    expect((el as any)._valueChanged).toBe(true)
    // Wait for rAF to fire
    await new Promise((r) => requestAnimationFrame(r))
    expect((el as any)._valueChanged).toBe(false)
    el.remove()
  })

  test('_valueChanged flag not set on attribute-only changes', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect((el as any)._valueChanged).toBe(false)
    el.setAttribute('data-test', 'foo')
    expect((el as any)._valueChanged).toBe(false)
    el.remove()
  })
})

// Tests for new static properties
describe('static preferredTagName', () => {
  test('uses preferredTagName for registration', () => {
    class PreferredTagComponent extends Component {
      static preferredTagName = 'preferred-tag-test'
      content = null
    }
    const creator = PreferredTagComponent.elementCreator()
    const el = creator()
    expect(el.tagName.toLowerCase()).toBe('preferred-tag-test')
  })

  test('falls back to anon tag when no preferredTagName and anonymous class', () => {
    const AnonClass = class extends Component {
      content = null
    }
    // Force anonymous by clearing name
    Object.defineProperty(AnonClass, 'name', { value: '' })
    const creator = AnonClass.elementCreator()
    const el = creator()
    expect(el.tagName.toLowerCase()).toMatch(/^custom-elt/)
  })
})

describe('static shadowStyleSpec', () => {
  test('creates shadow DOM with style', () => {
    class ShadowStyleComponent extends Component {
      static preferredTagName = 'shadow-style-test'
      static shadowStyleSpec = {
        ':host': { display: 'flex' },
      }
      content = ({ div }: typeof elements) => div('shadow styled')
    }
    const creator = ShadowStyleComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.shadowRoot).not.toBeNull()
    const style = el.shadowRoot?.querySelector('style')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('display')
    el.remove()
  })
})

describe('static lightStyleSpec', () => {
  test('creates global style in head', () => {
    class LightStyleComponent extends Component {
      static preferredTagName = 'light-style-test'
      static lightStyleSpec = {
        ':host': { display: 'grid' },
      }
      content = ({ div }: typeof elements) => div('light styled')
    }
    const creator = LightStyleComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('light-style-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('light-style-test')
    expect(style?.textContent).toContain('display')
    expect(style?.textContent).not.toContain(':host')
    el.remove()
  })
})

describe('deprecated elementCreator options', () => {
  test('tag option still works with deprecation warning', () => {
    class LegacyTagComponent extends Component {
      content = null
    }
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(String(msg))
    const creator = LegacyTagComponent.elementCreator({
      tag: 'legacy-tag-test',
    })
    console.warn = originalWarn
    const el = creator()
    expect(el.tagName.toLowerCase()).toBe('legacy-tag-test')
    expect(
      warnings.some((w) => w.includes('deprecated') && w.includes('tag'))
    ).toBe(true)
  })

  test('styleSpec option still works with deprecation warning', () => {
    class LegacyStyleComponent extends Component {
      content = ({ div }: typeof elements) => div('legacy styled')
    }
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(String(msg))
    const creator = LegacyStyleComponent.elementCreator({
      tag: 'legacy-style-test',
      styleSpec: { ':host': { display: 'block' } },
    })
    console.warn = originalWarn
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('legacy-style-test-component')
    expect(style).not.toBeNull()
    expect(
      warnings.some(
        (w) => w.includes('deprecated') && w.includes('styleSpec')
      )
    ).toBe(true)
    el.remove()
  })
})
