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
