/*{ "parent": "utilities", "description": "the shared export surface behind both `tosijs` and `tosijs/core` — everything except the blueprint machinery and the multi-window leaves." }*/
// Single source of truth for what BOTH entries export. `tosijs` adds the
// blueprint loader, makeComponent, share/sync and hotReload on top;
// `tosijs/core` does not. Keeping the list here (rather than duplicating it)
// means an export can never land in one entry and be forgotten in the other.
export { bind, on, touchElement } from './bind'
export { bindings } from './bindings'
export {
  css,
  invertLuminance,
  initVars,
  vars,
  varDefault,
  StyleSheet,
  onStylesheetChange,
  getThemePreferences,
  onThemePreferencesChange,
} from './css'
export type { ColorScheme, ContrastPreference, ThemePreferences } from './css'
export type { TosiStyleSheet, TosiStyleMap, TosiStyleRule } from './css-types'
// the deprecated xinjs-era spellings — type-only aliases, removed in 2.0. This
// is an EXPLICIT export list, not `export *`, so an alias that is not named
// here does not reach a consumer: renaming the three above without adding
// these would have silently broken every `import { XinStyleSheet }`.
export type { XinStyleSheet, XinStyleMap, XinStyleRule } from './css-types'
// the component-contract SHAPE stays on the main entry: declaring
// `static contract` is a component-authoring act, and it is type-only
export type {
  ComponentMap,
  ComponentTestStep,
  // the declared parameter type of EVERY agent verb and of expose.roots /
  // expose.actions — without these a consumer cannot type a wrapper around
  // the surface they are being told to call with proxies
  AgentPathRef,
  AgentObserveRef,
} from './agent'
export { Color } from './color'
export { Component, withAttributes, tosiSlot, xinSlot } from './component'
export type {
  PartsOf,
  ComponentAttrs,
  // `withAttributes`'s return type names DeclaredAttributes, and
  // TosiComponentSpec.type / TosiPackagedComponent.type are declared as
  // ComponentClass — so both are part of the public surface whether or not
  // they are exported. Unexported, a consumer could not name the type their
  // own field or wrapper has to satisfy, which is the situation tosijs#36
  // set out to end. These entry files use EXPLICIT export lists, not
  // `export *`, so a type not named here does not reach anyone.
  DeclaredAttributes,
  WithAttributes,
} from './component'
// exported from their own module (component.ts re-exports the setter for
// historical reasons) — the plug is a security boundary, and a getter that
// lives anywhere but beside the setter is a getter nobody finds
export { setContractValidator, getContractValidator } from './contract-check'
export type {
  ContractValidator,
  SetContractValidatorOptions,
} from './contract-check'
export {
  validateAgainstConstraints,
  type FormValidation,
} from './form-validation'
export { elements, svgElements, mathML, bindParts } from './elements'
export type { ElementsProxy } from './elements-types'
export { getCssVar } from './get-css-var'
export {
  xinPath,
  xinValue,
  tosiPath,
  tosiValue,
  tosiSetValue,
  tosiAccessor,
  TOSI_ACCESSOR,
  TAKE_DESCRIPTOR,
  BOUND_CLASS,
  BOUND_SELECTOR,
  deprecated,
  warnDeprecated,
} from './metadata'
export {
  getListInstance,
  getListItem,
  getListBinding,
  deleteListItem,
  scrollListItemIntoView,
} from './list-binding'
export type {
  ComponentClass,
  TosiBlueprint,
  TosiFactory,
  TosiPackagedComponent,
  TosiComponentSpec,
  // deprecated Xin* aliases (kept for backward compatibility)
  XinBlueprint,
  XinFactory,
  XinPackagedComponent,
  XinComponentSpec,
} from './make-component'
export { MoreMath } from './more-math'
export { settings } from './settings'
export { throttle, debounce } from './throttle'
export { version } from './version'
export { xin, boxed, observe, unobserve, touch, updates } from './xin'
export * from './xin-types'
export { tosi, tosiUnique, xinProxy, boxedProxy } from './xin-proxy'
