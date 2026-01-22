import { XIN_PATH, XIN_VALUE, XIN_OBSERVE, XIN_BIND } from './metadata'
import { XinStyleRule } from './css-types'
import { ElementsProxy } from './elements-types'

export type AnyFunction = (...args: any[]) => any | Promise<any>

export type XinScalar = string | boolean | number | symbol | AnyFunction

export type XinArray = any[]

export interface XinObject {
  [key: string | number | symbol]: any
}

export type XinProxyTarget = XinObject | XinArray

export type XinValue = XinObject | XinArray | XinScalar | null | undefined

type ProxyObserveFunc = ((path: string) => void)
type ProxyBindFunc<T extends Element = Element> = (element: T, binding: XinBinding<T>, options?: XinObject) => VoidFunction

export interface XinProps<T = any> {
  [XIN_PATH]: string
  tosiPath: string
  [XIN_VALUE]: T
  tosiValue: T
  [XIN_OBSERVE]: ProxyObserveFunc
  tosiObserve: ProxyObserveFunc
  [XIN_BIND]: ProxyBindFunc
  tosiBind: ProxyBindFunc
}

type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U) => HTMLElement
type ListBinding = [ElementProps, HTMLTemplateElement]

export interface BoxedArrayProps<U = any> {
  tosiListBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding
  listBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding
}

/**
 * BoxedScalar represents a boxed primitive value (string, number, boolean, null, undefined).
 * It provides a clean API for accessing the value and path, and catches the common
 * comparison trap where users write `proxy.x === 3` instead of `proxy.x.value === 3`.
 *
 * Note: Direct assignment like `proxy.x = 3` is a TypeScript type error due to
 * fundamental limitations in TypeScript's mapped types (no asymmetric get/set).
 * Use `proxy.x.value = 3` instead.
 */
export interface BoxedScalar<T> {
  // New primary API
  value: T
  path: string
  observe: (callback: ObserverCallbackFunction) => VoidFunction
  bind: <E extends Element = Element>(element: E, binding: XinBinding<E>, options?: XinObject) => void
  on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  binding: (binding: XinBinding) => { bind: { value: string; binding: XinBinding } }

  // valueOf for == compatibility (but === will still fail as expected)
  valueOf: () => T

  // Deprecated aliases - will trigger console warning
  xinValue: T
  xinPath: string
  tosiValue: T
  tosiPath: string
  xinObserve: (callback: ObserverCallbackFunction) => VoidFunction
  tosiObserve: (callback: ObserverCallbackFunction) => VoidFunction
  xinBind: <E extends Element = Element>(element: E, binding: XinBinding<E>, options?: XinObject) => void
  tosiBind: <E extends Element = Element>(element: E, binding: XinBinding<E>, options?: XinObject) => void
  xinOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  tosiOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  tosiBinding: (binding: XinBinding) => { bind: { value: string; binding: XinBinding } }
}

export type BoxedProxy<T = any> = T extends Array<infer U>
  ? Array<BoxedProxy<U>> & XinProps<T> & BoxedArrayProps<U>
  : T extends Function
  ? T & XinProps<Function>
  : T extends object
  ? {
    [K in keyof T]: BoxedProxy<T[K]>
  } & XinProps<T>
  : T extends string
  ? BoxedScalar<string>
  : T extends number
  ? BoxedScalar<number>
  : T extends boolean
  ? BoxedScalar<boolean>
  : T extends undefined | null
  ? BoxedScalar<T>
  : T

export type Unboxed<T = any> = T extends String
  ? string
  : T extends Number
  ? number
  : T extends Boolean
  ? boolean
  : T

export type XinProxy<T = any> = T extends Array<infer U>
  ? Array<XinProxy<U>>
  : T extends Function
  ? T
  : T extends object
  ? {
    [K in keyof T]: T[K] extends object ? XinProxy<T[K]> : T[K]
  }
  : T

export type XinProxyObject = XinProps<object> & {
  [key: string]:
    | XinProxyObject
    | XinProxyArray
    | XinObject
    | XinArray
    | XinScalar
}

export type XinProxyArray = XinProps<[]> & { [key: string]: XinProxyObject } & (
    | XinProxyObject[]
    | XinScalar[]
  )
export type XinTouchableType = string | XinProxy | BoxedProxy | String | Number | Boolean

export type EventType = keyof HTMLElementEventMap
export type XinEventHandler<T extends Event = Event, E = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
export type XinBindingShortcut = XinTouchableType | XinBindingSpec

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction =
  | ((path: string) => void)
  | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface XinBindingSpec {
  value: XinTouchableType | any
  [key: string]: any
}

export type XinBindingSetter<T = Element> = (
  element: T,
  value: any,
  options?: XinObject
) => void
export type XinBindingGetter<T = Element> = (
  element: T,
  options?: XinObject
) => any

export interface XinBinding<T = Element> {
  toDOM?: XinBindingSetter<T>
  fromDOM?: XinBindingGetter<T>
}

export interface XinInlineBinding<T = Element> {
  value: XinTouchableType
  binding: XinBinding<T> | XinBindingSetter<T> | string
}

export interface ElementProps<T = Element> {
  onClick?: XinEventHandler<MouseEvent, T>
  onMousedown?: XinEventHandler<MouseEvent, T>
  onMouseenter?: XinEventHandler<MouseEvent, T>
  onMouseleave?: XinEventHandler<MouseEvent, T>
  onMouseup?: XinEventHandler<MouseEvent, T>
  onTouchstart?: XinEventHandler<TouchEvent, T>
  onTouchmove?: XinEventHandler<TouchEvent, T>
  onTouchend?: XinEventHandler<TouchEvent, T>
  onTouchcancel?: XinEventHandler<TouchEvent, T>
  onDragstart?: XinEventHandler<DragEvent, T>
  onDragover?: XinEventHandler<DragEvent, T>
  onDragend?: XinEventHandler<DragEvent, T>
  onDragenter?: XinEventHandler<DragEvent, T>
  onDragleave?: XinEventHandler<DragEvent, T>
  onInput?: XinEventHandler<InputEvent, T>
  onChange?: XinEventHandler<InputEvent, T>
  onSubmit?: XinEventHandler<SubmitEvent, T>
  onKeydown?: XinEventHandler<KeyboardEvent, T>
  onKeyup?: XinEventHandler<KeyboardEvent, T>
  bind?: XinInlineBinding<T>
  bindValue?: XinBindingShortcut
  bindText?: XinBindingShortcut
  bindList?: XinBindingShortcut
  bindEnabled?: XinBindingShortcut
  bindDisabled?: XinBindingShortcut
  style?: XinStyleRule
  class?: string
  apply?: (element: Element) => void | Promise<void>
  [key: string]: any
}

export interface StringMap {
  [key: string]: any
}

export interface PartsMap {
  [key: string]: Element
}

export type ValueElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
export type ElementPart<T = Element> =
  | Element
  | DocumentFragment
  | ElementProps<T>
  | string
  | number
export type HTMLElementCreator<T = HTMLElement> = (
  ...contents: ElementPart<T>[]
) => T
export type FragmentCreator = (
  ...contents: ElementPart<Element>[]
) => DocumentFragment
export type ElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T
export type ContentPart = Element | DocumentFragment | string
export type ContentType = ContentPart | ContentPart[]

export type ListFilter = (array: any[], needle: any) => any[]
export interface ListBindingOptions {
  idPath?: string
  virtual?: {
    height: number
    width?: number
    visibleColumns?: number
    rowChunkSize?: number
    /** Use 'window' to virtualize based on window scroll position instead of element scroll */
    scrollContainer?: 'window' | 'element'
  }
  hiddenProp?: symbol | string
  visibleProp?: symbol | string
  filter?: ListFilter
  needle?: XinTouchableType
}
