# UPSTREAM.md

A local mirror of dependency rough edges we've **filed as issues** upstream
(haltija, tosijs-ui, tjs-lang). An entry here without a filed issue is a complaint
nobody will read; the issue on the target repo is the real channel. Mark entries
RESOLVED when the fix lands and we've adopted it.

> This file is mandated by `CLAUDE.md` and the shared coding practices (review.md
> lens 7, releasing.md). Ecosystem findings get **filed as issues on the upstream
> repo, never fixed by editing it** — file, don't fix.

## haltija

### 🚧 Per-tab routing by declared origins (issue REOPENED and retitled upstream)

**Issue:** https://github.com/tonioloewald/haltija/issues/1
Spawned automation runs (the doc-test lane) adopted a foreign shared haltija on
port 8700 and navigated another project's live browser to our pages, then timed
out. `haltija --private` (shipped 1.4.1, in direct response to #1) binds an
ephemeral port, isn't registered, and never reaches out. (My original framing —
"private instances don't exist" — was wrong; corrected in the issue thread.)

### ✅ RESOLVED (closed upstream) `hj tabs focus <id>` times out for a live, listed tab

**Issue:** https://github.com/tonioloewald/haltija/issues/4
Tested 1.4.0. A hidden tab may be unreachable by construction if `tabs focus` is
tab-dispatched. Workaround: `hj eval '…' --window <id>` (after the subcommand)
targets a specific tab regardless of focus.

### ✅ RESOLVED (closed upstream) Engine modes aren't discoverable (`--headless` = Playwright; `--private`/`--ci` = Electron, no Playwright)

**Issue:** https://github.com/tonioloewald/haltija/issues/6
`--headless` drives Chromium **via Playwright** (needs it as a dep); `--private`/`--ci`
use **Electron directly, no Playwright**. Both `--help` lines say "for CI", so an agent
(this one) picked `--headless`, hit "Playwright not installed", and wrongly concluded
haltija's CI path requires Playwright — pivoting a whole CI-lane design before being
corrected. Ask: state the engine in `--help`/banner; the only real reason for
`--headless`/Playwright is multi-engine (Firefox/WebKit) coverage. **This is why the
tosijs CI browser lane uses `xvfb + bunx haltija -f` (Electron), not Playwright.**

### ✅ RESOLVED (closed upstream) A tab with no injected client is silently uncontrollable

**Issue:** https://github.com/tonioloewald/haltija/issues/5
`hj tabs` lists such a tab as healthy and commands silently retarget the focused
tab, so it reads as a routing bug. Ask: surface `"client": "none"` / explain
`"fallback": true`, or error instead of silently retargeting. (Consumer half —
surfacing the `haltijaDev` opt-in — is tosijs-ui#18.)

### 🕐 BLOCKED ON US — haltija#16, "Bridge design (HOLD until tosijs ships the agent surface)"

**Issue:** https://github.com/tonioloewald/haltija/issues/16 (OPEN)
haltija is holding a native-bridge design pending the agent surface, so
tosijs 1.8.0 is the event that unblocks it — and `agent.version`
(tosijs#23, fixed here) is precisely what lets haltija detect the surface's
SHAPE instead of duck-typing `describe`. Answer the convergence questions
there when the rc publishes.

## tosijs-ui

### 🚧 FILED — `/__docstore/source` is CSRF-able: local code execution

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/90
While `bun start` runs with `editableSources: true`, any page the maintainer
visits can `fetch()` a `text/plain` body (CORS-safelisted, so no preflight) at
`https://localhost:8018/__docstore/source`; `handleWriteSource` JSON-parses it
regardless of content type, and `mayWriteSource` authorizes direct traffic on
the loopback peer alone — the session cookie is never consulted. `resolveInRepo`
confines to the repo root, which **contains `.git/hooks/*`**, so the write is
local code execution at the next commit. Chromium's Private Network Access
blocks it today; Firefox does not. Asked for: require the browser-set
`Sec-Fetch-Site: same-origin`, and reject bodies whose Content-Type is not
`application/json` (the latter alone forces a preflight and kills the attack).
**Mitigated here** in `tosijs-site.config.ts` — `editableSources` is now
`process.env.TOSI_EDIT === '1'`, so the endpoint is off unless a session asks
for it (tosijs 1.8.0-rc security review, SEC-5).

### 🚧 Doc-test lane should use `haltija --private`; surface the `haltijaDev` opt-in

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/18
The dev-server test mode does an unscoped `hj windows` adopt-or-spawn instead of
requesting a `--private` instance (now that 1.4.1 has it), and injection is
opt-in with an invisible failure mode. Ask: use `--private`; document
`haltijaDev` in docs/llms.txt + a dev-server banner when off.

### ✅ RESOLVED (tosijs-ui 1.7.0-rc.1) — orchestrator swallowed tsc failures

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/22
The `libraryTsconfig`/`emitLibrary` build paths caught `tsc` failures and logged
a success-sounding line, so a broken typecheck exited 0 and published stale
`.d.ts` — a type error shipped in tosijs 1.7.0-beta.1 this way. rc.1 runs
`tsc -p` with `.nothrow()` + exit-code check and fails the build. Adopted as the
1.7.0 build host; verified a deliberate type error now aborts the build (exit 1).

### 📋 FILED (gated) — accessibility ⇄ agent-surface program for every component

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/59
**Extended 2026-08-09:** component-level contracts promoted to a deliverable
(the fix-vehicle for audit findings), plus `<tosi-agent-viewer>` — the map/
legend/contract/audit cockpit, built purely on tosijs's public re-exports
(derived-surface's demo fences are the prototype; it carries its own
contract). The 1.8.0-rc is the sweep's instrument, not just its gate.
The one-user-interface curb cut as an instrument: `static contract` on every
tosijs-ui component (auto aria-label + agent self-description + typed parts +
exercisable spec), a real roles/states pass (tablist/tab/tabpanel +
aria-selected, radiogroup, grid), shadow components surfacing semantic intent
at the host while hiding implementation, and the near-free audit ("every
record with handlers must have label|text|role" over describe() output).
**Gated per Tonio: not to be picked up until tosijs 1.8.0 (the one-user-interface release) is beta/rc.**

## tosijs-floorplan (formerly tosijs-schematic)

**Separately maintained as of 2026-08-09** (its own agent; context in its
CLAUDE.md). Renamed at 0.3.0 — the old name near-collided with
tosijs-schema; exported API keeps the schematic-\* names. tosijs is a
CONSUMER: devDependency pin + build-time vendoring (`vendorSchematic()` in
bin/site.ts regenerates src/schematic.ts from the package source). From
here: **file, don't fix** — renderer changes, grammar proposals, and
record-format questions go to github.com/tonioloewald/tosijs-schematic
issues (repo redirects post-rename), mirrored here. Adopting a new
version = bump the devDep, `bun update`, rebuild, sync any output-truth
tests deliberately.

### 🚧 FILED — Provenance-arrow parsing is forgeable from data (tosijs 1.8.0 SEC-8)

**Issue:** https://github.com/tonioloewald/tosijs-floorplan/issues/5
The renderer splits `"<value> ⟷ <path>"` with `indexOf` and decides
editability with `.includes(BOUND_TWO_WAY)`, so a bound string whose VALUE
contains the token forges an arrow: the shown value truncates at the fake
one, and a plain non-interactive element gets drawn with the `↔` badge and
the actable outline — a drawing that lies about what the page can do.
tosijs fixed the producer side in 1.8.0 (both tokens are neutralized to
`<->` / `<-` inside harvested values and text), but a renderer consumes
maps it did not generate — over a wire, from an older tosijs, or from
another producer — so the parse should be robust on its own:
`lastIndexOf`, and decide editability from the arrow at that position
rather than from a bare `includes`. **Filed upstream.**

### 🚧 FILED — Target-size + "is interactive" implemented twice, and they disagree

**Issue:** https://github.com/tonioloewald/tosijs-floorplan/issues/4
tosijs's `auditAccessibility` and the vendored renderer each decide WCAG
2.5.8 independently, and they already give contradictory verdicts on the
same element: `audit.isInteractive` counts `href`, the renderer's does not;
audit's inline-link exemption reads `label ?? text`, the renderer's reads
only text. So an icon-only `<a href onClick aria-label="Buy">` at 20×20
audits CLEAN while the drawing flags it, and a nameless 16×16 `<a href>`
does the reverse — inside the very workflow `audit.ts` recommends. Because
`src/schematic.ts` is machine-vendored (DO NOT EDIT), the reconciliation
must happen in tosijs-floorplan: export the predicate and the target-size
rule so one implementation serves both, or accept producer `flags` as
authoritative and drop the built-in audit. **Filed upstream.**

### ✅ RESOLVED (tosijs-floorplan 0.3.0, adopted 2026-08-09)

0.3.0 published under the new name with the second haltija batch folded in
(href/value fields, the inline target-size exception, wrapped-caption fix).
tosijs adopted: devDep swapped, vendor path updated (banner now derives
from the package name), `href` harvested by describe() with bare-link
enumeration (links are intrinsic affordances — the contenteditable
precedent), suite synced.

## tosijs-schema

### ✅ SHIPPED (tosijs-schema 1.6.0) — `inferSchema(sample)`: derived schemas
**Issue:** https://github.com/tonioloewald/tosijs-schema/issues/6
**Our contributed requirement was adopted:** inferred schemas carry
`$inferred: true`, so an observation cannot be mistaken for a promise once
it travels. Array unification behaves as asked. devDep bumped to `^1.6.0`;
tosijs's contract suite is green against it. Integration into `describe()`
is post-1.8.0 (tosijs is zero-runtime-dependency, so the app owns the
engine) — see TODO.md § 2.0 / tjs.
Requested by tosijs-ui's schema-powered form editor; tosijs is the third
consumer. It is the adoption half of tjs-lang#27: contracts today are
DECLARED (a cliff — nothing until someone writes a schema), and inference
makes the same machinery derived-by-default, curated-when-it-matters. Uses
here: type-drift warnings from the proxy with no declaration,
`describe().contract` for apps that declared nothing, and field types for
better wiring diagrams. **Our added requirement:** an inferred schema must be
distinguishable from an authored one *in the artifact* (`$inferred` /
`$source`), and the marker must survive serialization — a consumer needs to
know whether it is reading a rule or a sample.

### ✅ RESOLVED (tosijs-schema 1.5.0 / 1.5.1) — `agentContract()` + executable-contract conventions

**Issue:** https://github.com/tonioloewald/tosijs-schema/issues/2 (CLOSED)
The blessed adapter behind 1.8.0's contract seam ships upstream: it fails
CLOSED on a contracted write with no proposal, and refuses at construction
any schema keyword `validate` does not actually enforce. tosijs's suite runs
against the published adapter and pins the proposal guarantee from this side
(tosijs#25, closed). 1.5.1 carries haltija's `s.any` serialization fix —
which would otherwise have ridden into `describe().contract`.

## WebMCP (the standard, not a repo)

### ❌ WITHDRAWN — "no unregistration seam" was OUR probe's blind spot, not a gap

**Do not file this.** It was the last `(to file)` entry here, and the
2026-08-21 re-survey killed it: WebMCP's unregistration path is
`registerTool(tool, { signal })` + `controller.abort()`, and since **Chrome
153** it withdraws a tool *without* cancelling in-flight executions. Our
adapter probed for a returned handle and for `unregisterTool`, found neither,
and concluded the capability was missing — then shipped register-once
semantics plus revoke-by-refusing-stub to compensate for a gap that did not
exist. `src/webmcp.ts` now feature-probes the signal path
(`supportsAbortSignal`) and uses it, keeping the stub fallback for hosts that
ignore the options argument.

**The lesson is the reusable part:** we inferred the ABSENCE of an API from a
probe that never asked for it, wrote the inference into a doc as fact, and
queued a public filing on a standards repo against it. When a capability
appears missing, check the spec text before the object shape — and never file
"X doesn't exist" without having tried X's documented spelling.

## tjs-lang

### 📋 FILED — schema islands enforced from inside the proxy (the 2.0 dissolve)
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/27
The use case behind tosijs 1.8.0's contracts, recorded with its scars: a
schema attachable to PART of the state tree (islands — `app.cart` typed,
`app.scratch` free), enforced in the proxy's set trap rather than at two
call sites. Would let 2.0 delete `contract-check.ts`, the whole-root
proposal routing, the fail-open warning, one of the two plug seams, and the
share/sync trust-boundary caveat. The strongest argument is **monadic
errors**: 1.8.0's release blocker was a contract violation THROWN from a
value setter inside the global binding-dispatch loop, stranding every
element bound after it — with refusal as a value, that class of defect stops
existing.

### ⏳ WAITING ON 0.13.4 — `asCompared`, the real computed comparator

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/33 (kept open as the
use-case record)

**Resolved by discussion with the tjs-lang maintainer, 2026-08-24.** `goIs`'s
`[tjsEquals]` dispatch is a DIFFERENT mechanism from what boxed scalars need —
so both of my readings were wrong, and the fix is neither "add an opt-in
channel" (one exists, for something else) nor "call `customEquals` from `Eq`".
The intended answer is a real computed comparator, **`asCompared`**, landing in
**0.13.4**.

**Do not act on this until 0.13.4 ships.** What still holds, and what
`asCompared` has to satisfy for tosijs 2.0:

- a Proxy has no internal slot and slots are not forwarded to the target, so a
  slot read can never be the fallback for this shape (verified for String,
  Number and Boolean against the exact targets `tosijs-2.0` uses);
- the value must be LIVE — read per access from the registry — so it cannot be
  baked into a target at construction;
- `toBool` decides it. tjs injects it at every truthiness site, so a boxed
  `false` reading truthy in every `if` is what makes or breaks boxed-only state.

When 0.13.4 lands: test 2.0's boxed scalars against `asCompared` (real consumer,
real corpus) and only then decide the boxed-only question. **Two lessons already
paid for here — don't re-learn them:** I twice asserted things about tjs's
internals from a partial read (first "no opt-in exists", then "`goIs` is the
right hook"), and both times a maintainer had to correct it. Read the mechanism
end to end, or ask, before filing.

### ✅ HOLD LIFTED — 0.13.0 shipped (now **0.13.2**, 2026-08-21)

The hold below is satisfied: 0.13.0 is published (0.13.0 went out by mistake as a
non-rc and was superseded by 0.13.1/0.13.2, which also carry review fixes). The
bump-tjs-lang + bump-tosijs-ui + delete-the-`watchPaths`-duplication move is
unblocked — do it as ONE change, and re-read issue #33 first, since it may change
what the port is worth.

### 🛑 HOLD — everything tjs-lang waits for **0.13.0 stable**

**Maintainer decision, 2026-08-21.** tjs-lang is at **0.13.0-rc.1**, and 0.13.0
is not an increment: the language was **reoriented to be TypeScript plus
obvious improvements**, rather than to fight TypeScript idioms and muscle
memory. That changes the shape of every question below — what `tjs convert`
emits, what a native-TJS module looks like, and how much of the 2.0 port's
recorded friction still exists. Resolving tjs-lang items against 0.10.1, or
chasing 0.12.0 to satisfy a peer range, would be work done against a target
that is about to move.

So, deliberately, for 1.8.0:

- **`tjs-lang` stays pinned at `0.10.1`.** The debug/safe bundles it builds are
  EXPERIMENTAL and inert (every TS-converted function is marked `unsafe` by
  design), so nothing user-facing rides on the version.
- **`tosijs-ui` stays pinned at `1.9.4`** even though 1.10.0 closes five issues
  filed from here (#49, #51, #70, #71, #72), because 1.10.0 peers
  `tjs-lang ^0.12.0`. Adopting it means resolving that peer against a version
  we are about to skip. The cost of waiting is visible and bounded: the
  10-entry `watchPaths` array duplicating `docPaths` is the #49 workaround, and
  it stays until we bump. **Revisit as one move when 0.13.0 ships** — bump
  tjs-lang, bump tosijs-ui, delete the duplicated block, re-run the lanes.
- **The `tosijs-2.0` port branch stays on hold** (it already was). When it
  resumes, the 0.13.0 ergonomics ARE the experiment: re-walk `by-path.tjs`
  against the branch's `TJS-PORT-DX.md` friction log as the BEFORE.

### 🚧 FIXED UPSTREAM, NOT ADOPTED — post-eval reconfiguration seam for `globalThis.__tjs`

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/23 (closed
2026-08-06 — but tjs-lang's last publish before that close was 0.12.0 on
2026-07-20, and we pin 0.10.1, so **no version we can install carries the
fix**). Marked ✅ RESOLVED here while its own body still said the workaround was
mandatory; the round-3 review caught the contradiction, and the risk is
specific: a future 2.0 session reads RESOLVED, deletes the `configure-tjs-*`
import-order guard as obsolete, and the debug/safe bundles silently configure
nothing — which is exactly the H-4 defect, paid a second time.

Converted modules capture `globalThis.__tjs?.createRuntime?.()` at eval time, so
config set after the library's `export *` has evaluated configures nothing — the
`configure-tjs-*` import-first workaround compensates, **and must stay until a
version carrying the fix is actually installed and the guard is proven
unnecessary.** Verify against 0.13.0 stable.

(There is also a related, already-filed ring-buffer ask on the `tosijs-2.0`
branch's UPSTREAM.md — tjs-lang#17.)
