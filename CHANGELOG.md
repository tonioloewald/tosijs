# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

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
