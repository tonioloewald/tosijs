# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tosijs (formerly xinjs) is a lightweight library for creating and updating the DOM and managing state, using a path-observer model. **Sizes are generated into README by `bun run build` — read them there, don't restate them here.** Three sites are generated now, not one: the `<!-- sizes -->` block, the Entry points table's `gz` column (via `<!--gz:NAME-->…<!--/gz-->` tokens) and the agent-surface delta (`<!--agentgz-->`). They previously disagreed with each other on the same page because only the block was generated. The agent surface is opt-in and shakes away if unimported. 1.8.0 was NOT size-neutral against 1.7.x — an identical non-agent consumer app measured +2.9 kB gz (+13.7%) vs 1.7.9, because the contract seam and path guards sit on the ordinary path — but that is a 1.8.0-era figure needing the two-app harness to re-take, and it is stamped as such in README. It uses proxy-based observers to eliminate binding boilerplate, similar to Redux but simpler. Works with vanilla JS/TS, web components, and integrates with React via react-tosijs.

**Key characteristics:**

- Zero runtime dependencies
- No JSX, transpilation, or virtual DOM required
- Direct DOM manipulation with native HTML and web standards
- Full TypeScript support with strict mode

## Commands

```bash
bun start                   # Build, then dev server with hot reload (https://localhost:8018)
bun test                    # Run all tests
bun test src/foo.test.ts    # Run specific test file
bun run format              # Lint and format code (ESLint --fix + Prettier)
bun run build               # Production build + docs, then exit (0/1); runs tests first
bun run tls                 # Generate local dev TLS certs (tosijs-dev-certs)
bun run test:browser        # Playwright lane: Chromium, Firefox, and WebKit for some specs
bun run format:check        # Prettier --check only (what CI runs)
bun run stamps              # List dated claims by age (release step 4)
bun run latest              # rm -rf node_modules && bun update
bun run tunnel              # tosijs-tunnel: expose the dev server
bun run deploy              # tosijs-deploy: publish the doc site
bun pack                    # Create local package tarball for testing
```

Both `bun start` and `bun run build` invoke `bin/site.ts` (the build entry).
`bin/cli.ts` is the published **scaffolder** (`bunx tosijs create …`), bundled
by the same build to `dist/cli.mjs` and exposed via `package.json` `bin`. The dev server serves over HTTPS on port 8018 and requires TLS certs — run `bun run tls` once if the server can't find them.

## Build System

The build entry is `bin/site.ts`, a thin wrapper around the reusable doc-site system in `tosijs-ui/site` (`buildSite` / `devServer`). Project config lives in `tosijs-site.config.ts` (`defineSiteConfig`). `bin/site.ts` also owns library bundling for the npm package via `Bun.build`:

- `dist/index.js` — IIFE for browser/script tags. **Built from
  `src/index-browser.ts`, which omits the agent surface**: a script tag
  cannot tree-shake, so it must not carry an opt-in feature.
  **It sets NO global** (verified 2026-10-13): loading it registers
  `<tosi-blueprint>`/`<tosi-loader>` and exposes nothing else, so it is a
  blueprint loader, not "the library from a script tag". Whether it should
  expose `tosijs` is a decision on the board.
- `dist/module.js` — ES Module (everything; consumers tree-shake)
- `dist/main.js` — CommonJS
- `dist/core.js` — `tosijs/core` (no blueprints, share/sync, hotReload, agent)
- `dist/state.js` — `tosijs/state`, the DOM-free layer (tosijs#18)
- `dist/cli.mjs` — the scaffolder (`.mjs` so node runs it as ESM without
  forcing `"type": "module"` on main.js's CJS consumers)
- `dist/retired.js` — what `tosijs/debug` and `tosijs/safe` resolve to until
  2.0: a warning and a re-export of `./module.js` (see below)

`tosijs/agent` deliberately resolves to `dist/module.js` with narrower
types: a separately-bundled agent surface carried its own copy of the state
registry and described an empty app.

**⚠️ `vendorSchematic()` REWRITES the tracked file `src/schematic.ts`**,
regenerating it from `node_modules/tosijs-floorplan/src/index.ts`. Edit the
upstream package, not that file — it carries a DO-NOT-EDIT banner. Since
`4672bc0` it runs **only under `--build`**, not on `bun start`; a dev server
whose vendored copy is stale warns rather than silently rewriting.

**Build gates that will fail your build** (all in `buildLibrary()`): the
unit suite, a **smoke import** of every published bundle (every export must
be defined — a `sideEffects` array once shipped bundles whose exports had
been shaken away), a **bare-node DOM-free gate** proving `tosijs/state`
imports without a DOM, per-bundle **gzip budgets**, an **npm payload budget**
(`PAYLOAD_BUDGET_MB`, 2.6 since the debug/safe bundles were retired), an
**exports-target existence +
`git ls-files` tracked** check, and a **source fingerprint** proving `dist/`
was built from this source. `src/entries.test.ts` adds two more that run in
the test lane: every budget comment must mention the number it sits above, and
every source in every shipped `.map` must be present **in the tarball** (asked
of `npm pack`, not of the working tree).

TypeScript declarations are generated by `buildSite` from `libraryTsconfig` (`tsconfig.build.json`). `buildLibrary()` runs `bun test src/` before bundling. `bin/site.ts` prepends a `writeVersion()` prebuild that stamps `package.json`'s version into `src/version.ts`.

> **`tosijs/debug` and `tosijs/safe` are RETIRED** (owner, 2026-11-25; the
> change landed after 1.10.13). They were two whole-library bundles built by
> running `tjs convert` over `src/`: experimental, inert (the converter marks
> everything converted from TypeScript `unsafe`, so no runtime type check ever
> fired), imported by nothing in the ecosystem, and 0.51 MB of a 2.85 MB
> tarball. **Both subpaths still resolve in 1.x**, to `dist/retired.js`, which
> the build writes from `RETIRED_SOURCE` in `bin/bundles.ts`: it warns once and
> re-exports `./module.js`, the same module instance (an app that imported
> both used to get two state registries). The subpaths are deleted in 2.0.
>
> **What went with them:** the `tjs convert` build stage (and its thirteen
> spurious failures in every build log), `src/index-debug.ts`,
> `src/index-safe.ts`, `src/configure-tjs*.ts`, two budgets, and the "a dev
> run builds five of the seven bundles" trap. To revive, they are in git at
> `v1.10.13`.
>
> **What did NOT go, and will bite 2.0:** `src/` still carries constraints
> that exist only for the converter (no declaration merging in `component.ts`,
> tjs-lang#49; no template literal nested in a template literal in
> `list-binding.ts`; comment text that changes what the converter emits,
> tjs-lang#51). Nothing checks them any more, and 2.0 is still "transpile with
> tjs". Before 2.0 work starts, run `bun tjs convert src/ -o tjs-out/` and
> expect drift.

> **`tjs-lang` is pinned at `0.13.6` and `tosijs-ui` at `1.16.38`** (read
> `package.json` for the current pins; this line has drifted before).
> `tjs-lang` stays a devDependency after the retirement above: tosijs-ui's doc
> system declares it as an optional peer.
>
> **A tosijs-ui bump can leave the doc site dead under a green build.** The
> 1.12 → 1.16 bump did it twice: the root barrel stopped exporting the doc
> system (1.14), so `src/index-iife.ts` must import `tosijs-ui/doc-browser`,
> `/live-example`, `/code-editor` and `/highlight-block` by subpath or no
> `<tosi-example>` is ever defined; and the lockfile kept older hoisted
> CodeMirror packages, so a second copy nested under tosijs-ui and every code
> editor rendered blank (fix with `bun update @codemirror/state
> @codemirror/view`). Since 1.16.15 `restampSite({ strict: true })` in
> `buildDocsBundle()` refuses both, and re-stamps the pages' `?v=` from the
> bundle actually served. **After any tosijs-ui
> bump, open a doc page in a real browser and run the browser lane before
> believing the build.**
>
> **The lesson the tjs bundles left behind: validate a toolchain bump by
> EXECUTING THE ARTIFACT, not by running the suite.** tjs-lang 0.13.0 to
> 0.13.5 stripped `new` from every class in a converted module, so the bundles
> threw on import, and all 898 unit tests passed, because they exercise `src/`
> and the bug was in the emitter. Only the published-bundle smoke gate saw it.
> The pin history, tjs-lang#37, #49 and #51, and the wrong "peer range" fact
> that reached three files are in `UPSTREAM.md` § tjs-lang and
> `reviews/TODO-archive-2026-09-26.md`.

**Dev-server reload caveat (tosijs-ui#129):** the dev server sends NO cache
headers, so a plain browser reload can serve a STALE `docs.json` — the page
renders the previous build while the server has the new one. A new tab gets
current content; devtools with "Disable cache" never sees it. **Iterate in a
fresh tab, or with cache disabled — a plain reload does not prove anything.**

It serves stale **code**, not just stale prose, so it can impersonate a library
bug convincingly. The `/one-user-interface/` demo looked like an agent-surface
security failure for a whole session — every verb refused, `exposure: 'closed'`
— because Chrome was running a cached pre-`e6f8eae` fence with a bare
`enableAgentInterface()` against the current library. The refusal was correct
and precisely worded; it just described a file that no longer existed. Safari
ran the same URL correctly. **That episode was probably not the cache at all** (found 2026-10-13): the
owner's Chrome profile holds `localStorage['tosi-example-edit:<page>#<n>']`, a
saved edit of a live example, and a saved edit **replaces the page's source in
that profile indefinitely** with nothing on screen to say so. The same fence,
the same bare `enableAgentInterface()`, the same error, while the server sent
`no-store` and fresh browsers passed. `bun start` opens the default browser and
prints THAT browser's doc-test results, so the dev server can report failures
no clean browser has. Check `Object.keys(localStorage)` for `tosi-example-edit:`
before believing a dev-server test failure (tosijs-ui task on the board).

**When a page's behaviour contradicts its source,
check a second browser before you debug the library** — that is a ten-second
test that ends the whole class.

**`bun start` WIPES `dist/` and rebuilds it (tosijs-ui#130).** `buildSite()`'s
prebuild runs `rm -rf dist` on every run, dev server included. A dev run then
builds every bundle from the source on disk, so nothing in `dist/` is left
stale or missing. That was not always so: while the tjs-built debug/safe
bundles existed, a dev run skipped them, package.json still exported them, and
the old manual checklist (build, browser lane, publish) shipped two subpaths
that threw `ERR_MODULE_NOT_FOUND`. Two guards from that time stay, because
they are general: `buildLibrary()` and `prepublishOnly` both fail if any
`exports` target is missing **or untracked** (`git ls-files`, not
`existsSync`: an untracked copy on disk once made every check green over a
commit that had recorded the deletion; **on disk is not in the commit**), and
`restoreCommittedDist()` puts back any tracked `dist/` file a run failed to
produce. A new `exports` target therefore fails its first build until you
`git add` it. Since the publish workflow (2026-09-26) CI publishes what it
rebuilt from the tag and requires every shipped file to reproduce.

**The browser lane tests your WORKING TREE** (measured 2026-11-25, at 1.10.13;
this section said the opposite until then). Playwright's `webServer` is
`bun start` with `DEV_NO_WATCH=1`. `buildSite()` wipes `dist/`, then
`buildLibrary(false)` bundles `index.js`, `module.js`, `main.js`, `core.js` and
`state.js` **from the source on disk**. A `.pw.ts` that `readFileSync`s
`dist/module.js` therefore reads a bundle of whatever is in `src/` right now.

Measured two ways. With a fix uncommitted, `dist/module.js` after a lane run
held the fix and the committed one did not. And `tests/locale-case.pw.ts` went
red, then green, as the fix was stashed and restored, with no commit between.

What follows from it:

- **A green lane on a dirty tree says nothing about the commit.** Commit, then
  run the lane, as the release steps say. A lane run on a clean tree leaves it
  clean: the dev build of the bundles is byte-identical to the committed one.
- **A browser spec can be mutation-checked by stashing the fix**, with no
  commit. That is the cheap way to record its red run.
- A dev run skips the publishing gates (the unit suite, the tarball checks),
  so still run `bun run build` before committing.

The earlier note (2026-09-17, `5ad71853`) recorded a tripwire spec passing
against a committed bundle that lacked a new export. The build code was already
the same in every respect above (checked at that commit), so that measurement
is unexplained. It does not reproduce.

**Dev-server watch caveat:** `buildSite()` starts by `rm -rf docs`, which wipes the separately-built `docs/iife.js`. The watch rebuild re-runs `buildSite` + `buildDocsBundle` (but skips the slower `buildLibrary` tests/tjs step); if `iife.js` is missing the page 404s into the SPA fallback and "loads as HTML."

**Documentation generation:** handled inside `buildSite` from the `docPaths` in `tosijs-site.config.ts` (currently `src`, `README.md`, `Building-Apps.md`, `Migration.md`, `React.md`). Two sources:

1. Markdown files listed in `docPaths`
2. Inline `/*# ... */` blocks in source files — these contain Markdown with numbered headings (e.g., `# 1.2 path-listener`) that control section ordering. Note: the opening delimiter is `/*#` but the closing is just `*/`. `parent`/`order` metadata on a doc block organizes the nav tree.

**Live examples in doc blocks:** The tosijs-ui live-example system scans rendered docs for consecutive code fences with language classes `.language-html`, `.language-js`, `.language-css`, or `.language-test`. Consecutive fences are grouped into a single interactive `<tosi-example>`. Critical rules:

- **Only fences tagged ` ```html `, ` ```css `, ` ```js `, or ` ```test ` become live examples.** A bare ` ``` ` fence (no language) or ` ```typescript ` is rendered as static code — use these for non-executable API snippets.
- **Consecutive fences are grouped together.** If a ` ```js ` fence immediately follows a ` ```html ` fence (no intervening text/elements), they become one example. A standalone ` ```js ` fence is also treated as a live example (it will execute with no HTML).
- The JS context provides `preview` (the container div, has `position: relative` and `overflow: hidden`), plus full `tosijs` and `tosijs-ui` modules. `import { x } from 'tosijs'` is rewritten to destructure from the context object.
- **Never use ` ```js ` for code snippets that aren't meant to run.** Use bare ` ``` ` or indented code blocks instead.

## Architecture

```
State (xin) ─────────────────────────────────────────────
    │
    ├── tosi({ key: value })     # Register + get typed proxy (preferred)
    ├── xinProxy({ key: value }) # NOT an alias: returns `xin` (unboxed)
    ├── observe(path, callback)  # React to state changes
    ├── touch(path)              # Force update notification
    └── bind(element, bindings)  # Connect DOM to state
            │
            ├── fromDOM: path    # Input -> state
            └── toDOM: path      # State -> output
```

**Core modules:**

- `xin.ts` / `xin-proxy.ts` - State management with path-based observers; `tosi()` and `xinProxy()` are the main entry points
- `by-path.ts` - Path parsing and value access (e.g., `'app.user.name'`, `'list[id=123]'`)
- `registry.ts` - Central state object; breaks circular dependency between `xin.ts` and `bind.ts`
- `path-listener.ts` - Observer implementation (`touch()`, `observe()`, `unobserve()`, `updates()`)
- `metadata.ts` - Proxy helpers (`tosiAccessor()`, `TOSI_ACCESSOR`, `tosiPath()`, `tosiValue()`), binding metadata storage
- `elements.ts` - Element factory functions (`div()`, `span()`, etc.), `bindParts()` for applying ElementProps to existing DOM via data attributes
- `bind.ts` - Data binding connecting state to DOM
- `list-binding.ts` - Array/list bindings with virtual scrolling and surgical updates
- `component.ts` - Base class for web components
- `css.ts` - CSS generation utilities (`css()`, `vars`, `varDefault()`, `initVars()`, `StyleSheet()`, `invertLuminance()`, theme preferences)
- `bindings.ts` - Pre-defined binding collection (value, text, enabled, disabled, list)
- `dom.ts` - DOM utilities (`setValue()`, `getValue()`, `dispatch()`, `resizeObserver`)
- `color.ts` - `Color` class for CSS color manipulation
- `form-validation.ts` - Form-associated component validation with `validateAgainstConstraints()`
- `blueprint-loader.ts` / `make-component.ts` - Dynamic blueprint loading and hydration for CDN-friendly components
- `throttle.ts` - Rate-limiting utilities (`throttle()`, `debounce()`)
- `hot-reload.ts` - State persistence to localStorage across page reloads
- `more-math.ts` - Math utilities (`clamp`, `lerp`, constants)
- `share.ts` - Cross-tab state sync via `BroadcastChannel` + `IndexedDB`; delta-based `{ path, value }` messages
- `sync.ts` - Network state sync via pluggable `SyncTransport`; throttled outbound batching, same delta/echo-prevention pattern as `share.ts`
- `settings.ts` - Debug/performance flags (`settings.perf`, `settings.debug`,
  `settings.quiet` — silences tosijs's own advisory warnings)

**The agent surface** (1.8.0; exported from `tosijs` and, with a narrower
type surface, from `tosijs/agent` — the SAME file, because a separate bundle
would carry its own copy of the registry):

- `agent.ts` - `enableAgentInterface()`: `describe`/`read`/`write`/`observe`/
  `call`/`changes`/`when`/`log`, the exposure ladder (CLOSED by default,
  manifest, `expose: 'all'`), the audit ledger, and `agent.version`
- `webmcp.ts` - the generated WebMCP tool set + host adapter (auto-registered
  by `enableAgentInterface` where a model-context host exists)
- `schematic.ts` - **VENDORED** from tosijs-floorplan at build time; do not
  edit (see the build-system note above)
- `audit.ts` - `auditAccessibility()` over a map: anonymous affordances,
  unnameable actions, missing roles, contrast, target size
- `contract.ts` - `exerciseContract()` / `exerciseComponent()`: contracts as
  executable tests
- `contract-check.ts` - the shared zero-dependency validation subset
  (type/enum/const) plus the `setContractValidator` plug

**Entry modules** (one per published export condition):

- `index.ts` (everything) · `index-core-exports.ts` (the shared surface) ·
  `index-browser.ts` (IIFE/CDN — omits the agent surface) ·
  `index-core.ts` (`tosijs/core`) · `index-state.ts` (`tosijs/state`,
  DOM-free) · `index-agent.ts` (`tosijs/agent`, types only)

### Dual Proxy System (`xin` vs `boxed`)

The library exposes two proxies over the same `registry` object:

- **`xin`** — returns raw values for scalars. `xin.foo.bar` returns the string/number directly.
- **`boxed`** — returns `BoxedScalar` proxies for everything, including primitives. `boxed.foo.bar` has `.value`, `.path`, `.observe()`, etc.

**Writing state: both forms are correct and do the same thing.**

```js
app.name = 'Ada'          // intended, works, inherited from bindinator's proxy
app.name.value = 'Ada'    // identical: same write, same observers
```

**TypeScript rejects the first with `TS2322: Type 'string' is not assignable to
type 'BoxedScalar<string>'`, and cannot be made to accept it.** Measured on TS
5.9.3: asymmetric `get`/`set` works on a hand-written *interface*, but
`BoxedProxy<T>` is a mapped type (`{ [K in keyof T]: BoxedProxy<T[K]> }`) over
arbitrary `T`, and mapped types have no get/set modifier; widening the property
to `BoxedProxy<T[K]> | T[K]` admits the write and poisons every read
(`app.name.value` stops compiling). So there is no formulation that keeps both.

This is TypeScript failing to describe a JavaScript design, not a defect —
**do not "fix" code that uses direct assignment.** In `.ts`, prefer
`.value =` because it is the form the checker can express; in `.js` and in doc
examples, direct assignment is the intended spelling. ~15 sites in the test
suite use it and are correct; `reviews/TODO-archive-2026-09-26.md` has the detail, including why a
tests-typecheck ratchet must exclude this class deliberately.

Both are created in `xin.ts` via `regHandler(path, boxScalars)`. The `boxScalars` flag controls whether primitives are wrapped. **`tosi()` assigns and returns from `boxed`; `xinProxy()` assigns and returns from `xin`** — they are NOT the same, and an `xinProxy` result serves no `.value` / `.path` / `.tosi`.

### Accessor API (`.tosi` / `TOSI_ACCESSOR`)

Boxed proxies expose a `.tosi` accessor that provides the full reactive API (`value`, `path`, `touch`, `observe`, `bind`, `on`, `binding`, `listBinding`, `listFind`, `listUpdate`, `listRemove`) without risk of name collisions. The direct properties (`.value`, `.path`, etc.) delegate through the same accessor implementation but can theoretically be shadowed by target properties.

For guaranteed collision-free access, use `tosiAccessor(proxy)` or `proxy[TOSI_ACCESSOR]` — these use a symbol key that cannot conflict with data properties. The accessor is implemented as a lightweight proxy over the same target (no object allocation beyond the proxy itself).

### Path-Based Observer System

Paths support dot notation (`'app.user.name'`), array indices (`'list[0]'`), and id-paths (`'list[id=123]'`). Observers can be registered with string paths, RegExp patterns, or filter functions.

`touch(path)` uses bidirectional prefix matching — touching `'app.user.name'` notifies observers on `'app.user'` and `'app'` (parent paths), and touching `'app.user'` also notifies observers on `'app.user.name'` (child paths). Mutations propagate both up and down the path tree.

### Surgical Array Updates via id-paths

When a list binding specifies `idPath: 'id'`, the proxy `set` handler in `xin.ts` detects mutations inside array items and synthesizes id-path touches (e.g., `'list[id=123].color'`). This allows the list binding to update only the affected DOM element — no diffing or reconciliation needed.

### Registry Pattern

`registry.ts` holds the plain state object and lazy getters (`getXinProxy()`, `getBind()`, `getOn()`). This breaks the circular dependency between `xin.ts` (which creates the proxies) and `bind.ts` (which needs to access them, and vice versa).

**Key types (in `xin-types.ts`):**

- `BoxedProxy<T>` - Type-safe proxy for state objects and arrays with:
  - `.value` / `.path` - Get underlying value and path string
  - `.observe()`, `.bind()`, `.on()`, `.binding()`, `.listBinding()` - Reactive bindings
  - `.valueOf()`, `.toJSON()` - Type coercion
  - Note: the `.xinValue` / `.xinPath` / `.tosiValue` / `.tosiPath` PROPERTIES and the `xinValue()` / `xinPath()` functions are deprecated; use `.value` / `.path`. **`tosiValue()` and `tosiPath()` the FUNCTIONS are canonical and not deprecated** — they work on non-proxies, which `.value` does not.
- `BoxedScalar<T>` - Lightweight proxy for primitives (string/number/boolean); same API as `BoxedProxy`
- `XinBinding<T>` - Binding specification with `toDOM` and `fromDOM` functions
- `Component` - Abstract base class for web components

## Testing

Tests use Bun's test runner with Happy DOM for DOM environment (configured in `bunfig.toml` and `happydom.ts`). Test files follow the pattern `*.test.ts` in the `src/` directory.

**Async updates:** After state changes in tests, use `await updates()` to wait for all pending observer callbacks and DOM updates to complete before asserting on UI state.

**`tosi()` ITSELF SCHEDULES A TOUCH ON THE ROOT — drain it before observing.**
`touch()` is async-batched, so registering state queues a notification on the
root path. Observe immediately afterwards and your callback fires with the ROOT
path, not the leaf you wrote — and because touching a root notifies every
descendant, it also looks like every sibling observer woke spuriously:

```
tosi({ app: { a: 0, b: 0 } })
observe('app.a', cb)          // <-- the registration touch is still pending
app.a.value = 1
await updates()               // cb sees 'app', and an observer on 'app.b' fires too
```

Add `await updates()` after `tosi()` and before installing observers, and both
symptoms vanish: the write touches `app.a` and nothing else stirs. **This is
correct behaviour, not a bug** — but it produces a _confident and specific_
false positive ("`.value =` over-notifies siblings") that survives several
rounds of narrowing, because every probe reproduces it. Verified 2026-09-01.

**Happy DOM limitations:**

- Does NOT support `:scope >` CSS selector — use manual child iteration instead
- Elements return `0` for `offsetWidth`/`offsetHeight` — mock with `Object.defineProperty(el, 'offsetHeight', { value: 300, configurable: true })`
- `ListBinding` tests require proxied arrays from `xin['path.to.array']`, not raw arrays (raw arrays lack the `XIN_PATH` metadata)
- Throttled event handlers are unreliable in tests; call methods like `lb.update()` directly
- **`getBoundingClientRect()` returns zero geometry**, and the agent surface's
  structural tier drops any element measuring 0×0 — so a structural assertion
  written without mocking the rect **silently tests nothing**, and passes. This
  hid an entire class of `describe()` leak (headings publishing secrets) from
  every test in the suite until a real browser was used. Mock it:
  `Object.defineProperty(el, 'getBoundingClientRect', { value: () => ({ x: 0, y: 0, width: 200, height: 30 }), configurable: true })`.
  Generally: **an environment-suppressed assertion is a passing test that
  proves nothing** — if a guard depends on geometry, layout or timing, make the
  environment supply it rather than trusting a green tick.
- **Slotted events do not pass through the shadow root.** In a browser a
  light-DOM node slotted into a shadow root has that root on its event path;
  in Happy DOM it does not. So a unit test of shadow-root delegation passes for
  slotted content while the browser runs the handler twice (1.10.12 review
  B1). Test event paths through slots in the browser lane (a ```` ```test ````
  fence on the *bind* page). Filed as happy-dom#2623; see `UPSTREAM.md`.
- **No unit environment has a locale.** A defect that depends on the browser's
  language (case mapping, #4239) is emulated in the unit suite by overriding
  the `toLocale*` string methods (`src/string-case.test.ts`) and asked of real
  engines in `tests/locale-case.pw.ts`, which sets `locale: 'tr-TR'`.
  Playwright's locale changes case mapping in Firefox and WebKit and NOT in
  Chromium (nor does launching it with `--lang`), so that spec skips on
  Chromium rather than pass over nothing.
- **`bindText` sets `textContent`, which DESTROYS appended children.** A
  fixture like `div({ bindText: x }, input({ type: 'hidden' }))` contains
  nothing by the time anything inspects it, so a containment test written this
  way passes while exercising an empty element. This has now produced a false
  "no leak" reading twice, in two different sessions. Bind a *child* span, or
  use a binding that does not own `textContent`.

**The proxy and the path engine are compared, not trusted**
(`src/proxy-vs-path.test.ts`, 1.10.13). They each answer "what is at this
path", they were written separately, and every defect that file was written for
was found by lining them up, not by a failing test. It generates state trees
from a fixed seed, generates every path into them, and asks the walk,
`getByPath`, `xin[path]` and `boxed[path]` the same question. **A new container
shape or path syntax goes into its generator.** What the two still disagree on
is at the bottom as `test.failing`: each states the RIGHT answer, so the suite
is green while it is wrong and goes red when someone fixes it, which is the
prompt to delete the marker (board #4261). Do not "fix" one of those by
editing its expectation.

### Guard the operation, not the spellings (1.10.10, 1.10.11, 1.10.13)

Three releases in a row guarded prototype access by SPELLING, at the place
the spelling arrived, and each next review found another spelling: `[=key]`
writes (1.10.10), `[__proto__]` (1.10.11), `[=__proto__]` and then
`a.__proto__.value` (1.10.13). The 1.10.13 fix that held is two read guards in
`by-path.ts` (the dotted loop in `getByPath` and the `[=key]` read in
`byIdPath`), because that is where a compound path's base, a boxed scalar's
`.value` and an accessor's `.value` all resolve. Three rules
came out of it:

- **Put the guard where the operation happens.** Ask "which function resolves
  a segment?" and guard that. A check on the key a proxy trap is handed
  covers the trap's own read and nothing the trap delegates.
- **A read is not harmless because it cannot write.** It can hand out the
  object, and then the caller writes. `boxed['a.__proto__.value']` returned
  `Object.prototype` itself in every version tested, from 1.6.0.
- **Generate the spelling table.** `src/proto-corpus.test.ts` builds every
  spelling at every position under every kind of parent, asked every way a
  value leaves a proxy (5,187 probes). The hand-listed table it joins held
  the spellings someone had thought of, which is why it was green each time.
  Two things its first version got wrong, both found by the re-review:
  **detect by shape, not identity** (a proxy OVER `Object.prototype` is not
  `===` to it, and `tosiValue()` reads by path, so removing the trap's guard
  left it green), and **cover each branch on purpose** (`getByPath` takes
  another branch for a zero-length parent, which the fixture reached by luck).
  When a generated corpus reports a hand-out, check first that the probe is
  still talking to the library: `xin` returns raw strings, and
  `'Ada'['__proto__']` is JavaScript, not tosijs.

Still open on this axis: a read through an inherited `constructor` (#4271).

**Refuse what is malformed; resolve what is valid** (#4312, #4338,
2026-11-28). The agent surface's gates compared the caller's spelling, and
the first plan was to refuse every non-canonical path. The owner's objection
settled it: `rows[0]` and `rows[prop=value]` are both intended, documented
spellings, so refusing one to cover for a string comparison removes a feature
to hide a bug. What landed:

- **A spelling that names nothing is refused where it is resolved.** The path
  engine read an index with `parseInt`, so `rows[0x2]` wrote row 0 and
  deleting `rows[abc]` deleted row 0. An index is digits now (`arrayIndex` in
  `by-path.ts`); anything else reads `undefined` and throws on a write.
- **Every valid spelling is resolved to one before a gate sees it.**
  `canonicalPath()` in `by-path.ts` walks live state and writes the path back
  one way (dotted keys; a row as its list binding spells it). The surface
  calls it where a path enters (`toPath`) and on what the gates hold on file.
- **`src/agent-spellings.test.ts` generates the spellings** of each place and
  requires the canonical answer. A new verb, gate or path syntax goes into
  that table.
- **Measure before you ship a resolver on a hot path.** The first version
  resolved paths that were already canonical: a read went from 0.26 ms to
  0.79 ms, a 1,000-row read from 3.6 ms to 13 ms. `isCanonicalSpelling()`
  answers from the text and the idPath registry for the common case, and it
  must only ever say yes to a path the walk would leave unchanged.

Known and not done: the ledger records a touch under the spelling the app
used, and `describe()` treats a binding respelled at its root as out of scope
(it fails closed). A write to a parent path still skips an inline contract
(#4288).

### Two rules about redaction, both paid for in 1.10.2

- **Never decide an element's fate by reading a record you just redacted — ask
  the element.** Suppressing `record.href` for secret links made the only
  `wired = true` test for bare anchors (`record.href != null`) go false, so the
  link was dropped from `describe()` *entirely* instead of appearing redacted.
  Withholding a fact silently became withholding the element's existence, and
  `auditAccessibility()` went quiet on exactly the regions authors mark most
  carefully. Suppression is not absence, and a redacted record is not a source
  of truth about the DOM.
- **Ask the DECISION, not the FLAG.** This one mistake produced three separate
  defects in 1.10.2, each inside the fix for the last. A harvest gated on
  `record.secret !== true` while its two siblings gated on
  `mayNotCarryContent`; those were the same question only until the flag
  stopped being set for one of the reasons the harvest was suppressed — after
  which a `<select>` holding a `data-tosi-secret` `<option>` published its
  value. The audit then made the identical mistake one file over, in the
  remediation commit, and was wrong in *both* directions at once. **If two
  sites answer the same question by reading different things, one of them is
  reading a proxy for the answer** — and it will be silently wrong the moment
  the proxy's definition is refined. The fix is a named field for the decision
  (`textWithheld`), separate from the flag (`secret`).
- **A flag meaning "we withheld something" must not be set by a condition that
  withholds nothing.** `record.secret` was set on mere subtree *containment* —
  which is the right reason to stop a free-text harvest, and the wrong reason to
  claim redaction. It was harmless while the flag was inert, and became a defect
  the moment floorplan 0.5.0 made it a redaction order: one bare
  `<input type="hidden" name="csrf">` blanked the caption of every wired
  ancestor, and records shipped `secret: true` beside the text they claimed was
  withheld. **When a flag changes from metadata to an instruction, re-audit
  every condition that sets it** — nothing in the suite fails at that moment.

## Component Conventions

- **`static preferredTagName`** sets the custom element tag name explicitly. Survives minification. If omitted, derived from class name (unreliable when minified, falls back to anonymous tag).
- **`static shadowStyleSpec`** — styles injected into shadow DOM. Setting this causes the component to use shadow DOM.
- **`static lightStyleSpec`** — global styles appended to `document.head`. `:host` selectors are rewritten to the tag name.
- **`static extends`** — for customized built-in elements (passed to `customElements.define()`).
- **`static initAttributes`** declares attributes synced to properties with automatic type inference from default values (string, number, boolean).
- **`withAttributes({...})`** is the preferred form since 1.10.0: it sets
  `static initAttributes` from a VALUE, so the attributes are typed on `this`.
  `Component`'s `[key: string]: any` index signature is GONE (tosijs#36) — it
  propagated to every subclass and made every typo compile. `initAttributes` is
  NOT deprecated: `withAttributes` emits it, and it is the only way to add
  attributes to an existing component class. Computed attributes are excluded
  from the declared type by design (the class implements them itself).
  `ComponentAttrs<T>` is the declaration-merging fallback — which the library
  itself cannot use in `src/`, because `tjs convert` rejects merging
  (tjs-lang#49); consumers can and should.
  **Subclassing a `withAttributes` base: declare ONLY the keys you add** —
  `_resolveInitAttributes()` merges the whole prototype chain (subclass wins
  per key), so spreading the base's map is redundant and hides the merge.
  Until 1.10.0 it did NOT merge on the no-contract path (a bare
  `return this.initAttributes`, which a subclass's own static shadows), so
  declaring one new attribute silently dropped every inherited one from the
  instance _and_ from `observedAttributes` — in exactly the shape these docs
  recommend. A subclass adding attributes still needs the one-line
  `export interface Sub extends ComponentAttrs<typeof Sub.initAttributes> {}`
  for `this.newOne` to type; inherited ones are typed already.
- **`static contract`** (`ComponentMap`) is the component's self-declaration —
  description, attribute constraints, parts, test fixture — feeding the docs,
  the agent surface and `exerciseComponent()`. **`initAttributes` DECLARES,
  `contract.attributes` ENRICHES, and they COMPOSE**: declaring both is the
  intended shape, the contract wins per key, and a contract entry may omit
  `default` when `initAttributes` supplies one. Both are described identically
  to an agent (since 1.8.1 — before that, `initAttributes` reached `describe()`
  not at all; tosijs#29).
- 🚧 **The contract API is IN FLUX and will change without a deprecation cycle**
  while tosijs#29/#30 settle (attribute division of labour; whether an
  integrator overlay embellishes or replaces). Nothing else in `Component` is —
  `initAttributes` is stable. Do not build a deprecation cycle around contract
  shape changes; steer to correctness and note it in the CHANGELOG.
- **`value`** is a special property, not an attribute. Don't put it in `initAttributes`. Setting it triggers a `change` event and `render()`.
- **`content`** can be a function `({div, span}) => div(...)` or a static node/array. The function form receives a destructurable `elements` proxy.
- **`parts`** is a proxy — `this.parts.foo` finds the element with `part="foo"`.
- **`static formAssociated = true`** enables form integration via `ElementInternals`.
- Components default to **light** DOM: a shadow root is attached only when the class has a `shadowStyleSpec` (verified in `hydrate()`, 2026-10-13; this line used to say the opposite).
- In light DOM, `<slot>` elements are automatically converted to `<tosi-slot>` for composition.
- **`elementCreator()`** takes no arguments — all configuration is via static properties. Passing `{ tag, styleSpec }` options still works but emits deprecation warnings.

## TypeScript is autocomplete, not a source of truth

**This is a deliberate position, not an accident or a backlog item.** tosijs is
a JavaScript library — the proxy descends from bindinator's and was designed for
JS — and it decides things at runtime by asking live objects. The `.d.ts` are a
*projection* of that design: useful for discoverability and editor autocomplete,
and **not an authority on whether code is correct.**

**Sharper than "sometimes wrong": an annotation carries no information about
behaviour.** A signal that is always false is useful — negate it. A signal
uncorrelated with what it describes carries nothing. In this codebase the
correlation between an annotation and the runtime exists *only where someone
independently wrote a check*: `touch(touchable: TosiTouchableType)` holds
because of an `if (invalid) throw`, not because of its signature, while
`debounce(origFn: VoidFunc, minInterval = 250)` cheerfully accepts
`debounce('not a fn', 10)` and returns a callable. Delete every annotation and
the runtime is identical; delete every check and the annotations are still
there, still green.

They *are* correlated with **intent** — evidence of what the author meant —
which is exactly why autocomplete works and the safety claim does not.
Autocomplete asks "what did the author mean this to have"; that is the
dimension annotations carry. Correctness asks "what does this do"; that is the
dimension they do not.

**The operational rule: when `tsc` and the runtime disagree, find out which one
is wrong. Do not assume it is the code.** Four times in one week the answer was
"the type":

| | the type said | the runtime does |
| --- | --- | --- |
| `ProxyObserveFunc` | `(path: string) => void` | takes a **callback**, returns an unsubscribe — exactly inverted, and every call site was checked against it |
| `ElementPart` | no proxies | `div(app.name)` is a **live** bound text child, "the most-used site" |
| `TosiProps` | no `tosiBinding` | present on object *and* scalar proxies |
| four public types | unexported | named in public signatures consumers must satisfy |

**And it flags correct code it cannot represent.** These are not defects:

- `app.name = 'Ada'` — intended since bindinator, identical to `.value =`.
  `TS2322`, and unfixable: asymmetric `get`/`set` works on a hand-written
  interface but mapped types have no such modifier, and widening to
  `BoxedProxy<T[K]> | T[K]` poisons every read. See *Dual Proxy System*.
- Undeclared props on `elements.*` creators. `elementCreator` dispatches on
  `(elt as any)[key] !== undefined` — **it asks the element** — plus its runtime
  class and the *type of the value passed*. The same line writes an attribute
  before `customElements.define` and a property after: identical source,
  opposite behaviour, decided by module load order. `ElementProps`' index
  signature is the honest type for that. (tosijs#26 has the demonstration.)

**The worked example: `elementSet` vs `ElementProps`.** `src/elements.ts`
decides what a prop *means* by asking questions at the moment of the call —
the key's shape (`^on[A-Z]`, `^bind[A-Z]`, `apply`, `contract`, `bind`), the
**value's** type (`tosiPath(value)`, a `TAKE_DESCRIPTOR`, `typeof value ===
'function'`), the **element's** identity (`tagName.includes('-')`), its
**current state** (`(elt)[key] !== undefined`, `typeof existing === 'function'`),
its **runtime class** (`instanceof SVGElement`/`MathMLElement`), and the
**component's declared default** (`typeof value !== typeof declaredDefault`).
Six kinds of runtime fact, in one dispatcher.

The event rule is one regex, so it works for any event name:

```js
elements.div({ onFrobnicate: (e) => … })   // attaches a 'frobnicate' listener
```

`ElementProps` answers the same question with **19 hand-written `onXxx?`
declarations**. It is therefore *too narrow* — custom event names are an open
set, so `onFrobnicate` needs `as any` even though it is correct — and *too
loose*, because the index signature absorbing the overflow also swallows typos
(tosijs#26). The runtime needs one line because it can ask; the type needs an
enumeration it can never finish, because it must answer in advance.

`elementSet`'s own comment records the consequence: *"an identical call site
can mean two different things depending on timing"* — a `<tosi-blueprint>`
component created before `customElements.define` takes the event-sugar branch;
after it, the assignment branch. No type describes that, and none should
pretend to.

**Never rewrite working code to satisfy the checker.** If a lane ever
typechecks `*.test.ts`, ~15 sites use direct assignment and are *correct*; a
ratchet chasing zero must exclude that class deliberately, not silently.

**This is NOT a licence to validate everything.** "The runtime is the truth"
does not mean "check every argument" — that is the same ceremony from the other
direction, and it costs real time on paths that run constantly. The rule is
**validate at boundaries, dispatch everywhere else**, and the two look
identical in a grep while being opposites:

- **Dispatch** asks *what does this value mean here* and always proceeds:
  `elementSet`'s `typeof value === 'function'`, the proxy's `typeof _prop ===
  'symbol'`. This is the design, and there is no version of the library without
  it.
- **Validation** asks *is this the right type* and refuses. It belongs where a
  wrong value corrupts state or fails far from its cause — `touch()` throws on
  an invalid target; the agent surface's `toPath()` refuses a non-proxy rather
  than `String()`-ing it into an unmatchable path.

The measured shape, which the codebase already had before anyone wrote it down:
`regHandler` is **about 280 lines whose only throws are the `__proto__`
guards and one invalid-path check on write**, and it runs on *every property
access*; `touch`, a public entry point, validates. **Take the performance win
of not checking** unless skipping the check would blow something up — which is
exactly what tjs's `safety inputs` at the public API and `safety none` for hot
internals encodes, and why 2.0 puts the touch queue, DOM updates and proxy
traps in the second bucket.

**What static checking IS good for here, and it is not nothing:** questions of
*shape at the seams*, which no execution reveals. `tsc --declaration` from a
scratch consumer caught tosijs#38 — `withAttributes` making downstream `.d.ts`
emit impossible, 34 files in tosijs-ui that would have shipped without types.
Nothing runs at that moment; only a compiler sees it. Use static analysis for
export surfaces and declaration emit; use execution for behaviour.

**Why this matters beyond style:** a wrong declaration is invisible to *both*
lanes. The suite exercises the runtime, `tsc` exercises the declaration, and
nothing compares them — which is how `ProxyObserveFunc` stayed backwards. The
gates in `src/type-surface.test.ts` exist for exactly that gap: they compile the
**documented spellings** against the **built** `.d.ts`, so the type is checked
against the API rather than against itself. This is also the case tjs is meant
to answer (2.0): executable signatures close the gap by construction.

## Key Design Patterns

See `Building-Apps.md` for the comprehensive developer guide. Critical patterns to understand:

- **Proxy pollution prevention:** The `set` handler shallow-unwraps proxied children (e.g. from `{ ...proxy }` spreads) before storing in the registry. The `get` handler defensively unwraps any proxied values found in the target before wrapping in a new proxy. This prevents proxy-on-proxy nesting.
- **Proxied vs. raw iteration:** `for...of` on proxied arrays yields proxied items (mutations trigger observers). `forEach`/`map`/`filter` pass raw items (mutations are silent, require `touch()`).
- **Observer callbacks receive paths, not values:** Callbacks are `(path: string) => void`. Read the value explicitly via `app.something.value`.
- **`content()` vs `render()`:** `content()` runs once during hydration — set up bindings here. `render()` runs on attribute changes — use only for structural changes, not manual DOM updates.
- **Deeply async by default:** Bindings can be set up before data exists. Data arriving later (fetch, websocket) flows to the UI automatically.

## Deprecation Conventions

Deprecated APIs emit a single `console.warn` per feature (tracked in a `Set` in `metadata.ts`). Old names (`xinValue`, `xinPath`, `tosiValue`, `tosiPath`) still work but should not be used in new code. Prefer `.tosi.value` and `.tosi.path` (or `.value`/`.path` when no shadowing risk). The direct properties on boxed proxies (`.value`, `.path`, `.observe()`, etc.) delegate through the same accessor implementation as `.tosi` but are not deprecated — they're convenient when there's no collision risk. **NO `bind*` element-prop shortcut is deprecated** (1.9.1). The rule was "deprecated iff a plain prop expresses it exactly", narrowed to the proxy form only — sound, but it made deprecation-ness depend on the VALUE, which TypeScript cannot express, so the typings carried no `@deprecated` while the runtime still warned. tosijs-ui reported that mismatch against published 1.9.0. The nudge was worth little (`bindText` is barely more writing than `textContent`) and the shortcut is the ONLY form that binds a path string — `textContent: 'path'` sets literal text, `disabled: 'path'` is always truthy and permanently disables the control — so it was console spam in someone else's build for a stylistic preference. Prefer the plain prop with a proxy; the shortcut is correct and silent. `.tosi.listBinding()` is _sugar over_ `bindList`, so deprecating it made the recommended API warn its own callers from inside itself, and its message could not even be written as a props key. Routing around that instead of questioning it produced a silent list-destroying `bind` collision and a breaking change to a public return shape; see `reviews/`.

**The `Xin*` TYPE names are deprecated aliases of `Tosi*`** — all 27 of them, as of 1.8.2. The blueprint five (`XinBlueprint`, `XinFactory`, `XinComponentSpec`, `XinPackagedComponent`, `XinSlot`) were renamed in 1.7.6; the other 22 (`XinStyleRule`, `XinStyleSheet`, `XinObject`, `XinBinding`, `XinProxy`, `XinProps`, …) were missed and untracked for four releases, and are done now. Aliases are type-only (zero runtime, zero bundle) and **go away in 2.0**. Use `Tosi*` in new code. Note `src/index-core-exports.ts` and `src/index-state.ts` use EXPLICIT export lists, not `export *` — an alias not named there does not reach a consumer. `<xin-slot>` remains a runtime tombstone class (deliberately, so misplaced content still composes) and is separate from the type rename. `static styleSpec` is a deprecated alias for `static shadowStyleSpec`. Passing `{ tag, styleSpec }` to `elementCreator()` is deprecated — use `static preferredTagName` and `static lightStyleSpec` instead.

**Advice is one sentence and a link; a defect report stays whole** (#4285,
2026-11-27). A message about a CHOICE (a deprecation, the `on<Event>` naming
advice, the long-list advice) says what it found and what to write instead,
then ends in `https://tosijs.net/<page>/#<anchor>`, and the reasons go on that
page. A message that reports something WRONG keeps everything in the string.
`settings.ts` draws the same line for `quiet`. `checkInternalLinks()` in
`bin/site.ts` fails the build when such a link, or a `](/page/#anchor)` or
`](#anchor)` link in the docs, names a page or an id the site did not
generate, so renaming a heading a message links to breaks the build and not
the link. **Do not expect bytes from this rule:** advice was five long
messages, about 0.3 kB gz. Of the 17 kB of message prose in `src/`, the rest
is defect reports, thrown errors, agent refusals, audit findings, WebMCP tool
descriptions and the vendored schematic.

## Code Style

- ESLint with TypeScript parser; `any` is allowed (`@typescript-eslint/no-explicit-any: 0`)
- Uppercase wrapper types (`String`, `Number`, `Boolean`, `Function`) are explicitly allowed via `ban-types` — do not convert these to lowercase equivalents
- Unused function arguments must be prefixed with `_` (via `argsIgnorePattern`)
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas (ES5)
- **Prettier does NOT touch markdown** (`*.md` is in `.prettierignore`). Its
  markdown printer is not idempotent — a list continuation gains four spaces of
  indentation per `--write` and never converges, which silently mangled
  `TODO.md` over months. True in 2.8.8 and 3.9.6, and no `proseWrap` setting
  avoids it; all 110 non-markdown files are idempotent. Repro in `UPSTREAM.md`.
  `bun run format:check` gates formatting in CI — verify idempotency before
  adding any file type back.
- `src/xin-types.ts` is excluded from Prettier (via `.prettierignore`) to preserve its manually curated layout — do not reformat this file

## Shared practices

This project follows the ecosystem-wide conventions in
**`../tosijs-coding-practices`** — read it, and contribute lessons back.
`practices/observant-model.md` is required reading (tosijs is _observant_,
not "reactive": the DOM is persistent and observers surgically update bound
nodes; UI is not `f(state)`). Lessons written back _from_ tosijs live there
too, including the Enter-commit doctrine and the `sideEffects`-array trap.

## Issue Tracking

**Tasks live on the virta board**: <https://virta.tosijs.net/host/#?virta.scope=tosijs>
(onboarded 2026-09-26). Use the `virta` CLI / MCP, writing as `Tosi × tosijs`; the
SessionStart hook runs `virta brief`, and each message runs `virta brief --changes`.
`ready` is the owner's go-ahead: agents put work in the backlog and let the owner promote it.
`TODO.md` is a pointer now and `UPSTREAM.md` a record: don't add tasks to either (a list item
in `TODO.md` would be imported as a task). Asks of another project on the board are tasks in
THAT project; GitHub issues remain for external reporters and repos not on the board.

- `DECISIONS.md` — settled design decisions and why; read before re-proposing one
- `reviews/TODO-archive-2026-09-26.md` — the pre-board backlog, verbatim: evidence,
  measurements, review ledgers. Read it before re-deriving anything.

## Releasing

Releases publish through **`.github/workflows/publish.yml`** (the shared template from
`tosijs-coding-practices`, adopted 2026-09-26): OIDC trusted publishing plus npm **staged**
publishing. The workflow can only *stage*; the owner's 2FA approval on npmjs.com publishes.
**The suites run LOCALLY and are attested**, not re-run in CI (owner's preference: test
locally, attest the checksummed build product). `releaseDoctor.attestedLanes` in
`package.json` names them (`test`, `test:browser`). The built `dist/` and `docs/` are still
committed, and CI must reproduce every shipped file byte-for-byte from the tag.
Authoritative: `../tosijs-coding-practices/practices/publishing-via-oidc.md`.

1. Bump `version` in `package.json` (semver).
2. Add an entry to `CHANGELOG.md` (Keep a Changelog format) under the new version.
3. `bun run build` — runs the unit suite, stamps `src/version.ts`, and regenerates `dist/` +
   `docs/`. Refuses to run on any Bun but `.bun-version`'s: a different Bun builds a
   different `dist/`, which the publish workflow rejects. **Run it twice if `git status`
   is not clean after the commit's build**: when a size figure in README crosses a rounding
   boundary, the site data is one pass behind (#4310), and release-doctor reports it as
   "non-code artifacts differ".
4. `bun run stamps --max-age 60` — **re-survey the perishable claims.** Facts about
   the outside world (browser versions, what a competitor ships, a spec's status) are
   stamped `<!-- as-of: YYYY-MM-DD | … -->` rather than continuously maintained, because
   nothing in the build can generate or check them. This lists them by age and exits
   non-zero if any is older than the limit. Re-survey and rewrite, or re-stamp
   deliberately if you checked and nothing moved. **Do not write the update as a diff
   against the previous survey** — rewrite it as a fresh statement and let git hold the
   history. (Deliberately NOT a `bun run build` gate: a stale doc is not a broken build,
   and failing the build over it would train everyone to bypass it.)
5. Commit everything with a `vX.Y.Z: <summary>` message and push. **Commit before any
   browser lane runs**: the lane tests the working tree, so only a clean tree makes its
   result a statement about the commit (see the browser-lane note above).
6. **Dry-run the workflow before tagging**: `gh workflow run publish.yml -f tag=main -f
   dry_run=true`. Every check up to staging, no tag to move if it fails. Without an
   attestation the lanes run in CI and `test:browser` fails there (no TLS certs or
   browsers): read that one as expected, and the rest as real.
7. **Attest**: `bun ../tosijs-coding-practices/tools/attest.ts` on the clean release commit
   (the sibling checkout, pulled). It runs `test` and `test:browser` (real Chromium +
   Firefox, plus WebKit for the `virtual-list-*` specs since 1.10.9 because iOS
   scrolls with it; Playwright starting its own dev server) and writes `release-attestation.json`
   with the sha256 of every shipped file. The dev server rewrites `docs/version.json` and
   the ePub; neither ships, so attest warns and carries on — `git checkout docs/` them.
   Commit **only** `release-attestation.json` (`attest: vX.Y.Z`), tag **that** commit
   `vX.Y.Z` (lightweight), `git push && git push --tags`. `attest.ts --verify` checks it.
8. `gh workflow run publish.yml -f tag=vX.Y.Z`. The run checks tag == version, rebuilds
   and requires every shipped file unchanged, packs, verifies the tarball against the
   attestation, smoke-tests it, runs `release-doctor`, then **stages**. The dist-tag
   comes from the version (`-rc.N` → `rc`, …), never from a flag.
   8b. **The owner approves** at npmjs.com → tosijs → Staged Packages (2FA; works from a
   phone). The run waits 60 minutes, then verifies the published integrity, the
   dist-tags and a consumer smoke test **against the registry's copy**. Approved later?
   Re-run with `verify_only` ticked. **A green run is the "published and verified"
   statement**: read the run, don't re-derive it by polling npm.
   **`files` publishes `dist/`, `/src` (minus `*.test.ts`, the doc-site entry `index-iife.ts` and
   dotfiles), `SECURITY.md`, `LICENSE`, `NOTICE`, `README.md`, `CHANGELOG.md` and `llms.txt`.**
   `/src` is there since 1.10.2 because the shipped source maps no longer inline
   `sourcesContent` — they resolve `../src/foo.ts` against the packed tree
   instead, which took the tarball from 4.51 MB to 2.51 MB and gives consumers a
   readable source. **Consequence worth internalising: a scratch file, fixture
   or credential left in `src/` NOW SHIPS.** It did not before.
9. On the virta board, so no scoreboard row: showcase a closed task worth seeing
   (`virta showcase #n …`), per `releasing.md` step 9. A fix with nothing to look at needs none.

> **This list is a SUMMARY.** `../tosijs-coding-practices/practices/releasing.md`
> is authoritative and carries steps this one has historically dropped —
> including the pre-release nine-lens review and settling incoming issues. When
> the two disagree, the KB wins; when you find a gap here, fix it there first.

## Session Completion ("Landing the Plane")

> **Branch exceptions.** Some branches deliberately have no remote and must not
> be given one; on those, "done" means committed locally with a clean
> `git status`, and a missing upstream is not a problem to fix. Check before
> treating a failed push as something to resolve. _(There is no such branch
> today: `one-user-interface`, which carried the unpublished agent-surface
> manifesto, was merged to `main` for 1.8.0 once secrecy stopped being useful.
> The rule stays because the situation recurs.)_

When ending a work session, work is **not** complete until `git push` succeeds
**on a branch that has a remote**. Follow this workflow:

1. **File remaining work** — add follow-ups to the virta board (see *Issue Tracking*).
2. **Run quality gates** (if code changed) — `bun test`, linters, `bun run build`. If the
   change touches DOM/binding behavior, also `bun run test:browser` (the browser lane is
   not part of `bun run build`).
3. **Push to remote** — this step is mandatory:
   ```bash
   git pull --rebase
   git push
   git status   # MUST show "up to date with origin"
   ```
4. **Clean up** — clear stashes, prune stale remote branches.
5. **Verify** — all changes committed AND pushed.
6. **Hand off** — leave context for the next session.

Do not stop before pushing (that strands work locally), and do not say "ready to push when you are" — complete the push. If it fails, resolve and retry until it succeeds.

**Unless the branch is one that must not be pushed** (see the exception above),
in which case step 3 is "commit, and verify `git status` is clean" and the
session is complete there.
