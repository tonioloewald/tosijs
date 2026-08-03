# The Derived Surface
<!--{ "parent": "One User Interface", "order": 1, "description": "The wiring diagram tosijs already records, the metadata harvest from element sugar, and describe() assembling the affordance graph — live." }-->

*Part of [One User Interface](/one-user-interface/) — why the agent surface derives from what tosijs already knows.*

Your app already wrote its own agent map — every binding and handler tosijs
records is a line in it. Below: a todo list built the ordinary way, and the
**schematic** — the map, drawn — growing as you add items.

## The map, drawn: a schematic embodiment (live)

One rectangle per wired element, at its **actual position and size**, wearing
the app's own colors (`describe({ styles: true })`) — and since `bounds` is
plain data, a *remote* agent can draw a page nobody is looking at.

Live, here — a todo list this time, because a list's map **changes shape
as you use it**: every item you add is new wired elements, so redraw the
schematic and watch it grow. Scoped **by hierarchy** — `agent.describe({ scope: preview })` walks only
this demo's subtree, so the map is the same whether the example is inline or
maximized. (Spatial scoping — `schematicSVG(map, { within: rect })` — also
exists, but a region includes whatever *overlaps* it, occluded or not; use it
for viewport maps, not app parts.) **whole page()** drops the scope for the
full reveal; click any rectangle for its JSON record:

```js
import {
  elements,
  tosi,
  enableAgentInterface,
  schematicSVG,
  rasterizeSVG,
} from 'tosijs'

const { mapDemo } = tosi({
  mapDemo: {
    newItem: '',
    items: [
      { id: 1, text: 'draw the map', done: true },
      { id: 2, text: 'add more todos', done: false },
    ],
    addItem() {
      const text = mapDemo.newItem.value.trim()
      if (!text) return
      mapDemo.items.push({ id: Math.random(), text, done: false })
      mapDemo.newItem = ''
    },
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface()
const { div, input, button, ul, pre, img } = elements

// an ordinary todo list — each row's checkbox and label are WIRED, so every
// item is part of the map, and the map grows as the list does
preview.append(
  div(
    input({
      placeholder: 'add a todo…',
      bindValue: mapDemo.newItem,
      onKeydown(event) {
        if (event.key === 'Enter') mapDemo.addItem()
      },
    }),
    ' ',
    button('add', { onClick: 'mapDemo.addItem' }),
    ul(
      { style: { maxHeight: '10em', overflow: 'auto', margin: 0 } },
      ...mapDemo.items.listBinding(
        ({ li, input: check, span }, item) =>
          li(check({ type: 'checkbox', bindValue: item.done }), ' ', span(item.text)),
        { idPath: 'id' }
      )
    ),
    button('schematic()', {
      onClick() {
        // scope by HIERARCHY: this demo's subtree, however large it renders
        // (a within-rect is REGIONAL — it includes whatever overlaps it)
        const d = agent.describe({ styles: true, scope: preview })
        drawing.innerHTML = schematicSVG(d)
        fitToDrawing()
        // the image is an index: data-record links each box to its JSON
        drawing.onclick = (event) => {
          const g = event.target.closest('[data-record]')
          if (g) {
            detail.textContent = JSON.stringify(
              d.wiring[Number(g.dataset.record)], null, 2
            )
          }
        }
      },
    }),
    ' ',
    // the vision-encoder form: shipped helpers, map -> SVG string -> PNG
    button('png()', {
      async onClick() {
        const d = agent.describe({ styles: true, scope: preview })
        const blob = await rasterizeSVG(schematicSVG(d), { scale: 2 })
        drawing.innerHTML = ''
        drawing.append(
          img({
            src: URL.createObjectURL(blob),
            alt: 'rasterized schematic',
            style: { maxWidth: '100%' },
          })
        )
      },
    }),
    ' ',
    // the camera: what the USER sees right now, in screen coordinates —
    // pages are designed to be legible in this frame, and so is its map
    button('screen()', {
      onClick() {
        const d = agent.describe({ styles: true, view: 'viewport' })
        drawing.innerHTML = schematicSVG(d)
        fitToDrawing()
        drawing.onclick = (event) => {
          const g = event.target.closest('[data-record]')
          if (g) {
            detail.textContent = JSON.stringify(
              d.wiring[Number(g.dataset.record)], null, 2
            )
          }
        }
      },
    }),
    ' ',
    // and the atlas: the ENTIRE host app — this page, chrome and all —
    // drawn from its own map (best maximized)
    button('whole page()', {
      async onClick(event) {
        // capture AFTER the click's focus/active styling settles, and with
        // the previous drawing cleared — the map should show the page, not
        // the moment of the click
        event.target.blur()
        drawing.innerHTML = ''
        await new Promise((resolve) => setTimeout(resolve, 250))
        const d = agent.describe({ styles: true })
        drawing.innerHTML = schematicSVG(d)
        fitToDrawing()
        drawing.onclick = (event) => {
          const g = event.target.closest('[data-record]')
          if (g) {
            detail.textContent = JSON.stringify(
              d.wiring[Number(g.dataset.record)], null, 2
            )
          }
        }
      },
    })
  )
)

const detail = pre({ style: { maxHeight: '8em', overflow: 'auto', margin: 0 } })
const drawing = div({
  style: { height: '100%', width: 'auto', overflow: 'auto' },
})
// the svg carries explicit width/height (rasterization needs them) — for
// DISPLAY, scale it to the box instead of rendering at natural page size
const fitToDrawing = () => {
  const svg = drawing.querySelector('svg')
  if (svg) {
    svg.setAttribute('width', '100%')
    svg.removeAttribute('height')
  }
}
preview.append(drawing, detail)
```

```test
import { enableAgentInterface, schematicSVG, rasterizeSVG } from 'tosijs'

test('the full pipeline: map -> SVG string -> PNG blob (real browsers only)', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface()
  const svg = schematicSVG(agent.describe({ styles: true }))
  expect(svg.includes('<svg xmlns=')).toBe(true)
  expect(svg.includes('data-record=')).toBe(true)
  // rasterization needs a real rendering engine — the exact capability a
  // unit DOM cannot fake, which is why this lives in the browser tier
  const blob = await rasterizeSVG(svg, { scale: 2 })
  expect(blob.type).toBe('image/png')
  expect(blob.size > 0).toBe(true)
})
```

**SVG vs. bitmap, per consumer.** For an LLM, SVG *source* is the worst
encoding of the three: same information as the JSON plus 2–4× markup overhead,
through the same text channel with the same no-perception problem (models
compute "x:340 is right of x:120"; they don't *see* it — and they're famously
poor at mentally rendering SVG). The division of labor: **JSON for text
reasoning** (minimal, precise), **rasterized PNG for vision encoders** (the
only channel where adjacency/containment/alignment are perceived, and where
the ~10× visual token compression lives — rasterize at 2× so labels land
≥ 12px effective and OCR is near-lossless), **SVG as the master artifact** for
humans and tools (deterministic, diffable, clickable — the index). The helper
this implies: `schematicSVG(description) → string`, a pure DOM-free function
(bounds is plain data, so the headless embodiment can vend its own schematic
and a remote agent can draw a page nobody is viewing), plus a rasterize step —
canvas in-browser, `@resvg/resvg-js` under bun (already a devDep for ePub
covers).

**Why the map beats pixels:**

- **Layout is free structure** — containment says nesting, adjacency says
  order, arrows say direction; none of it spends a token on syntax
  (the DeepSeek-OCR result, applied to UI).
- **The image is an index** — every rectangle links to its JSON record:
  glance at the picture, zoom into the one subtree you need.
- **Three encodings, one wiring** — JSON, DOM, schematic; a diff invisible in
  one is glaring in another (a schematic diff is a regression a human *sees*).
- **It's the demo of the thesis** — a map that draws itself from a page that
  never declared one. Every tosijs demo can end with the reveal.

**The raster economics** (encoders normalize the long edge, so cost is capped
by construction — the budget is *aspect ratio*, not bytes):

| what you rasterize | vision tokens | labels readable? | role |
| --- | --- | --- | --- |
| **viewport render** (`view: 'viewport'`, ≈16:10) | ~700–1100 | **yes** — the frame pages are designed for | **the user's-eye glance** |
| whole page (≈1300×6500) | ~650–800 | no (crushed ~4×) | the atlas — topology + structure |
| region map, ≤3:1 (`scope`/`within`) | ~600–1500 | yes | **the zoom** — full fidelity |
| JSON map, 60-control app (haltija's measurement) | ~1,567 (text) | exact | the reasoning form |

Compression and index are the same design: the glance is cheap *because* the
zoom exists to recover what it discarded.

The schematic above is ~60 lines of vanilla SVG generation over `describe()`
output — no layout engine, no rendering, no screenshots. **This code and the
thinking belong in haltija too**: a test driver that can draw the schematic of
any page it's driving has a map view humans can check at a glance and a
compressed overview a vision model can ingest — the natural shared artifact
between the agent surface and the test harness (they are, after all, the same
interface).



## Proof: the harvest, assembled live

The UI below is built with ordinary element sugar — a labeled filter input
(two-way bound), a read-only total (one-way prop binding), and a button whose
handler is attached *by path*. There is not one agent-specific declaration in
it. Click **describe()** and the affordance graph is assembled on demand — and
because this page runs in introspection mode, the graph is the *whole page's*:
the [two-actors demo](/one-user-interface/), the doc site's own chrome, and the very button you
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

// output as a DIRECT preview child: height 100% is a no-op inline and
// fills the box when the example is maximized
const out = pre({ style: { height: '100%', overflow: 'auto', margin: 0 } })
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
    })
  ),
  out
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
  // geometry rides in the map — in a real browser the input has real bounds
  // (this line is exactly what happy-dom cannot assert: it reports zero-size)
  expect(record.bounds.width > 0).toBe(true)
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
