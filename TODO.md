# TODO

Live, actionable work only: one task per list item, each written to stand alone. Measurements,
evidence, design reasoning, decisions, review ledgers and finished work live in
[`reviews/TODO-archive-2026-09-26.md`](reviews/TODO-archive-2026-09-26.md) ("archive" below) —
read it before re-deriving anything. Work that has an open GitHub issue is tracked THERE and is not
repeated here: #9, #16, #17, #26, #30, #32 (secret-path spelling), #34, #37, #39 (IIFE global),
#41 (light-DOM secrecy shapes), #42, #43, #44, #46. Pruned 2026-09-26 ahead of moving tasks onto
the virta board. The release planned as 1.11.0 shipped as 1.10.2; its review reports are on disk as
`reviews/1.11.0-*.md`.

## 1.12.0 — `data-tosi-secret` is misnamed, and markup is the wrong channel

The attribute is a withholding hint to this library's own harvest, not a boundary (everything it
covers is reachable by `querySelector`), and three review rounds graded findings as if it were a
privilege boundary. It is also a signpost: `querySelectorAll('[data-tosi-secret]')` hands a reader
the developer's own map of what is sensitive. Archive § "1.12.0".

- [ ] **Rename `data-tosi-secret` to a name that says what it does** (`data-tosi-withhold`,
      `data-tosi-no-harvest` or `data-tosi-redact`). Ship the new spelling as canonical and keep
      `data-tosi-secret` as a silent alias (the project's normal idiom, cf. the `Xin*` aliases), so
      nothing breaks. Update the limitation wording in the *Secrets* doc block in `src/agent.ts`
      (written in 1.10.2) to match, plus CHANGELOG and Migration.md. Done when both spellings are
      honoured by every harvest arm, tests cover both, and the docs name the new one.
- [ ] **Offer a non-markup withholding channel** in the manifest, e.g.
      `enableAgentInterface({ withhold: ['.card-number', el => …] })`, so nothing is written into
      the DOM for a reader to find. This is also the author-side control for unbound structural
      headings under a manifest (b17d53d decided those publish, since scope has no path to ask).
      Keep the attribute, documented as the leaky-by-construction convenience. Done when a selector
      or predicate in the manifest withholds exactly what the attribute would, with tests.
- [ ] **Coordinate renaming `record.secret` with tosijs-floorplan** — floorplan reads it as a
      redaction order (floorplan#15), so it is a shared cross-repo contract. File upstream and
      rename in lockstep; do not rename unilaterally here. `textWithheld` (added in 1.10.2 round
      12) is the model for an honest field name.

## Agent surface — security and correctness

- [ ] **Inline-contract validation on `write()` fails open on DOM presence** (1.10.2 remediation
      review M1, `reviews/1.11.0-preminor-remediation.md`). `inlineSchemaFor()` (`src/agent.ts`)
      finds the governing schema by scanning `document.getElementsByClassName(BOUND_CLASS)`, so a
      write is refused while the control is mounted and ACCEPTED after `inp.remove()`; virtual
      `bindList` rows, SPA route changes and hidden tab panels all silently downgrade enforcement,
      and nothing announces it (contrast `warnIfFailsOpen` in `contract-check.ts`). The scan is also
      O(bound elements) per `agent.write()`. Fix: key inline schemas by path at registration
      (`setElementContract`) so enforcement does not depend on what is rendered, or warn when a path
      that once had a schema has none mounted. Done when the mounted/unmounted repro gives the same
      verdict.
- [ ] **`refreshSecretPaths` fails OPEN if a DOM accessor throws** (1.10.2 round 7,
      `reviews/1.11.0-round7.md`): the outer `catch` around `deepQueryAll(document, …)` in
      `src/agent.ts` returns without marking anything, while the rest of the file's rule is
      "cannot tell === must not publish". Decide the fail-closed behaviour (e.g. set a session flag
      that makes `read()`/`changes()`/`describe()` redact everything bound) and pin it with a test
      whose DOM shim throws.
- [ ] **Make secret propagation one rule, not four arms** (rounds 5 and 7, DX nit). Upward
      propagation is parent, `<label>`, owning `<form>`, plus a fourth spelling (`propagates`,
      which hand-rolls `isSecretControl` minus its `hidden` arm and so will not see a future
      signal). The shadow arm does not share the light arm's `type="hidden"`-does-not-propagate
      restriction — an asymmetry left as a leftover, not a decision. Write the keep-decision (why
      these arms), make `propagates` call `isSecretControl(el, kind === 'hidden' ? '' : kind)`, and
      decide the shadow/hidden asymmetry explicitly. Coordinate with #41, which changes the same
      predicate.
- [ ] **Audit for other flag-vs-decision reads** (1.10.2 round 11,
      `reviews/1.11.0-preminor-round11.md`). Round 11's blocker was one site asking
      `record.secret !== true` where its siblings asked `mayNotCarryContent`; the class is "a proxy
      read instead of the choke point", and the `suppressHarvest` choke-point comment claims a
      guarantee it can only make for callers that route through it. Grep `src/agent.ts` and
      `src/audit.ts` for reads of `record.secret` / `textWithheld` / scope flags used as a decision
      and route them through the named decision. Done when each remaining read is justified inline.
- [ ] **WebMCP tool registration under the closed posture and at boot** (1.9.0 pre-minor and 1.8.0
      rounds). (a) `webmcpTools()` (`src/webmcp.ts`) registers `tosi_describe`/`tosi_surface` even
      when `exposure === 'closed'`; on hosts with no unregistration path that is register-once per
      name, and a model gets `{roots:{},wiring:[],actions:[],exposure:'closed'}` with no signal
      separating "no state" from "never configured" — skip registration while closed, or say so in
      the tool descriptions and name `expose`. (b) `webmcpTools()` calls a full `describe()`
      (layout flush) at boot just to read `actions`. (c) The `provideContext` fallback's
      `unregister` calls `provideContext({ tools: [] })`, blanking tools tosijs never registered.
- [ ] **`globalThis.tosiAgent` has no collision detection** (1.8.0 ledger). A second copy of tosijs
      on the page (which the scaffolder can create) silently overwrites the first surface's global
      (`src/agent.ts`, the `myGlobalName` install). Warn when the global already holds a surface
      that is not ours, naming both versions (`agent.version`).

## Agent surface — coverage

- [ ] **Real-engine witness for the fixed light-DOM secrecy arms** (1.10.2 rounds 7 and DX,
      `reviews/1.11.0-dx.md`). Every light-DOM secrecy fixture is happy-dom only, and happy-dom is
      where `closest()` returns wrong wrapper objects (`input.closest('form') === form` is false
      under happy-dom 20.11.1). Add to `tests/shadow-secret.pw.ts`: `div(bindValue) > input[type=
      password]`, `… > label > input`, `form(bindValue) > div > input`, plus the negative
      `input[type=hidden name=csrf]` stays readable. (The still-leaking shapes are #41's.)
- [ ] **Pin `stripArrows` on the structural heading harvest, and fix SEC-8's dead arm** (1.10.2
      rounds 4/5/DX). Reverting the `stripArrows` hunk on the structural tier leaves the suite green:
      no fixture is a heading. Add an `<h2>` with a forged `BOUND_TWO_WAY` and a mocked
      `getBoundingClientRect` (the structural tier drops 0×0). Separately, `agent.test.ts` SEC-8's
      final `if (forged != null) { … }` is over an unbound `<div id="sec8-plain">` no tier selects,
      so it never executes while claiming to cover forged arrows in page text — make it execute or
      delete it. Also pin the deliberate `title`/`alt` loosening.
- [ ] **Schematic and audit coverage against the vendored floorplan** (1.10.2 pre-minor, DX,
      remediation). `src/schematic.test.ts` has not changed since 1.9.0 while floorplan 0.4.0 and
      0.5.0 moved renderer-observable behaviour (bold for `<a href>` and producer `interactive`,
      `SchematicResult.note`, `neutralizeArrows` captions, the `flagColor` prototype-chain security
      fix). `schematic()` is public and nothing executes it (`type-surface.test.ts` only compiles
      it). Wanted: a golden-SVG comparison, an executed `schematic()` assertion, a test that the
      renderer still honours `flags`/`list`, a conformance test that producer records and the
      vendored renderer agree on shape and provenance tokens, pins for the `anonymous-affordance`
      / `missing-role` deltas from the `isInteractive` swap, a forged arrow in `text`
      (floorplan#11), and "read-only `describe()` emits no blind-map note" (floorplan#10).
- [ ] **`boundsOf()` and `measureBounds()` disagree on "page coordinates"** (1.8.0 ledger).
      `boundsOf()` (`src/schematic.ts`) uses window scroll only; `measureBounds()` (`src/agent.ts`)
      accumulates ancestor scroll, so the documented `within: boundsOf(el)` idiom mis-selects in
      inner-scroll apps. Unify (upstream in floorplan if `boundsOf` must change) and add
      real-browser tests for scroll accumulation and fixed/sticky detection, which happy-dom cannot
      exercise.

## Agent surface — API and DX

- [ ] **Root exports named for a shape they do not take** (`reviews/1.11.0-dx.md`).
      `isInteractive` and `TARGET_SIZE_DEFAULT` are on the root `tosijs` barrel;
      `isInteractive({tagName:'BUTTON', onclick, …})` returns `false` because it takes a
      `SchematicRecord`, not an element, with no throw. Rename at the re-export
      (`isInteractiveRecord`, `AUDIT_TARGET_SIZE_DEFAULT`, old names as aliases) or restrict them to
      `tosijs/agent`, and file upstream for JSDoc on `schematic()` plus a boundary guard on
      `isInteractive` that refuses a value carrying `tagName`/`nodeType`. Also record the name
      collision between `schematic()` and the planned non-singleton state factory idea.
- [ ] **Opt-in `validate: true` on `share()` / `sync()`** for version skew (1.8.0 ledger,
      de-escalated from security). Route inbound deltas through the same contract check as
      `agent.write()`; a refused delta is dropped and reported, not applied. Document the failure
      mode. Not a default: refusing leaves the receiver stuck rather than inconsistent.
- [ ] **Decide the scaffolded declared-test step DSL** (1.8.0 round 3). `bin/cli.ts` writes a
      `tests:` block into every new component — a second, weaker test vocabulary. Freeze its verbs,
      document that dev-time behaviour belongs in real tests, and consider making the block opt-in.
      The contract API is in flux (tosijs#29/#30), so no deprecation cycle is needed.

## Core library

- [ ] **`get` and `has` disagree on proxies** (archive § "`get` and `has` disagree"). `app.observe`
      is a working function but `'observe' in app` is false: the `get` trap serves
      `ACCESSOR_PROPS` (`src/xin.ts`) and `has` does not report them, so consoles, REPLs, debuggers
      and introspecting agents see the data half and are told the API half does not exist. Make
      `has` report `ACCESSOR_PROPS` and leave `ownKeys` alone (so `Object.keys`, spread and
      `JSON.stringify` are unchanged). Blast radius is real (`'x' in obj` is a duck-typing idiom):
      check tosijs-ui and the agent surface's own guards first.
- [ ] **`on<Event>` member-vs-sugar depends on custom-element upgrade timing** (1.8.0 rounds 1-3).
      `elementSet` (`src/elements.ts`) decides by whether the element already HOLDS a function under
      the key, so the same call site takes the event-sugar branch before `customElements.define`
      and the assignment branch after — exactly the blueprint case. Decide from the class
      (`customElements.get(tag)?.prototype`) or re-resolve on upgrade. Done when a test creating the
      element before and after `define` gets the same behaviour.
- [ ] **`contract` is a reserved element-creator prop with no collision warning** (1.8.0 ledger).
      `elementSet` routes `key === 'contract'` to `setElementContract`, so a component with its own
      `contract` property cannot be set through a creator. Warn (once per class) when the element
      already has a `contract` member.
- [ ] **A string `content` in a shadow-DOM component erases its own stylesheet** (1.10.1 round 5
      major). `appendContentToElement` (`src/dom.ts`) sets `textContent` on the shadow root, which
      removes the injected `<style>`. Append a text node instead when the target is a ShadowRoot (or
      always). Also: `appendContentToElement` is a fourth consumer of the positional-content
      contract left out of `applyPositional`, and `src/elements.test.ts` (~line 698) claims "these
      tests are what notices if a fourth site appears" — they do not; correct the comment or add
      the test.
- [ ] **Shadow DOM: bindings inside a component that hydrates after insertion** (archive § "Shadow
      DOM kills the bindings"). Binding dispatch is document-level, so a bound component placed in
      another component's shadow root is dead. The per-class warning fires when content with
      binding sugar is scanned at insertion; a blueprint-loaded or late-upgraded component may slip
      past it. Check, and if so warn from the binding side. Also say in the component docs' shadow
      DOM section that "bindings do not operate here" includes any component placed there.
- [ ] **Carried proxy/path edge cases from the 1.7 review** (archive § "Medium backlog"): an id
      value containing `=` resolves to the wrong item (`prop.split('=')` in `src/xin.ts`,
      `part.split('=')` in `src/by-path.ts`); numeric-string object keys are readable but
      unwritable (`setByPath` expects an array); id-path touch synthesis handles only the
      innermost bracket; no `deleteProperty` trap, so `delete proxy.x` mutates with no touch (needs
      a design decision). Fix the first three with tests; decide the fourth (may be 2.0).
- [ ] **Carried list-binding defects from the 1.7 review** (archive § "Medium backlog"): a
      `ListBinding` has no teardown, so `scrollContainer: 'window'` pins a detached list forever
      (consider owner-scoped observer cleanup via `FinalizationRegistry`, archive § "work in
      progress"); changing an item's id in place orphans its bindings and leaks the strong-Map
      entry; scalar list items are recreated every update; removal without `idPath` is O(n²). Also
      the old known issue "bindList cloning doesn't duplicate SVGs" — reproduce or close.
- [ ] **Carried Component edge cases from the 1.7 review** (archive § "Medium backlog"): a `value`
      attribute beats a later `value` property write at hydration (property should win); no
      `parts` invalidation after a DOM-replacing `render()`; a `change` listener that mutates
      `value` swallows the second change event; `formResetCallback` ignores the captured
      class-field default; dead `_value` stores. Each with a regression test.
- [ ] **Carried share/sync/css minors from the 1.7 review** (archive § "Medium backlog"):
      `share()` echo-window can swallow local changes; overlapping roots double-broadcast; `sync.ts`
      `inboundPaths` is module-level across instances; `vars.gray50` digit-suffix calc-sugar
      collision (escape hatch or loud docs); `debounce`/`throttle` lack `cancel`/`flush`
      (additive). Decide each: fix, document as a trade-off, or drop.
- [ ] **`css()` cannot emit more than one `@import`** (`src/css.ts`, the `selector === '@import'`
      branch): a style spec is an object, so a second `@import` key overwrites the first. Accept an
      array value and emit one `@import url(…)` per entry.
- [ ] **Color cleanups** (post-1.7.0 review, bundle-diet notes): make `css-types.ts` use
      `import type { Color }` (it uses `Color` only in types); centralise colour recognition in an
      `isCssColor`/`tryParseColor` on `Color` so `invertLuminance`'s regex (which rejects 4/8-digit
      hex, system colours and modern syntax like `oklch()`/`color()`) and `Color.fromCss` stop
      drifting; add a headless test that changing a themed proxy var regenerates the computed-colors
      `<style>`.
- [ ] **CSS-native derived colours** (archive § "Bundle diet — the rest"). Emit relative colour
      syntax (`oklch(from var(--x) …)`) and `color-mix()` instead of the
      `Color.registerComputedColor` / `queueRecompute` / stylesheet-observer machinery, deleting the
      recompute loop and the css.ts↔Color runtime coupling. Keep contrast math, `invertLuminance`'s
      parser and `Color.fromCss` in JS. Minor-version work: raises the floor to 2024 engines for
      derived colours and needs a deprecation cycle for `registerComputedColor`.

## Performance

- [ ] **Agent-surface hot paths** (1.8.0 ledger, 1.9.0 and 1.10.2 round 10). `deepHas` in
      `src/agent.ts` materialises both `querySelectorAll(selector)` and `querySelectorAll('*')`
      with no early exit, and every wiring record pays it via `harvestWouldLeak`; add
      `if (node.querySelector?.(selector) != null) return true` before the `'*'` walk, and hoist the
      document-wide query `refreshSecretPaths()` already runs into a Set so the per-element DOM arm
      is O(1). `bindingName`/`propBindingKey` do linear identity scans per record.
      `warnIfFailsOpen` (`src/contract-check.ts`) allocates two arrays per call on the Component
      value-setter hot path — memoise on the schema object with a WeakSet.
- [ ] **Re-measure `describe()` in real Chromium and give it a budget** (1.10.2 rounds 4/5, 1.8.0
      ledger). Round 4 measured +45–55% in Chromium from the per-element subtree scan; the
      narrowing was only re-measured in happy-dom. `describe()` is on the path a WebMCP host may call
      every turn and has no benchmark or budget. This needs the benchmark harness below.
- [ ] **A benchmark harness that can defend a number, or stop publishing µs figures** (1.9.0
      round-4 M9). Every µs figure in the CHANGELOG came from ad-hoc scripts under happy-dom in a
      shared test process, which the shared practice (`a3154cf`) says not to do: assert on ratios,
      best-of-N. Build a harness (real browser for DOM paths) or describe the shape of the win
      instead of quoting numbers.
- [ ] **`create()` hot path** (1.10.1 rounds): `create()` in `src/elements.ts` builds two closures
      per positional argument and `applyPositional` computes `positionalWarning` eagerly. Hoist the
      closures and make the warning lazy (~3–4% measured). Decide the export status of
      `classifyPositional` / `positionalWarning` at the same time (exported, zero importers).

## Build, gates and packaging

- [ ] **Finish the figure-generation job** (1.10.2 round 10, DX, 1.9.0). The build now generates
      the README sizes, the `gz` column and the agent-surface figures, but `src/index-agent.ts`
      ("**15 kB gzipped**") and `src/index-core.ts` ("~15 kB gz marginal") still hand-type a number
      beside README's generated `<!--agentmarginal-->` (~15.6 kB). Extend token substitution to
      source doc blocks, or drop the number from prose and point at README. README's "+2.9 kB vs
      1.7.9" is a stamped 1.8.0-era figure that needs a two-app harness to re-take.
- [ ] **The build's gz-delta table is silently partial** (1.10.2 rounds 5 and 10). In
      `bin/site.ts`, the "paste into the CHANGELOG" loop iterates only what this run built (the tjs
      pair is `--build`-only, so a dev run drops two rows unmarked) and `continue`s when
      `git show <tag>:dist/<name>` fails, dropping a newly added bundle. Print only under
      `--build` (or label it partial), and emit a `| new |` row instead of skipping.
- [ ] **Tree-shaking of the agent surface is claimed but not gated** (1.8.0 round 3). "The agent
      surface tree-shakes away if unused" appears in several places; the marginal measurement in
      `bin/site.ts` compares two ENTRY points, which is not the same as a consumer importing from
      `tosijs` and shaking. Add a gate that bundles a two-line consumer importing a core API from
      `tosijs` and asserts it carries no agent code / stays under a size, or soften the claim and
      point minimalists at `tosijs/core`.
- [ ] **`tosijs/state` and `tosijs/core` for CJS/node consumers** (1.8.0 ledger). Importing
      `dist/state.js` under node prints `MODULE_TYPELESS_PACKAGE_JSON` (verified 2026-09-26), and
      `./core`/`./state` declare no `require` condition, so the DOM-free entry fails its likeliest
      audience; CJS `dist/main.js` carries the agent surface with no slim door. Emit `.mjs` (as the
      CLI does) or declare ESM-only, and decide whether a slim CJS door is wanted.
- [ ] **`sourceFingerprint()` claims more than it hashes** (1.10.1 rounds). `bin/bundles.ts`
      documents it as "everything that determines `dist/`" but hashes `src/**/*.ts`,
      `bin/bundles.ts`, `bin/site.ts` and the version — not `tsconfig.build.json`, the bundler or
      `tjs-lang` versions. Narrow the claim or widen the input. Also `FINGERPRINT_PATH` is
      cwd-relative while the hash uses an absolute `PROJECT_ROOT` (they agree only from the repo
      root), and the missing-fingerprint branch in `bin/check-publish-tag.ts` needs rewording.
- [ ] **The minimum-headroom gate measures the previous build** (1.10.1 round 5). It lives in
      `src/entries.test.ts`, which `buildLibrary()` runs BEFORE rebuilding, so in the
      `bun run build` lane it checks stale `dist/`. Add a headroom check beside the budget gate in
      `buildLibrary()` (after bundling).
- [ ] **Guard the `npm pack` spawn in `src/entries.test.ts`** (1.10.2 round 10, DX nit). The
      source-map gate pipes `Bun.spawnSync(['npm','pack','--dry-run','--json']).stdout` into
      `JSON.parse` with no exit-code check, a few tests below the file's own loud-skip guard for
      its `node` spawn; a bun-only contributor gets `SyntaxError: Unexpected end of JSON input`.
      Factor one loud-skip probe both spawns use.
- [ ] **Drop `"source": "src/index.ts"` from `package.json`** (1.10.2 round 10). Now that `/src`
      ships, a monorepo with explicit `resolve.mainFields` would start compiling tosijs `.ts` out of
      `node_modules`. Confirm nothing reads `pkg.source`, then remove it.
- [ ] **`NOTICE` names the wrong artifacts** (1.10.2 round 10). It attributes vendored floorplan
      code to `dist/index.js`, which carries none (the IIFE omits the agent surface), and omits
      `src/schematic.ts`, which ships since `/src` joined `files`. Replace the filename list with a
      property-based statement ("any published file containing code generated from
      tosijs-floorplan").
- [ ] **`Migration.md` does not ship in the tarball** (`reviews/1.11.0-dx.md`). It is not in
      `package.json` `files`, so a consumer with only what they installed cannot find the migration
      table, which `practices/releasing.md` requires. Add it (and check the payload budget).
- [ ] **`docs/version.json` stamps its own PARENT commit** (1.10.2 remediation), so every build
      dirties it, "clean tree after `bun run build`" is unreachable, and Tier 0's artifact-freshness
      warning is permanently noisy. This is tosijs-ui's `buildSite`: file upstream (stamp the
      build's own commit, or exclude the field from freshness checks) and mirror in UPSTREAM.md.
- [ ] **Bump `tjs-lang` from 0.13.6** (currently 0.13.13 latest, 0.14.0-rc). 0.13.11 turned the 13
      spurious `tjs convert` signature-test failures printed on every build into 0 failures and 2
      honest abstentions, so the noise that would mask a real failure goes away. tjs-lang#51
      (convert dropping an exported function on comment text) is closed; confirm the fix is in the
      chosen version. Validate by EXECUTING all seven bundles, not by running the suite (the
      0.13.0–0.13.5 `new`-stripping bug passed all unit tests). See UPSTREAM.md § tjs-lang.
- [ ] **Unescaped `~` in doc blocks is an unguarded markdown hazard** (1.10.2 round 11). Bare `~`
      prefixes in a block quote parsed as strikethrough and mangled a published sentence in
      `docs/index-agent/`. That instance was fixed by rewording; add a build check (or a lint over
      `/*# … */` blocks) for `~` sequences that marked will read as `<del>`.
- [ ] **Execute a sample of the rewritten live doc examples** (1.9.0 pre-minor). ~25 ` ```js `
      fences in `list-binding.ts`, `xin.ts`, `elements.ts` and `xin-proxy.ts` were mechanically
      rewritten and nothing asserts on them (`xin.ts`, `elements.ts` and `xin-proxy.ts` have no
      ` ```test ` fence). Promote a representative sample, especially any using `textContent` with a
      binding, to ` ```test ` so the browser lane checks them.

## Tests and lanes

- [ ] **A test-typecheck lane** (1.9.0 pre-minor; archive § "Test-typecheck mining"). No lane
      typechecks `*.test.ts`; `tsconfig.test.json` exists as a measuring tool (`npx tsc --noEmit -p
      tsconfig.test.json`, ~369 errors at last count). Mining the first ~30 found five real
      public-surface type defects (all fixed in 1.10.1). Burn down the test-file sloppiness, then
      gate — and the gate must deliberately EXCLUDE the ~85 direct-assignment sites
      (`app.name = 'Ada'`), which are correct code TypeScript cannot describe.
- [ ] **A mutation lane** (archive § "Mutation testing as a lane"). A fix can land with no test
      exercising the site it changed (round 4 re-added a pre-fix branch and all 987 tests stayed
      green). For a named set of invariants, revert the guarded line and assert the suite goes red;
      a pre-tag or quarterly job, not per-commit. Interim: a fix commit states the mutation it
      survived.
- [ ] **CLI coverage** (1.8.0 ledger). `bin/cli.ts`'s error branches are untested, the scaffolded
      APP is never executed, and `src/cli.test.ts` creates `mkdtempSync` directories it never
      removes. Clean up the temp dirs and add tests for the error branches plus one that runs a
      scaffolded app.
- [ ] **Two repos, one e2e port** (1.8.0 round 3). `playwright.config.ts` here and tosijs-ui's
      both default `E2E_PORT` to 8799, so the two browser lanes cannot run at once and the failure
      reads as `NS_ERROR_CONNECTION_REFUSED`. Give the repos distinct defaults or pick a free port.
      Workaround meanwhile: `E2E_PORT=8811 bun run test:browser`.

## Docs

- [ ] **The agent surface is unreachable from the README and filed under "Utilities"** (1.8.0
      round 2). `src/agent.ts`, `audit.ts`, `contract.ts` and `index-agent.ts` all have
      `"parent": "utilities"` in their doc metadata, and README links only `/history/` and
      `/Migration/`. Give the agent surface its own nav parent and a README link.
- [ ] **`headless-embodiment.md` advertises `elementsSSR` as a tosijs API** in its front matter,
      and the string ships in `llms.txt`; no such export exists in `src/`. Reword as a proposal or
      remove it from the description.
- [ ] **Move the 1.8.0 review reports out of the repo root** (1.8.0 ledger).
      `REVIEW-1.8.0-rc.*.md` and `SECURITY-1.8.0-rc.1.md` sit at the root asserting since-resolved
      claims as current; date-stamp them and move them to `reviews/` (the convention every later
      report follows).
- [ ] **Put the post-browser-lane rebuild into CLAUDE.md's numbered Releasing list** (1.10.1
      rounds). The rule "re-run `bun run build` after `bun run test:browser`, before committing" is
      stated in the Build System section but step 4 of the numbered list, which is what gets
      followed, does not say it. Also say there that `dist/*.js.map` are committed (the map↔tarball
      gate depends on it).

## Release chores and cross-repo

- [ ] **Deprecate `create-xinjs-blueprint` on npm and archive-note its repo.** The scaffolder has
      lived in tosijs (`bunx tosijs create app|component|blueprint`, `dist/cli.mjs`) since 1.8.0;
      `npm view create-xinjs-blueprint` still shows 0.3.4 with no deprecation.
      `npm deprecate create-xinjs-blueprint "moved: bunx tosijs create"` (needs the maintainer's 2FA).
- [ ] **Get the real consumer list and make consumer checks safe** (1.8.0 round 3, E8). npm cannot
      answer "who uses tosijs" (`depends:` fuzzy-matches; apps and private repos like snowfox-app
      and nonono are invisible). Record the maintainer's list so pre-release consumer verification
      covers what exists. Consumer checks must run a consumer's TEST command, never its build
      (running tosijs-3d's build rewrote its tracked `docs/`): ask tosijs-3d for a `test` or
      `typecheck` script. Also still open: bump react-tosijs / ngx-tosijs off `^1.0.6`.
- [ ] **File the outstanding upstream asks** (1.8.0 ledger): tosijs-schema — a vendorable
      structural core so `type`/`enum`/`required`/`minimum` have one definition instead of
      `contract-check.ts`'s subset. Mirror in UPSTREAM.md.
- [ ] **Practices write-back residue** (`../tosijs-coding-practices`; 1.9.0 pre-minor, 1.10.1
      rounds, round-4 M9). Verified 2026-09-26 as not yet in the KB: (a) the lens-8 READ direction
      — add "read the KB diff since the last release" to `practices/releasing.md` next to the
      write-back; (b) make the Migration.md-section check mechanical in `tools/release-doctor.ts`
      (missed in two consecutive minors); (c) a literal `base..HEAD` range template line in the KB's
      CONTRIBUTING.md for report headers; (d) the two generalisations "a gate whose scope is
      narrower than its claim reports safety it has not established" and "filing is not tracking".
      Attribute each `— seen in: tosijs`.
- [ ] **Reconsider `editableSources` defaulting back on.** It was made opt-in
      (`TOSI_EDIT=1 bun start`, `tosijs-site.config.ts`) because the upstream edit endpoint was
      CSRF-able (SEC-5, tosijs-ui#90). #90 closed 2026-09-03: confirm the fix in the pinned
      tosijs-ui (1.12.0 or later) and decide the default.
- [ ] **Deploy as a non-root user** (security pass SEC-16). The preview/tunnel target moved to
      `.env`, but `root@` is the part config cannot fix.

## 2.0

- [ ] **Run the 2.0 deprecation purge.** Inventory: archive § "2.0 — THE PURGE INVENTORY" (runtime
      warnings keyed in `deprecationWarnings`, `onResize`, `xinValue`/`xinPath`, the 27 `Xin*` type
      aliases, the `bind*` shortcut types) and § "2.0 refactoring candidates" (deprecated exports,
      collapsing the `xin*`/`tosi*`/symbol dual API surface, blueprint-loader deprecation
      scaffolding, debug/test exports in the prod bundle, splitting `list-binding.ts`). Re-derive
      the table first (it is a 1.8.2 snapshot). One commit per category (markup / runtime / types);
      markup tombstones break silently, so migrate them first and remove them last.
      `index-core-exports.ts` and `index-state.ts` use explicit export lists, so every step needs a
      consumer-compile check, not just a green `tsc` here.
- [ ] **2.0: blueprint `src` defaults to same-origin** (security review SEC-6). `<tosi-blueprint
      src>` executes the module it names and can arrive via `innerHTML`, so on a page rendering
      untrusted HTML it is script execution. Invert the default: same-origin allowed, cross-origin
      refused unless `settings.blueprintSrcCheck` (or a `settings.blueprintOrigins` allowlist) says
      otherwise. Needs a CHANGELOG breaking-change note and a migration line for CDN consumers.
- [ ] **2.0: proxies over shared empty targets, with a path-keyed cache** (archive § "Empty proxy
      targets"). Makes a proxy a pure function of its path, so it can be cached: a 5-hop read stops
      allocating 10 objects, proxy identity becomes stable (what #17 asks for), and held proxies
      stop retaining their original object. Needs a shared `{}` AND a shared `[]` (`Array.isArray`
      and `JSON.stringify` read the target) with `ownKeys`/`getOwnPropertyDescriptor`/`has`/
      `deleteProperty` synthesised from the registry. Stable `===` is observable — 2.0 only.
- [ ] **2.0: resume the native-TJS port** (archive § "2.0 / tjs — why the port is the bet"; memory
      `project_tosijs_2_0_plan`). The hold was "until tjs-lang 0.13.0 is stable" — 0.13.13 is
      current. Re-walk `by-path.tjs` against current tjs and compare with `TJS-PORT-DX.md` on the
      `tosijs-2.0` branch as the before-measurement. Carry "raw assignment through a boxed proxy is
      correct code TS flags" and the carried 2.0 items (function-identity caching for `tosiValue`,
      `settings.strictness`) into the port notes.
- [ ] **2.0: schema islands enforced from inside the proxy** (archive § "2.0 / tjs — schema
      islands"; tjs-lang#27). Attach a schema to a subtree and check every write there regardless
      of caller, deleting `contract-check.ts`, proposal routing in `agent.write()`, one of the two
      plug seams and the share/sync boundary note. Same move: decide what a validator SEES
      (copy-on-write was built, measured 4.3× faster on sub-path writes, and reverted because it
      hands contracts real `Date`s and functions instead of JSON — do not re-attempt without reading
      the archive), and the opt-in `describe({ inferContracts })` using tosijs-schema's
      `inferSchema` (`$inferred: true` marker preserved).
