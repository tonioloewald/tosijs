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
  await Bun.write('src/version.ts', `export const version = '${pkg.version}'\n`)
  console.log('tosijs package version', pkg.version)
}

async function vendorSchematic() {
  // tosijs-floorplan (devDependency; formerly tosijs-schematic — renamed
  // away from the tosijs-schema near-collision) is the SOURCE OF TRUTH for
  // the schematic renderer; tosijs inlines its dependency-free core at
  // build time — batteries included, zero runtime deps, no divergence.
  // tosijs's own doc-system header (the /*{...}*/ and /*# ... */ blocks)
  // is preserved from the current file; everything below it regenerates.
  const upstreamPkg = JSON.parse(
    await Bun.file('node_modules/tosijs-floorplan/package.json').text()
  )
  const upstream = await Bun.file(
    'node_modules/tosijs-floorplan/src/index.ts'
  ).text()
  const current = await Bun.file('src/schematic.ts').text()
  const headerStart = current.indexOf('/*#')
  const headerEnd = current.indexOf('*/', headerStart) + 2
  if (headerStart < 0 || headerEnd < 2) {
    throw new Error('vendorSchematic: src/schematic.ts doc header not found')
  }
  const header = current.slice(0, headerEnd + 1)
  const banner =
    `\n// VENDORED from ${upstreamPkg.name}@${upstreamPkg.version} — the upstream package\n` +
    '// is the source of truth. DO NOT EDIT below this line: edit\n' +
    `// ${upstreamPkg.name} and rebuild (this section regenerates at build time).\n` +
    '// tosijs stays ZERO runtime dependencies — the core is inlined, not imported.\n\n'
  const generated = header + banner + upstream
  if (generated === current) return
  if (!buildOnly) {
    // `bun start` must not rewrite a TRACKED SOURCE FILE under the
    // developer — that dirties the tree on every dev-server start and makes
    // two contributors' checkouts differ from the same commit. Report and
    // continue; a real build regenerates it.
    console.warn(
      `src/schematic.ts is out of date with tosijs-floorplan@${upstreamPkg.version}. ` +
        'Run `bun run build` to regenerate it (the dev server will not ' +
        'rewrite tracked sources).'
    )
    return
  }
  await Bun.write('src/schematic.ts', generated)
  console.log('vendored tosijs-floorplan', upstreamPkg.version)
}

async function buildCli() {
  // the scaffolder: `bunx tosijs create …` / `npx tosijs create …` —
  // node-target build (npx runs node), shebang + exec bit stamped here
  await Bun.build({
    entrypoints: ['./bin/cli.ts'],
    format: 'esm',
    target: 'node',
    outdir: DIST,
    naming: 'cli.mjs',
  })
  const cliPath = `${DIST}/cli.mjs`
  const built = await Bun.file(cliPath).text()
  if (!built.startsWith('#!')) {
    await Bun.write(cliPath, '#!/usr/bin/env node\n' + built)
  }
  const { chmodSync } = await import('node:fs')
  chmodSync(cliPath, 0o755)
}

async function buildLibrary() {
  console.time('library')

  await $`bun test src/`

  await buildCli()

  const targets = [
    // the IIFE cannot tree-shake, so it gets the slim entry (no agent
    // surface); ESM/CJS carry everything and consumers shake what they skip
    {
      naming: 'index.js',
      format: 'iife' as const,
      entry: './src/index-browser.ts',
    },
    { naming: 'module.js', format: 'esm' as const, entry: './src/index.ts' },
    { naming: 'main.js', format: 'cjs' as const, entry: './src/index.ts' },
  ]
  for (const { naming, format, entry } of targets) {
    const result = await Bun.build({
      entrypoints: [entry],
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
  // the alternate entries: tosijs/core (slim — no blueprint machinery, no
  // share/sync/hotReload) and tosijs/state (DOM-free state layer, tosijs#18)
  for (const { entry, naming } of [
    { entry: './src/index-core.ts', naming: 'core.js' },
    { entry: './src/index-state.ts', naming: 'state.js' },
  ]) {
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
      console.error(`${naming} build failed`)
      for (const m of result.logs) console.error(m)
      throw new Error('alternate entry build failed')
    }
  }

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
    'core.js',
    'state.js',
    // (cli.mjs isn't matched by the *.js strip below — .mjs so node runs
    // it as ESM without a package-level "type": "module", which would
    // break main.js's CJS consumers)
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

  // SMOKE-IMPORT EVERY PUBLISHED BUNDLE. A sideEffects array once produced
  // bundles that exported names whose definitions had been shaken away
  // ("H6 is not declared") — green tests, green tsc, green lint, broken
  // package. Only executing the artifact catches that class of defect.
  // module.debug/module.safe are PUBLISHED entry points (tosijs/debug,
  // tosijs/safe) and were absent from this loop and from the size budgets —
  // the two bundles built by the least-trusted toolchain (tjs convert) were
  // the two nobody executed before publishing (1.8.0 security pass, SEC-15).
  for (const bundle of [
    'module.js',
    'core.js',
    'state.js',
    'index.js',
    'module.debug.js',
    'module.safe.js',
  ]) {
    const probe = Bun.spawnSync(
      [
        'bun',
        '-e',
        `const { Window } = await import('happy-dom')
         const w = new Window()
         globalThis.window = w
         for (const k of Object.getOwnPropertyNames(w)) {
           if (globalThis[k] === undefined) {
             try { globalThis[k] = w[k] } catch {}
           }
         }
         const m = await import('${DIST}/${bundle}')
         // an IIFE has no ESM exports by design — for it, LOADING without
         // throwing is the whole assertion (that is the failure mode a
         // shaken-away definition produces). Module builds must also have
         // every export defined.
         if ('${bundle}' !== 'index.js') {
           if (Object.keys(m).length === 0) throw new Error('no exports')
           for (const [name, value] of Object.entries(m)) {
             if (value === undefined) throw new Error(name + ' is undefined')
           }
         }`,
      ],
      { stderr: 'pipe', stdout: 'pipe' }
    )
    if (probe.exitCode !== 0) {
      console.error(`smoke import FAILED for dist/${bundle}:`)
      console.error(probe.stderr.toString().slice(0, 800))
      throw new Error(`dist/${bundle} does not import cleanly`)
    }
  }
  console.log(
    'smoke import: module.js, core.js, state.js, index.js, module.debug.js, ' +
      'module.safe.js all load'
  )

  // THE DOM-FREE GATE (tosijs#18). The smoke probe above injects happy-dom
  // globals before importing, so a top-level `document.` anywhere reachable
  // from index-state.ts would sail through it — and through `bun test`,
  // which runs under happy-dom too. Only a BARE node process can prove the
  // claim, and it has to run after state.js exists.
  const domFree = Bun.spawnSync(
    [
      'node',
      '--input-type=module',
      '-e',
      `import { tosi, observe, updates, xin } from '${DIST}/state.js'
       const { buildGate } = tosi({ buildGate: { n: 0 } })
       await updates()
       const seen = []
       observe('buildGate.n', (p) => seen.push(p))
       buildGate.n = 42
       await updates()
       if (seen[0] !== 'buildGate.n' || xin['buildGate.n'] !== 42) process.exit(2)`,
    ],
    { stderr: 'pipe', stdout: 'pipe' }
  )
  if (domFree.exitCode !== 0) {
    console.error('tosijs/state is NOT DOM-free (tosijs#18):')
    console.error(domFree.stderr.toString().slice(0, 800))
    throw new Error('dist/state.js requires a DOM')
  }
  console.log('dom-free gate: tosijs/state imports and runs under bare node')

  // SIZE BUDGETS, where the artifacts exist. The suite's copy can't run
  // during a build (buildSite wipes dist before the tests), so a regression
  // would ship green and only trip on the next developer's local run.
  const { gzipSync } = await import('node:zlib')
  // Budgets are a DECISION, not a measurement: ~1 kB of headroom, so
  // ordinary work fits and the next feature has to be argued for. Raised
  // deliberately in the round-2 review commit (restored public API for
  // compat, the manifest/password/teardown fixes, and the path helpers that
  // make tosijs/state a true subset) — the gate caught it on its first run,
  // which is the gate working.
  // RAISED DELIBERATELY for the 1.8.0 security pass (+~1.7 kB on module.js):
  // the path-segment guard at the setByPath sink, path-level secret
  // redaction, the write/read posture split, arrow neutralization, escaped
  // id lookups, contract-validator locking and the WebMCP revocation
  // bookkeeping — plus the doc-block prose that explains them. The gate
  // caught it on the first run after the fixes, which is the gate working.
  const budgets: Record<string, number> = {
    'index.js': 29_000, // the <script>/CDN artifact — no tree-shaking
    'module.js': 42_000, // everything; ESM consumers shake it
    'main.js': 42_500, // CJS — also cannot shake
    'core.js': 26_500,
    'state.js': 17_500,
    // the tjs-built EXPERIMENTAL entries (tosijs/debug, tosijs/safe). They
    // ship complete per-function __tjs metadata, hence the ~12 kB over
    // module.js — that overhead is the POINT, so the budget is generous;
    // it exists to catch it doubling, not to hold it down. They were
    // published with no gate at all before the 1.8.0 security pass.
    'module.debug.js': 56_000,
    'module.safe.js': 56_000,
  }
  const sizes: string[] = []
  for (const [file, budget] of Object.entries(budgets)) {
    const bytes = gzipSync(await Bun.file(`${DIST}/${file}`).bytes()).length
    sizes.push(
      `${file} ${(bytes / 1024).toFixed(1)}k/${(budget / 1024).toFixed(0)}k`
    )
    if (bytes > budget) {
      throw new Error(
        `${file} is ${bytes} gzipped, over its ${budget} budget. Either the ` +
          'growth is worth it (raise the budget deliberately, in the same ' +
          'commit) or it is not.'
      )
    }
  }
  console.log('gzip budgets:', sizes.join(', '))

  // THE PUBLISHED BIN, executed as consumers run it: the bundle, under node.
  // src/cli.test.ts spawns the SOURCE under bun, so a lost shebang, a lost
  // exec bit or a bun-only construct would ship green.
  const cliProbe = Bun.spawnSync(['node', `${DIST}/cli.mjs`, 'version'], {
    stderr: 'pipe',
    stdout: 'pipe',
  })
  if (cliProbe.exitCode !== 0 || !cliProbe.stdout.toString().includes('.')) {
    console.error('dist/cli.mjs does not run under node:')
    console.error(cliProbe.stderr.toString().slice(0, 500))
    throw new Error('the published bin is broken')
  }
  console.log('bin gate: node dist/cli.mjs runs')

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
    await vendorSchematic()
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

// --test drives the doc `test` fences through a real browser (haltija) and
// exits on a real pass/fail code — the lane for behaviors happy-dom can't
// observe (composed-event retargeting, real <template> cloning).
const testMode = process.argv.includes('--test')

await devServer(config, { build: rebuild, test: testMode })
