# TJS Port — Developer Experience Findings

A living log of what it's actually like to port tosijs from TypeScript to native
TJS (the tosijs 2.0 effort). Updated per module. Two audiences: the tosijs port
itself (patterns to follow) and `../tjs-lang` (feedback to fix).

## Takeaway so far

**Performance is fine and the size regression is perfectly tolerable.** With the
right mode selection, native `.tjs` matches TS on both runtime and size for hot
code; the ergonomic modes cost a little where you opt into them, which is exactly
where you don't put hot paths. Nothing here blocks the port.

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

## Phase-2 blockers for a full swap (not yet solved)

Replacing a `.ts` with a `.tjs` in the shipped build still needs:

1. **`.d.ts` emission** from the `.tjs` so the TS files that import it keep their
   types (by-path has 6 importers). tjs-lang has a dts emitter; not yet wired in.
2. **An `onResolve`** so a bare `import './foo'` picks `foo.tjs` in `Bun.build`
   (Bun doesn't try the `.tjs` extension by default). Until then, imports need the
   explicit `./foo.tjs`, which TS can't type.

Until both exist, ported `.tjs` modules are validated in parallel but the `.ts`
remains the shipped source.

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
  `new String(currentValue)` target (not a shared empty one) and pass own props
  through (`Reflect.get(target, prop)` for `length`/indices), delegating string
  methods to the live value. Then `instanceof String`, `.length`, `b[0]`,
  `.toUpperCase()`, `String(b)`, and `==` all work. Cost: a small per-access
  `String` allocation, and `.length`/indices are a point-in-time snapshot (fine —
  boxes are ephemeral, recreated per access; `valueOf` stays live via the handler).

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

## Feedback for tjs-lang

Tracked here as it surfaces; also mirrored to the maintainer.

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
