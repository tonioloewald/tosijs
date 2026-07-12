/**
 * Bun plugin: load native `.tjs` sources by transpiling them to JS on import.
 *
 * Used during the tosijs 2.0 incremental port (TS -> native TJS). Three consumers,
 * two shapes:
 *
 *   - `tjsPlugin` (named export) is passed to `Bun.build({ plugins })` in bin/site.ts
 *     for the dist bundles.
 *   - Importing this module *registers the loader globally* as a side effect. That is
 *     what `bunfig.toml`'s test preload relies on, and what `generateCssPreload` in the
 *     site config relies on — buildSite's CSS-extraction step evaluates the emitted
 *     `dist/*.js`, which carry `import './x.tjs'` specifiers, in a subprocess that
 *     would otherwise have no way to load them.
 *
 * Bun's *runtime* loader does not invoke plugin `onResolve` for relative specifiers
 * (it does in `Bun.build`), so `.tjs` imports must be written with the extension.
 *
 * The transpiled output self-contains its `__tjs` runtime fallback, so no separate
 * runtime install is required here.
 */
import { plugin } from 'bun'
import { basename } from 'path'
import { tjs } from 'tjs-lang/lang'

export const tjsPlugin = {
  name: 'tosijs-tjs-loader',
  setup(build: any) {
    build.onLoad({ filter: /\.tjs$/ }, async (args: any) => {
      const source = await Bun.file(args.path).text()
      const result = tjs(source, {
        filename: basename(args.path),
        runTests: false,
      })
      return { contents: result.code, loader: 'js' }
    })
  },
}

await plugin(tjsPlugin)
