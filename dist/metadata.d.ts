import { XinObject, XinBinding, XinEventHandler, Unboxed } from './xin-types';
/**
 * The class tosijs stamps on every data-bound element. Dispatch enumerates
 * bound elements with `document.getElementsByClassName(BOUND_CLASS)`. Exported
 * so integrations reference the symbol instead of hardcoding the literal (which
 * is why the `-xin-data` → `-tosi-data` rename in 1.7.4 was "breaking" only for
 * code that hardcoded it). Prefer binding your own class for styling; use this
 * to *find* bound elements.
 */
export declare const BOUND_CLASS = "-tosi-data";
/** CSS selector form of {@link BOUND_CLASS} (`.-tosi-data`). */
export declare const BOUND_SELECTOR = ".-tosi-data";
export declare const XIN_PATH: unique symbol;
export declare const XIN_VALUE: unique symbol;
export declare const XIN_OBSERVE = "xinObserve";
export declare const XIN_BIND = "xinBind";
export declare const XIN_ON = "xinOn";
export declare const TOSI_ACCESSOR: unique symbol;
export declare const TAKE_DESCRIPTOR: unique symbol;
export declare const LIST_BINDING_REF: unique symbol;
export declare const LIST_INSTANCE_REF: unique symbol;
/**
 * Register an idPath for an array path. Called by ListBinding when a list
 * binding with an idPath is created.
 */
export declare function registerArrayIdPath(arrayPath: string, idPath: string): void;
/**
 * Get all registered idPaths for an array path.
 */
export declare function getArrayIdPaths(arrayPath: string): Set<string> | undefined;
/**
 * Unregister an idPath for an array path. Called when a ListBinding is destroyed.
 */
export declare function unregisterArrayIdPath(arrayPath: string, idPath: string): void;
/**
 * Get all registered array paths (for debugging/testing).
 */
export declare function _getArrayIdPathRegistry(): Map<string, Set<string>>;
/**
 * Emit a deprecation warning once per unique key.
 */
export declare function warnDeprecated(key: string, message: string): void;
/**
 * Reset deprecation warnings (for testing only).
 */
export declare function _resetDeprecationWarnings(): void;
/**
 * Wraps a function to emit a deprecation warning once on first call.
 */
export declare function deprecated<T extends (...args: any[]) => any>(fn: T, message: string): T;
/**
 * Get the path of a xin or boxed proxy.
 * Returns undefined for non-proxy values.
 */
export declare const tosiPath: (x: any) => string | undefined;
/**
 * Get the underlying value of a xin or boxed proxy.
 * Passes through non-proxy values unchanged.
 */
export declare function tosiValue<T>(x: T): Unboxed<T>;
/**
 * Get the accessor object from a boxed proxy via the TOSI_ACCESSOR symbol.
 * Guaranteed collision-free — works even if your data has a 'tosi' property.
 * Returns undefined for non-proxy values.
 */
export declare function tosiAccessor(x: any): any | undefined;
/**
 * Set the value of a boxed proxy (replaces the entire value at that path).
 * Useful for replacing arrays or objects.
 */
export declare function tosiSetValue<T>(proxy: any, value: T): void;
/** @deprecated Use tosiPath instead */
export declare const xinPath: (x: any) => string | undefined;
/** @deprecated Use tosiValue instead */
export declare const xinValue: typeof tosiValue;
export interface DataBinding<T extends Element = Element> {
    path: string;
    binding: XinBinding<T>;
    options?: XinObject;
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
        paths: string[];
        transform: (...inputs: any[]) => any;
        lastInputs?: any[];
    };
}
export type DataBindings = DataBinding[];
/** rewrite a take's relative paths against a list row's path — idempotent */
export declare const resolveTakePaths: (dataBinding: DataBinding, itemPath: string) => void;
/**
 * Apply one data binding to an element: plain bindings get the value at
 * `path`; take bindings read ALL their input paths, memo them per element,
 * and hand toDOM the TRANSFORMED value. Both dispatchers (touchElement and
 * list instantiation) route through here so take semantics can't drift.
 */
export declare const applyDataBinding: (element: Element, dataBinding: DataBinding, path: string) => void;
export interface XinEventBindings {
    [eventType: string]: Set<XinEventHandler>;
}
export declare const elementToHandlers: WeakMap<Element, XinEventBindings>;
export declare const elementToBindings: WeakMap<Element, DataBindings>;
export declare const setElementContract: (element: Element, schema: Record<string, any>) => void;
export declare const elementContract: (element: Element) => Record<string, any> | undefined;
interface ElementMetadata {
    eventBindings?: XinEventBindings;
    dataBindings?: DataBindings;
}
export declare const getElementBindings: (element: Element) => ElementMetadata;
export declare const cloneWithBindings: (element: Node) => Node;
export {};
