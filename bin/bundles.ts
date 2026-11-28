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
/*
 * ⚠️ THESE ARE BUN-ZLIB FIGURES. The gate runs under Bun, whose `node:zlib`
 * compresses differently from Node's: a byte-identical `dist/index.js` gzips
 * to ~29.0 kB under Bun and ~28.7 kB under Node — a ~1% swing, which is the
 * same order as the headroom the gate polices. So `gzip`, `node -e`, or a
 * bundle-size tool will disagree with these numbers by about a percent, and a
 * reviewer checking them the obvious way can conclude the budgets were raised
 * against a measurement that does not reproduce. Compare like with like.
 */
export type BundleProbe = 'load' | 'import' | 'require'
export type BundleStage = 'main' | 'alt'

export interface BundleSpec {
  /** output filename in dist/ */
  naming: string
  format: 'iife' | 'esm' | 'cjs'
  entry: string
  /** gzipped ceiling in bytes — a DECISION, not a measurement */
  budget: number
  /** how the artifact is EXECUTED by the smoke gate */
  probe: BundleProbe
  /** which entry family it belongs to: the root entry, or a subpath */
  stage: BundleStage
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
    // 30_000 -> 31_000 in 1.10.1. Not because it failed — because the new
    // minimum-headroom gate found it at 735 B, under the 1 kB this file
    // specifies, which is the state that breaks on the NEXT unrelated commit.
    // 31_000 -> 32_500, 2026-10-15: variable-height virtual lists rewritten to
    // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
    // every bundle that carries list binding. Owner approved the raise
    // (2026-10-15: "a price worth paying"), after a trimming pass.
    // 32_500 -> 32_250, 2026-11-27: shortening the advisory messages
    // (#4285) took about 290 gz out of this one. The budget follows the
    // saving down, so it cannot be spent by accident (#4022).
    // 32_250 -> 32_150, 2026-11-27: dead code deleted (#4274), about 100 gz.
    budget: 32_150,
    probe: 'load',
    stage: 'main',
  },
  {
    naming: 'module.js',
    format: 'esm',
    entry: './src/index.ts',
    // 43_000 -> 43_500 in 1.10.0 (set by 9589f89, which was numbered 1.11.0 at
    // the time — that numbering was reverted as version inflation and the work
    // shipped as 1.10.0). ⚠️ AND IT HAPPENED AGAIN: what these comments below
    // called "1.11.0" for twelve review rounds shipped as **1.10.2**, reverted
    // for the same reason — the only thing forcing a minor was four new exports
    // on the agent surface, which has no consumers (verified across eight
    // sibling repos: one match, inside an error-message string). Adding exports
    // cannot break anyone, so the minor signalled a capability to an audience
    // that does not exist. Deliberately. The agent surface's
    // path-or-proxy resolution and its refusal text cost ~100 bytes gzipped
    // over the old ceiling; almost all of it is the error strings, which is
    // the growth we want (the defect being fixed was a SILENT coercion). The
    // headroom matches main.js so the two budgets stop drifting apart.
    //
    // 43_500 -> 45_000 in 1.10.1: the element factory now renders values that
    // used to vanish (Date, bigint, boolean, anything with its own toString),
    // accepts a Map as a props bag, and WARNS on an unspread array or a value
    // that is neither — +264 gz. Most of it is the two warning strings, which
    // are the point: they convert three silent no-ops into a named mistake.
    //
    // 45_000 -> 46_000 in 1.10.2, deliberately and in the commit that caused
    // the growth. Re-vendoring tosijs-floorplan 0.4.0 costs +318 gz here
    // (index.js +1 and core.js +0 — neither carries the agent surface, which
    // is where the schematic lives). It bought ONE implementation of
    // isInteractive/target-size shared with the renderer that draws the same
    // map, replacing two copies that had drifted into contradicting each
    // other. The minimum-headroom gate caught this at 754 B — under the 1 kB
    // this file specifies — which is the state that breaks on the next
    // unrelated commit. Restored to the ~1.6 kB slack every other bundle
    // carries rather than shaved to the measurement.
    //
    // ⚠️ NO ABSOLUTE FIGURES IN THIS FILE. Five hand-transcribed sizes here
    // were wrong across three consecutive releases — twice in a correction
    // that was itself fixing a drift, and once claiming a measurement no
    // artifact in the repo reproduced. A number a human retypes is a number
    // that drifts, however good the thing that computed it.
    //
    // `bun run build` prints a "budget ledger" table: bundle, gz, budget,
    // spare. Read that for what anything currently ships at. THIS file records
    // only DECISIONS — which way a budget moved, and why — because those do
    // not go stale.
    //
    // That this lands on the same number as main.js is a coincidence, not a
    // copy: main.js needed no change at that round. See the warning below.
    //
    // 46_000 -> 47_000 in 1.10.2 round 12, deliberately and in the commit that
    // caused the growth. The secrecy/audit remediations (the `textWithheld`
    // decision field, the per-rule audit gating, three new guards) landed the
    // bundle under the 1 kB minimum this file specifies — caught by the
    // headroom gate, off the budget ledger, not by a failing build. Restored
    // to the ~2 kB slack every other shipped bundle carries.
    //
    // 47_000 -> 48_000, 2026-10-01: agent.settled() and a stable key per describe() record (tosijs#47/#48,
    // asked by haltija) cost ~750 gz here, on the opt-in agent surface. ESM
    // consumers who do not import it pay nothing (NO_AGENT_CONSUMER below
    // measures and gates exactly that); CJS cannot shake, so main.js carries
    // it. The headroom gate caught both under the 1 kB floor; owner approved
    // the raise (2026-10-01) on condition the no-agent figure is measured.
    // 48_000 -> 49_500, 2026-10-15: variable-height virtual lists rewritten to
    // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
    // every bundle that carries list binding. Owner approved the raise
    // (2026-10-15: "a price worth paying"), after a trimming pass.
    // 49_500 -> 50_500, 2026-10-27: tosijs-floorplan 0.6.0 re-vendored (#2804,
    // ~+315 gz on the agent surface, which CJS cannot shake) plus the <head>
    // load fix (#3511, ~+25) left main.js at 996 B spare, under the 1 kB floor.
    // Owner approved the raise (2026-10-27).
    // 50_500 -> 51_500, 2026-11-11: the 1.10.11 review's security fixes
    // (declarative binding: script/style refusal, exact actions, SEC-9, option
    // checks; the normalised __proto__ guard, #56), ~340 gz, left 831 B.
    // Owner approved the raise (2026-11-11).
    // 51_500 -> 51_250, 2026-11-27: shortening the advisory messages
    // (#4285) took about 310 gz out of this one. The budget follows the
    // saving down, so it cannot be spent by accident (#4022).
    // 51_250 -> 51_150, 2026-11-27: dead code deleted (#4274), about 100 gz.
    // 51_150 -> 52_000, 2026-11-28: the agent surface resolves a path to one
    // canonical spelling before any gate sees it (#4312; closes tosijs#32 and
    // #52), about 670 gz on the two bundles that carry the agent surface.
    // That left this one under the 1 kB floor. Owner approved the raise
    // (2026-11-28).
    budget: 52_000,
    probe: 'import',
    stage: 'main',
  },
  {
    naming: 'main.js',
    format: 'cjs',
    entry: './src/index.ts',
    // 43_500 -> 44_500 -> 46_000. The last step landed in 1.10.1 (b04caf9)
    // and this header was not updated with it, so for a whole release it read
    // `-> 44_500` above a `budget: 46_000` — 1.5 kB wrong, in the file whose
    // whole thesis is "a budget is a DECISION, read the comment before you
    // raise it." A pre-release review caught it.
    // THE TWO CEILINGS ARE DELIBERATELY NOT EQUAL: the CJS
    // artifact runs ~290 gz bytes over the ESM one (271 B at v1.9.2, 287 B
    // now), so copying module.js's number here — which is what the previous
    // comment reasoned itself into — cannot give equal headroom, and left
    // main.js with SEVENTEEN bytes. That is the hair-trigger this file
    // forbids twice: the next ~20 bytes anywhere in the library would have
    // broken `bun start` for every developer (the budget loop is not gated
    // on `full`), and the fix a stranger reaches for is raising the number
    // without reading it. Budget per bundle from its own measurement.
    // 46_000 -> 47_000 in 1.10.2, deliberately and in the commit that caused
    // the growth. Adopting tosijs-floorplan 0.5.0 costs a few hundred gz bytes
    // here, NET of deleting `auditView` — the upstream fixes cost more than the
    // local workaround saved, which is the right trade because the workaround
    // was a second opinion about what evidence means. The headroom gate caught
    // the result under the 1 kB this file specifies, so the ceiling moved
    // rather than the bundle shipping on a hair trigger.
    //
    // Sizes deliberately not quoted — `bun run build`'s budget ledger has them.
    //
    // 47_000 -> 48_000, 2026-10-01: agent.settled() and a stable key per describe() record (tosijs#47/#48,
    // asked by haltija) cost ~750 gz here, on the opt-in agent surface. ESM
    // consumers who do not import it pay nothing (NO_AGENT_CONSUMER below
    // measures and gates exactly that); CJS cannot shake, so main.js carries
    // it. The headroom gate caught both under the 1 kB floor; owner approved
    // the raise (2026-10-01) on condition the no-agent figure is measured.
    // 48_000 -> 49_500, 2026-10-15: variable-height virtual lists rewritten to
    // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
    // every bundle that carries list binding. Owner approved the raise
    // (2026-10-15: "a price worth paying"), after a trimming pass.
    // 49_500 -> 50_500, 2026-10-27: tosijs-floorplan 0.6.0 re-vendored (#2804,
    // ~+315 gz on the agent surface, which CJS cannot shake) plus the <head>
    // load fix (#3511, ~+25) left main.js at 996 B spare, under the 1 kB floor.
    // Owner approved the raise (2026-10-27).
    // 50_500 -> 51_500, 2026-11-11: the WebMCP promise handling for Chrome
    // (GitHub #57, on the agent surface, which CJS cannot shake) plus the
    // __proto__ guard (#56) and share()'s tab id (#3985), ~+190 gz together,
    // left main.js at 894 B spare. Owner approved the raise (2026-11-11), and
    // asked for a periodic slimming pass instead of offsetting each raise.
    // 51_500 -> 51_250, 2026-11-27: shortening the advisory messages
    // (#4285) took about 310 gz out of this one. The budget follows the
    // saving down, so it cannot be spent by accident (#4022).
    // 51_250 -> 51_150, 2026-11-27: dead code deleted (#4274), about 100 gz.
    // 51_150 -> 52_000, 2026-11-28: the agent surface resolves a path to one
    // canonical spelling before any gate sees it (#4312; closes tosijs#32 and
    // #52), about 670 gz on the two bundles that carry the agent surface.
    // That left this one under the 1 kB floor. Owner approved the raise
    // (2026-11-28).
    budget: 52_000,
    probe: 'require',
    stage: 'main',
  },
  // the alternate entries: tosijs/core (slim — no blueprint machinery, no
  // share/sync/hotReload) and tosijs/state (DOM-free state layer, tosijs#18)
  {
    naming: 'core.js',
    format: 'esm',
    entry: './src/index-core.ts',
    // 27_500 -> 28_500, same reason: 834 B of headroom, found by the gate
    // rather than by a failing build.
    // 28_500 -> 30_000, 2026-10-15: variable-height virtual lists rewritten to
    // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
    // every bundle that carries list binding. Owner approved the raise
    // (2026-10-15: "a price worth paying"), after a trimming pass.
    // 30_000 -> 29_750, 2026-11-27: shortening the advisory messages
    // (#4285) took about 300 gz out of this one. The budget follows the
    // saving down, so it cannot be spent by accident (#4022).
    // 29_750 -> 29_650, 2026-11-27: dead code deleted (#4274), about 100 gz.
    budget: 29_650,
    probe: 'import',
    stage: 'alt',
  },
  {
    naming: 'state.js',
    format: 'esm',
    entry: './src/index-state.ts',
    // 17_500 -> 18_500 — the third one the headroom gate surfaced (753 B).
    // 18_500 -> 20_000, 2026-10-15: variable-height virtual lists rewritten to
    // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
    // every bundle that carries list binding. Owner approved the raise
    // (2026-10-15: "a price worth paying"), after a trimming pass.
    budget: 20_000,
    probe: 'import',
    stage: 'alt',
  },
]

/**
 * `tosijs/debug` AND `tosijs/safe` ARE RETIRED (owner, 2026-11-25: "They'd be
 * easy enough to revive if we find a real use case").
 *
 * They were two whole-library bundles built by running `tjs convert` over
 * `src/`. They were experimental and inert (the converter marks every function
 * converted from TypeScript `unsafe`, so no runtime type check ever fired),
 * nothing in the ecosystem imported them, they were 0.52 MB of a 2.85 MB
 * package, and the convert step printed thirteen spurious failures into every
 * build log.
 *
 * Both subpaths still RESOLVE in 1.x, because `DECISIONS.md` says breaking
 * changes wait for 2.0: `package.json` points them at RETIRED_ENTRY, which the
 * build writes from RETIRED_SOURCE. It warns once and re-exports
 * `./module.js`, the SAME module instance, so an app that imports both
 * `tosijs` and `tosijs/debug` now has one state registry where it had two.
 * Delete the subpaths, the entry and this block in 2.0.
 *
 * To revive: the specs, the `tjs` build stage and the entry modules
 * (`src/index-debug.ts`, `src/configure-tjs*.ts`) are in git at v1.10.13.
 */
export const RETIRED_ENTRY = 'retired.js'
export const RETIRED_SUBPATHS = ['./debug', './safe']
export const RETIRED_SOURCE = `console.warn(
  'tosijs: "tosijs/debug" and "tosijs/safe" are retired. They were experimental ' +
    'and performed no runtime checks, so this is the ordinary library: import ' +
    '"tosijs" instead. These subpaths are removed in 2.0.'
)
export * from './module.js'
`

/**
 * What a consumer pays who imports everything EXCEPT the agent surface from
 * the shipped `dist/module.js` and lets their bundler tree-shake (measured by
 * `bin/site.ts`, which also fails the build if any agent code survives).
 * This is the number the "opt-in, shakes away if unimported" promise is about,
 * so it gets its own ceiling rather than hiding inside module.js's.
 */
export const NO_AGENT_CONSUMER = {
  // 31_000 when introduced (2026-10-01, with agent.settled() and record keys):
  // set from the first measurement plus the ~1.5 kB slack the shipped bundles
  // carry. See the budget ledger for the current figure.
  // 31_000 -> 32_500, 2026-10-15: variable-height virtual lists rewritten to
  // anchor rows and track the scroll 1:1 (#3302, #3230) cost over a kilobyte gz in
  // every bundle that carries list binding. Owner approved the raise
  // (2026-10-15: "a price worth paying"), after a trimming pass.
  // 32_500 -> 32_250, 2026-11-27: shortening the advisory messages
  // (#4285) took about 290 gz out of this one. The budget follows the
  // saving down, so it cannot be spent by accident (#4022).
  // 32_250 -> 32_150, 2026-11-27: dead code deleted (#4274), about 100 gz.
  budget: 32_150,
}

/**
 * A FINGERPRINT OF EVERYTHING THAT DETERMINES `dist/`.
 *
 * `prepublishOnly` could prove the artifacts EXIST and are TRACKED, and not
 * that they were built from the source being published. That gap is reachable:
 * a dev run wipes `dist/`, `restoreCommittedDist()` puts the COMMITTED copies
 * back, and those satisfy existence and tracking while being older than the
 * source. `release-doctor` catches it — but release-doctor is not run by
 * `npm publish`, so the only freshness check was one a human had to remember,
 * which is exactly the kind this repo has already been bitten by three times.
 *
 * Defined HERE, in the side-effect-free module both the build and the publish
 * hook already import, so the two cannot compute it differently. That is the
 * failure this file's own header warns about, and the one that produced three
 * review rounds this week.
 */
export async function sourceFingerprint(root = process.cwd()): Promise<string> {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs')
  const { join, relative } = await import('node:path')
  const { createHash } = await import('node:crypto')

  const files: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : 1
    )) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.d.ts')
      ) {
        files.push(full)
      }
    }
  }
  walk(join(root, 'src'))
  // the build inputs that are not in src/: the bundle manifest and the build
  // entry both change what lands in dist/, and the version is stamped into it
  for (const extra of ['bin/bundles.ts', 'bin/site.ts']) {
    const p = join(root, extra)
    if (existsSync(p)) files.push(p)
  }

  const hash = createHash('sha256')
  for (const f of files) {
    hash.update(relative(root, f))
    hash.update(readFileSync(f))
  }
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  hash.update(String(pkg.version))
  return hash.digest('hex')
}

/** where the build records it, and the publish hook reads it */
export const FINGERPRINT_PATH = 'dist/.build-fingerprint'
