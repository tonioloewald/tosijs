# Decisions

Settled design decisions, with the reason each was made. Read the entry before
re-proposing something it rules out; if the reason no longer holds, say why and
reopen it deliberately. Full evidence for each lives in the archived backlog,
[`reviews/TODO-archive-2026-09-26.md`](reviews/TODO-archive-2026-09-26.md)
("archive" below). Tasks live on the virta board, not here.

## Bind dispatch is DOM-as-registry; a path→element index is rejected

Tried, and rejected twice (2026-07-17). Virtual list bindings keep the DOM at
O(visible): rows that stay on screen keep their elements, a row that scrolls
out is discarded, and one that scrolls in is cloned fresh from the template
(faster than cleaning up and reusing an old row). So bound elements are created
and destroyed continuously while scrolling, and any path-keyed index would churn
with them on the hot path virtual scrolling exists to keep flat. A leak-free
path→element map is also genuinely hard: strong refs leak subtrees, WeakRefs
leak keys. The `querySelectorAll` scan is bounded because virtual lists cap live
DOM; the two are co-designed. Archive § "SB-1", item 3.

*Corrected 2026-10-04:* this entry used to say virtual lists recycle elements
and rewrite their binding paths in place. They do not: rows are cloned per item
and discarded when they leave the slice (owner; `list-binding.ts`'s removal
phase; pinned by the record-key test in `agent.test.ts`). The decision stands
on the churn, which is real either way.

## Virtual lists clone rows; they do not recycle them

A row that scrolls in is cloned fresh from the template; a row that scrolls
out is discarded; rows that stay on screen are left alone. Recycling (reusing
departing rows for arriving items and re-pointing their bindings) **was tried
and found both slower and buggier** than cloning (owner, 2026-10-04; the
attempt predates this repo's history). Cloning a template is cheap, and a
recycled row carries state from its previous item — listeners, focus, form
values, component internals — that every reuse must remember to reset. Do not
reintroduce recycling as an optimisation without measuring it against cloning
and covering that stale-state class. Consequences that depend on it: a
record's `key` lasts while its row stays on screen (`agent.test.ts`), and
path-indexed dispatch is rejected partly because rows churn (above).

## A shadow-DOM component binds like an `<input>`, through its `value`

Binding into a shadow tree is unsupported by design (SB-1, 2026-07-17): bind the
component with `bindings.value`, and let `render()` reflect value into its shadow
DOM. `bind()` inside a shadow root warns once; `on()` works across open shadow
roots via `composedPath()`. A registry of shadow roots was rejected: it decays in
exactly the stress case (a table of custom input widgets). Archive § "SB-1".

## The DOM↔state value boundary has two layers (H-6)

The binding layer is the type boundary: DOM speaks strings, state speaks typed
values. A control that declares its type (`number`, `range`, the date family) is
read natively, independent of state, and an empty or partial entry falls back to
the raw string rather than fabricating a value. Archive § "H-6".

## Contracted roots deep-clone on write; copy-on-write was built and reverted

Structural sharing cut a sub-path write 4.3× and was reverted anyway, because it
changes what a validator sees: a sibling `Date` reached `check()` as a real
`Date`, a method as a live function, where the JSON round-trip had normalised
both. Do not re-attempt without reading archive § "Copy-on-write was BUILT,
MEASURED, and REVERTED".

## share / sync / hot-reload bypassing contracts is a trust boundary, not a hole

`share()` peers are same-origin by construction, so injecting a message needs
code execution that could write state directly. `sync()`'s transport is chosen
by the app. Contract validation is not the layer that defends either. Opt-in
validation for version skew is a task, not a security fix. Archive § "ESCALATED
on review".

## Unbound structural text is published under a manifest (b17d53d)

Scope withholds what tosijs can trace to a path. An unbound heading's text has
no path, including text interpolated from state at creation time, so it is
published as authored structure; failing closed would withhold the page's
structure. The author's controls are binding it, `data-tosi-secret` or
`aria-hidden`. Documented in *Secrets* (`src/agent.ts`).

## No `sideEffects` array in `package.json`

A `sideEffects` array shipped bundles whose exports had been shaken away, caught
only by executing the built bundle. Opt-in weight is split by entry point
(`tosijs/core`, `tosijs/state`) instead. Archive § "Bundle diet".

## Breaking changes wait for 2.0

Maintainer policy (2026-09-01): the great purge is 2.0; until then, don't break
anyone. Keep compatibility where it is cheap (a type alias costs nothing) and
break only where compatibility preserves a design error. Exception: the
contract API is explicitly in flux (see CLAUDE.md). Inventory: archive § "2.0 —
THE PURGE INVENTORY".

## Don't infer an API is absent from a probe that never asked for it

WebMCP's `registerTool(tool, { signal })` already did what we were compensating
for with refusing stubs; we had only probed for a returned handle and
`unregisterTool`. Feature-probe the actual seam before building around its
absence. Archive § "E2".
