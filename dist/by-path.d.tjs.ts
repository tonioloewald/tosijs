/**
 * Type declarations for the native TJS module `by-path.tjs`.
 *
 * TypeScript resolves the types of `import './by-path.tjs'` from this file, via
 * `allowArbitraryExtensions` in tsconfig.build.json. Hand-authored: tjs-lang's
 * `generateDTS` still degrades arrow-function consts to `any` (upstream issue #4),
 * so auto-emission would silently widen this public surface. Keep in sync with
 * `by-path.tjs`'s exports.
 */
import { XinObject, XinArray } from './xin-types'

type Part = string | string[]
type PartArray = Part[]

export declare const id: () => string
export declare function pathParts(path: string | PartArray): PartArray
export declare function getByPath(obj: XinObject | XinArray, path: string): any
export declare function setByPath(
  orig: XinObject | XinArray,
  path: string,
  val: any
): boolean
export declare function deleteByPath(orig: XinObject, path: string): void
