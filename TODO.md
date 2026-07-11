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

Next steps:
- **Get tosijs-ui 1.7** (package.json still pins 1.6.13) — it ships the
  `libraryBuild` + `generateCssPreload` seams (`../tosijs-ui/BUILD-TJS-HOOK.md`) that
  unblock the swap.
- **Pick a migration mode** (bulk vs incremental) and wire `tosijs-site.config.ts`
  to the seams, then re-run the swap that died at buildSite.

Deferred / ideas:
- **Monadic `'strict'` strictness mode** — needs assignment to have a value-returning
  channel (a `trySet`, or the TJS 2.0 assignment transform).
- **Schema-per-path validation** — declare a TJS `Type`/predicate per path (richer
  than the `typeof` primitive; covers first-set; a `.schema` setter to update it).
- **`schematic`** — non-singleton, schema-first, boxed-from-birth observant-state
  factory + schematic components (auto shadow-DOM binding). Recorded, not built.

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
