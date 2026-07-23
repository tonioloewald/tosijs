# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

## [1.7.3] - 2026-07-23

### Changed

- **`on()` no longer stamps a `-xin-event` marker class onto your elements.**
  Event delegation used to climb the ancestor chain by matching that class with
  `closest()`; it now consults the internal `elementToHandlers` WeakMap directly,
  which is already the authoritative record of which elements have handlers. The
  behavior of `on()` is unchanged — handlers fire exactly as before, including
  across open shadow roots — but `on()`-bound elements are no longer mutated, so
  nothing appears in their `className` and clones no longer carry a stray marker.

  **Potentially breaking (unlikely):** if you were selecting or styling elements
  via `.-xin-event` (an undocumented internal), that class is gone. Bind your own
  class instead. The `-xin-data` marker on *data*-bound elements is retained — a
  `MutationObserver` re-discovers those via `querySelectorAll`, which a WeakMap
  can't provide.

## [1.7.2] - 2026-07-22

### Fixed

- **Custom-property `line-height` lost its `px` suffix** (regression introduced
  in 1.7.0). A declaration like `_lineHeight: 25` emitted `--line-height: 25`
  instead of `--line-height: 25px`. Cause: 1.7.0's `_opacity: 0.5px` fix began
  stripping the `_` prefix before testing the unitless-property list, and
  `line-height` was in that list — so custom-property line-heights matched and
  their `px` was suppressed. Subtle and lethal: the `vars` system uses
  `lineHeight` as a length (`calc(vars.lineHeight + vars.spacing200)`), so the
  missing unit silently broke computed sizes downstream.

  `line-height` is now treated as **dual-mode**: a real declaration
  (`lineHeight: 1.5`) keeps the unitless multiplier idiom; a **custom property**
  (`_lineHeight: 25`) gets `px` per tosijs's bare-number→px convention. Opt out
  with a string — `_lineHeight: '1.5'` → `--line-height: 1.5`. The `_opacity`,
  `_zIndex`, etc. fix from 1.7.0 is preserved (those are always-unitless — a `px`
  value is invalid CSS, so it is suppressed for both real and custom props).

## [1.7.1] - 2026-07-21

Packaging fix and internal cleanup. No API or behavior changes.

### Fixed

- **`CHANGELOG.md` and `llms.txt` are now published to npm.** Both were built
  and committed but omitted from the package `files` allowlist, so they never
  reached installers. `llms.txt` in particular is meant to travel with the
  package for LLM-assisted consumers.

### Changed (internal, no observable effect)

- `on()`'s origin resolution now guards `composedPath()` behind the event's
  `composed` flag before falling back to `event.target` (defensive; same
  result for the events tosijs dispatches).
- Removed a dead `DATEISH` constant from `dom.ts`.
- Extracted the duplicated `__tjs` bootstrap in `configure-tjs-debug.ts` /
  `configure-tjs-safe.ts` into a shared `configure-tjs.ts` helper, and the two
  copy-pasted blueprint-batch loaders into one `settleBlueprints()`.
- Corrected a `list-binding.ts` comment (the null-anchor branch is the
  SVG/MathML namespaced case, not HTML table mode).

### Documentation

- New Building-Apps "Gotchas" note: boxed proxies are minted fresh per access,
  so never key identity/memoization on them — compare on `.tosi.path`/`.value`.
- Added date-family control round-trip test coverage (`dom.test.ts`).

## [1.7.0] - 2026-07-20

The **correctness release** — the outcome of a whole-codebase review (~45 verified
defects, every one of which passed the previous happy-path test suite). No API was
removed or renamed; a handful of fixes are observable behavior changes (below), which
is why this is a minor. Ships with a new multi-engine (Chromium + Firefox) real-browser
CI lane and a comprehensive `Migration.md` "Upgrading to 1.7.0" section.

(Shipped incrementally as `1.7.0-beta.1`/`beta.2`; this is the consolidated stable entry.)

### ⚠️ Behavior changes (observable — the reason this is a minor)

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
- **`Component.change` now bubbles and composes** — it was dispatched
  non-bubbling, so an ancestor `addEventListener('change', …)` never heard a
  component's value change (breaking the "bound like a native `<input>`"
  contract). It now behaves like a native input's `change`. (The delegated
  binding was unaffected — it listens in the capture phase.)
- **Reactive `class` bindings replace instead of accumulating** — binding
  `class` to state and changing `'red'` → `'blue'` no longer leaves `"red blue"`.
- **`getValue()` on the date family returns `Date`** (see above) — and named CSS
  colors (`Color.fromCss('red')`) now parse without a DOM.
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
- **`parts` honors the documented `data-ref="foo"` lookup** (order is now
  `part=` → `data-ref=` → CSS selector); symbol keys are no longer treated as
  refs, so thenable-probing a `parts` proxy no longer throws.
- **`css-colors.ts` (a complete named-color table, previously dead code) is wired
  into `Color.fromCss`**, so named colors parse with no DOM (SSR/workers/tests
  got transparent black before); consequently `invertLuminance` no longer drops
  named colors.
- **`bind()` no longer mutates the caller's spec**, so one `bindList` spec can
  bind two containers; and **`bind: { value, binding: 'name' }`** (string binding
  name) resolves and renders instead of being a silent no-op.
- **Unitless custom properties no longer get `px`** (`--opacity: 0.5`, not
  `0.5px`); **`Color` alpha hex rounds** (`0.5` → `80`, not `7f`).
- **External `removeAttribute` is observable again** (the in-memory
  `initAttributes` fallback masked it); **`<slot>` fallback children survive** the
  `tosi-slot` rewrite; **`Component.isSlotted`** no longer always-true.
- **Symbol-keyed proxy assignment** stores on the target instead of throwing;
  **`debounce`/`throttle` preserve `this`**; **duplicate list `idPath` values**
  warn once instead of silently collapsing rows.

### Added

- **`Component.hydrated` / `Component.whenHydrated`** (from 1.6.9) and the
  shadow-DOM value doctrine, documented throughout.
- **Experimental `tosijs/debug` and `tosijs/safe` bundles** — the config
  eval-order bug is fixed (they now ship complete per-function `__tjs` runtime
  type metadata and wired config; runtime enforcement arrives with native-TJS
  modules in 2.0). Flagged experimental; the debug bundle announces itself.
  Built with tjs-lang 0.10.1.
- **`StyleSheet()` returns its `<style>` element** (previously nothing), so a
  proxy-backed sheet you create can be removed or updated.
- **Documented observant stylesheets & dynamic theming** — pass a tosi proxy to
  `StyleSheet()` and it regenerates in place on change, **and derived colors from
  the `vars` sugar recompute with it** (a runnable "change the brand color, the
  whole card follows" live example, verified in-browser). The old docs' Caution
  that computed colors "won't be recomputed on theme change" was wrong and is
  corrected.
- **`setModuleLoader()`** (blueprint loader) and **`setShareStore()`** test seams.
- **Multi-engine real-browser CI lane** — `bun run test:browser` runs the inline
  ```test doc fences through Chromium + Firefox via Playwright (behaviors
  happy-dom can't observe: composed-event retargeting, spec-correct `<template>`
  cloning, `getComputedStyle`-resolved derived CSS vars), gated in CI.

### Changed

- **Packaging:** `types` is now the **first** condition in every `exports` entry
  (TS matches conditions in order, so it could be skipped before), and
  `*.tsbuildinfo` / `dist/bun-plugin` are excluded from the tarball.
- Build host is **tosijs-ui 1.7.0-rc.1**; **tjs-lang 0.10.1**.
- First **GitHub Actions CI** (unit suite + the Playwright browser lane).
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
