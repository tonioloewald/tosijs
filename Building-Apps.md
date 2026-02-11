# 0. Building Apps with tosijs

<!--{}-->

> This guide explains how to think about building applications with tosijs.
> It's not an API reference — it's a mental model. If you're coming from React
> or another reactive framework, this is the most important thing to read first.

## The Downhill Model

In React, data flows "uphill." A child component needs to tell a parent something
happened, so you lift state up, pass callbacks down, drill props through layers
of components, and eventually something re-renders — often much more than needed.
You fight the framework to avoid unnecessary work.

tosijs works downhill. State changes at the top. The UI updates at the bottom.
Nothing in between needs to know about it.

    state changes → observers fire → bound DOM updates

There's no virtual DOM, no diffing, no reconciliation. When `user.name` changes,
the one `<span>` bound to `user.name` updates. Nothing else re-renders.

The key concept is the **path**. Where React thinks in terms of a component tree,
tosijs thinks in terms of addresses: `app.user.name` is a path. Bindings watch
paths. Mutations fire on paths. Everything in tosijs routes through paths — that's
why binding to a specific scalar path is so much more efficient than binding to
an object and diffing.

## The Three Steps

### 1. Put your state in a proxy

    const { app } = tosi({
      app: {
        user: { name: 'Alice', email: 'alice@example.com' },
        messages: [],
        prefs: { darkMode: false }
      }
    })

This is your entire application state. It's a plain JavaScript object — your
business logic doesn't know tosijs exists. You can add methods to it.
You can pass pieces of it to functions. The proxy wrapping is invisible
to your code.

There's no `dispatch`, no `setState`, no action creators.
To change state, just change it:

    app.user.name.value = 'Bob'

The proxy sees the mutation and notifies anyone who cares.

> **TypeScript note:** `app.user.name` is a `BoxedScalar<string>`, not a
> raw string. Use `.value` to read or write the underlying primitive.
> At runtime, direct assignment works too, but TypeScript's type system
> can't express asymmetric get/set on mapped types.

This also means `===` doesn't work on proxied scalars — JavaScript
doesn't allow objects to be strictly equal to primitives:

    app.user.name === 'Bob'        // always false — comparing proxy to string
    app.user.name.value === 'Bob'  // correct

Reach for `.value` whenever you need the raw primitive — for comparisons,
assignments, or passing to external APIs.

### 2. Build your UI with bindings

    const { div, h1, input, ul } = elements

    const view = div(
      h1(app.user.name),
      input({ value: app.user.name }),
      div({ class: 'status', hidden: app.loggedIn })
    )

This is real DOM — not a template, not JSX, not a virtual representation.
You build it once. It doesn't re-render. You're writing a structure with
live bindings, not a render function that gets called over and over.

**Proxies become live bindings automatically.** Pass a proxy as a child
and it becomes a text-bound `<span>` — `h1(app.user.name)` just works
(at the cost of one extra DOM element; use `textContent: app.user.name`
if that bothers you). Pass a proxy as any property or attribute and tosijs
detects it and binds it — `hidden: app.loggedIn` stays in sync with state.
This eliminates the need for most custom bindings.

`bindText` and `bindValue` are shorthands that also handle `fromDOM`
(two-way binding). For anything truly custom, use
`bind: { value, binding: { toDOM, fromDOM } }`. A function is also
accepted as shorthand for `{ toDOM: fn }`:

    div({ bind: {
      value: app.prefs.darkMode,
      binding(el, isDark) {
        el.classList.toggle('dark', isDark)
      }
    }})

**Bind individual scalar values, not objects.** This is the key insight.
When you bind `app.user.name` to a `<span>`, tosijs sets up a listener
on that exact path. When only the name changes, only that `<span>` updates.

If you bound the entire `app.user` object and pulled out `.name` in a
`toDOM` function, the binding would fire on *any* change to user — name,
email, whatever. You'd be doing React's job of figuring out what actually
changed. Don't. Let the path system do it for you.

**`fromDOM` bindings flow user input back to state** — an `<input>` with
`bindValue: app.user.name` writes directly to `app.user.name` when the
user types. Two-way binding with zero boilerplate.

**Conditional UI?** Don't think `condition ? <A/> : <B/>`. Instead,
build both and bind visibility:

    div(
      loginForm({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = loggedIn }
      }}),
      dashboard({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = !loggedIn }
      }})
    )

Both elements exist in the DOM. Bindings show/hide them. No teardown,
no re-creation, no lost state.

For large, expensive UI branches you don't want in the initial DOM at all,
just append them when needed — it's standard DOM manipulation:

    const container = div()
    app.showFeature.observe(() => {
      if (app.showFeature.value && !container.children.length) {
        container.append(buildExpensiveFeature())
      }
    })

No lazy-loading API, no `Suspense`, no dynamic imports. A function returns
an element, you put it in the DOM, bindings activate. That's it.

### 3. Use list bindings for collections

    ul(
      ...app.messages.listBinding(
        ({li, span}, msg) => li(
          span({ bindText: msg.sender }),
          span({ bindText: msg.body })
        ),
        {
          idPath: 'id',
          virtual: { height: 60 }
        }
      )
    )

This looks like `...items.map(item => li(item.name))` — familiar one-shot
rendering. It's not. The binding stays alive: additions, removals, and
property changes on `app.messages` automatically update the DOM. The
familiar mapping syntax is a Trojan horse for live list rendering.

Virtual list bindings only render what's visible. A list of a million
messages renders the same number of DOM nodes as a list of twenty.
Scrolling is O(1) — the same virtual slice calculation runs regardless
of list size.

**Always specify `idPath` for arrays of objects.** This enables surgical
updates — changing one property on one item updates one DOM element.
Without it, the list falls back to index-based paths that break on reorder.

### Finding, updating, and removing list items

Proxied arrays have `listFind`, `listUpdate`, and `listRemove` methods
that use the same selector pattern as `listBinding`:

    // Find an item — returns proxied, so mutations trigger updates
    const item = app.items.listFind((item) => item.id, 'abc')
    if (item) item.name.value = 'Updated'

    // Find by DOM element (in a click handler)
    const item = app.items.listFind(e.target)

    // Update in place — preserves object identity and DOM elements
    app.items.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Remove
    app.items.listRemove((item) => item.id, 'abc')

`listUpdate` is the key one: it mutates the existing object property by
property through the proxy, so only changed properties fire observers and
the DOM element is reused. If the item doesn't exist, it pushes a new one.

## Proxied vs. Raw

The proxy is the core of tosijs, so understanding where it applies matters.

### `for...of` gives proxied items; callbacks give raw items

`for...of` on a proxied array yields proxied items — mutations trigger
observers. But `forEach`, `map`, and `filter` pass *raw* items to callbacks.
Mutations inside these are invisible to tosijs.

    // for...of gives proxied items — mutations trigger observers
    for (const item of app.items) {
      item.score.value = 100  // observers fire
    }

    // forEach/map/filter pass raw items — mutations are silent
    app.items.forEach(item => {
      item.score = 100  // no observer fires
    })
    touch(app.items)  // manual touch needed after raw mutations

### `this` in proxied methods

Methods on proxied objects receive the proxy as `this`, which means
property access goes through the proxy. This is usually what you want —
mutations trigger observers automatically. But be aware that `this.items`
returns a proxied array, not a raw one:

    const todo = {
      items: [],
      add(text) {
        // `this` is the proxy — this push triggers observers
        this.items.push({ id: Date.now(), text, done: false })
      }
    }

If you need the raw value (e.g. for serialization), use
`tosiValue(this.items)` or `this.items.value`.

## Why This Works

### No component tree means no prop drilling

State lives in the `tosi()` proxy. Any element anywhere can bind to any path. You don't
need wrapper components to shuttle data through the hierarchy. A deeply
nested `<span>` can bind directly to `app.user.name` without any of its
ancestors knowing or caring.

### Business logic stays clean

Your data objects are just objects. They can have methods:

    const todo = {
      items: [],
      add(text) {
        this.items.push({ id: Date.now(), text, done: false })
      },
      toggle(id) {
        for (const item of this.items) {
          if (item.id.value === id) {
            item.done.value = !item.done.value
            break
          }
        }
      }
    }

    const { app } = tosi({ app: todo })

Note the `toggle` method uses `for...of` (which yields proxied items) and
`.value` for reads and writes. This ensures mutations trigger observers.
Array callbacks like `find` and `forEach` pass raw items — see
"Proxied vs. Raw" below.

No imports from tosijs needed in your business logic — though methods
called through the proxy receive proxied `this`, so your code does need
to be proxy-aware (using `.value` and `for...of`). You can test
`todo.add()` and `todo.toggle()` with plain unit tests.

### Deeply async by default

You can set up bindings before data exists. When data arrives — from a fetch,
a websocket, user input — the bindings just start working:

    const { app } = tosi({ app: { posts: [] } })

    // UI is already bound to app.posts
    // this just works whenever the fetch completes
    fetch('/api/posts')
      .then(r => r.json())
      .then(posts => { app.posts.value = posts })

No suspense boundaries, no effect hooks. The real UI is already mounted —
an empty bound list is your loading state, and it fills in with no layout
shift when data arrives. If you want an explicit loading indicator, bind one:

    div({ class: 'spinner', hidden: app.loaded })

That's a real element with a real binding, not a parallel placeholder UI
that gets swapped out. Other frameworks have you build two versions of your
UI and orchestrate the handoff. tosijs just has the UI, and it fills in.

Note the bare `hidden: app.loaded` — when you pass a proxy value as any
element property, tosijs detects it and creates a live binding automatically.
No `bind: { value, binding }` needed for simple property mappings.

Bindings to paths that don't exist yet are safe — they render as empty/blank
until data arrives. No `TypeError: cannot read property of undefined`.
The proxy intercepts the access; tosijs simply waits for the path to
materialize before firing the first update.

### `observe()` is for side effects, not rendering

In React you'd use `useEffect` for everything. In tosijs, DOM rendering
is handled by bindings. `observe()` is for *side effects* — things that
aren't directly binding a value to a DOM property:

    app.prefs.darkMode.observe(() => {
      document.body.classList.toggle('dark', app.prefs.darkMode.value)
    })

The `.observe()` method on a boxed value watches that exact path. You can
also use the standalone `observe()` function for pattern matching:

    observe('app.prefs', () => { /* any pref changed */ })
    observe(/app\.user\./, path => { /* any user field changed */ })

Toggle a body class. Fire an analytics event. Persist to localStorage.
That's what `observe()` is for.

## Components

tosijs includes a `Component` base class for web components. A few things
to know:

- **`content()` runs once.** It's not a render function — it builds the DOM
  during hydration and never re-runs. Updates happen through bindings, not
  by re-calling `content()`.

### Light DOM is where the action is

From reading most web component documentation, you'd think shadow DOM was
the only option. It isn't. tosijs components use **light DOM by default**,
and this is a deliberate choice, not a limitation.

Shadow DOM gives you style encapsulation — great for word-processor-style
isolated widgets, but a memory and performance hit for everything else.
It also creates an encapsulation boundary that blocks path bindings,
external styling, and the usual DOM query APIs.

tosijs takes the one really valuable feature of shadow DOM components —
`<slot>` composition — and makes it work in the light DOM. You get:

- **Path bindings work everywhere.** No encapsulation boundary to cross.
- **CSS just works.** Style your components the same way you style everything else.
- **Lighter weight.** No shadow root overhead per instance.
- **Slot composition.** tosijs rewrites `<slot>` elements in light DOM components.

tosijs rewrites `:host` selectors to the component's tag name, so
`styleSpec` works in both modes.

Use light DOM unless you know *exactly* why you need shadow DOM — and if
you do, you probably don't want automatic bindings anyway.

## Gotchas

### Observer callbacks receive paths, not values

Observer callbacks are called with the *path* that changed, not the new value:

    app.prefs.darkMode.observe((path) => {
      // path is a string like 'app.prefs.darkMode'
      // to get the value, read it explicitly:
      const isDark = app.prefs.darkMode.value
      document.body.classList.toggle('dark', isDark)
    })

This is true for both the `.observe()` method and the standalone `observe()` function.

### `touch()` is the escape hatch

When you mutate state behind the proxy's back — from a raw reference,
inside a `forEach`, after a bulk operation — call `touch()` to
tell tosijs to propagate updates. Most of the time the proxy handles
this automatically. `touch()` is for when it can't.

Every boxed proxy has a `.touch()` method, and there's also a standalone
`touch()` function you can import:

    app.user.name.touch()     // on a scalar
    app.items[2].touch()      // on a list item
    touch(app.items)          // standalone, on an array
    touch('app.user')         // standalone, by path string

For list items with `idPath`, `.touch()` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly even when you've
mutated the raw data behind the proxy's back.

`touch()` is also useful for **batch optimization**. If you need to make
many mutations, you can bypass the proxy, mutate the raw data directly,
and call `touch()` once at the end — one notification instead of N:

    const raw = app.items.value
    for (let i = 0; i < raw.length; i++) {
      raw[i].score = computeScore(raw[i])
    }
    touch(app.items)  // single update for all mutations

## The React Comparison, In Short

| React | tosijs |
|-------|--------|
| `useState` + `setState` | assign via `.value` |
| `useEffect` | `observe()` (but rarely needed) |
| `useMemo` / `useCallback` | not needed — no re-renders to avoid |
| props / prop drilling | bind directly to any path |
| Context API | everything is already global |
| `key` prop on lists | `idPath` on list bindings |
| Virtual DOM diffing | path-based direct DOM updates |
| Component re-render | individual binding updates |
| ~45kB gzipped | ~10kB gzipped (core) |

The fundamental difference: React asks "what changed?" after every state update
and works backwards to figure out the minimum DOM update. tosijs knows exactly
what changed (the path) and updates exactly the DOM nodes bound to that path.
React is O(tree size). tosijs is O(bindings on the changed path).
