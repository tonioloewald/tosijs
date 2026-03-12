/*#
# 3. elements

`tosijs` provides `elements` for easily and efficiently generating DOM elements
without using `innerHTML` or other unsafe methods.

```js
import { elements } from 'tosijs'

const { div, input, label, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('text'),
      input({value: 'hello world', placeholder: 'type something'})
    ),
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('checkbox'),
      input({type: 'checkbox', checked: true})
    )
  )
)
```

## `ElementCreator` functions

`elements` is a proxy whose properties are element factory functions,
referred to throughout this documentation as `elementCreator`s, functions
of type `ElementCreator`. So `elements.div` is a function that returns a `<div>`
element, `elements.foo` creates <foo> elements, and elements.fooBar creates
`<foo-bar>` elements.

The arguments of `elementCreator`s can be strings, numbers, other
elements, or property-maps, which are converted into attributes or properties
(or bindings).

E.g.

```js
import { elements, tosi } from 'tosijs'

const { elementCreatorDemo } = tosi({
  elementCreatorDemo: {
    isChecked: true,
    someString: 'hello elementCreator',
    someColor: 'blue',
    clicks: 0
  }
})

const { div, button, label, input } = elements

preview.append(
  div('I am a div'),
  div(
    {
      style: { color: 'blue' }
    },
    elementCreatorDemo.someString
  ),
  label(
    'Edit someString',
    input({bindValue: elementCreatorDemo.someString})
  ),
  div(
    button(
      'Click me',
      {
        onClick() {
          elementCreatorDemo.clicks += 1
        }
      }
    ),
    div(elementCreatorDemo.clicks, ' clicks so far'),
  ),
  label(
    'isChecked?',
    input({type: 'checkbox', bindValue: elementCreatorDemo.isChecked})
  )
)
```

## camelCase conversion

Attributes in camelCase, e.g. `dataInfo`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-info="foo"></span>

## style properties

`style` properties can be objects, and these are used to modify the
element's `style` object (while a string property will just change the
element's `style` attribute, eliminating previous changes).

    span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces `<span style="font-size: 15px"></span>`, which is probably
not what was wanted.

    span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces `<span style="border: 1px solid red; fon-size: 15px></span>`
which is probably what was wanted.

## event handlers

Properties starting with `on` (followed by an uppercase letter)
will be converted into event-handlers, so `onMouseup` will be
turned into a `mouseup` listener.

## binding

You can [bind](/?bind.ts) an element to state using [bindings](/?bindings.ts)
using convenient properties, e.g.

    import { elements } from 'tosijs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'tosijs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use `apply`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## event-handlers

You can attach event handlers to elements using `on<EventType>`
as syntax sugar, e.g.

    import { elements } from 'tosijs'
    const { button } = elements
    document.body.append(
      button('click me', {onClick() {
        alert('clicked!')
      }})
    )

…is syntax sugar for:

    import { elements, on } from 'tosijs'
    const { button } = elements
    const aButton = button('click me')
    on(aButton, 'click', () => {
      alert('clicked!')
    })
    document.body.append(
      aButton
    )

There are some subtle but important differences between `on()` and
`addEventListener` which are discussed in detail in the section on
[bind](/?bind.ts).

## apply

A property named `apply` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces `<span>foobar</span>`.

## fragment

`elements.fragment` is produces `DocumentFragment`s, but is otherwise
just like other element factory functions.

## svgElements

`svgElements` is a proxy just like `elements` but it produces **SVG** elements in
the appropriate namespace.

```js
import { svgElements, tosi, xin } from 'tosijs'

const { svg, g, path, circle, polygon } = svgElements

// --- radar background ---
const outerRing = 'M128,8 C194.274,8,248,61.7258,248,128 C248,194.274,194.274,248,128,248 C61.7258,248,8.00001,194.274,8.00001,128 C8.00001,61.7258,61.7258,8,128,8 z'
const vLine = 'M128,53 C128,53,128,203,128,203'
const hRight = 'M203,128 C203,128,143,128,143,128'
const hLeft = 'M113,128 C113,128,53,128,53,128'
const guide = 'fill:#00a79e;fill-opacity:0.127;fill-rule:evenodd;stroke:#00a79e;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:4;'
const axis = guide + 'stroke-opacity:0.24;'

// --- two separate arrays: friendlies and hostiles ---
let nextId = 0
const RANGE = 115

function spawnFriendly() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.6 + Math.random() * 0.8)
  const speed = 0.2 + Math.random() * 0.3
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 105, y: 128 + Math.sin(angle) * 105,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

function spawnHostile() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.7 + Math.random() * 0.6)
  const speed = 0.5 + Math.random() * 0.6
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 110, y: 128 + Math.sin(angle) * 110,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

const { friendlies, hostiles } = tosi({
  friendlies: Array.from({ length: 6 }, spawnFriendly),
  hostiles: Array.from({ length: 4 }, spawnHostile),
})

// custom binding: position a <g> from its list item's x,y
const position = (el, item) => {
  if (item) el.setAttribute('transform', `translate(${item.x},${item.y})`)
}

// --- list-bound blip layers (one per array, no filter needed) ---
const friendlyLayer = g(
  g(
    circle({ r: '5', fill: 'none', stroke: '#8cc63f', 'stroke-width': '1' }),
    { bind: { value: '^', binding: position } }
  ),
  { bindList: { value: friendlies, idPath: 'id' } }
)
const hostileLayer = g(
  g(
    polygon({ points: '0,-6 5.2,3 -5.2,3', fill: 'none', stroke: '#ff1d25', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }),
    { bind: { value: '^', binding: position } }
  ),
  { bindList: { value: hostiles, idPath: 'id' } }
)

preview.append(
  svg(
    { width: '256', height: '256', viewBox: '0 0 256 256' },
    g(
      path({ style: guide + 'stroke-opacity:0.5;', d: outerRing }),
      path({ style: axis, d: vLine }),
      path({ style: axis, d: hRight }),
      path({ style: axis, d: hLeft }),
    ),
    friendlyLayer,
    hostileLayer,
  )
)

// animate: advance, cull out-of-range, spawn new
function tick(arr) {
  const kept = []
  for (const b of arr) {
    const nx = b.x + b.dx, ny = b.y + b.dy
    if (Math.sqrt((nx - 128) ** 2 + (ny - 128) ** 2) < RANGE) {
      kept.push({ ...b, x: nx, y: ny })
    }
  }
  return kept
}
setInterval(() => {
  const f = tick(xin.friendlies)
  if (Math.random() < 0.06) f.push(spawnFriendly())
  xin.friendlies = f

  const h = tick(xin.hostiles)
  if (Math.random() < 0.04) h.push(spawnHostile())
  xin.hostiles = h
}, 50)
```

## mathML

`mathML` is a proxy just like `elements` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both `svgElements` and `mathML` are experimental and do not have anything like  the
> degree of testing behind them as `elements`. In particular, the properties of
> SVG elements (and possible MathML elements) are quite different from ordinary
> elements, so the underlying `ElementCreator` will never try to set properties
> directly and will always use `setAttribute(...)`.
>
> E.g. `svgElements.svg({viewBox: '0 0 100 100'})` will call `setAttribute()` and
> not set the property directly, because the `viewBox` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!
*/

import { bind, on } from './bind'
import { bindings } from './bindings'
import {
  ElementPart,
  ElementProps,
  ElementCreator,
  StringMap,
  XinBinding,
  EventType,
} from './xin-types'
import { camelToKabob } from './string-case'
import { processProp } from './css'
import { tosiPath } from './metadata'
import { MATH, SVG, type ElementsProxy } from './elements-types'

const templates: { [key: string]: Element } = {}

const elementStyle = (elt: HTMLElement, prop: string, value: any) => {
  const processed = processProp(camelToKabob(prop), value)
  if (processed.prop.startsWith('--')) {
    elt.style.setProperty(processed.prop, processed.value)
  } else {
    (elt.style as unknown as { [key: string]: string })[prop] = processed.value
  }
}

const elementStyleBinding = (prop: string): XinBinding => {
  return {
    toDOM(element, value) {
      elementStyle(element as HTMLElement, prop, value)
    },
  }
}

const elementProp = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'style') {
    if (typeof value === 'object') {
      for (const prop of Object.keys(value)) {
        if (tosiPath(value[prop])) {
          bind(elt, value[prop], elementStyleBinding(prop))
        } else {
          elementStyle(elt, prop, value[prop])
        }
      }
    } else {
      elt.setAttribute('style', value)
    }
  } else {
    const attr = camelToKabob(key)

    // Check if declared in observedAttributes (works for third-party web components)
    const observedAttrs = (elt.constructor as any).observedAttributes as
      | string[]
      | undefined
    const isObservedAttr =
      observedAttrs?.includes(key) || observedAttrs?.includes(attr)

    if (isObservedAttr) {
      if (typeof value === 'boolean') {
        value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr)
      } else {
        elt.setAttribute(attr, value)
      }
    } else if ((elt as { [key: string]: any })[key] !== undefined) {
      // MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
      const { MathMLElement } = globalThis
      if (
        elt instanceof SVGElement ||
        (MathMLElement !== undefined && elt instanceof MathMLElement)
      ) {
        elt.setAttribute(key, value)
      } else {
        (elt as { [key: string]: any })[key] = value
      }
    } else if (attr === 'class') {
      value.split(' ').forEach((className: string) => {
        elt.classList.add(className)
      })
    } else if ((elt as { [key: string]: any })[attr] !== undefined) {
      (elt as StringMap)[attr] = value
    } else if (typeof value === 'boolean') {
      value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr)
    } else {
      elt.setAttribute(attr, value)
    }
  }
}

const propBindingCache: Record<string, XinBinding> = {}
const elementPropBinding = (key: string): XinBinding => {
  if (!propBindingCache[key]) {
    propBindingCache[key] = {
      toDOM(element, value) {
        elementProp(element as HTMLElement, key, value)
      },
    }
  }
  return propBindingCache[key]
}

const elementSet = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'apply') {
    value(elt)
  } else if (key.match(/^on[A-Z]/) != null) {
    const eventType = key.substring(2).toLowerCase()
    on(elt, eventType as EventType, value)
  } else if (key === 'bind') {
    const binding =
      typeof value.binding === 'string'
        ? bindings[value.binding]
        : value.binding
    if (binding !== undefined && value.value !== undefined) {
      bind(
        elt,
        value.value,
        value.binding instanceof Function
          ? { toDOM: value.binding }
          : value.binding
      )
    } else {
      throw new Error(`bad binding`)
    }
  } else if (key.match(/^bind[A-Z]/) != null) {
    const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5)
    const binding = bindings[bindingType]
    if (binding !== undefined) {
      bind(elt, value, binding)
    } else {
      throw new Error(
        `${key} is not allowed, bindings.${bindingType} is not defined`
      )
    }
  } else if (tosiPath(value)) {
    bind(elt, value, elementPropBinding(key))
  } else {
    elementProp(elt, key, value)
  }
}

const create = (tagType: string, ...contents: ElementPart[]): HTMLElement => {
  if (templates[tagType] === undefined) {
    const [tag, namespace] = tagType.split('|')
    if (namespace === undefined) {
      templates[tagType] = globalThis.document.createElement(tag)
    } else {
      templates[tagType] = globalThis.document.createElementNS(namespace, tag)
    }
  }
  const elt = templates[tagType].cloneNode() as HTMLElement
  const elementProps: ElementProps = {}
  for (const item of contents) {
    if (
      item instanceof Element ||
      item instanceof DocumentFragment ||
      typeof item === 'string' ||
      typeof item === 'number'
    ) {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else if (tosiPath(item)) {
      elt.append(elements.span({ bindText: item }))
    } else {
      Object.assign(elementProps, item)
    }
  }
  for (const key of Object.keys(elementProps)) {
    const value: any = elementProps[key]
    elementSet(elt, key, value)
  }
  return elt
}

const fragment = (...contents: ElementPart[]): DocumentFragment => {
  const frag = globalThis.document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export const elements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      tagName = tagName.replace(/[A-Z]/g, (c) => `-${c.toLocaleLowerCase()}`)
      if ((target as StringMap)[tagName] === undefined) {
        (target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(tagName, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as ElementsProxy

interface SVGElementsProxy {
  [key: string]: ElementCreator<SVGElement>
}

export const svgElements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        (target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${SVG}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as SVGElementsProxy

interface MathMLElementsProxy {
  [key: string]: ElementCreator<MathMLElement>
}

export const mathML = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        (target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${MATH}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as MathMLElementsProxy
