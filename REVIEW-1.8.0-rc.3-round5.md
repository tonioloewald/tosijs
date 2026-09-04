# Pre-release review triage — tosijs 1.8.0-rc.3 → 1.8.0

**Verdict: 🛑 BLOCK** — 2 verified blockers (one global-DOM correctness defect, one dead release gate), plus 8 verified majors. Do not tag 1.8.0.

Base `v1.8.0-rc.2` · HEAD `f528d00` · verify depth = full · unit suite **887 pass / 0 fail** · browser lane **could not run** (B2).

---

## Per-lens summary

| Lens             | Result                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **correctness**  | 1 blocker + 3 majors. All in code new to this release. `Component.computed()` accounts for 3 of the 4.                                                                                                                                                                                                                                                                            |
| **efficiency**   | 1 major: `agent.read()` runs a 15-arm document-wide `querySelectorAll` per call (measured 880 µs–2 ms in real Chromium, not the 1.3 µs the shipped comment claims — that figure was a happy-dom memoisation artifact). The security revert it justifies is correct; the scan shape is not.                                                                                        |
| **dryness**      | 3 minors. The typed-override predicate is now spelled twice in one getter; the reverted cache left its whole invalidation apparatus (`bindingGeneration`/`noteBindingChange`) live with zero readers and a security-flavoured docstring naming a consumer that no longer exists.                                                                                                  |
| **docs**         | 1 major: the shipped `contractviolation` doc block still states the pre-rc.3 one-way latch semantics that rc.3 deliberately changed — CHANGELOG and doc site now contradict each other. Plus `Component.computed()` is absent from the doc site/epub/llms.txt entirely.                                                                                                           |
| **coverage**     | 1 blocker (browser lane dead) + 1 major (`Component.computed()` ships untested; the missing tests are hiding every defect above). One permanently-red, ungated tier (`tjs convert` on `src/color.ts`) still prints 8 failures per build.                                                                                                                                          |
| **dx**           | 2 majors (both `computed()`), 1 minor: tosijs#24's "covers every declared attribute type" is still false for falsy writes to a boolean attribute, and warn-once makes it silent.                                                                                                                                                                                                  |
| **ecosystem**    | 1 major: tosijs#27 is (partly) addressed by this release, is still OPEN, and is named nowhere — CHANGELOG, TODO E3 close-list, both silent. TODO E3 also lists #18/#22/#23/#24 as "all still open"; all four were closed 2026-08-21/24.                                                                                                                                           |
| **practices**    | 2 majors: lens 8's READ direction has never been run (fourth ask; round-4 M9's prescribed artifact was transcribed into TODO.md rather than performed, and P6 now re-files an upstream bug fixed two days ago); CLAUDE.md still carries the tosijs-ui pin rationale this release proved false and corrected only in UPSTREAM.md — and MEMORY.md carries a third uncorrected copy. |
| **blast-radius** | 1 major (publish-guard escape hatch is unreachable and the broken snippet is already the KB's reference implementation), 4 minors including 2,197 orphaned scaffolder temp dirs on this machine.                                                                                                                                                                                  |

---

## 🛑 Blockers

### B1 — `Component.computed()` on a DOM-owned attribute name permanently corrupts `HTMLElement.prototype` page-wide

`src/component.ts:1651-1687` · lens: correctness · **verified**

`_installComputedAttribute` walks the entire prototype chain for a `get` with **no floor**, then `Object.defineProperty(proto, attrName, …)` on whatever prototype owned it. `static initAttributes = { title: Component.computed('') }` (or `hidden`, `dir`, `lang`, `id`, `slot`, `tabIndex`, `className`, `contentEditable`) finds the _native_ accessor, so the "no `get X()` found" throw never fires and tosijs installs its wrapper on the shared DOM prototype (those descriptors are configurable, so it succeeds).

After one such component is constructed, `document.createElement('div').title = 'hello'` throws `TypeError: this.queueRender is not a function`. `id` lives on `Element.prototype`, so SVG breaks too. Permanent for the page lifetime, affects every element, and surfaces far from its cause. This is precisely the author-error path the guard was written for — failing open into global DOM corruption instead of throwing.

**Fix:** floor the walk at `Component.prototype` — accept a descriptor only from a prototype strictly below it — and fall through to the existing throw otherwise. Add a regression test for `Component.computed('title')` asserting it throws _and_ that `HTMLElement.prototype`'s own `title` descriptor is untouched.

### B2 — `bun run test:browser`, the mandatory release gate, fails before a single browser test runs

`bin/site.ts:337` · lens: coverage · **verified, root cause reproduced**

Playwright's `webServer` command is `bun start` → `buildLibrary()` → the new fail-closed payload gate. Playwright sets `FORCE_COLOR=1` in the webServer child env, so `bun pm pack` emits ANSI escapes and the summary line arrives as `\x1b[1m\x1b[34mUnpacked size\x1b[0m: 3.89MB`. The regex `/Unpacked size:\s*([\d.]+)…/` requires `:` immediately after the label, the reset sequence defeats it, and the gate throws:

```
[WebServer] error: package payload gate could not parse `bun pm pack` output
Error: Process from config.webServer was not able to start. Exit code: 1
```

Reproduced directly this session: `FORCE_COLOR=1` → `MATCH: null`; unset → matches. Deterministic. **Net effect: `tests/doc-tests.pw.ts` (MINIMUM_CORPUS 16 — the only real-browser coverage of the agent surface) and `tests/value-commit.pw.ts` (the per-engine commit lane created after the 1.7.7 segmented incident) ran ZERO times** for a release that rewrites the attribute accessors (`src/component.ts`, +188 lines since rc.2) and touches `src/elements.ts`. This also takes down CI (`.github/workflows/ci.yml:49`).

Note the earlier fail-open (`if (match != null)` with no `else`) had the same parse bug but silently skipped the budget, so the lane still started — hardening the gate is what took the release lane down.

**Fix:** strip ANSI before matching (or set `NO_COLOR=1`/`FORCE_COLOR=0` on the `bun pm pack` call), _and_ guard the payload budget with `buildOnly` so a tarball budget never runs inside `bun start`. Then run `bun run test:browser` end-to-end and confirm green before tagging.

---

## Majors (all verified; fix before 1.8.0 or explicitly defer)

**The `Component.computed()` cluster (M1–M3) is one decision.** It is purely additive — nothing regresses if it lands in 1.8.1. Given B1 plus three majors plus zero tests, **cutting it from 1.8.0 is the cheapest correct move**; the alternative is landing all four fixes plus a test block.

### M1 — a computed-attribute write dispatches a bubbling `change`, committing DOM value back into bound state

`src/component.ts:1679` · correctness + dx

The wrapper is `authorSet.call(this, value); this.queueRender(true)`. `queueRender(true)` is the _value-commit_ signal: it dispatches `change` `{bubbles, composed}` and calls `internals.setFormValue()`. Ordinary `initAttributes` setters call `queueRender()` (false) _and_ guard on equality; computed ones do neither — a repeat no-op write fires a third event.

Demonstrated lost update: with `bindValue` on the element, an external `xin['ctl.v'] = 'external-update'` followed by a presentational `el.collapsed = true` before the touch batch lands **reverts state to the stale DOM value**. Unannounced — the JSDoc and CHANGELOG promise only "a change always re-renders".

**Fix:** `this.queueRender()` (no argument) plus an equality guard. Test: an attribute write fires zero `change` events.

### M2 — a computed attribute set from markup is silently inert, contradicting its own shipped docs

`src/component.ts:1431-1448` / `1642-1645` · correctness + docs + coverage + dx + ecosystem

`observedAttributes` includes computed names so `attributeChangedCallback` fires — but it only calls `queueRender(false)`; nothing pushes the attribute value into the author's setter, and computed names skip `_installAttrAccessor` so no getter reads it back. Reproduced: `<my-el full-name="Grace Hopper" collapsed>` leaves the setter uncalled, `el.fullName` reads the derived default while `getAttribute` reads `"Grace Hopper"`, and `el.collapsed` is `false` with the attribute present. A post-mount `setAttribute` is equally inert. Only property writes work.

The docs promise the opposite in two places: `computed()`'s "MUST tolerate a string", and `_installComputedAttribute`'s quality 2 ("`<el full-name>` delivers the EMPTY string specifically — the case a naive `split(' ')` setter gets wrong"), describing a code path that cannot execute. `_computedAttrShapes` is written at `:1667` and **read nowhere in `src/`** — the "for `describe()` and the contract" claim is false; neither `agent.ts` nor `contract.ts` references `initAttributes` at all.

**Fix:** wire the markup path (assign `shape === 'boolean' ? hasAttribute(name) : (newValue ?? '')` with a re-entry guard, applied once at hydrate too), **or** delete the markup claims, drop the names from `observedAttributes`, and rename the concept — it is a computed _property_. Either way, delete or implement `_computedAttrShapes`.

### M3 — `Component.computed()` ships with zero tests

`src/component.ts:1066` · coverage

`grep 'Component.computed\|COMPUTED_ATTRIBUTE\|ComputedAttribute'` over `src/*.test.ts` and `tests/` returns nothing. `static computed()`, `_installComputedAttribute()`, the `wrappedComputedSetters` double-wrap guard, the no-getter throw, and the `isComputedAttribute` branch are entirely uncovered. Every defect above is trivially reachable and none was caught. Semantics freeze on publish.

Minimum block (note `queueRender` uses rAF, so `await updates()` alone does **not** observe the render — a naive test passes vacuously): markup value → setter; `<el attr>` presence → empty string; post-hydration `setAttribute` → setter; property write renders exactly once and fires **zero** `change`; read-only getter; the missing-getter throw; subclass single-wrap; and a name colliding with a native DOM accessor (B1's regression).

### M4 — the `contractviolation` latch still doesn't clear across an empty field

`src/component.ts:713` · correctness

`checkValueContract` clears `violationsDispatched` only when the value is contract-_valid_. The binding path's `if (newValue == null || newValue === '') return // pre-data` returns before any latch handling, and `''` is not valid against `{ type: 'number' }`. So the sequence a user actually performs — type `bad`, select-all-delete, type `bad` again — fires **one** event (verified: 1, 1, 1). The new test only exercises bad → `5` → bad, stepping around it. `null`/`undefined` (a model reset) fails identically.

**Fix:** clear the latch before the pre-data return — an empty value is by definition "not currently violating". Add the bad → `''` → same-bad case to the regression test. While there: `bindingViolationWarned` is a global tag+reason Set that is still never cleared, so the CHANGELOG's "on both the event and the console" is only half true.

### M5 — `agent.read()` runs a document-wide 15-arm attribute scan on every call

`src/agent.ts:689` · efficiency

The rc.3 security revert is **right and should stand**. What survives is the scan shape: `refreshSecretPaths()` runs `document.querySelectorAll(SECRET_CONTROL_SELECTOR)` — 15 arms, 12 of them `[autocomplete^=…]` prefix matches no engine can bucket — on every `read()`, `describe()` and `when()`. Measured in real Chromium: **352 µs at 2.1k elements, 1.14–2.0 ms at 7k**; Firefox the same shape; identical with and without an intervening DOM mutation (real engines don't memoise `querySelectorAll` at all). 200 `tosi_read` calls in one WebMCP turn ≈ 230–400 ms of main thread.

The justifying comment's "Spending 1.3µs a read … is not a trade worth revisiting" is a happy-dom measurement (0.7 µs memoised, **42,000 µs** once a mutation invalidates the memo) — off by 300–1,500× against the environment that matters, and it is written to close future arguments.

**Fix (keeps the no-cache decision intact):** enumerate `document.getElementsByClassName(BOUND_CLASS)` and filter with the existing `isSecretControl()`. Provably identical result set — `refreshSecretPaths` already discards every candidate with `dataBindings == null`, and `BOUND_CLASS` is stamped at exactly the two sites that populate `elementToBindings`. Measured **288 µs vs 1,851 µs at 7k**. `agent.ts:836` already uses this idiom. Correct the 1.3 µs figure, and note any re-measurement must be done in a real browser.

### M6 — the shipped `contractviolation` doc block states the pre-rc.3 latch semantics

`src/component.ts:548` · docs

rc.3's headline behaviour fix makes the latch clear on recovery, pinned by a new test asserting 1 → 1 → 2 for an identical reason. The `/*# */` doc block — which ships to `docs/component/index.html:501`, `docs.json` and the epub — still says "**It fires once per element per distinct reason**… A listener therefore counts _distinct violations_", sized against the telemetry example right beside it. The re-showable-banner use case rc.3 exists to enable is undiscoverable from the docs, and CHANGELOG now contradicts the doc site. (npm tarball is unaffected — `files` ships the correct CHANGELOG.)

**Fix:** "once per element per distinct reason _per bad-state episode_; the latch clears the moment a valid value arrives, so re-entering fires again — this is what makes the channel usable for a re-showable validation banner." Rebuild docs.

### M7 — tosijs#27 is partly closed by this release, is still OPEN, and is named nowhere

`CHANGELOG.md:62` · ecosystem

tosijs#27 ("No computed/derived attributes: `observedAttributes` comes only from `initAttributes`, and instance `defineProperty` shadows accessors", filed 2026-08-25) is what `Component.computed()` addresses. The CHANGELOG "Added" bullet cites no issue; TODO E3 enumerates #18/#22/#23/#24 and #26/#17/#16/#9 — #27 is in neither, so the publish ceremony will not close it and the reporter is never told.

**Important correction to the finding:** #27 is only _half_ fixed. The reporter's own symptom — `turn-rate-deg="30"` in markup silently doing nothing — still reproduces on rc.3 (see M2). Do **not** close #27 naming v1.8.0 unless M2 is fixed; if `computed()` is cut to 1.8.1, #27 stays open with a comment explaining the partial state.

Also: TODO E3 line 89 reads "all still open" for #18/#22/#23/#24 — all four were closed 2026-08-21/24 (verified via `gh`). The ledger a publish ceremony is driven from is wrong in both directions.

### M8 — the publish guard's documented escape hatch does not exist, and the broken snippet is already the KB's reference implementation

`bin/check-publish-tag.ts:64` + `practices/releasing.md:389-409` · blast-radius + practices

Verified empirically (npm 11.18.0): npm exports `npm_config_*` only for **non-default** values, and `tag`'s default _is_ `latest`. So `npm publish --tag latest` leaves `npm_config_tag` **unset** — identical to omitting the flag. Three consequences:

1. The error message says "If you really do want this prerelease on `latest`… `npm publish --tag latest`" — that command hits the same `tag == null` branch and is refused with the same message. The only escapes are `--ignore-scripts` or deleting the hook, both of which disable every publish gate permanently.
2. The docstring's "this can distinguish 'forgot the flag' from 'deliberately publishing as latest'" is false. The "verified both ways" note probed flag/no-flag; the third case the hatch depends on was never probed.
3. `practices/releasing.md` publishes this exact snippet, cites `tosijs 1.8.0-rc.2 (bin/check-publish-tag.ts)` as the reference, and lists as scoping decision #1 "Allow `--tag latest` explicitly… Requiring them to say it out loud is the whole mechanism" — which the snippet below it cannot implement. Every sibling repo publishes with `bun`, where the pre-carve-out snippet hard-refuses **every** correct `bun publish --tag rc`.

The bun carve-out landed in-repo at `f528d00` (so tosijs itself now warns-and-passes under bun) but **was never written back to the KB**. The KB is now knowingly wrong rather than merely untested.

**Fix:** give the guard an opt-out that exists (`ALLOW_PRERELEASE_LATEST=1` or an argv scan) and name _that_ in the message; delete the "can distinguish" claim; push both the carve-out and the corrected snippet to `practices/releasing.md`, attributed `— seen in: tosijs 1.8.0-rc.3`.

### M9 — lens 8's READ direction has never been run (fourth ask), and one already-fixed KB bug is mis-recorded as open

`TODO.md:15` · practices

`practices/review.md:455-461` requires logging the practices repo since the last release and dispositioning each change. Round-4 M9 prescribed a concrete artifact; `9f424ce` instead added a bullet _saying it has never been run_. 49 practices commits since v1.7.9 are undispositioned, and the cost is realised: `fe03680` (2026-08-23) moved report filing to root `reviews/<version>-<slug>.md` — this repo still has **five bare-root reports and no `reviews/` directory** (verified), neither adopted nor recorded as a divergence. Worse, **TODO P6 still asks to "change the KB to `reviews/…`"**, work completed upstream two days ago, so the next session re-files a fixed bug.

### M10 — CLAUDE.md still carries the tosijs-ui pin rationale this release proved false

`CLAUDE.md:71-72` · practices

Round-4 M6 established that 1.9.1, 1.9.4 and 1.10.0 _all_ peer `tjs-lang ^0.12.0` (confirmed: the installed 1.9.4's `package.json` declares it), so "1.10.0 peers `tjs-lang ^0.12.0`, a version we intend to skip" supports nothing. `9f424ce` corrected `UPSTREAM.md:283` and reopened E1 — but CLAUDE.md, the file every agent loads first, still states the false constraint as fact. **Third locus, worse:** `~/.claude/…/memory/MEMORY.md:90-91` carries the same uncorrected text and is injected into every session with no file open. Two of three agent-facing records still assert a constraint that does not exist. Unpaid cost: the 10-entry `watchPaths` duplication at `tosijs-site.config.ts:85-96`, a workaround for closed-and-shipped tosijs-ui#49.

---

## Follow-ups by destination

### → fix now, or file to this repo's `TODO.md`

_(lenses: correctness / efficiency / dryness / docs / coverage / dx)_

**Blockers — must clear before tagging**

- [ ] **B1** Floor `_installComputedAttribute`'s prototype walk at `Component.prototype`; add the `Component.computed('title')` regression test. `src/component.ts:1651`
- [ ] **B2** Strip ANSI (or `NO_COLOR=1`) before parsing `bun pm pack`, and guard the payload budget with `buildOnly` so it never runs inside `bun start`. Then run `bun run test:browser` green end-to-end. `bin/site.ts:337`

**Majors**

- [ ] **M1** `queueRender()` not `queueRender(true)` in the computed-setter wrapper, plus an equality guard. `src/component.ts:1679`
- [ ] **M2** Wire the markup→setter path for computed attributes, or delete the markup claims and rename the concept. Delete or implement `_computedAttrShapes`. `src/component.ts:1431,1642,1667`
- [ ] **M3** Add the `describe('computed attributes')` block (8 cases listed above) — or cut `Component.computed()` to 1.8.1. `src/component.test.ts`
- [ ] **M4** Clear the violation latch before the pre-data early return; add the bad → `''` → same-bad case; clear `bindingViolationWarned` too. `src/component.ts:713`
- [ ] **M5** Swap `refreshSecretPaths` to `getElementsByClassName(BOUND_CLASS)` + `isSecretControl()`; correct the "1.3 µs" comment. `src/agent.ts:651-689`
- [ ] **M6** Rewrite the `contractviolation` doc block for the new per-episode semantics; rebuild docs. `src/component.ts:548`

**Minors / nits**

- [ ] Boolean-declared attributes coerce falsy typed writes: `el.flag = 0` / `''` reads back `false` while `el.flag = 1` round-trips; warn-once makes the second mismatch silent, so "nothing is coerced" and CHANGELOG's "covers every declared attribute type" are both false. `src/component.ts:1802,1858` _(verified)_
- [ ] Boolean typed override reflects as `''`, colliding with a normal external `setAttribute(attr, '')`; and `el.flag = true` clears the override before the change comparison, so no render is queued. `src/component.ts:1858` _(unverified)_
- [ ] Collapse the duplicated typed-override staleness predicate — the string branch keeps its own verbatim copy of the `typedOverride()` closure 35 lines below it; drop the `{ value }` re-boxing. `src/component.ts:1795,1830` _(verified)_
- [ ] The "contradicts declared type" predicate is spelled twice with a drifted third clause, one of which (`typeof defaultValue !== 'object'`) is dead. `src/component.ts:1850,1871` _(unverified)_
- [ ] Delete `domBindingGeneration`/`bindingGeneration()`/`noteBindingChange()` and their three `bind.ts` call sites (413, 649, 750), or rewrite the SECURITY-RELEVANT docstring to say it has no consumer and cross-reference agent.ts's NO-CACHE block. Its bump semantics are first-binding-only, i.e. unsound for any security use. `src/metadata.ts:345-365` _(verified)_
- [ ] `_computedAttrShapes` allocates a per-instance Map of class-invariant data nobody reads; memoise the prototype walk per class the way `_elementCreator`/`DRAIN_WRAPPED` already do. `src/component.ts:1667` _(unverified)_
- [ ] Hoist the `typedOverride` closure out of the getter body — it allocates on every read of every declared attribute. `src/component.ts:1795` _(unverified)_
- [ ] Document `Component.computed()` in the `/*# */` doc block under `static initAttributes` (it currently reaches only JSDoc + `.d.ts` + one CHANGELOG bullet — absent from doc site, epub, llms.txt); note it does NOT reflect. Add a CLAUDE.md Component Conventions bullet. _(verified)_
- [ ] Export `type ComputedAttribute` from `src/index-core-exports.ts` — confirmed absent from the package entry, so a consumer cannot annotate `initAttributes`. _(verified this session)_
- [ ] **Failing tier, ungated:** `tjs convert` reports `src/color.ts: 0 passed, 8 failed` ("Signature: Module could not be executed for testing: clamp is not defined") on every build, then `0 failed` in the summary and exit 0. Fix the `more-math` import resolution in the tjs harness, or suppress the tier and record the count in TODO.md as tracked debt — do not leave a red tier normalised as scrollback. `bin/site.ts` _(unverified)_
- [ ] Extract `checkInternalLinks`'s source-set expansion into a testable pure function; assert it includes `README.md`, `src/docs/history.md`, at least one `src/*.ts`, excludes `*.test.ts`, and holds a `MINIMUM_CORPUS`-style floor so a silent shrink must be acknowledged. `bin/site.ts:459` _(unverified)_
- [ ] `mayRewriteTrackedSource()` has one call site — `vendorSchematic` still carries its own inline guard, while the helper's docstring _and_ the shipped CHANGELOG claim both generators share it. Convert it or correct both records. `writeVersion()` is a third unguarded tracked-source writer. `bin/site.ts:56,112,38` _(unverified)_
- [ ] `addTree` hand-copies tosijs-ui's docPaths walk and already differs on three rules (`_`-prefixed files, ignore list, `.css`/`.js` doc blocks). Latent today; pin the coupling in a comment at minimum. `bin/site.ts:479` _(unverified)_
- [ ] Add `bin/check-publish-tag.test.ts` — matrix over `npm_config_tag` × `npm_config_user_agent` × version, asserting exit codes for all five cases. _(verified)_
- [ ] Assert `type ElementsProxy` is imported in the `--bare` scaffold output, and typecheck one scaffolded component with `tsc --noEmit` against `dist/*.d.ts`. `src/cli.test.ts:23` _(unverified)_
- [ ] Add one `src/test-helpers.ts` with `captureWarnings`/`captureErrors` (always `try/finally`); the suite has ~20 hand-rolled variants and two competing `captureWarnings` definitions, and two sites restore _outside_ the try so one failure permanently stubs `console.warn` for the rest of the file. `src/component.test.ts:583,878,1965` _(unverified)_
- [ ] `src/cli.test.ts` never cleans its `mkdtempSync` dirs — **2,197 `tosijs-cli-*` directories on this machine right now** (verified this session). Add a `beforeAll` root + `afterAll` rm. _(verified)_
- [ ] `docs/iife.js` ends with `//# sourceMappingURL=iife.js.map` while `.gitignore:140` keeps the map uncommitted (verified this session) — every tosijs.net visitor with devtools open triggers a failed fetch, and the dev server answers it with SPA HTML. Set the docs bundle's `sourcemap` to `'none'`, the same one-place decision `BundleSpec` now encodes for the npm bundles. `bin/site.ts:419` _(unverified)_
- [ ] The scaffolder stamps `1.8.0-rc.3` into generated `index.html`/README CDN URLs and `package.json` deps — anyone publishing a scaffolded package pins third parties to an RC on jsdelivr forever. Emit the last stable line (or `tosijs@1`) when `version` is a prerelease. `bin/cli.ts:253` _(unverified)_
- [ ] Restore the released `## [1.8.0-rc.2]` CHANGELOG entry to what rc.2 actually did (it was rewritten to describe rc.3's recovery-clearing latch, and lost its `detail.repeated` mention), and add a `> Superseded by 1.8.0-rc.3` banner under its own heading. `CHANGELOG.md:81` _(unverified)_
- [ ] `docs/version.json` stamps a commit one behind the release; carry `package.json`'s version alongside the hash so release identity is unambiguous. _(unverified)_

### → GitHub issue on the UPSTREAM repo, mirrored in `UPSTREAM.md`

_(lens: ecosystem — no direct edits to other repos)_

- [ ] **File on `tonioloewald/tosijs-ui`:** ask `buildSite` to (a) expose the expanded docPath source list and emitted slug map — or run the internal-link check itself — and (b) emit a `docs/404.html` so a bad link is loud on a case-sensitive host instead of falling into the SPA fallback. `extractDocs()` is already exported and `docs/docs.json` is already written before the gate runs, so the local copy could consume the real expansion today. Mirror the URL in `UPSTREAM.md`. Also mirror already-open **tosijs-ui#66** (site builder: generated-doc blocks / core tier / size gate) — the umbrella for all four hand-rolled gates now in `bin/site.ts` — and **tosijs-ui#103** (dangling sourcemap / SPA fallback answering asset paths), whose second half is the same seam.
- [ ] **File on `oven-sh/bun`:** ask for `npm_config_tag` parity, or any documented env/argv exposure of `--tag` to publish lifecycle scripts, so a `prepublishOnly` hook can enforce dist-tag routing. Cite that npm sets it and bun does not. Mirror in `UPSTREAM.md` (which currently has no `bun` section at all).
- [ ] **File on `tonioloewald/tosijs-ui`:** ask for a shared `tosijs-check-publish-tag` bin alongside the five dev bins it already publishes — precedent is open tosijs-ui#85. Link `bin/check-publish-tag.ts` (post-M8 fix) as the working implementation.
- [ ] **Incoming — dispositions owed at publish:** correct TODO E3 (#18/#22/#23/#24 are **closed**, dates 2026-08-21/24 — verified); add **#27** with the partial-fix caveat from M7; record STILL-OPEN dispositions for **#26** (unknown keys silently dropped — state the #24↔#26 boundary explicitly in the release notes, since a reader will assume `Component.computed`/#24 means props are checked), **#17** (proxy identity — `src/xin.ts` untouched, say so; note the irony that this release introduced the monotonic counter #17 asks for, unexported), **#16** (semantic-parent accessor — untouched), and **#9** (oldest open, 2025-04-28 — `list-binding.ts` saw only a prettier sweep; run a reproduce-or-close pass rather than rolling it into a fourth release undispositioned).
- [ ] `tjs-lang` is pinned to `0.10.1`, which is **npm-deprecated** naming our exact dependency combination ("tosijs-schema >=1.5.0 breaks the battery atoms' output validation… Upgrade to 0.13.1"), and it builds the published `tosijs/debug` + `tosijs/safe` bundles. `bun.lock` holds the nested `tosijs-schema@1.4.0`, but `package.json`'s own `"latest": "rm -rf node_modules && bun update"` script walks the `^1.4.0` to 1.8.0 silently. Bump to 0.13.3 or add a `tosijs-schema` override; narrow our own `^1.6.0` (TODO E6). Also fix `UPSTREAM.md:305`'s now-false "no version we can install carries the fix" (contradicts `:259` forty lines above). _(verified)_
- [ ] **Discoverability follow-up (from a refuted finding):** a reviewer reasonably concluded tosijs-ui#49 was unfixed because it is CLOSED here while an identical open #100 exists upstream — #100 turned out to be a stale-pin re-report from tosijs-3d (pinned 1.9.8, pre-fix). `UPSTREAM.md` records closed upstream issues without the **version the fix shipped in**, which is the fact that settles it. Add "fixed in `<version>`" to closed UPSTREAM.md entries (#49 → tosijs-ui 1.10.0, commit `011f7134`).

### → shared `tosijs-coding-practices`, and/or this repo's `CLAUDE.md` / `AGENTS.md`

_(lens: practices)_

- [ ] **M8 write-back:** correct `practices/releasing.md:389-409` — add the `npm_config_user_agent` carve-out (hard-block under npm, warn-loudly-and-pass under bun, paired with a mandatory `npm view <pkg> dist-tags`), note that `--tag latest` **and** `bun publish --tag X` both leave `npm_config_tag` unset, and reconcile with `publishing-via-oidc.md:4`'s `bun publish --otp` recommendation. Attribute `— seen in: tosijs 1.8.0-rc.3`.
- [ ] **M9:** run the read direction — `git -C ../tosijs-coding-practices log --oneline --since=2026-08-07` (49 commits) — and disposition each in a TODO.md subsection headed with the range. Adopt `reviews/<version>-<slug>.md` (`git mv` the five bare-root reports, which also settles P6) or record the divergence in `00-stack.md` § Known divergences. Strike P6 and replace it with the real remaining work. Add "read the KB diff since the last release" as a numbered step in CLAUDE.md's Releasing list.
- [ ] **M10:** replace CLAUDE.md:71-72's inline pin rationale with a pointer to `UPSTREAM.md § tjs-lang` (link, don't paraphrase — `practices/cross-project.md`), and correct the third copy in `~/.claude/…/memory/MEMORY.md:90-91`. Give the HOLD block a `bin/stamps.ts`-recognisable date stamp so it surfaces for re-survey.
- [ ] Write back the release's most generalisable lesson, which was **not** captured: (a) `code-quality.md`/`review.md` — a cache in a security path is only as correct as its invalidation; enumerate the signal shapes the key **cannot** see before accepting the trade, and prefer reverting to repairing; (b) `testing.md` — assert a security property with **no** intervening `await`, because a test that steps around the synchronous window proves nothing (the two rc.2 guard tests passed for exactly this reason). Cite the five reproductions in `src/agent.test.ts`. _(unverified)_
- [ ] `tools/pre-release-review.workflow.js:109` still prescribes the destroyed `docs/reviews` path (third instance of this two-copy drift; `review.md:713`'s own ⚠️ predicts it). Reword to `reviews/`, and add a KB check asserting `grep -rn 'docs/reviews' practices/ tools/` returns only the deliberate NOT-this-path lines. _(unverified)_
- [ ] Update the shared scoreboard row (`../tosijs-coding-practices/README.md:133`) — still `1.7.9` / "1.8.0-rc.1 in flight" / as-of 2026-08-17, while `rc: 1.8.0-rc.3` and **rc.2 is npm-deprecated for a secret-redaction regression**. The row already names 1.7.6/1.7.7 as deprecated, so the silence about rc.2 reads as "fine". This is step 9 of the ceremony this release added. _(unverified)_
- [ ] Route round-4's remaining unworked findings into TODO.md with a `Commit range covered:` line (round 3's shape), and append a disposition footer to `REVIEW-1.8.0-rc.2-round4.md` — its first screen still reads "🛑 BLOCK — do not tag or publish 1.8.0 until B1 is resolved" for a blocker `c62f1f8` reverted, while rc.3 is tagged and published. Genuinely residual: README/llms.txt size-figure drift (`~27kB` vs `~28 kB`), `Building-Apps.md:647`, `src/index-agent.ts:24-25`, the unguarded `settings.quiet` site at `component.ts:1101`, CLAUDE.md's three-build-gates list. _(verified, severity adjusted to minor)_
- [ ] CLAUDE.md enumerations drifted again: "Build gates" names 3, `bin/site.ts` enforces 7 (incl. `checkInternalLinks()`, which runs **before** `buildLibrary()` and aborts `bun start`); docPaths lists 5, config has 12. Replace both with pointers. Add the missing `static contract` bullet (third consecutive release, TODO P5) — declaring both `contract.attributes` and `initAttributes` throws with no doc warning. Then close the class structurally with haltija's `docs-coverage.test.ts` CONCEPTS mechanism. _(unverified)_
- [ ] `REVIEW-1.8.0-rc.2-round4.md`'s first byte is a stray `n` (botched heredoc `\n`) so its H1 never renders, and its filename names rc.2 while its header declares base rc.1. Give the round-3 and security reports `<base>..<sha>` header lines (TODO P3, unmet for a third cycle) and add "state the range" as step 6 of the KB's `CONTRIBUTING.md`. _(unverified)_

---

## Completeness notes

- **Unit suite green:** 887 pass / 0 fail across 35 files (run this session). No red or skipped unit tests.
- **Browser lane never ran** — that is B2, not a pass. `tests/doc-tests.pw.ts` and `tests/value-commit.pw.ts` have zero executions for this release. This must be green before tagging.
- **One permanently-red, ungated tier** is scheduled above, not waved away: `tjs convert`'s 8 signature failures on `src/color.ts`, printed every build while the summary reports `0 failed`.
- **Unverified findings are marked `(unverified)`** — leads, not confirmed defects. None of them drives the verdict; sanity-check before acting.
- **Working tree is dirty** (`docs/iife.js`, `docs/tosijs.epub`, `docs/version.json`) from a build in a parallel session — reconcile before the release commit. This review made no edits.
- **Severity adjustments applied from verification:** coverage's `Component.computed` blocker → major (M3); docs' "no user-facing documentation" major → minor; dryness' duplicated-predicate and dead-`bindingGeneration` majors → minor; ecosystem's `checkInternalLinks` major → minor; practices' round-4-routing major → minor.
- **One finding was refuted** (tosijs-ui#49 treated as unfixed): #49 shipped in tosijs-ui 1.10.0 (`011f7134`) and the fix is present in the installed artifact; upstream #100 is a stale-pin re-report from tosijs-3d. Reported above only as the discoverability fix it points at.
