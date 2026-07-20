import { XinObject, XinArray, AnyFunction } from './xin-types';
type Scalar = string | boolean | number | AnyFunction;
type Cloneable = Scalar | XinObject | XinArray;
export declare function deepClone(obj: Cloneable, seen?: WeakMap<object, any>): Cloneable | Cloneable[];
export {};
