# One User Interface
<!--{ "pin": "bottom", "order": 320, "description": "One source of truth for state, UI — and AI. tosijs apps expose a described, observable, path-addressed surface to agents and test harnesses: the same interface humans use, minus the pixels." }-->

*One source of truth for state, UI — and AI.*

> **Status: shipping in tosijs 1.8.0.** The surface
> (`enableAgentInterface` → `tosiAgent`), the schematic pipeline
> (`schematicSVG` / `rasterizeSVG`, from
> [tosijs-floorplan](https://github.com/tonioloewald/tosijs-floorplan)), the
> contract harnesses and the accessibility audit are real, tested code —
> every proof on these pages runs on the code you can install. They live
> behind `tosijs/agent` (the same file, narrower types), and they are still
> marked **EXPERIMENTAL**: the shapes have survived two producers and a
> nine-lens review, but this is a first release and names may still move.
> `enableAgentInterface()` is **read-only by default** — see
> [Trust & Transports](/trust-and-transports/) for the exposure ladder.

## The thesis, in five claims

Every app now has three kinds of user — **humans** (rendered DOM), **code**
(state), and **agents**, who today are forced to *impersonate humans*:
screenshot, guess, forge clicks. tosijs never needed the workaround:

- **State lives in one registry, addressed by paths** — `app.cart.items[id=123].qty`
  is a serializable, LLM-friendly *string*. No DOM required to name a thing.
- **Writes are legitimate from any entry point** — assign to a path and every
  bound widget updates, exactly as if the human had done it.
- **The DOM is persistent** — bindings wire real elements once; nothing is
  rebuilt out from under an observer, human or agent.
- **Observation is push, not poll** — `observe(path, …)` replaces screenshot
  diffing with notifications.
- Therefore: **an agent is just another observer with a different intelligence
  behind it.** We don't extend the architecture to serve AI — we *describe* it.

**And the description is under oath.** The agent surface couldn't be a
separate package even if we wanted one — it reads the framework's own
records (the registry, the binding metadata, the handler wiring), so when
the map looks wrong, something *real* is wrong: the renderer lied, or the
framework did. There is no adapter layer to absorb the discrepancy, which is
exactly what makes the map an instrument. One truth-test page found defects
in four different strata in a day — a harvest lying about accessible names,
a missing piece of the accessible-name algorithm, a **core binding bug**
that had shipped silently for two minor versions (fixed on npm within
hours of the map looking slightly off), and a coding pattern that needed
writing down. An integration absorbs discrepancies; an intrinsic surface
prosecutes them. The curb cut doesn't just serve the new users — *building
it audits the sidewalk.*

## Proof: two users, one interface (live)

The human side is ordinary bound UI. The agent side never touches the DOM —
paths, actions, and push observation only. Add items from either side: both
stay in sync because **there is nothing to sync**, and the log shows the agent
being notified of your edits.

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
      { style: { maxHeight: '8em', overflow: 'auto', margin: 0 } },
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

// THE AGENT SIDE — no DOM access: paths, actions, observation only.
// The log is a direct preview child so it grows when the example is maximized.
const log = pre({
  style: { height: '100%', minHeight: '5em', overflow: 'auto', margin: 0 },
})
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
    })
  ),
  log
)
```

**Open the console — you are the second user**: `tosiAgent.describe()`,
`tosiAgent.call('oneUI.addItem', 'from the console')`, `tosiAgent.changes()`.
An agentic browser gets the same deal: no extension, no vision, no selectors.


## The full argument, in five parts

This page is the thesis and its live proof. The detail lives in five child
documents:

1. **[The Derived Surface](/derived-surface/)** — the wiring diagram tosijs
   already records, the opportunistic harvest, and `describe()` assembling the
   whole page's affordance graph — live.
2. **[The Agent Surface](/agent-surface/)** — the launch toggle, the
   protocol-neutral surface, push-and-drain observation, and the exposure
   tiers — where the **schema-declared surface is the product** and the
   automatic map is the discovery tool. Plus ComponentMap.
3. **[Trust & Transports](/trust-and-transports/)** — the honest section: constraint
   bypass, capability scoping, secrets, prompt injection, audit — and the
   three distances an agent can stand at (in-page, bridged, remote peer).
4. **[Headless Embodiment](/headless-embodiment/)** — the inversion:
   "server-side rendering of an MCP" — the app running as its abstract self,
   vending UI on demand, with `elementsSSR` proven live.
5. **[Plan & Prior Art](/plan-and-prior-art/)** — phases 0–5, the open questions,
   and why the window is real (WebMCP is standardizing the transport slot
   *right now*; the core idea remains unclaimed).

---

*The observant model, stated for 2026: the framework watches state and updates
the UI. A human is an observer with eyes. An agent is an observer with a model.
Neither needs a special interface, because there is only one.*

<!-- toc -->
- [The Derived Surface](/derived-surface/)
- [The Agent Surface](/agent-surface/)
- [Trust & Transports](/trust-and-transports/)
- [Headless Embodiment](/headless-embodiment/)
- [Plan & Prior Art](/plan-and-prior-art/)
<!-- /toc -->
