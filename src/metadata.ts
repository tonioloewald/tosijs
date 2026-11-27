/*{"parent": "managing-state", "order": 3, "description": "Proxy accessor helpers: tosiAccessor(), the TOSI_ACCESSOR symbol, and tosiPath()/tosiValue() for inspecting boxed proxies safely."}*/
/*#
# Metadata

## `tosiAccessor(x: any): TosiAccessor | undefined`

`tosiAccessor` returns the collision-free accessor object from any boxed proxy,
using the `TOSI_ACCESSOR` symbol internally. Returns `undefined` for non-proxy values.

This is the guaranteed escape hatch — it works even if your data has a property
named `tosi` that would shadow the `.tosi` convenience accessor.

```
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const { app } = tosi({ app: { tosi: 'shadowed!', name: 'test' } })

// .tosi is always intercepted by the proxy (not shadowed in practice)
app.tosi.path === 'app'

// tosiAccessor() and TOSI_ACCESSOR are guaranteed collision-free
const acc = tosiAccessor(app)
acc.path === 'app'
acc.value  // { tosi: 'shadowed!', name: 'test' }

// TOSI_ACCESSOR symbol works directly
app[TOSI_ACCESSOR].path === 'app'

// returns undefined for non-proxy values
tosiAccessor('hello') === undefined
tosiAccessor({ foo: 1 }) === undefined
```

## `tosiValue(x: any): any`

`tosiValue` gives you the value behind a proxy, and passes anything else through
unchanged. That is the difference from `.value`: it is safe to call on
something that might or might not be a proxy.

```
import { tosi, tosiValue } from 'tosijs'

const raw = { bar: 'hello', baz: 17 }
const { foo } = tosi({ foo: raw })

foo.bar === raw.bar             // false: foo.bar is a proxy
foo.bar.value === 'hello'       // true
tosiValue(foo.bar) === 'hello'  // true
tosiValue(foo) === raw          // true: the object itself, not a copy
tosiValue(raw) === raw          // true: not a proxy, so passed through
tosiValue('plain') === 'plain'  // true
raw.value                       // undefined: raw is not a proxy
```

## `tosiPath(x: any): string | undefined`

`tosiPath` returns the path a proxy stands for, and `undefined` for anything
that is not a proxy (a path *string* included: it is a string, not a proxy).

```
import { tosi, tosiPath } from 'tosijs'

const raw = { bar: 'hello', baz: 17 }
const { foo } = tosi({ foo: raw })

tosiPath(foo.bar) === 'foo.bar'    // true
tosiPath(foo) === 'foo'            // true
tosiPath(raw) === undefined        // true
tosiPath('foo.bar') === undefined  // true
```

`xinValue()` and `xinPath()` are the deprecated names of these two functions.
They still work, warn once, and go away in 2.0.
*/
import {
  TosiObject,
  TosiProps,
  TosiBinding,
  TosiEventHandler,
  Unboxed,
} from './xin-types'
import { settings } from './settings'
import { deepClone } from './deep-clone'
import { getXinProxy } from './registry'

// data bindings carry a marker class because dispatch must ENUMERATE bound
// elements: a state change hands us a path, not an element, so we ask the DOM
// "which elements are bound?" — and you cannot enumerate a WeakMap. The class is
// the DOM's queryable index; the WeakMap (elementToBindings) holds the rich spec.
// Enumeration uses getElementsByClassName(BOUND_CLASS), which gathers from the
// class-name bucket index (~O(matches)) and measured 1.6–2.6× faster than
// querySelectorAll's whole-tree walk (Blink, scaling with DOM size). BOUND_SELECTOR
// is retained for the closest()-based fromDOM delegation walk and one diagnostic —
// those match a known element, they don't enumerate.
//
// Event handlers need no such marker: the delegated capture listener catches
// every event, and elementToHandlers (a WeakMap) suffices for the ancestor walk
// (element-driven, not enumeration). So there is no EVENT_CLASS — on()-bound
// elements are never mutated.
/**
 * The class tosijs stamps on every data-bound element. Dispatch enumerates
 * bound elements with `document.getElementsByClassName(BOUND_CLASS)`. Exported
 * so integrations reference the symbol instead of hardcoding the literal (which
 * is why the `-xin-data` → `-tosi-data` rename in 1.7.4 was "breaking" only for
 * code that hardcoded it). Prefer binding your own class for styling; use this
 * to *find* bound elements.
 */
export const BOUND_CLASS = '-tosi-data'
/** CSS selector form of {@link BOUND_CLASS} (`.-tosi-data`). */
export const BOUND_SELECTOR = `.${BOUND_CLASS}`

export const XIN_PATH = Symbol.for('xin-path')
export const XIN_VALUE = Symbol.for('xin-value')
export const XIN_OBSERVE = 'xinObserve'
export const XIN_BIND = 'xinBind'
export const XIN_ON = 'xinOn'

export const TOSI_ACCESSOR = Symbol.for('tosi-accessor')
export const TAKE_DESCRIPTOR = Symbol.for('tosi-take')

export const LIST_BINDING_REF = Symbol('list-binding')
export const LIST_INSTANCE_REF = Symbol('list-instance')

/**
 * Registry mapping array paths to their registered idPaths.
 * Used to synthesize id-path touch events when index-based paths are touched.
 */
const arrayIdPathRegistry = new Map<string, Set<string>>()

/**
 * Register an idPath for an array path. Called by ListBinding when a list
 * binding with an idPath is created.
 */
export function registerArrayIdPath(arrayPath: string, idPath: string): void {
  let idPaths = arrayIdPathRegistry.get(arrayPath)
  if (idPaths === undefined) {
    idPaths = new Set()
    arrayIdPathRegistry.set(arrayPath, idPaths)
  }
  idPaths.add(idPath)
}

/**
 * Get all registered idPaths for an array path.
 */
export function getArrayIdPaths(arrayPath: string): Set<string> | undefined {
  return arrayIdPathRegistry.get(arrayPath)
}

/**
 * Unregister an idPath for an array path. Called when a ListBinding is destroyed.
 */
export function unregisterArrayIdPath(arrayPath: string, idPath: string): void {
  const idPaths = arrayIdPathRegistry.get(arrayPath)
  if (idPaths !== undefined) {
    idPaths.delete(idPath)
    if (idPaths.size === 0) {
      arrayIdPathRegistry.delete(arrayPath)
    }
  }
}

/**
 * Where a deprecation warning sends its reader: the rename table in
 * Migration.md. The warning names what is deprecated and what to write
 * instead; the reasons are on the page, so they are not shipped in every
 * bundle (#4285). `bun run build` fails if this page or anchor stops existing
 * (`checkInternalLinks` in bin/site.ts).
 */
export const RENAMES_DOCS =
  'https://tosijs.net/Migration/#deprecated-but-still-working'

// Track which deprecation warnings have been shown
const deprecationWarnings = new Set<string>()

/**
 * Emit a deprecation warning once per unique key.
 */
export function warnDeprecated(key: string, message: string): void {
  if (!deprecationWarnings.has(key)) {
    // still LATCHED when quiet, so turning the flag off mid-session does not
    // suddenly replay warnings for things that already happened
    deprecationWarnings.add(key)
    if (settings.quiet !== true) console.warn(message)
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
    const val = (x as unknown as TosiProps)[XIN_VALUE]
    return (val !== undefined ? val : x) as Unboxed<T>
  }
  return x as Unboxed<T>
}

/**
 * Get the accessor object from a boxed proxy via the TOSI_ACCESSOR symbol.
 * Guaranteed collision-free — works even if your data has a 'tosi' property.
 * Returns undefined for non-proxy values.
 */
export function tosiAccessor(x: any): any | undefined {
  return x != null ? x[TOSI_ACCESSOR] : undefined
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
  binding: TosiBinding<T>
  options?: TosiObject
  /**
   * A take() transform rides the entry as DATA — not hidden in a closure —
   * so row instantiation can clone it (cloneWithBindings deep-clones
   * entries) and rewrite its relative paths per row, exactly like `path`.
   * The closure version captured the template's `^.` paths forever and
   * shared one change-detection cache across every cloned row (one row's
   * update suppressed its siblings'). `lastInputs` is that cache, riding
   * the same per-element metadata: one bindTake call = one element's take
   * object, and each cloned row gets its own via the deep clone.
   */
  take?: {
    paths: string[]
    transform: (...inputs: any[]) => any
    lastInputs?: any[]
  }
}

export type DataBindings = DataBinding[]

/** rewrite a take's relative paths against a list row's path — idempotent */
export const resolveTakePaths = (
  dataBinding: DataBinding,
  itemPath: string
): void => {
  const { take } = dataBinding
  if (take == null) return
  take.paths = take.paths.map((takePath) =>
    takePath.startsWith('^') ? `${itemPath}${takePath.substring(1)}` : takePath
  )
}

/**
 * Apply one data binding to an element: plain bindings get the value at
 * `path`; take bindings read ALL their input paths, memo them per element,
 * and hand toDOM the TRANSFORMED value. Both dispatchers (touchElement and
 * list instantiation) route through here so take semantics can't drift.
 */
export const applyDataBinding = (
  element: Element,
  dataBinding: DataBinding,
  path: string
): void => {
  const { binding, options, take } = dataBinding
  const { toDOM } = binding
  if (toDOM == null) return
  const xin = getXinProxy()
  if (take == null) {
    toDOM(element, xin[path], options)
    return
  }
  const inputs = take.paths.map((takePath) => xin[takePath])
  const last = take.lastInputs
  if (last != null && inputs.every((value, i) => value === last[i])) {
    return
  }
  take.lastInputs = inputs
  toDOM(element, take.transform(...inputs), options)
}

export interface TosiEventBindings {
  [eventType: string]: Set<TosiEventHandler>
}

export const elementToHandlers: WeakMap<Element, TosiEventBindings> =
  new WeakMap()
export const elementToBindings: WeakMap<Element, DataBindings> = new WeakMap()

// inline element contracts — a JSON-Schema-shaped description of the value
// an element binds, declared AT THE ELEMENT (`input({ bindValue, contract })`)
// and stored here beside the other binding metadata (never on the DOM). The
// agent surface harvests these into describe() and enforces them on write();
// top-level curation (expose.contract) overrides them.
const elementContracts: WeakMap<Element, Record<string, any>> = new WeakMap()

/**
 * How many inline element contracts have EVER been declared on this page.
 *
 * `agent.write()` has to ask "does any element declare a contract for this
 * path?", and the answer is found by scanning the live bound elements — a
 * deliberate choice, because a path→element index thrashes under virtual
 * lists (the DOM is the registry). But the overwhelmingly common case is that
 * NOBODY declared an inline contract, and then the scan is pure waste on every
 * uncurated write.
 *
 * A monotonic count answers that case in O(1). It only ever grows — a
 * WeakMap cannot tell us when an element is collected, and an undercount
 * would skip a real check — so this is "have we ever seen one", not "are
 * there any now". Over-scanning is the safe direction; under-scanning would
 * silently stop enforcing a declared contract.
 */
let inlineContractCount = 0

export const anyInlineContracts = (): boolean => inlineContractCount > 0

export const setElementContract = (
  element: Element,
  schema: Record<string, any>
): void => {
  if (!elementContracts.has(element)) inlineContractCount++
  elementContracts.set(element, schema)
}

export const elementContract = (
  element: Element
): Record<string, any> | undefined => elementContracts.get(element)

interface ElementMetadata {
  eventBindings?: TosiEventBindings
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
      // Copy the ENTRIES, share the BINDING objects. A binding is a
      // stateless spec (`{toDOM, fromDOM}`) and its identity is meaningful:
      // the agent surface names a bound prop by looking the binding up in
      // the shared `bindings` collection, so a deep-cloned binding turned
      // every list row's `value: "x ⟷ path"` into an anonymous `detail[]`
      // entry — rows were legible to the framework but not to the map.
      // What must be per-row is the path, the options, and a take()'s input
      // paths (rewritten per row at instantiation).
      elementToBindings.set(
        cloned,
        dataBindings.map((entry) => ({
          ...entry,
          options: entry.options != null ? { ...entry.options } : undefined,
          take:
            entry.take != null
              ? { ...entry.take, paths: [...entry.take.paths] }
              : undefined,
        }))
      )
    }
    if (eventHandlers != null) {
      // @ts-expect-error deepClone returns compatible type
      elementToHandlers.set(cloned, deepClone(eventHandlers))
    }
    // contracts are declarative and shared — the clone wears the same one
    const schema = elementContracts.get(element as Element)
    if (schema != null) {
      elementContracts.set(cloned, schema)
    }
  }
  // For a <template>, children live in (and must be cloned into) .content:
  // per spec, appendChild on the template element itself appends to the
  // ELEMENT, leaving the clone's .content empty — so ListBinding's
  // "template has no children" check throws in real browsers. (Happy-dom
  // non-spec-compliantly redirects appendChild to .content, masking this.)
  const appendTarget =
    cloned instanceof HTMLTemplateElement ? cloned.content : cloned
  for (const node of Array.from(
    element instanceof HTMLTemplateElement
      ? element.content.childNodes
      : element.childNodes
  )) {
    if (node instanceof Element || node instanceof DocumentFragment) {
      appendTarget.appendChild(cloneWithBindings(node))
    } else {
      appendTarget.appendChild(node.cloneNode())
    }
  }
  return cloned
}

/* --- DEPRECATED `Xin*` SPELLINGS -------------------------------------------
 * The library is tosijs; these names are xinjs-era. The canonical spellings
 * are the `Tosi*` forms above. Kept exported so existing
 * `import { XinStyleSheet } from 'tosijs'` keeps compiling — a type-only
 * alias, so it costs nothing at runtime and nothing in the bundle.
 *
 * SCHEDULED FOR REMOVAL IN 2.0. The blueprint types were renamed this way in
 * 1.7.6 and the remaining 22 were simply missed, untracked, for four
 * releases — so this block states its own end, rather than drifting again.
 * -------------------------------------------------------------------------- */
