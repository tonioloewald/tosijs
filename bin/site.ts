/*
tosijs build entry — wraps the reusable doc-site system from tosijs-ui/site.
Project config lives in tosijs-site.config.ts; the library bundling (esm/cjs/iife
+ tjs-converted debug/safe variants) for the npm package is wired here.

  bun bin/site.ts                  # build, then dev server
  bun bin/site.ts --build          # build and exit (0/1)
*/

import * as path from 'path'
import { $ } from 'bun'
import siteConfig from '../tosijs-site.config'
import { buildSite, devServer } from 'tosijs-ui/site'

declare global {
  var Bun: any
}

const buildOnly = process.argv.includes('--build')
const PROJECT_ROOT = path.resolve(import.meta.dir, '..')
const DIST = path.resolve(PROJECT_ROOT, 'dist')
const PUBLIC = path.resolve(PROJECT_ROOT, siteConfig.outputDir ?? 'docs')
const MINIFY = true

// Bun.build can't resolve a package's own name from its root (cycle), so any
// `import 'tosijs'` from inside tosijs-ui needs to be redirected to our local
// source. This keeps the IIFE single-copy: tosijs-ui and our index-iife.ts
// both end up sharing one tosijs.
const tosijsAlias = {
  name: 'tosijs-self-alias',
  setup(build: any) {
    const target = path.resolve(PROJECT_ROOT, 'src/index.ts')
    build.onResolve({ filter: /^tosijs$/ }, () => ({ path: target }))
  },
}

async function writeVersion() {
  const pkg = JSON.parse(await Bun.file('package.json').text())
  await Bun.write(
    'src/version.ts',
    `export const version = '${pkg.version}'\n`
  )
  console.log('tosijs package version', pkg.version)
}

async function buildLibrary() {
  console.time('library')

  await $`bun test src/`

  const targets = [
    { naming: 'index.js', format: 'iife' as const },
    { naming: 'module.js', format: 'esm' as const },
    { naming: 'main.js', format: 'cjs' as const },
  ]
  for (const { naming, format } of targets) {
    const result = await Bun.build({
      entrypoints: ['./src/index.ts'],
      format,
      outdir: DIST,
      target: 'browser',
      sourcemap: 'linked',
      minify: MINIFY,
      naming,
    })
    if (!result.success) {
      console.error(`library ${naming} build failed`)
      for (const m of result.logs) console.error(m)
      throw new Error('library build failed')
    }
  }

  const TJS_OUT = path.resolve(PROJECT_ROOT, 'tjs-out')
  await $`rm -rf ${TJS_OUT}`
  await $`mkdir -p ${TJS_OUT}`
  await $`bun tjs convert src/ -o ${TJS_OUT}/`
  await $`bun tjs convert src/index-debug.ts -o ${TJS_OUT}/index-debug.js`
  await $`bun tjs convert src/index-safe.ts -o ${TJS_OUT}/index-safe.js`

  const tjsTargets = [
    { entry: './tjs-out/index-debug.js', naming: 'module.debug.js' },
    { entry: './tjs-out/index-safe.js', naming: 'module.safe.js' },
  ]
  for (const { entry, naming } of tjsTargets) {
    const result = await Bun.build({
      entrypoints: [entry],
      format: 'esm',
      outdir: DIST,
      target: 'browser',
      sourcemap: 'linked',
      minify: MINIFY,
      naming,
    })
    if (!result.success) {
      console.error(`tjs ${naming} build failed`)
      for (const m of result.logs) console.error(m)
      throw new Error('tjs variant build failed')
    }
  }

  // Strip the per-file tsc-emitted .js (kept only so generate-css could
  // resolve `tosijs` mid-buildSite) — the published library is only the
  // five bundled outputs above. .d.ts files are kept.
  const keepJs = new Set([
    'index.js',
    'module.js',
    'main.js',
    'module.debug.js',
    'module.safe.js',
  ])
  const fs = await import('fs/promises')
  for (const name of await fs.readdir(DIST)) {
    if (name.endsWith('.js') && !keepJs.has(name)) {
      await fs.unlink(path.join(DIST, name))
    } else if (name.endsWith('.js.map')) {
      const base = name.replace(/\.map$/, '')
      if (!keepJs.has(base)) await fs.unlink(path.join(DIST, name))
    }
  }

  console.timeEnd('library')
}

async function buildDocsBundle() {
  console.time('docs iife')
  const result = await Bun.build({
    entrypoints: ['./src/index-iife.ts'],
    outdir: PUBLIC,
    target: 'browser',
    sourcemap: 'linked',
    format: 'iife',
    minify: MINIFY,
    naming: 'iife.js',
    plugins: [tosijsAlias],
  })
  if (!result.success) {
    console.error('docs iife bundle failed')
    for (const m of result.logs) console.error(m)
    throw new Error('docs iife bundle failed')
  }
  console.timeEnd('docs iife')
}

const config = {
  ...siteConfig,
  prebuild: async () => {
    await writeVersion()
  },
}

// The dev-server watcher re-runs this on every change. buildSite() starts with
// `rm -rf docs`, which deletes the separately-built docs/iife.js — so the watch
// rebuild must regenerate it, or the page's /iife.js 404s into the SPA fallback
// ("loads as html"). buildLibrary() (tests + tjs variants) is only needed for
// publishing, so the watch build skips it for speed.
const rebuild = async () => {
  if (!(await buildSite(config))) throw new Error('site build failed')
  await buildDocsBundle()
}

const ok = await buildSite(config)
if (!ok) process.exit(1)

await buildLibrary()
await buildDocsBundle()

if (buildOnly) process.exit(0)

await devServer(config, { build: rebuild })
