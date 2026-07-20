# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

## [1.7.0-beta.2] - 2026-07-20

Second 1.7 beta: the medium-severity backlog triage, plus documentation for
proxy-driven theming (a feature that already worked but was undocumented — and
whose docs said the opposite). Published under the `beta` dist-tag.

### Fixed

- **`tsc` error that shipped in beta.1.** `hot-reload.ts`'s observer predicate
  was typed `boolean` but a `PathTestFunction` may return the
  `observerShouldBeRemoved` symbol. Worth knowing: the build does **not** treat
  a `tsc` failure as fatal, so beta.1's `.d.ts` output may be stale.
- **`Component.change` now bubbles and composes.** It was dispatched
  non-bubbling, so an ancestor `addEventListener('change', …)` never heard a
  component's value change — breaking the "bound like a native `<input>`"
  contract for user code. (The delegated binding was unaffected; it listens in
  the capture phase.)
- **`parts` honors the documented `data-ref="foo"` lookup.** Only `[part="foo"]`
  was implemented, so code following the docs threw
  `elementRef "foo" does not exist!`. Order is now `part=` → `data-ref=` → CSS
  selector. Symbol keys are no longer treated as refs, so thenable-probing a
  `parts` proxy no longer throws.
- **Named CSS colors parse without a DOM.** `css-colors.ts` (a complete named
  color table that was dead code) is now wired into `Color.fromCss`, so
  `Color.fromCss('red')` works in SSR/workers/tests instead of parsing as
  transparent black. Consequently `invertLuminance` no longer silently drops
  named colors from inverted maps.
- **Reactive `class` bindings replace instead of accumulating** — binding
  `class` to state and changing `'red'` → `'blue'` no longer leaves `"red blue"`;
  boolean-map bindings remove keys dropped from a later map. Classes from other
  sources (a static `class`, `-xin-data`) are never touched.
- **`bind()` no longer mutates the caller's spec**, so one `bindList` spec object
  can bind two containers (the second used to throw).
- **`bind: { value, binding: 'name' }`** (string binding name) resolves and
  renders — it was passing the raw string through, a silent no-op.
- **Unitless custom properties no longer get `px`** (`--opacity: 0.5`, not
  `0.5px`) — the unitless check ran before the `_` prefix was stripped.
- **`Color` alpha hex rounds** instead of flooring (`0.5` → `80`, not `7f`),
  matching the r/g/b channels.
- **External `removeAttribute` is observable again** — the in-memory
  `initAttributes` fallback masked it permanently.
- **`<slot>` fallback children survive** the `tosi-slot` rewrite.
- **`Component.isSlotted`** compared `querySelector` to `undefined` (always
  true); now compares to `null`.
- **Symbol-keyed assignment** through a proxy stores on the target instead of
  throwing.
- **`debounce`/`throttle` preserve `this`** — a debounced method invoked as
  `obj.method()` lost its receiver.
- **Duplicate list `idPath` values** emit a once-per-session `console.error`
  instead of silently collapsing rows. Removed a debug `console.log` that
  shipped in the list filter path.

### Added

- **`StyleSheet()` returns its `<style>` element**, so a sheet you create can be
  removed or updated (previously there was no handle at all).
- **Documentation for observant stylesheets and dynamic theming** — the
  previously-undocumented core of proxy-driven themes: pass a tosi proxy to
  `StyleSheet()` and it regenerates in place on change, **and derived colors
  from the `vars` sugar are recomputed with it**. Includes a runnable live
  example (brand/page color inputs driving a themed card via derived shades) and
  an in-browser test asserting the whole loop through `getComputedStyle`.
  ⚠️ The old docs carried a Caution claiming computed colors "won't
  automatically be recomputed on theme change" — **that was wrong** and is
  corrected. Verified in a real browser: `--brand` `#3366cc` → `#cc3366` moves
  `--brand_20b` from `rgba(41,82,163,1)` to `rgba(163,41,82,1)`, live DOM
  following.

### Changed

- **Packaging:** `types` is now the **first** condition in every `exports` entry
  (TypeScript matches conditions in order, so it could previously be skipped),
  and `*.tsbuildinfo` / `dist/bun-plugin` are excluded from the tarball.

## [1.7.0-beta.1] - 2026-07-18

First beta of the **1.7 correctness release** — the outcome of a whole-codebase
review (~45 verified defects, every one passing the previous happy-path suite).
Published under the `beta` npm dist-tag so `latest` stays on 1.6.10. Intended
for integration testing (notably by tosijs-ui) ahead of a synchronous 1.7.0.

### ⚠️ Behavior changes (observable — the reason this is a minor, and a beta)

- **`on()` handlers now fire inside open shadow roots.** Composed events cross
  the shadow boundary and the dispatcher resolves the true origin via
  `composedPath()`, continuing delegation up through shadow hosts to light-DOM
  ancestors. Handlers that were silently dead will now run. (Data bindings still
  do not operate inside shadow DOM — by design; a shadow component is bound like
  an `<input>`, via its `value`.)
- **Path matching is now segment-exact.** An observer on `'foo'` no longer hears
  `'foobar'`; `touch('foo')` no longer swallows a later `touch('foobar')`; and a
  bound element no longer re-renders when an unrelated sibling-prefix path (e.g.
  `list[50]` vs `list[5]`) changes. Hierarchical matching (parent hears child,
  child hears parent) is unchanged.
- **`getValue()` returns typed values for typed controls.** `number`/`range`
  inputs return numbers; the date family (`date`, `datetime-local`, `month`,
  `week`) returns `Date` objects (was an ISO string for `type=date`); `time`
  returns ms-since-midnight. Bound numeric state now stays numeric across edits
  instead of silently becoming a string.
- **List updates no longer re-insert every item element** on every change, so
  focus/selection in list inputs and CSS animations survive unrelated updates.
- **`deepClone()` now preserves `Date`, `Map`, and `Set`** (were becoming `{}`
  or shallow) and no longer stack-overflows on circular references.
- **Data-binding sugar inside shadow-DOM content now warns** (once per class /
  session) instead of failing silently.

### Fixed

- **Nested list bindings** — a `bindList` inside another list's item template now
  renders and updates: options pass through to the inner binding, compound
  id-paths no longer double-bracket (`list[[id=x]]`), and `<template>` cloning
  targets `.content` per spec (verified in a real browser).
- **`Component` attribute drain is last-write-wins** — the second of two
  pre-connect property writes is no longer dropped.
- **`initAttributes` accessors survive class-field shadowing** — a leftover
  subclass field of the same name no longer throws a cryptic `TypeError` at
  element creation under modern class-field semantics; the value is adopted, the
  accessor restored, and a once-per-class warning points at the fix.
- **Boxed `.value` assignment respects shadowing** — assigning `.value` on an
  object that has a real `value` property writes the property instead of
  replacing the whole object.
- **`share()`** no longer re-broadcasts its (possibly stale) restored snapshot
  over live tabs, and doesn't clobber a delta that arrives mid-restore.
- **`sync()`** requeues outbound deltas when `transport.send()` throws instead of
  losing them silently.
- **`hotReload()`** restores saved state wholesale (was `Object.assign`, which
  dropped root scalars and left stale array tails) and saves on deep writes.
- **Blueprint loader** — one failing blueprint no longer wedges the loader:
  failures are evicted from the cache (so a retry re-imports) and the loader uses
  `Promise.allSettled`, reporting failures while still firing `allLoaded()`.
- **Events on `cloneNode` copies** of bound elements no longer throw in the
  global dispatchers (and no longer abort ancestor delegation).

### Added

- **`Component.hydrated` / `Component.whenHydrated`** (from 1.6.9) and the
  shadow-DOM value doctrine, documented throughout.
- **Experimental `tosijs/debug` and `tosijs/safe` bundles** — the config
  eval-order bug is fixed (they now ship complete per-function `__tjs` runtime
  type metadata and wired config; runtime enforcement arrives with native-TJS
  modules in 2.0). Flagged experimental; the debug bundle announces itself.
  Built with tjs-lang 0.10.1.
- **`setModuleLoader()`** (blueprint loader) and **`setShareStore()`** test seams.
- **In-browser doc test lane** — `bun run test:browser` drives the doc `test`
  fences through a real browser (haltija) for behaviors happy-dom can't observe.

### Changed

- Build host is **tosijs-ui 1.7.0-beta.5**.
- `dist/` bundles regenerated under the current Bun toolchain.

## [1.6.10] - 2026-07-17

### Fixed

- **Stale id-path cache could read — and overwrite — the wrong array item.** The
  id→index map for `list[id=…]` paths merged fresh entries over stale ones, so an item
  removed outside `setByPath` (a proxied `splice`/`pop`, or direct mutation plus
  `touch`) left its old key behind: `getByPath('arr[id=2]')` could return a different
  item, and `setByPath('arr[id=2].v', …)` could silently overwrite it. Maps are now
  rebuilt fresh, so removed ids resolve to `undefined`. Relatedly, deleting a
  nonexistent id no longer removes the *first* item (`splice(undefined, 1)` coerces to
  `splice(0, 1)`).
- **`await updates()` could hang forever when an observer wrote state.** A write
  inside an observer callback re-arms the update queue mid-drain, which replaced the
  module-level promise resolver: earlier awaiters were orphaned (hung), and the next
  round's promise resolved before its round had run. Each round now resolves exactly
  the promise that belongs to it. The one-`await`-per-settling-round semantics are
  unchanged (and now pinned by a regression test). This also fixes a silent-death mode
  in `share()`/`sync()`, whose inbound echo-suppression cleanup waits on `updates()` —
  an orphaned promise left paths suppressed forever, permanently stopping outbound
  sync for that subtree.
- **A throwing observer *test* function no longer aborts the whole dispatch batch.**
  It was rethrown after the touched-path queue had already been cleared, silently
  dropping every remaining notification and hanging `updates()`. Now logged and
  skipped, matching how callback exceptions are handled.
- **`throttle()` fired the wrapped function twice per isolated call** — an
  uncancelled trailing timer duplicated every leading-edge call. A lone call now fires
  exactly once; the documented "the last call always goes through" trailing behavior
  for suppressed calls is preserved.

### Changed

- `dist/` bundles regenerated with the current Bun toolchain (smaller minified
  output; deferred from the dev-only tosijs-ui bump so published artifacts wouldn't
  change under a devDependency patch).

## [1.6.9] - 2026-07-15

### Fixed

- **`Component.parts` no longer poisons itself when read before hydration.**
  Content is instantiated on `connectedCallback` (via `hydrate()`), not at
  construction — so on an uninserted element (e.g. one fresh from
  `elementCreator()`) there is no shadow root yet and the `parts` proxy would
  bind to the light-DOM root. Because the proxy was cached, that binding
  persisted for the life of the element: after insertion `parts.host` still
  threw `elementRef "host" does not exist!`, silently, forever. This bricked
  components whose public getters read `parts` before insertion (e.g. reading
  `el.showingDiff` on a detached `<tosi-code>` left CodeMirror unmounted with no
  error). `hydrate()` now discards the cached proxy so the next access rebuilds
  against the correct root. ([#13](https://github.com/tonioloewald/tosijs/issues/13))

### Added

- **`Component.hydrated: boolean` and `Component.whenHydrated: Promise<void>`.**
  A supported way to ask whether an element is hydrated instead of probing
  `parts` (which was itself the thing that poisoned the proxy). Gate
  parts-dependent public getters on `this.hydrated`, or `await this.whenHydrated`
  before doing parts-dependent work on an element that may not be inserted yet.
  Already-hydrated elements resolve immediately.

## [1.6.8] - 2026-07-11

### Added

- **`Component` warns when a subclass defines an `on<Event>`-named member**
  (e.g. `onClick`, `onMousedown`). The elements factory treats `on<Event>` prop
  names as event-handler sugar — `creator({ onClick })` attaches a `click`
  listener rather than assigning the property — so such a member is shadowed and
  can't be set or read via the element creator. The warning (once per class,
  deferred to a microtask so it catches arrow-function class fields) names the
  members and points to the `handle<Event>` convention (e.g. `handleClick`).

### Changed

- **`Component` resize hook renamed `onResize` → `handleResize`.** Component
  callbacks now use the `handle<Event>` convention, because the `on<Event>` prefix
  is reserved for event-handler sugar in the elements factory (and is being
  retired for component callbacks). `onResize` still works but is **deprecated**
  and warns once per class, pointing to `handleResize`.

## [1.6.7] - 2026-07-05

### Fixed

- **`ElementProps.class` type** widened to match the runtime (which has accepted
  arrays and boolean maps since 1.6.5). It was still typed `class?: string`, so
  TypeScript rejected `div({ class: ['a', 'b'] })` and
  `div({ class: { active: isActive } })` — forcing a cast. The new `XinClassSpec`
  type is `string | false | null | Array<string | false | null | undefined> |
  Record<string, boolean>` (top-level and array falsy values add no class, matching
  the runtime). Type-only change.

### Changed

- **`static initAttributes` now throws for a boolean attribute defaulting to
  `true`.** HTML boolean attributes are false-by-default (presence = true, absence
  = false), and a reflected boolean attribute cannot default to `true` — the
  element would have to "gain" the attribute during construction (which the
  custom-elements spec forbids), so a `true` default silently read back as `false`.
  Rather than surprise you, this is now a hard error explaining the fix (`{ foo:
  false }`, or a string/number attribute or a plain property). A `false` default is
  unchanged.

## [1.6.6] - 2026-07-03

### Fixed

- **Attribute-timing regression** in the constructor `setAttribute` deferral
  (introduced in the 1.6.x line): a value assigned to an `initAttributes`-backed
  property between `createElement` and a *synchronous* `append` was queued but
  not yet reflected to the DOM when a subclass's `connectedCallback` ran. A
  subclass that read the attribute early (e.g. `getAttribute('url')`, or asset
  loading / `sceneReady` logic before calling `super.connectedCallback()`) saw
  the empty default and never retried. The deferred-attribute drain now runs
  before the subclass's `connectedCallback` body — regardless of whether or when
  it calls `super` — by wrapping `connectedCallback` at registration.
- Element factory `class` property: falsy values (`''`, `null`, `undefined`,
  `false`) now add no class instead of the literal strings `"null"`/
  `"undefined"`/`"false"` (regression from the 1.6.5 `class` rework). Conditional
  expressions like `cond ? 'active' : undefined` and `cond && 'active'` now work
  directly, and falsy array entries are skipped.

## [1.6.5] - 2026-07-02

### Added

- Element factory `class` property now accepts an **array** of class names
  (`{ class: ['card', 'selected'] }`) and a **boolean map**
  (`{ class: { foo: true, bar: false } }`, which adds `foo` and removes `bar`)
  in addition to the existing space-separated string form.

### Fixed

- Passing an empty or all-whitespace `class` (e.g. `{ class: '' }`) no longer
  throws from `classList.add('')`; the empty class is ignored with a console
  warning, and extra whitespace between class names is tolerated.

## [1.6.4] - 2026-06-27

### Fixed

- Narrowed the constructor `setAttribute` mask to `initAttributes`-named
  attributes so it no longer interferes with composition.

## [1.6.3]

### Changed

- Constructor-spec `setAttribute` deferral.
- Doc-site migration: `dev.ts`/`docs.js`/`demo/index.ts` replaced by
  `bin/site.ts` + `tosijs-site.config.ts` using `tosijs-ui/site` (prerendered
  HTML, sitemap, `llms.txt`, ePub).

## [1.6.2]

### Added

- `scrollListItemIntoView` behavior option; coercion tests and docs.

## [1.6.1]

### Added

- Footer rows and template anchoring for list bindings.

### Changed

- Hex color parsing refactor.

## [1.6.0]

### Added

- `itemsPerRow` for virtual grid layouts.
- Pinned row support.
