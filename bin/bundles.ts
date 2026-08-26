/**
 * THE PUBLISHED ARTIFACTS, DECLARED ONCE — and in a module with NO SIDE
 * EFFECTS, so it can be imported by the build, by tests, and by any future
 * tooling without running a build or starting a dev server.
 *
 * (`bin/site.ts` executes on import — it starts the dev server — so anything
 * that needs to *reason* about the artifacts cannot import it. That is why
 * `entries.test.ts` used to assert on the build script's SOURCE TEXT, which
 * passed happily if the budget loop were deleted and only the log strings
 * survived.)
 */
export type BundleProbe = 'load' | 'import' | 'require'
export type BundleStage = 'main' | 'alt' | 'tjs'

export interface BundleSpec {
  /** output filename in dist/ */
  naming: string
  format: 'iife' | 'esm' | 'cjs'
  entry: string
  /** gzipped ceiling in bytes — a DECISION, not a measurement */
  budget: number
  /** how the artifact is EXECUTED by the smoke gate */
  probe: BundleProbe
  /** build ordering: tjs entries need `tjs convert` to have run first */
  stage: BundleStage
  /**
   * Emit a source map? Default true.
   *
   * `false` for a bundle whose map is excluded from `files`: building the map
   * and then not shipping it leaves a `//# sourceMappingURL=` pointing at a
   * 404 in the published artifact, which is worse than having no map — a
   * devtools that finds the comment goes looking. The two are one decision and
   * belong in one place.
   */
  sourcemap?: boolean
}

/*
 * ⚠️ BUDGETS ON THIS BRANCH ARE RAISED ~1.5 kB ACROSS THE BOARD. DO NOT PORT
 * THE NUMBERS TO MAIN — port the measurement.
 *
 * This is the cost of the FIRST native `.tjs` module in the graph. `more-math`
 * is two functions, `clamp` and `lerp`, twelve lines of arithmetic. It cost:
 *
 *     index.js  +995    module.js  +1037   main.js  +986   core.js  +976
 *     state.js  +1064   debug      +1033   safe     +1043      (gzipped)
 *
 * Uniform, because it is an ENTRY FEE, not per-module weight: every bundle
 * carries its own copy of the self-contained `__tjs` runtime. Measured
 * directly — a bundle with one `.tjs` module is 1_364 gz, with two it is
 * 1_718, so an equivalent second module adds ~354. And `tjs emit --unsafe`
 * (which strips the `__tjs` metadata) saves only 181 raw bytes, so the weight
 * is the runtime and the type guards, NOT the introspection data.
 *
 * Read that as: ~1 kB to open the door, ~350 per room. The port gets cheaper
 * per module the further it goes, which is the opposite of the intuition that
 * says convert one file and see. Converting ONE file is the worst ratio you
 * will ever measure.
 *
 * index.js is the artifact to watch: it is the CDN IIFE, it cannot tree-shake
 * (which is why it already omits the agent surface), and it had ~200 bytes of
 * headroom before this. If the port lands, that entry point may have to opt
 * out — and that is a finding, not a budget problem.
 */
export const BUNDLES: BundleSpec[] = [
  {
    naming: 'index.js',
    format: 'iife',
    // the IIFE cannot tree-shake, so it gets the slim entry (no agent
    // surface); ESM/CJS carry everything and consumers shake what they skip
    entry: './src/index-browser.ts',
    budget: 31_000,
    probe: 'load',
    stage: 'main',
  },
  {
    naming: 'module.js',
    format: 'esm',
    entry: './src/index.ts',
    budget: 44_000,
    probe: 'import',
    stage: 'main',
  },
  {
    naming: 'main.js',
    format: 'cjs',
    entry: './src/index.ts',
    budget: 44_500,
    probe: 'require',
    stage: 'main',
  },
  // the alternate entries: tosijs/core (slim — no blueprint machinery, no
  // share/sync/hotReload) and tosijs/state (DOM-free state layer, tosijs#18)
  {
    naming: 'core.js',
    format: 'esm',
    entry: './src/index-core.ts',
    budget: 28_500,
    probe: 'import',
    stage: 'alt',
  },
  {
    naming: 'state.js',
    format: 'esm',
    entry: './src/index-state.ts',
    budget: 18_500,
    probe: 'import',
    stage: 'alt',
  },
  // EXPERIMENTAL tjs-built entries (tosijs/debug, tosijs/safe). They ship
  // complete per-function __tjs metadata, hence the ~12 kB over module.js —
  // that overhead is the POINT, so the budget is generous; it exists to
  // catch it doubling. They were published with no gate at all until the
  // 1.8.0 security pass (SEC-15): the two bundles built by the least-trusted
  // toolchain were the two nobody executed.
  //
  // RAISED 56_000 -> 58_000 on 2026-08-26, deliberately, in the commit that
  // caused the growth. tjs-lang 0.13.6 restores `new` on locally-declared
  // classes (tjs-lang#37) and moves the transform to the graduation step;
  // that put module.debug.js at 55_993 against the old 56_000 — a pass with
  // SEVEN BYTES of headroom, which is a gate that will fail on the next
  // unrelated edit and teach whoever hits it to raise the number without
  // reading. The growth buys output that does not throw on import, so it is
  // worth it. Unlike the shipped-to-consumers bundles, these two are
  // EXPERIMENTAL and inert, so the number polices toolchain regressions, not
  // a promise to anyone: ~2 kB of room is the right slack for that job.
  {
    naming: 'module.debug.js',
    format: 'esm',
    entry: './tjs-out/index-debug.js',
    budget: 59_000,
    probe: 'import',
    stage: 'tjs',
    // map excluded from `files` (1.64 MB for inert bundles) — so don't emit
    // one, or the shipped artifact ends with a sourceMappingURL that 404s
    sourcemap: false,
  },
  {
    naming: 'module.safe.js',
    format: 'esm',
    entry: './tjs-out/index-safe.js',
    budget: 59_000,
    probe: 'import',
    stage: 'tjs',
    // map excluded from `files` (1.64 MB for inert bundles) — so don't emit
    // one, or the shipped artifact ends with a sourceMappingURL that 404s
    sourcemap: false,
  },
]
