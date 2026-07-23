/*{ "order": 5, "description": "bind() syncs application state to DOM elements via path-based observers. Plus on() for event handlers and touchElement() for forced updates." }*/
/*#
# Binding

`bind()` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

> The design goal of `bind` is to eliminate most of the code used to sync state to and
> from the UI (DOM elements) making code simpler, faster, and more reliable.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

`tosijs` works very well with React via the [useTosi](https://github.com/tonioloewald/react-tosijs) React "hook".
But `tosijs` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

`tosijs` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with `tosijs` to be *deeply asynchronous*.

## `bind()`

```
bind<T = Element>(
  element: T,
  what: XinTouchableType,
  binding: XinBinding,
  options: XinObject
): T
```

`bind()` binds a `path` to an element, syncing the value at the path to and/or from the DOM.

```js
import { bind, tosi } from 'tosijs'

const { simpleBindExample } = tosi({
  simpleBindExample: {
    showThing: true
  }
})

bind(
  preview.querySelector('b'),
  'simpleBindExample.showThing',
  {
    toDOM(element, value) {
      element.style.visibility = value ? 'visible' : 'hidden'
    }
  }
)

bind(
  preview.querySelector('input[type=checkbox]'),
  // the tosi can be used instead of a string path
  simpleBindExample.showThing,
  // we could just use bindings.value here
  {
    toDOM(element, value) {
      element.checked = value
    },
    fromDOM(element) {
      return element.checked
    }
  }
)
```
```html
<b>The thing</b><br>
<label>
  <input type="checkbox">
  Show the thing
</label>
```

The `bind` function is a simple way of tying an `HTMLElement`'s properties to
state via `path` using [bindings](/bindings/)

```
import {bind, bindings, xin, elements, updates} from 'tosijs'
const {div, input} = elements

const divElt = div()
bind(divElt, 'app.title', bindings.text)
document.body.append(divElt)

const inputElt = input()
bind(inputElt, 'app.title', bindings.value)

xin.app = {title: 'hello world'}
await updates()
```

What's happening is essentially the same as:

```
divElt.textContent = xin.app.title
observe('app.title', () => divElt.textContent = xin.app.title)

inputElt.value = xin.app.title
observe('app.title', () => inputElt.value = xin.app.title)
inputElt.addEventListener('change', () => { xin.app.title = inputElt.value })
```

Except:

1. this code is harder to write
2. it will fail if xin.app hasn't been initialized (which it hasn't been!)
3. inputElt will also trigger *debounced* updates on `input` events

After this. `div.textContent` and `inputElt.value` are 'hello world'.
If the user edits the value of `inputElt` then `xin.app.title` will
be updated, and `app.title` will be listed as a changed path, and
an update will be fired via `setTimout`. When that update fires,
anything observer of the paths `app.text` and `app` will be fired.

A `binding` looks like this:

```
interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
  fromDOM?: (element: HTMLElement) => any
}
```

Simply put the `toDOM` method updates the DOM based on changes in state
while `fromDOM` updates state based on data in the DOM. Most bindings
will have a `toDOM` method but no `fromDOM` method since `bindings.value`
(which has both) covers most of the use-cases for `fromDOM`.

It's easy to write your own `bindings` if those in `bindings` don't meet your
need, e.g. here's a custom binding that toggles the visibility of an element
based on whether the bound value is neither "falsy" nor an empty `Array`.

```
const visibility = {
  toDOM(element, value) {
    if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
      element.dataset.origDisplay = element.style.display
    }
    element.style.display = (value != null && value.length > 0) ? element.dataset.origDisplay : 'none'
  }
}
bind(listElement, 'app.bigList', visibility)
```

## `on()`

```
on(element: Element, eventType: string, handler: XinEventHandler): VoidFunction

export type XinEventHandler<T extends Event = Event, E extends Element = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
```

```js
import { elements, on, tosi } from 'tosijs'
import { postNotification } from 'tosijs-ui'

const makeHandler = (message) => () => {
  postNotification({ message, duration: 2 })
}

const { onExample } = tosi({
  onExample: {
    clickHandler: makeHandler('Hello from onExample proxy')
  }
})

const { button, div, h2 } = elements

const hasListener = button('has listener')
hasListener.addEventListener('click', makeHandler('Hello from addEventListener'))

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
    h2('Event Handler Examples'),
    hasListener,
    button('just a callback', {onClick: makeHandler('just a callback')}),
    button('via proxy', {onClick: onExample.clickHandler}),
  )
)
```

`on()` binds event-handlers to DOM elements.

More than syntax sugar for `addEventListener`, `on()` allows you to bind event
handlers inside `xin` by path (e.g. allowing event-handling code to be loaded
asynchronously or lazily, or simply allowing event-handlers to be switched dynamically
without rebinding) and it uses event-bubbling to minimize the actual number of
event handlers that need to be registered.

`on()` returns a function for removing the event handler.

In essence, only one event handler of a given type is ever added to the
DOM by `on()` (at `document.body` level), and then when that event is detected,
that handler goes from the original target through to the DOM and fires off
event-handlers, passing them an event proxy (so that `stopPropagation()` still
works).

`on()` handlers work inside **open shadow roots** too: composed events cross
shadow boundaries, and the dispatcher resolves the true origin via
`composedPath()` (retargeting would otherwise hide it) and continues delegation
up through shadow hosts to light-DOM ancestors. Closed shadow roots stay
closed. (Note that *data* bindings deliberately do not operate inside shadow
DOM — a shadow-DOM component is bound like an `<input>`, via its `value`; see
the Component docs.)

This behavior needs a real browser to observe (a composed event is only
*retargeted* to its shadow host outside jsdom/happy-dom), so it is verified
in-browser here:

```test
import { elements, on } from 'tosijs'
const { button } = elements

test('on() fires for a click originating inside an open shadow root', () => {
  const host = document.createElement('div')
  preview.append(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const b = button('inside shadow')
  shadow.append(b)
  let clicks = 0
  on(b, 'click', () => { clicks++ })
  b.click()
  expect(clicks).toBe(1)
})

test('delegation crosses the shadow boundary to a light-DOM ancestor', () => {
  const outer = document.createElement('div')
  preview.append(outer)
  const host = document.createElement('div')
  outer.append(host)
  const inner = button('inner')
  host.attachShadow({ mode: 'open' }).append(inner)
  let heard = 0
  on(outer, 'click', () => { heard++ })
  inner.click()
  expect(heard).toBe(1)
})
```

## `touchElement()`

```
touchElement(element: Element, changedPath?: string)
```

This is a low-level function for *immediately* updating a bound element. If you specifically
want to force a render of an element (versus anything bound to a path), simply call
`touchElement(element)`. Specifying a `changedPath` will only trigger bindings bound
to paths staring with the provided path.
*/

import { touch, observe, extendsPath } from './path-listener'
import { getXinProxy, setBindFunctions } from './registry'
import {
  elementToBindings,
  elementToHandlers,
  DataBindings,
  LIST_BINDING_REF,
  BOUND_CLASS,
  BOUND_SELECTOR,
  XinEventBindings,
  XIN_PATH,
  XIN_VALUE,
  TAKE_DESCRIPTOR,
} from './metadata'
import {
  XinObject,
  XinProps,
  XinEventHandler,
  XinTouchableType,
  XinBinding,
  XinBindingSpec,
  TakeDescriptor,
  EventType,
  ValueElement,
} from './xin-types'
import { ListBinding, getListItem } from './list-binding'

const { document, MutationObserver } = globalThis

export const touchElement = (element: Element, changedPath?: string): void => {
  const dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    return
  }
  for (const dataBinding of dataBindings) {
    const { binding, options } = dataBinding
    let { path } = dataBinding
    const { toDOM } = binding
    if (toDOM != null) {
      if (path.startsWith('^')) {
        const dataSource = getListItem(element)
        if (dataSource != null && (dataSource as XinProps)[XIN_PATH] != null) {
          path = dataBinding.path = `${
            (dataSource as XinProps)[XIN_PATH]
          }${path.substring(1)}`
        } else {
          if (element instanceof HTMLElement) {
            console.warn(
              `Unresolved relative binding "${path}" —`,
              element,
              'is not part of a list. If this is a list template, wrap it in a <template>.'
            )
          }
          continue
        }
      }
      if (changedPath == null || extendsPath(changedPath, path)) {
        toDOM(element, getXinProxy()[path], options)
      }
    }
  }
}

// this is just to allow bind to be testable in node
if (MutationObserver != null) {
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      Array.from(mutation.addedNodes).forEach((node) => {
        if (node instanceof Element) {
          Array.from(node.querySelectorAll(BOUND_SELECTOR)).forEach((element) =>
            touchElement(element as Element)
          )
        }
      })
    })
  })
  observer.observe(document.body, { subtree: true, childList: true })
}

observe(
  () => true,
  (changedPath: string) => {
    const boundElements = Array.from(document.querySelectorAll(BOUND_SELECTOR))

    for (const element of boundElements) {
      touchElement(element as HTMLElement, changedPath)
    }
  }
)

// The true origin of an event: composed events cross open shadow boundaries
// but are RETARGETED to the host, so event.target hides any origin inside a
// shadow root. composedPath()[0] sees through open roots; closed roots stay
// hidden (the path is truncated for outside listeners) — closed means closed.
const eventOrigin = (event: Event): Element | null => {
  // Only pierce shadow boundaries for composed events — for a non-composed
  // event composedPath()[0] is just event.target anyway, so skip the call
  // (and its array allocation) on the common path.
  const origin =
    event.composed && event.composedPath != null
      ? event.composedPath()[0]
      : event.target
  return origin instanceof Element ? origin : null
}

// closest(), but hopping open-shadow boundaries: when the search exhausts an
// element's tree, continue from the shadow host so delegation reaches
// light-DOM ancestors of events that originate inside a shadow widget.
const closestAcrossShadow = (
  el: Element | null,
  selector: string
): Element | null => {
  while (el != null) {
    const found = el.closest(selector)
    if (found != null) return found
    const root = el.getRootNode()
    el =
      typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
        ? root.host
        : null
  }
  return null
}

// the upward delegation step from a handled element
const nextAcrossShadow = (el: Element, selector: string): Element | null => {
  if (el.parentElement != null) {
    return closestAcrossShadow(el.parentElement, selector)
  }
  const root = el.getRootNode()
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
    return closestAcrossShadow(root.host, selector)
  }
  return null
}

// one step up the ancestor chain, hopping out of an open shadow root to its host
const parentAcrossShadow = (el: Element): Element | null => {
  if (el.parentElement != null) return el.parentElement
  const root = el.getRootNode()
  return typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
    ? root.host
    : null
}

// nearest self-or-ancestor (across open-shadow boundaries) with registered event
// handlers. Event delegation used to climb a `-xin-event` marker class via
// closest(); the elementToHandlers WeakMap already IS that record, so we consult
// it directly and never stamp a class onto the consumer's DOM. cloneNode copies
// nothing into the map, so clones are simply not visited — no zombie markers.
const closestHandlerElement = (el: Element | null): Element | null => {
  while (el != null && !elementToHandlers.has(el)) {
    el = parentAcrossShadow(el)
  }
  return el
}

const handleChange = (event: Event): void => {
  let target = closestAcrossShadow(eventOrigin(event), BOUND_SELECTOR)
  while (target != null) {
    // plain cloneNode(true) copies the marker class but not the WeakMap
    // metadata — skip such elements instead of crashing the dispatcher
    // (which would also abort ancestor traversal for this event)
    const dataBindings = elementToBindings.get(target)
    for (const dataBinding of dataBindings ?? []) {
      const { binding, path } = dataBinding
      const { fromDOM } = binding
      if (fromDOM != null) {
        let value
        try {
          value = fromDOM(target, dataBinding.options)
        } catch (e) {
          console.error('Cannot get value from', target, 'via', dataBinding)
          throw new Error('Cannot obtain value fromDOM')
        }
        if (value != null) {
          const xin = getXinProxy()
          const existing = xin[path]
          if (existing == null) {
            // bootstrap: no state type to consult — the typed-control read
            // (getValue) already gave the control's native type
            xin[path] = value
          } else {
            const existingActual =
              existing[XIN_PATH] != null
                ? (existing as XinProps)[XIN_VALUE]
                : existing
            let valueActual =
              value[XIN_PATH] != null ? value[XIN_VALUE] : value
            // State-driven coercion (H-6 layer 2): the type state currently
            // holds is authoritative — DOM controls speak string, state
            // speaks typed values, and the binding layer owns conversion.
            if (
              typeof existingActual === 'number' &&
              typeof valueActual === 'string'
            ) {
              // covers controls that don't declare a type: text inputs,
              // selects with numeric option values, radios. Only coerce a
              // clean, non-empty parse — Number('') is 0, and genuinely
              // non-numeric input writes raw so type-drift stays visible.
              const trimmed = valueActual.trim()
              if (trimmed !== '') {
                const n = Number(trimmed)
                if (!Number.isNaN(n)) valueActual = n
              }
            } else if (valueActual instanceof Date) {
              // state picks the temporal representation
              if (typeof existingActual === 'number') {
                valueActual = valueActual.getTime()
              } else if (typeof existingActual === 'string') {
                // the control's own serialization (e.g. 'yyyy-mm-dd')
                valueActual = (target as unknown as ValueElement).value
              }
            }
            const bothDates =
              existingActual instanceof Date && valueActual instanceof Date
            const changed = bothDates
              ? (existingActual as Date).getTime() !==
                (valueActual as Date).getTime()
              : existingActual !== valueActual
            if (changed) {
              xin[path] = valueActual
            }
          }
        }
      }
    }
    target = nextAcrossShadow(target, BOUND_SELECTOR)
  }
}

if (globalThis.document != null) {
  document.body.addEventListener('change', handleChange, true)
  document.body.addEventListener('input', handleChange, true)
}

interface BindingOptions {
  [key: string]: any
}

function bindTake<T extends Element>(
  element: T,
  descriptor: TakeDescriptor,
  binding: XinBinding<T>,
  options?: BindingOptions
): T {
  const { paths, transform } = descriptor
  const { toDOM } = binding
  if (toDOM == null) return element

  let lastInputs: any[] | null = null

  const wrappedBinding: XinBinding<Element> = {
    toDOM(el, _value, opts) {
      const xin = getXinProxy()
      const currentInputs = paths.map((p) => xin[p])
      if (
        lastInputs !== null &&
        currentInputs.every((v, i) => v === lastInputs![i])
      ) {
        return
      }
      lastInputs = currentInputs
      const result = transform(...currentInputs)
      ;(toDOM as any)(el, result, opts)
    },
    fromDOM: binding.fromDOM as XinBinding<Element>['fromDOM'],
  }

  element.classList?.add(BOUND_CLASS)
  let dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    dataBindings = []
    elementToBindings.set(element, dataBindings)
  }

  for (const p of paths) {
    dataBindings.push({
      path: p,
      binding: wrappedBinding,
      options,
    })
  }

  if (!paths[0].startsWith('^')) {
    touch(paths[0])
  }

  return element
}

// DATA binding inside shadow DOM is a documented design boundary (see
// Component's docs): dispatch cannot see into shadow roots, so bind() there
// is inert. (Event sugar is different: on() works across open shadow roots
// via composedPath.) The failure used to be SILENT — warn at the point of
// misuse instead. Once per session: the trap, not every element in it.
let warnedShadowedBinding = false
export const warnIfShadowed = (element: Element, what: string): void => {
  if (warnedShadowedBinding) return
  if (
    typeof ShadowRoot !== 'undefined' &&
    element.getRootNode != null &&
    element.getRootNode() instanceof ShadowRoot
  ) {
    warnedShadowedBinding = true
    console.warn(
      `tosijs: ${what} targets an element inside a shadow root, where data ` +
        'bindings do not operate (documented Component design boundary). ' +
        'A shadow-DOM component is bound like an <input>: bind its VALUE from ' +
        'outside (bindings.value) and implement render() to reflect value ' +
        'into the shadow DOM. Warned once per session.',
      element
    )
  }
}

export function bind<T extends Element = Element>(
  element: T,
  what: XinTouchableType | XinBindingSpec | TakeDescriptor,
  binding: XinBinding<T>,
  options?: BindingOptions
): T {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  warnIfShadowed(element, 'bind()')

  // TakeDescriptor — multi-path reactive transform
  if (
    what != null &&
    typeof what === 'object' &&
    (what as any)[TAKE_DESCRIPTOR]
  ) {
    return bindTake(
      element,
      what as unknown as TakeDescriptor,
      binding,
      options
    )
  }

  let path: string
  if (
    typeof what === 'object' &&
    (what as XinProps)[XIN_PATH] === undefined &&
    options === undefined
  ) {
    const { value } = what as XinBindingSpec
    path = typeof value === 'string' ? value : value[XIN_PATH]
    // Copy the spec rather than mutating the caller's object: deleting `value`
    // from `what` in place broke reusing one bindList spec for two containers
    // (the second call saw no `value` and threw "bind requires a path").
    options = { ...(what as XinObject) }
    delete options.value
  } else {
    path = typeof what === 'string' ? what : (what as XinProps)[XIN_PATH]
  }
  if (path == null) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const { toDOM } = binding

  element.classList?.add(BOUND_CLASS)
  let dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    dataBindings = []
    elementToBindings.set(element, dataBindings)
  }
  dataBindings.push({
    path,
    binding: binding as XinBinding<Element>,
    options,
  })

  if (toDOM != null && !path.startsWith('^')) {
    // not calling toDOM directly here allows virtual list bindings to work
    touch(path)
  }

  if (options?.filter && options?.needle) {
    bind(element, options.needle, {
      toDOM(element, value) {
        ;(element as { [LIST_BINDING_REF]?: ListBinding })[
          LIST_BINDING_REF
        ]?.filter(value)
      },
    })
  }

  return element
}

const handledEventTypes: Set<string> = new Set()

const handleBoundEvent = (event: Event): void => {
  let target = closestHandlerElement(eventOrigin(event))
  let propagationStopped = false

  const wrappedEvent = new Proxy(event, {
    get(target, prop) {
      if (prop === 'stopPropagation') {
        return () => {
          event.stopPropagation()
          propagationStopped = true
        }
      } else {
        const value = (target as any)[prop]
        return typeof value === 'function' ? value.bind(target) : value
      }
    },
  })
  const nohandlers = new Set<XinEventHandler>()
  while (!propagationStopped && target != null) {
    // every target visited is, by construction, a key in elementToHandlers
    const eventBindings = elementToHandlers.get(target)
    const handlers = eventBindings?.[event.type] ?? nohandlers
    for (const handler of handlers) {
      if (typeof handler === 'function') {
        handler(wrappedEvent as Event & { target: Element })
      } else {
        const func = getXinProxy()[handler]
        if (typeof func === 'function') {
          func(wrappedEvent)
        } else {
          throw new Error(`no event handler found at path ${handler}`)
        }
      }
      if (propagationStopped) {
        continue
      }
    }
    target = closestHandlerElement(parentAcrossShadow(target))
  }
}

type RemoveListener = VoidFunction

export function on<E extends HTMLElement, K extends EventType>(
  element: E,
  eventType: K,
  eventHandler: XinEventHandler<HTMLElementEventMap[K], E>
): RemoveListener {
  let eventBindings = elementToHandlers.get(element)
  if (eventBindings == null) {
    eventBindings = {}
    elementToHandlers.set(element, eventBindings)
  }
  if (!eventBindings[eventType]) {
    eventBindings[eventType] = new Set<XinEventHandler>()
  }
  eventBindings[eventType].add(eventHandler as XinEventHandler)
  if (!handledEventTypes.has(eventType)) {
    handledEventTypes.add(eventType)
    document.body.addEventListener(eventType, handleBoundEvent, true)
  }
  return () => {
    eventBindings[eventType].delete(eventHandler as XinEventHandler)
  }
}

// Register bind and on functions for lazy access (breaks circular dependency with xin.ts)
setBindFunctions(bind, on)
