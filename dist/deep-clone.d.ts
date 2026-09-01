import { TosiObject, TosiArray, AnyFunction } from './xin-types';
type Scalar = string | boolean | number | AnyFunction;
type Cloneable = Scalar | TosiObject | TosiArray;
export declare function deepClone(obj: Cloneable, seen?: WeakMap<object, any>): Cloneable | Cloneable[];
export {};
