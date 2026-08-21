/*{ "parent": "utilities", "description": "the IIFE/browser entry — the library WITHOUT the agent surface, because a script tag cannot tree-shake." }*/
// The `<script>`/CDN artifact, and the base `index.ts` composes with the agent
// surface to make the full library — so this file is `tosijs` MINUS the agent
// surface by construction, not by two lists agreeing.
//
// Why the split exists: a bundler consumer shakes what they don't import, but
// an IIFE consumer pays for every byte, so an opt-in surface must not ride
// along. Need the agent surface from a script tag? Load the ES module build:
//   import { enableAgentInterface } from 'https://cdn.jsdelivr.net/npm/tosijs/dist/module.js'
//
// NB anything added here reaches BOTH artifacts. If an export should not be in
// the CDN build, it does not belong in this file — put it in `index.ts`
// alongside the agent surface.
export * from './index-core-exports'
export {
  tosiBlueprint,
  tosiLoader,
  Blueprint,
  BlueprintLoader,
  blueprint,
  blueprintLoader,
} from './blueprint-loader'
export { makeComponent } from './make-component'
export { share } from './share'
export { sync } from './sync'
export type { SyncTransport, SyncMessage, SyncOptions } from './sync'
export { hotReload } from './hot-reload'
