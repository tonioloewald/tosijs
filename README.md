# tosijs

<!--{ "pin": "top" }-->

> `xinjs` has been renamed `tosijs`. Updating the documentation and links is a
> work in progress. The goal is for the API to remain stable during the transition.
> If/when you want to migrate from `xinjs` to `tosijs`, here's a [guide for migrating to tosijs](/?Migration.md)

[tosijs.net](https://tosijs.net) | [tosijs-ui](https://ui.tosijs.net) | [github](https://github.com/tonioloewald/tosijs) | [npm](https://www.npmjs.com/package/tosijs) | [cdn](https://www.jsdelivr.com/package/npm/tosijs) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

[![tosijs is on NPM](https://badge.fury.io/js/tosijs.svg)](https://www.npmjs.com/package/tosijs)
[![tosijs is about 15kB gzipped](https://deno.bundlejs.com/?q=tosijs&badge=)](https://bundlejs.com/?q=tosijs&badge=)
[![tosijs on jsdelivr](https://data.jsdelivr.com/v1/package/npm/tosijs/badge)](https://www.jsdelivr.com/package/npm/tosijs)

<div style="text-align: center; margin: 20px">
  <xin-lottie style="display: inline-block; width: 280px; height: 280px; background: #da1167; border-radius: 40px" src="/tosi.json">
    <img style="width: 280px" alt="tosijs logo" src="https://tosijs.net/favicon.svg">
  </xin-lottie>
</div>

> For a pretty thorough overview of tosijs, you might like to start with [What is tosijs?](https://loewald.com/blog/2025/6/4/what-is-tosijs).
> To understand the thinking behind tosijs, there's [What should a front-end framework do?](https://loewald.com/blog/2025/6/4/what-should-a-front-end-framework-do).

### Build UIs with less code

If you want to build a web-application that's performant, robust, and maintainable,
`tosijs` lets you:

- build user-interfaces with pure javascript/typescript—no JSX, complex tooling, or spooky action-at-a-distance
- manage application state almost effortlessly—eliminate most binding code
- bind application state to the UI and services without locking yourself into a specific framework
- work in Typescript or Javascript
- use web-components, build your own web-components quickly and easily
- manage CSS efficiently and flexibly using CSS variables and Color computations
- leverage existing business logic and libraries without complex wrappers

```js
import { elements, tosi, touch, deleteListItem } from 'tosijs'

const todo = {
  list: [],
  addItem(reminder) {
    if (reminder.trim()) {
      todo.list.push({ id: Math.random(), reminder })
    }
  },
}

todo.addItem('wash the cat')
todo.addItem('buy milk')

const { readmeTodoDemo } = tosi({ readmeTodoDemo: todo })

const { h4, ul, template, li, label, input } = elements
preview.append(
  h4('To Do List'),
  ul(
    ...readmeTodoDemo.list.listBinding(
      ({ li, button }, item) =>
        li(
          item.reminder,
          button('Done!', {
            style: {
              marginLeft: 10,
            },
            onClick(event) {
              deleteListItem(event.target)
            },
          })
        ),
      { idPath: 'id' }
    )
  ),
  label(
    'Reminder',
    input({
      placeholder: 'enter a reminder',
      onKeydown(event) {
        if (event.key === 'Enter') {
          event.preventDefault()
          readmeTodoDemo.addItem(event.target.value)
          event.target.value = ''
          touch(readmeTodoDemo)
        }
      },
    })
  )
)
```

In general, `tosijs` is able to accomplish the same or better compactness, expressiveness,
and simplicity as you get with highly-refined React-centric toolchains, but without transpilation,
domain-specific-languages, or other tricks that provide "convenience" at the cost of becoming locked-in
to React, a specific state-management system (which permeates your business logic), and usually a specific UI framework.

`tosijs` lets you work with pure HTML and web-components as cleanly—more cleanly—and efficiently than
React toolchains let you work with JSX.

    export default function App() {
      return (
        <div className="App">
          <h1>Hello React</h1>
          <h2>Start editing to see some magic happen!</h2>
        </div>
      );
    }

Becomes:

    const { div, h1, h2 } = elements // exported from tosijs
    export const App = () => div(
      { class: 'App' },
      h1('Hello tosijs'),
      h2('Start editing to see some magic happen!')
    )

Except this reusable component outputs native DOM nodes. No transpilation, spooky magic at a distance,
or virtual DOM required. And it all works just as well with web-components. This is what you get when
you run App() in the console:

    ▼ <div class="App">
        <h1>Hello tosijs</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>

The ▼ is there to show that's **DOM nodes**, not HTML.

`tosijs` lets you lean into web-standards and native browser functionality while writing less code that's
easier to run, debug, deploy, and maintain. Bind data direct to standard input elements—without having
to fight their basic behavior—and now you're using _native_ functionality with _deep accessibility_ support
as opposed to whatever the folks who wrote the library you're using have gotten around to implementing.

> **Aside**: `tosijs` will also probably work perfectly well with `Angular`, `Vue`, et al, but I haven't
> bothered digging into it and don't want to deal with `ngZone` stuff unless someone is paying
> me.

If you want to build your own `web-components` versus use something off-the-rack like
[Shoelace](https://shoelace.style), `tosijs` offers a `Component` base class that, along with
its `elements` and `css` libraries allows you to implement component views in pure Javascript
more compactly than with `jsx` (and without a virtual DOM).

    import { Component, elements, css } from 'tosijs'

    const { h1, slot } = elements
    export class MyComponent extends Component {
      static shadowStyleSpec = css({
        h1: {
          color: 'blue'
        }
      })
      content = [ h1('hello world'), slot() ]
    }

The difference is that `web-components` are drop-in replacements for standard HTML elements
and interoperate happily with one-another and other libraries, load asynchronously,
and are natively supported by all modern browsers.

## What `tosijs` does

### Observe Object State

`tosijs` tracks the state of objects you assign to it using `paths` allowing economical
and direct updates to application state.

    import { tosi, observe } from 'tosijs'

    const { app } = tosi({
      app: {
        prefs: {
          darkmode: false
        },
        docs: [
          {
            id: 1234,
            title: 'title',
            body: 'markdown goes here'
          }
        ]
      }
    })

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', app.prefs.darkmode.value)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does `tosi` do, and what is a `BoxedProxy`?
>
> `tosi` is syntax sugar for assigning something to `xin` (which is a proxy over
> the central registry) and then getting it back out as a `BoxedProxy`.
>
> A `BoxedProxy` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> wrapped around an `object` (which in Javascript means anything
> that has a `constructor` which in particular includes `Array`s, `class` instances, `function`s
> and so on, but not "scalars" like `number`s, `string`s, `boolean`s, `null`, and `undefined`)
>
> All you need to know about a `BoxedProxy` is that it's a Proxy wrapped around your original
> object that allows you to interact with the object normally, but which allows `tosijs` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want the original object back you can use `.value` on any proxy to unwrap it.

### No Tax, No Packaging

`tosijs` does not modify the stuff you hand over to it… it just wraps objects
with a `Proxy` and then if you use `xin` to make changes to those objects,
`tosijs` will notify any interested observers.

**Note** `tosi({foo: {...}})` is syntax sugar for `xin.foo = {...}`.

    import { tosi, observe } from 'tosijs'
    const { foo } = tosi({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', (path) => {
      console.log('foo.bar was changed to', foo.bar.value)
    })

    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

`xin` is designed to behave just like a JavaScript `Object`. What you put
into it is what you get out of it:

    import { xin } from 'tosijs'

    const foo = {bar: 'baz'}
    xin.foo = foo

    // xin.foo returns the value directly
    xin.foo.bar === 'baz'

    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true

    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so `tosijs` supports the idea of id-paths

    import { tosi, xin } from 'tosijs'

    const { app } = tosi({
      app: {
        list: [
          {
            id: '1234abcd',
            text: 'hello world'
          },
          {
            id: '5678efgh',
            text: 'so long, redux'
          }
        ]
      }
    })

    console.log(app.list[0].text)              // hello world
    console.log(app.list['id=5678efgh'])       // so long, redux
    console.log(xin['app.list[id=1234abcd]'])  // hello world

### Telling `xin` about changes using `touch()`

Sometimes you will modify an object behind `xin`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { xin, observe, touch } from 'tosijs'

    const foo = { bar: 17 }
    xin.foo = foo
    observe('foo.bar', (path) => console.log(path, '->', xin[path]))
    xin.foo.bar = -2              // console will show: foo.bar -> -2

    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

Every `BoxedProxy` also has a `.touch()` method:

    app.user.name.touch()     // force update for a scalar
    app.items[2].touch()      // force update for a list item

For list items with `idPath`, `.touch()` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly.

### List Operations

Proxied arrays have `listFind`, `listUpdate`, and `listRemove` methods
for common list operations:

    // Find — returns proxied item (mutations trigger observers)
    const item = app.items.listFind((item) => item.id, 'abc')

    // Find by DOM element (in click handlers)
    const item = app.items.listFind(clickedElement)

    // Upsert — update in place or push if not found
    app.items.listUpdate((item) => item.id, { id: 'abc', name: 'New' })

    // Remove — returns true if found
    app.items.listRemove((item) => item.id, 'abc')

`listUpdate` preserves object identity — it mutates the existing object
property by property, so only changed properties fire observers and DOM
elements are reused (no teardown/recreation).

### CSS

`tosijs` includes utilities for working with css.

    import { css, vars } from 'tosijs'

The `vars` proxy converts camelCase properties into css variable references:

    vars.fooBar // emits 'var(--foo-bar)'
    `calc(${vars.width} + 2 * ${vars.spacing})` // emits 'calc(var(--width) + 2 * var(--spacing))'

`css()` processes an object, rendering it as CSS:

    css({
      '.container': {
        position: 'relative'
      }
    }) // emits .container { position: relative; }

CSS variables can be declared using `_` and `__` prefixes in `css()` objects:

    css({
      ':root': {
        _textFont: 'sans-serif',   // emits --text-font: sans-serif
        _color: '#111',            // emits --color: #111
      }
    })

## Color

`tosijs` includes a powerful `Color` class for manipulating colors.

    import { Color } from 'tosijs'
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

Use `invertLuminance()` to generate dark-mode equivalents of color values.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
`tosijs` supports hot reloading (and not just in development!) via the `hotReload()`
function:

    import { xin, hotReload } from 'tosijs'

    xin.app = {
      ...
    }

    hotReload()

`hotReload` stores serializable state managed by `xin` in localStorage and restores
it (by overlay) on reload. Because any functions (for example) won't be persisted,
simply call `hotReload` after initializing your app state and you're good to go.

`hotReload` accepts a test function (path => boolean) as a parameter.
Only top-level properties in `xin` that pass the test will be persisted.

To completely reset the app, run `localStorage.clear()` in the console.

## Development Notes

You'll need to install [bun](https://bun.sh/) and then run `bun install`.

    bun start                  # dev server with hot reload (https://localhost:8018)
    bun test                   # run all tests
    bun run dev.ts --build     # production build (runs tests, then bundles)
    bun run format             # lint and format (ESLint + Prettier)
    bun pack                   # create local package tarball

## Related Libraries

- [tosijs-ui](https://ui.tosijs.net) — a web-component library built on tosijs `Component`
- [tosijs-3d](https://3d.tosijs.net) — 3D graphics library built on tosijs
- [react-tosijs](https://github.com/tonioloewald/react-tosijs#readme) — use tosijs's path-observer model in [React](https://reactjs.org) apps

## Credits

`tosijs` is in essence a highly incompatible update to `b8rjs` with the goal
of removing cruft, supporting more use-cases, and eliminating functionality
that has been made redundant by improvements to the JavaScript language and
DOM APIs.

`tosijs` is being developed using [bun](https://bun.sh/).
`bun` is crazy fast (based on Webkit's JS engine, vs. V8), does a lot of stuff
natively, and runs TypeScript (with import and require) directly.

Logo animation by [@anicoremotion](https://pro.fiverr.com/freelancers/anicoremotion).
