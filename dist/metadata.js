import { deepClone } from './deep-clone';
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
export const BOUND_CLASS = '-tosi-data';
/** CSS selector form of {@link BOUND_CLASS} (`.-tosi-data`). */
export const BOUND_SELECTOR = `.${BOUND_CLASS}`;
export const XIN_PATH = Symbol.for('xin-path');
export const XIN_VALUE = Symbol.for('xin-value');
export const XIN_OBSERVE = 'xinObserve';
export const XIN_BIND = 'xinBind';
export const XIN_ON = 'xinOn';
export const TOSI_ACCESSOR = Symbol.for('tosi-accessor');
export const TAKE_DESCRIPTOR = Symbol.for('tosi-take');
export const LIST_BINDING_REF = Symbol('list-binding');
export const LIST_INSTANCE_REF = Symbol('list-instance');
/**
 * Registry mapping array paths to their registered idPaths.
 * Used to synthesize id-path touch events when index-based paths are touched.
 */
const arrayIdPathRegistry = new Map();
/**
 * Register an idPath for an array path. Called by ListBinding when a list
 * binding with an idPath is created.
 */
export function registerArrayIdPath(arrayPath, idPath) {
    let idPaths = arrayIdPathRegistry.get(arrayPath);
    if (idPaths === undefined) {
        idPaths = new Set();
        arrayIdPathRegistry.set(arrayPath, idPaths);
    }
    idPaths.add(idPath);
}
/**
 * Get all registered idPaths for an array path.
 */
export function getArrayIdPaths(arrayPath) {
    return arrayIdPathRegistry.get(arrayPath);
}
/**
 * Unregister an idPath for an array path. Called when a ListBinding is destroyed.
 */
export function unregisterArrayIdPath(arrayPath, idPath) {
    const idPaths = arrayIdPathRegistry.get(arrayPath);
    if (idPaths !== undefined) {
        idPaths.delete(idPath);
        if (idPaths.size === 0) {
            arrayIdPathRegistry.delete(arrayPath);
        }
    }
}
/**
 * Get all registered array paths (for debugging/testing).
 */
export function _getArrayIdPathRegistry() {
    return arrayIdPathRegistry;
}
// Track which deprecation warnings have been shown
const deprecationWarnings = new Set();
/**
 * Emit a deprecation warning once per unique key.
 */
export function warnDeprecated(key, message) {
    if (!deprecationWarnings.has(key)) {
        console.warn(message);
        deprecationWarnings.add(key);
    }
}
/**
 * Reset deprecation warnings (for testing only).
 */
export function _resetDeprecationWarnings() {
    deprecationWarnings.clear();
}
/**
 * Wraps a function to emit a deprecation warning once on first call.
 */
export function deprecated(fn, message) {
    let warned = false;
    return ((...args) => {
        if (!warned) {
            console.warn(message);
            warned = true;
        }
        return fn(...args);
    });
}
/**
 * Get the path of a xin or boxed proxy.
 * Returns undefined for non-proxy values.
 */
export const tosiPath = (x) => {
    return (x && x[XIN_PATH]) || undefined;
};
/**
 * Get the underlying value of a xin or boxed proxy.
 * Passes through non-proxy values unchanged.
 */
export function tosiValue(x) {
    if (typeof x === 'object' && x !== null) {
        const val = x[XIN_VALUE];
        return (val !== undefined ? val : x);
    }
    return x;
}
/**
 * Get the accessor object from a boxed proxy via the TOSI_ACCESSOR symbol.
 * Guaranteed collision-free — works even if your data has a 'tosi' property.
 * Returns undefined for non-proxy values.
 */
export function tosiAccessor(x) {
    return x != null ? x[TOSI_ACCESSOR] : undefined;
}
/**
 * Set the value of a boxed proxy (replaces the entire value at that path).
 * Useful for replacing arrays or objects.
 */
export function tosiSetValue(proxy, value) {
    const path = tosiPath(proxy);
    if (path === undefined) {
        throw new Error('tosiSetValue requires a xin or boxed proxy');
    }
    proxy[XIN_VALUE] = value;
}
/** @deprecated Use tosiPath instead */
export const xinPath = deprecated(tosiPath, 'xinPath is deprecated. Use tosiPath instead.');
/** @deprecated Use tosiValue instead */
export const xinValue = deprecated(tosiValue, 'xinValue is deprecated. Use tosiValue instead.');
export const elementToHandlers = new WeakMap();
export const elementToBindings = new WeakMap();
export const getElementBindings = (element) => {
    return {
        eventBindings: elementToHandlers.get(element),
        dataBindings: elementToBindings.get(element),
    };
};
export const cloneWithBindings = (element) => {
    const cloned = element.cloneNode();
    if (cloned instanceof Element) {
        const dataBindings = elementToBindings.get(element);
        const eventHandlers = elementToHandlers.get(element);
        if (dataBindings != null) {
            // @ts-expect-error deepClone returns compatible type
            elementToBindings.set(cloned, deepClone(dataBindings));
        }
        if (eventHandlers != null) {
            // @ts-expect-error deepClone returns compatible type
            elementToHandlers.set(cloned, deepClone(eventHandlers));
        }
    }
    // For a <template>, children live in (and must be cloned into) .content:
    // per spec, appendChild on the template element itself appends to the
    // ELEMENT, leaving the clone's .content empty — so ListBinding's
    // "template has no children" check throws in real browsers. (Happy-dom
    // non-spec-compliantly redirects appendChild to .content, masking this.)
    const appendTarget = cloned instanceof HTMLTemplateElement ? cloned.content : cloned;
    for (const node of Array.from(element instanceof HTMLTemplateElement
        ? element.content.childNodes
        : element.childNodes)) {
        if (node instanceof Element || node instanceof DocumentFragment) {
            appendTarget.appendChild(cloneWithBindings(node));
        }
        else {
            appendTarget.appendChild(node.cloneNode());
        }
    }
    return cloned;
};
