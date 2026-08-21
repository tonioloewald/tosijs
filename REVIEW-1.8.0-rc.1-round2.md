# Pre-release review triage — tosijs 1.8.0-rc.1 (base `v1.7.9`, HEAD `229a70d`)

**VERDICT: BLOCK** — 1 adversarially-confirmed blocker + 4 correctness defects verified live during this triage, all on the release's headline feature. 58 remaining findings routed as follow-ups.

---

## Gate status (observed read-only this session)

| gate                                                  | result                                                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bun test src/`                                       | **804 pass / 0 fail** (6.2s, 34 files)                                                                                                                                                                 |
| `npx eslint src bin`                                  | clean (per findings; zero-lint baseline holds)                                                                                                                                                         |
| `npx prettier --check package.json src/index-core.ts` | **RED** — 2 files unformatted                                                                                                                                                                          |
| `bun run test:browser` (mandatory for DOM changes)    | **never run against this branch**; `tests/` is byte-identical to v1.7.9                                                                                                                                |
| CI (`.github/workflows/ci.yml`)                       | **never executed** — triggers on `main` only; this branch is deliberately local                                                                                                                        |
| `tjs convert` signature lane                          | **8 red** in `src/color.ts`, exit 0, swallowed by the build                                                                                                                                            |
| working tree at review time                           | **dirty** — a `bun bin/site.ts` dev server (pid 27294) is live and rewriting tracked `docs/version.json`, `docs/tosijs.epub`. Stop it before tagging; it also rewrites the tracked `src/schematic.ts`. |

## Per-lens summary

- **correctness (6)** — 4 defects verified live here, all in the new agent surface: manifest-scope leak in `describe()`, plaintext password values, non-idempotent `disable()`, read-only surfaces publishing act tools that always throw. Plus two upgrade-timing/attribute-coercion issues in `elements.ts`.
- **efficiency (6)** — the ledger is an O(maxLog) `splice` per touch once saturated (~8% throughput tax, no opt-out); `changes()` is quadratic via `unshift`; `inlineSchemaFor()` scans every bound element per write; `webmcpTools()` forces a full-document layout read at boot. All confirmed by code shape; none is a ship-stopper.
- **dryness (7)** — two competing contract-validation gates where "curation wins" makes `describe().contract` advertise constraints `write()` does not enforce; `audit.ts` re-implements (and has drifted from) `schematic.ts`'s interactivity/target-size rules; the contrast rule mis-reads `rgba(0,0,0,0)`.
- **docs (6)** — EXPERIMENTAL appears in every source doc block and in **none** of README/CHANGELOG/Migration.md; `static contract`/`ComponentMap` is absent from the canonical component reference; README and `/history/` still promise "old names still work" — falsified by this release.
- **coverage (7)** — the gzip budget test is inert during `bun run build` (`dist/` is wiped first); the `expose: 'all'` warning assertion can never fail; `dist/cli.mjs` is never executed; the `settings.quiet` fix landed with no test; 8 red `tjs convert` signature tests every build.
- **dx (11)** — the blocker, plus `tosijs/core`'s doc block claiming it contains the agent surface (it does not), a warning pointing at a nonexistent `tosijs/blueprints` subpath (already baked into `dist/core.js`), `tosijs/state` emitting a Node MODULE_TYPELESS warning with no `require` condition, and contracts failing open with no signal.
- **ecosystem (8)** — 4 open issues (#18/#22/#23/#24) are fixed by this release and still open; haltija#16 and tosijs-ui#59 are explicitly gated on this release shipping and have not been told; two tjs-lang converter seams and one tosijs-schema seam need filing.
- **practices (12)** — the shared KB teaches the pre-1.8.0 `on<Event>` rule at five sites and still teaches removed `xinSlot`/`<xin-slot>`; the nine-lens process has **no security lens**, so the one release whose headline feature is a remotely-drivable control surface shipped with `security: NEVER RAN`; `00-stack.md` says tosijs has no CI; `review.md` files reports into the directory the build `rm -rf`s; CLAUDE.md mandates `git push` on a branch the user forbids pushing.
- **blast-radius (8)** — the WebMCP `provideContext` path replaces and (on unregister) **blanks** the page's entire model-context tool set including tools tosijs never registered; `globalThis.tosiAgent` is installed with no collision detection; the scaffolder writes unpinned CDN URLs into every generated project and README.

---

## BLOCKERS (must be resolved before tagging)

### B1 — Public named exports removed in a MINOR bump; the stated justification is false ✅ CONFIRMED

`package.json:3` · lens: dx / blast-radius (merged)

`git show v1.7.9:src/index.ts` exports `xinSlot`, `blueprint`, `blueprintLoader`. All three are gone at HEAD (`src/component.ts:1989`: "`<xin-slot>` was deprecated through 1.7 and REMOVED in 1.8.0"), and their absence is pinned by tests (`component.test.ts:460`, `blueprint-loader.test.ts:435`). `CHANGELOG.md:5` claims semver adherence.

The justification is wrong in **two** documents, not one. `git grep -n "1\.8\.0" v1.7.9 -- src/` returns exactly three hits, all about `data-ref`. The 1.7.9 warnings for the other three named no version (`'<xin-slot> is deprecated. Use <tosi-slot> instead.'`). So `CHANGELOG.md:161-162` ("likewise" = "deprecated through 1.7 with 1.8.0 named in its warning") and `Migration.md:18` ("Removed (deprecated through 1.7, with 1.8.0 named in their warnings)") both assert a promise that was never made.

The tombstone mechanism (`blueprint-loader.ts:352-378`) covers `xin-blueprint`/`xin-loader` **markup only** — nothing catches `import { blueprint } from 'tosijs'`, and `<xin-slot>` got neither an export nor a tombstone.

**Fix — pick one:**

- (a) publish as `2.0.0-rc.1` (the removals + relicense + `on<Event>`/attribute behaviour changes are collectively a major, and Migration.md's new section already reads as major-release notes), **or**
- (b) keep 1.8.0 and restore `xinSlot`, `blueprint`, `blueprintLoader` as three-line deprecated aliases whose warning names `"removed in tosijs 2.0"`.

Either way, **correct the "with 1.8.0 named in its warning" claim in both `CHANGELOG.md` and `Migration.md`** so it applies only to `data-ref`. That documentation fix is required regardless of the semver decision.

### B2 — Manifest mode does not scope `describe()`: the allowlist leaks private action paths and live DOM content ✅ VERIFIED LIVE THIS SESSION

`src/agent.ts:846` · lens: correctness

Reproduced in-process:

```
enableAgentInterface({ expose: { roots: ['p4pub'] } })
describe().wiring → [{"tag":"button","on":{"click":"p4secret.wipe"},"text":"wipe",…}]
```

Data bindings _are_ filtered (`if (!inScope(b.path)) continue`, line 817) but the `eventBindings` loop has no `inScope` check and sets `wired = true` unconditionally. Because `wired` flips true, the record then harvests `text`, the live `value` of unbound form controls (lines 872-887), `label`, `href` and geometry for elements the manifest deliberately excluded. The production posture the docs recommend leaks the private action namespace and arbitrary DOM content of non-exposed regions.

**Fix:** filter handler entries through `inScope(path)`; only set `wired` if at least one survives (or record `'ƒ'` for out-of-scope named handlers). Add a manifest-mode `describe()` test — that gap is why this shipped.

### B3 — `input[type=password]` values are emitted in plaintext by the default surface ✅ VERIFIED LIVE THIS SESSION

`src/agent.ts:1274` (describeElement) · lens: correctness

```
input({ type:'password', bindValue:'probe3.secret' })
describe().wiring → [{"tag":"input","type":"password","value":"hunter2 ⟷ probe3.secret",…}]
```

No redaction anywhere in `src/` for `password` or `autocomplete`. Compounding it, the default `enableAgentInterface()` (read-only) still installs on `globalThis.tosiAgent` (`global` defaults true) where any third-party script can `read()` the **whole** registry with no allowlist, and auto-registers `tosi_read`/`tosi_describe` with a browser model-context host (`webmcp` defaults true). The 1.8.0 "safe by default" change (2b790da) gated only `write`/`call`; the read side is unrestricted.

**Fix:** redact `input[type=password]` and `autocomplete="current-password"/"new-password"` in `describeElement` (emit the arrow+path, not the value). Separately decide and document the read-side default: either `global: false` when no `expose` manifest is given, or scope read-only reads the way manifest mode scopes them. Document that `describe()` returns live user-entered content.

### B4 — `disable()` and the `observe()` un-subscriber are not idempotent, and tear down partially ✅ VERIFIED LIVE THIS SESSION

`src/agent.ts:1257` · lens: correctness

```
const a = enableAgentInterface(); a.disable(); a.disable()
→ Error: unobserve failed, listener not found   (path-listener.ts:301)
```

Same in the documented reconfigure flow (`enableAgentInterface()` auto-calls the previous surface's `disable()`; the app's own cleanup then throws), and in the closure returned by `agent.observe()` (agent.ts:1152-1155). Worse than the throw: `disable()` unregisters WebMCP and deletes `surface.webmcp` (1254-1256) **before** `unobserve(ledgerListener)` throws, so `subscriptions`, `pendingWhens` and `globalThis[activeGlobalName]` are never cleaned up. And because `activeGlobalName` is module-level, a stale surface's `disable()` — once the unobserve is made safe — deletes the _current_ surface's global.

**Fix:** guard `disable()` with a `disabled` flag (idempotent no-op), same for the `observe()` closure; capture the global name in a per-surface `const` and delete only when `globalThis[name] === surface`. Regression tests for double-disable and double-unsubscribe.

### B5 — Read-only surfaces publish `tosi_act_*` WebMCP tools whose every invocation throws

`src/webmcp.ts:130` · lens: correctness

Confirmed by code: `for (const actionPath of description.actions) tools.push({ name: toolName(prefix,'act',actionPath), … })` runs unconditionally, while `tosi_write` was correctly gated behind `allowWrites`. In read-only mode `describe().actions` is the _discovered_ function walk over the whole registry, so a browser agent is handed a menu of every app function as a callable tool and every one fails at call time with `refused — this surface is read-only introspection`.

**Fix:** skip the per-action tools when `description.exposure === 'read-only'`, or gate them on the same consent axis as `tosi_write`. The tool set must advertise only what the surface will execute.

---

## Follow-ups — file to this repo's `TODO.md`

_(lenses: correctness / efficiency / dryness / docs / coverage / dx. All unverified unless noted; sanity-check before acting.)_

### Correctness & security posture

- [ ] `globalThis.tosiAgent` is installed with **no collision detection**, and `disable()` deletes the name even when another tosijs copy owns it (`src/agent.ts:1274`). Two copies on a page is a scenario this release actively promotes (`bunx tosijs create blueprint` scaffolds a CDN copy alongside a bundled one). Warn once on collision, naming the `global: 'name'` / `global: false` escape hatch; delete only when `globalThis[name] === surface`. _(unverified)_
- [ ] WebMCP `provideContext` path **replaces and, on unregister, blanks** the page's entire model-context tool set — including tools tosijs never registered (`src/webmcp.ts:235`; `webmcp.test.ts:119` pins the destructive behaviour as correct). Warn once on that host shape; make `unregister()` restore the observed prior context or no-op. Document in the webmcp doc block + CHANGELOG, not just a source comment. _(unverified)_
- [ ] `on<Event>` "assign if the member is already a function" depends on **custom-element upgrade timing** — `document.createElement('x')` before `customElements.define` gets event sugar; after, gets assignment. This is exactly the blueprint case (`<tosi-blueprint>` hydrates async). Base the decision on `customElements.get(tag)?.prototype` rather than a live probe, or extend the warning to say the behaviour is undefined pre-upgrade. Pin the blueprint case with a test. (`src/elements.ts:599`) _(unverified)_
- [ ] tosijs#24 attribute type-mismatch route **stringifies across the connect boundary**: `creator({ mode: false })` reads `false` before append and the truthy string `"false"` after (`src/elements.ts:492`). The console.error on that path asserts "nothing is coerced", which is not what happens. Coerce or refuse; fix the message; assert the value both before and after `connectedCallback`. _(unverified)_
- [ ] `toolName()` collapses every non-alphanumeric char, so `app.do.thing` and `app.do_thing` collide on `tosi_act_app_do_thing` (`src/webmcp.ts:68`). Disambiguate while building the list; keep the original `actionPath` in the description. _(unverified)_
- [ ] `settings.quiet` **cannot** suppress the `tosijs/core` blueprint warning it was added for — the gate is a module-level `if` evaluated at import, before consumer code runs, and `check()` never re-reads it (`src/index-core.ts:39`, confirmed by reading). Move the read inside `check()`.
- [ ] **`share.ts` / `sync.ts` / `hot-reload.ts` bypass contract enforcement entirely.** Contracts are checked only at `component.ts:1187` (value setter) and in `agent.write`. A BroadcastChannel peer, a `SyncTransport` server, or a hot-reload restore writes illegal state straight into the registry — the exact state an agent is refused. The release's "declared contracts are enforced" claim has a hole. (from completeness gaps)

### Contracts

- [ ] **Two contract-validation paths, and "curation wins" silently disables inline contracts that `describe()` still advertises** (`src/agent.ts:1126`). Verified by the lens against the real surface: `describe().contract` returns `{"ord.qty":{"type":"integer"}}` while `write('ord.qty','not an integer')` is **accepted**. Also two unrelated plug-in seams for one concern (`AgentContract.check` vs `setContractValidator`). Collapse to one gate, or make them compose; at minimum stop emitting inline schemas that `write()` will not enforce. _(unverified)_
- [ ] **Contract validation fails open silently** (`src/contract-check.ts:17`): only `const`/`enum`/`type` are enforced; `required`/`properties`/`minimum`/`pattern`/`format`/`items` are inert with no warning, so the same shipped blueprint behaves differently depending on whether the host registered a validator. `contract.test.ts:442` pins the loose pass as correct. Warn once per schema carrying unenforceable keywords; document the enforced subset; change that test to assert the warning. _(paired with the upstream tosijs-schema issue below)_ _(unverified)_
- [ ] `static contract` is **not declared on `Component`**, so `static conract = {…}` type-checks and silently does nothing; and `initValue()` bails unless `value` is an own data property, so accessor-pair components never install the checking setter; and `checkValueContract`'s `hasOwnProperty` gate silently drops inherited contracts (`src/component.ts:1165`). Declare `static contract?: ComponentMap`; warn when `contract.value` is declared but `initValue()` bailed; decide and document inheritance. _(unverified)_
- [ ] `exerciseContract` counts a **surface refusal** (read-only / not exposed) as a passing counterexample (`src/contract.ts:108`) — a contract with only `$counterexamples` yields a fully green report from a harness that validated nothing. Classify the caught error; or throw up front when `exposure === 'read-only'`. _(unverified)_
- [ ] "Own static contract, never inherited" is hand-rolled at six call sites (component.ts:638/871/1676, agent.ts:918, contract.ts:162, make-component.ts:129). Extract `ownContract(cls)`. _(unverified)_

### Efficiency (agent surface hot paths — all confirmed by code shape)

- [ ] Ledger "ring buffer" is an **O(maxLog) `splice` on every touch once saturated** (`src/agent.ts:749`) — measured ~8% permanent throughput regression from round 3 onward, ~1.6 MB retained, and `maxLog: 0` is degenerate (still allocates + splices). Amortize the trim (or use a head index), and make `maxLog: 0` / `log: false` mean _don't record_.
- [ ] `changes()` builds its result with `unshift()` in a reverse loop → quadratic (`src/agent.ts:1236`; measured 9.8 ms @5k paths, 28.7 ms @10k). `push()` + one `reverse()`.
- [ ] `inlineSchemaFor()` materializes **every bound element in the document on every `agent.write()`** (`src/agent.ts:592`). Keep a module-level set of contract-bearing elements populated by `setElementContract()`, or short-circuit on a `hasAnyInlineContracts` boolean.
- [ ] `webmcpTools()` runs a full `agent.describe()` — whole-document walk plus `getBoundingClientRect`/`getComputedStyle` — at enable time purely to read `description.actions` (`src/webmcp.ts:80`). Fires a layout flush during app boot. Give the surface a cheap actions accessor.
- [ ] `bindingName()` / `propBindingKey()` do linear identity scans per bound prop per record in `describe()` (`src/agent.ts:629`) — ~30k comparisons on a 500-element map. Build `Map<XinBinding,string>` reverse lookups once. _(nit)_
- [ ] **`describe()` has no benchmark or budget** on the path WebMCP hosts may call every turn, while all four bundles now have gzip budgets. Add one. (from completeness gaps)

### Renderer / audit consistency

- [ ] `audit.ts` re-implements schematic's interactivity + target-size predicates and **has already drifted** in three places (`href`, list-container ground, label-vs-text exemption) — a report and its drawing of the same map disagree (`src/audit.ts:72`). Make audit the single implementation and pass `auditFlags(report)` into `schematicSVG`'s `flags`; test that they agree on a shared fixture. _(unverified)_
- [ ] Contrast rule ignores alpha: `contrastRatio('rgb(17,17,17)','rgba(0,0,0,0)')` → 1.11, so in a **real browser** it fires a severity-`error` on nearly every element (`src/audit.ts:211`). `schematic.ts:255` already defines the `TRANSPARENT` sentinel; audit re-derived colour handling without it. Every audit fixture uses an opaque background, which is why it is untested. Treat alpha<1 as unknown (→ `skipped`) or resolve the effective ancestor background; add a transparent fixture. _(unverified)_
- [ ] Until the shared predicate lands upstream, disclose the audit/renderer divergence in the audit doc block and the CHANGELOG's audit bullet (link tosijs-floorplan#4). _(unverified)_
- [ ] `boundsOf()` (schematic, window scroll only) and `measureBounds()` (agent, accumulates every ancestor's scroll) compute "page coordinates" by different rules, so the documented `within: boundsOf(el)` idiom mis-selects in any inner-scroll app (`src/schematic.ts:224`). One definition, plus a scrolled-container test. _(unverified)_
- [ ] `BOUND_TO_DOM`/`BOUND_TWO_WAY` and the record shape are declared twice (agent.ts producer, vendored schematic.ts consumer) with **no conformance test**, and `vendorSchematic()` overwrites schematic.ts on every build. Add `expect(schematic.BOUND_TWO_WAY).toBe(agent.BOUND_TWO_WAY)` plus one real-`describe()` round trip. _(unverified)_

### Docs

- [ ] **EXPERIMENTAL is in every source doc block and in none of README / CHANGELOG / Migration.md.** Add the marker to the README entry-points row for `tosijs/agent`, a callout at the head of the CHANGELOG's agent-surface section, and a note in Migration.md — and say concretely what stability _is_ promised.
- [ ] **`tosijs/core`'s own doc block claims it contains "the agent surface, the schematic renderer"** — it does not (`grep -c enableAgentInterface dist/core.js` → 0), and it contradicts the "Not included" table five lines above (confirmed by reading `src/index-core.ts:18`). Delete the clause, add both rows to the table, regenerate `docs/` + `llms.txt`.
- [ ] **The slim-entry warning tells developers to `import "tosijs/blueprints"` — a subpath that does not exist** in `exports` (confirmed: only `.`, `./debug`, `./safe`, `./core`, `./state`, `./agent`). It is already baked into the committed `dist/core.js`, so a source-only fix does not ship. Drop the parenthetical (and the matching "or from their own subpaths" at `src/index-core.ts:9`) and rebuild.
- [ ] **`static contract` / `ComponentMap` is entirely absent from the canonical component reference page** (`src/component.ts:324` doc block; "contract" appears in `docs/component/index.html` only in a nav link). Meanwhile `contract.attributes` **supersedes** `initAttributes` and declaring both throws. Add a `#### static contract: ComponentMap` section and a "superseded by contract.attributes" note on the `initAttributes` section.
- [ ] **README and `/history/` still promise "old names still work"** — falsified by this release (`src/docs/history.md:73`, `README.md:470`). The rc.1 review already flagged these exact sentences; only Migration.md's front matter was fixed. Scope both to the surviving aliases and link the new Migration section.
- [ ] `CLAUDE.md`'s "Core modules" map omits all six new modules (`agent.ts`, `contract.ts`, `contract-check.ts`, `schematic.ts`, `webmcp.ts`, `audit.ts`) and the five entry modules — ~4,000 lines of new public surface invisible to the doc every agent reads first. _(also see the practices section)_
- [ ] The headline feature is filed under **"Utilities"** in the doc nav, alphabetically next to `debounce`, and unreachable from the README (which contains exactly one internal link, `/history/`). Add a README "Agent surface" section; consider re-parenting the five modules.
- [ ] CHANGELOG heading `## [1.8.0] - 2026-08 (rc.1)` does not match the shipped version `1.8.0-rc.1` and has no ISO day. Pick a convention and record it in CLAUDE.md §Releasing.
- [ ] `headless-embodiment.md:2`'s front-matter advertises **`elementsSSR` as a tosijs API** — it does not exist (`grep -rn elementsSSR src/ bin/` → nothing) and that string ships in the npm-published `llms.txt:47`. Reword and rebuild. _(nit; flagged unfixed at REVIEW-1.8.0-rc.1.md:218)_
- [ ] `agent-surface.md:93` still speculates about "a tree-shaken `tosijs/agent` subpath is the likely published shape" — it shipped, and differently. And `REVIEW-1.8.0-rc.1.md` sits at the repo root asserting resolved claims as current. Fix the comment; date-stamp, move to `reviews/`, or drop the report. _(nit)_

### Coverage — every red or inert test below stays scheduled; none is waved away

- [ ] **The gzip budget test never runs during `bun run build`**: `buildSite()` does `rm -rf dist` before `buildLibrary()` runs `bun test src/`, so every `if (!existsSync(file)) continue` fires and the loop asserts nothing (`src/entries.test.ts:195`). A 26.5 → 33 kB regression would ship fully green and trip only on the _next_ developer's local run. Move the check into `buildLibrary()` after the smoke-import loop, or fail loudly under `TOSIJS_REQUIRE_DIST=1`.
- [ ] **8 red `tjs convert` signature tests on every build** — `src/color.ts: 0 passed, 8 failed` (`✗ Signature: … clamp is not defined`), and `tjs convert` exits 0 so `bun run build` reports success (`bin/site.ts:150`). Pre-existing, **not dismissed**: the tjs signature tier is red on the artifact this release is cut from and a new failure is indistinguishable from it. Fix the cross-module resolution or explicitly allowlist a known count with a reason. _(paired with the upstream tjs-lang issues below)_
- [ ] **The `expose: 'all'` consent-warning assertion can never fail** (`src/agent.test.ts:921`): `exposeAllWarningGiven` latches once per process and is already spent by line 19, and the assertion is `… || warnings.length === 0`. Delete the whole warn block and the test still passes — and that warning is the only signal that every state root is writable through a page-global. `readOnlyNoticeGiven` has no test at all. Export a test-only reset (the pattern already exists — commit 1da80d8 did it for the deprecation registry) and assert unconditionally.
- [ ] **`dist/cli.mjs` — the new published `bin` — is never executed by any test or gate.** `src/cli.test.ts:8` spawns `bun bin/cli.ts` (the _source_, under _bun_); `npx tosijs` runs the _bundle_ under _node_; the build's smoke-import loop deliberately excludes it. A lost shebang, lost exec bit, or bun-only construct ships green. Add `node dist/cli.mjs create component smoke-widget` in an mkdtemp dir to `buildLibrary()`.
- [ ] The `settings.quiet` fix (3712566) shipped with **no regression test**, and the test that looks like it covers it asserts a tautology (`src/entries.test.ts:220` collects `warnings[]` and never asserts on it). Assert the message fires with blueprint markup, does not fire with `settings.quiet = true`, does not fire on a clean page.
- [ ] **No compile-time verification of `PartsOf<T>` / `Component<typeof contract>`** — the release's headline type feature. Both tsconfigs exclude `src/**/*.test.ts` and bun strips types, so every consumer of that promise lives in files tsc never sees; `type-inference.test.ts`'s `@ts-expect-error` probes are inert. Add one _included_ `src/parts-typing.types.ts` with positive assignments + `@ts-expect-error` cases.
- [ ] `measureBounds()`'s scroll accumulation and fixed/sticky detection are **untested in both tiers** (`src/agent.ts:426`) — happy-dom reports zeros, and the one geometry test takes the `viewportView` early-return. A sign error would misplace every box in every schematic on inner-scrolled apps. Add one Playwright case.
- [ ] `state ⊆ full` has no parity test. `getByPath`, `setByPath`, `deleteByPath`, `pathParts`, `id` are exported from `tosijs/state` and **verified absent** from `src/index.ts`, `src/index-core-exports.ts`, `src/index-browser.ts` and `dist/module.js` — while `src/index-state.ts:16` claims "everything here is identical to the same export from `tosijs`". Factor `index-state-exports.ts` so the subset holds by construction, and assert it in `entries.test.ts`.
- [ ] CLI error/info branches untested (help/version/unknown command/unknown kind/`existsSync` collision), and the scaffolded **app** is generated but never executed — unlike `create component`, which has a real harness proof at `cli.test.ts:77`. _(nit)_
- [ ] `src/cli.test.ts` leaves six `tosijs-cli-*` temp dirs per run, never cleaned — and `bun run build` runs the suite. Add `rmSync` in `afterAll`. _(nit)_

### DX / packaging

- [ ] **`tosijs/state` emits `MODULE_TYPELESS_PACKAGE_JSON` on every Node import** (verified on node v22.22.1) and has **no `require` condition** — yet it is sold precisely for plain Node, workers, SSR and migration scripts, the CJS-likeliest audience. The build already knows the fix: `buildCli()` emits `.mjs` for exactly this reason. Emit `dist/state.mjs` / `dist/core.mjs` and point the conditions at them; add CJS builds + `require` conditions, or state ESM-only in the doc block and README.
- [ ] `dist/main.js` (CJS, cannot tree-shake) grew **~49% gzipped (25.0 → 37.3 kB)** carrying the agent surface, and is the **only published entry with no size budget** in `src/entries.test.ts`. ESM shakes it out cleanly (verified 22.3 kB gz, no agent symbols); CJS consumers have no slim door because `./core` and `./state` declare only `import`/`default`. Add `dist/main.js` to the budgets map; either point `exports['.'].require` at a CJS build of `index-browser.ts` or ship the agent as a split chunk. Note `module.js` sits at 36,967 / 37,500 — 533 bytes of headroom.
- [ ] `index-browser.ts` **copy-pastes** index.ts's non-core export block, violating the rule `index-core-exports.ts` states in its own header. A new full-entry export trips the core-superset test but nothing forces it into the CDN/`<script>` artifact. Extract `index-full-exports.ts`, or assert the set difference.
- [ ] `contract` became a **reserved element-creator prop with no collision warning** (`src/elements.ts:585`) — a component with a legitimate `contract` attribute can never be configured through its own creator, silently. Warn on a non-object value or a declared `contract` attribute; document it in the reserved-keys list. _(unverified)_
- [ ] **Ungated `console.log` breadcrumbs** drown this release's three careful one-time diagnostics: `hot-reload.ts:44` logs on every debounced save (~every 500 ms of interaction), `blueprint-loader.ts:304` logs per cached blueprint. Meanwhile `enableAgentInterface()` `console.info`s on the _recommended default_ posture in production. Delete or gate the two logs; route the read-only notice through `settings.quiet` or drop it.
- [ ] **`bun run build` / `bun start` rewrites the tracked source file `src/schematic.ts`** from a floating `^0.3.0` devDependency (`bin/site.ts:46`) — two contributors on different days get different committed source from the same commit, and every `bun start` dirties the tree. **Observed live during this review:** a `bun bin/site.ts` dev server (pid 27294) is currently modifying tracked `docs/version.json` and `docs/tosijs.epub`. Pin the version exactly; run `vendorSchematic()` only under `--build` (verify-and-fail otherwise); wrap the `Bun.file` read with a "run bun install" message; fix the dead `headerEnd` guard at `bin/site.ts:62` (`indexOf(…) + 2` cannot be `< 2`). **Stop the dev server before tagging.**
- [ ] **`npx prettier --check` is RED** on `package.json` and `src/index-core.ts` (verified this session), and `package.json` is missing its trailing newline. Run `bun run format`, re-verify, and add `prettier --check .` to CLAUDE.md §Releasing.
- [ ] **`Migration.md` is not in `package.json` `files`** (verified: `["/dist","/LICENSE","/NOTICE","/README.md","/CHANGELOG.md","/llms.txt"]`) and is linked from neither the README nor the 1.8.0 CHANGELOG entry — so a consumer installing a release that _removes public API and changes the license_ has no path to the migration notes from what they installed. Ship it or link the hosted page from both.
- [ ] The scaffolder's flagship template needs **three `as any` casts** to type-check (`bin/cli.ts:171`) — the blessed pattern cannot be expressed in the library's own types, in the most-read code the project ships. Type `TosiComponentSpec.type` as a constructor and the blueprint factory arg from `ElementsProxy`. _(nit)_
- [ ] `tosijs-site.config.ts:41` lists the root markdown docs **twice** (`docPaths` and `watchPaths`); `bin/site.ts` has two near-identical `Bun.build` loops with only one checking `result.success`. Derive one list from the other; merge the loops. _(nit)_

### Blast radius

- [ ] **The scaffolder writes unpinned CDN URLs** into every generated `index.html` (`bin/cli.ts:218`) _and_ into the generated README (line 233, which npm publishes) — `cdn.jsdelivr.net/npm/tosijs/dist/module.js` resolves to `latest` forever. This release is its own proof: a scaffolded page built on 1.7 markup stops hydrating the moment 1.8.0 publishes. It is also an unpinned third-party script-execution surface. The CLI already pins `package.json` deps to `^${version}` — pin these the same way.

---

## Follow-ups — `UPSTREAM.md` + GitHub issues on the upstream repos

_(lens: ecosystem. **File issues on the upstream repo; never edit another repo directly.** Mirror each URL in this repo's `UPSTREAM.md`.)_

### Outgoing — issues to file

- [ ] **tonioloewald/tosijs-schema** — ship a dependency-free, vendorable structural core so there is ONE definition of `type`/`enum`/`const`/`required`/`minimum` semantics. Precedent exists in this ecosystem (tosijs-floorplan 0.3.0 is vendored into `src/schematic.ts` for exactly the zero-runtime-deps reason). Today tosijs hand-rolls a three-keyword subset that fails open, so the same shipped blueprint enforces differently per host — invisible from both directions (no issue on either repo). Mirror under `## tosijs-schema` next to the recorded RESOLVED #2. _(local interim guard is in the TODO section above.)_
- [ ] **tonioloewald/tjs-lang (a)** — `tjs convert` should exit non-zero (or report an accurate `N failed` summary) when any file's signature tests fail; today it prints 8 failures and exits 0, so `bun run build` swallows a red lane on every release. tjs-lang#24's own body flagged this as "may deserve its own issue" and it was never filed.
- [ ] **tonioloewald/tjs-lang (b)** — signature-test execution should resolve imported symbols (or skip and say so) rather than reporting `clamp is not defined` for `src/color.ts`, which imports it from `more-math`. Every function in that file goes unverified in the published `module.debug.js` / `module.safe.js`.
- [ ] **tonioloewald/tosijs-floorplan** — ask that the `esc()` workaround comment (`src/index.ts:213`, vendored into `src/schematic.ts:246-254`) carry the **tjs-lang#24 URL** and a note that tosijs vendors this file through a tjs converter. A maintainer rewriting that `.replaceAll('"','&quot;')` chain as a regex breaks the tosijs build two steps removed, with nothing explaining why. _(tosijs-floorplan#4 — the shared interactivity/target-size predicate — is already filed; keep it mirrored.)_
- [ ] **webmachinelearning/webmcp** — `registerTool` returns no handle and there is no `unregisterTool(name)`, forcing `src/webmcp.ts:178-229`'s module-level `registeredOnHost` WeakMap and register-once semantics, and making `unregister()` a lie on such hosts. This is the last `🚧 (to file)` entry in `UPSTREAM.md:133`, against the file's own preamble. If the deferral is deliberate, date-stamp it and name the condition that lifts it. _(nit)_

### Outgoing — mirror-only (issues already filed, missing from UPSTREAM.md)

- [ ] Add **tosijs-ui#49** ("docPaths are not watched") and **tosijs-ui#66** (generated-doc blocks / core tier / size gate) to `UPSTREAM.md`'s `## tosijs-ui` section with URLs and state. Put the #49 URL into the `watchPaths` comment at `tosijs-site.config.ts:53` with "delete this block when #49 lands" — otherwise a workaround for a fixed upstream bug becomes permanent convention.
- [ ] Resolve the **tjs-lang pin**: `0.10.1` exact while npm `latest` is `0.12.0` and tosijs-ui@1.9.4 (the installed build host) peer-deps `^0.12.0`. Either bump and re-verify the two published bundles, or record the hold explicitly in `UPSTREAM.md` gated on the 2.0 resumption — so the skew is a decision, not drift.

### Incoming — issues this release should close or answer

- [ ] **Close #18, #22, #23, #24 at publish**, naming v1.8.0 and the mechanism (verified fixed against the diff: `tosijs/state` + DOM-free gate; `elements.ts:585-606`; `agent.version` + `tosi_surface`; `elements.ts:481-495`). The CHANGELOG cites all four by number but nothing closes them. Add an "Issues closed" line to the 1.8.0 entry. **Two honest caveats belong in the closing comments** — on #22, the member wins only on a _custom element_ AND only when both the existing member and the passed value are functions, so a `null`-initialised field still gets event sugar; on #24, the fix is declaration-based via `_resolveInitAttributes()` and applies to tosijs Components only, not third-party custom elements.
- [ ] **haltija#16** is explicitly HELD on this release shipping ("HOLD until tosijs ships the agent surface"), last touched 2026-08-03. Comment that the surface shipped with `agent.version` + enumerable capabilities, answer the convergence questions, ask for the hold to lift. haltija is a devDependency here and drives the local doc-test lane.
- [ ] **tosijs-ui#59** is gated "not to be picked up until tosijs 1.8.0 is beta/rc" — the gate is met. Comment.
- [ ] Add an **"Unblocks"** heading to the 1.8.0 CHANGELOG naming haltija#16 and tosijs-ui#59 with URLs. This release is the ship event for a filed native browser-automation bridge design and a component-library accessibility program; the release notes should carry that reframing, not only UPSTREAM.md.
- [ ] Give the four remaining open issues a recorded disposition: **#16** (first-class `semanticParent` — `grep` finds nothing, yet this release edited the slot machinery, so the ~5-line accessor is cheapest now), **#26** (unknown creator prop absorbed by the index signature — the unknown-_key_ sibling of #24, and the declaration machinery now exists to make the dev-warn half cheap), **#17** (arguably half-answered by `agent.changes(cursor)`/`agent.observe` — ask the reporter), **#9** (virtual list resize, open since 2025-04, `list-binding.ts` untouched in the entire diff — fix, re-scope, or close as stale).

---

## Follow-ups — shared `tosijs-coding-practices` repo (and this repo's CLAUDE.md)

_(lens: practices. Attribute each edit `— seen in: tosijs 1.8.0`.)_

- [ ] **`practices/model-priors.md:33`, `web-components.md:169`, `code-quality.md:136`, `review.md:187/305/747`** — all five sites teach the **pre-1.8.0 unconditional `on<Event>` rule**. The verified rule is: _on a CUSTOM element only, if the member already holds a function and the passed value is a function, the creator ASSIGNS it; otherwise event sugar; plain elements unchanged._ Add the bullet the old text has no equivalent for: **which branch you get depends on the member's value when the creator runs** — give it a function default, or use `handle<Event>`, if you want determinism. Do not copy the CHANGELOG's shorter phrasing verbatim into `review.md:747`; keep the escape-hatch advice scoped to the non-custom-element and null-field cases.
- [ ] **`practices/review.md:36` — the nine-lens process has no security lens.** The one release whose headline feature is a remotely-drivable control surface shipped its review with `security: NEVER RAN` (recorded in this repo's own `REVIEW-1.8.0-rc.1.md:24,51`); the dangerous defaults were caught by a human noticing an empty table row. **Blockers B2/B3/B5 above are the second demonstration.** Add a conditional tenth lens to `tools/pre-release-review.workflow.js` (triggered when the diff touches a capability/tool boundary, network or eval path, sandbox, auth, or anything exposing state to a non-user actor), and make the report contract carry a mandatory `security escalation: RAN (…) | NOT APPLICABLE because …` line.
- [ ] **`practices/00-stack.md:122` says tosijs has no CI** — `.github/workflows/ci.yml` has existed since 2026-07-20 with `unit` + Playwright `e2e` lanes. The KB's own argument (review.md:10-19) is that this falsehood is load-bearing, and it bit exactly here: the workflow triggers on `main` only, this release is cut from a 99-commit never-pushed branch, so **neither lane has ever run** against ~15k inserted lines, three export conditions and a new published `bin`. Fix the entry (name both lanes and the `main`-only trigger) and add to review.md's Tooling: _"a gate scoped to `main` is not a gate for work that never touches `main` — enumerate which lanes actually executed against the release commit and say so in the release notes."_
- [ ] **`practices/review.md:642` tells reviewers to file the report to `docs/reviews/`** — which in every tosijs-ui/site project is inside the generated output dir the build `rm -rf`s (tosijs, tosijs-ui, tosijs-3d, tosijs-product, tosijs-timezone-picker). A report filed as instructed is destroyed by the next build, and the deletion is committed because `docs/` is tracked. Change to `reviews/<version>-<slug>.md` with the explicit constraint.
- [ ] **`CLAUDE.md:236` mandates `git push` as the definition of done** — on a branch the user has explicitly forbidden pushing (`one-user-interface` was briefly on public `main` as `ad2c1f1` and had to be force-removed). A fresh agent following the repo's highest-precedence guidance publishes an unreleased manifesto and 99 unreviewed commits to a public repo. The carve-out exists only in an agent's private memory. Add the exception **where the rule is read** (CLAUDE.md, next to the push step) and generalise in `practices/releasing.md`'s "Landing the plane".
- [ ] **`CLAUDE.md:214`'s Releasing section is a weaker, diverged copy of `practices/releasing.md`** — and because local docs win, the omitted steps are the ones this release missed: the pre-release review itself, `npm view` publish confirmation, install-what-you-published, the scoreboard update, and **any issue-closure step** (the structural cause of the four fixed-but-open issues, flagged in rc.1 and still absent at HEAD). Replace with a pointer plus the tosijs-specific deltas, and add the missing steps explicitly.
- [ ] **`practices/performance.md:153` recommends "smaller doors" with no singleton caveat.** The real 1.8.0 experience: bundling `tosijs/agent` as its own artifact gave the agent surface its **own copy of the module-level `registry`**, so `describe()` returned an empty application while every test, tsc and lint passed — invisible in-repo, visible only when a consumer loads two entries in one process. Add the bullet: _an entry point that re-bundles module-scope singleton state creates a SECOND instance; a subpath that must share state has to resolve to the SAME FILE (narrow with types, not a second bundle); prove it by importing two entries in one process._ Cross-reference `dependencies.md:301`. Generalises to tosijs-ui, react-tosijs, ngx-tosijs, tosijs-schema.
- [ ] **`practices/web-components.md:90/95/130` and `model-priors.md:66` still teach `xinSlot()` / `<xin-slot>`**, removed in this release. Update to `tosiSlot()` / `<tosi-slot>` with a dated removal note, and check `data-ref` in the same pass. _(File-don't-fix: `tosijs-ui/CLAUDE.md:243` still instructs authors to use `xinSlot()` — that is an issue to file on tosijs-ui.)_
- [ ] **`../tosijs-coding-practices/README.md:130` scoreboard row is stale by two releases** — reads `1.7.8 … As of 2026-07-27` while npm serves 1.7.9 and HEAD is 1.8.0-rc.1, and it still calls `data-ref` "deprecated (gone in 1.8.0)" when it is gone. The board's own rule is "a stale row is worse than none". Update at tag time and add it to CLAUDE.md's release steps so it stops depending on noticing; consider scripting the version column against `npm view`.
- [ ] **The rc.1 review's ~30 deferred follow-ups were never filed to `TODO.md`** — `grep '^## '` shows no 1.8.0-review section, and every checkbox in `REVIEW-1.8.0-rc.1.md` is still `- [ ]` even though roughly a dozen landed. Two spot-checks confirm live unfixed leads with no other home (the dead `tosijs/blueprints` subpath; the missing `package.json` newline). Once 1.8.0 supersedes the rc report those leads evaporate. Add a `## 1.8.0 review follow-ups (deferred)` section and reconcile the report's checkboxes; add the reconciliation rule to `review.md`'s Triage section.
- [ ] **`CLAUDE.md:100`'s M18 refresh landed only partially** — `grep 'agent.ts|contract.ts|contract-check|audit.ts|webmcp.ts' CLAUDE.md` exits 1, and Component Conventions never mentions `static contract`. An agent adding an attribute to a contracted component hits `_resolveInitAttributes()`'s hard "both declared" throw with no doc anywhere explaining it. Add the six modules + the entry-split files + a `static contract` conventions bullet, then adopt haltija's `src/docs-coverage.test.ts` CONCEPTS-table mechanism — this is the second consecutive release where CLAUDE.md drifted.
- [ ] **The lens-8 write-back for this release must name its commit range** (`v1.7.9..229a70d`) per `review.md:409-419`. The only existing tosijs-1.8.0 write-back (`0e752f8`, 2026-08-12) names none and predates the rc.1 review and all of D1-D4 plus the M-series — already stale by the rule's own test, and the rule was skipped by the very next write-back after it was written. Make the range a literal template line in `CONTRIBUTING.md` rather than prose. _(nit)_

---

## Completeness gaps (major release) — carried forward, none resolved

1. **A whole new public entry point was reviewed by nobody.** `REVIEW-1.8.0-rc.1.md` headers `cc6a422`; HEAD is 8 commits and +2,731/−735 later. `src/index-browser.ts` and `src/index-agent.ts` **did not exist at review time** (verified via `git cat-file -e`). The `./agent` export condition, 23 runtime+type exports, the rewritten `index-iife.ts`, and `agent.ts +182 / component.ts +114 / bind.ts +32 / elements.ts +27` have never been through the lenses.
2. **`tosijs/state` parity is false and untested** — five exports absent from every other entry (verified against `dist/module.js`), while `index-state.ts:16` claims identity. No `state ⊆ full` test.
3. **Install/resolution surface of `./core`, `./state`, `./agent` unchecked** — no `require` condition on any (verified), no `typesVersions`; every test imports by relative path, so the exports map itself is untested.
4. **The mandatory browser lane got zero new coverage** — `git diff --stat v1.7.9...HEAD -- tests/` is empty while `component.ts`, `elements.ts`, `bind.ts`, `dom.ts` all changed DOM behaviour. 1.7.7's deprecated-on-npm segmented regression is the precedent. Nothing records that `bun run test:browser` ran, or against which engines.
5. **No CI lane has ever executed against this code** — clean-room `bun install --frozen-lockfile`, the new `bin`, and three export conditions have only ever run on one warm dev machine.
6. **`share.ts` / `sync.ts` / `hot-reload.ts` bypass contract enforcement** (also filed to TODO above).
7. **Virtualized lists vs `describe()` — no coverage.** `schematic.test.ts` and `contract.test.ts` have zero list cases; a virtual-scrolled list reports the visible window as the whole list with no truncation signal to the agent.
8. **The relicense (BSD-3 → Apache-2.0) has no downstream or attribution audit.** `NOTICE` scopes the floorplan attribution to "Portions of **dist/module.js**" but the vendored code is also in `main.js`, `module.debug.js`, `module.safe.js`, and cites the **pre-rename** `tosijs-schematic` URL. No dist bundle carries a license header. Downstream: tosijs-ui MIT `^1.7.8`, ngx-tosijs MIT `^1.0.6`, tosijs-3d **no `license` field at all** `^1.7.8` — all caret ranges auto-resolving to 1.8.0, none audited for Apache NOTICE obligations.
9. **No downstream consumer was built against the RC.** `../react-tosijs` is not even checked out, so its exposure to the removed `xinSlot`/`blueprint`/`blueprintLoader`/`data-ref` surface is unknown — and it is the most likely consumer of exactly those names.
10. **The scaffolder is tested as strings, not as a CLI** — no argv parsing, `--bare` routing, mkdir, or overwrite-guard coverage; no scaffolded tree has been `bun install`-ed and built to prove "app: runnable" / "blueprint: publishable".
11. **`auditAccessibility()`'s WCAG claims are self-asserted** — `contrastRatio` is never validated against published WCAG reference pairs and no finding is cross-checked against an external checker. A tool that tells authors their UI is accessible carries legal weight.
12. **The WebMCP interop claim rests on one unreproducible manual session** — `webmcp.test.ts` exercises a mock host only; "verified in Chrome Canary 153" has no recorded artifact and is the load-bearing evidence for the headline interop story.
13. **Build reproducibility of the vendored schematic** — `^0.3.0` range (not an exact pin) spliced into a _tracked_ file on every prebuild, including `bun start`. Two builds of one commit can ship different vendored code; no drift assertion; the vendored code is not covered by tosijs's tests.
14. **Prerelease publish mechanics unexamined** — nothing confirms the `npm publish --tag beta|rc` path (so `latest` is not moved by an RC).
15. **`describe()`'s cost is undocumented and unbenchmarked** on the path WebMCP hosts may call every turn, while all four bundles have gzip budgets.

---

### Path to GO

Fix B1 (semver decision + the two false justification statements), B2, B3, B4, B5. Then: run `bun run format`, stop the dev server, run `bun run test:browser` and record which engines passed, and file the routed follow-ups above before tagging. The remaining 58 findings are non-blocking but must be filed, not dropped.
