# One User Interface
<!--{ "pin": "bottom", "order": 320, "description": "One source of truth for state, UI — and AI. tosijs apps expose a described, observable, path-addressed surface to agents and test harnesses: the same interface humans use, minus the pixels." }-->

*A plan and a manifesto: one source of truth for state, UI — and AI.*

> **Status: working prototype on this branch.** The surface
> (`enableAgentInterface` → `tosiAgent`), the schematic pipeline
> (`schematicSVG` / `rasterizeSVG`), and the WebMCP adapter (`webmcpTools` /
> `webmcpAdapter`) are real, tested code here — every proof on these pages
> runs on them. Nothing is *published* yet; everything is EXPERIMENTAL and
> shapes may still move (see [Plan & Prior Art](/ONE_UI_PLAN/)).

## The thesis

Every application now has (at least) three kinds of user:

1. **Humans**, who see rendered DOM and click on it.
2. **Code**, which reads and mutates application state.
3. **Agents** — LLM-driven browsers, assistants, and automations — which today are
   forced to impersonate user #1: screenshot the page, guess at pixels, forge
   clicks and keystrokes, and hope the framework's synthetic event system deigns
   to notice.

That third user is about to be the norm. And the way the industry serves it —
vision models puppeting a mouse — is a workaround for a self-inflicted wound:
mainstream frameworks trap the application model inside components, hooks,
closures, and stores. There is no address you can ask for. The DOM is a render
artifact that gets rebuilt under you. The *only* interface left standing is the
human one, so agents are stuck cosplaying as humans.

`tosijs` never made that mistake, because the observant model is older than the
problem:

- **State lives in one registry, addressed by paths.**
  `app.cart.items[id=123].qty` is a serializable, human-readable, LLM-friendly
  *string*. No DOM required to name a thing.
- **Writes are legitimate at any entry point.** Assign to a path and every bound
  widget updates surgically — exactly as if the human had done it. No synthetic
  event forgery, no native-setter hacks.
- **The DOM is persistent.** Bindings wire real elements to paths once; nothing
  is rebuilt out from under an observer — human or agent.
- **Observation is push, not poll.** `observe(path, …)` replaces screenshot
  diffing with notifications.

An agent is not a special case. **An agent is just another observer with a
different intelligence behind it.** Human via widgets, agent via paths, code via
either — three users, one interface, zero sync layers. That's the manifesto in
one line: we don't need to *extend* the architecture to serve AI; we need to
*describe* it to AI.

## Proof: two users, one interface (live)

Below, the human side is an ordinary bound tosijs UI. The agent side never
touches the DOM — it uses the EXPERIMENTAL `enableAgentInterface()` surface:
paths, actions, and push observation only. Add items from either side; both
stay in sync because there is nothing to sync — and the observation log shows
the agent being *notified* of your edits (and its own).

```js
import { elements, tosi, enableAgentInterface } from 'tosijs'

const { oneUI } = tosi({
  oneUI: {
    list: [{ id: 1, text: 'try the input →' }],
    addItem(text) {
      if (!text.trim()) return
      oneUI.list.push({ id: Math.random(), text })
    },
  },
})

const agent = enableAgentInterface() // also installs globalThis.tosiAgent
const { div, h4, ul, input, button, pre } = elements

// THE HUMAN SIDE — an ordinary bound UI
preview.append(
  div(
    h4('Human (widgets)'),
    ul(
      ...oneUI.list.listBinding(({ li }, item) => li(item.text), {
        idPath: 'id',
      })
    ),
    input({
      placeholder: 'add an item, hit Enter',
      onKeydown(event) {
        if (event.key === 'Enter') {
          oneUI.addItem(event.target.value)
          event.target.value = ''
        }
      },
    })
  )
)

// THE AGENT SIDE — no DOM access: paths, actions, observation only
const log = pre({ style: { maxHeight: '5em', overflow: 'auto', margin: 0 } })
agent.observe('oneUI', (path) => log.append(`observed: ${path}\n`))
preview.append(
  div(
    h4('Agent (paths only)'),
    button('call("oneUI.addItem", …)', {
      onClick() {
        agent.call('oneUI.addItem', 'added by the agent')
      },
    }),
    ' ',
    button('read("oneUI.list")', {
      onClick() {
        log.append(JSON.stringify(agent.read('oneUI.list')) + '\n')
      },
    }),
    log
  )
)
```

The surface is also installed as a global — so **open the browser console on
this page and you are the second user**: `tosiAgent.describe()`,
`tosiAgent.call('oneUI.addItem', 'from the console')`, `tosiAgent.changes()`.
An agentic browser gets exactly the same deal, with no extension, no vision
model, and no selector-guessing.


## The full argument, in five parts

This page is the thesis and its live proof. The detail lives in five child
documents:

1. **[The Derived Surface](/ONE_UI_DERIVED/)** — the wiring diagram tosijs
   already records, the opportunistic harvest, and `describe()` assembling the
   whole page's affordance graph — live.
2. **[The Agent Surface](/ONE_UI_DESIGN/)** — the launch toggle, the
   protocol-neutral surface, push-and-drain observation, and the exposure
   tiers — where the **schema-declared surface is the product** and the
   automatic map is the discovery tool. Plus ComponentMap.
3. **[Trust & Transports](/ONE_UI_TRUST/)** — the honest section: constraint
   bypass, capability scoping, secrets, prompt injection, audit — and the
   three distances an agent can stand at (in-page, bridged, remote peer).
4. **[Headless Embodiment](/ONE_UI_HEADLESS/)** — the inversion:
   "server-side rendering of an MCP" — the app running as its abstract self,
   vending UI on demand, with `elementsSSR` proven live.
5. **[Plan & Prior Art](/ONE_UI_PLAN/)** — phases 0–5, the open questions,
   and why the window is real (WebMCP is standardizing the transport slot
   *right now*; the core idea remains unclaimed).

---

*The observant model, stated for 2026: the framework watches state and updates
the UI. A human is an observer with eyes. An agent is an observer with a model.
Neither needs a special interface, because there is only one.*

<!-- toc -->
- [The Derived Surface](/ONE_UI_DERIVED/)
- [The Agent Surface](/ONE_UI_DESIGN/)
- [Trust & Transports](/ONE_UI_TRUST/)
- [Headless Embodiment](/ONE_UI_HEADLESS/)
- [Plan & Prior Art](/ONE_UI_PLAN/)
<!-- /toc -->
