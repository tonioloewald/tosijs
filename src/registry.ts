/**
 * Central registry for xin state.
 * Extracted to break circular dependency between xin.ts and bind.ts.
 */
import { XinObject, XinProxy, XinBinding } from './xin-types'

export const registry: XinObject = {}

// Lazy reference to xin proxy - set by xin.ts on initialization
let _xin: XinProxy<XinObject> | null = null

export const setXinProxy = (xin: XinProxy<XinObject>): void => {
  _xin = xin
}

export const getXinProxy = (): XinProxy<XinObject> => {
  if (_xin === null) {
    throw new Error('xin proxy not initialized')
  }
  return _xin
}

// Lazy references to bind and on functions - set by bind.ts on initialization
type BindFunc = (
  element: Element,
  path: string,
  binding: XinBinding,
  options?: XinObject
) => void
// Using 'any' for OnFunc to accommodate the generic signature of the actual 'on' function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnFunc = any

let _bind: BindFunc | null = null
let _on: OnFunc | null = null

export const setBindFunctions = (bind: BindFunc, on: OnFunc): void => {
  _bind = bind
  _on = on
}

export const getBind = (): BindFunc => {
  if (_bind === null) {
    throw new Error('bind not initialized')
  }
  return _bind
}

export const getOn = (): OnFunc => {
  if (_on === null) {
    throw new Error('on not initialized')
  }
  return _on
}
