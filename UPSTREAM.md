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
tosijs-schema; exported API keeps the schematic-* names. tosijs is a
CONSUMER: devDependency pin + build-time vendoring (`vendorSchematic()` in
bin/site.ts regenerates src/schematic.ts from the package source). From
here: **file, don't fix** — renderer changes, grammar proposals, and
record-format questions go to github.com/tonioloewald/tosijs-schematic
issues (repo redirects post-rename), mirrored here. Adopting a new
version = bump the devDep, `bun update`, rebuild, sync any output-truth
tests deliberately.

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

### ✅ RESOLVED (tosijs-schema 1.5.0 / 1.5.1) — `agentContract()` + executable-contract conventions
**Issue:** https://github.com/tonioloewald/tosijs-schema/issues/2 (CLOSED)
The blessed adapter behind 1.8.0's contract seam ships upstream: it fails
CLOSED on a contracted write with no proposal, and refuses at construction
any schema keyword `validate` does not actually enforce. tosijs's suite runs
against the published adapter and pins the proposal guarantee from this side
(tosijs#25, closed). 1.5.1 carries haltija's `s.any` serialization fix —
which would otherwise have ridden into `describe().contract`.

## WebMCP (the standard, not a repo)

### 🚧 (to file) No unregistration seam in the host API
Chrome Canary's `document.modelContext.registerTool` returns no handle and
there is no `unregisterTool`, so a page cannot withdraw a tool it
registered. tosijs compensates with register-once semantics per host
(`registeredOnHost`, `src/webmcp.ts`) — deliberate and tested, but it means
a surface that re-enables cannot refresh its tool set, and a host that
rejects a tool must not be treated as holding it (fixed here after the
1.8.0 review). File against the spec discussion once the shape settles.

## tjs-lang

### ✅ RESOLVED — Post-eval reconfiguration seam for `globalThis.__tjs`
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/23 (CLOSED)
Converted modules capture `globalThis.__tjs?.createRuntime?.()` at eval time, so
config set after the library's `export *` has evaluated configures nothing — the
`configure-tjs-*` import-order workaround compensates for this. Needs either a
post-eval reconfiguration path or an explicit "config must precede the first
converted-module import" contract with a guard/warning. Will be a live footgun
when 2.0 turns enforcement on. **File before the stable 2.0 work resumes.**
(There is also a related, already-filed ring-buffer ask on the `tosijs-2.0`
branch's UPSTREAM.md — tjs-lang#17.)
