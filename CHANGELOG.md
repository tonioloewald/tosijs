# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

## [1.8.3] - 2026-09-02

**The library stops warning its own users about API they never wrote** — and,
found while fixing that, two ways the agent surface published secrets that
`read()` refuses.

### Security

- **`describe()` no longer publishes what `read()` refuses.** `boundValue()`
  redacted on a DOM record's own flag and never consulted the PATH, violating
  the invariant the module states out loud. Two shapes leaked, both in the
  **read-only default posture** and both through `tosi_describe` — the one
  WebMCP tool published in *every* posture, while `tosi_read` sits behind a
  gate precisely because reads are considered too much to publish unasked:
  an element bound to an **ancestor** of a secret serialised the whole subtree,
  and an element bound to the **exact** secret path with a non-value binding
  leaked too (nothing of the value reaches the DOM, so the record's flag is
  false). Pre-existing in 1.8.0–1.8.2.
- **Reading a list no longer hands back the secrets inside it.** Secrets are
  learned from bound controls, and a control in a list template binds through
  one spelling while the redaction walk used another — so `read('rows')`
  returned every secret it contained in cleartext. Every spelling that can name
  a row is now tried: bracket index, dot index, and each registered id-path.
- ⚠️ **Still open, deliberately: [#32](https://github.com/tonioloewald/tosijs/issues/32).**
  A *direct* read spelled by index — `read('list[0].pw')` — still returns
  cleartext where `read('list[id=a1].pw')` redacts. Descending from an ancestor
  is covered; the query side is not. If you expose reads over paths an agent
  can construct, scope them with a manifest.

### Fixed

- **`bind` composes instead of clobbering.** A container can be list-bound
  *and* carry its own binding. Previously one order silently dropped the
  caller's binding and the other **destroyed the entire list**, with no error.
  Fixed at both addresses that fold element props — `create()` and
  `Component.hydrate()` — via one shared helper.
- **A `null` row no longer takes the agent surface down.** `read`, `describe`
  and `changes` all threw on a list containing a null element, and `changes`
  threw inside its coalescing loop, killing every subsequent poll.
- **`elements.div(proxy)` no longer warns.** The most idiomatic call form in
  the library emitted a deprecation warning for a key the caller never wrote.
- **`.tosi.listBinding()` no longer warns**, and its default content no longer
  uses a deprecated key.
- **Deprecation messages you can actually type.** Two told users to write props
  keys that do not exist, and following the `bindEnabled` advice literally
  shipped a **permanently disabled button**. They now branch on whether the
  value is a proxy or a path string, and say SPREAD where a spread is meant.

### Changed

- **`.tosi.listBinding()` returns `{ bind: { value, binding: 'list', options } }`
  instead of `{ bindList: { value, ...options } }`.** Spreading the tuple —
  the supported usage — is unaffected. Code that *inspects* the props
  (`props.bindList.virtual = …`) breaks: `props.bindList` is now `undefined`.
  This repo's own tests did exactly that and had to be rewritten, which is the
  evidence that a consumer plausibly does too.
- The inline `bind` form now forwards `options` to `bind()`'s fourth argument;
  it silently dropped them before, which is why a list binding could not be
  expressed without the deprecated key.
- `ElementProps.bind` accepts a single inline binding or an array.
- Bundle budgets raised ~1 kB across the board for the above.

## [1.8.2] - 2026-09-01

### Changed

- **All 27 `Xin*` type names are now `Tosi*`, with the old spellings kept as
  `@deprecated` type aliases.** The library is tosijs; these names were
  xinjs-era. The blueprint five were renamed in 1.7.6 — the other **22**
  (`XinStyleRule`, `XinStyleSheet`, `XinStyleMap`, `XinObject`, `XinBinding`,
  `XinProxy`, `XinProps`, `XinEventHandler`, …) were simply missed, and
  untracked, for four releases. They were in the *documented* API: the
  component reference told you to type a stylesheet as `XinStyleSheet`.

  **Nothing breaks.** The aliases are type-only — no runtime cost, no bundle
  cost, and old and new spellings are assignment-compatible in both directions
  (verified by compiling a consumer against both). They are **scheduled for
  removal in 2.0**, stated in the alias block itself so this does not drift a
  fifth time.

- The `<xin-slot>` runtime tombstone is unaffected and still warns — that is
  markup, not a type, and it keeps misplaced content composing until renamed.

### Fixed

- **The DOM-free gate no longer misdiagnoses an old `node` as a broken bundle.**
  Both copies spawned whatever `node` was on PATH and blamed the *artifact* for
  any non-zero exit, so on a machine whose default node predates modern ESM it
  reported `dist/state.js requires a DOM` — confident, specific and wrong,
  sending you to debug a shipped bundle instead of your toolchain. They now
  distinguish cannot-run from found-a-problem: below node 20 they skip **out
  loud**, saying the artifact is UNVERIFIED; at 20+ the gate is unchanged and
  still fails closed. Found by running the new shared `release-doctor` Tier 0
  script against tosijs.

## [1.8.1] - 2026-08-30

**The attribute API everyone uses was invisible to agents.** A component
declaring `static initAttributes` — the terse form nearly every component uses,
and until now the only one the component reference documented — appeared in
`describe()` with **no attribute description at all**. The identical component
declaring `contract.attributes` was fully described. So 1.8.0's headline
feature systematically under-described real applications, and the population it
under-described was the majority one.

> **🚧 THE CONTRACT API IS IN FLUX.** `ComponentMap` / `static contract` /
> `expose.contract` will change shape **without a deprecation cycle** while the
> layering questions settle (tosijs#29, #30) — how `contract.attributes` and
> `initAttributes` divide the work, and whether an integrator's overlay may
> *embellish* a component's own declaration rather than replace it wholesale.
> Changes will land in patch and minor releases and will be called out here.
>
> **Nothing else in `Component` is in flux.** `initAttributes`, `content`,
> `parts`, form association and the rest are stable — and if you want stability
> today, `initAttributes` is the answer: it is stable, terser, and as of this
> release described to agents identically.

### Fixed

- **`describe()` now reports a component's attributes however they were
  declared** (#29). Types are inferred exactly as the attribute machinery
  infers them — from the default, including through a `Component.computed()`
  marker, whose `shape` is the type example. A `contract.attributes` entry
  still wins per key, being the richer statement.

  Deliberately gated on an element already being *wired*, and it never makes
  one wired: declaration remains the announce signal. Every component has
  attributes, so letting them announce would flood the map with every custom
  element on the page.

### Changed

- **`initAttributes` and `contract.attributes` now COMPOSE instead of throwing**
  (#29). `initAttributes` **declares** (name, default, inferred type);
  `contract.attributes` **enriches** (`enum`, `const`, and whatever a
  registered schema engine adds). Declaring both is the intended shape.

  The old rule was wrong twice over: the same two declarations *split across a
  prototype chain* already merged cleanly — identical intent, opposite
  outcomes, decided only by where you wrote them — and "one source of truth" is
  a property of an attribute **name**, not of a class, so two disjoint
  declarations threw despite creating no ambiguity.

  A contract entry **may now omit `default`** when `initAttributes` supplies
  one, so constraining a single attribute costs one line rather than a rewrite.
  With no default anywhere it still throws, naming the attribute.

- **The "ideally attributes live in the contract" nudge is gone.** Its only
  real force was *"so one declaration feeds … the agents"* — true only because
  `initAttributes` never reached `describe()`. It does now.

### Documentation

- **`static contract` is documented in the component reference** (#28), which
  previously mentioned `initAttributes` nine times and contracts zero times
  while contracts were documented thoroughly in `agent-surface.md` — a file
  nobody opens to build a component. The two APIs were taught in disjoint
  documents with the relationship stated nowhere, which is how an agent
  building a component discovered the old throw by hitting it. The
  `initAttributes` section now forward-references the contract, so neither can
  be read alone and mistaken for the whole story. `CLAUDE.md` gets the
  conventions bullet four consecutive pre-release reviews asked for.

### Build host

- `tosijs-ui` 1.9.4 → **1.12.0** and the duplicated `watchPaths` array deleted
  (tosijs-ui#49 is fixed: `resolveWatchPaths()` folds `docPaths` in).
- `tjs-lang` 0.10.1 → **0.13.6**. 0.13.0–0.13.5 were unusable — `convert`
  stripped `new` from every class declared in the module being converted, so
  the output threw at *import* time on a static field initialiser (tjs-lang#37,
  fixed upstream the day it was filed). Caught by the published-bundle smoke
  gate and by nothing else: all unit tests passed under the broken toolchain,
  because they exercise `src/` and the bug was in the emitter.

  Build-host only — no consumer-facing bundle changed as a result.

## [1.8.0] - 2026-08-25

**One source of truth for state, UI, and AI.** An app's affordances — what
exists, what it's bound to, what it does — have always been recorded by tosijs
in order to *run* the app. 1.8.0 lets you ask for them.

The three release candidates below carry the detail; this is what changed since
**1.7.9**, and what to know before upgrading.

> **Licence: tosijs is Apache-2.0 as of 1.8.0** (BSD-3-Clause through 1.7.x).
> It adds an explicit patent grant and a patent-retaliation clause, cannot be
> combined with **GPLv2-only** code (GPLv3+ is fine), and — the part semver
> cannot express — §4(d) asks **redistributors** to carry the [`NOTICE`](./NOTICE)
> text. Hosting an app you built with it is unaffected.

> **This release deviates from semver, and says so.** A minor is supposed to be
> additive and most of this is. But it also removes `data-ref` (the only
> pre-announced removal), removes `<xin-slot>` markup handling, reduces
> `<xin-blueprint>`/`<xin-loader>` to warning tombstones, and flips two
> behaviours — `on<Event>` member precedence, and what a type-contradicting
> attribute write does — neither of which carried a prior deprecation warning.
> A consumer on `^1.7.9` receives all of it on a routine update. The deprecated
> *exports* survive as working aliases naming 2.0, so nothing breaks at import;
> the markup path and the two flips are the real exposure.

> **Size, measured rather than claimed.** The agent surface is opt-in and shakes
> away if you never import it — **6.7 kB gzipped** in a real app bundle, 10.6 kB
> with the schematic renderer and the accessibility audit. But 1.8.0 is **not**
> size-neutral: an identical consumer app touching no agent API measured
> **+2.9 kB (+13.7%) against 1.7.9**, because the contract seam, the
> path-segment guard and the binding bookkeeping sit on the ordinary path. If
> that matters more than the features, `tosijs/core` is the smaller door.

### The headline

- **The agent surface** — `enableAgentInterface()` gives
  `describe`/`read`/`write`/`observe`/`call`/`changes`/`when`/`log` over the
  wiring tosijs already records. **Read-only by default**; a manifest scopes
  what may be *seen*, and `write: true` is a separate grant.
  `agent.version` reports shape and capabilities so consumers can ask instead
  of duck-typing.
- **WebMCP auto-registration** where the browser provides a host, with the tool
  set *generated* from the map rather than hand-written.
- **Contracts at three granularities** — app (`expose.contract`), component
  (`static contract`), and inline (`contract` on an element) — executable as
  tests via `exerciseContract()` / `exerciseComponent()`.
- **An accessibility audit over the same map** (`auditAccessibility`), because
  the records that serve an agent are the records that catch anonymous
  affordances, unnameable actions, contrast and target-size failures.
- **`tosijs/core`** (slim) and **`tosijs/state`** (DOM-free, imports under bare
  node) as new entry points.
- **The scaffolder**: `bunx tosijs create app|component|blueprint`.
- **Computed attributes**: `Component.computed('')` declares an attribute your
  class implements with an ordinary `get`/`set`; tosijs wraps the setter so a
  change always re-renders, and markup reaches it.

### Closed by this release

tosijs **#18** (DOM-free entry), **#22** (`on<Event>` shadowing component
methods), **#23** (agent version/capability marker), **#24** (wrong-typed
attribute writes silently discarded), **#27** (computed/derived attributes).

**Known, still open:** **#26** — an unknown *key* passed to `elementCreator` is
still absorbed by `ElementProps`' index signature and silently dropped. Note the
boundary, since 1.8.0 fixed its sibling: a wrong-*type* write to a *declared*
prop is applied and reported (#24); an unknown *key* is still dropped (#26).
Also open: **#17** (proxy-identity seam — `src/xin.ts` is unchanged in 1.8.0, so
fresh-proxy-per-access still holds), **#16** (semantic-parent accessor),
**#9** (virtual-list resize).

### A note on how this was built

Four adversarial pre-release reviews ran against this release. They found — and
this is the part worth publishing — a **secret-redaction regression in rc.2**
(reverted in rc.3, rc.2 is deprecated on npm), a caching optimisation that
corrupted `HTMLElement.prototype` page-wide, and a hardened build gate that
silently disabled the browser test lane. Every one passed the local test suite.
If you are relying on the agent surface's redaction guarantees, prefer 1.8.0
over any rc.

## [1.8.0-rc.3] - 2026-08-25

**Supersedes 1.8.0-rc.2, which is deprecated.** rc.2 shipped a secret-redaction
regression in the agent surface; if you installed it, upgrade.

### Fixed — security

- **`agent.read()` could return values it had promised to redact.** rc.2 added
  a cache to the secret-path scan, keyed on a binding-generation counter. The
  counter was bumped from three call sites, two of them inside a
  `dataBindings == null` guard — so only an element's **first** binding bumped
  it, and a control that *became* secret afterwards was never re-learned. Five
  reachable paths returned cleartext where rc.1 returned `⟨secret⟩`:

  1. `type` flipped to `password` after a read (a show/hide toggle)
  2. `data-tosi-secret` added later — the author's explicit opt-in
  3. `autocomplete="cc-…"` set when a payment method is chosen
  4. a **second** `bind()` on an already-mounted element — permanent, because
     no DOM mutation follows to rescue it
  5. same-task append after a detached bind, and `cloneWithBindings()`

  Reachable under every posture, since `read`/`changes`/`when` share the path,
  and `tosi_read` publishes it to a WebMCP host.

  **The cache is reverted, not repaired.** Three of the five are *attribute*
  changes on an element that never re-binds, so no binding-shaped signal can
  observe them; correctness would need a MutationObserver on
  `type`/`autocomplete`/`data-tosi-secret` plus a bump at every binding
  mutation — at which point the ~24% saving is gone. The scan runs on every
  read again, over a selector narrow enough that this costs about 1.3µs.

  No disclosure is known to have occurred: the affected build was tagged `rc`,
  had no published dependents, and this project's own site binds no secret
  controls.

### Fixed

- **The `contractviolation` latch was one-way.** Bad value → event; valid value
  → nothing; the *same* bad value again → silence, on both the event and the
  console. An app showing a validation banner could never re-show it after the
  user corrected and re-broke the field. The latch now clears on recovery.
- **`detail.repeated` is removed.** rc.2's notes advertised it as the way to
  tell repeats apart; it was hard-coded `false` at the only dispatch site and
  could never have distinguished anything.
- **tosijs#24 now covers every declared attribute type.** rc.2 fixed only
  string-declared attributes while the error message and the release notes
  claimed otherwise: `el.count = false` on a number-declared attribute read
  back `null`, and `el.flag = 'off'` on a boolean-declared one read back
  `true` — a value that inverts its own meaning. Warn-once per tag+attribute,
  so instances 2..N were silent.

### Added

- **Computed attributes.** `Component.computed('')` (or `false`) in
  `initAttributes` declares an attribute the class implements itself with an
  ordinary `get`/`set`. tosijs wraps the setter so a change always re-renders —
  you never call `queueRender()` — and the name joins `observedAttributes`, so
  markup changes re-render too. The argument is a *shape*, not a default:
  markup delivers strings and presence, so those are the two. A getter with no
  setter is a read-only derived attribute.

### Internal

- The internal-link gate had a blind spot over `src/docs/**` — including the
  file whose broken link rc.2 fixed — because it expanded `docPaths`
  differently from the site. It now expands them the same way.
- `bun start` no longer rewrites tracked `README.md`; both generators that
  write into tracked sources share one guard.
- Coverage for `contract-check`'s fail-open warning, and the record correction
  that the `tosijs-ui@1.9.4` pin rested on a peer constraint every 1.9.x
  already carries.

## [1.8.0-rc.2] - 2026-08-24

No API changes from rc.1 — this is the fix-and-gate pass over it. One
behaviour change worth reading if you listened to `contractviolation`, and one
documented claim that turned out to be false.

### Fixed

- **`contractviolation` fired on every binding pass, forever.** The
  `console.error` beside it is warn-once; the event was not. For an object- or
  array-valued contract the upstream identity guard never matches — the proxy
  returns a fresh object per access — so a persistently violating contract
  dispatched a bubbling event on *every* pass for the life of the page.
  Measured with the fix bypassed: 6 events over 6 passes, still climbing.
  **Now once per element per distinct reason.** That changes what a listener
  counts — distinct violations rather than binding-dispatch frequency — which
  is the number you wanted. The latch clears the moment a VALID value
  arrives, so the event fires on entering a bad state and again on re-entering
  it after recovery — which is what a validation banner needs. The event is
  also now documented and tested, both of which it shipped without.
- **A type-contradicting attribute write now reads back as written**
  (completes tosijs#24). rc.1 applied and reported the write instead of
  silently discarding it, but the setter reflects to the attribute as a
  *string* and the getter prefers the attribute — so `el.mode = false` on a
  string-declared attribute read back the truthy string `"false"`, which is
  precisely the bug the error message says it does not have. An external
  `setAttribute` still wins, and a correctly-typed write clears the override.
- **A node bound while detached now hydrates when inserted as the root.**
  `getElementsByClassName` is descendants-only, so an element that was itself
  bound was skipped. Affects cached dialogs and re-attached views.
- **`settings.quiet` means something.** It promised to silence "advisory
  warnings and friends" while being honoured at 2 of ~20 sites. Deprecations
  and the `on<Event>` collision advice now honour it; everything that reports
  something *wrong* deliberately does not, and the docs now enumerate both
  lists.
- Three internal links that 404 on the deployed site (case-sensitive host,
  case-insensitive filesystem — they looked fine locally). One was from the
  README, which is the site's home page.

### Changed

- **The tarball is 5.48 MB → 3.81 MB unpacked** (packed 1.54 → 1.17 MB): the
  source maps for `module.debug.js` and `module.safe.js` are no longer
  published, since both bundles are EXPERIMENTAL and currently inert. The
  other five keep theirs.

### Documentation

- **A size claim was false, not merely stale.** The README said this release
  "tree-shakes to about 1.7.x's size when you don't use it". Measured: an
  identical consumer app importing no agent API went **20,995 → 23,862 bytes
  gzipped, +2.9 kB, +13.7%**. The agent surface genuinely does shake away
  (6.7 kB), but the contract seam, the path-segment guard and the binding
  bookkeeping sit on the ordinary path. The README now says so and points
  minimalists at `tosijs/core`. Size figures are now **generated** by the
  build rather than hand-maintained in four places.

### Internal — gates and de-duplication

Three gates were reporting green without checking anything: a bundle test that
skipped via a silent `return` (during `bun run build`, always), a gzip-budget
"test" that was three string assertions against the build script's source, and
a browser-tier gate asserting only that *something* ran. All three now fail
when they should — each verified by making it fail.

The published-artifact list existed five times and had drifted (`main.js` was
built, kept and budgeted but never executed); it is now one declaration in
`bin/bundles.ts` that every gate derives from. Same treatment for the
CDN-entry export list, the curation predicate, and the own-`static contract`
lookup that was copy-pasted at six sites.

One performance fix: `agent.write()` no longer scans the document when no
inline contract exists — **roughly 6× faster** on a page with 2,000 bound
elements.

> **On that number.** It is a one-off measurement under happy-dom in a shared
> test process, not a benchmark: there is no benchmark harness in this repo, so
> nothing defends it against drift and it is a ratio rather than a wall-clock
> promise. Your numbers will differ. It is quoted because the shape of the win
> (skip a whole-document scan when nothing can match) is the part that
> generalises.

The second "fix" in this pair — caching the secret-path scan — **was reverted**
before release. It was a security regression: see the 1.8.0-rc.3 entry.

## [1.8.0-rc.1] - 2026-08-17

> Upgrading from 1.7.x? See **[Migration.md](./Migration.md)** — it lists the
> removals, the two behaviour changes that shipped without a prior
> deprecation warning, and the Apache-2.0 relicense.

> **This release deviates from semver, and it should say so.** A minor version
> is supposed to be additive, and most of 1.8.0 is. But it also **removes**
> `data-ref` (the only removal that was pre-announced with a version),
> **removes** `<xin-slot>` markup handling, reduces `<xin-blueprint>` and
> `<xin-loader>` to inert warning tombstones, and **flips two behaviours** —
> `on<Event>` member precedence, and what happens on a type-contradicting
> attribute write — neither of which carried a prior deprecation warning. A
> consumer on `^1.7.9` receives all of it on a routine update. The deprecated
> *exports* (`xinSlot`, `blueprint`, `blueprintLoader`) were restored as
> working aliases naming 2.0, so nothing breaks at import; the markup path and
> the two behaviour flips are the real exposure. We judged one honest note
> better than a 2.0 nobody is ready for — but you are entitled to know which
> promise was bent.

**One source of truth for state, UI, and AI.** An app's affordances — what
exists, what it's bound to, what it does — have always been recorded by
tosijs in order to _run_ the app. 1.8.0 lets you ask for them.

### Added — the agent surface

> **EXPERIMENTAL.** The agent surface, schematic renderer, audit and
> contract harnesses are new public API. What 1.x promises: the *record
> shape* is a versioned contract (`agent.version.surface` plus an
> enumerable capability list), and we bump it rather than change the shape
> silently. Names and options may still move in a minor.


- **`enableAgentInterface()`** — one call exposes `describe` / `read` /
  `write` / `observe` / `call` / `changes(cursor)` / `when(path, predicate)`
  / `log`, installs `globalThis.tosiAgent`, and (where the browser provides
  `document.modelContext`) **auto-registers a generated WebMCP tool set** —
  verified registering _and executing_ in Chrome Canary 153 (as of
  2026-08<!-- as-of: 2026-08-21 | which Chrome verified WebMCP end-to-end -->).
  Nothing new is
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
  `aria-describedby`/`aria-description`, `disabled`/`required` and
  `aria-hidden` flow _into_ the map (the agent reads the page the way
  assistive tech does). Going the other way, a component's contract
  materializes into the **matching** slots: `description` →
  `aria-description`, `role` → `role`. It deliberately does **not** touch
  `aria-label` — a description is not a name, and the name belongs to
  content and the author (an earlier rc did stamp it, which made components
  announce developer prose instead of their own text). Describe a component
  for agents and screen-reader users inherit the description; declare its
  `role` and the accessibility audit's `missing-role` finding is fixed from
  the same declaration.
- **`agent.version`** — `{ surface, tosijs, capabilities[] }` (tosijs#23):
  ask what a surface _is_ instead of duck-typing it. Rides `describe()`
  output, and exposed as the `tosi_surface` WebMCP tool.
- **`auditAccessibility(map)`** — anonymous affordances, unnameable actions,
  missing roles, WCAG contrast, target size, placeholder-as-label. Pure over
  the description; `auditFlags()` turns findings into schematic flags so
  they can be drawn. It skips _loudly_ rather than passing silently whenever
  it cannot measure — computed styles weren't requested, or a background is
  transparent so the effective colour is unknown. Known divergence:
  `target-size` is currently decided twice (here and in the vendored
  renderer) and the two disagree on named icon-links —
  [tosijs-floorplan#4](https://github.com/tonioloewald/tosijs-floorplan/issues/4).

### Security posture — safe by default

Three modes, and the safest is the one you get for free:

| call                                                             | what it grants                                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enableAgentInterface()`                                         | **read-only introspection** — `describe`/`read`/`observe`/`changes`/`when`/`log` over everything; `write()` and `call()` refuse and say how to enable them |
| `enableAgentInterface({ expose: { roots, actions, contract } })` | the **production shape**: an allowlist — scoped **reads** and declared calls, nothing outside it visible                                                    |
| `enableAgentInterface({ expose: { roots, write: true } })`       | the same allowlist, plus permission to **change** what it scopes                                                                                            |
| `enableAgentInterface({ expose: 'all' })`                        | everything read/write/call, deliberately, with a warning on every transition into it                                                                       |

**A manifest scopes sight, not reach.** `roots` says what may be seen;
`write: true` is a separate grant to change it. Without that split the only
two reachable postures were unscoped-read and scoped-read-_plus-write_, so
the safest-sounding option granted the most, and "scoped reads, no writes" —
what a production surface usually wants — was inexpressible.
`describe().writable` reports which you have. Declared `actions` stay
callable either way, and a write can no longer land on (or above, or under)
a declared action, so `write('app', {})` can't wipe the action namespace.

Provenance arrows (`⟷`, `⟵`) are **structure, not content**: values and
harvested page text that contain them are neutralized to `<->` / `<-`, so a
string can no longer forge itself a live binding — which the schematic drew
as a real affordance and the audit reported on. Parsers should split on the
**last** occurrence. Secrets are a property of the **path**, not of a DOM
record: a path bound to a password (or hidden, or `autocomplete="cc-*"`, or
`data-tosi-secret`) control redacts in `read`, `changes`, `when` and inside
any ancestor read. And `__proto__`/`constructor`/`prototype` are refused as
path segments at the sink, which covers `agent.write()`, `share()` and
`sync()` at once.

`tosi_write` now requires **explicit `allowWrites: true`** — being in
introspection mode is no longer treated as consent to publish an
unvalidated write endpoint to the browser's tool registry. And
`bunx tosijs create app` scaffolds the allowlist form with a commented line
showing how to widen it while developing.

### Added — contracts, at three granularities

- **App level**: `expose.contract = { check, describe }` — a zero-dependency
  seam (the core knows a _check_, not a schema language). Sub-path writes
  are **routed, not bypassed**: a write under a contracted root is judged as
  the whole root it would produce. Refusals throw the _reason_ and land in
  the audit log. The blessed adapter now ships upstream as
  tosijs-schema's `agentContract()`.
- **Component level**: `static contract` (a `ComponentMap`) unifies contract
  - description + parts map + test fixture. `Component<typeof contract>`
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
  resolves to the _same file_ as `tosijs`: a separately-bundled agent
  surface carried its own copy of the state registry and described an empty
  app, so there is exactly one runtime copy, always. ESM consumers who never
  import it tree-shake it away.
- **The `<script>`/CDN build omits the agent surface** (~26 KB gz) — an IIFE
  cannot tree-shake, so it must not carry an opt-in feature. Load the ES
  module build if you want the agent surface from a script tag.
- **`tosijs/core`** — the library minus the blueprint loader, `share`/`sync`,
  `hotReload` and the agent surface (~24 KB gz — _smaller than 1.7.9's
  entire library_). Opt-in, because blueprints hydrate from _markup_:
  shaking their registration would fail silently. Slim core warns in dev if
  the page holds blueprint elements it can't hydrate.
- **`tosijs/state`** — the **DOM-free** state layer (~16 KB gz), importable
  in plain Node with no shim. Closes tosijs#18.
- Per-entry **gzip budgets** are asserted by the test suite, so the next
  unplanned kilobyte fails a build instead of shipping.

### Changed

- **Relicensed BSD-3-Clause → Apache-2.0**, adding an explicit patent grant
  and a patent-retaliation clause. (Apache-2.0 is incompatible with
  GPLv2-_only_ projects; GPLv3+ is fine.)
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
  to remove the attribute so the _default_ read back — a feature explicitly
  turned off stayed on. The write now lands as given and reports once.
- Observers no longer require a DOM: the global binding dispatch returns
  early when there is no `document` (the state layer's precondition).

### Deprecated (still working; removed in 2.0)

- **`xinSlot()`, `blueprint()`, `blueprintLoader()`** — these were
  deprecated in 1.7 _without_ a named removal version, so they keep working
  through 1.x and now warn naming **2.0**. They create the modern elements
  (`<tosi-slot>`, `<tosi-blueprint>`, `<tosi-loader>`).

### Removed

- **`data-ref`** — the one deprecation whose 1.7 warning explicitly named
  1.8.0. Use `part="…"` (bare CSS-selector refs still work).
- **`<xin-slot>`** — the element. `xinSlot()` still works (see Deprecated).
- **`<xin-blueprint>` and `<xin-loader>` no longer function**, but the tags
  remain registered for one more cycle as **tombstones**: they render
  nothing and log exactly what to rename. An unregistered custom element is
  inert — no hydration, no error, no output — and a page using blueprint
  _markup_ has no import statement that could fail, so removing the
  registration outright would have been this release's only silent
  breakage. They go for real in 2.0.

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
  _removed from the tree and not replaced_ (e.g. `<tosi-segmented>`'s optional
  `custom` input: a structural rebuild does `options.textContent = ''` and only
  conditionally re-appends it), the re-resolution found nothing and **threw**
  where 1.7.5 had leniently returned the detached node. That throw fired inside
  change handlers that destructure `this.parts` unconditionally, killing the
  handler _before_ it committed `this.value` — the "stale value, correct DOM"
  symptom on Firefox/WebKit. The cache now returns the previously-resolved
  (detached) node when no replacement exists; self-healing still wins when a
  replacement _is_ present; the throw is reserved for refs that never resolved
  at all. **1.7.7 is deprecated on npm.**
  - Verified against tosijs-ui's real `<tosi-segmented>` Playwright lane:
    Firefox went from 2/2 failing to green; WebKit 4/4; Chromium green.
  - New interaction coverage: unit tests for the detach-then-access pattern and
    the full click → change → `this.value`-commit round-trip, plus a real-browser
    Playwright test (`tests/value-commit.pw.ts`) running the same round-trip in
    every engine the lane covers.

## [1.7.7] - 2026-07-27

### Fixed

- **`this.parts.foo` now resolves your _own_ part — by ownership, not structure
  (tosijs#20).** A component's `[part]` elements are captured from its content
  when it hydrates, _before_ the content is inserted and before any nested
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
  retained (unlike the retired `-xin-event`): data dispatch starts from a _path_
  and must _enumerate_ bound elements, which a WeakMap can't do — the class is the
  DOM's queryable index. `getElementsByClassName` is class-only (there is no
  attribute equivalent), which is why the marker stays a class rather than moving
  to a `data-*` attribute.

### Added

- **`BOUND_CLASS` and `BOUND_SELECTOR` are now exported** from the package root.
  They were internal, so any integration referencing the marker had to hardcode
  the literal — which is the _only_ reason the rename above is breaking. Import
  the constant (`import { BOUND_CLASS } from 'tosijs'`) and your code follows any
  future rename automatically. Use them to _find_ bound elements
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
  class instead. The `-xin-data` marker on _data_-bound elements is retained — a
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
  ```

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
  nonexistent id no longer removes the _first_ item (`splice(undefined, 1)` coerces to
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
- **A throwing observer _test_ function no longer aborts the whole dispatch batch.**
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
  property between `createElement` and a _synchronous_ `append` was queued but
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
