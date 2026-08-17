# Migrating from `xinjs` to `tosijs`

<!--{ "pin": "bottom", "description": "Upgrading tosijs: the 1.8.0 removals and behaviour changes, the 1.7.0 correctness release, and the original xinjs to tosijs rename." }-->

In a nutshell:

1. Update to `xinjs` (and `xinjs-ui`) 1.0.6
2. Fix any issues
3. Replace all references to "xinjs" with "tosijs"

`xinjs` and `tosijs` 1.0.6 should be identical (likewise `xinjs-ui` and `tosijs-ui`), so the only thing you need to change
should be the module names.

> Please [let me know](https://discord.gg/ramJ9rgky5) if there are any issues.

# Upgrading to 1.8.0

**Removed.** Only one deprecation named 1.8.0 in its 1.7 warning, and it is
the only thing actually removed:

| was                                      | now                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data-ref="thing"`                       | `part="thing"` (bare CSS-selector refs still work)                                                                                     |
| `<xin-blueprint>`, `<xin-loader>` markup | `<tosi-blueprint>`, `<tosi-loader>`. The old tags are **tombstones**: still registered, render nothing, and log exactly what to rename |
| `<xin-slot>` element                     | `<tosi-slot>` (the rewrite produces it automatically)                                                                                  |

**Deprecated but still working** (their 1.7 warnings named no version, so
they survive 1.x and now warn naming **2.0**):

| still works         | prefer            |
| ------------------- | ----------------- |
| `xinSlot()`         | `tosiSlot()`      |
| `blueprint()`       | `tosiBlueprint()` |
| `blueprintLoader()` | `tosiLoader()`    |

**Behaviour changes worth checking even if you use no removed names** —
neither had a prior deprecation warning:

- **A component member named `on<Event>` now wins over the event sugar.** If
  your component holds a _function_ under, say, `onClose`, then
  `creator({ onClose: fn })` now **assigns the member** instead of attaching
  a `close` listener; previously the sugar won and your member was shadowed.
  Rename to `handle<Event>` if you want the event channel. (A member left
  `undefined`/`null` still gets event sugar.)
- **A type-contradicting attribute write is applied and reported, not
  silently discarded.** Writing `false` to an attribute declared
  `'on' | 'off'` used to _remove_ the attribute — so the default read back
  and a feature you turned off stayed on. It now lands as written, with one
  `console.error` naming both types.

**New, and opt-in:** the agent surface (`enableAgentInterface()`) defaults
to **read-only** introspection — `write()` and `call()` refuse until you
declare `expose: { roots, actions }` (production) or `expose: 'all'`
(development). Nothing changes for apps that never call it.

**License:** tosijs is **Apache-2.0** as of 1.8.0 (BSD-3-Clause through
1.7.x) — adding an explicit patent grant and a patent-retaliation clause.
Apache-2.0 cannot be combined with **GPLv2-only** code; GPLv3+ is fine.

# Upgrading to 1.7.0

1.7.0 is the **correctness release** — a large batch of bug fixes. Most are pure
fixes (things that were broken now work), but a few are **observable behavior
changes**. If your code depended on the old (buggy) behavior, these are the ones
to check. No API was removed or renamed.

## Observer/touch matching is now segment-exact

Before 1.7, path matching used a raw prefix test, so an observer or binding on
`foo` also heard `foobar`, and `touch('foo')` swallowed a later `touch('foobar')`.
Now matching respects path segment boundaries.

```
// before 1.7: this observer fired for BOTH 'app.user' and 'app.username'
observe('app.user', cb)
// 1.7+: fires only for 'app.user' and its children ('app.user.name', …),
// NOT the sibling 'app.username'
```

Hierarchical matching is unchanged (a parent still hears its children and vice
versa). **If you relied on the sloppy prefix match** — e.g. an observer on `item`
that you expected to also fire for `items` — give it the exact path, a RegExp, or
a filter function.

## `getValue()` returns typed values for typed inputs

`getValue(element)` (and therefore `bindings.value`'s `fromDOM`) now returns the
control's native type instead of a string:

- `type="number"` / `type="range"` → a **number** (was a string). Empty input
  still returns `''`, never a fabricated `0`.
- `type="date"` / `datetime-local` / `month` / `week` → a **`Date`** (was an ISO
  string for `type=date`).
- `type="time"` → **milliseconds since midnight**.

Bound numeric state now _stays_ numeric across edits. **If you read `getValue()`
directly and expected a string**, coerce explicitly (`String(getValue(el))`), or
read `el.value`. If you bound a `type=date` input and stored the ISO string, note
the stored value is now a `Date` — bind to string state and it keeps the control's
ISO string (see [dom](/dom/) H-6 two-layer coercion).

## `Component` `change` events now bubble (and compose)

A component's `change` event (fired when its `value` changes) now bubbles and
crosses shadow boundaries — matching how native `<input>` `change` events behave.
This makes a shadow-DOM component bindable **like an `<input>`** (bind its
`value`; see the [Building Apps](/building-apps/) shadow-DOM section).

**If you have a `change` listener on an ancestor** of a tosijs component, it will
now fire for the component's changes where before it did not. If that causes
double-handling, scope the listener (check `event.target`) or use capture-phase
delegation.

## Other fixes worth a glance (not breaks, but visible)

- Reactive `class` bindings now **replace** instead of accumulating.
- `on()` handlers now fire inside **open shadow roots**.
- Named CSS colors (`Color.fromCss('red')`) now parse **without a DOM**.
- Component data-binding sugar placed **inside shadow DOM** now **warns** (it
  never operated there — bind the component by its `value` instead).

See `CHANGELOG.md` for the complete list.
