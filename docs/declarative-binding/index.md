# Bindings in Markup (enableDeclarativeBinding)

Markup that cannot carry a script — a model's output, a saved view, a
server-rendered fragment, a doc page under a strict CSP — can still be live.
`enableDeclarativeBinding()` watches a root and turns `data-tosi-*`
attributes into ordinary `bind()` and `on()` calls. Nothing is evaluated: an
attribute's value is a state path, checked against what you granted.

It is **opt-in and closed by default.** With no grants nothing binds; it is
not in `tosijs/core` or the `<script>` build, and an app that never imports it
does not carry it.

```html
<label>Name <input data-tosi-bind-value="markup.name"></label>
<p>Hello, <b data-tosi-text="markup.name"></b>!</p>
<button data-tosi-on-click="markup.shout" data-tosi-attr-aria-label="markup.name">
  Shout
</button>
```
```js
import { tosi, enableDeclarativeBinding } from 'tosijs'

const { markup } = tosi({
  markup: {
    name: 'Ada',
    shout() {
      markup.name.value = markup.name.value.toUpperCase()
    },
  },
})

const { disable } = enableDeclarativeBinding({
  read: [markup],
  write: [markup.name],
  actions: [markup.shout],
  root: preview,
})
```

## The attributes

| attribute | binds |
| --- | --- |
| `data-tosi-text="path"` | the value → text content |
| `data-tosi-value="path"` | the value → `value`, one way |
| `data-tosi-bind-value="path"` | `value`, two way (needs a `write` grant) |
| `data-tosi-attr-aria-label="path"` | the value → the attribute (`null`, `undefined` and `false` remove it; `true` sets it empty) |
| `data-tosi-prop-row-count="path"` | the value → the `rowCount` property (kebab → camel) |
| `data-tosi-on-click="path"` | the event calls the function at the path |

A handler is called the way `on(element, 'click', 'app.save')` calls it:
with the event, resolved when the event fires, so replacing the function in
state takes effect. It takes no arguments from markup; put what it needs in
ordinary `data-*` attributes and read `event.target.dataset`.

Bound `data-tosi-*` attributes are removed once bound, so an element is
hydrated once. A refused one is left in place and warned about once, with the
reason.

## Grants

```
enableDeclarativeBinding({
  read: ['app'],             // paths (or proxies) markup may show
  write: ['app.form'],       // paths a two-way binding may write
  actions: ['app.save'],     // functions markup may call
  root: document.body,       // where to look (the default)
})
```

Each grant is a list of paths or proxies, matched by whole segment (`app`
allows `app.x` and `app[0]`, not `appEvil`), or a `(path) => boolean`. These
are the agent surface's three grants (`roots`, `write`, `actions`), so one
manifest can drive both.

Paths are plain: names, dots and `[n]` indices. Id-paths and anything else are
refused.

**Showing is not acting.** Binding a value into `href`, `src`, `action`,
a component's property or anything else that is not known to be inert turns
the value into behaviour: a link, a request, a document. Those targets need
the path in `read` **and** in `actions`, which reads as "the value at this
path is trusted to act". So a path granted only `read` (user-authored text,
say) can be shown but cannot be made into a link by injected markup. The
inert targets are text, `value`, `checked`, `disabled`, `hidden`, `title`,
`class`, `role`, `alt`, `placeholder`, `aria-*` and `data-*`; an unknown
target fails closed. `on*` attributes and properties, `innerHTML`,
`outerHTML` and `srcdoc` are refused whatever the grants.

**Only gesture events.** `data-tosi-on-*` accepts `click`, `dblclick`,
`input`, `change`, `submit`, `reset`, `keydown` and `keyup`: events a person
causes. `load`, `error`, `focus` and the like fire with no gesture, so
markup could call a function just by being inserted.

**Not closable here:** `read` is disclosure to whoever wrote the markup. A
bound field inside `<form action="https://elsewhere">` sends its value there.
A `form-action` CSP is the control for that.

`disable()` stops watching. Bindings already made stay, as with `bind()`.
`hydrate(element)` binds a fragment you are about to insert, which avoids a
moment where the raw attribute is live.
