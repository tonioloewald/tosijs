/**
 * Central registry for xin state.
 * Extracted to break circular dependency between xin.ts and bind.ts.
 */
import { XinObject, XinProxy, XinBinding } from './xin-types';
export declare const registry: XinObject;
export declare const setXinProxy: (xin: XinProxy<XinObject>) => void;
export declare const getXinProxy: () => XinProxy<XinObject>;
type BindFunc = (element: Element, path: string, binding: XinBinding, options?: XinObject) => void;
type OnFunc = any;
export declare const setBindFunctions: (bind: BindFunc, on: OnFunc) => void;
export declare const getBind: () => BindFunc;
export declare const getOn: () => OnFunc;
export {};
