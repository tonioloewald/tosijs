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

### 🚧 BLOCKING — Release 1.7 with the `libraryBuild` + `generateCssPreload` seams
**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/10

**Context.** `tosijs-ui/BUILD-TJS-HOOK.md` is marked ✅ IMPLEMENTED on the `1.7-*` branch
(Option A + the eval-context/preload half), but the latest **published** release is 1.6.21.
We still pin `tosijs-ui@1.6.13`.

**Why it blocks us.** The 2.0 native-TJS port dies at `buildSite` without these seams (the
CSS-eval step can't load `.tjs`), so native TJS modules can be validated but never shipped.
Both migration modes (per-file swap, bulk all-`.tjs`) need them.

**Suggestion.** Cut a 1.7 release containing the seams; no API change beyond what landed.
This is the single highest-value item in our upstream backlog — see `TJS-PORT-DX.md`.

---

## tjs-lang

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
