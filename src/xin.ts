/*#
# 1. tosi

`tosi()` assigns an object passed to it to a global state object,
and returns an observer proxy (`BoxedProxy`) wrapped around the global state object.

BoxedProxy wraps any object you pull out of it in an observer
proxy. It boxes booleans, numbers, and strings in lightweight proxies
that know their path and can access/modify the underlying value.

In rough terms:

```
const state = {}
const boxed = new Proxy(state, ...)
tosi = (obj<T>): BoxedProxy<T> => {
  Object.assign(state, obj)
  return state
}
```

This allows the following pattern, which gives Typescript a lot of useful
information for free, allowing autocomplete, etc. with a minimumn of
boilerplate.

```
import { tosi, elements, bind } from 'tosijs'

const { prefs } = tosi({
  prefs: {
    theme: 'system',
    highcontrast: false
  }
})

// this example continues…
```

So `{ prefs: ... }` is assigned to the state object, and now `prefs`
holds the same stuff except it's wrapped in a `BoxedProxy`.

The `BoxedProxy` behaves just like the original object, except
that it:

- knows where it came from, so `prefs.xinPath === 'prefs'`
- will automatically trigger updates if its properties are changed through it
- can return the underlying value:
  `prefs.xinValue === prefs.valueOf() === the prefs property of the object passed to `tosi()`
- it will wrap its non-object properties in objects and wrap those objects
  in a BoxedProxy, so `prefs.theme.xinPath === 'prefs.theme'`

```
prefs.theme.value === 'system'          // true
prefs.theme.path === 'prefs.theme'      // true
prefs.theme.valueOf() === 'system'      // true
String(prefs.theme) === 'system'        // true (via Symbol.toPrimitive)
```

The `BoxedProxy` observes changes made through it and updates bound elements
accordingly:

```
bind(document.body, prefs.theme, {
  toDOM(element, value) {
    element.classList.toggle('dark-mode', value === 'dark')
  }
}

const { select, option } = elements

document.body.append(
  select(
    { bindValue: prefs.theme },
    option('system'),
    option('dark'),
    option('light')
  )
)
```

Setting up the binding to `document.body` will set the `class`
appropriately, and modifying `prefs.theme` will update the
bound element automatically.

```
proxy.theme.value = 'dark'
```

> In javascript you can just write `proxy.theme = 'dark'` (TypeScript
> doesn't allow this due to asymmetric get/set type limitations).

This, in a nutshell, explains exactly what `tosijs` is designed to do.

`tosi` tracks state and allows you to bind data to your user interface
directly and with almost no code, with clean separation between business
logic and presentation.

The [`elements` proxy](/?elements.ts) lets you build HTML elements with
data and event bindings more compactly and efficiently than you can using
JSX/TSX, and it deals in regular `HTMLElement`—no virtual DOM, tranpilation
magic, spooky action at a distance, or any similar nonsense.

If you need to do complex bindings, the `bind` method lets you directly
link data to the DOM and automatically sets up observers for you.

`Component` lets you create reusable web-components.

`css` lets you write CSS economically and makes it easy to leverage the power
of CSS variables, while `Color` allows you to do color math quickly and
easily until similar functionality is added to CSS.

> In Finnish, *tosi* means true or really.
>
> As conceived, `tosi()` is an observer `Proxy` wrapped around your application's
> state. It's the **single source of truth for application state**.
>
> Note that the interactive examples on the tosijs.net website allow TypeScript
> but the Typescript is simply stripped to javascript using [sucrase](https://sucrase.io/).

## xin

`xin` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

## In a nutshell

`xin` is a single object wrapped with an **observer** proxy.

- when you assign an object (or array) to `xin` as a property, you're
  just assigning a property to the object. When you pull it out, you
  get a **proxy** of the underlying value, but the original value is
  still there, untouched.
  ```
  const foo = { bar: 'baz' }
  xin.foo = foo
  xin.foo.bar === foo.bar
  xin.foo.bar === 'baz'
  xin.foo !== foo            // xin.foo is a proxy
  xin.foo.xinValue === foo   // foo is still there!
  ```
- if you change a property of something already in `xin` then this
  change will be `observed` and anything *listening* for changes to
  the value at that **path** will be notified.
- tosijs's `bind` method leverages the proxy to keep the UI synced
  with application state.

In the following example there's a `<div>` and an `<input>`. The
textContent of the former and the value of the latter are bound to
the **path** `xinExample.string`.

`xin` is exposed as a global in the console, so you can go into
console and look at `xin.xinExample` and (for example) directly
change it via the console.

You can also turn on Chrome's rendering tools to see how
efficiently the DOM is updated. And also note that typing into
the input field doesn't lose any state (so your text selection
and insertion point are stable.

```js
import { xin, elements } from 'tosijs'

xin.xinExample = {
  string: 'hello, xin'
}

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: 'xinExample.string'}),
    label(
      span('Edit this'),
      input({ bindValue: 'xinExample.string'})
    )
  )
)
```

- a **data-path** typically resembles the way you'd reference a value inside
  a javascript object…
- `xin` also supports **id-paths** which allow you to create stable references
  to elements in arrays using a (hopefully unique) identifier. E.g. instead
  of referring to an item in an array as `xin.foo.array[3]`, assuming it had
  an `id` of `abcd1234` you could write `xin.foo.array[id=abcd1234]`. This makes
  handling large arrays much more efficient.
- when you pull an object-value out of `xin` it comes wrapped in the xin
  observer proxy, so it continues to support id-paths and so on.

### A Calculator

```js
import { xin, elements, touch } from 'tosijs'

// here's a vanilla javascript calculator
const calculator = {
  x: 4,
  y: 3,
  op: '+',
  result: 0,
  evaluate() {
    this.result = eval(`${this.x} ${this.op} ${this.y}`)
  }
}

calculator.evaluate()

xin.calculatorExample = calculator

// now we'll give it a user interface…
const { input, select, option, div, span } = elements

preview.append(
  div(
    {
      onChange() {
        calculator.evaluate()
        touch('calculatorExample.result')
      }
    },
    input({bindValue: 'calculatorExample.x', placeholder: 'x'}),
    select(
      {
        bindValue: 'calculatorExample.op'
      },
      option('+'),
      option('-'),
      option({value: '*'}, '×'),
      option({value: '/'}, '÷'),
    ),
    input({bindValue: 'calculatorExample.y', placeholder: 'y'}),
    span('='),
    span({bindText: 'calculatorExample.result' })
  )
)
```

Important points:

- `xin` points at a single object. It's a [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
- `boxed` points to the **same** object
- `xin` and `boxed` are observers. They watch the object they point to and
  track changes made by accessing the underlying data through them.
- because `calculator.evaluate()` changes `calculator.result`
  directly, `touch()` is needed to tell `xin` that the change occurred.
  See [path-listener](/?path-listener.ts) for more documentation on `touch()`.
- `xin` is more than just an object!
    - `xin['foo.bar']` gets you the same thing `xin.foo.bar` gets you.
    - `xin.foo.bar = 17` tells `xin` that `foo.bar` changed, which triggers DOM updates.

> If you're reading this on tosijs.net then this the demo app you're looking
> works a bit like this and `xin` (and `boxed`) are exposed as globals so
> you can play with them in the **debug console**.
>
> Try going into the console and typing `xin.app.title` to see what you get,
> and then try `xin.app.title = 'foobar' and see what happens to the heading.
>
> Also try `xin.prefs.theme` and try `app.prefs.theme = 'dark'` etc.

Once an object is assigned to  `xin`, changing it within `xin` is simple.
Try this in the console:

```
xin.calculatorExample.x = 17
```

This will update the `x` field in the calculator, but not the result.
The result is updated when a `change` event is triggered.

If you wanted the calculator to update based on *any* change to its
internal state, you could instead write:

```
observe('calculatorExample', () => {
  calculator.evaluate()
  touch('calculatorExample.result')
})
```

Now the `onChange` handler isn't necessary at all. `observe`
is documented in [path-listener](/?path-listener.ts).

```js
import { observe, xin, elements } from 'tosijs'

const { h3, div } = elements

const history = div('This shows changes made to the preceding example')

preview.append(
  h3('Changes to the calculatorExample'),
  history
)

observe(/calculatorExample\./, path => {
  const value = xin[path]
  history.insertBefore(div(`${path} = ${value}`), history.firstChild)
})
```

Now, if you sneakily make changes behind `xin`'s back, e.g. by modifying the values
directly, e.g.

```
const emails = await getEmails()
xin.emails = emails

// notes that xin.emails is really JUST emails
emails.push(...)
emails.splice(...)
emails[17].from = '...'
```

Then `xin` won't know and observers won't fire. So you can simply `touch` the path
impacted:

```
import { touch } from 'tosijs'
touch('emails')
```

In the calculator example, the vanilla `calculator` code calls `evaluate` behind
`xin`'s back and uses `touch('calculatorExample.result')` to let `xin` know that
`calculatorExample.result` has changed. This causes `xin` to update the
DOM.

## How it works

`xin` is a `Proxy` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to `xin` it wraps the values in
similar proxies, and tracks the **path** that got you there:

```
xin.foo = {
  bar: 'baz',
  luhrman: {
    job: 'director'
  }
}
```

Now if you pull objects back out of `xin`:

```
let foo = xin.foo
let luhrman = foo.luhrman
```

`foo` is a `Proxy` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly `luhrman` is a `Proxy` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

```
foo.bar = 'bob'
luhrman.job = 'writer'
```

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the `path` that was changed. E.g. an observer watching `lurman` will be fired if `lurman`
or one of `lurman`'s properties is changed.

## The `boxed` proxy

`boxed` is a sister to `xin` that wraps "scalar" values (`boolean`, `number`, `string`) in
lightweight proxies. These proxies know their path and provide convenient access to the
underlying value. E.g. if you write something like:

```
xin.test = { answer: 42 }
boxed.box = { pie: 'apple' }
```

Then:

```
xin.test.answer === 42
xin.box.pie === 'apple'
// boxed scalars have .value and .path
boxed.test.answer.value === 42
boxed.box.pie.value === 'apple'
boxed.test.answer.path === 'test.answer'
boxed.box.pie.path === 'box.pie'
// valueOf() works for coercion
boxed.test.answer.valueOf() === 42
String(boxed.box.pie) === 'apple'
```

Aside from always "boxing" scalar values, `boxed` works just like `xin`.

In the console, you can also access `boxed` and look at what happens if you
access `boxed.xinExample.string`. Note that this changes the value you get,
the underlying value is still what it was. If you set it to a new `string`
value that's what will be stored. `xin` doesn't monkey with the values you
assign.

### Why?!

As far as Typescript is concerned, `xinProxy` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

```
const div = elements.div({bindText: boxed.box.pie})
```

…because `boxed.box.pie` has a `xinPath` which is what is actually used for binding,
whereas `xin.box.pie` is just a scalar value. Without `boxed` you could write
`bindText: 'box.pie'` but you don't get lint support or autocomplete. (Also, in
some cases, you might even mangle the names of an object during minification and
`boxed` will know the mangled name).

### If you need the thing itself or the path to the thing…

`proxy`s returned by `xin` are typically indistinguishable from the original object, but
in a pinch `xinPath()` will give you the path (`string`) of a `XinProxy` while `xinValue`
will give its "bare" value. `xinPath()` can also be used to test if something is actually
a proxy, as it will return `undefined` for regular objects.

E.g.

```
xinPath(luhrman) === 'foo.luhrman'     // true
const bareLurhman = xinValue(luhrman)  // not wrapped
```

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let `xin` know you've made changes behind its back using
`touch`, e.g.

```
doTerribleThings(xinValue(luhrman))
// eslint-disable-next-line
touch(luhrman)
```

This is **useful** because `boxed.foo.bar` always knows where it came from, while
`xin.foo.bar` only knows where it came from if it's an object value.

This means you can write:

```js
import { boxed, elements } from 'tosijs'

boxed.boxedExample = {
  string: 'hello, boxed'
}

const { boxedExample } = boxed

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: boxedExample.string}),
    label(
      span('Edit this'),
      input({ bindValue: boxedExample.string})
    )
  )
)
```

And the difference here is you can bind direct to the reference itself rather
than a string. This leverages autocomplete, linting, and so on in a way that
using string paths doesn't.

It does have a downside! `boxedExample.string !== 'hello, boxed'` and
`boxedExample.string !== boxedExample.string` because they're proxies, not primitives.
This is critical for comparisons such as `===` and `!==`.
Always use `.value`, `xinValue()`, or `valueOf()` when comparing:
`boxed.foo.bar.value === 'hello'` or `xinValue(boxed.foo.bar) === 'hello'`.

## Helper properties and functions

`BoxedProxy` provides these helper properties and methods on all boxed values
(scalars, objects, and arrays):

- `.value` gets or sets the underlying value
- `.path` gets the string path
- `.observe(callback)` watches for changes, returns an unsubscribe function
- `.bind(element, binding, options?)` binds the value to a DOM element
- `.on(element, eventType)` binds an event handler
- `.binding(binding)` returns an inline binding spec for use with elements
- `.listBinding(templateBuilder, options?)` returns a list binding spec
- `.valueOf()` / `.toJSON()` for type coercion (scalars also have `.toString()`)

Example:
```
boxed.foo.color.bind(element, {
  toDOM(element, color){
    element.style.backgroundColor = color
  }
})

// Works on objects too:
boxed.app.user.path      // 'app.user'
boxed.app.user.value     // { name: 'Alice', ... }
boxed.app.items.observe(callback)  // observe array changes
```

> Note: The `xinValue`, `xinPath`, `xinObserve`, `xinBind`, `xinOn`, and
> `tosiValue`, `tosiPath`, etc. names still work but are deprecated.
> Use the shorter names above.

### To Do List Example

Each of the features described thus far, along with the features of the
`elementCreator` functions provided by the [elements](/?elements.ts) proxy
are designed to eliminate boilerplate, simplify your code, and reduce
the chance of making costly errors.

This example puts all of this together.

```js
import { elements, tosi } from 'tosijs'

const { todos } = tosi({
  todos: {
    list: [],
    newItem: ''
  }
})

const { h3, div, label, input, button, template } = elements

const addItem = () => {
  todos.list.push({
    description: todos.newItem
  })
  todos.newItem = ''
}

preview.append(
  h3('To do'),
  div(
    {
      bindList: {
        value: todos.list
      }
    },
    template(
      div({ bindText: '^.description' })
    )
  ),
  div(
    input({
      placeholder: 'task',
      bindValue: todos.newItem,
      onKeyup(event) {
        if(event.key === 'Enter' && todos.newItem != '') {
          addItem()
        }
      }
    }),
    button('Add', {
      bindEnabled: todos.newItem,
      onClick: addItem
    })
  )
)
```
*/

import {
  XinProxyObject,
  XinProxyTarget,
  XinObject,
  XinProxy,
  BoxedProxy,
  XinArray,
  XinValue,
  XinBinding,
  PathTestFunction,
  ObserverCallbackFunction,
  XinEventHandler,
} from './xin-types'
import { settings } from './settings'
import {
  Listener,
  touch,
  observe as _observe,
  unobserve,
  updates,
} from './path-listener'
import { getByPath, setByPath } from './by-path'
import { getBind, getOn } from './registry'
import { ElementsProxy } from './elements-types'
import { elements } from './elements'
import {
  xinValue,
  XIN_VALUE,
  XIN_PATH,
  XIN_OBSERVE,
  XIN_BIND,
  XIN_ON,
} from './metadata'

interface ProxyConstructor {
  revocable: <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ) => { proxy: P; revoke: () => void }
  new <T extends object>(target: T, handler: ProxyHandler<T>): T
  new <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ): P
}
declare let Proxy: ProxyConstructor

// list of Array functions that change the array
const ARRAY_MUTATIONS = [
  'sort',
  'splice',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'unshift',
]

import { registry, setXinProxy } from './registry'

const debugPaths = true

// in essence this very liberally matches foo ( .bar | [17] | [id=123] ) *
const validPath =
  /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

const isValidPath = (path: string): boolean => validPath.test(path)

const extendPath = (path = '', prop = ''): string => {
  if (path === '') {
    return prop
  } else {
    if (prop.match(/^\d+$/) !== null || prop.includes('=')) {
      return `${path}[${prop}]`
    } else {
      return `${path}.${prop}`
    }
  }
}

// Single shared target for all boxed scalar proxies - the proxy handler
// closure contains all the actual information (path), and values are
// always read from/written to the registry
const boxedScalarTarget = {}

function box<T>(x: T, path: string): T {
  // Objects and functions don't need boxing - they get proxied directly
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    return x
  }
  // For scalars, use the shared target - path is captured in the handler closure
  return new Proxy<XinProxyTarget, XinObject>(
    boxedScalarTarget,
    regHandler(path, true)
  ) as T
}

const listElement = () => new Proxy({}, regHandler('^', true))

// Single deprecation warning for all legacy property names
let deprecationWarned = false
function warnDeprecation() {
  if (!deprecationWarned) {
    console.warn(
      'xinValue, tosiValue, xinPath, tosiPath, etc. are deprecated. Use value, path, observe, bind, on, binding, listBinding instead.'
    )
    deprecationWarned = true
  }
}

// Check if target is a boxed scalar proxy
const isBoxedScalar = (target: any): boolean => {
  return target === boxedScalarTarget
}

const regHandler = (
  path: string,
  boxScalars: boolean
): ProxyHandler<XinObject> => ({
  get(target: XinObject | XinArray, _prop: string | symbol): XinValue {
    // For boxed scalars, intercept property access - value always comes from registry
    if (isBoxedScalar(target)) {
      // Helper to get the actual value from registry
      const getValue = () => getByPath(registry, path)

      switch (_prop) {
        // Primary API for boxed scalars
        case 'path':
          return path
        case 'value':
          return getValue()
        case 'valueOf':
        case 'toJSON':
          return () => getValue()
        case Symbol.toPrimitive:
          return (hint: string) => {
            const val = getValue()
            if (hint === 'number') return Number(val)
            if (hint === 'string') return String(val)
            return val
          }
        case 'toString':
          return () => String(getValue())
        case 'observe':
          return (callback: ObserverCallbackFunction) => {
            const listener = _observe(path, callback)
            return () => unobserve(listener)
          }
        case 'on':
          return (
            element: HTMLElement,
            eventType: keyof HTMLElementEventMap
          ): VoidFunction =>
            getOn()(element, eventType, getValue() as XinEventHandler)
        case 'bind':
          return (
            element: Element,
            binding: XinBinding,
            options?: XinObject
          ) => {
            getBind()(element, path, binding, options)
          }
        case 'binding':
          return (binding: XinBinding) => ({
            bind: {
              value: path,
              binding,
            },
          })
        case 'listBinding':
          return (
            content: (e: ElementsProxy, obj: BoxedProxy) => HTMLElement = ({
              span,
            }) => span({ bindText: '^' }),
            options: XinObject = {}
          ) => [
            {
              bindList: {
                value: path,
                ...options,
              },
            },
            elements.template(content(elements, listElement())),
          ]
        // Deprecated names for boxed scalars
        case XIN_VALUE:
        case 'xinValue':
        case 'tosiValue':
          warnDeprecation()
          return getValue()
        case XIN_PATH:
        case 'xinPath':
        case 'tosiPath':
          warnDeprecation()
          return path
        case XIN_OBSERVE:
        case 'tosiObserve':
          warnDeprecation()
          return (callback: ObserverCallbackFunction) => {
            const listener = _observe(path, callback)
            return () => unobserve(listener)
          }
        case XIN_ON:
        case 'tosiOn':
          warnDeprecation()
          return (
            element: HTMLElement,
            eventType: keyof HTMLElementEventMap
          ): VoidFunction =>
            getOn()(element, eventType, getValue() as XinEventHandler)
        case XIN_BIND:
        case 'tosiBind':
          warnDeprecation()
          return (
            element: Element,
            binding: XinBinding,
            options?: XinObject
          ) => {
            getBind()(element, path, binding, options)
          }
        case 'tosiBinding':
          warnDeprecation()
          return (binding: XinBinding) => ({
            bind: {
              value: path,
              binding,
            },
          })
        case 'tosiListBinding':
          warnDeprecation()
          return (
            content: (e: ElementsProxy, obj: BoxedProxy) => HTMLElement = ({
              span,
            }) => span({ bindText: '^' }),
            options: XinObject = {}
          ) => [
            {
              bindList: {
                value: path,
                ...options,
              },
            },
            elements.template(content(elements, listElement())),
          ]
      }

      // String index access (e.g., boxedStr[0])
      if (typeof _prop === 'string' && /^\d+$/.test(_prop)) {
        const val = getValue()
        if (typeof val === 'string') {
          return val[parseInt(_prop, 10)]
        }
      }

      // String length
      if (_prop === 'length') {
        const val = getValue()
        if (typeof val === 'string') {
          return val.length
        }
      }

      return undefined
    }

    // For non-boxed-scalar objects, handle property access
    // Primary API (unprefixed) - only for boxed proxies to avoid conflicts with actual properties
    // Only intercept if the property does NOT exist on the target (to avoid shadowing real properties)
    if (boxScalars && !(_prop in target)) {
      switch (_prop) {
        case 'path':
          return path
        case 'value':
          return target.valueOf ? target.valueOf() : target
        case 'valueOf':
        case 'toJSON':
          return () => (target.valueOf ? target.valueOf() : target)
        case 'observe':
          return (callback: ObserverCallbackFunction) => {
            const listener = _observe(path, callback)
            return () => unobserve(listener)
          }
        case 'on':
          return (
            element: HTMLElement,
            eventType: keyof HTMLElementEventMap
          ): VoidFunction =>
            getOn()(element, eventType, xinValue(target) as XinEventHandler)
        case 'bind':
          return (
            element: Element,
            binding: XinBinding,
            options?: XinObject
          ) => {
            getBind()(element, path, binding, options)
          }
        case 'binding':
          return (binding: XinBinding) => ({
            bind: {
              value: path,
              binding,
            },
          })
        case 'listBinding':
          return (
            content: (e: ElementsProxy, obj: BoxedProxy) => HTMLElement = ({
              span,
            }) => span({ bindText: '^' }),
            options: XinObject = {}
          ) => [
            {
              bindList: {
                value: path,
                ...options,
              },
            },
            elements.template(content(elements, listElement())),
          ]
      }
    }
    // Legacy API (xin/tosi prefixed) - works for both xin and boxed proxies
    switch (_prop) {
      case XIN_PATH:
      case 'xinPath':
      case 'tosiPath':
        return path
      case XIN_VALUE:
      case 'xinValue':
      case 'tosiValue':
        // For proxied objects, valueOf() returns the underlying object
        // because function values are bound to target in the get handler
        return target.valueOf ? target.valueOf() : target
      case XIN_OBSERVE:
      case 'xinObserve':
      case 'tosiObserve':
        return (callback: ObserverCallbackFunction) => {
          const listener = _observe(path, callback)
          return () => unobserve(listener)
        }
      case XIN_ON:
      case 'xinOn':
      case 'tosiOn':
        return (
          element: HTMLElement,
          eventType: keyof HTMLElementEventMap
        ): VoidFunction =>
          getOn()(element, eventType, xinValue(target) as XinEventHandler)
      case XIN_BIND:
      case 'xinBind':
      case 'tosiBind':
        return (element: Element, binding: XinBinding, options?: XinObject) => {
          getBind()(element, path, binding, options)
        }
      case 'tosiBinding':
        return (binding: XinBinding) => ({
          bind: {
            value: path,
            binding,
          },
        })
      case 'tosiListBinding':
        return (
          content: (e: ElementsProxy, obj: BoxedProxy) => HTMLElement = ({
            span,
          }) => span({ bindText: '^' }),
          options: XinObject = {}
        ) => [
          {
            bindList: {
              value: path,
              ...options,
            },
          },
          elements.template(content(elements, listElement())),
        ]
    }
    if (typeof _prop === 'symbol') {
      return (target as XinObject)[_prop]
    }

    // Check for non-configurable, non-writable properties (e.g., String character indices)
    // Proxy invariant: must return the exact target value for such properties
    const descriptor = Object.getOwnPropertyDescriptor(target, _prop)
    if (
      descriptor &&
      !descriptor.configurable &&
      !descriptor.writable &&
      'value' in descriptor
    ) {
      return descriptor.value
    }

    let prop = _prop
    const compoundProp =
      prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
      prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
      prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
      prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp !== null) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = getByPath(target, basePath)
      return value !== null && typeof value === 'object'
        ? new Proxy<XinObject, XinProxyObject>(
            value,
            regHandler(currentPath, boxScalars)
          )[subPath]
        : value
    }
    if (prop.startsWith('[') && prop.endsWith(']')) {
      prop = prop.substring(1, prop.length - 1)
    }
    if (
      (!Array.isArray(target) && target[prop] !== undefined) ||
      (Array.isArray(target) && prop.includes('='))
    ) {
      let value: XinValue
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as XinObject[]).find(
          (candidate: XinObject) =>
            `${getByPath(candidate, idPath) as string}` === needle
        )
      } else {
        // we're working around Typescript's incorrect understanding of arrays
        value = (target as XinArray)[prop as unknown as number]
      }
      if (value instanceof Object) {
        const currentPath = extendPath(path, prop)
        return new Proxy<XinObject, XinProxyObject>(
          value instanceof Function ? value.bind(target) : value,
          regHandler(currentPath, boxScalars)
        ) as XinValue
      } else {
        return boxScalars ? box(value, extendPath(path, prop)) : value
      }
    } else if (Array.isArray(target)) {
      const value = target[prop as unknown as number]
      return typeof value === 'function'
        ? (...items: any[]) => {
            // Unwrap any proxied/boxed values before passing to array methods
            // to prevent proxy objects from leaking into the underlying data
            const unwrappedItems = items.map((item) => xinValue(item))
            const result = value.apply(target, unwrappedItems)
            if (ARRAY_MUTATIONS.includes(prop)) {
              touch(path)
            }
            return result
          }
        : typeof value === 'object'
        ? new Proxy<XinProxyTarget, XinObject>(
            value,
            regHandler(extendPath(path, prop), boxScalars)
          )
        : boxScalars
        ? box(value, extendPath(path, prop))
        : value
    } else {
      return boxScalars
        ? box(target[prop], extendPath(path, prop))
        : target[prop]
    }
  },
  set(target, prop: string | symbol, value: any) {
    value = xinValue(value)
    // Treat 'value' as a path setter for boxed scalars AND for boxed objects/arrays
    // (when boxScalars is true, .value should always set the underlying value)
    const isValueProp =
      prop === XIN_VALUE ||
      prop === 'xinValue' ||
      prop === 'tosiValue' ||
      (prop === 'value' && (isBoxedScalar(target) || boxScalars))
    const fullPath = isValueProp ? path : extendPath(path, prop as string)
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    const existing = xinValue(xin[fullPath])
    if (existing !== value && setByPath(registry, fullPath, value)) {
      touch(fullPath)
    }
    return true
  },
})

const observe = (
  test: string | RegExp | PathTestFunction,
  callback: string | ObserverCallbackFunction
): Listener => {
  const func = typeof callback === 'function' ? callback : xin[callback]

  if (typeof func !== 'function') {
    throw new Error(
      `observe expects a function or path to a function, ${
        callback as string
      } is neither`
    )
  }

  return _observe(test, func as ObserverCallbackFunction)
}

const xin = new Proxy<XinObject, XinProxy<XinObject>>(
  registry,
  regHandler('', false)
)

// Register xin proxy for use by bind.ts (breaks circular dependency)
setXinProxy(xin)

const boxed = new Proxy<XinObject, BoxedProxy<XinObject>>(
  registry,
  regHandler('', true)
)

// settings and isValidPath are only used for internal testing
export { xin, boxed, updates, touch, observe, unobserve, settings, isValidPath }
