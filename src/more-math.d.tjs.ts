/**
 * HAND-AUTHORED type bridge for `more-math.tjs`.
 *
 * `allowArbitraryExtensions` makes tsc look for `x.d.tjs.ts` when a `.ts` file
 * imports `./x.tjs`. This file is that declaration.
 *
 * WHY NOT GENERATED: `tjs emit --dts` degrades arrow-const exports to `any`
 * (recorded against tjs-lang as item 12 in TJS-PORT-DX.md, still open as of
 * 0.13.6 — re-check before hand-writing the next one). Everything here is a
 * `function` declaration or a `const`, so the loss would be small, but hand
 * authoring keeps the published `.d.ts` honest and is cheap at this size.
 *
 * KEEP IN SYNC with more-math.tjs. There is no gate proving these agree — the
 * suite imports through this declaration, so a drift shows up as a type error
 * in a consumer, not here. Worth a gate if a second module lands this way.
 */
export declare const RADIANS_TO_DEGREES: number
export declare const DEGREES_TO_RADIANS: number

export declare function clamp(min: number, v: number, max: number): number

export declare function lerp(
  a: number,
  b: number,
  t: number,
  clamped?: boolean
): number

export declare const MoreMath: {
  RADIANS_TO_DEGREES: number
  DEGREES_TO_RADIANS: number
  clamp: typeof clamp
  lerp: typeof lerp
}
