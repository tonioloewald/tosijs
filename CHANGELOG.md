# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

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
