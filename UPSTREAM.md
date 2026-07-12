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

## tjs-lang

### 📝 TO FILE — expose the error ring buffer so libraries can record domain errors

**Not yet filed.** The runtime keeps a monadic-error ring buffer whose stated purpose is
*"lets you catch monadic errors that were silently ignored"* — exactly the forensic trail
a library wants. But **only `typeError()` writes to it.** The general `error(message,
details)` returns a plain `{ $error: true, … }` and never touches the buffer, and there
is no public recorder. So a library built on TJS — tosijs's path-creation and type-drift
checks — cannot get its own monadic errors into the history that exists for them.

**Ask:** a public `record(err)` (or make `error()` record). `MonadicError`'s shape is
already permissive enough — `expected`, `actual` and `reason` are all optional, so
`new MonadicError(message, path)` is valid for a domain error.

**Why it matters:** it lets `'off'` mean **"recorded, not shouted"** rather than
"undetected". A silent mode that still leaves a trail is the whole point of the buffer,
and today only TJS's own type checks can use it.

**Not an ask — already supported:** buffer *size* is configurable today via
`configure({ maxErrors })` (`TJSConfig.maxErrors`, default 64). No issue needed for that.

**Related tosijs-side decision (ours, not theirs):** the default tosijs bundle has no TJS
runtime — the transpiled output falls back to a `{ Type }` stub, so there is no buffer at
all outside the `debug`/`safe` builds. 2.0 is pure TJS, so the runtime will be present;
at that point tosijs should drop its own `MonadicError` and use the runtime's, and every
check lands in one history. See TJS-PORT-DX.md.

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
