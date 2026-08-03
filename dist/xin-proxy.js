import { xin, boxed } from './xin';
import { warnDeprecated } from './metadata';
import { id } from './by-path';
export function tosi(obj) {
    Object.assign(boxed, obj);
    return boxed;
}
export function boxedProxy(obj) {
    warnDeprecated('boxedProxy', 'boxedProxy is deprecated, please use tosi() instead');
    return tosi(obj);
}
/*#
## `tosiUnique()`

`tosiUnique()` creates a reactive proxy stored under a guaranteed unique key.
This is useful for component instances or any situation where you need
per-instance reactive state without worrying about key collisions.

It returns a tuple of `[proxy, removeFunc]`:

- `proxy` is a `BoxedProxy<T>` — the reactive proxy for your object
- `removeFunc` is a cleanup function that removes the state from the registry

If you pass an `owner` object (e.g. `this` in a component), the state will
be automatically cleaned up when the owner is garbage collected — no need
to call the remove function manually.

Typical usage in a component:

    class MyComponent extends Component {
      proxy = tosiUnique({ count: 0, name: '' }, this)[0]
    }

Or if you want explicit cleanup control:

    const [proxy, remove] = tosiUnique({ count: 0, name: '' })
    // ... later ...
    remove()

*/
const tosiUniqueCleanup = new FinalizationRegistry((remove) => {
    remove();
});
export function tosiUnique(obj, owner) {
    const key = id();
    boxed[key] = obj;
    const proxy = boxed[key];
    const remove = () => {
        delete xin[key];
    };
    if (owner) {
        tosiUniqueCleanup.register(owner, remove);
    }
    return [proxy, remove];
}
export function xinProxy(obj, boxed = false) {
    if (boxed) {
        warnDeprecated('xinProxy-boxed', 'xinProxy(..., true) is deprecated; use tosi(...) instead');
        // @ts-expect-error deprecated
        return boxedProxy(obj);
    }
    Object.keys(obj).forEach((key) => {
        xin[key] = obj[key];
    });
    return xin;
}
