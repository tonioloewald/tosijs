/*{ "parent": "utilities", "description": "the tosijs entry point — the full library. See `tosijs/core` for the slim entry and `tosijs/state` for the DOM-free state layer." }*/
/**
 * THE FULL LIBRARY = THE BROWSER ENTRY + THE AGENT SURFACE.
 *
 * That relationship is expressed as composition rather than as two lists,
 * because it used to be two lists: this file and `index-browser.ts` each
 * enumerated the non-core exports (blueprints, makeComponent, share, sync,
 * hotReload) with nothing keeping them in step. Add a non-core export and the
 * CDN artifact — the most-loaded thing this project publishes — silently
 * lacks it, and no test would have said so.
 *
 * Composing this way makes the subset relation structural: `index-browser.ts`
 * cannot fall behind, because it is what this file is built from.
 */
export * from './index-browser'

/**
 * The agent surface ships from the main entry so there is exactly ONE runtime
 * copy of the registry: a separately-bundled `tosijs/agent` gave the agent its
 * own registry and it described an empty app (caught by executing the
 * artifact, not by any test). `tosijs/agent` is the same file with a narrower
 * TYPE surface; ESM consumers who never import it tree-shake it away, and the
 * IIFE — which cannot shake — omits it by construction, since it is built from
 * `index-browser.ts`.
 */
export * from './index-agent'
