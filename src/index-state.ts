/*{ "parent": "utilities", "description": "tosijs/state — the DOM-free state layer: observable path-addressed state importable anywhere, including plain Node." }*/
/*#
# tosijs/state (DOM-free)

State that belongs to no framework — and no *environment*. `tosijs/state`
is the observable-state layer with **no DOM globals touched at import**, so
it loads in plain Node, a worker, an SSR pipeline, or a migration script
with no `happy-dom` shim in sight:

    import { tosi, observe, xin } from 'tosijs/state'

    const { app } = tosi({ app: { count: 0 } })
    observe('app.count', (path) => console.log('changed:', path, xin[path]))
    app.count = 1

Everything here is identical to the same export from `tosijs` — this is a
narrower door onto the same house, not a different implementation. Bindings,
components, CSS and the agent surface live behind the main entry (and
`tosijs/core`), because those genuinely need a DOM.

Observers still fire in a DOM-free environment; there is simply nothing
bound for them to update.

> Closes tosijs#18 (raised from react-tosijs, which consumes exclusively
> DOM-free API).
*/
export { xin, boxed, observe, unobserve, touch, updates } from './xin'
export { tosi, tosiUnique, xinProxy, boxedProxy } from './xin-proxy'
export { getByPath, setByPath, deleteByPath, pathParts, id } from './by-path'
export {
  xinPath,
  xinValue,
  tosiPath,
  tosiValue,
  tosiSetValue,
  tosiAccessor,
  TOSI_ACCESSOR,
  TAKE_DESCRIPTOR,
} from './metadata'
export { throttle, debounce } from './throttle'
export { MoreMath } from './more-math'
export { settings } from './settings'
export { version } from './version'
export type {
  XinObject,
  XinArray,
  XinScalar,
  XinValue,
  XinProxy,
  BoxedProxy,
  BoxedScalar,
  XinTouchableType,
  XinBinding,
  ListBindingOptions,
} from './xin-types'
