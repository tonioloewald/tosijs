# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

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
