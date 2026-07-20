# todo

## Post-1.7.0 follow-ups (from the 2026-07-20 pre-release review — GO_WITH_FOLLOWUPS)

Review verdict: 0 blockers. Confirmed items already actioned: share() H-7 test added;
`test:browser` gated in CLAUDE.md Releasing/Session-Completion; issues #14/#15 closed
(enforced since 1.6.7/1.6.8); UPSTREAM.md created; Migration.md 1.7 section added; stale
`package-lock.json` removed. Remaining (all non-blocking; **(unverified)** = sanity-check
before acting):

**Coverage (minor):**
- [ ] Date-family control coverage — `getValue`/`setValue` round-trips for
  `datetime-local`/`month`/`week`/time-from-`Date`, and a date-input-bound-to-numeric-epoch
  `handleChange` test (guards UTC-vs-local field selection). (`dom.ts:48`)
- [ ] Headless assertion for the css theme-recompute fix — after changing a themed proxy
  var, assert the computed-colors `<style>` `textContent` regenerated (guard in `bun test`,
  not only the in-browser fence). (`css.ts`) *(unverified)*

**DRY / cleanup (nit):**
- [ ] Extract one `loadBlueprintElements(elements, loaderTag)` for the copy-pasted
  allSettled+report+allLoaded block (`blueprint-loader.ts:314/368`), and one
  `configureTjs({throwTypeErrors, logTypeErrors})` shared by both `configure-tjs-*.ts`.
- [ ] `DATEISH` in `dom.ts` is a dead export — delete it, or make it the single source of
  truth (`if (DATEISH.includes(type))`) so switch labels can't drift. (`dom.ts:85`)
- [ ] Centralize color recognition — an `isCssColor`/`tryParseColor` on `Color` so
  `invertLuminance`'s regex and `Color.fromCss` don't drift (regex rejects 4/8-digit hex +
  system colors that fromCss accepts). (`css.ts`)
- [ ] Reword the `list-binding.ts` "table mode" comment — the null-anchor branch is the
  SVG/MathML (namespaced) case; HTML-table list containers are unsupported. (`:1580`)

**Efficiency micro-guards (nit, optional):** gate the shadow-content-binding diagnostic
behind `settings.debug` or record tagName regardless of query outcome (`component.ts:1584`);
short-circuit the `seenIds` build once `warnedDuplicateListId` (`list-binding.ts:1484`);
only call `composedPath()` when `event.composed` (`bind.ts`).

**Ecosystem / upstream:**
- [ ] Give #9/#16/#17/#18 an explicit STILL-OPEN disposition — 1.7's list work is
  nested-list + reorder, NOT #9's resize/hiddenProp; #16/#18 untouched. Don't let list
  fixes imply #9 is done.
- [ ] File the **tjs-lang post-eval reconfiguration seam** issue (recorded in UPSTREAM.md as
  to-file) — the `configure-tjs-*` import-order workaround compensates for it; live footgun
  when 2.0 enables enforcement.
- [ ] Add #17's integrator note to README/Building-Apps: boxed proxies are minted per
  access — never key change-detection/memo on proxy identity; `.map()` yields raw items.
- [ ] (optional) File tosijs-ui issue: site builder should strip its `.tjs`/`bun-plugin`/
  `*.tsbuildinfo` staging from `dist` after bundling so consumers don't need `files`
  negations.

**Practices / CLAUDE.md:**
- [ ] Update CLAUDE.md Build System debug/safe description (~L38): the bundles are
  EXPERIMENTAL and inert (no runtime checks fire yet); note the `configure-tjs-*`
  import-first ESM-order fix and the "config must evaluate before the library captures
  `__tjs`" gotcha. Consider a practices `tjs-lang.md` KB entry for that bug class.
- [ ] Practices repo (`tosijs-coding-practices`): add "tosijs" to the haltija-port-squatting
  "seen in" note (review.md ~L448), reference haltija#1 as the in-flight isolation fix.

## 1.7 — the correctness release (planned)

Scope: fix all serious findings from the 2026-07-17 whole-codebase review (five parallel
adversarial reviews, each finding independently re-verified by executing repros against the
source). ~45 distinct defects; **every one passes the current 622-test suite** — the suite
tests happy paths. Ship as a **minor**, not 1.6.x patches, because several fixes are
observable behavior changes (shadow-DOM bindings coming alive, nested lists working at all,
number inputs writing numbers, exact observer matching) — semver-honest patch material they
are not. Contingency: if the id-path clobber (SB-3) bites anyone before 1.7 lands,
cherry-pick that one fix as 1.6.10.

Except where marked, everything below is in published 1.6.9. Line numbers are main's where
verified on main (`by-path.ts`, `xin.ts:1331`); others were confirmed on `tosijs-2.0`, whose
copies of `component.ts`/`list-binding.ts`/`path-listener.ts` are identical and whose
`bind.ts` differs only by +5 lines (checkPath hook).

### Ship-blockers

Progress: **ALL ship-blockers and the entire High tier (H-1…H-12) are fixed on main**
(2026-07-17/18, each with regression tests verified failing against the prior code where
distinguishable; suite 624 green). SB-3/SB-4/H-5 shipped in **v1.6.10**; everything else
lands in 1.7. SB-1 resolved as design-boundary (warnings + composedPath events + the
custom-input docs doctrine). H-4 decided (experimental tjs-built subpath bundles,
eval-order fixed, tjs-lang 0.10.1). H-6 shipped with its deepClone-Date prerequisite.

✅ **Browser-lane checks DONE** (2026-07-18): SB-2c (nested-list `<template>` cloning) and
on()-in-shadow origin resolution now have in-browser regression coverage as doc `test`
fences (bind.ts on() docs, list-binding.ts nested-list section), run via haltija through
`bun run test:browser` (wired as `--test` in bin/site.ts). Verified locally: 3 passed,
exit 0. This lane is reusable for any future happy-dom-blind behavior — just add a
`test` fence. Notes: H-10's observer-root-match change is a contract-alignment (deep
writes already touch the root, so saves happened either way — not a reproducible bug);
H-11's retry needed a `setModuleLoader` test seam because dynamic import() is unmockable.

**The 1.7 slate is code-complete and browser-verified.** Remaining before tagging: the
medium/minor backlog triage (fix-where-cheap), the runnable shadow value-widget doc
example, and the release mechanics (changelog with the behavior-change callouts,
tosijs-ui verification against a packed 1.7, version bump, build, tag, publish, then
rebase tosijs-2.0 onto v1.7.0).

Rebase policy (2026-07-17): `tosijs-2.0` is deliberately NOT rebased per-patch — one
rebase after 1.7 finalizes. If 2.0 work resumes earlier, hand-port only the by-path
fixes into `by-path.tjs` first (data corruption; the monadic-write machinery sits on
that lookup).

- **SB-1 — RECLASSIFIED (2026-07-17): not a bug, a documented design boundary that fails
  silently.** Binding inside shadow DOM is documented as unsupported (`component.ts:106`,
  `:226`). **The semantic model (decided 2026-07-17): a shadow-DOM component is bound
  like an `<input>`/`<textarea>` — its `value` is the binding surface.** Bind the
  component itself with `bindings.value`; setting `value` queues `render()` and emits
  `change` automatically; `render()` reflects value into the shadow DOM; internal
  representation is the implementer's business. Bindings do not compose *through* a
  shadow tree (nested widgets are wired manually in `render()`) — a shadow component is
  materially different from a light-DOM component. Docs and warning text teach this
  model. (This is deliberate, original design — light-DOM-first with `tosi-slot`
  composition; don't re-litigate it against shadow-DOM-mandatory conventions.) The review's
  registry-of-shadow-roots sketch is REJECTED: per-root MutationObserver + per-root
  querySelectorAll decays exactly in the stress case that matters (a table of custom input
  widgets — N shadow roots each taxing every dispatch). Deliverables instead:
  1. ✅ **Warn at the point of misuse** — `bind()`/`on()` on an element inside a shadow
     root warns once per session, pointing at the documented pattern. The silent brick was
     the only genuinely broken part.
  2. ✅ **`on()` (and fromDOM change/input handling) works in open shadow roots via
     `composedPath()[0]`** — approved and landed 2026-07-17. Delegation also hops shadow
     boundaries upward (a click inside a shadow widget reaches light-DOM ancestors'
     handlers). O(1) per event, no registry, closed roots stay closed. Changelog callout:
     previously-dead handlers start firing. ⚠️ Browser-lane: happy-dom does NOT retarget
     composed events, so the retargeting half (composedPath vs event.target) is pinned
     only by the boundary-hop test — verify origin resolution in a real browser.
  3. **Path-indexed bind dispatch: WITHDRAWN — tried before, rejected again (2026-07-17).**
     Recorded so it stays dead: virtual list bindings keep the DOM at O(visible) by
     recycling elements and *reassigning their binding paths in place* every scroll frame
     (`updateRelativeBindings` rewrites `binding.path`), so any path-keyed index turns
     scroll into per-element index churn on the exact hot path virtual scrolling keeps
     flat; and a leak-free path→element map is genuinely hard (element churn; strong refs
     leak subtrees, WeakRefs leak key entries). The current DOM-as-registry design is
     leak-free by construction, retargets recycled elements in O(1), and its
     querySelectorAll scan is bounded *because* virtual lists cap live DOM size — the
     architecture and virtual lists are co-designed. The review's "O(paths × all bound
     elements)" efficiency finding should be read with that bound in mind. The only
     surviving bind-side shadow idea is an explicit **opt-in** per-root dispatch
     registration (developer owns the per-root query cost; nothing automatic) — parked,
     not planned.
- **SB-2: nested list bindings broken three ways.** (a) `list-binding.ts:1036` —
  `updateRelativeBindings` calls `toDOM` without the options argument, so a nested list's
  `idPath`/`virtual`/filter are discarded and the cached instance can never be repaired;
  pass the stored options through. (b) `xin.ts` `extendPath` double-brackets an
  already-bracketed segment (`list[id=x]` → `list[[id=x]]`) in the compound-path get branch,
  so all relative bindings under a nested list resolve to malformed paths; make extendPath
  idempotent for bracketed segments. (c) `metadata.ts:250-276` — `cloneWithBindings` on a
  `<template>` reads from `.content` but appends via `cloned.appendChild`, which per spec
  appends to the *element*; clone into `cloned.content`. Happy-dom masks (c) by redirecting
  `appendChild` — needs a browser test.
- **SB-3: stale id-path cache returns and CLOBBERS the wrong item.** `by-path.ts:63-68` —
  `buildIdPathValueMap` reuses the existing map object and never clears stale keys;
  `keyToIndex:95-102`'s validation fallback reads the stale entry back. After a proxied
  `splice` removes `{id:2}`, `getByPath('arr[id=2]')` returns the `{id:3}` item and
  `setByPath('arr[id=2].v', …)` overwrites item 3 (confirmed: silent data corruption). Fix:
  rebuild into a fresh map (or delete the stale key when validation fails). Same bug in the
  branch's `by-path.tjs` (inherited by the port).
- **SB-4: a cascaded write inside an observer breaks `await updates()`.** `path-listener.ts:163-227`
  — `update()` resets `updateTriggered` before dispatch; an observer that writes state (the
  documented calculator pattern) replaces the module-level `resolveUpdate`, so the prior
  promise never resolves (hang) and the new one resolves before its update runs. Related,
  same function: a throwing observer *test* function is re-thrown out of the filter after
  `touchedPaths` was cleared — remaining observers never fire and `updates()` hangs
  (callback throws are caught; test throws are not, `:172-189`). Fix: chain/settle the
  promise correctly across cascades, try/catch around `test` like callbacks, and
  `resolveUpdate` in a finally.
- **SB-5: every list update re-inserts every item element.** `list-binding.ts:1508-1524` —
  the reorder pass anchors on `insertionPoint = null`, but the first item's previous sibling
  is always `listTop`, so item 1 always "moves" and the cascade re-inserts the entire
  visible list on every update, including no-op touches and every virtual-scroll frame.
  Kills focus/selection in list inputs, restarts animations/iframes. Fix: anchor the
  comparison against `listTop` (`insertionPoint ?? this.listTop`).

### High

- **H-1: prefix matching lacks segment boundaries, in three places.** Observer match
  (`'foo'` hears `'foobar'`, `path-listener.ts:130-133`), touch dedupe
  (`touch('foo'); touch('foobar')` swallows the second, `:230-234`), bind dispatch (touching
  `list[5]` re-renders bindings on `list[50]`, `bind.ts` dispatch loop). One shared helper:
  prefix match only if next char is `.`, `[`, or end.
- **H-2: Component pending-attribute drain is first-write-wins.** `component.ts:1147-1162` —
  the parser-wins guard `!hasAttribute` can't distinguish a parser-set attribute from one
  landed by an earlier op in the same queue, so the second pre-connect write to the same
  property is silently dropped. Fix: snapshot which guarded attributes existed before
  replay, or dedupe the queue keeping the last op per attribute.
- **H-3: `initAttributes` accessors are non-configurable.** `component.ts:1225` — omitted
  `configurable: true` means a leftover subclass field with the same name throws a cryptic
  TypeError from `document.createElement` under modern `[[Define]]` class-field semantics
  (ES2022/Vite/esbuild default). Fix: `configurable: true` + a helpful warn when an own
  field shadows an initAttribute.
- **H-4 — DECIDED (2026-07-18): keep the tjs-built subpath bundles as the toe-dip,
  flagged EXPERIMENTAL.** ✅ Landed: the eval-order bug is fixed (config now lives in
  `configure-tjs-{debug,safe}.ts`, imported FIRST from the entries, so it evaluates
  before any library module captures `__tjs` — previously `export * from './index'`
  evaluated the whole library before the config block ran); the debug bundle announces
  itself as experimental via console.info (safe stays silent — production-facing);
  tjs-lang upgraded 0.8.6 → **0.10.1** on main (includes the memory-leak fix).
  Plainly-documented current state: `tjs convert` marks all converted-from-TS functions
  unsafe by design (TS is presumed tsc-checked; safety is opt-in in native TJS — the
  emitted TJS stamps `:!` on every signature), so **no runtime checks fire on this line
  yet**; what ships is complete per-function `__tjs` runtime type metadata plus config
  plumbing that's genuinely wired for enforcement as modules go native in 2.0.
  Changelog for 1.7: describe exactly that — experimental, metadata now, enforcement
  with 2.0.
- **H-5: `throttle()` fires the wrapped function twice per isolated call.**
  `throttle.ts:91-106` — the trailing timer is scheduled unconditionally and never cancelled
  after a leading-edge run. Doubles every non-idempotent throttled handler and every
  ListBinding slice/filter update. Fix: schedule the trailing call only for suppressed
  invocations.
- **H-6: `getValue`/`setValue` value handling.** `dom.ts:49-72` — number/range inputs
  return strings, so numeric state silently becomes string state on first keystroke.
  **Decision (2026-07-17): two layers.** The binding layer is the type boundary — DOM
  speaks string, state speaks typed values — and both of these hold at once:
  1. **Typed-control reads (input-driven):** a control that declares its type is read
     natively by `getValue`, independent of state. `type=number`/`range` →
     `valueAsNumber`; the date family (`date`, `datetime-local`, `month`, `week`) →
     `valueAsDate`, `time` → `valueAsNumber` (ms since midnight); checkbox stays boolean.
     NaN/null (empty or partial entry) falls back to the raw string — never fabricate a
     number or a 1970 date from an empty field. This covers the **bind-before-data
     bootstrap**: when state is still undefined (deeply-async pattern) there is no state
     type to consult, and the control's declaration is what keeps the *first* write
     correctly typed. It also keeps `getValue` honest as a public standalone utility.
  2. **State-driven coercion (the general net):** in `handleChange`, state's type is
     authoritative for controls that *don't* declare one. Path holds a number + control
     yields a clean numeric string → coerce with `Number()` before writing (fixes text
     inputs, selects with numeric option values, radios). Guard: only non-empty strings
     that parse cleanly (`Number('')` is 0 — never coerce empty to zero); non-numeric
     input writes raw so 2.0 strictness flags it honestly instead of the coercion hiding
     it. For temporal state the same rule picks the **representation**: state holds a
     Date → write `valueAsDate`; holds a number → `valueAsNumber` (epoch ms); holds a
     string → keep the control's ISO string. Bootstrap default for empty state under a
     date-family control: the `Date` from layer 1.
  ⚠️ Dependency: Date objects in state require the `deepClone` Date fix (medium backlog —
  currently `deepClone(new Date())` → `{}`, and Component deep-clones `value` through
  it) landing in the SAME release; and document that JSON-based share/sync serializes
  Dates to ISO strings (inherent to JSON — don't pretend otherwise).
  toDOM direction, same doctrine: `setValue` accepts the union (Date | epoch number |
  ISO string) for date-family controls and sets via the matching native property; radio
  `checked` uses strict equality so numeric state never matches `value="5"` — compare
  `String(state)` to `element.value`; radio group lookup only searches `parentElement`.
  `setValue` guards: binding a text input to a missing path renders literal `"undefined"`
  (contradicts "bind before data exists" — render `''`), multi-select with `undefined`
  throws inside the observer flush, `date` with null must clear the field, not 1970-01-01.
- **H-7: `share()` restore re-broadcasts a stale snapshot over live tabs.**
  `share.ts:328-357` — restore does `setByPath` + `touch`, then registers the outbound
  observer synchronously; since touch is async-batched, the observer sees the restored
  (up-to-500ms-stale, debounced-persist) values as fresh local changes and broadcasts them,
  clobbering fresher live state in other tabs (confirmed). Also `sharedPaths.add` happens
  before the awaited IDB `get`, so a live delta landing mid-read is overwritten. Fix: route
  restore through `applyInbound` (or register the observer only after `await updates()`).
- **H-8: `sync()` loses deltas on transport failure.** `sync.ts:232-236` — the batch is
  `splice`d out before `transport.send`; a throwing send (websocket closing is routine)
  loses them permanently and silently (the exception is swallowed by path-listener's
  callback catch). Fix: requeue the batch on failure; document/require transports to throw
  rather than no-op (the sample websocket transport silently drops when not OPEN).
- **H-9: boxed `value`-property write asymmetry.** `xin.ts:1331` — the set trap treats
  `prop === 'value'` as the boxed-value write for any boxed target, with no own-property
  shadowing check (the get side has one). With `{slider: {value: 5, …}}`, reading
  `boxed.slider.value` returns 5 but assigning it **replaces the whole slider object with
  the scalar** (confirmed). Fix: mirror the get side's `'value' in target` check.
- **H-10: `hotReload()` restore corrupts state.** `hot-reload.ts:28-46` — `Object.assign`
  restore silently discards saved root scalars (assign onto a primitive) and merges arrays
  without truncating (`['a']` over `['x','y','z']` → `['a','y','z']`); the observer filter
  only matches the exact root key, so deep writes after restore are never saved again. Fix:
  wholesale replace via `setByPath`; prefix-match the filter. No test file exists — add one.
- **H-11: one failed blueprint import wedges the loader forever.**
  `blueprint-loader.ts:265-301` — the rejected promise is cached permanently (no retry) and
  `Promise.all` rejection means `allLoaded` never fires and the rejection is unhandled. Fix:
  evict failed cache entries, `allSettled` + per-blueprint error reporting.
- **H-12: events on `cloneNode` copies of bound elements throw in the global dispatchers.**
  `bind.ts` `handleChange`/`handleBoundEvent` — WeakMap `get(target)` is used without a null
  check; clones carry the `-xin-data`/`-xin-event` classes but no WeakMap entries. Degrade
  gracefully (skip) instead of TypeError-ing and aborting ancestor traversal.

### Medium backlog (fix in 1.7 where cheap; otherwise carry, don't drop)

**✅ FIXED in 1.7 (2026-07-18 triage pass, each with a regression test):**
- packaging: `types`-first in exports; excluded `*.tsbuildinfo` + `dist/bun-plugin` from
  the tarball.
- binding/lists: reactive `class` now replaces (not accumulates); `bind()` no longer
  mutates the caller's spec; `bind: { value, binding: 'name' }` string form resolves and
  renders; duplicate list ids warn once; removed the debug `console.log` in the filter path.
- css/color: unitless custom props no longer get `px`; alpha hex rounds (not floors);
  `deepClone` preserves Date/Map/Set + handles cycles (H-6 prereq).
- component: stale `_attrValues` cleared on external `removeAttribute`; `isSlotted` compares
  to `null`; `TosiSlot.replaceSlot` preserves `<slot>` fallback children; **Component
  `change` now bubbles + composes** (was non-bubbling — ancestor listeners never heard a
  component's value change, breaking the bound-like-an-input contract for user code).
- xin/by-path: symbol-keyed assignment stores on target (was throwing in extendPath);
  compound boxed paths already fixed by SB-2b; `deleteByPath` null already fixed by SB-3.

**⏸ DEFERRED / carried (not cheap, or better in 2.0):**
- `tosiValue` function-proxy unwrap — partial fix only (identity already lost to
  `.bind()`-per-access), and taxes the hot path; needs function-identity caching (2.0).
- no `deleteProperty` trap — `delete proxy.x` mutates silently with no touch. Design
  decision (should delete touch? synthesize a removal?) — 2.0.
- ListBinding has no teardown — `scrollContainer: 'window'` leaks the detached list
  forever. Converges with the `FinalizationRegistry` observer-cleanup idea (2.0).
- id values containing `=` resolve to the wrong item via the proxy get trap
  (`split('=')`); numeric-string object keys readable but unwritable (setByPath expects an
  array); id-path touch synthesis only handles the innermost bracket. Niche path edge
  cases — carry.
- `value` attribute beats a later `value` property write at hydration (property should
  win); no `parts` invalidation after a DOM-replacing `render()`; a `change` listener that
  mutates `value` swallows the second change event; `formResetCallback` ignores the
  captured class-field default; dead `_value` stores. Component edge cases — carry.
- changing an item's id in place orphans its bindings + leaks the strong-Map entry; scalar
  list items recreated every update; O(n²) removal scan without idPath. List perf/edge —
  carry.
- `vars.gray50` digit-suffix calc-sugar collision (escape hatch or loud docs) — carry.
  `debounce`/`throttle` `cancel`/`flush` API — carry (additive surface).
  ✅ FIXED 2026-07-20: `css-colors.ts` wired in (DOM-free named colors; killed 150 lines
  of dead code), `invertLuminance` no longer drops named colors, `StyleSheet()` returns
  its element, `debounce`/`throttle` preserve `this`. `invertLuminance` still skips
  MODERN color syntax (oklch/color()) — carry.
- share/sync minors: echo-window can swallow local changes; overlapping roots
  double-broadcast; `sync.ts` `inboundPaths` module-level across instances; the `share()`
  doc example (`restored.includes(app.user)`) can't work (boxed proxies aren't
  identity-stable) — fix the doc. Mostly design tradeoffs — carry.
- ✅ FIXED 2026-07-20: `parts` now honors the documented `data-ref` lookup (part= ->
  data-ref= -> css selector) and ignores symbol keys; docs restated. The `share()` doc
  example (proxy identity) also corrected.

### Docs surfacing for 1.7

The shadow-DOM doctrine (component = custom input, value is the binding surface) is now
in: Component's doc block (two passages), both warning texts, `bind()`'s doc block
(`on()` section), and Building-Apps.md's mental-model section — all of which feed the
doc site and llms.txt at build. ✅ **Shadow value-widget live example DONE** (2026-07-18): a runnable star-rating widget
in Building-Apps.md, bound by value alongside a plain number input on the same path, with
an in-browser companion `test`. Writing it surfaced the non-bubbling `change` bug (fixed).
⚠️ confirm the new doc `test` fence on a CLEAN browser run before 1.7 final (the last
`test:browser` run adopted a FOREIGN haltija — a tosijs-3d interactive session squatting
the default port 8700 — navigated its window to our pages, and timed out. Environment +
upstream, not our test; the widget logic is unit-verified in happy-dom). Root cause and
fix filed: **haltija#1** — spawned (`-f`) automation runs should be a private, isolated
instance (own server/port/Electron), never adopting the shared interactive browser;
tosijs-ui's dev-server test mode is the consumer that adopts the shared server today.
Until that lands, run `test:browser` when no other tosijs-ui project's haltija is on 8700.
Still wanted:
- README has no shadow-DOM guidance beyond one `shadowStyleSpec` code sample — fine
  (README stays lean), but verify llms.txt picks up the Building-Apps section after the
  next build.

### Test infrastructure for 1.7

- **Browser test lane** (we have browser-based testing available) for the class of bug
  happy-dom cannot see: shadow-DOM bind/on, `cloneWithBindings` on real `<template>`
  elements (happy-dom's non-spec appendChild redirect masks SB-2c), event retargeting,
  focus/selection retention across list updates (SB-5's regression test).
- **Error-path discipline:** every one of the ~45 findings passes the current green suite.
  Each 1.7 fix lands with a regression test asserting the previously-wrong behavior.
- Specific gaps called out by the review: throttle single-call-then-wait; hot-reload (no
  test file at all); share "restore does not broadcast"; sync transport-failure;
  deepClone Map/Date/circular; number-input round-trip type preservation; nested lists
  (zero tests today); duplicate-id lists.

### Release mechanics

**Cross-project release sequence (decided 2026-07-20).** tosijs and tosijs-ui are
mutually dependent — tosijs-ui runtime-depends on tosijs; tosijs build-depends on
tosijs-ui (doc/build host, a **devDependency**, not in tosijs's shipped bundle). Unwind
the cycle in this order:

1. **tosijs-ui 1.7.0-fc** (npm-published pre-release, not a branch ref — tosijs must pin a
   real version for a reproducible build). Settles the host: latest haltija (`--private`
   test lane, `haltijaDev` surfacing — tosijs-ui#18) **and the tsc-fatal fix** (make
   `libraryBuild` fail on `tsc` errors — a type error shipped in beta.1 because the build
   exits 0 on tsc failure; this is the gating item, it protects tosijs 1.7.0's `.d.ts`).
2. **tosijs 1.7.0 final** — bump the tosijs-ui host pin to the fc, consolidate the
   beta.1+beta.2 changelog into one 1.7.0 section, rebuild, one clean `test:browser` run
   (works now: `hj eval '…' --window <id>` targets our tab; `haltijaDev`/`HALTIJA_DEV=1`
   injects the client — no haltija upstream fix needed), tag, publish to `latest`.
3. **tosijs-ui 1.7.0 final** — bumps its tosijs dep to 1.7.0, closes the loop.
   haltija#4/#5 are quality-of-life, NOT release blockers — do not gate on them.

Then rebase `tosijs-2.0` onto v1.7.0 (see below).

- Fold in the **stale committed `dist/`** rebuild (the debug/safe bundles re-minify ~3.6KB
  smaller under current Bun; deliberately deferred from the 1.6.22 devDep bump so published
  artifacts wouldn't change under cover of a dev-only patch — 1.7 is the "next real
  release" it was waiting for).
- Changelog must call out the behavior changes explicitly: shadow-DOM bindings now live,
  nested lists functional, exact-segment observer matching, numeric input round-trip,
  class-binding replace semantics, list-update DOM stability, throttle single-fire.
- Verify tosijs-ui (the main consumer) against a packed 1.7 before tagging — SB-1/SB-2/SB-5
  all touch machinery it leans on.
- After shipping: rebase `tosijs-2.0` onto v1.7.0 (same dance as the v1.6.9 rebase); the
  branch's 2.0-only review findings are tracked in the branch's TODO.md.

### State-change type checking / strictness — DEFERRED to post-1.7.0 (2026-07-20)

Decision: do **not** backport `settings.strictness` / `pathCreation` / `bindingPaths` to
the 1.7 line. They stay 2.0-only; state-change type checking ships when 2.0 does.

Context (a consumer conflated two mechanisms — keep them straight):
- **`settings.strictness` = state-update type checking** (assign a value whose runtime
  type differs from what the path holds → warn/throw). Real, enforced, tested — but lives
  **only on `tosijs-2.0`** (main's `settings.ts` is just `{ debug, perf }`). This is the
  thing consumers actually want when they say "type checking on state updates."
- **`tosijs/debug` + `__tjs` metadata = TJS function-signature checking** (H-4). A
  *different axis*: ships per-function metadata now, enforcement arrives with native-TJS
  modules in 2.0. Will never provide state-update checking no matter how enabled.
- **"flight recording"** — no tosijs feature by that name; nearest is tjs-lang's monadic
  error ring buffer (write-closed; filed upstream), surfaced only via the debug bundle's
  `__tjs` runtime.

So a consumer (e.g. an experimental tosijs-ui build) wanting strictness in 1.7 can't get
it from any `tosijs@beta` release; the feature is on the 2.0 branch. Revisit when 2.0
lands it on the release line.

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
  as `tosiUnique`'s owner-based cleanup). The 1.7 review's ListBinding-teardown finding
  (window-mode scroll listeners pinning detached lists forever) is the concrete case this
  would solve — see Medium backlog above.

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
