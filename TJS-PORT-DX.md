# TJS Port — Developer Experience Findings

A living log of what it's actually like to port tosijs from TypeScript to native
TJS (the tosijs 2.0 effort). Updated per module. Two audiences: the tosijs port
itself (patterns to follow) and `../tjs-lang` (feedback to fix).

## Takeaway so far

**Performance is fine and the size regression is perfectly tolerable.** With the
right mode selection, native `.tjs` matches TS on both runtime and size for hot
code; the ergonomic modes cost a little where you opt into them, which is exactly
where you don't put hot paths. Nothing here blocks the port.

## Two independent axes (learn this first)

TJS has two orthogonal knobs, and conflating them wasted time early on:

1. **`safety` level** — `safety none | inputs | all`. Controls *runtime input
   validation*. `none` = no checks (hot internals); `inputs` = validate at the
   public boundary; `all` = validate everywhere.
2. **`Tjs*` modes** — `TjsEquals`, `TjsClass`, `TjsDate`, `TjsStandard`, … Control
   *JS semantic transforms*. Native dialect turns them **all on** by default;
   `TjsCompat` turns them all off; individual directives turn one on. There is no
   "turn one off" — compose from `TjsCompat` upward.

`safety none` does **not** remove the mode transforms. They're separate. The size
and per-conditional overhead come from the *modes*, not from safety.

### Mode selection policy for the port

- **Hot internal modules** (path parsing, touch queue, DOM updates, proxy traps):
  `safety none` + `TjsCompat`. Compiles to plain JS → TS-parity speed and size.
- **Boundary / proxy modules** that want the ergonomics (`==` via `Eq`, new-less
  classes): start from `TjsCompat` and re-enable just what you need
  (`TjsCompat` then `TjsEquals`), accepting the small tax where the path isn't hot.

## Toolchain that works

- `src/bun-plugin/tjs-plugin.ts` — a ~15-line Bun `onLoad` plugin that transpiles
  `.tjs` via `tjs-lang/lang`'s `tjs()`. Preloaded in `bunfig.toml` for `bun test`.
- Transpiled `.tjs` output self-contains its `__tjs` runtime fallback
  (`globalThis.__tjs?.createRuntime?.() ?? {Eq,NotEq,…}`), so no separate runtime
  install is needed for imports.
- **Validation pattern:** keep the `.ts` in place, add `foo.tjs`, and a
  `foo-port.test.ts` that runs the original assertions against `./foo.tjs`
  through the plugin. Proves behavior-equivalence before swapping anything.

## Phase-2 blockers for a full swap (not yet solved)

Replacing a `.ts` with a `.tjs` in the shipped build still needs:

1. **`.d.ts` emission** from the `.tjs` so the TS files that import it keep their
   types (by-path has 6 importers). tjs-lang has a dts emitter; not yet wired in.
2. **An `onResolve`** so a bare `import './foo'` picks `foo.tjs` in `Bun.build`
   (Bun doesn't try the `.tjs` extension by default). Until then, imports need the
   explicit `./foo.tjs`, which TS can't type.

Until both exist, ported `.tjs` modules are validated in parallel but the `.ts`
remains the shipped source.

---

## Per-module log

### by-path.ts → by-path.tjs (first module, 2026-07-03)

The hottest, most core module — every state read/write flows through
`getByPath`/`setByPath`. Chosen deliberately to derisk toolchain + size + speed.

**Port effort:** near-mechanical. Strip TS type annotations/casts (native TJS
uses example-based types, not TS type names), keep the logic verbatim. One real
change: `new Date(…).valueOf()` in `id()` → `Math.floor(performance.now())` — the
`Date` wrapper was a redundant no-op, and `id()` wants a *monotonic counter*, not
a wall-clock date (which also satisfies `TjsDate` mode).

**Modes:** `safety none` + `TjsCompat`. This module handles only raw values and
deliberately uses JS `===` / `!= null` semantics; the ergonomic modes would be
pure overhead.

**Correctness:** `src/by-path-port.test.ts` runs the by-path contract through the
plugin — 7/7 pass, full suite 568 pass.

**Numbers** (same logic, 200k iters of 6 gets + 1 set + 1 parse):

| variant | runtime | transpiled size |
| --- | --- | --- |
| TS (baseline) | 1.00× | ~9.6 KB equiv |
| **tjs `TjsCompat`** | **0.99×** | **9575 B** |
| tjs native (all modes) | 0.905× | 11422 B |

The native-mode tax is `__tjs.toBool(...)` wrapping *every* conditional and `Eq()`
wrapping loose equality. `TjsCompat` removes both → parity.

---

## Feedback for tjs-lang

Tracked here as it surfaces; also mirrored to the maintainer.

1. **Native `toBool`-per-conditional is a hot-path tax** (~10% runtime, ~19% size
   on by-path). For modules that never handle boxed primitives it's pure overhead.
   Options: skip the wrap when an operand is provably primitive/typed; or document
   the "TjsCompat for hot internals" pattern prominently so people don't measure a
   regression and bounce.
2. **The Bun plugin and `installRuntime` are not public exports.** Integrating
   `.tjs` into a downstream build means reaching into `tjs-lang/src/` internals or
   reimplementing the plugin. Exporting `tjs-lang/bun-plugin` and
   `tjs-lang/runtime` would make adoption one line.
3. **`TjsDate` error guidance is incomplete.** It suggests only `Timestamp.now()`.
   For monotonic / id-generation use cases the correct primitive is
   `performance.now()`, which the message never mentions — easy to go in circles.
4. **Mode control is add-only.** You can enable an individual mode but not disable
   one; getting "everything except TjsStandard" means `TjsCompat` + re-enabling the
   rest. A per-mode `off` (e.g. `TjsStandard off`) would be more ergonomic.
