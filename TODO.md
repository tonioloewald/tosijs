# todo

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

⚠️ **Browser-lane checklist before 1.7 ships** (happy-dom structurally can't prove these):
SB-2c (template cloning into `.content`), on()-in-shadow origin resolution (happy-dom
doesn't retarget composed events). Note: H-10's observer-root-match change is a
contract-alignment (deep writes already touch the root, so saves happened either way —
not a reproducible bug); H-11's retry needed a `setModuleLoader` test seam because
dynamic import() is unmockable.

**The 1.7 slate is code-complete.** Remaining before tagging: the browser-lane checks
above, the medium/minor backlog triage (fix-where-cheap), the runnable shadow value-
widget doc example, and the release mechanics (changelog with the behavior-change
callouts, tosijs-ui verification against a packed 1.7, version bump, build, tag,
publish, then rebase tosijs-2.0 onto v1.7.0).

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

- xin/by-path: compound boxed paths malformed (`boxed['a.list[0].name']` → path
  `a.list.[0].name`, value undefined — extendPath dot-joins bracket segments); id values
  containing `=` resolve to the wrong item via the proxy get trap (`split('=')` keeps first
  segment); numeric-string object keys readable but unwritable (extendPath brackets
  `/^\d+$/` props, setByPath then expects an array); no `deleteProperty` trap — `delete
  proxy.x` mutates silently with no touch; symbol-keyed assignment throws (`prop.match` on a
  symbol); `tosiValue` doesn't unwrap function proxies (guard excludes `typeof
  'function'`) → proxy-on-proxy on reassignment; `deleteByPath` can't delete a `null` value;
  id-path touch synthesis only handles the innermost bracket.
- component: stale `_attrValues` fallback masks external `removeAttribute` forever (clear it
  in `attributeChangedCallback`); `value` attribute beats a later `value` property write at
  hydration (property should win); `TosiSlot.replaceSlot` drops `<slot>` fallback children;
  `isSlotted` compares `querySelector` to `undefined` — always true; `parts` docs describe a
  `data-ref` lookup that isn't implemented (and the vestigial `removeAttribute('data-ref')`);
  no `parts` invalidation after a DOM-replacing `render()`; `formResetCallback` ignores the
  captured class-field default; a `change` listener that mutates `value` swallows the second
  change event; dead `_value` stores (never read — remove or wire up).
- binding/lists: bound `class` accumulates instead of replacing (needs record-and-diff of
  applied classes); `bind: { value, binding: 'name' }` string form is a silent no-op (passes
  the raw string to bind, `elements.ts:531-543`); duplicate list ids silently drop a row —
  add a one-time console.error; changing an item's id in place orphans its bindings and
  leaks the old strong-Map entry; ListBinding has no teardown at all — `scrollContainer:
  'window'` leaks the whole detached list forever (converges with the FinalizationRegistry
  idea below); `bind()` mutates the caller's spec (`delete options.value` — reusing one
  bindList spec for two containers throws); shipping debug `console.log` in the filter path
  (`bind.ts:488`); scalar list items are unconditionally destroyed/recreated every update;
  O(n²) removal scan without idPath.
- css/color/utils: `deepClone` turns Map/Date into `{}` and blows the stack on cycles — and
  `component.ts` deep-clones `value`/`defaultValue` through it; unitless numbers on
  `_`-prefixed custom props get `px` (`--opacity: 0.5px` — prefix is stripped after the
  unit check, `css.ts:399-418`); `vars.gray50` parses trailing digits as calc sugar —
  collides with standard design-token naming (escape hatch or loud docs);
  `invertLuminance` drops named colors and modern color syntax; `Color.fromCss` named
  colors need a live DOM (parse to transparent black otherwise) while the complete
  `css-colors.ts` table sits unimported — wire it in; alpha hex uses `Math.floor` (use
  round like r/g/b); `StyleSheet()` returns nothing so callers can't remove/update;
  `debounce`/`throttle` lose `this` and offer no cancel/flush.
- share/sync minors: prefix+time-window echo suppression can swallow legitimate local
  changes made during the inbound window; overlapping shared roots double-broadcast;
  `sync.ts`'s `inboundPaths` is module-level — shared across independent `sync()`
  instances; the `share()` doc example (`restored.includes(app.user)`) can't work — boxed
  proxies aren't identity-stable.
- packaging: in package.json `exports`, `types` is listed after `import`/`default` —
  conditions match in order, so `types` may never be reached; move it first. Also keep
  `dist/bun-plugin/` and `dist/tsconfig.build.tsbuildinfo` out of the published package.

### Docs surfacing for 1.7

The shadow-DOM doctrine (component = custom input, value is the binding surface) is now
in: Component's doc block (two passages), both warning texts, `bind()`'s doc block
(`on()` section), and Building-Apps.md's mental-model section — all of which feed the
doc site and llms.txt at build. Still wanted:
- **A live doc example of a shadow value-widget**: `shadowStyleSpec` component with a
  `value`, `render()` reflecting it into the shadow DOM, bound from outside with
  `bindings.value` — the canonical pattern, runnable.
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
