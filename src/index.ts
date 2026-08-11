/*{ "parent": "utilities", "description": "the tosijs entry point — the full library. See `tosijs/core` for the slim entry and `tosijs/state` for the DOM-free state layer." }*/
export * from './index-core-exports'

// --- in `tosijs`, NOT in `tosijs/core` (see index-core.ts for the why) ---

// blueprint machinery: registers custom elements at import, because
// blueprints hydrate from MARKUP — no import statement protects them, so a
// shaken registration would fail silently
export {
  tosiBlueprint,
  tosiLoader,
  Blueprint,
  BlueprintLoader,
} from './blueprint-loader'
export { makeComponent } from './make-component'

// multi-window and dev-time leaves: pure and shakeable, included by default
export { share } from './share'
export { sync } from './sync'
export type { SyncTransport, SyncMessage, SyncOptions } from './sync'
export { hotReload } from './hot-reload'
