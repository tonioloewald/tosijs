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

## tjs-lang

- `Boolean()` on proxied scalars always returns `true` (JS spec limitation —
  `Boolean(anyObject)` is always `true`). TJS could fix this via `TjsEquals`
  or by compiling boolean coercion checks to use `.valueOf()` instead

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
