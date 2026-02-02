/*#
# 4. web-components

**tosijs** provides the abstract `Component` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass `Component`, simply add the properties
and methods you want, with some help from `Component` itself, and then simply
export your new class's `elementCreator()` which is a function that defines your
new component's element and produces instances of it as needed.

```
import {Component} from 'tosijs'

class ToolBar extends Component {
  static styleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator({ tag: 'tool-bar' })
```

> **Note**: Custom elements default to `display: inline`, which often causes them to
> appear dimensionless. Unless you want this (e.g., for content-holder elements),
> set an explicit `display` value (e.g., `block`, `inline-block`, `flex`) in your
> `:host` styles.

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

The last line defines the `ToolBar` class as the implementation of `<tool-bar>`
HTML elements (`tool-bar` is derived automatically from the class name) and
returns an `ElementCreator` function that creates `<tool-bar>` elements.

See [elements](/?elements.ts) for more information on `ElementCreator` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
`<label>` wrapped around `<span>` and an `<input>`. Its value is synced
to that of its `<input>` so the user doesn't need to care about how
it works internally.

```js
import { Component, elements } from 'tosijs'

class LabeledInput extends Component {
  static initAttributes = { caption: 'untitled' }
  value = ''

  content = ({label, span, input}) => label(span(), input())

  connectedCallback() {
    super.connectedCallback()
    const {input} = this.parts
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const {span, input} = this.parts
    span.textContent = this.caption
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

const labeledInput = LabeledInput.elementCreator()

preview.append(
  labeledInput({caption: 'A text field', value: 'some text'})
)
```

`content` is, in essence, a template for the internals of the element. By default
it's a single `<slot>` element. If you explicitly want an element with no content
you can set your subclass's content to `null` or omit any `<slot>` from its template.

By setting content to be a function that returns elements instead of a collection
of elements you can take customize elements based on the component's properties.
In particular, you can use `onXxxx` syntax sugar to bind events.

(Note that you cannot bind to xin paths reliably if your component uses a `shadowDOM`
because `xin` cannot "see" elements there. As a general rule, you need to take care
of anything in the `shadowDOM` yourself.)

If you'd like to see a more complex example along the same lines, look at
[form and field](https://ui.tosijs.net/?form.ts).

##### <slot> names and the `slot` attribute

```
class MenuBar extends Component {
  static styleSpec = {
    ':host, :host > slot': {
      display: 'flex',
    },
    ':host > slot:nth-child(1)': {
      flex: '1 1 auto'
    },
  }

  content = ({slot}) => [slot(), slot({name: 'gadgets'})]
}

export menuBar = MenuBar.elementCreator()
```

One of the neat things about custom-elements is that you can give them *multiple*
`<slot>`s with different `name` attributes and then have children target a specific
slot using the `slot` attribute.

This app's layout (the nav sidebar that disappears if the app is in a narrow space, etc.)
is built using just such a custom-element.

#### `<xin-slot>`

If you put `<slot>` elements inside a `Component` subclass that doesn't have a
shadowDOM, they will automatically be replaced with `<xin-slot>` elements that
have the expected behavior (i.e. sucking in children in based on their `<slot>`
attribute).

`<xin-slot>` doesn't support `:slotted` but since there's no shadowDOM, just
style such elements normally, or use `xin-slot` as a CSS-selector.

Note that you cannot give a `<slot>` element attributes (other than `name`) so if
you want to give a `<xin-slot>` attributes (such as `class` or `style`), create it
explicitly (e.g. using `elements.xinSlot()`) rather than using `<slot>` elements
and letting them be switched out (because they'll lose any attributes you give them).

Here's a very simple example:

```js
import { Component, elements } from 'tosijs'

class FauxSlotExample extends Component {
  content = ({h4, h5, xinSlot}) => [
    h4('This is a web-component with no shadow DOM and working slots!'),
    h5('top slot'),
    xinSlot({name: 'top'}),
    h5('middle slot'),
    xinSlot(),
    h5('bottom slot'),
    xinSlot({name: 'bottom'}),
  ]
}

const fauxSlotExample = FauxSlotExample.elementCreator({
  tag: 'faux-slot-example',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
    ':host h4, :host h5': {
      margin: 0,
    },
    ':host xin-slot': {
      border: '2px solid grey'
    }
  }
})

const { div } = elements

preview.append(
  fauxSlotExample(
    div({slot: 'bottom'}, 'I should be on the bottom'),
    div({slot: 'top'}, 'I should be on the top'),
    div('I should be in the middle')
  )
)
```

> ##### Background
>
> `<slot>` elements do not work as expected in shadowDOM-less components. This is
> hugely annoying since it prevents components from composing nicely unless they
> have a shadowDOM, and while the shadowDOM is great for small widgets, it's
> terrible for composite views and breaks `tosijs`'s bindings (inside the shadow
> DOM you need to do data- and event- binding manually).

#### styleNode: HTMLStyleElement

`styleNode` is the `<style>` element that will be inserted into the element's
`shadowRoot`.

If a `Component` subclass has no `styleNode`, no `shadowRoot` will be
created. This reduces the memory and performance cost of the element.

This is to avoid the performance/memory costs associated with the `shadowDOM`
for custom-elements with no styling.

##### Notes

Styling custom-elements can be tricky, and it's worth learning about
how the `:host` and `:slotted()` selectors work.

It's also very useful to understand how CSS-Variables interact with the
`shadowDOM`. In particular, CSS-variables are passed into the `shadowDOM`
when other CSS rules are not. You can use css rules to modify css-variables
which will then penetrate the `shadowDOM`.

#### refs: {[key:string]: Element | undefined}

    render() {
      super.render() // see note
      const {span, input} = this.parts
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

> **Note**: the `render()` method of the base `Component` class doesn't currently
> do anything, so calling it is optional (but a good practice in case one day…)
>
> It is *necessary* however to call `super.connectedCallback`, `super.disconnectedCallback`
> and `super()` in the `constructor()` should you override them.

`this.parts` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

`this.parts.foo` will return a content element with `data-ref="foo"`. If no such
element is found it tries it as a css selector, so `this.parts['.foo']` would find
a content element with `class="foo"` while `this.parts.h1` will find an `<h1>`.

`this.parts` will also remove a `data-ref` attribute once it has been used to find
the element. This means that if you use all your refs in `render` or `connectedCallback`
then no trace will remain in the DOM for a mounted element.

### Component properties

#### content: ((elements: ElementsProxy) => ContentType) | null | ContentType = slot()

A component's content `property` can either be static content (it defaults to being a `<slot>` element) or an arrow function
that creates the basic content of the element on hydration. Static content will be deep-cloned.

By using an arrow function the content created can refer to the custom-element's properties and attributes (and this occurs post-initialization). This also means you can bind event-handlers in the component (which should also be arrow functions unless they don't need to refer to the element)

Because a `content` function is passed the `elements` proxy, you can easily destructure any element creators you need:

```
content = ({div}) => div('hello world')
```

`ContentType` can be an HTMLElement or an array of elements.

> Note that if a component does not use the shadowDOM, its `<slot>` elements will be replaced with `<xin-slot>` elements.
> This allows composition to work as expected without requiring the shadow DOM.

### Component static properties

#### static initAttributes: Record<string, any>

Declares attributes that should be watched and synced with properties. The keys are
property names (camelCase), and the values are the defaults which also determine the type.

    import { Component } from 'tosijs'

    class MyWidget extends Component {
      static initAttributes = {
        caption: '',      // string attribute
        count: 0,         // number attribute (auto-parsed)
        disabled: false,  // boolean attribute (presence/absence)
      }

      render() {
        // this.caption, this.count, this.disabled are automatically available
        // and synced with HTML attributes
      }
    }

This replaces both the old `initAttributes()` method call AND the instance property
declarations. A single static object now defines which properties are attributes,
their default values, and their types:

- **All-in-one**: Attributes, defaults, and types defined in one place
- **Declarative**: No constructor needed
- **Type inference**: Default values determine parsing (boolean attributes just work)

##### Attribute Types

- **string** (default `''`): Attribute value used as-is
- **number** (default `0`): Attribute value parsed with `parseFloat()`
- **boolean** (default `false`): Presence means `true`, absence means `false`

For non-attribute properties (e.g. objects), just declare them as regular instance
properties on your class.

##### Migration from initAttributes()

Old (deprecated):

    class MyComponent extends Component {
      caption = ''
      count = 0

      constructor() {
        super()
        this.initAttributes('caption', 'count')
      }
    }

New:

    class MyComponent extends Component {
      static initAttributes = { caption: '', count: 0 }
    }

### Component methods

#### queueRender(triggerChangeEvent = false): void

Uses `requestAnimationFrame` to queue a call to the component's `render` method. If
called with `true` it will also trigger a `change` event.

#### private initValue(): void

**Don't call this!** Sets up expected behavior for an `HTMLElement` with
a value (i.e. triggering a `change` events and `render` when the `value` changes).

#### private hydrate(): void

**Don't call this** Appends `content` to the element (or its `shadowRoot` if it has a `styleNode`)

#### connectedCallback(): void

If the class has an `onResize` handler then a ResizeObserver will trigger `resize`
events on the element when its size changes and `onResize` will be set up to respond
to `resize` events.

Also, if the subclass has defined `value`, calls `initValue()`.

`connectedCallback` is a great place to attach **event-handlers** to elements in your component.

Be sure to call `super.connectedCallback()` if you implement `connectedCallback` in the subclass.

#### disconnectedCallback(): void

Be sure to call `super.disconnectedCallback()` if you implement `disconnectedCallback` in the subclass.

#### render(): void

Be sure to call `super.render()` if you implement `render` in the subclass.

### Component static properties

#### Component.elements

    const {label, span, input} = Component.elements

This is simply provided as a convenient way to get to [elements](/?elements.ts)

#### static formAssociated: boolean

Set `static formAssociated = true` in your subclass to enable form participation
via `ElementInternals`. When true, the component will have `this.internals` available
for form integration, validation, ARIA properties, and custom states.

Form-associated components are automatically made focusable (`tabindex="0"`) unless
you explicitly set a different `tabindex`. This is required for form validation to
work correctly (the browser needs to focus invalid elements).

This works without a shadow DOM.

#### value property

**If your component has a `value`, it should behave like an `<input>`.**

The `value` property is special in Component. It is NOT an attribute - it's a property
that can be *initialized* from an attribute. Here's what you need to know:

1. **Declare it with a default**: Simply assign a non-undefined default (e.g., `value = ''`)
2. **Initialization**: If a `value` attribute is present, it initializes the property (as a string)
3. **Setting value**: You can set it to any type directly (e.g., objects, arrays)
4. **Change events**: When `value` changes, a `change` event is automatically dispatched
5. **Auto-render**: When `value` changes, `render()` is automatically called
6. **Computed values**: If your value is computed, call `queueRender(true)` to trigger change + render

**Do NOT put `value` in `static initAttributes`** - it will be rejected with a warning.
The Component class handles `value` specially to provide form-like behavior automatically.

##### Form Integration Example

```js
import { Component, elements } from 'tosijs'

class FormInput extends Component {
  static formAssociated = true
  value = '' // property, not attribute!

  content = ({input}) => input({part: 'input', placeholder: 'Type here...'})

  connectedCallback() {
    super.connectedCallback()
    const input = this.parts.input
    input.addEventListener('input', () => {
      this.value = input.value
      this.internals.setFormValue(this.value)
      if (this.value.length < 3) {
        this.internals.setValidity({tooShort: true}, 'Min 3 characters', input)
        this.internals.states.add('invalid')
      } else {
        this.internals.setValidity({})
        this.internals.states.delete('invalid')
      }
    })
    input.addEventListener('focus', () => this.internals.states.add('focused'))
    input.addEventListener('blur', () => this.internals.states.delete('focused'))
  }

  render() {
    const input = this.parts.input
    if (input.value !== this.value) input.value = this.value
  }
}

const formInput = FormInput.elementCreator({tag: 'form-input'})
const {form, div, button} = elements

const output = div()
const myForm = form(
  formInput({name: 'username'}),
  button({type: 'submit'}, 'Submit')
)
myForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const fd = new FormData(e.target)
  output.textContent = 'FormData: ' + [...fd.entries()].map(([k,v]) => `${k}=${v}`).join(', ')
})

preview.append(myForm, output)
```
```css
.preview form { display: flex; gap: 8px; align-items: center; }
.preview form-input { display: block; }
.preview form-input input { padding: 8px; border: 2px solid var(--faint-text); border-radius: 4px; background: var(--input-bg); color: var(--text-color); }
.preview form-input:state(focused) input { border-color: var(--brand-color); }
.preview form-input:state(invalid) input { border-color: var(--error-color); }
```

##### Custom States Example

Custom states let you expose internal component state to CSS via the `:state()` pseudo-class.

```js
import { Component, elements } from 'tosijs'

class LoadingButton extends Component {
  static formAssociated = true
  loading = false

  content = ({slot}) => slot()

  async handleClick() {
    this.internals.states.add('loading')
    this.loading = true
    await new Promise(r => setTimeout(r, 1500))
    this.internals.states.delete('loading')
    this.loading = false
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', () => this.handleClick())
  }
}

const loadingButton = LoadingButton.elementCreator({tag: 'loading-button'})

preview.append(loadingButton('Click me to load'))
```
```css
.preview loading-button {
  display: inline-block;
  padding: 10px 20px;
  background: var(--brand-color);
  color: var(--button-text);
  border-radius: 4px;
  cursor: pointer;
}
.preview loading-button:state(loading) {
  opacity: 0.6;
  cursor: wait;
}
.preview loading-button:state(loading)::after {
  content: '...';
}
```

#### adoptedCallback

The `adoptedCallback` lifecycle method is called when a component is moved to a different
document, such as into or out of an iframe. Subclasses can implement this directly.

```js
import { Component, elements } from 'tosijs'

class AdoptableWidget extends Component {
  docCount = 0

  content = ({span}) => span({part: 'info'})

  adoptedCallback() {
    this.docCount++
    this.queueRender()
  }

  render() {
    this.parts.info.textContent = `Adopted ${this.docCount} time(s). Document: ${this.ownerDocument.title || 'untitled'}`
  }
}

const adoptableWidget = AdoptableWidget.elementCreator({tag: 'adoptable-widget'})
const {iframe, button, div, span} = elements

const widget = adoptableWidget()
const widgetSlot = span({class: 'widget-slot'}, widget)
const frame = iframe()
const moveBtn = button('Move to iframe')
const backBtn = button('Move back')

moveBtn.addEventListener('click', () => {
  frame.contentDocument.body.append(frame.contentDocument.adoptNode(widget))
})
backBtn.addEventListener('click', () => {
  widgetSlot.append(document.adoptNode(widget))
})

preview.append(widgetSlot, div(moveBtn, backBtn), frame)
```
```css
.preview .widget-slot {
  display: block;
  min-height: 40px;
  border: 2px dashed #888;
  margin-bottom: 10px;
}
.preview adoptable-widget {
  display: block;
  padding: 10px;
  background: #666;
  color: white;
}
.preview > div { display: flex; gap: 8px; margin-bottom: 10px; }
.preview iframe {
  width: 100%;
  height: 60px;
  border: 2px dashed #888;
  background: #fff;
}
```

### Component static methods

#### Component.elementCreator(options? {tag?: string, styleSpec: XinStyleSheet}): ElementCreator

    export const toolBar = ToolBar.elementCreator({tag: 'tool-bar'})

Returns a function that creates the custom-element. If you don't pass a `tag` or if the provided tag
is already in use, a new unique tag will be used.

If no tag is provided, the Component will try to use introspection to "snake-case" the
"ClassName", but if you're using name mangling this won't work and you'll get something
pretty meaningless.

If you want to create a global `<style>` sheet for the element (especially useful if
your component doesn't use the `shadowDOM`) then you can pass `styleSpec`. E.g.

    export const toolBar = ToolBar.elementCreator({
      tag: 'tool-bar',
      styleSpec: {
        ':host': { // note that ':host' will be turned into the tagName automatically!
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    })

This will—assuming "tool-bar" is available—create:

    <style id="tool-bar-helper">
      tool-bar {
        display: flex;
        padding: var(--toolbar-padding, 0 8px);
        gap: 4px;
      }
    <style>

And append it to `document.head` when the first instance of `<tool-bar>` is inserted in the DOM.

Finally, `elementCreator` is memoized and only generated once (and the arguments are
ignored on all subsequent calls).

## Examples

[tosijs-ui](https://ui.tosijs.net) is a component library built using this `Component` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [live-example](https://ui.tosijs.net/?live-example.ts) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [side-nav](https://ui.tosijs.net/?side-nav.ts) implements the sidebar navigation
  used on this site.
- [data-table](https://ui.tosijs.net/?data-table.ts) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [form and field](https://ui.tosijs.net/?form.ts) allow you to
  quickly create forms that leverage all the built-in functionality of `<input>`
  elements (including powerful validation) even for custom-fields.
- [markdown-viewer](https://ui.tosijs.net/?markdown-viewer.ts) uses `marked` to render
  markdown.
- [babylon-3d](https://ui.tosijs.net/?babylon-3d.ts) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)
*/
import { css } from './css'
import { XinStyleSheet } from './css-types'
import { deepClone } from './deep-clone'
import { appendContentToElement, dispatch, resizeObserver } from './dom'
import { ElementsProxy } from './elements-types'
import { elements } from './elements'
import { camelToKabob, kabobToCamel } from './string-case'
import { ElementCreator, ContentType, PartsMap } from './xin-types'
import { warnDeprecated } from './metadata'

let anonymousElementCount = 0

function anonElementTag(): string {
  return `custom-elt${(anonymousElementCount++).toString(36)}`
}
let instanceCount = 0

// Lazy shared MutationObserver for deprecated initAttributes
let legacyAttributeObserver: MutationObserver | null = null

function getLegacyAttributeObserver(): MutationObserver {
  if (legacyAttributeObserver === null) {
    legacyAttributeObserver = new MutationObserver((mutationsList) => {
      const componentsToRender = new Set<Component>()
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof Component
        ) {
          const component = mutation.target as Component
          const attrName = kabobToCamel(mutation.attributeName!)
          if (component._legacyTrackedAttrs?.has(attrName)) {
            componentsToRender.add(component)
          }
        }
      }
      for (const component of componentsToRender) {
        component.queueRender(false)
      }
    })
  }
  return legacyAttributeObserver
}

interface ElementCreatorOptions extends ElementDefinitionOptions {
  tag?: string
  styleSpec?: XinStyleSheet
}

const globalStyleSheets: {
  [key: string]: string
} = {}

function setGlobalStyle(tagName: string, styleSpec: XinStyleSheet) {
  const existing = globalStyleSheets[tagName]
  const processed = css(styleSpec).replace(/:host\b/g, tagName)
  globalStyleSheets[tagName] = existing
    ? existing + '\n' + processed
    : processed
}

function insertGlobalStyles(tagName: string) {
  if (globalStyleSheets[tagName]) {
    document.head.append(
      elements.style({ id: tagName + '-component' }, globalStyleSheets[tagName])
    )
  }
  delete globalStyleSheets[tagName]
}

export abstract class Component<T = PartsMap> extends HTMLElement {
  static elements: ElementsProxy = elements
  private static _elementCreator?: ElementCreator<Component>
  static initAttributes?: Record<string, any>
  static formAssociated?: boolean
  internals?: ElementInternals

  static get observedAttributes(): string[] {
    const initAttrs = this.initAttributes
    if (initAttrs) {
      return ['hidden', ...Object.keys(initAttrs).map(camelToKabob)]
    }
    return ['hidden']
  }
  instanceId!: string
  styleNode?: HTMLStyleElement
  static styleSpec?: XinStyleSheet
  static styleNode?: HTMLStyleElement
  content: ContentType | ((e: typeof elements) => ContentType) | null =
    elements.slot()
  isSlotted?: boolean
  private static _tagName: null | string = null
  static get tagName(): null | string {
    return this._tagName
  }
  [key: string]: any

  // For legacy initAttributes method - tracks which attrs this instance watches
  _legacyTrackedAttrs?: Set<string>
  // Tracks attribute values for property accessors
  private _attrValues?: Map<string, any>

  static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement {
    console.warn(
      'StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly'
    )
    return elements.style(css(styleSpec))
  }

  static elementCreator<C = Component>(
    this: new () => C,
    options: ElementCreatorOptions = {}
  ): ElementCreator<C> {
    const componentClass = this as unknown as Component
    if (componentClass._elementCreator == null) {
      const { tag, styleSpec } = options
      let tagName = options != null ? tag : null
      if (tagName == null) {
        if (
          typeof componentClass.name === 'string' &&
          componentClass.name !== ''
        ) {
          tagName = camelToKabob(componentClass.name)
          if (tagName.startsWith('-')) {
            tagName = tagName.slice(1)
          }
        } else {
          tagName = anonElementTag()
        }
      }
      if (customElements.get(tagName) != null) {
        console.warn(`${tagName} is already defined`)
      }
      if (tagName.match(/\w+(-\w+)+/) == null) {
        console.warn(`${tagName} is not a legal tag for a custom-element`)
        tagName = anonElementTag()
      }
      while (customElements.get(tagName) !== undefined) {
        tagName = anonElementTag()
      }
      componentClass._tagName = tagName
      if (styleSpec !== undefined) {
        setGlobalStyle(tagName, styleSpec)
      }
      window.customElements.define(
        tagName,
        this as unknown as CustomElementConstructor,
        options
      )
      componentClass._elementCreator = elements[tagName]
    }
    return componentClass._elementCreator
  }

  /**
   * @deprecated Use static initAttributes instead.
   * Example:
   *   static initAttributes = { caption: '', count: 0, disabled: false }
   */
  initAttributes(...attributeNames: string[]): void {
    warnDeprecated(
      'initAttributes',
      'initAttributes() is deprecated. Use static initAttributes = { ... } instead.'
    )

    // Track which attributes this instance is watching via legacy mechanism
    if (!this._legacyTrackedAttrs) {
      this._legacyTrackedAttrs = new Set()
    }
    for (const name of attributeNames) {
      this._legacyTrackedAttrs.add(name)
    }

    // Use shared MutationObserver instead of per-instance observer
    const observer = getLegacyAttributeObserver()
    observer.observe(this, { attributes: true })

    const attributes: { [key: string]: any } = {}
    const attributeValues: { [key: string]: any } = {}

    attributeNames.forEach((attributeName) => {
      attributes[attributeName] = deepClone(this[attributeName])
      const attributeKabob = camelToKabob(attributeName)
      Object.defineProperty(this, attributeName, {
        enumerable: false,
        get() {
          if (typeof attributes[attributeName] === 'boolean') {
            return this.hasAttribute(attributeKabob)
          } else {
            if (this.hasAttribute(attributeKabob)) {
              return typeof attributes[attributeName] === 'number'
                ? parseFloat(this.getAttribute(attributeKabob))
                : this.getAttribute(attributeKabob)
            } else if (attributeValues[attributeName] !== undefined) {
              return attributeValues[attributeName]
            } else {
              return attributes[attributeName]
            }
          }
        },
        set(value) {
          if (typeof attributes[attributeName] === 'boolean') {
            if (value !== this[attributeName]) {
              if (value) {
                this.setAttribute(attributeKabob, '')
              } else {
                this.removeAttribute(attributeKabob)
              }
              this.queueRender()
            }
          } else if (typeof attributes[attributeName] === 'number') {
            if (value !== parseFloat(this[attributeName])) {
              this.setAttribute(attributeKabob, value)
              this.queueRender()
            }
          } else {
            if (
              typeof value === 'object' ||
              `${value as string}` !== `${this[attributeName] as string}`
            ) {
              if (
                value === null ||
                value === undefined ||
                typeof value === 'object'
              ) {
                this.removeAttribute(attributeKabob)
              } else {
                this.setAttribute(attributeKabob, value)
              }
              this.queueRender()
              attributeValues[attributeName] = value
            }
          }
        },
      })
    })
  }

  private initValue(): void {
    const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value')
    if (
      valueDescriptor === undefined ||
      valueDescriptor.get !== undefined ||
      valueDescriptor.set !== undefined
    ) {
      return
    }
    let value = this.hasAttribute('value')
      ? this.getAttribute('value')
      : deepClone(this.value)
    delete this.value
    Object.defineProperty(this, 'value', {
      enumerable: false,
      get() {
        return value
      },
      set(newValue: any) {
        if (value !== newValue) {
          value = newValue
          this.queueRender(true)
        }
      },
    })
  }

  private _parts?: T
  get parts(): T {
    const root = this.shadowRoot != null ? this.shadowRoot : this
    if (this._parts == null) {
      this._parts = new Proxy(
        {},
        {
          get(target: any, ref: string) {
            if (target[ref] === undefined) {
              let element = root.querySelector(`[part="${ref}"]`)
              if (element == null) {
                element = root.querySelector(ref)
              }
              if (element == null)
                throw new Error(`elementRef "${ref}" does not exist!`)
              element.removeAttribute('data-ref')
              target[ref] = element as Element
            }
            return target[ref]
          },
        }
      ) as T
    }
    return this._parts
  }

  /**
   * Native web component callback for attribute changes.
   * Only called for attributes declared in static observedAttributes.
   */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Convert kabob-case attribute to camelCase property name
    const propName = kabobToCamel(name)
    // Only queue render if this isn't a legacy-tracked attr (those use MutationObserver)
    if (!this._legacyTrackedAttrs?.has(propName)) {
      this.queueRender(false)
    }
  }

  constructor() {
    super()
    instanceCount += 1

    // Attach ElementInternals for form-associated components
    // Only call once - attachInternals() throws if called more than once
    if (
      (this.constructor as typeof Component).formAssociated &&
      typeof this.attachInternals === 'function' &&
      !this.internals
    ) {
      this.internals = this.attachInternals()
    }

    // Set up property accessors from static initAttributes
    const initAttrs = (this.constructor as typeof Component).initAttributes
    if (initAttrs) {
      this._setupAttributeAccessors(initAttrs)
    }

    this.instanceId = `${this.tagName.toLocaleLowerCase()}-${instanceCount}`
    this._value = deepClone(this.defaultValue)
  }

  /**
   * Sets up property accessors from static initAttributes.
   */
  private _setupAttributeAccessors(initAttrs: Record<string, any>): void {
    if (!this._attrValues) {
      this._attrValues = new Map()
    }

    for (const attrName of Object.keys(initAttrs)) {
      const attrKabob = camelToKabob(attrName)
      const defaultValue = initAttrs[attrName]

      // 'value' is a property, not an attribute - use Component's built-in value handling
      if (attrName === 'value') {
        console.warn(
          `${this.tagName}: 'value' cannot be an attribute. Use the Component value property instead.`
        )
        continue
      }

      // Skip objects - attributes must be serializable (string, number, boolean)
      if (typeof defaultValue === 'object' && defaultValue !== null) {
        console.warn(
          `${this.tagName}: initAttributes.${attrName} is an object. Use a regular property instead.`
        )
        continue
      }

      // Skip if already set up (e.g., by legacy initAttributes) or not configurable
      // Check prototype chain for non-configurable properties (e.g., 'name' on Element)
      let proto: object | null = this
      let isNonConfigurable = false
      while (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, attrName)
        if (descriptor) {
          if (!descriptor.configurable || descriptor.get || descriptor.set) {
            isNonConfigurable = true
            break
          }
          break
        }
        proto = Object.getPrototypeOf(proto)
      }
      if (isNonConfigurable) {
        continue
      }

      Object.defineProperty(this, attrName, {
        enumerable: false,
        get: () => {
          if (typeof defaultValue === 'boolean') {
            return this.hasAttribute(attrKabob)
          } else if (this.hasAttribute(attrKabob)) {
            return typeof defaultValue === 'number'
              ? parseFloat(this.getAttribute(attrKabob)!)
              : this.getAttribute(attrKabob)
          } else if (this._attrValues!.has(attrName)) {
            return this._attrValues!.get(attrName)
          } else {
            return defaultValue
          }
        },
        set: (value: any) => {
          if (typeof defaultValue === 'boolean') {
            if (value !== this[attrName]) {
              if (value) {
                this.setAttribute(attrKabob, '')
              } else {
                this.removeAttribute(attrKabob)
              }
              this.queueRender()
            }
          } else if (typeof defaultValue === 'number') {
            if (value !== parseFloat(this[attrName])) {
              this.setAttribute(attrKabob, value)
              this.queueRender()
            }
          } else {
            if (
              typeof value === 'object' ||
              `${value as string}` !== `${this[attrName] as string}`
            ) {
              if (
                value === null ||
                value === undefined ||
                typeof value === 'object'
              ) {
                this.removeAttribute(attrKabob)
              } else {
                this.setAttribute(attrKabob, value)
              }
              this.queueRender()
              this._attrValues!.set(attrName, value)
            }
          }
        },
      })
    }
  }

  connectedCallback(): void {
    insertGlobalStyles((this.constructor as unknown as Component).tagName)
    this.hydrate()
    // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
    if (this.role != null) this.setAttribute('role', this.role)
    // Form-associated components must be focusable for validation to work
    if (
      (this.constructor as typeof Component).formAssociated &&
      !this.hasAttribute('tabindex')
    ) {
      this.setAttribute('tabindex', '0')
    }
    if (this.onResize !== undefined) {
      resizeObserver.observe(this)
      if (this._onResize == null) {
        this._onResize = this.onResize.bind(this)
      }
      this.addEventListener('resize', this._onResize)
    }
    if (this.value != null && this.getAttribute('value') != null) {
      this._value = this.getAttribute('value')
    }
    this.queueRender()
  }

  disconnectedCallback(): void {
    resizeObserver.unobserve(this)
  }

  private _changeQueued = false
  private _renderQueued = false
  queueRender(triggerChangeEvent = false): void {
    if (!this._hydrated) return
    if (!this._changeQueued) this._changeQueued = triggerChangeEvent
    if (!this._renderQueued) {
      this._renderQueued = true
      requestAnimationFrame(() => {
        // TODO add mechanism to allow component developer to have more control over
        // whether input vs. change events are emitted
        if (this._changeQueued) dispatch(this, 'change')
        this._changeQueued = false
        this._renderQueued = false
        this.render()
      })
    }
  }

  private _hydrated = false
  private hydrate(): void {
    if (!this._hydrated) {
      this.initValue()
      const cloneElements = typeof this.content !== 'function'
      const _content: ContentType | null =
        typeof this.content === 'function'
          ? this.content(elements)
          : this.content

      const { styleSpec } = this.constructor as unknown as Component
      let { styleNode } = this.constructor as unknown as Component
      if (styleSpec) {
        styleNode = (this.constructor as unknown as Component).styleNode =
          elements.style(css(styleSpec))
        delete (this.constructor as unknown as Component).styleNode
      }
      if (this.styleNode) {
        console.warn(
          this,
          'styleNode is deprecrated, use static styleNode or statc styleSpec instead'
        )
        styleNode = this.styleNode
      }
      if (styleNode) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(styleNode.cloneNode(true))
        appendContentToElement(shadow, _content, cloneElements)
      } else if (_content !== null) {
        const existingChildren = Array.from(this.childNodes)
        appendContentToElement(this as HTMLElement, _content, cloneElements)
        this.isSlotted = this.querySelector('slot,xin-slot') !== undefined
        const slots = Array.from(this.querySelectorAll('slot'))
        if (slots.length > 0) {
          slots.forEach(XinSlot.replaceSlot)
        }
        if (existingChildren.length > 0) {
          const slotMap: { [key: string]: Element } = { '': this }
          Array.from(this.querySelectorAll('xin-slot')).forEach((slot) => {
            slotMap[(slot as XinSlot).name] = slot
          })
          existingChildren.forEach((child) => {
            const defaultSlot = slotMap['']
            const destSlot =
              child instanceof Element ? slotMap[child.slot] : defaultSlot
            ;(destSlot !== undefined ? destSlot : defaultSlot).append(child)
          })
        }
      }
      this._hydrated = true
    }
  }

  render(): void {}
}

interface SlotParts extends PartsMap {
  slotty: HTMLSlotElement
}

class XinSlot extends Component<SlotParts> {
  static initAttributes = { name: '' }
  content = null

  static replaceSlot(slot: HTMLSlotElement): void {
    const _slot = document.createElement('xin-slot')
    if (slot.name !== '') {
      _slot.setAttribute('name', slot.name)
    }
    slot.replaceWith(_slot)
  }
}

export const xinSlot = XinSlot.elementCreator({ tag: 'xin-slot' })
