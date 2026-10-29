/*{"parent": "binding-to-the-dom", "order": 5, "title": "Bindings in Markup", "description": "enableDeclarativeBinding(): opt-in, closed by default — bind HTML with data-tosi-* attributes and no script, against an explicit list of what markup may read, write and call."}*/
/*#
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
*/
import { bind, on, delegationRoot } from './bind'
import { bindings } from './bindings'
import { tosiPath } from './metadata'
import { extendsPath } from './path-listener'
import { settings } from './settings'

export type DeclarativeGrant =
  | Array<string | { [key: string]: any }>
  | ((path: string) => boolean)

export interface DeclarativeBindingOptions {
  /** paths (or proxies) markup may show */
  read?: DeclarativeGrant
  /** paths a two-way binding may write */
  write?: DeclarativeGrant
  /** functions markup may call, and paths trusted to act (href, src, …) */
  actions?: DeclarativeGrant
  /** where to look; defaults to document.body */
  root?: Element
}

export interface DeclarativeBinding {
  /** bind the data-tosi-* attributes on an element and its descendants */
  hydrate(element: Element): void
  /** stop watching for inserted markup; bindings already made stay */
  disable(): void
}

const PREFIX = 'data-tosi-'
const PATH = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[\d+\])*$/
const INERT_ATTRS =
  /^(class|title|hidden|disabled|checked|value|role|alt|placeholder|aria-.+|data-(?!tosi-).+)$/
const INERT_PROPS = new Set([
  'textContent',
  'value',
  'checked',
  'disabled',
  'hidden',
  'title',
  'className',
])
const NEVER = /^(on.*|innerhtml|outerhtml|srcdoc)$/i
const GESTURES = new Set([
  'click',
  'dblclick',
  'input',
  'change',
  'submit',
  'reset',
  'keydown',
  'keyup',
])

const kebabToCamel = (s: string): string =>
  s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

const grants = (grant?: DeclarativeGrant): ((path: string) => boolean) => {
  if (typeof grant === 'function') return grant
  const roots = (grant ?? []).map((g) =>
    typeof g === 'string' ? g : tosiPath(g)
  )
  return (path) => roots.some((root) => root != null && extendsPath(root, path))
}

const attrBinding = (name: string) => ({
  toDOM(element: Element, value: any) {
    if (value == null || value === false) element.removeAttribute(name)
    else element.setAttribute(name, value === true ? '' : String(value))
  },
})

const propBinding = (prop: string) => ({
  toDOM(element: Element, value: any) {
    ;(element as any)[prop] = value
  },
})

export const enableDeclarativeBinding = (
  options: DeclarativeBindingOptions = {}
): DeclarativeBinding => {
  const mayRead = grants(options.read)
  const mayWrite = grants(options.write)
  const mayAct = grants(options.actions)
  const warned = new Set<string>()
  const hydrated = new WeakSet<Element>()

  const refuse = (element: Element, attr: string, reason: string): void => {
    const message = `tosijs: ${attr}="${element.getAttribute(
      attr
    )}" not bound: ${reason}`
    if (settings.quiet || warned.has(message)) return
    warned.add(message)
    console.warn(message, element)
  }

  // returns the reason it may not, or undefined when it may
  const check = (
    kind: string,
    target: string,
    path: string
  ): string | undefined => {
    if (!PATH.test(path)) return 'not a plain state path'
    if (!mayRead(path) && kind !== 'on')
      return 'the path is not granted to read'
    switch (kind) {
      case 'text':
      case 'value':
        return
      case 'bind-value':
        return mayWrite(path) ? undefined : 'the path is not granted to write'
      case 'on':
        if (!GESTURES.has(target))
          return `"${target}" is not an event a person causes`
        return mayAct(path) ? undefined : 'the path is not a granted action'
      case 'attr':
      case 'prop':
        if (NEVER.test(target)) return `"${target}" is never bound from markup`
        if (
          kind === 'attr' ? INERT_ATTRS.test(target) : INERT_PROPS.has(target)
        )
          return
        return mayAct(path)
          ? undefined
          : `"${target}" can act on its value, so the path must also be a granted action`
    }
    return 'unknown data-tosi-* attribute'
  }

  const hydrateOne = (element: Element): void => {
    if (hydrated.has(element)) return
    for (const { name, value: path } of Array.from(element.attributes)) {
      if (!name.startsWith(PREFIX)) continue
      const spec = name.slice(PREFIX.length)
      const [, kind, target = ''] =
        /^(text|value|bind-value|attr|prop|on)(?:-(.+))?$/.exec(spec) ?? []
      const prop = kind === 'prop' ? kebabToCamel(target) : target
      const reason =
        kind == null ||
        (kind === 'attr' || kind === 'prop' || kind === 'on') !==
          (target !== '')
          ? 'unknown data-tosi-* attribute'
          : check(kind, prop, path)
      if (reason !== undefined) {
        refuse(element, name, reason)
        continue
      }
      element.removeAttribute(name)
      if (kind === 'text') bind(element, path, bindings.text)
      else if (kind === 'value')
        bind(element, path, { toDOM: bindings.value.toDOM })
      else if (kind === 'bind-value') bind(element, path, bindings.value)
      else if (kind === 'attr') bind(element, path, attrBinding(target))
      else if (kind === 'prop') bind(element, path, propBinding(prop))
      else on(element as HTMLElement, target as any, path as any)
    }
    hydrated.add(element)
  }

  const hydrate = (element: Element): void => {
    hydrateOne(element)
    for (const descendant of Array.from(element.querySelectorAll('*')))
      hydrateOne(descendant)
  }

  const root = options.root ?? delegationRoot()
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations)
      for (const node of Array.from(mutation.addedNodes))
        if (node instanceof Element) hydrate(node)
  })
  observer.observe(root, { subtree: true, childList: true })
  hydrate(root)

  return { hydrate, disable: () => observer.disconnect() }
}
