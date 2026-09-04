import { test, expect } from 'bun:test'
import { existsSync } from 'node:fs'

/*
 * THE PUBLIC TYPE SURFACE MUST BE IMPORTABLE — CHECKED BY THE COMPILER,
 * AGAINST THE BUILT ARTIFACT.
 *
 * `index-core-exports.ts`, `index-agent.ts` and `index-state.ts` use EXPLICIT
 * export lists rather than `export *`, so a type not named there never reaches
 * a consumer — and nothing notices, because the library's own code imports
 * from the modules directly and compiles fine.
 *
 * That has cost us twice. Twenty-two `Xin*` aliases sat unreachable for four
 * releases, some of them named in the docs. Then 1.10.0 shipped
 * `AgentPathRef` / `AgentObserveRef` — the declared parameter type of every
 * agent verb — plus `ComponentClass`, the declared type of two public
 * blueprint fields the CHANGELOG points authors at, with none of them
 * exported: you could read a name in a signature and be unable to write it.
 *
 * Two design notes, both learned the hard way while writing this:
 *
 * 1. It runs `tsc` over the BUILT `.d.ts`, because that is what a consumer
 *    resolves. Our own source compiling proves nothing about the export list.
 * 2. It does NOT parse `.d.ts` with regexes. The first version did, scored
 *    `dist/index.d.ts` — a 24-line re-export stub — found almost nothing on
 *    either side of the comparison, and passed. It still passed after
 *    `AgentPathRef` was deliberately deleted from the export lists. A gate
 *    that cannot fail is worse than no gate, because it reports safety.
 */
test.skipIf(!existsSync('dist/index.d.ts'))(
  'every type the public API names can be imported from the built package',
  async () => {
    // The list is EXPLICIT on purpose — deriving it from the same export
    // lists it is checking would be circular. It is the set a consumer is
    // told to use: anything named in a public signature, in the docs, or in
    // Migration.md. Adding a public type means adding a line here.
    const PUBLIC_TYPES = [
      // component authoring
      'ComponentAttrs',
      'DeclaredAttributes',
      'WithAttributes',
      'ComponentClass',
      'PartsOf',
      'ComponentMap',
      'ComponentTestStep',
      // agent surface
      'AgentInterface',
      'AgentInterfaceOptions',
      'AgentExpose',
      'AgentDescription',
      'AgentWiringRecord',
      'AgentPathRef',
      'AgentObserveRef',
      'AgentRefusalKind',
      'AgentRefusalError',
      // blueprints
      'TosiBlueprint',
      'TosiComponentSpec',
      'TosiPackagedComponent',
      // state + binding
      'BoxedProxy',
      'BoxedScalar',
      'TosiBinding',
      'TosiObject',
      'ElementProps',
    ]
    // a floor, so the list cannot be silently emptied and keep passing
    expect(PUBLIC_TYPES.length).toBeGreaterThan(20)

    // THE IMPORT IS THE WHOLE CHECK. `import type { Missing }` is a TS2305
    // whether or not the name is used, and trying to *use* each one instead
    // was a mistake: half of these are generic, so `ComponentAttrs extends
    // never` is an arity error (TS2314) and the probe failed on types that
    // were perfectly reachable.
    const probe =
      `import type {\n${PUBLIC_TYPES.join(',\n')}\n} from ` +
      `'${process.cwd()}/dist/index'\nexport {}\n`
    const probePath = `${process.cwd()}/dist/.type-surface-probe.ts`
    await Bun.write(probePath, probe)

    const result = Bun.spawnSync(
      [
        'npx',
        'tsc',
        '--noEmit',
        '--strict',
        '--target',
        'es2022',
        '--module',
        'esnext',
        '--moduleResolution',
        'bundler',
        '--skipLibCheck',
        probePath,
      ],
      { stdout: 'pipe', stderr: 'pipe' }
    )
    const output = result.stdout.toString() + result.stderr.toString()
    await Bun.file(probePath)
      .unlink?.()
      .catch(() => {})

    // TS2305 is "module has no exported member X" — the failure this exists
    // for. Report the NAMES, so the message says what to add where.
    const missing = [
      ...output.matchAll(/no exported member (?:named )?'(\w+)'/g),
    ]
      .map((m) => m[1])
      .sort()
    expect({ missing, exitCode: result.exitCode }).toEqual({
      missing: [],
      exitCode: 0,
    })
  },
  60_000
)
