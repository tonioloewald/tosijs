# Metadata

## `tosiAccessor(x: any): TosiAccessor | undefined`

`tosiAccessor` returns the collision-free accessor object from any boxed proxy,
using the `TOSI_ACCESSOR` symbol internally. Returns `undefined` for non-proxy values.

This is the guaranteed escape hatch — it works even if your data has a property
named `tosi` that would shadow the `.tosi` convenience accessor.

```
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const { app } = tosi({ app: { tosi: 'shadowed!', name: 'test' } })

// .tosi is always intercepted by the proxy (not shadowed in practice)
app.tosi.path === 'app'

// tosiAccessor() and TOSI_ACCESSOR are guaranteed collision-free
const acc = tosiAccessor(app)
acc.path === 'app'
acc.value  // { tosi: 'shadowed!', name: 'test' }

// TOSI_ACCESSOR symbol works directly
app[TOSI_ACCESSOR].path === 'app'

// returns undefined for non-proxy values
tosiAccessor('hello') === undefined
tosiAccessor({ foo: 1 }) === undefined
```

## `tosiValue(x: any): any`

`tosiValue` gives you the value behind a proxy, and passes anything else through
unchanged. That is the difference from `.value`: it is safe to call on
something that might or might not be a proxy.

```
import { tosi, tosiValue } from 'tosijs'

const raw = { bar: 'hello', baz: 17 }
const { foo } = tosi({ foo: raw })

foo.bar === raw.bar             // false: foo.bar is a proxy
foo.bar.value === 'hello'       // true
tosiValue(foo.bar) === 'hello'  // true
tosiValue(foo) === raw          // true: the object itself, not a copy
tosiValue(raw) === raw          // true: not a proxy, so passed through
tosiValue('plain') === 'plain'  // true
raw.value                       // undefined: raw is not a proxy
```

## `tosiPath(x: any): string | undefined`

`tosiPath` returns the path a proxy stands for, and `undefined` for anything
that is not a proxy (a path *string* included: it is a string, not a proxy).

```
import { tosi, tosiPath } from 'tosijs'

const raw = { bar: 'hello', baz: 17 }
const { foo } = tosi({ foo: raw })

tosiPath(foo.bar) === 'foo.bar'    // true
tosiPath(foo) === 'foo'            // true
tosiPath(raw) === undefined        // true
tosiPath('foo.bar') === undefined  // true
```

`xinValue()` and `xinPath()` are the deprecated names of these two functions.
They still work, warn once, and go away in 2.0.
