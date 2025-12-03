/*#
# 1.3 metadata

## `getListItem(element: Element): any`

## `xinValue(x: any): any`

`xinValue` is helpful when you want to strip the `xin` or `boxed` proxy off of a
value. `xinValue` passes through normal values, so it's safe to use on anything.

```
import { boxed } from 'xinjs'

const foo = { bar: 'hello', baz: 17 }
boxed.foo = foo

boxed.foo.bar === foo.bar               // false, boxed.foo.bar is a String
boxed.foo === foo                       // false, boxed.foo is a Proxy
boxed.foo.baz === 17                    // false, boxed.foo.baz is a Number
xinValue(boxed.foo.bar) === 'hello'     // true
boxed.foo.xinValue === foo              // true
boxed.foo.baz.xinValue = 17             // true
xinValue(boxed.foo) === xinValue(foo)   // true
foo.xinValue                            // undefined! foo isn't a proxy
```

## `xinPath(x: any): string | undefined`

`xinPath` will get you the path of a `xin` or `boxed` proxy. `xinPath` will be
undefined for anything that's isn't a `xin` or `boxed` proxy, so it can also
be used to tell if a value is a (`xin` or `boxed`) proxy.
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
  return (
    typeof x === 'object' && x !== null
      ? (x as unknown as XinProps)[XIN_VALUE] || x
      : x
  ) as Unboxed<T>
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
      // @ts-expect-error-error
      elementToBindings.set(cloned, deepClone(dataBindings))
    }
    if (eventHandlers != null) {
      // @ts-expect-error-error
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

export const deleteListItem = (element: Element): boolean => {
  const instance = getListBinding(element)
  if (instance) {
    const index = instance.array!.indexOf(instance.item)
    console.log(index, instance, instance.item)
    if (index > -1) {
      instance.array?.splice(index, 1)
    }

    return true
  }
  return false
}

export const getListBinding = (
  element: Element
): { element: Element; array: any[]; item: any } | undefined => {
  const html = document.body.parentElement
  while (element.parentElement != null && element.parentElement !== html) {
    // @ts-ignore-error if it's there it's there
    if (element[LIST_INSTANCE_REF]) {
      return {
        element,
        // @ts-ignore-error if it's there it's there
        item: element[LIST_INSTANCE_REF],
        // @ts-ignore-error if it's there it's there
        array: element.parentElement[LIST_BINDING_REF]?.array,
      }
    }
    element = element.parentElement
  }
  return undefined
}

export const getListItem = (element: Element): any => {
  getListBinding(element)?.item
}
