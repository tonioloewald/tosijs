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

Each grant is a list of paths or proxies, or a `(path) => boolean`. `read`
and `write` match by whole segment (`app` allows `app.x` and `app[0]`, not
`appEvil`). `actions` match **exactly**, as the agent surface's do: granting
`app` does not make `app.items.splice` callable. Any other option, or a grant
that is neither a list nor a function, throws.

A two-way binding may never write **on, under or above** a granted action,
even inside a `write` grant, so markup can't replace a function with a string
(the agent surface's SEC-9 rule, shared with it). It also writes only over a
leaf: a path holding an object or function is refused when bound and skipped
at every write, which covers what a function `actions` grant can't enumerate.

Paths are plain: names, dots and `[n]` indices, with no `__proto__`,
`constructor` or `prototype` segment. Id-paths and anything else are refused.

**`<script>` and `<style>` are never bound.** Their text is code: setting an
empty parser-inserted script's text runs it, so a value granted only `read`
would execute.

**Showing is not acting.** Binding a value into `href`, `src`, `action`,
a component's property or anything else that is not known to be inert turns
the value into behaviour: a link, a request, a document. Those targets need
the path in `read` **and** in `actions`, which reads as "the value at this
path is trusted to act". So a path granted only `read` (user-authored text,
say) can be shown but cannot be made into a link by injected markup. The
inert targets are text, `value`, `checked`, `disabled`, `hidden`, `title`,
`class`, `role`, `alt`, `placeholder` and `aria-*`; an unknown target fails
closed. `data-*` is not inert: libraries such as htmx read `data-hx-*` as
behaviour. `on*` attributes and properties, `innerHTML`,
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

Verified in real browsers (the doc-test lane):

```test
import { tosi, updates, enableDeclarativeBinding } from 'tosijs'

test('markup binds, writes back, calls, and refuses an ungranted href', async () => {
  const { declTest } = tosi({
    declTest: { name: 'Ada', link: 'https://example.com/', clicks: 0, hit() {
      declTest.clicks.value += 1
    }, code: 'window.declTestRan = 1' },
  })
  await updates()
  const host = document.createElement('div')
  preview.append(host)
  const binding = enableDeclarativeBinding({
    read: [declTest],
    write: [declTest.name],
    actions: [declTest.hit],
    root: host,
  })
  // inserted after enabling: the observer hydrates it
  host.innerHTML =
    '<input data-tosi-bind-value="declTest.name">' +
    '<span data-tosi-text="declTest.name"></span>' +
    '<button data-tosi-on-click="declTest.hit">hit</button>' +
    '<a data-tosi-attr-href="declTest.link">link</a>'
  await new Promise((resolve) => setTimeout(resolve, 0))
  await updates()
  const input = host.querySelector('input')
  expect(input.value).toBe('Ada')
  input.value = 'Grace'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await updates()
  expect(host.querySelector('span').textContent).toBe('Grace')
  host.querySelector('button').click()
  expect(declTest.clicks.value).toBe(1)
  // href acts on its value: read alone is not enough
  expect(host.querySelector('a').hasAttribute('href')).toBe(false)
  // an empty script that has not run would run text set into it
  host.append(
    document
      .createRange()
      .createContextualFragment('<script data-tosi-text="declTest.code"></script>')
  )
  await new Promise((resolve) => setTimeout(resolve, 0))
  await updates()
  expect(window.declTestRan).toBe(undefined)
  expect(host.querySelector('script').textContent).toBe('')
  binding.disable()
})
```
*/
import { bind, on, delegationRoot } from './bind';
import { bindings } from './bindings';
import { tosiPath } from './metadata';
import { extendsPath, overlapsPath } from './path-listener';
import { getByPath, isUnsafeKey } from './by-path';
import { registry } from './registry';
import { settings } from './settings';
const PREFIX = 'data-tosi-';
const PATH = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[\d+\])*$/;
const INERT_ATTRS = /^(class|title|hidden|disabled|checked|value|role|alt|placeholder|aria-.+)$/;
const INERT_PROPS = new Set([
    'textContent',
    'value',
    'checked',
    'disabled',
    'hidden',
    'title',
    'className',
]);
const NEVER = /^(on.*|innerhtml|outerhtml|srcdoc)$/i;
// their text is code: an empty parser-inserted <script> runs what you set
const CODE_ELEMENTS = /^(script|style)$/i;
const OPTIONS = new Set(['read', 'write', 'actions', 'root']);
const GESTURES = new Set([
    'click',
    'dblclick',
    'input',
    'change',
    'submit',
    'reset',
    'keydown',
    'keyup',
]);
const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const grantPaths = (name, grant) => {
    if (grant !== undefined && !Array.isArray(grant))
        throw new TypeError(`enableDeclarativeBinding: ${name} must be a list of paths or proxies, ` +
            'or a (path) => boolean');
    return (grant ?? [])
        .map((g) => (typeof g === 'string' ? g : tosiPath(g)))
        .filter((path) => path != null);
};
const grants = (name, grant) => {
    if (typeof grant === 'function')
        return grant;
    const roots = grantPaths(name, grant);
    return (path) => roots.some((root) => extendsPath(root, path));
};
// the ancestors of a path, nearest last: 'a.b[0]' -> 'a', 'a.b'
const ancestors = (path) => [...path.matchAll(/[.[]/g)].map((m) => path.slice(0, m.index));
const attrBinding = (name) => ({
    toDOM(element, value) {
        if (value == null || value === false)
            element.removeAttribute(name);
        else
            element.setAttribute(name, value === true ? '' : String(value));
    },
});
const isContainer = (value) => value !== null && (typeof value === 'object' || typeof value === 'function');
// A two-way binding writes only over a leaf: overwriting a container could
// replace an action inside it, which a function `actions` grant can't
// enumerate (SEC-9 failed open above an action). Checked at every write too,
// since the value can become a container after hydration.
const leafValueBinding = (path) => ({
    toDOM: bindings.value.toDOM,
    fromDOM: (element) => isContainer(getByPath(registry, path))
        ? undefined
        : bindings.value.fromDOM(element),
});
const propBinding = (prop) => ({
    toDOM(element, value) {
        ;
        element[prop] = value;
    },
});
export const enableDeclarativeBinding = (options = {}) => {
    for (const key of Object.keys(options))
        if (!OPTIONS.has(key))
            throw new TypeError(`enableDeclarativeBinding: unknown option "${key}" (expected read, ` +
                `write, actions or root${key === 'roots' ? '; roots is read here' : ''})`);
    const mayRead = grants('read', options.read);
    const mayWrite = grants('write', options.write);
    // actions match EXACTLY, as the agent surface's call() does: a prefix
    // grant made every inherited method under it callable (app.items.splice)
    const actionGrant = options.actions;
    const actionPaths = typeof actionGrant === 'function'
        ? undefined
        : grantPaths('actions', actionGrant);
    const mayAct = typeof actionGrant === 'function'
        ? actionGrant
        : (path) => actionPaths.includes(path);
    // SEC-9: a write on, under or above an action could replace it
    const touchesAction = (path) => actionPaths !== undefined
        ? actionPaths.some((action) => overlapsPath(action, path))
        : mayAct(path) || ancestors(path).some(mayAct);
    const warned = new Set();
    const hydrated = new WeakSet();
    const refuse = (element, attr, reason) => {
        const message = `tosijs: ${attr}="${element.getAttribute(attr)}" not bound: ${reason}`;
        if (settings.quiet || warned.has(message))
            return;
        warned.add(message);
        console.warn(message, element);
    };
    // returns the reason it may not, or undefined when it may
    const check = (kind, target, path) => {
        if (!PATH.test(path) || path.split(/[.[\]]/).some(isUnsafeKey))
            return 'not a plain state path';
        if (!mayRead(path) && kind !== 'on')
            return 'the path is not granted to read';
        switch (kind) {
            case 'text':
            case 'value':
                return;
            case 'bind-value':
                if (touchesAction(path) || isContainer(getByPath(registry, path)))
                    return 'writing it could replace an action';
                return mayWrite(path) ? undefined : 'the path is not granted to write';
            case 'on':
                if (!GESTURES.has(target))
                    return `"${target}" is not an event a person causes`;
                return mayAct(path) ? undefined : 'the path is not a granted action';
            case 'attr':
            case 'prop':
                if (NEVER.test(target))
                    return `"${target}" is never bound from markup`;
                if (kind === 'attr' ? INERT_ATTRS.test(target) : INERT_PROPS.has(target))
                    return;
                return mayAct(path)
                    ? undefined
                    : `"${target}" can act on its value, so the path must also be a granted action`;
        }
        return 'unknown data-tosi-* attribute';
    };
    const hydrateOne = (element) => {
        if (hydrated.has(element))
            return;
        const code = CODE_ELEMENTS.test(element.localName);
        for (const { name, value: path } of Array.from(element.attributes)) {
            if (!name.startsWith(PREFIX))
                continue;
            if (code) {
                refuse(element, name, `a <${element.localName}> runs its text`);
                continue;
            }
            const spec = name.slice(PREFIX.length);
            const [, kind, target = ''] = /^(text|value|bind-value|attr|prop|on)(?:-(.+))?$/.exec(spec) ?? [];
            const prop = kind === 'prop' ? kebabToCamel(target) : target;
            const reason = kind == null ||
                (kind === 'attr' || kind === 'prop' || kind === 'on') !==
                    (target !== '')
                ? 'unknown data-tosi-* attribute'
                : check(kind, prop, path);
            if (reason !== undefined) {
                refuse(element, name, reason);
                continue;
            }
            element.removeAttribute(name);
            if (kind === 'text')
                bind(element, path, bindings.text);
            else if (kind === 'value')
                bind(element, path, { toDOM: bindings.value.toDOM });
            else if (kind === 'bind-value')
                bind(element, path, leafValueBinding(path));
            else if (kind === 'attr')
                bind(element, path, attrBinding(target));
            else if (kind === 'prop')
                bind(element, path, propBinding(prop));
            else
                on(element, target, path);
        }
        hydrated.add(element);
    };
    const hydrate = (element) => {
        hydrateOne(element);
        for (const descendant of Array.from(element.querySelectorAll('*')))
            hydrateOne(descendant);
    };
    const root = options.root ?? delegationRoot();
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations)
            for (const node of Array.from(mutation.addedNodes))
                if (node instanceof Element)
                    hydrate(node);
    });
    observer.observe(root, { subtree: true, childList: true });
    hydrate(root);
    return { hydrate, disable: () => observer.disconnect() };
};
