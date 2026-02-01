import { XinObject, XinBinding, XinEventHandler, Unboxed } from './xin-types';
export declare const BOUND_CLASS = "-xin-data";
export declare const BOUND_SELECTOR = ".-xin-data";
export declare const EVENT_CLASS = "-xin-event";
export declare const EVENT_SELECTOR = ".-xin-event";
export declare const XIN_PATH: unique symbol;
export declare const XIN_VALUE: unique symbol;
export declare const XIN_OBSERVE = "xinObserve";
export declare const XIN_BIND = "xinBind";
export declare const XIN_ON = "xinOn";
export declare const LIST_BINDING_REF: unique symbol;
export declare const LIST_INSTANCE_REF: unique symbol;
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
}
export type DataBindings = DataBinding[];
export interface XinEventBindings {
    [eventType: string]: Set<XinEventHandler>;
}
export declare const elementToHandlers: WeakMap<Element, XinEventBindings>;
export declare const elementToBindings: WeakMap<Element, DataBindings>;
interface ElementMetadata {
    eventBindings?: XinEventBindings;
    dataBindings?: DataBindings;
}
export declare const getElementBindings: (element: Element) => ElementMetadata;
export declare const cloneWithBindings: (element: Node) => Node;
export {};
