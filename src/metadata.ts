/*#
# 1.3 metadata

## `xinValue(x: any): any`

`xinValue` is helpful when you want to strip the `xin` or `boxed` proxy off of a
value. `xinValue` passes through normal values, so it's safe to use on anything.

```
import { boxed } from 'tosijs'

const foo = { bar: 'hello', baz: 17 }
boxed.foo = foo

boxed.foo.bar === foo.bar               // false, boxed.foo.bar is a proxy
boxed.foo === foo                       // false, boxed.foo is a proxy
boxed.foo.baz === 17                    // false, boxed.foo.baz is a proxy
xinValue(boxed.foo.bar) === 'hello'     // true
boxed.foo.bar.value === 'hello'         // true (preferred)
boxed.foo.xinValue === foo              // true (deprecated)
boxed.foo.baz.value === 17              // true
xinValue(boxed.foo) === xinValue(foo)   // true
foo.xinValue                            // undefined! foo isn't a proxy
```

## `xinPath(x: any): string | undefined`

`xinPath` will get you the path of a `xin` or `boxed` proxy. `xinPath` will be
undefined for anything that's isn't a `xin` or `boxed` proxy, so it can also
be used to tell if a value is a (`xin` or `boxed`) proxy.

> Note: For boxed scalars, prefer using `.value` and `.path` directly:
> `boxed.foo.bar.value` and `boxed.foo.bar.path`
*/
import {
  XinObject,
  XinProps,
  XinBinding,
  XinEventHandler,
  Unboxed,
} from './xin-types'
import { deepClone } from './deep-clone'

export const BOUND_CLASS = '-xin-data'
export const BOUND_SELECTOR = `.${BOUND_CLASS}`
export const EVENT_CLASS = '-xin-event'
export const EVENT_SELECTOR = `.${EVENT_CLASS}`

export const XIN_PATH = 'xinPath'
export const XIN_VALUE = 'xinValue'
export const XIN_OBSERVE = 'xinObserve'
export const XIN_BIND = 'xinBind'
export const XIN_ON = 'xinOn'

export const LIST_BINDING_REF = Symbol('list-binding')
export const LIST_INSTANCE_REF = Symbol('list-instance')

export const xinPath = (x: any): string | undefined => {
  return (x && x[XIN_PATH]) || undefined
}

export function xinValue<T>(x: T): Unboxed<T> {
  if (typeof x === 'object' && x !== null) {
    const val = (x as unknown as XinProps)[XIN_VALUE]
    // Use explicit undefined check instead of || to handle falsy values (0, false, '')
    return (val !== undefined ? val : x) as Unboxed<T>
  }
  return x as Unboxed<T>
}

export interface DataBinding<T extends Element = Element> {
  path: string
  binding: XinBinding<T>
  options?: XinObject
}

export type DataBindings = DataBinding[]

export interface XinEventBindings {
  [eventType: string]: Set<XinEventHandler>
}

export const elementToHandlers: WeakMap<Element, XinEventBindings> =
  new WeakMap()
export const elementToBindings: WeakMap<Element, DataBindings> = new WeakMap()

interface ElementMetadata {
  eventBindings?: XinEventBindings
  dataBindings?: DataBindings
}

export const getElementBindings = (element: Element): ElementMetadata => {
  return {
    eventBindings: elementToHandlers.get(element),
    dataBindings: elementToBindings.get(element),
  }
}

export const cloneWithBindings = (element: Node): Node => {
  const cloned = element.cloneNode()
  if (cloned instanceof Element) {
    const dataBindings = elementToBindings.get(element as Element)
    const eventHandlers = elementToHandlers.get(element as Element)
    if (dataBindings != null) {
      // @ts-expect-error deepClone returns compatible type
      elementToBindings.set(cloned, deepClone(dataBindings))
    }
    if (eventHandlers != null) {
      // @ts-expect-error deepClone returns compatible type
      elementToHandlers.set(cloned, deepClone(eventHandlers))
    }
  }
  for (const node of Array.from(
    element instanceof HTMLTemplateElement
      ? element.content.childNodes
      : element.childNodes
  )) {
    if (node instanceof Element || node instanceof DocumentFragment) {
      cloned.appendChild(cloneWithBindings(node))
    } else {
      cloned.appendChild(node.cloneNode())
    }
  }
  return cloned
}
