/*{ "parent": "utilities", "description": "the IIFE/browser entry — the library WITHOUT the agent surface, because a script tag cannot tree-shake." }*/
// The `<script>`/CDN artifact. Identical to `tosijs` minus the agent
// surface (~11 kB gz): a bundler consumer shakes what they don't import,
// but an IIFE consumer pays for every byte, so the opt-in surface must not
// ride along. Need it from a script tag? Load the ES module build instead:
//   import { enableAgentInterface } from 'https://cdn.jsdelivr.net/npm/tosijs/dist/module.js'
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
