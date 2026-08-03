export { bind, on, touchElement } from './bind'
export { enableAgentInterface, BOUND_TO_DOM, BOUND_TWO_WAY } from './agent'
export { schematicSVG, rasterizeSVG } from './schematic'
export { exerciseContract, exerciseComponent } from './contract'
export type {
  ContractReport,
  ContractTrial,
  ComponentReport,
  ComponentTrial,
} from './contract'
export { webmcpTools, webmcpAdapter } from './webmcp'
export type { WebMCPTool, WebMCPAdapterOptions } from './webmcp'
export type { SchematicOptions } from './schematic'
export type {
  AgentInterface,
  AgentInterfaceOptions,
  AgentContract,
  AgentDescription,
  AgentWiringRecord,
  AgentLogEntry,
  ComponentMap,
} from './agent'
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
export type { XinStyleSheet, XinStyleMap, XinStyleRule } from './css-types'
export { Color } from './color'
export { Component, tosiSlot, xinSlot, setContractValidator } from './component'
export type { PartsOf } from './component'
export {
  validateAgainstConstraints,
  type FormValidation,
} from './form-validation'
export { elements, svgElements, mathML, bindParts } from './elements'
export type { ElementsProxy } from './elements-types'
export { getCssVar } from './get-css-var'
export { hotReload } from './hot-reload'
export { share } from './share'
export { sync } from './sync'
export type { SyncTransport, SyncMessage, SyncOptions } from './sync'
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
export { makeComponent } from './make-component'
export type {
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
export {
  tosiBlueprint,
  tosiLoader,
  blueprint,
  Blueprint,
  blueprintLoader,
  BlueprintLoader,
} from './blueprint-loader'
export * from './xin-types'
export { tosi, tosiUnique, xinProxy, boxedProxy } from './xin-proxy'
