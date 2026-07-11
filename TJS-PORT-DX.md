# TJS Port — Developer Experience Findings

A living log of what it's actually like to port tosijs from TypeScript to native
TJS (the tosijs 2.0 effort). Updated per module. Two audiences: the tosijs port
itself (patterns to follow) and `../tjs-lang` (feedback to fix).

## Takeaway so far

**Performance is fine and the size regression is perfectly tolerable.** With the
right mode selection, native `.tjs` matches TS on both runtime and size for hot
code; the ergonomic modes cost a little where you opt into them, which is exactly
where you don't put hot paths. Nothing here blocks the port.

**Framing principle (don't evaluate TJS as "a better `tsc`").** The goal is to
*replace* TypeScript with a type system that's a natural part of the language —
examples-as-types, predicates-as-functions — not to auto-emit TS-quality `.d.ts`.
`.d.ts` is an expressly-controlled **migration bridge** (`declaration { … }` blocks,
`// TS:`, or just keep `tsc` on un-migrated `.ts`). Judge TJS by its native type
system (the predicate / `CSS.supports` work below), not by how close auto-inferred
`.d.ts` gets to hand-written TS. Where auto-inference is used it should still be
*correct* (see the required→optional bug), but its polish isn't the yardstick.

## Two independent axes (learn this first)

TJS has two orthogonal knobs, and conflating them wasted time early on:

1. **`safety` level** — `safety none | inputs | all`. Controls *runtime input
   validation*. `none` = no checks (hot internals); `inputs` = validate at the
   public boundary; `all` = validate everywhere.
2. **`Tjs*` modes** — `TjsEquals`, `TjsClass`, `TjsDate`, `TjsStandard`, … Control
   *JS semantic transforms*. Native dialect turns them **all on** by default;
   `TjsCompat` turns them all off; individual directives turn one on. There is no
   "turn one off" — compose from `TjsCompat` upward.

`safety none` does **not** remove the mode transforms. They're separate. The size
and per-conditional overhead come from the *modes*, not from safety.

### Mode selection policy for the port

- **Hot internal modules** (path parsing, touch queue, DOM updates, proxy traps):
  `safety none` + `TjsCompat`. Compiles to plain JS → TS-parity speed and size.
- **Boundary / proxy modules** that want the ergonomics (`==` via `Eq`, new-less
  classes): start from `TjsCompat` and re-enable just what you need
  (`TjsCompat` then `TjsEquals`), accepting the small tax where the path isn't hot.

## Toolchain that works

- `src/bun-plugin/tjs-plugin.ts` — a ~15-line Bun `onLoad` plugin that transpiles
  `.tjs` via `tjs-lang/lang`'s `tjs()`. Preloaded in `bunfig.toml` for `bun test`.
- Transpiled `.tjs` output self-contains its `__tjs` runtime fallback
  (`globalThis.__tjs?.createRuntime?.() ?? {Eq,NotEq,…}`), so no separate runtime
  install is needed for imports.
- **Validation pattern:** keep the `.ts` in place, add `foo.tjs`, and a
  `foo-port.test.ts` that runs the original assertions against `./foo.tjs`
  through the plugin. Proves behavior-equivalence before swapping anything.

## Phase-2: the full swap (and what `.d.ts` actually is)

> **Design intent — read before treating any of this as a "blocker."** TJS's goal
> is to **replace** TypeScript with a type system that's a *natural part of the
> language* (examples-as-types, predicates-as-functions), **not to be a better
> `tsc`**. So `.d.ts` emission is a **migration bridge you expressly control**, not
> an auto-inference feature whose quality measures the system. You control it via:
> - **`declaration { … }` blocks** — verbatim TS emitted into the `.d.ts`
>   (confirmed: a `Generic BoxedProxy<T> { declaration { value: T; path: string;
>   observe(cb: (path: string) => void): void } }` emits exactly that interface).
> - **`// TS:` type comments** on `Type` declarations.
> - or simply **keep `tsc`** emitting `.d.ts` for the `.ts` files you haven't
>   migrated yet (tosijs already runs `tsc` for declarations via `libraryTsconfig`).
>
> The right lens for the port is TJS's **own** type system (the predicate / example
> work above), not "how close does auto-inferred `.d.ts` get to hand-written TS."
> Evaluating TJS as a `.d.ts` generator is evaluating a macro-assembler that wishes
> it were a different language — which is exactly what it's trying not to be.

Mechanically, replacing a `.ts` with a `.tjs` in the shipped build still needs:

1. **`.d.ts` for the importers** — either express-controlled from the `.tjs`
   (`declaration` block / `// TS:`), or keep `tsc` covering the still-`.ts` graph
   during migration. tjs-lang's `generateDTS(result, source)` is the auto path;
   it works but isn't exported from `tjs-lang/lang` (only the repo's
   `src/lang/index.ts`) so it isn't reachable from the published package.
2. **An `onResolve`** so a bare `import './foo'` picks `foo.tjs` in `Bun.build`
   (Bun doesn't try the `.tjs` extension by default).

### `.d.ts` *auto-inference* findings (2026-07-05) — the convenience path

These characterize the *auto* path (`generateDTS` with no express control). They're
not swap blockers (express control / `tsc` cover the real need), but they show
where the convenience path is rough. On the stripped-annotation `TjsCompat` port
of `by-path`, the auto dts is loose — every function `(...: any): any`, required
params marked **optional** (`path?: any`). Adding TJS annotations improves it, with
these consequences:

- **Annotations restore real types.** With `function getByPath(obj: {}, path: '')`
  etc. the dts becomes `getByPath(obj: Record<string, any>, path: string): any`,
  params correctly `required`, and a `: true` return annotation emits `: boolean`.
- **Annotations add `.__tjs` metadata to the *runtime* output** even under
  `TjsCompat`/`safety none` (params/`unsafe`/source blocks). Size cost, not a speed
  cost — but it means "annotate for dts" enlarges the shipped bundle vs the bare
  273 B stripped port. The two goals (small runtime vs good dts) pull opposite ways.
- **`export const id = () => …` emits `id: any`.** The dts emitter only infers
  signatures for `function` declarations, not arrow-function consts. Porting has to
  prefer `export function` for anything that should keep a typed signature.
- **Example-based annotations narrow unions.** `val: 0` → `val: number` (but
  `setByPath` accepts any value); `path: string | PartArray` can't be expressed by
  a single example at all. So the emitted types can be narrower or different from
  the hand-written TS — fine for by-path (path is a string at the boundary), but a
  real limitation for union-heavy signatures. A `Type` alias would be the escape
  hatch.

Net (reframed): the full swap is mechanically feasible. The interesting types
(`by-path`'s are all `any`/`string` at the boundary anyway) belong in TJS's native
system, and for the *interop* `.d.ts` you either express-control it (`declaration`
block / `// TS:`) or let `tsc` cover the un-migrated `.ts` graph. The auto-inference
roughness above (loose types, union narrowing, arrow consts) is a convenience-path
concern, not a reason the swap can't happen — and *not* the yardstick for TJS as a
type system. The one item that's a genuine bug regardless of framing is the
required→optional param mapping (feedback #11), because the auto path emits
*invalid* TS, which no amount of "it's just a bridge" excuses.

### Full-swap attempt: by-path (2026-07-06, tjs-lang 0.9.0) — reverted

Attempted to actually ship `by-path.tjs` as the source (drop `by-path.ts`). **Not
blocked by tjs-lang** — 0.9.0 transpiles, types, and bundles fine. Blocked by two
things *outside* tjs, and by-path being the worst-case module to try.

What worked, layer by layer:

| layer | result | how |
| --- | --- | --- |
| runtime (`bun test`) | ✅ 575 pass | explicit `./by-path.tjs` imports + plugin `onLoad` |
| types (`tsc`) | ✅ clean | `allowArbitraryExtensions` + hand-authored `by-path.d.tjs.ts` |
| main library bundle (`Bun.build`) | ✅ 59 KB | plugin in `Bun.build({plugins})` |
| debug/safe bundle | ✅ plumbing | copy `.tjs` into `tjs-out/` (convert skips it) + plugin |
| **buildSite CSS extraction** | ❌ **blocker** | evaluates tsc-emitted per-file `dist/*.js`, which `import './by-path.tjs'` in a context without the plugin |

**Blocker 1 — Bun runtime `onResolve`.** Bun's *runtime* module loader (bun test /
bun run) does **not** invoke plugin `onResolve` for relative specifiers (verified:
the callback never fires; it *does* fire in `Bun.build`). So `import './by-path'`
can't be auto-redirected to `.tjs` at runtime — you must write the extension
(`./by-path.tjs`). Workable but touches every importer. This is a **Bun** limit.

**Blocker 2 — tosijs's own build.** `tosijs-ui/site`'s `buildSite` runs `tsc` to
emit per-file `dist/*.js` and then **evaluates** them (the `generate-css` step;
`bin/site.ts` even comments on keeping those `.js` "so generate-css could resolve
`tosijs`"). Those tsc outputs contain `import './by-path.tjs'`, evaluated in a
process/context where the tjs plugin isn't registered → `Cannot find module
'./by-path.tjs' from dist/xin-proxy.js`. Staging the `.tjs` into `dist` didn't help
(buildSite reorders/clears dist and the eval context still lacks the loader). This
is a **tosijs-ui build architecture** issue — see `../tosijs-ui/BUILD-TJS-HOOK.md`.

**Why by-path is worst-case:** it's core *and* in the CSS-extraction eval graph. A
leaf module outside that graph should clear buildSite. Swap reverted to keep the
branch buildable; `by-path.tjs` stays validated-in-parallel.

**Unblock paths:** (1) a `buildSite` hook to replace/augment the tsc step (let the
tjs build emit artifacts where tsc would) — the real fix; (2) wait for Bun runtime
`onResolve` (helps blocker 1 only); (3) the bulk all-`.tjs` strategy below, which
sidesteps blocker 1 entirely.

**Leaf modules do NOT escape the wall (verified 2026-07-08).** Tried swapping the
pure leaf `more-math` — buildSite failed the same way (`Cannot find module
'./more-math.tjs' from dist/index.js`), because everything is reachable from
`index`, which the CSS-extraction step evaluates. So per-file swaps are blocked for
*any* module in the shipped graph, not just core ones.

### Alternative strategy: bulk convert to all-`.tjs`, then improve (2026-07-08) — proven

Instead of N per-file swaps (each fighting the mixed-graph toolchain), convert the
**whole** codebase to `.tjs` at once, so there is no `.ts`/`.tjs` mixing — which is
what caused *every* wall above. Verified end-to-end:

- `tjs convert --emit-tjs src/` → **39 converted, 0 failed**, clean readable `.tjs`
  source (doc blocks, comments, code preserved; just a `/* tjs <- foo.ts */` header).
- Bundling the converted `index.tjs` (onResolve extensionless→`.tjs` + onLoad
  transpile): **build succeeds**, all core exports present.
- Smoke test on the bundle: `tosi(...)`, `boxed.x = 42` (assignment through the
  proxy), `.value === 42`, `== 42` → true. The boxed-scalar wrapper work rode along
  in the converted `xin.tjs`.

Why it's less laborious and lower-risk: it's one bulk step to a baseline that
already builds + passes tests (the debug/safe variants already ship a
tjs-converted bundle), then unhurried per-module improvement. No mixed graph means
no Bun `onResolve` problem and no `.ts`/`.tjs` resolution ambiguity.

What it still needs / caveats:
- **The same buildSite hook** — but the ask is now *cleaner*: replace the `tsc -p`
  step wholesale with a tjs build (`--emit-tjs`/bundle for JS, `generateDTS` for
  `.d.ts`), rather than interleave with tsc over a mixed graph.
- **Mode policy still applies.** The convert/transpile defaults to native mode (all
  Tjs* modes → `toBool`/`Eq` wrapping → larger + slightly slower). Apply `TjsCompat`
  on hot paths (per the mode policy above) to keep parity; the proof used defaults.
- **The bulk `.tjs` is TS-shaped, not idiomatic-2.0 yet.** It works from day one;
  "improve" is where assignment/`==`/`safety`/monadic-error ergonomics get adopted,
  per module, on a green baseline.

### Two migration modes — a consumer chooses

Both are legitimate; capture the friction of each:
- **Incremental (per-file `.ts`→`.tjs`):** natural for a consumer who wants to move
  one module at a time and keep the rest TS. **Blocked today** by the mixed-graph
  walls (Bun `onResolve`, tsc, buildSite eval). This is annoying regardless of where
  it's fixed — Bun (runtime onResolve), tjs (tooling/guidance), or tosijs-ui
  (buildSite). Worth supporting because many consumers will prefer it.
- **Bulk (all-`.tjs` at once):** proven above; sidesteps blocker 1; needs the
  buildSite tsc-replacement hook. Best when you're committing to TJS wholesale.

---

## Port benefits shipped on the branch

Low-hanging wins the port unlocks (or motivates), implemented on `tosijs-2.0`.

### Assignment strictness (2026-07-11)

`settings.strictness` (`'off' | 'warn' | 'throw'`, default `'warn'`) catches a bug
class TypeScript structurally can't: **runtime type drift in loosely-typed state**
(`count = '5'` from a fetch / form / dynamic path). When an assignment changes a
path's coarse type (scalar `typeof`, plus null/array), it warns (permissive) /
throws (blocks) / is silent. Exempt: new properties (no prior type) and nullish
transitions; object→object reshapes aren't flagged (shape isn't tracked). The
check sits in the one place all writes funnel through (set trap + accessor `.value`
setter — both already read the current value), so it's ~free.

Escape hatch: the `.valueAndType` **setter** — the deliberate counterpart to
`.value` (`proxy.count.valueAndType = 'now a string'`) — changes value AND type
without a warning, even in throw mode. (Setter, not a method, so it's symmetric
with `.value`; a method would be `setValueAndType(v)`.)

Doesn't strictly require TJS (warn/throw are plain JS — could ship in 1.x with
default `'off'`). The **`'strict'`/monadic mode** is the genuine port payoff:
a mismatched assignment returning a `MonadicError` needs a value-returning channel
(a `trySet` method, or the TJS 2.0 assignment transform). Deferred until then.

**Next layer — schemas per path (TJS-native).** The `typeof`-of-current check is
the *primitive*; it infers the expected type from whatever's there now, so it
can't validate a first assignment or express anything richer than a coarse kind.
TJS has built-in schema/predicate support, so the richer version is: **declare a
schema (a TJS `Type`/predicate) for a path**, validate assignments against *it*
(covers first-set, and expresses "positive int", enums, object shapes, …), and
allow the schema to be **updated explicitly** (a `.schema` setter — the "change
the contract" op, distinct from `.valueAndType` which changes a value). This also
delivers the 2.0 "JSON Schema emission — cross-language types from one source"
goal. Sketch: a per-path schema map; `checkAssignmentType` consults it first and
falls back to the `typeof` primitive when a path has no declared schema.

---

## Per-module log

### by-path.ts → by-path.tjs (first module, 2026-07-03)

The hottest, most core module — every state read/write flows through
`getByPath`/`setByPath`. Chosen deliberately to derisk toolchain + size + speed.

**Port effort:** near-mechanical. Strip TS type annotations/casts (native TJS
uses example-based types, not TS type names), keep the logic verbatim. One real
change: `new Date(…).valueOf()` in `id()` → `Math.floor(performance.now())` — the
`Date` wrapper was a redundant no-op, and `id()` wants a *monotonic counter*, not
a wall-clock date (which also satisfies `TjsDate` mode).

**Modes:** `safety none` + `TjsCompat`. This module handles only raw values and
deliberately uses JS `===` / `!= null` semantics; the ergonomic modes would be
pure overhead.

**Correctness:** `src/by-path-port.test.ts` runs the by-path contract through the
plugin — 7/7 pass, full suite 568 pass.

**Numbers** (same logic, 200k iters of 6 gets + 1 set + 1 parse):

| variant | runtime | transpiled size |
| --- | --- | --- |
| TS (baseline) | 1.00× | ~9.6 KB equiv |
| **tjs `TjsCompat`** | **0.99×** | **9575 B** |
| tjs native (all modes) | 0.905× | 11422 B |

The native-mode tax is `__tjs.toBool(...)` wrapping *every* conditional and `Eq()`
wrapping loose equality. `TjsCompat` removes both → parity.

### string-case.ts → the `safety` axis (2026-07-04)

A tiny, pure, hot module (`camelToKabob`/`kabobToCamel`, called on every attribute)
— used to exercise **`safety inputs`**, the boundary-validation mode (everything
before this was `safety none`/`TjsCompat`). Findings:

- **`safety inputs` works and is monadic.** `function camelToKabob(s: '')` under
  `safety inputs` validates the argument at the boundary and returns a clean
  **`MonadicError` value** for bad input — it does *not* throw or crash:
  ```
  camelToKabob('fooBar') -> 'foo-bar'
  camelToKabob(42)       -> MonadicError("Expected string for '…camelToKabob.s', got number")
  camelToKabob(null)     -> MonadicError("… got null")
  ```
  It also propagates monadic errors (`if (s instanceof Error) return s`), so an
  error flows through a pipeline instead of exploding.
- **On a hot path the validation is perf-free.** `camelToKabob` is dominated by its
  regex `.replace`, so plain-JS / `safety none` / `safety inputs` all clocked
  **~0.5M/s** — the input check is invisible. Validation cost only shows up on
  ultra-cheap operations; for anything doing real work, `safety inputs` at the
  boundary is effectively free.
- **Size cost is real but fixed.** `safety inputs` emitted **1315 B** vs
  **273 B** for `safety none`+`TjsCompat` — the `MonadicError` class + call-stack
  helpers + per-param validation. Fixed per-module overhead, amortized across a
  module's functions.
- **Behavior shift to remember:** monadic errors change the return contract.
  `camelToKabob(42)` returns a `MonadicError` *value*, not a thrown exception, so a
  caller that doesn't check will pass it along (e.g. into `setAttribute`, where it
  stringifies to the error message). Good for composition, but it's a real
  departure from throwing — public tosijs APIs adopting `safety inputs` need to
  document the monadic contract.

Policy refinement: `safety inputs` fits **public boundaries** (validate once, cheap
relative to real work); keep `safety none` for the *inside* of hot loops. This
matches the mode policy above but on the orthogonal safety axis.

---

## Assessment: the `.value` ceremony vs frictionless comparison (2026-07-03)

The 2.0 pitch is that TJS removes the "useless ceremony" TS/JS forces on boxed
values — `box.value === 42` instead of `box === 42`. Measured what that actually
costs and buys, on the **real** tosijs boxed scalar (a proxy with
`Symbol.toPrimitive`), not a mock.

**What JS already does for free.** tosijs boxed scalars implement
`Symbol.toPrimitive`, so plain JS already coerces them frictionlessly:

| expression | plain JS result |
| --- | --- |
| `box == 42` | **true** |
| `box > 40`, `box + 8`, `String(box)`, `` `${box}` ``, `if (box)` | all work |
| `box === 42` | **false** ← the only real ceremony JS forces |

So the *only* thing that genuinely needs `.value` is **strict `===`** (strict
equality never coerces) and reads where TS types the box as an object.

**What TJS actually rewrites.** `TjsEquals` transforms **only** `==` -> `Eq()` and
`!=` -> `NotEq()`. `===` / `!==` are left **strict by design** — `===` preserves
its original "same object / identity" meaning (a deliberate tjs-lang decision, not
an oversight). So the frictionless path is `==`, and `box === 42` staying `false`
is correct: use `===` only when you mean identity.

**The gap on tosijs's current design.** `Eq` unwraps native primitive wrappers
(`instanceof String | Number | Boolean`), then calls `valueOf()`. But the current
boxed scalar is a `Proxy` over a **shared empty `{}`** (`box()` in xin.ts) — not
`instanceof` any wrapper — so `Eq` can't unwrap it:

```
cmp(currentBoxedScalar, 42) -> { eqeq: false }   // REGRESSED vs plain JS (== was true)
cmp(new Number(42), 42)     -> { eqeq: true }     // native wrapper OK
```

So today `TjsEquals` **breaks** the `==` that plain JS already got right for boxed
scalars.

**The fix — box over a primitive wrapper (no tjs-lang change).** Change the proxy
target from `{}` to a primitive wrapper. `Eq` unwraps on `instanceof` and *then*
calls `valueOf()` (which the handler implements live), so this makes `==` work
while proxy navigation (binding/`observe`/path-extension) is preserved — because
we proxy *over* the wrapper rather than replacing the proxy with a bare wrapper.
Verified end-to-end: `box instanceof Number` -> true, `box == 42` -> true via `Eq`,
stays **live** as state changes, `box.foo.path` still extends the path.

**Do it per type — `Boolean` / `Number` / `String` — matched to `typeof`.** A
single shared `new Number(0)` target is enough to make `Eq` unwrap *any* scalar
(it unwraps on `instanceof Number|String|Boolean` then `valueOf`s), but then a
string box reports `instanceof Number` — a lie that breaks `instanceof String`
checks and `typeof`-style guards. Matched wrappers keep `instanceof` honest.
Findings per type (tested):

- **`Number`** — shared `new Number(0)` target. Clean; no own data properties, so
  the handler can override everything. Value irrelevant (handler supplies live).
- **`Boolean`** — shared `new Boolean(false)` target. Clean, same reason. Bonus:
  `instanceof Boolean` also lets native `toBool` unwrap boxed booleans in `if()`.
- **`String`** — the sharp edge. A `String` wrapper has **own non-configurable
  `length` and index properties**, and the Proxy invariant requires the handler to
  return the target's *exact* values for those. So: use a **value-holding**
  `new String(currentValue)` target (not a shared empty one) and return the
  target's own value for those props via `getOwnPropertyDescriptor`, delegating
  string methods to the live value. Then `instanceof String`, `.length`, `b[0]`,
  `.toUpperCase()`, `String(b)`, and `==` all work. Cost: a small per-access
  `String` allocation, and `.length`/indices are a point-in-time snapshot (fine —
  boxes are ephemeral, recreated per access; `valueOf` stays live via the handler).

**Implemented & validated on the real library** (`src/xin.ts`, `box()` +
`regHandler` + `accessorHandler`; tests in `src/boxed-scalar-eq.test.ts`). Full
suite 573 pass. Gotchas hit while wiring it in:
- `isBoxedScalar` can't use `instanceof` (a user might store a real `new String()`
  in state) — detect via a `WeakSet` of targets *we* created.
- `accessorHandler`'s `value`/`on` cases hard-coded `target === boxedScalarTarget`;
  the new wrapper targets fell through to `target.valueOf()` (returning the shared
  `new Number(0)`'s `0`). Switch those to `isBoxedScalar(target)`.
- The invariant guard already existed in the non-boxed branch; the boxed branch
  needed the same guard added ahead of its primitive-method delegation.

An alternative that also works but needs a tjs-lang change: have `Eq` do a real
`ToPrimitive` (consult `Symbol.toPrimitive`/`valueOf` on objects), or add an
explicit opt-in `[TjsCompareValue]()` protocol (safer vs accidental coercion of
unrelated `valueOf`-having objects). The box-over-wrapper approach is preferable
because it's a one-line tosijs change and leverages `Eq` as-is.

**Caveats of the box-over-wrapper approach:**
- `if (box)` is truthy even for a boxed `false` (objects are truthy). Native TJS
  `TjsStandard` fixes this — its `__tjs.toBool()` wrapping unwraps `instanceof
  Boolean` — so this is one place the toBool tax earns its keep. Outside toBool,
  boolean checks still need `== true` / `.value`.
- `typeof box` is `'object'`, not `'number'` — `typeof` type-guards need TJS's
  `TypeOf` or `.value`.
- `===` remains identity (by design). Value comparison is `==`.

**Performance is a wash — the boxing dominates, not the comparison** (5M iters):

| style | throughput | vs ceremony |
| --- | --- | --- |
| ceremony `b.value === n` | 6.6M/s | 1.00× |
| JS coerce `b == n` | 5.8M/s | 0.88× |
| fixed `Eq` (valueOf on objects) | 7.7M/s | 1.17× |
| raw scalar, no box | 314M/s | 47× |

The comparison mechanism is within 0.88–1.17× across the board; the 47× cliff is
going through the proxy at all — a cost paid identically by every style. So
removing the ceremony is **free at runtime** (a value-vending `Eq` is even
marginally faster than `.value`, being one `valueOf()` vs a proxy get + `===`).

**Takeaway:** the payoff of frictionless comparison is entirely DX + correctness
(drop `.value` from comparisons, `==` becomes reliable via `Eq`, simpler code), at
zero runtime cost — the boxing dominates and is paid regardless. It's achievable
today with a one-line tosijs change (box over a `Number` wrapper) and no tjs-lang
change; `===` stays identity by design, so reach for `==` for value comparison.

---

## Type-declaration exploration: DOM / CSS / Events (elements.ts, 2026-07-04)

`elements.ts` is where the interesting typing lives, and where TS structurally
can't win: DOM/CSS/Event value spaces are defined by **grammars and runtime
registries**, not by enumerable literal types. TS can only approximate them with
big hand-maintained unions that end in `| string` — which gives autocomplete but
**zero validation**, and rots. TJS types are **predicates** (real functions), so
they can validate the actual grammar/registry *and* mine autocomplete from the
same source. This is the "real JS superset rather than pretending it's C#" payoff.

Evidence gathered against the current TS decls and tjs-lang's (unreleased) CSS
predicate module (`../tjs-lang/src/css`):

**1. CSS values — `XinStyleRule` (css-types.ts).** ~250 properties, each a union
of literal types **plus `| string`** on almost every one. The `| string` means
the literals are autocomplete hints only; any string passes. TS *cannot* do
better — CSS value grammars (`calc()`, `var()`, units) are context-free, not
expressible in the type system. tjs-lang's predicates already do the real thing:

```
isColor('var(--brand)')      -> true      isColor('notacolor')        -> false
isLength('calc(100% - 4px)') -> true      isLength('12')              -> false
isGlobalKeyword('inherit')   -> true
suggestColor('re', 8)        -> ['rebeccapurple', 'red']   // autocomplete, same source
```

Predicates are authored as verified (pure / synchronous / ReDoS-clean) source,
compiled to a fast native validator **and** mined for suggestions — one source of
truth for both check and complete. That's the thing TS can't give you.

**1b. Better still — ask the browser (`CSS.supports`).** The strongest version of
"grammar/registry, not literals": don't hand-author a CSS grammar at all, ask the
environment that actually implements it. `CSS.supports(prop, value)` is the
browser's own validator — exact, always current with the browser's real support
(vendor prefixes, new features, full `calc()`/`var()` grammar), zero maintenance.
It closes the exact gap the hand-authored predicate has (`isCssProperty` accepts
`align-kontent`; `CSS.supports('align-kontent', …)` in a real browser returns
`false`). Property names for autocomplete come from the same place — the keys of a
throwaway element's `.style` (or `CSSStyleDeclaration.prototype`).

The design implication is that the two approaches are **complementary**, split by
*when* validation runs:
- **Runtime, in a browser** → `CSS.supports` is ground truth (exact, free).
- **Transpile-time / SSR / Node** → no browser, so a `CSS.supports`-based predicate
  can't be statically *verified* (though it's predicate-safe to *run*). There the
  hand-authored grammar predicates (`isColor`/`isLength`) are the portable fallback.

So a CSS-value predicate should prefer `CSS.supports` when `typeof CSS !== 'undefined'`
and fall back to the grammar predicate otherwise. Caveat worth flagging: **happy-dom
stubs `CSS.supports` to return `true` for everything** (verified — even
`align-kontent` and `width: banana`), so tests can't rely on it; the exact behavior
needs a real browser or a headless CSS engine.

**2. `class` — TS says `class?: string`, which is already wrong.** Post-1.6.6 the
runtime accepts `string | string[] | Record<string, boolean>`. A predicate both
expresses and validates the real union (verified working):

```
isClassValue('a b') / ['a','b'] / {a:true,b:false} -> true
isClassValue(42) / {a:'x'}                          -> false
```

**3. `on<Event>` — TS = a 20-line hand-maintained list + `[key: string]: any`.**
The escape hatch lets `onClik` / `onFoo` through silently. A predicate derived
from the real event map validates handler names and catches the typos (verified):

```
isEventHandlerKey('onClick' / 'onPointermove') -> true
isEventHandlerKey('onClik' / 'onFoo')          -> false
```

**4. `[key: string]: any`** — the catch-all that ends `ElementProps`. It exists
because "any valid attribute" isn't enumerable in TS. A predicate can accept the
open set precisely: a known HTML attribute, `data-*`, `aria-*`, or a valid event
handler — catching typos while staying open. TS catches nothing here.

**Design for elements.ts 2.0 typing** (once the CSS predicate module ships):
- `style`: validate values via the CSS predicates (`isStyleValue`/`isColor`/
  `isLength`/…) instead of `Union | string`; keep autocomplete via `suggest*`.
- `class`: the `isClassValue` predicate (fixes the wrong `class?: string`).
- `on<Event>`: derive from the event map via a predicate (drop the hand-list).
- catch-all: an attribute/`data-`/`aria-`/event predicate instead of
  `[key: string]: any`.

**Status:** design + evidence only; no mechanical port of elements.ts yet (its
315 real lines + 5 TS importers are a separate task). The predicate module is
unreleased, so this can't be wired into tosijs until it's a public export.

---

## Feedback for tjs-lang

Tracked here as it surfaces; also mirrored to the maintainer.

### Status after tjs-lang 0.9.0 (verified 2026-07-06)

Re-ran the items against 0.9.0. Strong response — the critical one and all the
packaging gaps are fixed:

| # | item | 0.9.0 |
| --- | --- | --- |
| 11 | required→optional dts (emitted **invalid TS**) | ✅ **fixed** — bare `f(a)` → `f(a: any)`; mixed emits valid TS |
| 2 | plugin/runtime not exported | ✅ fixed — `./bun-plugin`, `./runtime`, `./css`, `./schema` now exported |
| 6 | CSS predicate module not shipped | ✅ fixed — `tjs-lang/css` exports `isColor`/`isLength`/`isStyleObject`/… |
| 8 | `isStyleObject` didn't import standalone | ✅ fixed — imports and validates (`{color:'nope'}` → false) |
| 9 | predicate verification not surfaced | ✅ fixed — `result.predicates` has `{verified, reason}` per predicate |
| 10 | `generateDTS` not exported from `tjs-lang/lang` | ✅ fixed — now exported |
| 1 | native `toBool` hot-path tax | ▫️ unchanged (semantic-mode tradeoff; `TjsCompat` remains the hot-path answer) |
| 7 | `isCssProperty` loose on names | ▫️ still `isCssProperty('align-kontent') → true` |
| 12 | dts ignores arrow-function consts | ▫️ still `export const id = () => …` → `id: any` |
| 3, 5 | TjsDate guidance / `Eq` ToPrimitive | (minor / optional; not re-checked or worked around) |

Regression check: full tosijs suite **575 pass** and the `.tjs` port tests pass
under 0.9.0. Bonus: `result.predicates` flags `CSS.supports` as
`verified:false, reason:"method '.supports()' is not a known pure method"` — which
*confirms* the CSS design split (effectful → runtime fallback) and now makes it
tool-visible. Remaining open items below are minor; the blocking ones are resolved.

1. **Native `toBool`-per-conditional is a hot-path tax** (~10% runtime, ~19% size
   on by-path). For modules that never handle boxed primitives it's pure overhead.
   Options: skip the wrap when an operand is provably primitive/typed; or document
   the "TjsCompat for hot internals" pattern prominently so people don't measure a
   regression and bounce.
2. **The Bun plugin and `installRuntime` are not public exports.** Integrating
   `.tjs` into a downstream build means reaching into `tjs-lang/src/` internals or
   reimplementing the plugin. Exporting `tjs-lang/bun-plugin` and
   `tjs-lang/runtime` would make adoption one line.
3. **`TjsDate` error guidance is incomplete.** It suggests only `Timestamp.now()`.
   For monotonic / id-generation use cases the correct primitive is
   `performance.now()`, which the message never mentions — easy to go in circles.
4. **Mode control is add-only.** You can enable an individual mode but not disable
   one; getting "everything except TjsStandard" means `TjsCompat` + re-enabling the
   rest. A per-mode `off` (e.g. `TjsStandard off`) would be more ergonomic.
5. **`Eq` unwraps `instanceof` wrappers but not `ToPrimitive` objects** (optional).
   tosijs works around this by boxing over a `Number` wrapper (so `instanceof`
   hits), so this is *not* blocking. But having `Eq` fall back to
   `Symbol.toPrimitive`/`valueOf` on objects — or an explicit `[TjsCompareValue]()`
   protocol — would let any value-like object opt into smart `==` without
   pretending to be a `Number`. Nice-to-have, not required.
6. **CSS predicate module isn't shipped.** `src/css` (`isColor`, `isLength`,
   `isStyleValue`, `suggestColor`, …) exists only in the repo — not in the
   published 0.8.7 package, not a public export. It's the strongest argument for
   TJS on DOM/CSS typing; getting it exported (`tjs-lang/css`) would let tosijs
   actually adopt it.
7. **`isCssProperty` is loose on property names.** `isCssProperty('align-kontent')`
   returns `true` — it accepts typo'd/unknown property names. Property-name
   validation should be a closed set (with `--custom` and vendor prefixes allowed).
8. **`isStyleObject` doesn't import standalone.** Pulling it in drags
   `src/css/shorthands.ts`, which fails to parse under bun on its own
   (`Expected ";" but found "$predicate"`). The color/length/property predicates
   import fine; the style-object cluster doesn't yet.
9. **Predicate verification isn't surfaced by the `tjs()` transpile API.** A `Type`
   with a pure predicate vs one calling `CSS.supports` (effectful) emit identically
   through `tjs()`; `result.types`/`warnings`/`metadata` are empty, so there's no
   signal for "did this predicate verify (fuel-bounded, safe on untrusted data) or
   fall back to a plain function?" The verify/compile/suggest pipeline the `css`
   module uses lives in a separate API (`verifyPredicate`/`compilePredicate`) — so
   a consumer authoring `Type` blocks and transpiling gets no verification feedback.
   Surfacing per-predicate verification status in the transpile result would let
   tools warn on unverifiable predicates.
10. **`generateDTS` isn't exported from `tjs-lang/lang`.** It's exported from the
    repo's `src/lang/index.ts` but the package's `./lang` subpath maps to
    `transpiler.ts`, which doesn't re-export it — so `import { generateDTS } from
    'tjs-lang/lang'` fails in the published package. dts emission is essential for
    migrating a `.ts` importer graph one module at a time; it needs a public export.
11. **Bare (untyped) params are marked optional in metadata → unsound + invalid
    `.d.ts`.** Root-caused. Behavior across param forms:

    | source | dts | `__tjs` `required` | correct? |
    | --- | --- | --- | --- |
    | `f(a)` bare | `f(a?: any)` | `false` | ❌ should be required |
    | `f(a: 0)` annotated | `f(a: number)` | `true` | ✅ |
    | `f(a = 1)` default | `f(a?: number)` | `false` | ✅ |
    | `f(a?: 0)` marker | `f(a?: number)` | `false` | ✅ |
    | `f(a, b: 0)` mixed | `f(a?: any, b: number)` | — | ❌ **invalid TS** |

    The mixed case emits an optional param **before** a required one, which is a
    hard TS error (ts1016: "A required parameter cannot follow an optional
    parameter") — so the generated `.d.ts` doesn't compile, not just loose.

    **Root cause:** `emitters/js.ts:251` sets `required: requiredParams.has(param.name)`
    for a plain `Identifier` param, and `requiredParams` only contains params that
    used the `:` annotation — so a bare param is excluded and becomes `required:
    false`. The emitter conflates "untyped" with "optional." (`dts.ts:114`,
    `optional = !p.required`, is correct given a correct flag; the rest-param
    `required: false` at js.ts:310–327 are also fine — rest params are optional.)

    **Correct rule:** a plain `Identifier` param is **required** (`: any` when
    untyped); optionality comes only from a default value (`AssignmentPattern`) or
    an explicit `?` marker — a type annotation is irrelevant to required-ness.
12. **The dts emitter ignores arrow-function consts.** `export const id = () => …`
    emits `id: any`; only `function` declarations get a typed signature. Inferring
    (or at least honoring annotations on) arrow consts would avoid forcing a
    `function`-declaration style purely to keep types.
