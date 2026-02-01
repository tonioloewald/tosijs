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

export const XIN_PATH = Symbol.for('xin-path')
export const XIN_VALUE = Symbol.for('xin-value')
export const XIN_OBSERVE = 'xinObserve'
export const XIN_BIND = 'xinBind'
export const XIN_ON = 'xinOn'

export const LIST_BINDING_REF = Symbol('list-binding')
export const LIST_INSTANCE_REF = Symbol('list-instance')

// Track which deprecation warnings have been shown
const deprecationWarnings = new Set<string>()

/**
 * Emit a deprecation warning once per unique key.
 */
export function warnDeprecated(key: string, message: string): void {
  if (!deprecationWarnings.has(key)) {
    console.warn(message)
    deprecationWarnings.add(key)
  }
}

/**
 * Reset deprecation warnings (for testing only).
 */
export function _resetDeprecationWarnings(): void {
  deprecationWarnings.clear()
}

/**
 * Wraps a function to emit a deprecation warning once on first call.
 */
export function deprecated<T extends (...args: any[]) => any>(
  fn: T,
  message: string
): T {
  let warned = false
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!warned) {
      console.warn(message)
      warned = true
    }
    return fn(...args)
  }) as T
}

/**
 * Get the path of a xin or boxed proxy.
 * Returns undefined for non-proxy values.
 */
export const tosiPath = (x: any): string | undefined => {
  return (x && x[XIN_PATH]) || undefined
}

/**
 * Get the underlying value of a xin or boxed proxy.
 * Passes through non-proxy values unchanged.
 */
export function tosiValue<T>(x: T): Unboxed<T> {
  if (typeof x === 'object' && x !== null) {
    const val = (x as unknown as XinProps)[XIN_VALUE]
    return (val !== undefined ? val : x) as Unboxed<T>
  }
  return x as Unboxed<T>
}

/**
 * Set the value of a boxed proxy (replaces the entire value at that path).
 * Useful for replacing arrays or objects.
 */
export function tosiSetValue<T>(proxy: any, value: T): void {
  const path = tosiPath(proxy)
  if (path === undefined) {
    throw new Error('tosiSetValue requires a xin or boxed proxy')
  }
  proxy[XIN_VALUE] = value
}

/** @deprecated Use tosiPath instead */
export const xinPath = deprecated(
  tosiPath,
  'xinPath is deprecated. Use tosiPath instead.'
)

/** @deprecated Use tosiValue instead */
export const xinValue = deprecated(
  tosiValue,
  'xinValue is deprecated. Use tosiValue instead.'
)

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
