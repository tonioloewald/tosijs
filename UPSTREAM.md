# UPSTREAM.md

A local mirror of dependency rough edges we've **filed as issues** upstream
(haltija, tosijs-ui, tjs-lang). An entry here without a filed issue is a complaint
nobody will read; the issue on the target repo is the real channel. Mark entries
RESOLVED when the fix lands and we've adopted it.

> This file is mandated by `CLAUDE.md` and the shared coding practices (review.md
> lens 7, releasing.md). Ecosystem findings get **filed as issues on the upstream
> repo, never fixed by editing it** — file, don't fix.

## haltija

### ✅ RESOLVED — `--private` isolated automation instances
**Issue:** https://github.com/tonioloewald/haltija/issues/1
Spawned automation runs (the doc-test lane) adopted a foreign shared haltija on
port 8700 and navigated another project's live browser to our pages, then timed
out. `haltija --private` (shipped 1.4.1, in direct response to #1) binds an
ephemeral port, isn't registered, and never reaches out. (My original framing —
"private instances don't exist" — was wrong; corrected in the issue thread.)

### 🚧 `hj tabs focus <id>` times out for a live, listed tab
**Issue:** https://github.com/tonioloewald/haltija/issues/4
Tested 1.4.0. A hidden tab may be unreachable by construction if `tabs focus` is
tab-dispatched. Workaround: `hj eval '…' --window <id>` (after the subcommand)
targets a specific tab regardless of focus.

### 🚧 Engine modes aren't discoverable (`--headless` = Playwright; `--private`/`--ci` = Electron, no Playwright)
**Issue:** https://github.com/tonioloewald/haltija/issues/6
`--headless` drives Chromium **via Playwright** (needs it as a dep); `--private`/`--ci`
use **Electron directly, no Playwright**. Both `--help` lines say "for CI", so an agent
(this one) picked `--headless`, hit "Playwright not installed", and wrongly concluded
haltija's CI path requires Playwright — pivoting a whole CI-lane design before being
corrected. Ask: state the engine in `--help`/banner; the only real reason for
`--headless`/Playwright is multi-engine (Firefox/WebKit) coverage. **This is why the
tosijs CI browser lane uses `xvfb + bunx haltija -f` (Electron), not Playwright.**

### 🚧 A tab with no injected client is silently uncontrollable
**Issue:** https://github.com/tonioloewald/haltija/issues/5
`hj tabs` lists such a tab as healthy and commands silently retarget the focused
tab, so it reads as a routing bug. Ask: surface `"client": "none"` / explain
`"fallback": true`, or error instead of silently retargeting. (Consumer half —
surfacing the `haltijaDev` opt-in — is tosijs-ui#18.)

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

## tjs-lang

### 🚧 (to file) Post-eval reconfiguration seam for `globalThis.__tjs`
Converted modules capture `globalThis.__tjs?.createRuntime?.()` at eval time, so
config set after the library's `export *` has evaluated configures nothing — the
`configure-tjs-*` import-order workaround compensates for this. Needs either a
post-eval reconfiguration path or an explicit "config must precede the first
converted-module import" contract with a guard/warning. Will be a live footgun
when 2.0 turns enforcement on. **File before the stable 2.0 work resumes.**
(There is also a related, already-filed ring-buffer ask on the `tosijs-2.0`
branch's UPSTREAM.md — tjs-lang#17.)
