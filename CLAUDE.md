# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tosijs (formerly xinjs) is a lightweight (~15kB gzipped) path-based state management library for web applications. It uses proxy-based observers to eliminate binding boilerplate, similar to Redux but simpler. Works with vanilla JS/TS, web components, and integrates with React via react-tosijs.

**Key characteristics:**

- Zero runtime dependencies
- No JSX, transpilation, or virtual DOM required
- Direct DOM manipulation with native HTML and web standards
- Full TypeScript support with strict mode

## Commands

```bash
bun start                   # Dev server with hot reload (https://localhost:8018)
bun test                    # Run all tests
bun test src/foo.test.ts    # Run specific test file
bun run format              # Lint and format code (ESLint --fix + Prettier)
bun run dev.ts --build      # Production build only (runs tests, then exits)
bun run free-port           # Kill process on port 8018
bun pack                    # Create local package tarball for testing
```

**Note:** The dev server requires TLS certificates in `tls/key.pem` and `tls/certificate.pem`.

## Build System

The build system (`dev.ts`) uses Bun's bundler and outputs three formats:

- `dist/index.js` - IIFE for browser/script tags
- `dist/module.js` - ES Module
- `dist/main.js` - CommonJS

TypeScript declarations are generated via `tsc --declaration`. The build runs tests before bundling. After bundling, `tjs convert` generates debug and safe variants (`dist/module.debug.js`, `dist/module.safe.js`) as subpath exports (`tosijs/debug`, `tosijs/safe`).

**Documentation generation:** `docs.js` extracts documentation from two sources into `demo/docs.json`:

1. Markdown files (`.md`) at the root level
2. Inline `/*# ... */` blocks in source files — these contain Markdown with numbered headings (e.g., `# 1.2 path-listener`) that control section ordering. Note: the opening delimiter is `/*#` but the closing is just `*/`.

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
    ├── xinProxy({ key: value }) # Alias for tosi()
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
- `settings.ts` - Debug/performance flags (`settings.perf`, `settings.debug`)

### Dual Proxy System (`xin` vs `boxed`)

The library exposes two proxies over the same `registry` object:

- **`xin`** — returns raw values for scalars. `xin.foo.bar` returns the string/number directly.
- **`boxed`** — returns `BoxedScalar` proxies for everything, including primitives. `boxed.foo.bar` has `.value`, `.path`, `.observe()`, etc.

Both are created in `xin.ts` via `regHandler(path, boxScalars)`. The `boxScalars` flag controls whether primitives are wrapped. `tosi()` / `xinProxy()` in `xin-proxy.ts` are sugar for assigning to `xin` and returning from `boxed`.

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
  - Note: `xinValue`, `xinPath`, `tosiValue`, `tosiPath`, etc. are deprecated; use `.value` / `.path`
- `BoxedScalar<T>` - Lightweight proxy for primitives (string/number/boolean); same API as `BoxedProxy`
- `XinBinding<T>` - Binding specification with `toDOM` and `fromDOM` functions
- `Component` - Abstract base class for web components

## Testing

Tests use Bun's test runner with Happy DOM for DOM environment (configured in `bunfig.toml` and `happydom.ts`). Test files follow the pattern `*.test.ts` in the `src/` directory.

**Async updates:** After state changes in tests, use `await updates()` to wait for all pending observer callbacks and DOM updates to complete before asserting on UI state.

**Happy DOM limitations:**

- Does NOT support `:scope >` CSS selector — use manual child iteration instead
- Elements return `0` for `offsetWidth`/`offsetHeight` — mock with `Object.defineProperty(el, 'offsetHeight', { value: 300, configurable: true })`
- `ListBinding` tests require proxied arrays from `xin['path.to.array']`, not raw arrays (raw arrays lack the `XIN_PATH` metadata)
- Throttled event handlers are unreliable in tests; call methods like `lb.update()` directly

## Component Conventions

- **`static preferredTagName`** sets the custom element tag name explicitly. Survives minification. If omitted, derived from class name (unreliable when minified, falls back to anonymous tag).
- **`static shadowStyleSpec`** — styles injected into shadow DOM. Setting this causes the component to use shadow DOM.
- **`static lightStyleSpec`** — global styles appended to `document.head`. `:host` selectors are rewritten to the tag name.
- **`static extends`** — for customized built-in elements (passed to `customElements.define()`).
- **`static initAttributes`** declares attributes synced to properties with automatic type inference from default values (string, number, boolean).
- **`value`** is a special property, not an attribute. Don't put it in `initAttributes`. Setting it triggers a `change` event and `render()`.
- **`content`** can be a function `({div, span}) => div(...)` or a static node/array. The function form receives a destructurable `elements` proxy.
- **`parts`** is a proxy — `this.parts.foo` finds the element with `part="foo"`.
- **`static formAssociated = true`** enables form integration via `ElementInternals`.
- Components default to shadow DOM. Set `role` in `initAttributes` to use light DOM instead.
- In light DOM, `<slot>` elements are automatically converted to `<xin-slot>` for composition.
- **`elementCreator()`** takes no arguments — all configuration is via static properties. Passing `{ tag, styleSpec }` options still works but emits deprecation warnings.

## Key Design Patterns

See `Building-Apps.md` for the comprehensive developer guide. Critical patterns to understand:

- **Proxy pollution prevention:** The `set` handler shallow-unwraps proxied children (e.g. from `{ ...proxy }` spreads) before storing in the registry. The `get` handler defensively unwraps any proxied values found in the target before wrapping in a new proxy. This prevents proxy-on-proxy nesting.
- **Proxied vs. raw iteration:** `for...of` on proxied arrays yields proxied items (mutations trigger observers). `forEach`/`map`/`filter` pass raw items (mutations are silent, require `touch()`).
- **Observer callbacks receive paths, not values:** Callbacks are `(path: string) => void`. Read the value explicitly via `app.something.value`.
- **`content()` vs `render()`:** `content()` runs once during hydration — set up bindings here. `render()` runs on attribute changes — use only for structural changes, not manual DOM updates.
- **Deeply async by default:** Bindings can be set up before data exists. Data arriving later (fetch, websocket) flows to the UI automatically.

## Deprecation Conventions

Deprecated APIs emit a single `console.warn` per feature (tracked in a `Set` in `metadata.ts`). Old names (`xinValue`, `xinPath`, `tosiValue`, `tosiPath`) still work but should not be used in new code. Prefer `.tosi.value` and `.tosi.path` (or `.value`/`.path` when no shadowing risk). The direct properties on boxed proxies (`.value`, `.path`, `.observe()`, etc.) delegate through the same accessor implementation as `.tosi` but are not deprecated — they're convenient when there's no collision risk. `static styleSpec` is a deprecated alias for `static shadowStyleSpec`. Passing `{ tag, styleSpec }` to `elementCreator()` is deprecated — use `static preferredTagName` and `static lightStyleSpec` instead.

## Code Style

- ESLint with TypeScript parser; `any` is allowed (`@typescript-eslint/no-explicit-any: 0`)
- Uppercase wrapper types (`String`, `Number`, `Boolean`, `Function`) are explicitly allowed via `ban-types` — do not convert these to lowercase equivalents
- Unused function arguments must be prefixed with `_` (via `argsIgnorePattern`)
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas (ES5)
- `src/xin-types.ts` is excluded from Prettier (via `.prettierignore`) to preserve its manually curated layout — do not reformat this file

## Issue Tracking

Open tasks and known issues are tracked in `TODO.md` at the project root.
