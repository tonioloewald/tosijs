/**
 * Bun plugin: load native `.tjs` sources by transpiling them to JS on import.
 *
 * Used during the tosijs 2.0 incremental port (TS -> native TJS). Preloaded for
 * `bun test` (bunfig.toml) and added to the `Bun.build({ plugins })` call in
 * bin/site.ts for the dist bundles.
 *
 * The transpiled output self-contains its `__tjs` runtime fallback, so no
 * separate runtime install is required here.
 */
import { plugin } from 'bun'
import { basename } from 'path'
import { tjs } from 'tjs-lang/lang'

await plugin({
  name: 'tosijs-tjs-loader',
  setup(build) {
    build.onLoad({ filter: /\.tjs$/ }, async (args) => {
      const source = await Bun.file(args.path).text()
      const result = tjs(source, {
        filename: basename(args.path),
        runTests: false,
      })
      return { contents: result.code, loader: 'js' }
    })
  },
})

export {}
