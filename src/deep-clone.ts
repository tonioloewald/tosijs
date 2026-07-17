import { XinObject, XinArray, AnyFunction } from './xin-types'

type Scalar = string | boolean | number | AnyFunction
type Cloneable = Scalar | XinObject | XinArray

// `seen` maps original -> clone so circular references reproduce the cycle in
// the clone instead of blowing the stack, and shared references stay shared.
export function deepClone(
  obj: Cloneable,
  seen?: WeakMap<object, any>
): Cloneable | Cloneable[] {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }
  if (obj instanceof Date) {
    // a Date is a value, not a container — clone it as one (it used to come
    // back as {}, which destroyed Date-valued component `value`s)
    return new Date(obj.getTime()) as unknown as Cloneable
  }
  if (seen === undefined) {
    seen = new WeakMap()
  } else if (seen.has(obj as object)) {
    return seen.get(obj as object)
  }
  if (obj instanceof Set) {
    const clone = new Set()
    seen.set(obj, clone)
    for (const item of obj) {
      clone.add(deepClone(item as Cloneable, seen))
    }
    return clone as unknown as Cloneable
  }
  if (obj instanceof Map) {
    const clone = new Map()
    seen.set(obj, clone)
    for (const [key, value] of obj) {
      clone.set(
        deepClone(key as Cloneable, seen),
        deepClone(value as Cloneable, seen)
      )
    }
    return clone as unknown as Cloneable
  }
  if (Array.isArray(obj)) {
    const clone: Cloneable[] = []
    seen.set(obj, clone)
    for (const item of obj) {
      clone.push(deepClone(item, seen) as Cloneable)
    }
    return clone
  }
  const clone: XinObject = {}
  seen.set(obj as object, clone)
  for (const key in obj) {
    clone[key] = deepClone((obj as XinObject)[key], seen)
  }
  return clone
}
