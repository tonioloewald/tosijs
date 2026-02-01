# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tosijs (formerly xinjs) is a lightweight (~10kB gzipped) path-based state management library for web applications. It uses proxy-based observers to eliminate binding boilerplate, similar to Redux but simpler. Works with vanilla JS/TS, web components, and integrates with React via react-tosijs.

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
```

## Build System

The build system (`dev.ts`) uses Bun's bundler and outputs three formats:
- `dist/index.js` - IIFE for browser/script tags
- `dist/module.js` - ES Module
- `dist/main.js` - CommonJS

TypeScript declarations are generated via `tsc --declaration`. The build runs tests before bundling and generates documentation from markdown files and inline `/*#...#*/` comments into `demo/docs.json`.

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
- `elements.ts` - Element factory functions (`div()`, `span()`, etc.)
- `bind.ts` - Data binding connecting state to DOM
- `list-binding.ts` - Array/list bindings with virtual scrolling support
- `component.ts` - Base class for web components
- `css.ts` - CSS generation utilities (`css()`, `vars`, `initVars()`)

**Key types (in `xin-types.ts`):**
- `BoxedProxy<T>` - Type-safe proxy for state objects
- `BoxedScalar<T>` - Lightweight proxy for primitives (string/number/boolean) with:
  - `.value` / `.path` - Get/set value and get path
  - `.observe()`, `.bind()`, `.on()` - Reactive bindings
  - `.valueOf()`, `.toString()`, `.toJSON()` - Type coercion
  - Note: `xinValue`, `xinPath`, etc. are deprecated; use the above
- `XinBinding<T>` - Binding specification with `toDOM` and `fromDOM` functions
- `Component` - Abstract base class for web components

## Testing

Tests use Bun's test runner with Happy DOM for DOM environment (configured in `bunfig.toml` and `happydom.ts`). Test files follow the pattern `*.test.ts` in the `src/` directory.

## Code Style

- ESLint with TypeScript parser; `any` is allowed (`@typescript-eslint/no-explicit-any: 0`)
- Unused variables must be prefixed with `_`
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas (ES5)

## Issue Tracking

This project uses **bd (beads)** for issue tracking. Run `bd prime` for full workflow context.

```bash
bd ready                    # Find unblocked work
bd list --status=open       # All open issues
bd show <id>                # View issue details
bd create --title="..." --type=task|bug|feature --priority=2  # Create issue
bd update <id> --status=in_progress  # Claim work
bd close <id>               # Complete work
bd sync                     # Sync with git (run at session end)
```

**Session end protocol:** Always run `bd sync` and `git push` before ending a session. See AGENTS.md for the full checklist.
