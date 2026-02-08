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

## The Four Steps

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

### 2. Build your UI as static DOM

    const { div, h1, input, ul } = elements

    const view = div(
      h1('My App'),
      input({ placeholder: 'Your name' }),
      ul()
    )

This is real DOM — not a template, not JSX, not a virtual representation.
You build it once. It doesn't re-render. You're writing a structure,
not a render function that gets called over and over.

### 3. Bind state to the DOM

    const view = div(
      h1({ bindText: app.user.name }),
      input({ bindValue: app.user.name }),
      div({ bind: {
        value: app.prefs.darkMode,
        binding: {
          toDOM(el, isDark) {
            el.classList.toggle('dark', isDark)
          }
        }
      }})
    )

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

### 4. Use virtual list bindings for collections

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

Virtual list bindings only render what's visible. A list of a million
messages renders the same number of DOM nodes as a list of twenty.
Scrolling is O(1) — the same virtual slice calculation runs regardless
of list size.

**Always specify `idPath` for arrays of objects.** This enables surgical
updates — changing one property on one item updates one DOM element.
Without it, the list falls back to index-based paths that break on reorder.

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
        const item = this.items.find(i => i.id === id)
        if (item) item.done = !item.done
      }
    }

    const { app } = tosi({ app: todo })

No imports from tosijs needed in your business logic. No framework concepts
leak into your data layer. You can test `todo.add()` and `todo.toggle()`
with plain unit tests.

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

    spinner({ hidden: app.loaded })

That's a real element with a real binding, not a parallel placeholder UI
that gets swapped out. Other frameworks have you build two versions of your
UI and orchestrate the handoff. tosijs just has the UI, and it fills in.

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

## Gotchas

### Proxied vs. raw values in array callbacks

`for...of` on a proxied array gives you proxied items — mutations trigger
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

### The BoxedScalar comparison trap

    boxed.count === 3  // always false! comparing a proxy to a number

    boxed.count.value === 3  // correct

The proxy can't intercept `===`. Use `.value` for comparisons.

### `touch()` is the escape hatch

When you mutate state behind the proxy's back — from a raw reference,
inside a `forEach`, after a bulk operation — call `touch(path)` to
tell tosijs to propagate updates. Most of the time the proxy handles
this automatically. `touch()` is for when it can't.

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
