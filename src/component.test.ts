import { expect, test, describe, beforeAll } from 'bun:test'
import { Component, tosiSlot, xinSlot } from './component'
import { elements } from './elements'
import { dispatch } from './dom'

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

// Component with handleResize (the current resize hook)
class ResizableComponent extends Component {
  static preferredTagName = 'resizable-component'
  resizeCount = 0

  content = ({ div }: typeof elements) => div({ part: 'box' }, 'Resizable')

  handleResize() {
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

// Shadow-DOM component with a part — for hydration / parts-poisoning coverage
class ShadowPartComponent extends Component {
  static preferredTagName = 'shadow-part-component'
  static shadowStyleSpec = {
    ':host': { display: 'block' },
  }
  content = ({ div }: typeof elements) => div({ part: 'box' }, 'boxed')
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

    test('an early parts read does not poison the proxy after hydration', () => {
      const el = ShadowPartComponent.elementCreator()()
      // Pre-hydration there is no shadow root and no content, so this read
      // finds nothing and throws — but it must not permanently bind the proxy
      // to the light DOM (the bug in tosijs#13).
      expect(el.shadowRoot).toBeNull()
      expect(() => el.parts.box).toThrow()
      document.body.appendChild(el)
      // Hydration attaches the shadow root; the part now resolves from it.
      expect(el.shadowRoot).not.toBeNull()
      expect(el.parts.box).toBeInstanceOf(HTMLDivElement)
      el.remove()
    })
  })

  describe('hydration', () => {
    test('hydrated flips false -> true on connect', () => {
      const el = ShadowPartComponent.elementCreator()()
      expect(el.hydrated).toBe(false)
      document.body.appendChild(el)
      expect(el.hydrated).toBe(true)
      el.remove()
    })

    test('whenHydrated resolves once connected', async () => {
      const el = ShadowPartComponent.elementCreator()()
      let resolved = false
      const pending = el.whenHydrated.then(() => {
        resolved = true
      })
      expect(resolved).toBe(false)
      document.body.appendChild(el)
      await pending
      expect(resolved).toBe(true)
      el.remove()
    })

    test('whenHydrated resolves immediately when already hydrated', async () => {
      const el = ShadowPartComponent.elementCreator()()
      document.body.appendChild(el)
      expect(el.hydrated).toBe(true)
      // Must not hang — an already-hydrated element resolves at once.
      await el.whenHydrated
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

  describe('slots (tosi-slot)', () => {
    test('creates tosi-slot elements', () => {
      const el = slottedComponent()
      document.body.appendChild(el)
      const slots = el.querySelectorAll('tosi-slot')
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

      const headerSlot = el.querySelector('tosi-slot[name="header"]')
      const footerSlot = el.querySelector('tosi-slot[name="footer"]')

      expect(headerSlot?.textContent).toContain('Header Content')
      expect(footerSlot?.textContent).toContain('Footer Content')
      el.remove()
    })

    test('default slot receives unslotted content', () => {
      const { div } = elements
      const el = slottedComponent(div('Default Content'))
      document.body.appendChild(el)

      const defaultSlot = el.querySelector('tosi-slot:not([name])')
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

describe('tosiSlot', () => {
  test('creates tosi-slot element', () => {
    const slot = tosiSlot()
    expect(slot.tagName.toLowerCase()).toBe('tosi-slot')
  })

  test('accepts name attribute', () => {
    const slot = tosiSlot({ name: 'test-slot' })
    document.body.appendChild(slot)
    expect(slot.getAttribute('name')).toBe('test-slot')
    slot.remove()
  })
})

describe('xinSlot (deprecated)', () => {
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

  test('boolean attribute defaulting to true throws with an explanation', () => {
    // HTML boolean attributes are false-by-default; a true default silently
    // becomes false, so declaring one is a hard error.
    class BoolTrueComponent extends Component {
      static preferredTagName = 'bool-true-component'
      static initAttributes = { open: true }
    }
    const create = BoolTrueComponent.elementCreator()
    expect(() => create()).toThrow(/boolean attribute to true/)
    try {
      create()
    } catch (e) {
      // the message should explain the HTML semantics and point at the fix
      expect((e as Error).message).toContain('false-by-default')
      expect((e as Error).message).toContain('{ open: false }')
    }
  })

  test('boolean attribute defaulting to false is fine', () => {
    class BoolFalseComponent extends Component {
      static preferredTagName = 'bool-false-component'
      static initAttributes = { open: false }
    }
    const el = BoolFalseComponent.elementCreator()() as any
    document.body.appendChild(el)
    expect(el.open).toBe(false)
    el.remove()
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

describe('content array with ElementProps on host', () => {
  test('event handler on host via content array', () => {
    let clicked = false
    class ClickHostComponent extends Component {
      static preferredTagName = 'click-host-test'
      content = ({ div }: typeof elements) => [
        { onClick: () => { clicked = true } },
        div('child'),
      ]
    }
    const creator = ClickHostComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    dispatch(el, 'click')
    expect(clicked).toBe(true)
    el.remove()
  })

  test('style applied to host via content array', () => {
    class StyleHostComponent extends Component {
      static preferredTagName = 'style-host-test'
      content = ({ div }: typeof elements) => [
        { style: { display: 'flex', gap: '10px' } },
        div('child'),
      ]
    }
    const creator = StyleHostComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.style.display).toBe('flex')
    expect(el.style.gap).toBe('10px')
    el.remove()
  })

  test('multiple ElementProps objects are merged', () => {
    let count = 0
    class MergePropsComponent extends Component {
      static preferredTagName = 'merge-props-test'
      content = ({ div }: typeof elements) => [
        { class: 'first', onClick: () => { count++ } },
        div('child'),
        { class: 'second' },
      ]
    }
    const creator = MergePropsComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    // Later props override earlier ones (onClick adds -xin-event class)
    expect(el.className).toContain('second')
    // But event handler from first props still works
    dispatch(el, 'click')
    expect(count).toBe(1)
    el.remove()
  })

  test('children are still appended correctly', () => {
    class MixedContentComponent extends Component {
      static preferredTagName = 'mixed-content-test'
      content = ({ div, span }: typeof elements) => [
        { style: { display: 'grid' } },
        div({ part: 'a' }, 'first'),
        span({ part: 'b' }, 'second'),
      ]
    }
    const creator = MixedContentComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.querySelector('[part="a"]')).not.toBeNull()
    expect(el.querySelector('[part="b"]')).not.toBeNull()
    expect(el.children.length).toBe(2)
    el.remove()
  })

  test('content array with no ElementProps works as before', () => {
    class PlainArrayComponent extends Component {
      static preferredTagName = 'plain-array-test'
      content = ({ div, span }: typeof elements) => [
        div('one'),
        span('two'),
      ]
    }
    const creator = PlainArrayComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.children.length).toBe(2)
    el.remove()
  })
})

// The custom-elements spec forbids constructors from "gaining attributes."
// Property setters generated by `static initAttributes` reflect to attributes
// via setAttribute, so any property assignment during construction (class
// field initializer or constructor body) used to violate the spec.
describe('constructor must not gain attributes', () => {
  // Spy on HTMLElement.prototype.setAttribute for the duration of a sync block,
  // capturing only calls made against instances of `match`.
  function captureProtoSetAttribute<T>(
    match: (el: HTMLElement) => boolean,
    fn: () => T
  ): { result: T; calls: Array<[string, string]> } {
    const calls: Array<[string, string]> = []
    const orig = HTMLElement.prototype.setAttribute
    HTMLElement.prototype.setAttribute = function (name: string, value: string) {
      if (match(this)) calls.push([name, String(value)])
      return orig.call(this, name, value)
    }
    try {
      return { result: fn(), calls }
    } finally {
      HTMLElement.prototype.setAttribute = orig
    }
  }

  test('property assignment during constructor does not call setAttribute synchronously', () => {
    class CtorAssignComponent extends Component {
      static preferredTagName = 'ctor-assign-test'
      static initAttributes = { foo: 'default-foo', count: 0 }
      constructor() {
        super()
        // simulates user code in subclass constructor / class-field initializer
        ;(this as any).foo = 'set-during-construction'
        ;(this as any).count = 42
      }
    }
    CtorAssignComponent.elementCreator()

    const { result: el, calls } = captureProtoSetAttribute(
      (e) => e instanceof CtorAssignComponent,
      () => new CtorAssignComponent()
    )

    expect(calls).toEqual([])
    // sanity: the JS-side values are observable via the property getters even
    // before the deferred reflection runs
    expect((el as any).foo).toBe('set-during-construction')
    expect((el as any).count).toBe(42)
  })

  test('attribute reflection is deferred during construction and applied after', async () => {
    class DrainComponent extends Component {
      static preferredTagName = 'drain-test'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'queued-value'
      }
    }
    DrainComponent.elementCreator()

    const el = new DrainComponent()
    // Pre-fix: the setter already ran setAttribute synchronously, so the
    // DOM attribute is present immediately. Post-fix: deferred until drain.
    expect(el.hasAttribute('foo')).toBe(false)
    // Microtask drain flushes the queue.
    await Promise.resolve()
    expect(el.getAttribute('foo')).toBe('queued-value')
  })

  test('drain skips attributes already present (parser-wins policy)', async () => {
    // Happy DOM does not actually re-prototype existing markup elements when
    // customElements.define runs, so we cannot exercise the real parser
    // upgrade path here. Instead simulate the resulting state: a constructor
    // queues a default reflection, but the attribute is already set by the
    // time the drain runs (as the parser would have done). The drain's
    // hasAttribute guard must skip rather than clobber.
    class ParserWinsComponent extends Component {
      static preferredTagName = 'parser-wins-policy'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'queued-default'
      }
    }
    ParserWinsComponent.elementCreator()

    const el = new ParserWinsComponent()
    // Bypass any per-instance mask the fix installs and write directly to
    // the DOM, the way the parser would have done before upgrade.
    HTMLElement.prototype.setAttribute.call(el, 'foo', 'parser-value')
    await Promise.resolve()
    expect(el.getAttribute('foo')).toBe('parser-value')
  })

  // Regression (1.6.x): an attribute set via its property between createElement
  // and a *synchronous* append was queued (masked) but not yet reflected to the
  // DOM when the subclass's connectedCallback ran — so early lifecycle work in
  // the subclass (asset loading, `sceneReady`) that read the attribute saw the
  // empty default and never retried. The drain must happen before the subclass
  // connectedCallback body, regardless of when it calls super.
  test('subclass connectedCallback sees attribute set before synchronous append', () => {
    class NpcBiped extends Component {
      static preferredTagName = 'npc-biped'
      static initAttributes = { url: '' }
      urlViaGetAttribute?: string
      urlViaProperty?: string
      connectedCallback() {
        // Subclass reads the attribute BEFORE calling super — the regression
        // surface. Both the DOM attribute and the property must be populated.
        this.urlViaGetAttribute = this.getAttribute('url') ?? ''
        this.urlViaProperty = (this as any).url
        super.connectedCallback()
      }
    }
    NpcBiped.elementCreator()

    const el = document.createElement('npc-biped') as NpcBiped
    // Queued during the masked window (mask not drained until connect/microtask)
    ;(el as any).url = '/omnidude.glb'
    expect(el.hasAttribute('url')).toBe(false) // still queued pre-connect
    document.body.append(el) // synchronous connect

    expect(el.urlViaGetAttribute).toBe('/omnidude.glb')
    expect(el.urlViaProperty).toBe('/omnidude.glb')
    expect(el.getAttribute('url')).toBe('/omnidude.glb')
    el.remove()
  })

  // Even a subclass that does its work before (or without) calling super must
  // see drained attributes — the wrap drains ahead of the subclass body.
  test('drain precedes subclass connectedCallback even when super is not called first', () => {
    const seen: string[] = []
    class EarlyReader extends Component {
      static preferredTagName = 'early-reader'
      static initAttributes = { label: 'default-label' }
      connectedCallback() {
        seen.push(this.getAttribute('label') ?? '<null>')
        super.connectedCallback()
      }
    }
    EarlyReader.elementCreator()

    const el = document.createElement('early-reader')
    ;(el as any).label = 'set-before-append'
    document.body.append(el)

    expect(seen).toEqual(['set-before-append'])
    el.remove()
  })

  // The wrap must not defeat the deferral: assigning during construction still
  // does NOT reflect to the DOM synchronously (no Chrome "gained attributes"
  // warning). Guards against a regression where the wrap drained too eagerly.
  test('wrap does not cause constructor-time reflection', () => {
    class StillDeferred extends Component {
      static preferredTagName = 'still-deferred'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'ctor-value'
      }
    }
    StillDeferred.elementCreator()

    const { result: el, calls } = captureProtoSetAttribute(
      (e) => e instanceof StillDeferred,
      () => new StillDeferred()
    )
    expect(calls).toEqual([]) // nothing reflected during construction
    expect((el as any).foo).toBe('ctor-value') // but readable via property
  })
})

describe('on<Event> member collision warning', () => {
  async function captureWarnings(fn: () => void): Promise<string[]> {
    const warnings: string[] = []
    const orig = console.warn
    console.warn = (m: string) => warnings.push(m)
    try {
      fn()
      await Promise.resolve() // let the deferred (microtask) scan run
    } finally {
      console.warn = orig
    }
    return warnings
  }

  test('warns when a component defines on<Event> members (shadowed by event sugar)', async () => {
    class HandlerCollisionComponent extends Component {
      static preferredTagName = 'handler-collision-component'
      onClick = (): void => {} // arrow field
      onMousedown(): void {} // prototype method
    }
    const warnings = await captureWarnings(() =>
      HandlerCollisionComponent.elementCreator()()
    )
    const w = warnings.find((m) => m.includes('event-handler sugar'))
    expect(w).toBeDefined()
    expect(w).toContain("'onClick'")
    expect(w).toContain("'onMousedown'")
  })

  test('does not warn for handleResize (current resize hook), and wires it', async () => {
    let resized = 0
    class HandleResizeComponent extends Component {
      static preferredTagName = 'handle-resize-component'
      handleResize(): void {
        resized++
      }
    }
    const create = HandleResizeComponent.elementCreator()
    const warnings = await captureWarnings(() => create())
    expect(warnings.some((m) => m.includes('event-handler sugar'))).toBe(false)
    expect(warnings.some((m) => m.includes('deprecated'))).toBe(false)
    // wired: a resize event invokes the handler
    const el = create()
    document.body.appendChild(el)
    el.dispatchEvent(new Event('resize'))
    expect(resized).toBeGreaterThan(0)
    el.remove()
  })

  test('onResize is deprecated (warns) but still wired', async () => {
    let resized = 0
    class LegacyResizeComponent extends Component {
      static preferredTagName = 'legacy-resize-component'
      onResize(): void {
        resized++
      }
    }
    const create = LegacyResizeComponent.elementCreator()
    const warnings = await captureWarnings(() => create())
    const w = warnings.find((m) => m.includes('deprecated'))
    expect(w).toBeDefined()
    expect(w).toContain("'onResize'")
    expect(w).toContain('handleResize')
    // legacy hook still works
    const el = create()
    document.body.appendChild(el)
    el.dispatchEvent(new Event('resize'))
    expect(resized).toBeGreaterThan(0)
    el.remove()
  })

  test('does not warn for a component with no on<Event> members', async () => {
    class CleanComponent extends Component {
      static preferredTagName = 'clean-component'
      handleClick(): void {}
    }
    const warnings = await captureWarnings(() =>
      CleanComponent.elementCreator()()
    )
    expect(warnings.some((m) => m.includes('event-handler sugar'))).toBe(false)
  })
})

describe('shadow-DOM binding boundary warning', () => {
  test('bind/on sugar in shadow content warns once per class at hydrate', async () => {
    class ShadowBoundComponent extends Component {
      static preferredTagName = 'shadow-bound-warn'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      content = ({ div }: typeof elements) =>
        div({ bindText: 'shadowWarnTest.label' })
    }
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    try {
      const create = ShadowBoundComponent.elementCreator()
      const el = create()
      document.body.append(el)
      const el2 = create()
      document.body.append(el2)
      el.remove()
      el2.remove()
    } finally {
      console.warn = origWarn
    }
    const boundaryWarnings = warnings.filter((w) =>
      w.includes('shadow-DOM content, where bindings do not operate')
    )
    expect(boundaryWarnings.length).toBe(1) // once per class, not per instance
    expect(boundaryWarnings[0]).toContain('shadow-bound-warn')
  })

  test('light-DOM binding sugar does not warn', async () => {
    class LightBoundComponent extends Component {
      static preferredTagName = 'light-bound-nowarn'
      content = ({ div }: typeof elements) =>
        div({ bindText: 'lightNoWarnTest.label' })
    }
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    try {
      const el = LightBoundComponent.elementCreator()()
      document.body.append(el)
      el.remove()
    } finally {
      console.warn = origWarn
    }
    expect(
      warnings.some((w) => w.includes('where bindings do not operate'))
    ).toBe(false)
  })
})

describe('pending-attribute drain is last-write-wins (H-2)', () => {
  test('two pre-connect property writes: the second wins', () => {
    class DrainOrderTest extends Component {
      static preferredTagName = 'drain-order-test'
      static initAttributes = { caption: 'default' }
    }
    const el = DrainOrderTest.elementCreator()() as any
    el.caption = 'first'
    el.caption = 'second' // was silently dropped: first landed, guard blocked this
    document.body.append(el)
    expect(el.getAttribute('caption')).toBe('second')
    expect(el.caption).toBe('second')
    el.remove()
  })

  test('pre-connect remove-then-set lands the set', () => {
    class DrainRemoveSetTest extends Component {
      static preferredTagName = 'drain-remove-set-test'
      static initAttributes = { caption: 'default' }
    }
    const el = DrainRemoveSetTest.elementCreator()() as any
    el.setAttribute('caption', 'a')
    el.removeAttribute('caption')
    el.setAttribute('caption', 'b')
    document.body.append(el)
    expect(el.getAttribute('caption')).toBe('b')
    el.remove()
  })
})

describe('initAttributes vs class fields under [[Define]] semantics (H-3)', () => {
  // A natively-evaluated class guarantees [[Define]] field semantics
  // regardless of how the test file itself is transpiled.
  const makeFieldShadowClass = new Function(
    'Component',
    `return class FieldShadowTest extends Component {
      static preferredTagName = 'field-shadow-test'
      static initAttributes = { label: 'default' }
      label = 'from-field'
    }`
  )

  test('leftover field: no TypeError, value adopted, accessor restored, warns once per class', () => {
    const FieldShadowTest = makeFieldShadowClass(Component) as any
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    let el: any
    let el2: any
    try {
      // before the fix this line threw:
      // "TypeError: Attempting to change configurable attribute of unconfigurable property"
      el = FieldShadowTest.elementCreator()()
      document.body.append(el)
      el2 = FieldShadowTest.elementCreator()()
      document.body.append(el2)
    } finally {
      console.warn = origWarn
    }
    // the field's value was adopted and reflected
    expect(el.label).toBe('from-field')
    expect(el.getAttribute('label')).toBe('from-field')
    // the accessor is live again: writes reflect to the attribute
    el.label = 'changed'
    expect(el.getAttribute('label')).toBe('changed')
    // and attribute changes are readable through the property
    el.setAttribute('label', 'external')
    expect(el.label).toBe('external')
    const shadowWarnings = warnings.filter((w) =>
      w.includes('shadow static initAttributes')
    )
    expect(shadowWarnings.length).toBe(1) // once per class, not per instance
    el.remove()
    el2.remove()
  })

  test('components without shadowing fields are untouched', () => {
    class NoFieldTest extends Component {
      static preferredTagName = 'no-field-shadow-test'
      static initAttributes = { caption: 'plain' }
    }
    const el = NoFieldTest.elementCreator()() as any
    document.body.append(el)
    expect(el.caption).toBe('plain')
    el.caption = 'set'
    expect(el.getAttribute('caption')).toBe('set')
    el.remove()
  })
})

test('isSlotted is false for a light-DOM component with no slot (medium backlog)', () => {
  class NoSlotComp extends Component {
    static preferredTagName = 'no-slot-comp'
    content = ({ div }: typeof elements) => div('no slot here')
  }
  const el = NoSlotComp.elementCreator()() as any
  document.body.append(el)
  expect(el.isSlotted).toBe(false) // was always true (querySelector null !== undefined)
  el.remove()
})

test('isSlotted is true when the component has a slot', () => {
  class SlottedComp extends Component {
    static preferredTagName = 'yes-slot-comp'
    content = ({ div, slot }: typeof elements) => div(slot())
  }
  const el = SlottedComp.elementCreator()() as any
  document.body.append(el)
  expect(el.isSlotted).toBe(true)
  el.remove()
})

test('external removeAttribute is not masked by the in-memory fallback (medium backlog)', () => {
  class AttrMaskComp extends Component {
    static preferredTagName = 'attr-mask-comp'
    static initAttributes = { label: 'default' }
  }
  const el = AttrMaskComp.elementCreator()() as any
  document.body.append(el)
  el.label = 'custom'
  expect(el.label).toBe('custom')
  el.removeAttribute('label')
  expect(el.label).toBe('default') // was stuck on 'custom' (stale fallback)
  el.remove()
})

test('<slot> fallback children survive the tosi-slot rewrite (medium backlog)', () => {
  class SlotFallbackComp extends Component {
    static preferredTagName = 'slot-fallback-comp'
    content = ({ slot }: typeof elements) => slot('fallback text')
  }
  const el = SlotFallbackComp.elementCreator()() as any
  document.body.append(el)
  expect(el.textContent).toContain('fallback text') // was dropped
  el.remove()
})

describe('component change event bubbles (bound like a native input)', () => {
  test('an ancestor bubble-phase change listener hears a component value change', async () => {
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    class BubbleWidget extends Component {
      static preferredTagName = 'bubble-widget'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 0
    }
    BubbleWidget.elementCreator()
    const container = document.createElement('div')
    document.body.append(container)
    const el = (elements as any).bubbleWidget() as any
    container.append(el)

    let heardOnAncestor = 0
    // bubble phase (capture=false) — only fires if the change event bubbles,
    // which native input change events do (and the delegated binding uses
    // capture, so this is specifically the ancestor-listener semantics)
    container.addEventListener('change', () => {
      heardOnAncestor++
    })
    el.value = 7 // queues a change on the next frame
    await raf()
    expect(heardOnAncestor).toBe(1) // was 0 — change did not bubble
    container.remove()
  })

  test('value binding round-trips through a component (works via capture too)', async () => {
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { xin, updates } = await import('./xin')
    const { tosi } = await import('./xin-proxy')
    const raf = () => new Promise((r) => requestAnimationFrame(r))

    class ValueWidget extends Component {
      static preferredTagName = 'value-widget-rt'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 0
      content = ({ button }: any) => button({ part: 'inc' }, '+')
      connectedCallback() {
        super.connectedCallback()
        ;(this.shadowRoot as any)
          .querySelector('[part=inc]')
          .addEventListener('click', () => {
            this.value = Number(this.value) + 1
          })
      }
    }
    ValueWidget.elementCreator()
    tosi({ vwRt: { n: 5 } })
    const el = (elements as any).valueWidgetRt() as any
    bind(el, 'vwRt.n', bindings.value)
    document.body.append(el)
    await updates()
    await raf()
    expect(Number(el.value)).toBe(5)
    ;(el.shadowRoot as any).querySelector('[part=inc]').click()
    await raf()
    await updates()
    expect(Number(el.value)).toBe(6)
    expect((xin as any)['vwRt.n']).toBe(6)
    el.remove()
  })
})
