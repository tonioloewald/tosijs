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
  const record = d.wiring.find((w) => w.label === 'harvest-test…')
  expect(record != null).toBe(true)
  // the two-way arrow ⟷ marks a user-writable affordance, provenance inline
  expect(String(record.value).includes('⟷ harvestTest.q')).toBe(true)
  input.remove()
})
```

Read what it prints. Records are **flat** — the semantically visible facts sit
at the top level, sized for an LLM to scan. The input's record joins its human
label (the `placeholder`) to its live value and its path in one string:
`value: "⟷ harvest.filter"` — the two-way arrow means *user-writable
affordance*. The total is the same idea, one-way: `text: "3 ⟵ harvest.total"`
(current value, display-only; a plain `text: "restock"` with no arrow is
static). The restock button's handler is not an anonymous `ƒ` but a *name* —
`on: { click: "harvest.restock" }` — and the same path appears under
`actions`. That is the affordance descriptor from the table above: harvested,
joined, and serialized, authored by nobody.

### The map, drawn: a schematic embodiment

If the visual architecture *is* the information architecture, the information
architecture can be **drawn**: one rectangle per wired element, labels and
arrows from the map, laid out by structure rather than by CSS. Not a
screenshot and not a designer's wireframe — the app's *actual* affordance
graph, rendered. Three reasons this is more than a pretty view:

- **Visual token compression.** DeepSeek's OCR work showed text *rendered as
  an image* costs the vision encoder roughly a tenth of the tokens the same
  text costs as text — and a schematic is denser still, because **layout is
  free structure**: containment says nesting, adjacency says order, arrows say
  direction, and none of it spends a token on syntax. For a large app,
  "one PNG of the schematic" may be the cheapest complete overview an agent
  can ingest.
- **The image is an index.** Each rectangle links to its JSON record (below,
  clicking one shows exactly that). An agent — or a human — glances at the
  picture, decides where to act, and fetches only that subtree's precise JSON.
  Glance-then-zoom is how people use UIs; progressive disclosure is how agents
  should read them.
- **Different encodings of one structure teach you different things.** A
  logographic script and braille are both "text", and each reveals properties
  of reading the other conceals. The JSON map, the rendered DOM, and the
  schematic are three encodings of one wiring — diffs that are invisible in
  one are glaring in another (a schematic diff between builds is a regression
  artifact a human can *see*).
- **And it's the demo of the thesis itself.** The claim "your app already
  describes itself to agents" is invisible when the evidence is JSON — and
  *self-evident* when a map of the page draws itself from a page that never
  declared one. The schematic lets humans see the app the way agents see it,
  which makes it the marketing artifact for the whole idea: every tosijs demo
  can end with the reveal.

Here it is live — the same harvest UI as above, then **schematic()** draws the
whole page's map; click any rectangle for its JSON:

```js
import { elements, svgElements, tosi, enableAgentInterface } from 'tosijs'

const { schem } = tosi({
  schem: {
    filter: '',
    stock: 3,
    restock() {
      schem.stock = schem.stock.value + 1
    },
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface()
const { div, input, span, button, pre } = elements
const { svg, rect, text } = svgElements

// an ordinary UI to map
preview.append(
  div(
    input({ placeholder: 'filter stock…', bindValue: schem.filter }),
    ' ',
    span({ title: 'in stock', textContent: schem.stock }),
    ' ',
    button('restock', { onClick: 'schem.restock' })
  )
)

const detail = pre({ style: { maxHeight: '8em', overflow: 'auto', margin: 0 } })
const drawing = div()
const W = 300
const LINE = 14
const PAD = 8
const GAP = 10

preview.append(
  button('schematic()', {
    onClick() {
      const d = agent.describe()
      let y = GAP
      const boxes = d.wiring.map((w) => {
        const facts = Object.entries(w)
          .filter(([k, v]) => typeof v === 'string' && k !== 'tag')
          .map(([k, v]) => `${k}: ${v}`)
        const events = Object.entries(w.on ?? {}).map(
          ([t, h]) => `on ${t} → ${h}`
        )
        const lines = [`<${w.tag}>`, ...facts, ...events]
        const h = lines.length * LINE + PAD * 2
        const box = { w, lines, y, h }
        y += h + GAP
        return box
      })
      drawing.textContent = ''
      drawing.append(
        svg(
          { viewBox: `0 0 ${W + 2 * GAP} ${y}`, width: `${W + 2 * GAP}` },
          ...boxes.map((b) =>
            svgElements.g(
              { style: { cursor: 'pointer' } },
              rect({
                x: `${GAP}`, y: `${b.y}`, width: `${W}`, height: `${b.h}`,
                fill: 'transparent', stroke: 'currentColor', rx: '4',
              }),
              ...b.lines.map((line, i) =>
                text(line.slice(0, 44), {
                  x: `${GAP + PAD}`, y: `${b.y + PAD + (i + 0.85) * LINE}`,
                  'font-size': '11', 'font-family': 'monospace',
                  fill: 'currentColor',
                })
              ),
              // every rectangle links back to its JSON record
              { onClick: () => (detail.textContent = JSON.stringify(b.w, null, 2)) }
            )
          )
        ),
        detail
      )
    },
  }),
  drawing
)
```

The schematic above is ~60 lines of vanilla SVG generation over `describe()`
output — no layout engine, no rendering, no screenshots. **This code and the
thinking belong in haltija too**: a test driver that can draw the schematic of
any page it's driving has a map view humans can check at a glance and a
compressed overview a vision model can ingest — the natural shared artifact
between the agent surface and the test harness (they are, after all, the same
interface).

