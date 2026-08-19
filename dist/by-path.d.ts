import { XinObject, XinArray } from './xin-types';
export declare const id: () => string;
type Part = string | string[];
type PartArray = Part[];
declare function pathParts(path: string | PartArray): PartArray;
export declare class UnsafePathError extends Error {
    constructor(key: string);
}
/** throws on a segment that would reach the prototype chain */
export declare function assertSafeKey(key: string): void;
declare function getByPath(obj: XinObject | XinArray, path: string): any;
declare function setByPath(orig: XinObject | XinArray, path: string, val: any): boolean;
declare function deleteByPath(orig: XinObject, path: string): void;
export { getByPath, setByPath, deleteByPath, pathParts };
