# Upstream notes

Rough edges in our dependencies that we've raised **upstream as issues** rather than
working around silently. Per
[cross-project.md](https://github.com/tonioloewald/tosijs-coding-practices/blob/main/practices/cross-project.md):
this file is a **local mirror for context** — the issue on the target repo is the actual
channel. An entry here without a filed issue is a complaint nobody will read.

Newest at top. Mark `✅ RESOLVED (fixed in <pkg>@<version>)` and close the issue when it lands.

> Context: we are simultaneously polishing a universal build system + literate-programming
> platform, porting a complete front-end framework and UI library to a language we are also
> implementing, and running a universal-endpoint backend with field-level RBAC. Upstream debt
> is *expected* right now. The point of this file is that none of it gets forgotten.

---

## haltija

### ✅ RESOLVED — `--private` isolated automation instances
**Issue:** https://github.com/tonioloewald/haltija/issues/1
Spawned automation runs adopted a foreign shared haltija on port 8700 and navigated
another project's live browser to our pages, then timed out. `haltija --private`
(shipped 1.4.1, in direct response to #1) binds an ephemeral port, isn't registered, and
never reaches out.

### 🚧 Engine modes aren't discoverable (`--headless` = Chromium via Playwright; `--private`/`--ci` = Electron, no Playwright)
**Issue:** https://github.com/tonioloewald/haltija/issues/6
Both `--help` lines say "for CI", so an agent (this one) picked `--headless`, hit
"Playwright not installed", and wrongly concluded haltija's CI path requires Playwright.
Ask: state the engine in `--help`/banner. NOTE: the tosijs CI browser lane ultimately
adopted **Playwright directly** (mirroring tosijs-ui's e2e) — haltija's `--headless`
delegating to Playwright is exactly why. haltija remains the local living-docs driver.

### 🚧 `hj tabs focus <id>` times out for a live, listed tab
**Issue:** https://github.com/tonioloewald/haltija/issues/4
Tested 1.4.0. Workaround: `hj eval '…' --window <id>` (after the subcommand) targets a
specific tab regardless of focus.

### 🚧 A tab with no injected client is silently uncontrollable
**Issue:** https://github.com/tonioloewald/haltija/issues/5
`hj tabs` lists such a tab as healthy and commands silently retarget the focused tab, so
it reads as a routing bug. Ask: surface `"client": "none"`, or error instead of silently
retargeting.

---

## tosijs-ui

### ✅ RESOLVED (fixed in tosijs-ui@1.6.21) — the `libraryBuild` + `generateCssPreload` seams
**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/10 — **close it.**

The seams never needed a 1.7: they shipped in **1.6.21** (`libraryBuild`,
`generateCssPreload` — see its CHANGELOG and `site-config.d.ts`). This entry previously
claimed they were stranded on an unreleased `1.7-*` branch, which was wrong — the 2.0 port
has been unblocked at `buildSite` since 1.6.21, and we didn't notice because we pin 1.6.13.

**Action for us:** bump `tosijs-ui` 1.6.13 → **1.6.22** (see below), then wire
`tosijs-site.config.ts` to the seams and re-run the swap that died at `buildSite`.

### ⚠️ TAKE 1.6.22 — dev-server memory leak (fixed upstream, we're still exposed)

Not our filed debt — a fix we haven't taken. Per
[practices/development.md](https://github.com/tonioloewald/tosijs-coding-practices/blob/main/practices/development.md):
**anything consuming `tosijs-ui/site` should update to ≥ 1.6.22 as a priority.**

`buildSite()` called `Bun.build()` in-process, and Bun's bundler never returns its native
arena — RSS grows monotonically per rebuild, invisible to `Bun.gc()` and to heap profilers
(upstream: [oven-sh/bun#34053](https://github.com/oven-sh/bun/issues/34053)). `devServer()`
rebuilds in a process that runs for days, so it compounds: a ~2-day watch session reached
**136GB RSS** and took the machine down. **Our `bun start` is that dev server, on 1.6.13.**

1.6.22 moves bundling and ePub generation into child processes (the OS reclaims the memory
on exit) and adds a rebuild memory watchdog. Measured: baseline RSS 503MB → 150MB,
per-rebuild growth 26–59MB → ~2.7MB. Bundle output is byte-for-byte identical.

---

### 🚧 Doc-test lane should use `haltija --private`; surface the `haltijaDev` opt-in
**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/18
Dev-server test mode does an unscoped `hj windows` adopt-or-spawn instead of requesting a
`--private` instance, and injection is opt-in with an invisible failure mode.

### ✅ RESOLVED (tosijs-ui 1.7.0-rc.1) — orchestrator swallowed tsc failures
**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/22
The `libraryTsconfig`/`emitLibrary` paths caught `tsc` failures and logged success, so a
broken typecheck exited 0 and published stale `.d.ts` (a type error shipped in tosijs
1.7.0-beta.1 this way). rc.1 runs `tsc -p` with `.nothrow()` + exit-code check and fails
the build. Adopted as the 1.7.0 build host.

## tjs-lang

### 🚧 Error ring buffer is write-closed — only `typeError()` can record
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/17 (filed upstream; we
[commented](https://github.com/tonioloewald/tjs-lang/issues/17#issuecomment-4955716468)
with the downstream evidence)

The runtime keeps a monadic-error ring buffer whose stated purpose is *"catch monadic
errors that were silently ignored"* — exactly the forensic trail a library wants. But
**only `typeError()` writes to it.** The general `error(message, details)` returns a plain
`{ $error: true, … }` and never records. So tosijs's three checks (path fabrication, type
drift, dead bindings) cannot reach the history that exists for precisely them, and our
`'off'` mode means *undetected* rather than **recorded, not shouted**.

Three things we raised on the issue that it didn't cover:

1. **The consumers who need the recorder most have no runtime.** tosijs's *default*
   published bundle has no `globalThis.__tjs` and no `createRuntime` — the transpiled
   output only carries per-function metadata (`fn.__tjs = { params, unsafe, source }`).
   The full runtime lives only in our `debug`/`safe` builds. So `record()` would be
   absent from production, which is where the mystery happens. A minimal recorder should
   probably ship in the always-emitted shim.
2. **The sole existing writer breaks the recorder's own rule.** The issue says recording
   must never change behavior; `typeError()` both `console.error`s (`logTypeErrors`) and
   **throws** (`throwTypeErrors`), `runtime.ts:204-211`. `record()` must be pure.
3. **"Record liberally" + a 64-slot ring evicts the one real error.** Severity *tags*
   don't prevent eviction — filtering an already-overwritten ring returns nothing, and
   you can't distinguish "no error" from "it scrolled off". Wants severity-aware
   retention, not just labels.

**Not an ask — already supported:** buffer *size* is configurable via
`configure({ maxErrors })` (default 64).

**Related decision that's ours, not theirs:** 2.0 is pure TJS, so the runtime will be
present in the default bundle. At that point tosijs should drop its own `MonadicError`
and use the runtime's, and every check lands in one history. See TJS-PORT-DX.md.

Verified against **0.9.0** (0.9.0 fixed the critical dts + packaging items — #2, #6, #8, #9,
#10, #11). Current published is 0.9.1; the below were **not** re-checked against it, so they
may already be fixed.

### `toBool`-per-conditional is a hot-path tax (~10% runtime, ~19% size)
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/3
Native semantic mode wraps every conditional in `toBool`. On `by-path` (a hot internal) that's
pure overhead. **Workaround:** `TjsCompat` for hot internals — but that's folklore, not docs.

### `generateDTS` ignores arrow-function consts
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/4
`export const id = () => …` emits `id: any`. Arrow-const is how most of our factories/helpers
are written, so a lot of public surface degrades. **Workaround:** hand-authored `.d.tjs.ts`.

### `isCssProperty` accepts typo'd property names
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/5
`isCssProperty('align-kontent') === true`. Catching CSS typos at the boundary is the headline
use case, so the loose name check undercuts it.

### `Eq` unwraps `instanceof` wrappers but not `ToPrimitive` objects
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/6
Not blocking — we box over real `Number`/`String`/`Boolean` wrappers precisely so `instanceof`
hits. But it constrains our proxy target to satisfy `Eq` rather than our own design.

### Mode control is add-only (no per-mode `off`)
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/7
You can enable a mode but not disable one; "everything except `TjsStandard`" means starting
from `TjsCompat` and re-enabling the rest.

### `TjsDate` guidance omits `performance.now()`
**Issue:** https://github.com/tonioloewald/tjs-lang/issues/8
The error suggests only `Timestamp.now()`; for monotonic / id-generation the right primitive is
`performance.now()`, which is never mentioned.

### 🚧 (to file) Post-eval reconfiguration seam for `globalThis.__tjs`
Converted modules capture `globalThis.__tjs?.createRuntime?.()` at eval time, so config
set after the library's `export *` has evaluated configures nothing — the
`configure-tjs-*` import-order workaround compensates. Needs a post-eval reconfiguration
path or an explicit "config must precede the first converted-module import" contract.
Live footgun when 2.0 turns enforcement on. **File before stable 2.0 work resumes.**
