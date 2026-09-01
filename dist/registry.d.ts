/**
 * Central registry for xin state.
 * Extracted to break circular dependency between xin.ts and bind.ts.
 */
import { TosiObject, TosiProxy, TosiBinding } from './xin-types';
export declare const registry: TosiObject;
export declare const setXinProxy: (xin: TosiProxy<TosiObject>) => void;
export declare const getXinProxy: () => TosiProxy<TosiObject>;
type BindFunc = (element: Element, path: string, binding: TosiBinding, options?: TosiObject) => void;
type OnFunc = any;
export declare const setBindFunctions: (bind: BindFunc, on: OnFunc) => void;
export declare const getBind: () => BindFunc;
export declare const getOn: () => OnFunc;
export {};
