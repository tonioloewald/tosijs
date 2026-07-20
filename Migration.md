# Migrating from `xinjs` to `tosijs`

<!--{ "pin": "bottom", "description": "Renames and API changes when moving from xinjs to tosijs. Old names continue to work with one-time deprecation warnings." }-->

In a nutshell:

1. Update to `xinjs` (and `xinjs-ui`) 1.0.6
2. Fix any issues
3. Replace all references to "xinjs" with "tosijs"

`xinjs` and `tosijs` 1.0.6 should be identical (likewise `xinjs-ui` and `tosijs-ui`), so the only thing you need to change
should be the module names.

> Please [let me know](https://discord.gg/ramJ9rgky5) if there are any issues.

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

Bound numeric state now *stays* numeric across edits. **If you read `getValue()`
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
