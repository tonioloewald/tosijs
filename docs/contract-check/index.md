# Contract Validation

Contracts (a component's `static contract`, an element's inline `contract`)
are enforced by one gate, shared by every declaration site. The gate is two
layers:

1. the **built-in structural subset** — `type`, `enum`, `const`. Zero
   dependencies, always on, covers the common case.
2. an optional **full schema engine** you register. Everything else a schema
   can say (`required`, `minimum`, `pattern`, `items`, …) is inert until you
   plug one in — tosijs warns once per unenforceable keyword set so a
   contract never quietly means less than it says.

    import { setContractValidator, getContractValidator } from 'tosijs'
    import { validate } from 'tosijs-schema'

    setContractValidator((value, schema) =>
      validate(value, schema, { strict: true })
    )

**`{ strict: true }` is not optional here.** By default tosijs-schema's
`validate` checks a SAMPLE of a large array or object and does not enforce
`maxProperties`. That is a fair trade for checking your own data and the wrong
one at a boundary: the sample is predictable, so a writer can put the bad item
where it is not looked at. Do not pass `validate` in bare.

A validator returns `true` for a valid value, and **anything else is a
violation**. A plain `false`, which is what the call above returns, is
reported as "schema violation". Return an `Error` to say why, and its
`message` becomes the reason:

    setContractValidator((value, schema) => {
      const reasons = []
      const ok = validate(value, schema, {
        strict: true,
        onError: (at, message) => reasons.push(`${at}: ${message}`),
      })
      return ok || new Error(reasons.join('; '))
    })

> **Before 1.10.13 only an `Error` counted.** A validator that returned
> `false` was read as "valid", so a boolean validator enforced nothing, and
> installing it silenced the unenforced-keyword warning too. That warning
> told you to pass tosijs-schema's `validate` in directly, which is a boolean
> validator. Affects 1.8.0 to 1.10.12; if you registered a validator that
> returns a boolean, upgrade, and make it strict.

## The plug is a security boundary

It is process-global: whoever calls it last decides what "valid" means for
the whole app — including code you did not write but did bundle. So:

- **Replacing an installed validator warns**, loudly, naming what was
  swapped for what. Removing one (`setContractValidator(null)`) warns too:
  uninstalling enforcement is the same event wearing a different hat.
- **`getContractValidator()`** reads back what is actually installed, so an
  app, a test, or an audit can assert on it rather than assume.
- **`setContractValidator(yourValidator, { final: true })`** locks it: any later
  attempt to replace or remove it **throws** instead of warning. Lock in
  your own startup path and no dependency can downgrade you afterwards.

Re-registering the *same* function is a no-op (a module evaluated twice, or
hot reload, must not trip the lock).

> The built-in subset keeps running whatever happens here, so the worst a
> hostile replacement can do is a downgrade, not a bypass.
