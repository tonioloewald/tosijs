import { settings } from './settings';
import { deepClone } from './deep-clone';
import { getXinProxy } from './registry';
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
        // still LATCHED when quiet, so turning the flag off mid-session does not
        // suddenly replay warnings for things that already happened
        deprecationWarnings.add(key);
        if (settings.quiet !== true)
            console.warn(message);
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
/** rewrite a take's relative paths against a list row's path — idempotent */
export const resolveTakePaths = (dataBinding, itemPath) => {
    const { take } = dataBinding;
    if (take == null)
        return;
    take.paths = take.paths.map((takePath) => takePath.startsWith('^') ? `${itemPath}${takePath.substring(1)}` : takePath);
};
/**
 * Apply one data binding to an element: plain bindings get the value at
 * `path`; take bindings read ALL their input paths, memo them per element,
 * and hand toDOM the TRANSFORMED value. Both dispatchers (touchElement and
 * list instantiation) route through here so take semantics can't drift.
 */
export const applyDataBinding = (element, dataBinding, path) => {
    const { binding, options, take } = dataBinding;
    const { toDOM } = binding;
    if (toDOM == null)
        return;
    const xin = getXinProxy();
    if (take == null) {
        toDOM(element, xin[path], options);
        return;
    }
    const inputs = take.paths.map((takePath) => xin[takePath]);
    const last = take.lastInputs;
    if (last != null && inputs.every((value, i) => value === last[i])) {
        return;
    }
    take.lastInputs = inputs;
    toDOM(element, take.transform(...inputs), options);
};
export const elementToHandlers = new WeakMap();
export const elementToBindings = new WeakMap();
// inline element contracts — a JSON-Schema-shaped description of the value
// an element binds, declared AT THE ELEMENT (`input({ bindValue, contract })`)
// and stored here beside the other binding metadata (never on the DOM). The
// agent surface harvests these into describe() and enforces them on write();
// top-level curation (expose.contract) overrides them.
const elementContracts = new WeakMap();
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
let inlineContractCount = 0;
export const anyInlineContracts = () => inlineContractCount > 0;
/**
 * Bumped whenever something could have made a NEW (element, binding) pair
 * visible in the document — a data binding being registered, or a subtree
 * being inserted. Consumers that derive a fact from "walk the bound elements"
 * cache against this instead of re-deriving on every call.
 *
 * SECURITY-RELEVANT, so the signal is deliberately generous. The agent
 * surface's secret-path scan reads it, and a missed bump there is an
 * under-redaction — a leak — while a spurious bump costs one extra
 * `querySelectorAll` over a selector that matches almost nothing. Bump
 * eagerly; the asymmetry is not close.
 *
 * Removals deliberately do NOT bump: the secret-path set only ever grows, so
 * losing an element can never require a rescan.
 */
let domBindingGeneration = 0;
export const bindingGeneration = () => domBindingGeneration;
export const noteBindingChange = () => {
    domBindingGeneration++;
};
export const setElementContract = (element, schema) => {
    if (!elementContracts.has(element))
        inlineContractCount++;
    elementContracts.set(element, schema);
};
export const elementContract = (element) => elementContracts.get(element);
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
            // Copy the ENTRIES, share the BINDING objects. A binding is a
            // stateless spec (`{toDOM, fromDOM}`) and its identity is meaningful:
            // the agent surface names a bound prop by looking the binding up in
            // the shared `bindings` collection, so a deep-cloned binding turned
            // every list row's `value: "x ⟷ path"` into an anonymous `detail[]`
            // entry — rows were legible to the framework but not to the map.
            // What must be per-row is the path, the options, and a take()'s input
            // paths (rewritten per row at instantiation).
            elementToBindings.set(cloned, dataBindings.map((entry) => ({
                ...entry,
                options: entry.options != null ? { ...entry.options } : undefined,
                take: entry.take != null
                    ? { ...entry.take, paths: [...entry.take.paths] }
                    : undefined,
            })));
        }
        if (eventHandlers != null) {
            // @ts-expect-error deepClone returns compatible type
            elementToHandlers.set(cloned, deepClone(eventHandlers));
        }
        // contracts are declarative and shared — the clone wears the same one
        const schema = elementContracts.get(element);
        if (schema != null) {
            elementContracts.set(cloned, schema);
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
