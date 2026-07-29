# The Derived Surface
<!--{ "parent": "One User Interface", "order": 1, "description": "The wiring diagram tosijs already records, the metadata harvest from element sugar, and describe() assembling the affordance graph — live." }-->

*Part of [One User Interface](/ONE_USER_INTERFACE/) — why the agent surface derives from what tosijs already knows.*

## The part nobody else can offer: the wiring diagram is already recorded

Here is the b8r inheritance paying off. In b8r it was the norm to put state
*and* event handlers in the registry. tosijs kept that affordance
(`onClick: 'app.doThing'` binds a handler **by path**) but also allows the
ergonomic shortcut (`onClick: (event) => { … }`) — and crucially, **the shortcut
still passes through tosijs**. Every handler attached via element sugar or
`on()` is recorded. Every data binding records element ↔ path. The framework
doesn't just hold the model — it holds the complete map of *which widget is
wired to what*, as a side effect of normal operation.

That means an introspection surface costs the programmer **nothing**. Today,
with shipped exports:

| Question an agent asks | Answer, today |
| --- | --- |
| What state exists? | `xin` / `boxed` — plain serializable objects (this is what `hotReload` already relies on) |
| What is the value at a path? | `boxed[path].value` |
| Change it (and update the UI) | `xin[path] = value` — observers fire, DOM updates surgically |
| Tell me when it changes | `observe(path, cb)` — and `unobserve` to hang up |
| Which elements are data-bound? | `document.getElementsByClassName(BOUND_CLASS)` — the marker class **is** the enumerable index |
| What is *this* element wired to? | `getElementBindings(el)` → its data bindings (paths + binding types) **and** its event handlers *(one `export` away from public)* |
| Which datum does this row render? | `getListItem(el)` — DOM → model, including virtual list rows |
| What actions exist? | Functions in the registry (`app.addItem`) — addressable, callable, and already supported as by-path event handlers |
| What happened while I watched? | The path-touch stream — the `connectDevTools` pattern (every touch is `{path, snapshot}`) |

The React/Angular worlds cannot produce this table without becoming tosijs: it
requires a universal addressing scheme, a central observable registry, stable
DOM, and recorded wiring — which is simply a description of the observant model.
This is the "two steps beyond" claim, made concrete.

A useful subtlety: **shadow-DOM components are already agent-shaped.** A shadow
component is bound like an `<input>` — its `value` is the interface and its
internals are private by design. That's precisely the affordance/implementation
split an agent needs: it should set the date-picker's *value*, not fumble with
its internal buttons. (Closed shadow roots stay closed — for agents too.)

## The opportunistic harvest

The wiring table above is what tosijs records *deliberately*. There is a second,
larger layer it can harvest *opportunistically* — metadata that exists only
because developers use elementCreators and their syntax sugar. Every prop passed
to `div({…})`, every `initAttributes`, every `listBinding` flows through one
chokepoint (`elementSet` / the creator machinery), and almost all of it persists
somewhere recoverable (the element's attributes, the binding WeakMaps, the
component class). Nothing new needs recording — `describe()` computes the
harvest **on demand** from what's already there:

| The developer wrote (for their own reasons) | What it tells an agent, free |
| --- | --- |
| `onClick: (e) => {…}` | this element is interactive; event type known |
| `onClick: 'app.doThing'` | the action is *addressable and nameable* — a tool with a path |
| `bindValue: app.filter` (binding has `fromDOM`) | **this path is user-writable** — an input affordance |
| `textContent: app.total` (prop binding is `toDOM`-only) | this path is *displayed* — read-only output |
| `bindEnabled: app.cart.valid` | a **precondition**: the guarded action's availability depends on this path |
| `listBinding(template, { idPath: 'id' })` | `app.items` is a collection keyed by `id`; the template's relative (`^.field`) bindings enumerate **which fields of each item the UI presents**, and per-row handlers are per-row actions |
| `role`, `aria-*`, `title`, `placeholder`, `alt`, `label` wrapping | **semantic labels** — the same vocabulary a11y-tree agents already consume, but harvested at the source |
| `input({ type: 'email' })`, `required`, `min`/`max`/`pattern` | value types and validation constraints, straight from the markup sugar |
| `part: 'searchBox'` | the developer's *own name* for the affordance |
| `static initAttributes = { count: 0, live: false }` | a **typed per-component attribute schema** — types already inferred from defaults at runtime (`typeof` branch in the attribute machinery) |
| component `value` + `formAssociated` | the component's value surface and its form contract |

Two compounding effects make this more than a list of facts:

- **The join.** Because everything is declared *on the same element through the
  same call*, tosijs can join what no one else can: `role="search"` ×
  `bindValue: app.filter` × `onKeydown: app.submit` on one element is a complete
  **affordance descriptor** — semantic label, writable state, and action,
  co-located. The a11y-tree agents get the label but not the path; API tools get
  the action but not the label. tosijs stands in the middle when all three are
  declared, and the DOM + WeakMaps preserve the join for on-demand assembly.
- **The behavioral harvest.** At runtime, the audit stream adds provenance:
  `call('app.addItem')` → touches observed on `app.items` teaches the agent the
  **causal graph** (which actions affect which paths) purely by watching.
  `describe()` gets richer the longer the app runs, with zero developer effort.
- **Triangulated typing without schema.** `typeof` the state at the path ∧ the
  input's declared `type` ∧ `initAttributes` defaults: three independent
  signals agree on a field's type before tosijs-schema is even introduced —
  and flag a smell when they disagree.

The punchline is the same as the wiring table's, one octave up: the WebMCP
world asks developers to *author* tool schemas by hand; in tosijs, the app's
ordinary construction **is** the authoring. The sugar was designed for
ergonomics; it turns out to have been designing an agent interface all along.

### Proof: the harvest, assembled live

The UI below is built with ordinary element sugar — a labeled filter input
(two-way bound), a read-only total (one-way prop binding), and a button whose
handler is attached *by path*. There is not one agent-specific declaration in
it. Click **describe()** and the affordance graph is assembled on demand — and
because this page runs in introspection mode, the graph is the *whole page's*:
the [two-actors demo](/ONE_USER_INTERFACE/), the doc site's own chrome, and the very button you
clicked to ask.

```js
import { elements, tosi, enableAgentInterface } from 'tosijs'

const { harvest } = tosi({
  harvest: {
    filter: '',
    total: 3,
    restock() {
      harvest.total = harvest.total.value + 1
    },
  },
})

// reuse the page's surface if one is already installed
const agent = globalThis.tosiAgent ?? enableAgentInterface()
const { div, input, span, button, pre } = elements

const out = pre({ style: { maxHeight: '12em', overflow: 'auto', margin: 0 } })
// an ordinary UI — no agent-specific declarations anywhere
preview.append(
  div(
    input({ placeholder: 'filter stock…', bindValue: harvest.filter }),
    ' ',
    span({ title: 'items in stock', textContent: harvest.total }),
    ' ',
    button('restock', { onClick: 'harvest.restock' }),
    ' ',
    button('describe()', {
      onClick() {
        const d = agent.describe()
        const summary = [
          `exposure: ${d.exposure}`,
          `roots: ${Object.keys(d.roots).join(', ')}`,
          `actions: ${d.actions.join(', ')}`,
          `wired elements: ${d.wiring.length}`,
        ].join('\n')
        out.textContent = summary + '\n\n' + JSON.stringify(d.wiring, null, 2)
      },
    }),
    out
  )
)
```

```test
import {
  elements,
  tosi,
  enableAgentInterface,
  bind,
  bindings,
  updates,
} from 'tosijs'

test('describe() harvests the affordance join from ordinary declarations', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface()
  tosi({ harvestTest: { q: '' } })
  const input = elements.input({ placeholder: 'harvest-test…' })
  preview.append(input)
  bind(input, 'harvestTest.q', bindings.value)
  await updates()
  const d = agent.describe()
  const record = d.wiring.find((w) => w.element.label === 'harvest-test…')
  expect(record != null).toBe(true)
  const binding = record.bindings.find((b) => b.path === 'harvestTest.q')
  expect(binding.writable).toBe(true) // fromDOM ⇒ an input affordance
  input.remove()
})
```

Read what it prints. The input's record joins its human label (the
`placeholder`) to its path (`harvest.filter`) and its direction
(`writable: true`). The total's record is the same shape but `writable: false`.
The restock button's handler is not an anonymous `ƒ` but a *name* —
`harvest.restock` — and the same path appears under `actions`. That is the
affordance descriptor from the table above: harvested, joined, and serialized,
authored by nobody.

