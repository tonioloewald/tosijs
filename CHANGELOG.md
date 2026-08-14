# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

## [1.8.0] - 2026-08 (rc.1)

**One source of truth for state, UI, and AI.** An app's affordances — what
exists, what it's bound to, what it does — have always been recorded by
tosijs in order to *run* the app. 1.8.0 lets you ask for them.

### Added — the agent surface

- **`enableAgentInterface()`** — one call exposes `describe` / `read` /
  `write` / `observe` / `call` / `changes(cursor)` / `when(path, predicate)`
  / `log`, installs `globalThis.tosiAgent`, and (where the browser provides
  `document.modelContext`) **auto-registers a generated WebMCP tool set** —
  verified registering *and executing* in Chrome Canary 153. Nothing new is
  recorded: `describe()` assembles the picture from the registry, the
  binding metadata, and the handler wiring the framework already had.
  ~11 KB gzipped for the whole surface (agent + WebMCP + schematic +
  audit + contract harnesses), tree-shakeable if you never import it, and
  absent entirely from the `<script>`/CDN build.
- **The map is flat and legible**: one record per wired element, bound props
  as `"value ⟷ path"` (`⟷` two-way, `⟵` display-only), handlers as
  `{click: 'app.doThing'}`, plus geometry (`bounds`), live control state
  (`type`, `checked`, `focused`, `invalid`, `required`, `disabled`),
  resolved ARIA, `href`, `contentEditable`, and a structural tier
  (headings/landmarks/containers).
- **ARIA runs both ways.** `aria-label(ledby)`, `<label>` association,
  `aria-describedby`, `disabled`/`required` and `aria-hidden` flow *into*
  the map (the agent reads the page the way assistive tech does); a
  component's `contract.description` becomes its `aria-label` unless the
  author wrote one. Describe a component for agents and screen-reader users
  inherit it.
- **`agent.version`** — `{ surface, tosijs, capabilities[] }` (tosijs#23):
  ask what a surface *is* instead of duck-typing it. Rides `describe()`
  output, and exposed as the `tosi_surface` WebMCP tool.
- **`auditAccessibility(map)`** — anonymous affordances, unnameable actions,
  missing roles, WCAG contrast, target size, placeholder-as-label. Pure over
  the description; `auditFlags()` turns findings into schematic flags so
  they can be drawn. Skips *loudly* when computed styles weren't requested.

### Added — contracts, at three granularities

- **App level**: `expose.contract = { check, describe }` — a zero-dependency
  seam (the core knows a *check*, not a schema language). Sub-path writes
  are **routed, not bypassed**: a write under a contracted root is judged as
  the whole root it would produce. Refusals throw the *reason* and land in
  the audit log. The blessed adapter now ships upstream as
  tosijs-schema's `agentContract()`.
- **Component level**: `static contract` (a `ComponentMap`) unifies contract
  + description + parts map + test fixture. `Component<typeof contract>`
  types `this.parts` from the declared tags — **the declaration is the
  type** — and subsumes `initAttributes`. Blueprints carry it too
  (`TosiComponentSpec.contract`, stamped at hydration).
- **Element level**: a `contract` prop on any element — declared where you
  build, aggregated into `describe().contract` by bound path, enforced on
  agent writes. **Declaration is distributed; curation is central** (a
  top-level contract supersedes everything beneath it).
- **Contracts are tests.** `exerciseContract()` writes every `examples:`
  entry through the real surface (and requires a faithful round-trip),
  refuses every `$counterexamples:` entry; `exerciseComponent()` verifies
  declared parts, methods, value examples, and serializable step tests.

### Added — the map, drawn

- **`schematicSVG(map)` / `rasterizeSVG(svg)`** — the affordance map as an
  SVG at true geometry, with an explicit grammar (bold = wired to act,
  `↔` = editable, `*` = required, red corner = invalid, `✕`/dot = toggle
  state, faded = disabled, faint dotted = structure, white-backed number =
  the record's index). Cramped elements draw bare and point at a legend
  instead of lying. Implementation lives in **tosijs-floorplan**, vendored
  at build time — tosijs keeps zero runtime dependencies.

### Added — scaffolding

- **`bunx tosijs create app|component|blueprint`** (`npx` too). Components
  scaffold in **blueprint form by default** — consumable straight from
  markup, zero-dependency bundles — with `--bare` for a plain class. Every
  template is born with a contract and a declared test, and passes
  `exerciseComponent()` out of the box. Replaces `create-xinjs-blueprint`.

### Added — entry points

- **`tosijs/agent`** — the agent surface, schematic renderer, audit and
  contract harnesses under one import, with a narrower type surface. It
  resolves to the *same file* as `tosijs`: a separately-bundled agent
  surface carried its own copy of the state registry and described an empty
  app, so there is exactly one runtime copy, always. ESM consumers who never
  import it tree-shake it away.
- **The `<script>`/CDN build omits the agent surface** (~26 KB gz) — an IIFE
  cannot tree-shake, so it must not carry an opt-in feature. Load the ES
  module build if you want the agent surface from a script tag.
- **`tosijs/core`** — the library minus the blueprint loader, `share`/`sync`,
  `hotReload` and the agent surface (~24 KB gz — *smaller than 1.7.9's
  entire library*). Opt-in, because blueprints hydrate from *markup*:
  shaking their registration would fail silently. Slim core warns in dev if
  the page holds blueprint elements it can't hydrate.
- **`tosijs/state`** — the **DOM-free** state layer (~16 KB gz), importable
  in plain Node with no shim. Closes tosijs#18.
- Per-entry **gzip budgets** are asserted by the test suite, so the next
  unplanned kilobyte fails a build instead of shipping.

### Changed

- **Relicensed BSD-3-Clause → Apache-2.0**, adding an explicit patent grant
  and a patent-retaliation clause. (Apache-2.0 is incompatible with
  GPLv2-*only* projects; GPLv3+ is fine.)
- An `on<Event>`-named component **member** is no longer hijacked by the
  elements factory's event sugar (tosijs#22): on a custom element, when the
  member already **holds a function** and the passed value is a function,
  the creator **assigns the member** instead of attaching a listener — and
  that name then carries no event sugar. A member declared but left
  undefined/null still gets event sugar (give it a function default if you
  want the assignment). Plain-element event sugar is unchanged: the
  platform's own handlers are lowercase (`onclick`), so they never collide
  with the camelCase sugar.
- A proxy event handler (`onClick: app.doThing`) is normalized to its path
  at registration, so it behaves identically to the string form everywhere.

### Fixed

- **A type-contradicting attribute write is no longer silently discarded**
  (tosijs#24): `false` written to an attribute declared `'on' | 'off'` used
  to remove the attribute so the *default* read back — a feature explicitly
  turned off stayed on. The write now lands as given and reports once.
- Observers no longer require a DOM: the global binding dispatch returns
  early when there is no `document` (the state layer's precondition).

### Removed

- **`data-ref`** — deprecated through 1.7 with 1.8.0 named in its warning.
  Use `part="…"` (bare CSS-selector refs still work).
- **`<xin-slot>`, `<xin-blueprint>`, `<xin-loader>`** and the `xinSlot`,
  `blueprint`, `blueprintLoader` creators — likewise. Three fewer custom
  elements registered at import.

### Build

- Every published bundle is **smoke-imported** during the build (loaded,
  with every export asserted defined). A `sideEffects` array — even an
  accurate one — had produced a bundle exporting names whose definitions
  were shaken away, with tests, `tsc` and lint all green; only executing the
  artifact caught it.

## [1.7.9] - 2026-08-07

### Fixed

- **`take()` transforms now work inside list templates (relative paths), and
  cloned rows no longer share a change-detection cache.** The take descriptor
  used to live in a closure that captured the template's `^.` paths forever —
  in a `listBinding` template the transform ran against `xin['^.…']`
  (`undefined`) instead of the row's value — and held ONE `lastInputs` memo
  shared by every cloned row, so the first row's update suppressed its
  siblings' (observed as one row transformed-wrong and the next not updated at
  all). The descriptor is now **data on the binding entry**
  (`DataBinding.take`): row instantiation rewrites its relative paths exactly
  like the entry's own path (both dispatchers — `touchElement` and list
  instantiation — route through a shared `applyDataBinding`), and the memo
  rides the per-element (per-row-cloned) take object. Also fixes one
  descriptor reused across two elements starving the second. Regression
  suite: `src/take-list-binding.test.ts`.

## [1.7.8] - 2026-07-27

### Fixed

- **A cached part that is detached (with no replacement) no longer makes
  `this.parts` throw (tosijs#21).** 1.7.7's self-healing re-validated cached
  parts with `isConnected` and re-resolved stale ones — but when a part had been
  *removed from the tree and not replaced* (e.g. `<tosi-segmented>`'s optional
  `custom` input: a structural rebuild does `options.textContent = ''` and only
  conditionally re-appends it), the re-resolution found nothing and **threw**
  where 1.7.5 had leniently returned the detached node. That throw fired inside
  change handlers that destructure `this.parts` unconditionally, killing the
  handler *before* it committed `this.value` — the "stale value, correct DOM"
  symptom on Firefox/WebKit. The cache now returns the previously-resolved
  (detached) node when no replacement exists; self-healing still wins when a
  replacement *is* present; the throw is reserved for refs that never resolved
  at all. **1.7.7 is deprecated on npm.**
  - Verified against tosijs-ui's real `<tosi-segmented>` Playwright lane:
    Firefox went from 2/2 failing to green; WebKit 4/4; Chromium green.
  - New interaction coverage: unit tests for the detach-then-access pattern and
    the full click → change → `this.value`-commit round-trip, plus a real-browser
    Playwright test (`tests/value-commit.pw.ts`) running the same round-trip in
    every engine the lane covers.

## [1.7.7] - 2026-07-27

### Fixed

- **`this.parts.foo` now resolves your *own* part — by ownership, not structure
  (tosijs#20).** A component's `[part]` elements are captured from its content
  when it hydrates, *before* the content is inserted and before any nested
  sub-components hydrate or slot. At that moment the tree is exactly what the
  component built, so every `[part]` is unambiguously its own — regardless of how
  deeply it nests, whether it's projected through a `<tosi-slot>`, or whether a
  sub-component is light- or shadow-DOM. `parts.foo` returns the captured node
  (while it's still in the tree) and falls back to `querySelector` for
  lazily-built parts, static (cloned) content, or a part a `render()` replaced —
  so it never throws where 1.7.5 wouldn't. This supersedes **1.7.6, which is
  deprecated on npm** (its custom-element-boundary attempt broke `parts` for any
  component that lays its parts out inside a sub-component like `<tosi-tabs>`).

### Deprecated

- **`data-ref` as a `parts` fallback.** A fossil from when this was a React-style
  "refs" proxy, predating parts-as-binding. It still resolves (`parts.foo` →
  `[part="foo"]` → `[data-ref="foo"]` → CSS selector) but now warns once, and is
  removed from the documentation. It will be removed entirely in 1.8.0 — use
  `part="…"`.

Everything else from 1.7.6 is retained: the computed-property registration fix,
the `xinValue`/`xinPath`-on-`XinProps` fix (tosijs#19), the `Tosi*` blueprint
types, and the documentation overhaul.

## [1.7.6] - 2026-07-27

### Fixed

- **Light-DOM `parts` no longer reaches into nested components.** For a light-DOM
  component, `this.parts.foo` resolved via an unscoped `querySelector('[part="foo"]')`,
  so a component containing a nested instance (of itself or any component sharing
  `part` names) could get the **nested** component's element instead of its own
  (first pre-order match wins). Part resolution now stops at nested custom-element
  boundaries — a component's parts are the `[part]`/`data-ref` elements between its
  host and any nested custom element. Shadow-DOM components were already correctly
  scoped by the shadow boundary. (tosijs#20)
- **Registering an object with a computed (getter) property no longer crashes.**
  `tosi({ … })`'s set-trap shallow-unwrap loop rewrote every key, throwing
  `TypeError: Attempted to assign to readonly property` on a getter-only property.
  It now only rewrites writable data properties (and never invokes a getter just to
  register state), so computed properties are legal state: they resolve on read and
  see current dependency values.
- **`xinValue`/`xinPath` restored to `XinProps`.** In 1.7 they were dropped from
  `XinProps` but kept on `BoxedScalarAPI`, so `proxy.someObject.xinValue` failed
  `tsc` while `proxy.someScalar.xinValue` didn't — a silent, typecheck-only break
  invisible to `bun build`. Restored in parity (they still work at runtime). Prefer
  `.value` / `.tosi.value` in new code. (tosijs#19)

### Added

- **`TosiBlueprint`, `TosiFactory`, `TosiPackagedComponent`, `TosiComponentSpec`** —
  the canonical blueprint type names, matching the `<tosi-blueprint>` / `<tosi-loader>`
  tags. The `Xin*` spellings remain exported as `@deprecated` type aliases, so
  existing `import { XinBlueprint } from 'tosijs'` keeps compiling. Type-only; no
  runtime change.

### Changed

- Accessor documentation now leads with `.value` / `.tosi.value` (and `.path` /
  `.tosi.path`); the `tosiPath()` / `tosiValue()` functions are presented as the
  programmatic "works on any value / proxy-test" alternative.
- **(dev only)** `editableSources: true` in the site config enables the doc-site's
  in-browser "edit page source" / live-example "save to source" against local files.
- Build host bumped to tosijs-ui 1.7.2 (doc-site builder; not a runtime dependency).

### Documentation

- README sharpened: "Better apps with less code" case, an ecosystem table with
  tosijs at its heart (tosijs-ui, tjs-lang, react-tosijs, ngx-tosijs, tosijs-schema,
  tosijs-product, tosijs-3d), all `xin`-proxy references replaced with `tosi`/`boxed`,
  and the b8rjs → xinjs → tosijs history moved to a dedicated **tosijs history** page.
- New **Angular and tosijs** page (`tosiSignal`, zoneless-first, off-ramp); expanded
  **React and tosijs** page (`useTosi`, `reactWebComponents`).
- Building-Apps note: boxed proxies are minted fresh per access — never key on their
  identity.

## [1.7.5] - 2026-07-23

### Changed

- **The `on<Event>` member-collision warning now suggests a name by intent.**
  When a component defines an `on<Event>`-named member (shadowed by the elements
  factory's event-handler sugar), the warning previously offered only
  `handle<Event>`. It now distinguishes the two real cases: use **`handle<Event>`**
  for a handler function the component invokes (e.g. `handleClick`), or
  **`add<Event>Listener`** for a method that registers listeners for a synthetic
  event the component dispatches (e.g. `addClickListener`). The Component docs
  carry the same guidance. No behavior change — warning text and docs only.

## [1.7.4] - 2026-07-23

### Changed

- **Faster state→DOM dispatch.** The bound-element scans — the global "any state
  changed" observer, the `MutationObserver` that re-discovers inserted elements,
  and the list-binding relative-path refresh — now enumerate with
  `getElementsByClassName` (which gathers from the browser's class-name bucket
  index) instead of `querySelectorAll` (a whole-tree walk). Measured **1.6–2.6×
  faster** in Blink on the global scan, with the gap widening as the DOM grows —
  this is the library's hottest path, so it matters most in exactly the large,
  frequently-updating apps where it was slowest. The result set is identical; the
  scan is still snapshotted to a static array so `toDOM` mutations during dispatch
  can't perturb a live collection.

- **Renamed the data-binding marker class `-xin-data` → `-tosi-data`.** The last
  `xin`-era name in the runtime DOM. **Potentially breaking (unlikely):** if you
  were selecting or styling `.-xin-data` (an undocumented internal), use
  `.-tosi-data` — or better, bind your own class. This marker is required and
  retained (unlike the retired `-xin-event`): data dispatch starts from a *path*
  and must *enumerate* bound elements, which a WeakMap can't do — the class is the
  DOM's queryable index. `getElementsByClassName` is class-only (there is no
  attribute equivalent), which is why the marker stays a class rather than moving
  to a `data-*` attribute.

### Added

- **`BOUND_CLASS` and `BOUND_SELECTOR` are now exported** from the package root.
  They were internal, so any integration referencing the marker had to hardcode
  the literal — which is the *only* reason the rename above is breaking. Import
  the constant (`import { BOUND_CLASS } from 'tosijs'`) and your code follows any
  future rename automatically. Use them to *find* bound elements
  (`document.getElementsByClassName(BOUND_CLASS)`); bind your own class for styling.

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
