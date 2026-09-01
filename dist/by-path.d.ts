import { TosiObject, TosiArray } from './xin-types';
export declare const id: () => string;
type Part = string | string[];
type PartArray = Part[];
declare function pathParts(path: string | PartArray): PartArray;
export declare class UnsafePathError extends Error {
    constructor(key: string);
}
/**
 * Throws on a segment that would reach the prototype chain while DESCENDING.
 * All three names are refused here, because descending through any of them
 * lands outside the object graph.
 */
export declare function assertSafeKey(key: string): void;
/**
 * The same guard for a TERMINAL assignment — deliberately narrower.
 *
 * Only `__proto__` is a sink at a leaf: `obj.__proto__ = x` reassigns the
 * prototype, so it must never be a data key. `constructor` and `prototype` are
 * ordinary own properties when you merely ASSIGN them — and they are real
 * data keys in real apps, because dictionaries get keyed by user data (an i18n
 * table, a cache, a colour-name map). Refusing them at a leaf broke code that
 * worked in 1.7.9 and bought nothing: descent is where they are dangerous, and
 * descent still refuses all three (assertSafeKey above, plus byKey's
 * own-property check).
 */
export declare function assertSafeLeafKey(key: string): void;
declare function getByPath(obj: TosiObject | TosiArray, path: string): any;
declare function setByPath(orig: TosiObject | TosiArray, path: string, val: any): boolean;
declare function deleteByPath(orig: TosiObject, path: string): void;
export { getByPath, setByPath, deleteByPath, pathParts };
