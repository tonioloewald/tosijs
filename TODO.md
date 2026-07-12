# todo

## work in progress

- change `MutationObserver` in Component if there's an `onDomChanged`
  or something handler to trigger it as appropriate
- automated golden tests?
- `css()` should handle multiple `@import`s
- possibly leverage component static property method (if we can keep type preservation)

- consider automatic observer cleanup via `FinalizationRegistry` — observers in the
  `listeners` array (path-listener.ts) persist forever unless explicitly `unobserve()`d
  or the callback returns `observerShouldBeRemoved`. If an observer is tied to a
  component/element, it could be auto-removed when the owner is GC'd (same pattern
  as `tosiUnique`'s owner-based cleanup).

- **The committed `dist/` is stale.** A rebuild with *no source change* rewrites
  `dist/module.debug.js` and `dist/module.safe.js` (~3.6KB smaller, different minified
  symbol names) — the committed bundles were minified by an older Bun. Confirmed by
  control build: it happens on `tosijs-ui@1.6.13` too, so it is not the 1.6.22 bump.
  Deliberately **not** folded into the dev-only 1.6.22 patch, because that would change
  published artifacts under cover of a devDependency change. Fold it into the next real
  release, where the bundle diff belongs.

## 2.0 port — state of play (branch `tosijs-2.0`)

Full living log: `TJS-PORT-DX.md`. tjs-lang is at **0.9.0** (fixed the critical dts +
export feedback; 3 minor items remain). Terminology: tosijs is **observant**, not
"reactive" (UI ≠ f(state)).

Done on the branch:
- **Boxed-scalar equality** — boxed scalars proxy over `Number`/`String`/`Boolean`
  wrappers, so `instanceof`/`Eq`/`==` work with no `.value`, live, navigation intact.
- **Assignment strictness** — `settings.strictness` (`'off'|'warn'|'throw'`, default
  warn) fires on runtime type-drift; `.valueAndType` setter is the deliberate bypass.

Proven / characterized:
- **Bulk all-`.tjs` baseline** builds + smoke-tests (`tjs convert --emit-tjs`).
- **Per-file swap** (by-path) works for runtime/types/bundle but is blocked at
  tosijs-ui `buildSite` (CSS-eval can't load `.tjs`) + Bun runtime `onResolve`.

**The buildSite wall is down (2026-07-13).** `tosijs-ui` is on 1.6.22, the
`libraryBuild` + `generateCssPreload` seams are wired in `bin/site.ts`, and
**`by-path` now ships as native `.tjs`** — `by-path.ts` is deleted. 589 tests pass,
build exits 0, the shipped bundle smoke-tests clean. Cost: +256 bytes gzipped (+1.2%).
Details in `TJS-PORT-DX.md`.

Next steps:
- **Pick a migration mode — now a real choice, not a forced one.** Incremental
  per-file swaps are unblocked (proven by by-path). Bulk all-`.tjs` is also proven.
  Incremental costs an explicit `.tjs` extension at every import site (Bun's runtime
  loader ignores plugin `onResolve` for relative specifiers); bulk avoids that but
  lands a TS-shaped codebase to be improved module-by-module afterwards.
- **Port the next module.** The machinery is generic: drop the `.tjs` in `src/`, add a
  hand-authored `x.d.tjs.ts`, point importers at `./x.tjs`. `bin/site.ts` stages and
  strips automatically. Candidates: `more-math` (pure leaf), `string-case`, `throttle`.
- **Make `by-path.tjs` idiomatic — the value experiment.** As landed it's a mechanical
  transpile: TS-shaped, no `safety` boundary, no examples-as-types, no inline tests, no
  monadic errors. It costs +1.2% gzip and delivers nothing TS didn't. 2.0 ships pure TJS
  regardless, so the question is never "can we afford TJS" — it's **"does this module now
  do something TS couldn't?"** Give it `safety inputs` at the public boundary
  (`getByPath`/`setByPath` take a path string + arbitrary object — a natural validation
  seam), examples-as-types, inline tests, monadic errors instead of the `makeError`
  import; *then* measure size/speed and whether the validation catches anything real.
  Don't reach for `TjsCompat` first — shaving the 1.2% off a pointless module just makes
  it cheap and pointless. Mode selection is a **budget** decision, applied after the
  value is known.
- **Keep `dist/bun-plugin/` out of the published package.** The build emits
  `dist/bun-plugin/tjs-plugin.{js,d.ts}` from `src/bun-plugin/tjs-plugin.ts`, and
  `files: ["/dist"]` ships it. It imports `tjs-lang/lang` — a *devDependency* — so it's
  dev-only tooling riding along in a runtime package. Nothing in the exports map reaches
  it (dead weight, not a live resolution break), but it should be excluded from the
  library build before 2.0 ships. Pre-dates the tosijs-ui bump.
- **`by-path-port.test.ts` is now redundant** — it was the parity harness proving
  `.tjs` matched `.ts`, and both it and `by-path.test.ts` now exercise the same module.
  Kept for now because 5 of its 7 assertions have no same-named counterpart in
  `by-path.test.ts`; fold the unique ones in and delete it.

Next up — **monadic writes (no tjs-lang changes needed).** Ladder: silent / warn /
monadic / throw. The Proxy `set` trap's *return* is `ToBoolean`-coerced so it can never
carry an error (a returned `MonadicError` is truthy → reports a failed write as
**success**), but a trap can **throw**, and a thrown value escapes bare assignment
intact. Throw is the channel. Verified.
- **Make `setByPath` return `true | MonadicError`** instead of a bare `boolean`. It
  already has the return channel; this is the whole of monadic mode at the call layer.
  Callers (`xin.ts`'s two set traps) must then check `isMonadicError(r)` before
  `touch()` — a truthy monad would otherwise fire observers on a failed write.
- **Add `.tosi.trySet(v)`** — throw, catch the throw, return the monad. Throw-free for
  JS/TS consumers with no language support at all.
- **Bare `=` throws a `MonadicError` value** (structured, carries the path, stringifies
  to the message) rather than an `Error`. Be blunt in the docs: for bare `=` *today*,
  `monadic` and `throw` are the same mechanism and differ only in payload. Don't pretend
  otherwise.
- **⭐ Adopt the assignment sugar the moment tjs-lang ships it**, and desugar `=` onto
  the same `trySet` semantics — do not re-implement mode logic in the emitter. Then bare
  `=` becomes throw-free too and the ladder completes. Confirmed absent in tjs-lang
  0.9.0: the JS emitter never touches `AssignmentExpression`, and
  `bare-assignments.test.ts` is auto-`const` for uppercase identifiers, not monadic
  propagation.
- **Rejected: `MonadicError` falsy but `Error` not.** A workaround for a problem
  throwing already solves, and an astonishing asymmetry. (No object can be falsy in JS
  anyway — `ToBoolean` has no user hook. Same wall as the boxed-`Boolean` limitation.)
- **Schema-per-path validation** — declare a TJS `Type`/predicate per path (richer
  than the `typeof` primitive; covers first-set; a `.schema` setter to update it).
- **`schematic`** — non-singleton, schema-first, boxed-from-birth observant-state
  factory + schematic components (auto shadow-DOM binding). Recorded, not built.

## 2.0 release blocker: purge `xin` entirely

**2.0 is not ready while the name `xin` survives anywhere.** tosijs is not xinjs; the
old name leaking through the API, the types, and the filenames is the single most
visible piece of unfinished business. Surface as of 2026-07-13: **1011 occurrences
across 40 files**, plus 5 files *named* for it.

This is not a rename — it's a **deletion**, and it should make the library smaller:

- **Drop the unboxed `xin` proxy.** Everything is boxed (already the 2.0 plan). That
  removes the dual-proxy system outright: **14 `boxScalars` branches** in the `get`/`set`
  handlers and `regHandler` collapse to one path, and `BoxedScalarAPI`/`XinProps` stop
  having to describe two shapes. This is the "simplify some code" win — it's real, and
  it's the reason to do the purge as deletion rather than sed.
- **84 internal `xin[...]` call sites** are the actual work. They read raw values; with
  boxed-only they become `.value` reads (or `tosiValue(...)`). Mechanical but not
  zero — and worth doing carefully, because a missed unwrap is a live bug, not a
  compile error.
- **Rename the 5 files:** `xin.ts`, `xin-proxy.ts`, `xin-types.ts` (+ their tests).
- **Rename the public types:** `XinObject`, `XinArray`, `XinScalar`, `XinBinding`,
  `XinProps`, … These are exported, so this is a breaking change — which is exactly
  what a major is for.
- **Retire the deprecated `xin*` exports** already listed under "2.0 refactoring
  candidates": `xinPath`, `xinValue`, `xinProxy`, `xinSlot`, `boxedProxy`.

Two traps worth knowing before starting:

1. **`-xin-data` / `-xin-event` are DOM-visible CSS classes** (`metadata.ts`). They're
   not just internal identifiers — anyone styling or querying them is coupled to the
   name. Renaming is correct for 2.0, but it's a real breaking change for consumers,
   and it needs a line in `Migration.md`, not a silent sed.
2. **Don't do this with a global find-and-replace.** `xin` is a substring of nothing
   useful, but it appears in doc blocks, live examples, and prose where the *history*
   matters (Migration.md explains the xinjs→tosijs rename and must keep saying "xin").
   The purge is of the *code surface*, not of every occurrence of the letters.

## tjs-lang

- `Boolean()` on proxied scalars always returns `true` (JS spec limitation —
  `Boolean(anyObject)` is always `true`). **Partially addressed on `tosijs-2.0`:**
  boxed scalars now box over a real `Boolean` wrapper, so `instanceof Boolean` holds
  and TJS's `toBool`/`Eq` unwrap them in TJS contexts — but plain-JS `Boolean(box)`
  is still `true`. A full fix wants `TjsEquals`/`toBool` (or `.valueOf()`-based
  coercion). See TJS-PORT-DX.md feedback list.

## 2.0 refactoring candidates

- **Remove deprecated exports** (~2-3KB gzipped): `xinPath`, `xinValue`, `boxedProxy`,
  `xinSlot`, `bindText`, `bindEnabled`, `bindDisabled`, `bindList` and their warning wrappers
- **Simplify dual API surface** (~1.5-2KB gzipped): collapse `xin*`/`tosi*`/symbol variants
  in `XinProps`, `BoxedScalarAPI`, and the proxy `get` handler to just `.tosi` accessor +
  direct properties
- **Remove blueprint-loader deprecation scaffolding** (~0.5KB): `DeprecatedBlueprint`,
  `DeprecatedLoader` classes
- **Remove debug/test exports from prod bundle**: `_getArrayIdPathRegistry()`,
  `_resetDeprecationWarnings()`
- **Split list-binding.ts**: extract virtual scrolling logic into `list-binding-virtual.ts`
  for maintainability and documentation separation

## known issues

- bindList cloning doesn't duplicate svgs for some reason
