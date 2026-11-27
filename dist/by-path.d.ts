import { TosiObject, TosiArray } from './xin-types';
export declare const id: () => string;
type Part = string | string[];
type PartArray = Part[];
declare function pathParts(path: string | PartArray): PartArray;
/**
 * The one answer to "can this value hold properties", which is also "does it
 * get a proxy of its own" (xin.ts) and "may a write descend into it" (below).
 *
 * It was asked five ways, each wrong for a different input. `instanceof
 * Object` is false for a null-prototype object (`Object.groupBy` returns one,
 * so does a regex match's `groups`) and for an object from another realm, so
 * those came back from the proxy unproxied, with no path and silent writes,
 * and a write into one held in an array threw "expected Object". `typeof x
 * === 'object'` alone is true for null, and `new Proxy(null)` throws.
 */
export declare const isContainer: (value: unknown) => boolean;
export declare class UnsafePathError extends Error {
    constructor(key: string);
}
/**
 * Throws on a segment that would reach the prototype chain while DESCENDING.
 * All three names are refused here, because descending through any of them
 * lands outside the object graph.
 */
export declare const isUnsafeKey: (key: string) => boolean;
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
/**
 * The row an id segment (`idPath=value`) names, for a READ. The one reading of
 * such a segment, shared by `getByPath` and the proxy's get trap so the two
 * cannot disagree about which row an id means. The value is everything after
 * the FIRST `=`, so an id that contains one (base64 padding) stays whole. The
 * proxy split on every `=` and searched the array itself, and `[id=YWJj=]`
 * named the row whose id is `YWJj`.
 */
export declare function byIdSegment(array: any[] | TosiObject, segment: string): any;
declare function getByPath(obj: TosiObject | TosiArray, path: string): any;
declare function setByPath(orig: TosiObject | TosiArray, path: string, val: any): boolean;
declare function deleteByPath(orig: TosiObject, path: string): void;
export { getByPath, setByPath, deleteByPath, pathParts };
