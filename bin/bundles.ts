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
 * BUDGETS RAISED 2026-09-02, deliberately, in the commit that caused the
 * growth — the gate's own instruction. Every bundle grew 215–610 gz bytes
 * fixing the 1.8.3 pre-release review, and THREE were within 100 bytes of
 * their ceiling (index.js was 35 OVER). Raised to the ~1 kB headroom this file
 * already specifies, rather than nudged past the measurement: a gate that
 * passes by a hair fails next week on something unrelated and teaches whoever
 * hits it to raise the number without reading it. (1.8.1 shipped one that
 * passed by SEVEN bytes; that is the mistake not being repeated.)
 *
 * What the bytes bought:
 *   M1  `bind` accumulates instead of clobbering — a container can be
 *       list-bound AND carry its own binding. Was silent data loss: one order
 *       dropped the caller's binding, the other destroyed the entire list.
 *   M2  create() stops emitting a deprecated key for `div(proxy)`, the most
 *       idiomatic call form in the library.
 *   M3  deprecation messages became whole sentences, because two of them told
 *       users to write props keys that do not exist and one shipped a
 *       permanently disabled button.
 *   B1  describe() redacts secrets by PATH (agent-carrying bundles only —
 *       index.js and core.js omit the agent surface, state.js is DOM-free).
 */
export const BUNDLES: BundleSpec[] = [
  {
    naming: 'index.js',
    format: 'iife',
    // the IIFE cannot tree-shake, so it gets the slim entry (no agent
    // surface); ESM/CJS carry everything and consumers shake what they skip
    entry: './src/index-browser.ts',
    budget: 30_000,
    probe: 'load',
    stage: 'main',
  },
  {
    naming: 'module.js',
    format: 'esm',
    entry: './src/index.ts',
    budget: 43_000,
    probe: 'import',
    stage: 'main',
  },
  {
    naming: 'main.js',
    format: 'cjs',
    entry: './src/index.ts',
    budget: 43_500,
    probe: 'require',
    stage: 'main',
  },
  // the alternate entries: tosijs/core (slim — no blueprint machinery, no
  // share/sync/hotReload) and tosijs/state (DOM-free state layer, tosijs#18)
  {
    naming: 'core.js',
    format: 'esm',
    entry: './src/index-core.ts',
    budget: 27_500,
    probe: 'import',
    stage: 'alt',
  },
  {
    naming: 'state.js',
    format: 'esm',
    entry: './src/index-state.ts',
    budget: 17_500,
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
    budget: 58_000,
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
    budget: 58_000,
    probe: 'import',
    stage: 'tjs',
    // map excluded from `files` (1.64 MB for inert bundles) — so don't emit
    // one, or the shipped artifact ends with a sourceMappingURL that 404s
    sourcemap: false,
  },
]
