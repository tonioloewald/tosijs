/*{ "order": 6, "description": "The Component base class for building custom elements with tosijs: light-DOM by default, automatic slot composition, initAttributes, form association." }*/
/*#
# Web-Components

**tosijs** provides the abstract `Component` class to make defining custom-elements
easier.

- `Component` leverages the [elements](/elements/) proxy and [css](/css/) to make
defining elements very efficient.
- `Component` makes it easy to create custom-elements with
no shadowDOM but with slotting behavior so your elements are lighter weight and
easier to style.
- It solves friction points like allowing element tagNames to be changed on-the-fly to avoid registry clashes.
- It allows you to deploy `Component` classes as zero dependency [blueprints](/blueprint-loader/) functions.

## Component

To define a custom-element you can subclass `Component`, simply add the properties
and methods you want, with some help from `Component` itself, and then simply
export your new class's `elementCreator()` which is a function that defines your
new component's element and produces instances of it as needed.

```
import {Component} from 'tosijs'

class ToolBar extends Component {
  static preferredTagName = 'tool-bar'
  static shadowStyleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator()
```

> **Note**: Custom elements default to `display: inline`, which often causes them to
> appear dimensionless. Unless you want this (e.g., for content-holder elements),
> set an explicit `display` value (e.g., `block`, `inline-block`, `flex`) in your
> `:host` styles.

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

`static preferredTagName` sets the desired tag name for the custom element.
If omitted, it is derived from the class name (e.g. `ToolBar` → `tool-bar`),
but this does not survive minification. `elementCreator()` returns an
`ElementCreator` function that creates instances of the element.

See [elements](/elements/) for more information on `ElementCreator` functions.

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

(Note that **data bindings do not operate inside a shadowDOM** — binding dispatch
cannot "see" elements there, and a component that tries now gets a console warning
instead of silent failure. The semantically correct model: **a component with a
shadowDOM is bound like an `<input>` or `<textarea>` — its `value` is the binding
surface.** Bind the component itself (e.g. `bindings.value`) from outside; setting
`value` automatically queues `render()` and emits `change`, so implement `render()`
to reflect `value` into the shadow DOM and let `change` events carry edits back out.
How the component represents its value internally is the implementer's business —
which also means shadow components don't compose *bindings* internally: wiring
nested widgets inside a shadow tree is manual (set their `value` in `render()`,
listen to their events). A shadowDOM component is materially a different thing than
a lightDOM component. For non-value internal state, `observe()` + `parts`, with
`unobserve()` on disconnect. **Event sugar is the exception**: `on()` handlers work
inside open shadow roots — composed events cross the boundary and the dispatcher
resolves the true origin via `composedPath()`.)

##### ElementProps in content arrays

When `content` returns an array, any plain objects (ElementProps) in the array are
applied to the **host element** itself, just as they would be applied to the element
being created by `div()`, `span()`, etc. This provides a clean way to set up styles,
event handlers, classes, and bindings on the component from within `content`:

```
class MyButton extends Component {
  static preferredTagName = 'my-button'

  content = ({span}) => [
    { onClick: () => console.log('clicked!'), style: { cursor: 'pointer' } },
    span({part: 'label'}, 'Click me'),
  ]
}
```

Multiple ElementProps objects are merged (later values override earlier ones).
Only plain objects are treated as props — DOM nodes, strings, numbers, and proxied
values pass through as children.

If you'd like to see a more complex example along the same lines, look at
[form and field](https://ui.tosijs.net/form/).

##### <slot> names and the `slot` attribute

```
class MenuBar extends Component {
  static shadowStyleSpec = {
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

#### `<tosi-slot>`

If you put `<slot>` elements inside a `Component` subclass that doesn't have a
shadowDOM, they will automatically be replaced with `<tosi-slot>` elements that
have the expected behavior (i.e. sucking in children in based on their `<slot>`
attribute).

`<tosi-slot>` doesn't support `:slotted` but since there's no shadowDOM, just
style such elements normally, or use `tosi-slot` as a CSS-selector.

Note that you cannot give a `<slot>` element attributes (other than `name`) so if
you want to give a `<tosi-slot>` attributes (such as `class` or `style`), create it
explicitly (e.g. using `elements.tosiSlot()`) rather than using `<slot>` elements
and letting them be switched out (because they'll lose any attributes you give them).

> The legacy name `<xin-slot>` still works but emits a deprecation warning.

Here's a very simple example:

```js
import { Component, elements } from 'tosijs'

class FauxSlotExample extends Component {
  content = ({h4, h5, tosiSlot}) => [
    h4('This is a web-component with no shadow DOM and working slots!'),
    h5('top slot'),
    tosiSlot({name: 'top'}),
    h5('middle slot'),
    tosiSlot(),
    h5('bottom slot'),
    tosiSlot({name: 'bottom'}),
  ]
}

FauxSlotExample.preferredTagName = 'faux-slot-example'
FauxSlotExample.lightStyleSpec = {
  ':host': {
    display: 'flex',
    flexDirection: 'column'
  },
  ':host h4, :host h5': {
    margin: 0,
  },
  ':host tosi-slot': {
    border: '2px solid grey'
  }
}
const fauxSlotExample = FauxSlotExample.elementCreator()

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
> terrible for composite views and excludes `tosijs`'s data bindings (inside the
> shadow DOM you manage state updates yourself with `observe()` + `parts`;
> `on()` event handlers do work there via `composedPath()`).

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

> **Note**: For form-associated components, `super.render()` syncs the form value
> automatically when the value changes. Always call `super.render()` if you override
> `render()` in a form-associated component.
>
> It is *necessary* to call `super.connectedCallback`, `super.disconnectedCallback`,
> `super.render()` (for form-associated), and `super()` in the `constructor()`
> should you override them.

`this.parts` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

`this.parts.foo` will return a content element with `data-ref="foo"`. If no such
element is found it tries it as a css selector, so `this.parts['.foo']` would find
a content element with `class="foo"` while `this.parts.h1` will find an `<h1>`.

`this.parts` will also remove a `data-ref` attribute once it has been used to find
the element. This means that if you use all your refs in `render` or `connectedCallback`
then no trace will remain in the DOM for a mounted element.

`parts` only resolves after **hydration** — the content it looks through is
instantiated on `connectedCallback`, not at construction. Reading `parts` on an
uninserted element (e.g. one just back from `elementCreator()`) has nothing to find.
If a public getter needs a ref before the element is guaranteed inserted, gate it on
`this.hydrated` or `await this.whenHydrated` first. (Prior to this you could not ask
whether an element was hydrated without probing `parts`, and that probe permanently
bound the proxy to the light DOM.)

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

> Note that if a component does not use the shadowDOM, its `<slot>` elements will be replaced with `<tosi-slot>` elements.
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

If the class has a `handleResize` handler then a ResizeObserver will trigger
`resize` events on the element when its size changes and `handleResize` will be
set up to respond to them. (The legacy name `onResize` still works but is
deprecated — the `on<Event>` prefix is reserved for event-handler sugar in the
[elements](/elements/) factory, so component callbacks use the `handle<Event>`
convention instead.)

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

This is simply provided as a convenient way to get to [elements](/elements/)

#### static formAssociated: boolean

Set `static formAssociated = true` in your subclass to enable form participation
via `ElementInternals`. When true, the component will have `this.internals` available
for form integration, validation, ARIA properties, and custom states.

Form-associated components are automatically made focusable (`tabindex="0"`) unless
you explicitly set a different `tabindex`. This is required for form validation to
work correctly (the browser needs to focus invalid elements).

See [web-component-validation](/form-validation/) for the complete validation
API documentation, including:

- Validation methods (`checkValidity()`, `reportValidity()`, `setValidity()`)
- Automatic validation against HTML attributes (`required`, `minlength`, `maxlength`, `pattern`)
- Form lifecycle callbacks (`formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`)
- Custom states via `this.internals.states`
- Complete examples

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

AdoptableWidget.preferredTagName = 'adoptable-widget'
const adoptableWidget = AdoptableWidget.elementCreator()
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

### Component static properties

#### `static preferredTagName?: string`

Sets the desired tag name for the custom element. If omitted, it is derived
from the class name (e.g. `ToolBar` → `tool-bar`), but this does **not** survive
minification. If the tag is already in use, a unique anonymous tag is generated.

#### `static shadowStyleSpec?: XinStyleSheet`

Styles injected into the component's shadow DOM as a `<style>` element.
Setting this property causes the component to use shadow DOM.

#### `static lightStyleSpec?: XinStyleSheet`

Global styles appended to `document.head` when the first instance is inserted
in the DOM. `:host` selectors are automatically rewritten to the tag name, e.g.:

    class ToolBar extends Component {
      static preferredTagName = 'tool-bar'
      static lightStyleSpec = {
        ':host': {
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    }

produces `tool-bar { display: flex; ... }` in a global `<style>` element.

#### `static extends?: string`

For customized built-in elements. Passed as `{ extends }` to `customElements.define()`.

### Component static methods

#### Component.elementCreator(): ElementCreator

    export const toolBar = ToolBar.elementCreator()

Returns a function that creates the custom-element. Registration uses
`preferredTagName`, `lightStyleSpec`, `shadowStyleSpec`, and `extends`
from the class's static properties.

`elementCreator` is memoized and only generated once.

> **Deprecated:** Passing `{ tag, styleSpec, extends }` as options to
> `elementCreator()` still works but emits deprecation warnings.
> Use the static properties instead.

## Examples

[tosijs-ui](https://ui.tosijs.net) is a component library built using this `Component` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [live-example](https://ui.tosijs.net/live-example/) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [side-nav](https://ui.tosijs.net/side-nav/) implements the sidebar navigation
  used on this site.
- [data-table](https://ui.tosijs.net/data-table/) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [form and field](https://ui.tosijs.net/form/) allow you to
  quickly create forms that leverage all the built-in functionality of `<input>`
  elements (including powerful validation) even for custom-fields.
- [markdown-viewer](https://ui.tosijs.net/markdown-viewer/) uses `marked` to render
  markdown.
- [babylon-3d](https://ui.tosijs.net/babylon-3d/) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)
*/
import { css } from './css'
import { XinStyleSheet } from './css-types'
import { deepClone } from './deep-clone'
import { appendContentToElement, dispatch, resizeObserver } from './dom'
import { ElementsProxy } from './elements-types'
import { elements, elementSet } from './elements'
import { tosiPath } from './metadata'
import { validateAgainstConstraints } from './form-validation'
import { camelToKabob, kabobToCamel } from './string-case'
import { ElementCreator, ContentType, PartsMap } from './xin-types'
import { warnDeprecated, BOUND_SELECTOR } from './metadata'

let anonymousElementCount = 0

function anonElementTag(): string {
  return `custom-elt${(anonymousElementCount++).toString(36)}`
}
let instanceCount = 0

// Component classes already warned about inert bind/on sugar in shadow content
const warnedShadowContentBindings = new Set<string>()

// Component classes already warned about class fields shadowing initAttributes
const warnedFieldShadowedAttrs = new Set<string>()

// Marks a prototype whose connectedCallback has already been wrapped to drain
// deferred constructor-time attribute ops before the subclass body runs.
const DRAIN_WRAPPED = Symbol('tosiDrainWrapped')

// Classes already checked for on<Event>-named member collisions (warn once each).
const handlerCollisionChecked = new WeakSet<new () => Component>()

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
  const processed = css(styleSpec)
    .replace(/:host\(([^)]+)\)/g, `${tagName}$1`)
    .replace(/:host\b/g, tagName)
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
  static preferredTagName?: string
  static shadowStyleSpec?: XinStyleSheet
  static lightStyleSpec?: XinStyleSheet
  static extends?: string
  internals?: ElementInternals

  // Form validation API - delegated to internals when formAssociated
  get validity(): ValidityState | undefined {
    return this.internals?.validity
  }

  get validationMessage(): string {
    return this.internals?.validationMessage ?? ''
  }

  get willValidate(): boolean {
    return this.internals?.willValidate ?? false
  }

  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true
  }

  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true
  }

  setCustomValidity(message: string): void {
    if (this.internals) {
      if (message) {
        this.internals.setValidity({ customError: true }, message)
      } else {
        this.internals.setValidity({})
      }
    }
  }

  /**
   * Set validation state. Pass empty flags {} to clear validity.
   * The anchor element is used for focus when reportValidity() is called.
   */
  setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement
  ): void {
    this.internals?.setValidity(flags, message, anchor)
  }

  /**
   * Set the form value. Call this when your component's value changes.
   */
  setFormValue(
    value: File | string | FormData | null,
    state?: File | string | FormData | null
  ): void {
    this.internals?.setFormValue(value, state)
  }

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
  // Tracks whether value changed (for form sync in render)
  private _valueChanged = false
  // Queue of attribute mutations deferred from the constructor (see
  // _installAttributeQueue / _drainPendingAttrOps).
  private _pendingAttrOps?: Array<['set', string, string] | ['remove', string]>

  static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement {
    console.warn('StyleNode is deprecated, use static shadowStyleSpec instead')
    return elements.style(css(styleSpec))
  }

  static elementCreator<C = Component>(
    this: new () => C,
    options: ElementCreatorOptions = {}
  ): ElementCreator<C> {
    const componentClass = this as unknown as Component
    if (
      !Object.prototype.hasOwnProperty.call(componentClass, '_elementCreator')
    ) {
      // Deprecation warnings for options-based API
      if (options.tag !== undefined) {
        warnDeprecated(
          'elementCreator-tag',
          'Passing tag to elementCreator() is deprecated. Use static preferredTagName instead.'
        )
      }
      if (options.styleSpec !== undefined) {
        warnDeprecated(
          'elementCreator-styleSpec',
          'Passing styleSpec to elementCreator() is deprecated. Use static lightStyleSpec instead.'
        )
      }
      if (options.extends !== undefined) {
        warnDeprecated(
          'elementCreator-extends',
          'Passing extends to elementCreator() is deprecated. Use static extends instead.'
        )
      }

      // Resolve tag: options.tag > static preferredTagName > camelToKabob > anon
      let tagName: string | null | undefined =
        options.tag ?? componentClass.preferredTagName
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

      // Resolve light style spec: options.styleSpec > static lightStyleSpec
      const lightStyleSpec = options.styleSpec ?? componentClass.lightStyleSpec
      if (lightStyleSpec !== undefined) {
        setGlobalStyle(tagName, lightStyleSpec)
      }

      // Resolve extends: options.extends > static extends
      const extendsTag = options.extends ?? componentClass.extends
      const defineOptions: ElementDefinitionOptions | undefined = extendsTag
        ? { extends: extendsTag }
        : undefined

      // Guarantee the deferred-attribute drain (see _installAttributeQueue)
      // runs BEFORE the subclass's connectedCallback body — regardless of
      // whether or when the subclass calls super.connectedCallback(). The
      // platform invokes the most-derived connectedCallback, so wrap it on the
      // concrete prototype to drain first. Without this, a subclass that reads
      // an initAttributes-backed attribute (e.g. getAttribute('url')) or fires
      // an event before calling super would observe the pre-drain default —
      // the value set via `el.foo = …` between createElement and a synchronous
      // append is queued, not yet reflected to the DOM.
      const proto = (this as unknown as { prototype: any }).prototype
      if (
        proto != null &&
        !Object.prototype.hasOwnProperty.call(proto, DRAIN_WRAPPED)
      ) {
        const inner = proto.connectedCallback as undefined | (() => void)
        proto.connectedCallback = function (this: Component): void {
          const self = this as unknown as { _drainPendingAttrOps(): void }
          self._drainPendingAttrOps()
          if (inner) inner.call(this)
        }
        Object.defineProperty(proto, DRAIN_WRAPPED, {
          value: true,
          enumerable: false,
        })
      }

      window.customElements.define(
        tagName,
        this as unknown as CustomElementConstructor,
        defineOptions
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
          this._valueChanged = true
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
    // When the attribute is removed externally (el.removeAttribute), drop the
    // in-memory fallback so the getter returns the default instead of the last
    // property value — otherwise the fallback masked the removal forever.
    if (_newValue === null && this._attrValues?.has(propName)) {
      this._attrValues.delete(propName)
    }
    // Only queue render if this isn't a legacy-tracked attr (those use MutationObserver)
    if (!this._legacyTrackedAttrs?.has(propName)) {
      this.queueRender(false)
    }
  }

  constructor() {
    super()
    instanceCount += 1

    // The custom-elements spec forbids a constructor from "gaining
    // attributes." Property setters generated by `static initAttributes`
    // (and the legacy `initAttributes()` method) reflect to the DOM via
    // setAttribute, so any property assignment during construction —
    // class-field initializers or subclass constructor bodies — would
    // violate the spec. Install per-instance setAttribute/removeAttribute
    // overrides that queue calls. The queue drains either at the top of
    // connectedCallback (parser-upgrade path) or via a microtask
    // (createElement path), whichever fires first. Drain is idempotent.
    this._installAttributeQueue()

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

    this._warnOnHandlerCollisions()
  }

  // Warn (once per class) when a subclass defines an `on<Event>`-named member.
  // The elements factory treats `on<Event>` prop names as event-handler sugar
  // (`creator({ onClick })` attaches a `click` listener via `on()`), so such a
  // member is shadowed and can never be assigned/read through the element
  // creator. Deferred to a microtask because arrow-function class fields
  // (`onClick = () => …`) are set AFTER the base constructor runs.
  private _warnOnHandlerCollisions(): void {
    const ctor = this.constructor as unknown as new () => Component
    if (handlerCollisionChecked.has(ctor)) return
    handlerCollisionChecked.add(ctor)
    queueMicrotask(() => {
      const names = new Set<string>()
      for (const key of Object.keys(this)) {
        if (/^on[A-Z]/.test(key)) names.add(key)
      }
      let proto = Object.getPrototypeOf(this)
      while (proto && proto !== Component.prototype) {
        for (const key of Object.getOwnPropertyNames(proto)) {
          if (/^on[A-Z]/.test(key)) names.add(key)
        }
        proto = Object.getPrototypeOf(proto)
      }
      const tag = this.tagName.toLowerCase()
      // onResize is the legacy resize hook — still honored, but deprecated in
      // favor of handleResize (the on<Event> prefix is reserved for event sugar).
      const usesLegacyOnResize =
        names.delete('onResize') && this.handleResize === undefined
      if (usesLegacyOnResize) {
        console.warn(
          `<${tag}> defines 'onResize', which is deprecated. Rename it to ` +
            `'handleResize'. The on<Event> prefix is reserved for event-handler ` +
            `sugar in the elements factory (creator({ onResize }) would attach a ` +
            `'resize' listener) and is being retired for component callbacks in ` +
            `favor of the handle<Event> convention.`
        )
      }
      if (names.size === 0) return
      const list = Array.from(names, (n) => `'${n}'`).join(', ')
      console.warn(
        `<${tag}> defines ${list}. The elements factory treats on<Event> property ` +
          `names as event-handler sugar — e.g. creator({ onClick }) attaches a ` +
          `'click' listener rather than assigning the property — so these members ` +
          `are shadowed and cannot be set or read via the element creator. Rename ` +
          `them with the handle<Event> convention (e.g. 'handleClick') to keep ` +
          `them usable as component members.`
      )
    })
  }

  private _installAttributeQueue(): void {
    // Only mask setAttribute/removeAttribute for attribute NAMES declared in
    // `static initAttributes`. Those are the names whose setAttribute calls
    // can be auto-triggered by the property setters we generate — which is
    // the only spec-violation surface we set out to fix. Anything else
    // (Element.part assigning through to setAttribute, slot/name on
    // composition primitives, internal platform reflection, user code
    // calling setAttribute directly with some other name) goes straight
    // through, because intercepting it broke composition in tosijs-ui
    // (parts proxy couldn't find a `[part="…"]` whose attribute hadn't
    // landed yet) and the spec violation it would have caused is just a
    // Chrome warning — all browsers actually run the code.
    const initAttrs = (this.constructor as typeof Component).initAttributes
    if (!initAttrs) return
    const guarded = new Set(Object.keys(initAttrs).map(camelToKabob))
    const queue: Array<['set', string, string] | ['remove', string]> = []
    this._pendingAttrOps = queue
    const proto = HTMLElement.prototype
    ;(this as any).setAttribute = (name: string, value: any) => {
      if (guarded.has(name)) {
        queue.push(['set', name, String(value)])
      } else {
        proto.setAttribute.call(this, name, value)
      }
    }
    ;(this as any).removeAttribute = (name: string) => {
      if (guarded.has(name)) {
        queue.push(['remove', name])
      } else {
        proto.removeAttribute.call(this, name)
      }
    }
    queueMicrotask(() => this._drainPendingAttrOps())
  }

  private _drainPendingAttrOps(): void {
    const queue = this._pendingAttrOps
    if (queue === undefined) return
    this._pendingAttrOps = undefined
    delete (this as any).setAttribute
    delete (this as any).removeAttribute
    // Snapshot which attributes exist BEFORE replay: those were set by the
    // parser (pre-upgrade markup) and win over queued default reflections.
    // The guard must consult this snapshot, not live hasAttribute() — an
    // attribute landed by an EARLIER op in this same queue would otherwise
    // block later ops, making the drain first-write-wins and silently
    // dropping the second of two pre-connect property writes.
    const preExisting = new Set<string>()
    for (const op of queue) {
      if (this.hasAttribute(op[1])) preExisting.add(op[1])
    }
    for (const op of queue) {
      if (op[0] === 'set') {
        if (!preExisting.has(op[1])) this.setAttribute(op[1], op[2])
      } else {
        // an explicit remove consciously discards the parser-set value, so
        // a later queued set for the same attribute must land
        preExisting.delete(op[1])
        this.removeAttribute(op[1])
      }
    }
  }

  /**
   * Sets up property accessors from static initAttributes.
   */
  // initAttributes accessors actually installed on this instance — the set
  // field-shadow recovery consults (names skipped for other reasons must not
  // be "restored")
  private _installedAttrAccessors?: Set<string>

  private _setupAttributeAccessors(initAttrs: Record<string, any>): void {
    if (!this._attrValues) {
      this._attrValues = new Map()
    }
    if (!this._installedAttrAccessors) {
      this._installedAttrAccessors = new Set()
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

      // Boolean attributes are false-by-default in HTML: presence = true, absence
      // = false. A reflected boolean attribute cannot default to true — the element
      // would have to "gain" the attribute during construction (which the custom-
      // elements spec forbids), so a true default silently reads back as false.
      // Reject it loudly rather than surprise the developer.
      if (defaultValue === true) {
        throw new Error(
          `${this.tagName}: static initAttributes.${attrName} defaults a boolean attribute to true, ` +
            `but HTML boolean attributes are false-by-default (presence = true, absence = false) and ` +
            `cannot reflect a true default — it would silently become false. Use { ${attrName}: false }, ` +
            `or model it as a string/number attribute or a plain (non-attribute) property.`
        )
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

      this._installAttrAccessor(attrName, attrKabob, defaultValue)
    }
  }

  private _installAttrAccessor(
    attrName: string,
    attrKabob: string,
    defaultValue: any
  ): void {
    Object.defineProperty(this, attrName, {
      enumerable: false,
      // configurable, so a leftover subclass class field ([[Define]]
      // semantics — the default for ES2022 targets) replaces the accessor
      // instead of throwing a cryptic TypeError out of document.createElement.
      // connectedCallback detects the replacement, warns, and restores the
      // accessor, adopting the field's value (see _recoverShadowedAttrAccessors).
      configurable: true,
      get: () => {
        // DOM attribute wins over the in-memory fallback so external
        // setAttribute calls remain observable. The fallback covers the
        // window between a property assignment and its (possibly deferred)
        // DOM reflection.
        if (typeof defaultValue === 'boolean') {
          if (this.hasAttribute(attrKabob)) return true
          if (this._attrValues!.has(attrName))
            return this._attrValues!.get(attrName)
          return false
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
            this._attrValues!.set(attrName, !!value)
          }
        } else if (typeof defaultValue === 'number') {
          if (value !== parseFloat(this[attrName])) {
            this.setAttribute(attrKabob, value)
            this.queueRender()
            this._attrValues!.set(attrName, value)
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
    this._installedAttrAccessors!.add(attrName)
  }

  // A subclass instance field named after a static initAttribute replaces the
  // generated accessor with a plain data property (class fields use [[Define]]
  // semantics), silently severing attribute reflection. Detect the
  // replacement at connect, restore the accessor, and adopt the field's value
  // as an ordinary property write. Idempotent: once restored, the own
  // descriptor is an accessor again and the check passes it by.
  private _recoverShadowedAttrAccessors(): void {
    const installed = this._installedAttrAccessors
    const initAttrs = (this.constructor as typeof Component).initAttributes
    if (installed == null || initAttrs == null) return
    const shadowed: string[] = []
    for (const attrName of installed) {
      const desc = Object.getOwnPropertyDescriptor(this, attrName)
      if (desc == null || desc.get != null || desc.set != null) continue
      const fieldValue = desc.value
      delete (this as any)[attrName]
      this._installAttrAccessor(
        attrName,
        camelToKabob(attrName),
        initAttrs[attrName]
      )
      ;(this as any)[attrName] = fieldValue
      shadowed.push(attrName)
    }
    if (shadowed.length > 0 && !warnedFieldShadowedAttrs.has(this.tagName)) {
      warnedFieldShadowedAttrs.add(this.tagName)
      const list = shadowed.map((n) => `'${n}'`).join(', ')
      console.warn(
        `<${this.tagName.toLowerCase()}> declares instance field(s) ${list} ` +
          'that shadow static initAttributes accessors (class fields use ' +
          '[[Define]] semantics). The field value was adopted and the ' +
          'reactive accessor restored — delete the field declaration; ' +
          'static initAttributes already defines the property.'
      )
    }
  }

  connectedCallback(): void {
    // Restore any initAttributes accessors clobbered by subclass class
    // fields BEFORE draining/rendering (idempotent; warns once per class).
    this._recoverShadowedAttrAccessors()
    // Apply any setAttribute/removeAttribute calls that were queued during
    // construction. Idempotent — if the microtask drain already ran, this
    // is a no-op.
    this._drainPendingAttrOps()
    insertGlobalStyles((this.constructor as unknown as Component).tagName)
    this.hydrate()
    if (this.role != null) this.setAttribute('role', this.role)
    // Form-associated components must be focusable for validation to work
    if (
      (this.constructor as typeof Component).formAssociated &&
      !this.hasAttribute('tabindex')
    ) {
      this.setAttribute('tabindex', '0')
    }
    // handleResize is the current name; onResize is the deprecated legacy hook
    // (the deprecation warning is emitted once per class in _warnOnHandlerCollisions).
    const resizeHandler = this.handleResize ?? this.onResize
    if (resizeHandler !== undefined) {
      resizeObserver.observe(this)
      if (this._onResize == null) {
        this._onResize = resizeHandler.bind(this)
      }
      this.addEventListener('resize', this._onResize)
    }
    if (this.value != null && this.getAttribute('value') != null) {
      this._value = this.getAttribute('value')
    }
    // Sync initial form value and validate for formAssociated components
    if (this.internals && this.value !== undefined) {
      this.internals.setFormValue(this.value)
      this.validateValue()
    }
    this.queueRender()
  }

  disconnectedCallback(): void {
    resizeObserver.unobserve(this)
  }

  /**
   * Called when the form is reset. Override to customize reset behavior.
   * Default: resets value to defaultValue or empty string.
   */
  formResetCallback(): void {
    if (this.value !== undefined) {
      this.value = this.defaultValue ?? ''
    }
  }

  /**
   * Called when the form or a parent fieldset is disabled/enabled.
   * Default: syncs the disabled attribute.
   */
  formDisabledCallback(disabled: boolean): void {
    if (disabled) {
      this.setAttribute('disabled', '')
    } else {
      this.removeAttribute('disabled')
    }
  }

  /**
   * Called when browser restores form state (back/forward navigation).
   * Default: restores the value.
   */
  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (this.value !== undefined && typeof state === 'string') {
      this.value = state
    }
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
        if (this._changeQueued) {
          dispatch(this, 'change')
          // Sync form value for formAssociated components
          if (this.internals && this.value !== undefined) {
            this.internals.setFormValue(this.value)
          }
        }
        this._changeQueued = false
        this._renderQueued = false
        this.render()
      })
    }
  }

  private _hydrated = false
  private _whenHydrated?: Promise<void>
  private _resolveHydrated?: () => void

  /**
   * `true` once `hydrate()` has run (content instantiated, shadow root
   * attached). Read this instead of probing `parts` to find out whether the
   * element is ready — a pre-hydration `parts` read is meaningless (there is no
   * content yet) and used to permanently poison the proxy.
   */
  get hydrated(): boolean {
    return this._hydrated
  }

  /**
   * Resolves once the element is hydrated. `await el.whenHydrated` before doing
   * `parts`-dependent work on an element that may not be inserted yet (e.g. one
   * fresh from `elementCreator()`), instead of hand-queuing pending operations.
   * Already-hydrated elements resolve immediately.
   */
  get whenHydrated(): Promise<void> {
    if (this._hydrated) return Promise.resolve()
    if (this._whenHydrated == null) {
      this._whenHydrated = new Promise((resolve) => {
        this._resolveHydrated = resolve
      })
    }
    return this._whenHydrated
  }

  private hydrate(): void {
    if (!this._hydrated) {
      this.initValue()
      const cloneElements = typeof this.content !== 'function'
      let _content: ContentType | null =
        typeof this.content === 'function'
          ? this.content(elements)
          : this.content

      if (Array.isArray(_content)) {
        const hostProps: Record<string, any> = {}
        _content = _content.filter((item) => {
          if (
            item instanceof Node ||
            typeof item === 'string' ||
            typeof item === 'number' ||
            tosiPath(item)
          ) {
            return true
          }
          Object.assign(hostProps, item)
          return false
        })
        for (const key of Object.keys(hostProps)) {
          elementSet(this as HTMLElement, key, hostProps[key])
        }
      }

      const ctor = this.constructor as unknown as Component
      const shadowStyle = ctor.shadowStyleSpec ?? ctor.styleSpec
      if (ctor.styleSpec && !ctor.shadowStyleSpec) {
        warnDeprecated(
          'static-styleSpec',
          'static styleSpec is deprecated. Use static shadowStyleSpec instead.'
        )
      }
      let { styleNode } = ctor
      if (shadowStyle) {
        styleNode = ctor.styleNode = elements.style(css(shadowStyle))
        delete ctor.styleNode
      }
      if (this.styleNode) {
        console.warn(
          this,
          'styleNode is deprecated, use static shadowStyleSpec instead'
        )
        styleNode = this.styleNode
      }
      if (styleNode) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(styleNode.cloneNode(true))
        appendContentToElement(shadow, _content, cloneElements)
        // Data-binding sugar in shadow content is inert by design (see the
        // docs above: dispatch does not see into shadow roots; micro-manage
        // with observe() + parts instead — on() event sugar DOES work, via
        // composedPath). bind() runs while content is still detached, so it
        // cannot catch this itself. One query per shadow component at hydrate
        // turns a silent brick into a named warning.
        if (
          !warnedShadowContentBindings.has(this.tagName) &&
          shadow.querySelector(BOUND_SELECTOR) != null
        ) {
          warnedShadowContentBindings.add(this.tagName)
          console.warn(
            `<${this.tagName.toLowerCase()}> has data-binding sugar in its ` +
              'shadow-DOM content, where bindings do not operate. A shadow-DOM ' +
              'component is bound like an <input>: bind its VALUE from outside ' +
              '(bindings.value) and implement render() to reflect value into ' +
              'the shadow DOM — setting value queues render() and emits change ' +
              'automatically. on() event handlers are fine. Warned once per ' +
              'component class.'
          )
        }
      } else if (_content !== null) {
        const existingChildren = Array.from(this.childNodes)
        appendContentToElement(this as HTMLElement, _content, cloneElements)
        // querySelector returns null (never undefined) when there's no match,
        // so `!== undefined` was always true
        this.isSlotted =
          this.querySelector('slot,tosi-slot,xin-slot') !== null
        const slots = Array.from(this.querySelectorAll('slot'))
        if (slots.length > 0) {
          slots.forEach(TosiSlot.replaceSlot)
        }
        if (existingChildren.length > 0) {
          const slotMap: { [key: string]: Element } = { '': this }
          Array.from(this.querySelectorAll('tosi-slot,xin-slot')).forEach(
            (slot) => {
              slotMap[(slot as TosiSlot).name] = slot
            }
          )
          existingChildren.forEach((child) => {
            const defaultSlot = slotMap['']
            const destSlot =
              child instanceof Element ? slotMap[child.slot] : defaultSlot
            ;(destSlot !== undefined ? destSlot : defaultSlot).append(child)
          })
        }
      }
      this._hydrated = true
      // Any `parts` read before this point built a proxy closed over the
      // light-DOM root (`this`), because the shadow root did not exist yet.
      // Discard it so the next access rebuilds against the now-correct root —
      // otherwise one early read poisons `parts` for the life of the element.
      this._parts = undefined
      this._resolveHydrated?.()
    }
  }

  render(): void {
    // Sync form value and validate when value actually changed
    if (this._valueChanged && this.internals && this.value !== undefined) {
      this.internals.setFormValue(this.value)
      this.validateValue()
    }
    this._valueChanged = false
  }

  /**
   * Validates the current value against standard constraints (required, minlength, maxlength, pattern).
   * Called automatically in render() when value changes. Override to add custom validation.
   * Call super.validateValue() to include standard validation.
   *
   * See [web-component-validation](/form-validation/) for details.
   */
  validateValue(): void {
    if (!this.internals || this.value === undefined) return
    const value =
      typeof this.value === 'string' ? this.value : String(this.value)
    validateAgainstConstraints(this, value)
  }
}

interface SlotParts extends PartsMap {
  slotty: HTMLSlotElement
}

class TosiSlot extends Component<SlotParts> {
  static preferredTagName = 'tosi-slot'
  static initAttributes = { name: '' }
  content = null

  static replaceSlot(slot: HTMLSlotElement): void {
    const _slot = document.createElement('tosi-slot')
    if (slot.name !== '') {
      _slot.setAttribute('name', slot.name)
    }
    // Preserve the slot's fallback content (its children) — they were being
    // dropped, so a `slot('default text')` lost its default text on rewrite.
    while (slot.firstChild != null) {
      _slot.appendChild(slot.firstChild)
    }
    slot.replaceWith(_slot)
  }
}

export const tosiSlot = TosiSlot.elementCreator()

// --- Deprecated xin-slot ---

class XinSlot extends Component<SlotParts> {
  static preferredTagName = 'xin-slot'
  static initAttributes = { name: '' }
  content = null

  constructor() {
    super()
    warnDeprecated(
      'xin-slot',
      '<xin-slot> is deprecated. Use <tosi-slot> instead.'
    )
  }

  static replaceSlot = TosiSlot.replaceSlot
}

export const xinSlot = XinSlot.elementCreator()
