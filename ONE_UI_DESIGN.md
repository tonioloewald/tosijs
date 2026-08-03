# The Agent Surface
<!--{ "parent": "One User Interface", "order": 2, "description": "enableAgentInterface(): the protocol-neutral surface, push-and-drain observation, exposure tiers (schema-first), authoring-time declarations, and ComponentMap." }-->

*Part of [One User Interface](/ONE_USER_INTERFACE/) — the design of the surface itself.*

## The design: a launch toggle, not a framework

Nothing is exposed by default. The programmer flips a switch at launch:

```
import { enableAgentInterface } from 'tosijs'
// (a tree-shaken `tosijs/agent` subpath is the likely published shape)

const agent = enableAgentInterface({
  // DEV: expose everything tosijs already knows (introspection mode)
  // PROD: expose exactly what you declare (manifest mode) — see below
})
```

The returned surface (also reachable as a global for injected/extension
contexts) is small and protocol-neutral:

```
agent.describe()            // the app's self-description: state roots, wiring
                            // graph (element ↔ path ↔ handlers), declared
                            // actions, schemas if present
agent.read(path)            // serializable value
agent.write(path, value)    // through the same validation as any other write
agent.observe(path, cb)     // push notifications; returns unsubscribe
agent.call(actionPath, ...) // invoke a declared action (a function in state)
agent.log()                 // the audit trail: every touch since enable
agent.changes(since)        // turn-based drain: final-value-per-path since cursor
agent.when(path, predicate) // await a state condition (see push and drain)
```

`describe()` is the novel part, and it's assembled from the wiring tosijs
already records — enumerate `BOUND_CLASS`, map each element through
`getElementBindings`, walk the tree probing event wiring, list registry
functions. A sketch of what an agent sees:

```json
{
  "roots": { "app": "object" },
  "wiring": [
    { "tag": "input", "label": "search products…", "value": "milk ⟷ app.filter" },
    { "tag": "ul", "list": { "path": "app.items", "idPath": "id" } },
    { "tag": "button", "text": "Add", "on": { "click": "app.addItem" } }
  ],
  "actions": ["app.addItem"]
}
```

Records are deliberately **flat and small**: the semantically visible facts —
tag, label, text, bound props, handlers — sit at the top level; anything
obscure drops one level into `detail`. Bound props carry *value and provenance
in one string*: `"milk ⟷ app.filter"` is the current value, the fact that it's
live, and its address — and the arrow encodes **direction**, `⟷` two-way (a
user-writable affordance) vs `⟵` display-only. A value with no arrow is
static. The tokens are chosen to be unlikely in real data and are exported
(`BOUND_TWO_WAY`, `BOUND_TO_DOM`) for parsers.

An agent reading that doesn't need vision, doesn't need to guess selectors, and
doesn't need to forge events. It needs `write('app.filter', 'milk')` and
`call('app.addItem', 'buy milk')` — and the human watching the screen sees the
UI respond, because there is only one interface.

### Proof: the tools write themselves (live)

WebMCP is the standard slot for exposing **tools** to browser agents — and
every existing integration authors those tools by hand. Below, a tiny app is
built the ordinary way, and `webmcpTools(agent)` **generates** its WebMCP tool
set from the surface: the core quartet plus one *named* tool per action the
registry already holds. If this browser has a WebMCP host
(`document.modelContext` / `navigator.modelContext` — Chrome Canary), the
tools are registered live; otherwise you see exactly what would register.
Note `tosi_write` appears because this page runs in introspection (dev) mode —
in manifest mode it's absent unless explicitly allowed, per
[Trust](/ONE_UI_TRUST/).

```js
import { elements, tosi, enableAgentInterface, webmcpTools, webmcpAdapter } from 'tosijs'

const { mcpDemo } = tosi({
  mcpDemo: {
    notes: ['built the ordinary way'],
    addNote(text) {
      mcpDemo.notes.push(String(text ?? `note ${mcpDemo.notes.length + 1}`))
    },
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface()
const { div, h4, ul, button, pre } = elements

// the app: a list and a button — no agent- or MCP-specific code anywhere
preview.append(
  div(
    h4('An ordinary little app'),
    ul(...mcpDemo.notes.listBinding(({ li }, note) => li(note))),
    button('add note', { onClick: 'mcpDemo.addNote' })
  )
)

// the tool set derives itself; register it if a WebMCP host exists
const registration = webmcpAdapter(agent)
const out = pre({ style: { maxHeight: '14em', overflow: 'auto', margin: 0 } })
out.append(
  registration
    ? `WebMCP host detected — ${registration.tools.length} tools registered live:\n\n`
    : 'No WebMCP host in this browser — the generated set that WOULD register\n(derived from the page, authored by nobody):\n\n'
)
for (const tool of webmcpTools(agent)) {
  out.append(`${tool.name}\n    ${tool.description.slice(0, 72)}…\n`)
}
preview.append(out)
```

```test
import { tosi, enableAgentInterface, webmcpTools, webmcpAdapter } from 'tosijs'

test('the WebMCP tool set derives from the page, and registration round-trips', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface()
  tosi({ mcpFence: { poke() {} } })
  const names = webmcpTools(agent).map((t) => t.name)
  expect(names.includes('tosi_describe')).toBe(true)
  expect(names.includes('tosi_act_mcpFence_poke')).toBe(true) // derived, not authored
  // register against a mock host: every tool lands, unregister reverses
  const registered = []
  const mcp = webmcpAdapter(agent, {
    modelContext: { registerTool: (t) => void registered.push(t.name) },
  })
  expect(mcp.tools.length === registered.length).toBe(true)
})
```

The punchline is the table from [Plan & Prior Art](/ONE_UI_PLAN/) made
runnable: Angular's Signal-Forms-to-tools is the closest anyone else gets, and
it covers forms. Here *every action and every affordance* is a tool candidate,
because the framework already holds the wiring — tosijs can be the first
framework where the WebMCP tools write themselves.

### Observation: push and drain

The subscription channel is the delta nobody else can even feed (see
[Plan & Prior Art](/ONE_UI_PLAN/):
WebMCP is tools-only, blind between calls; MCP has `resources/subscribe` but no
framework can supply it without hand-wired change events per feature). tosijs's
core competency *is* change notification, so agents get it for free — and the
payload is the **path**: tiny, semantic, diffable text. The agent decides
whether it cares *before* spending inference. Compare "something changed,
here's another screenshot."

Agents inherit the exact semantics the UI runs on:

- **Granularity** — exact path, prefix (parent hears children), RegExp, or
  predicate; surgical (`app.cart.total`) or coarse (`app.cart`).
- **Subscribe before the data exists.** Deeply-async-by-default applies to
  agents too: `observe('app.order.confirmation')` *before* initiating checkout —
  the subscription is the choreography, no wait-then-poll.
- **Settled frames.** Touches are async-batched; observers fire per settling
  round. The agent reasons about coherent states, never mid-transaction — the
  property that keeps the DOM from flickering keeps the agent from acting on
  half-applied state.
- **Multi-actor safety.** Human and agent in one session are notified of each
  other's changes; neither operates on a stale snapshot. Races dissolved by
  architecture, not locking.

And because LLM agents are **turn-based**, the surface offers the same touch
stream two ways:

1. **Streaming push** — `agent.observe(path, cb)` — for resident agents
   (in-page, extension, sync peer) that react continuously.
2. **Cursor drain** — `agent.changes(since)` — everything since the agent's
   last turn, **coalesced to final-value-per-path**: `updates()`' settling
   semantics extended across turns. Wake, receive a compact semantic diff of
   the world, reason once, act.
3. **Predicate await** — `agent.when(path, predicate)` — a promise that
   resolves when the state *satisfies a condition*, not when it merely
   changes. This is the episodic agent's missing middle: an agent that
   triggers an async mutation shouldn't drain-and-hope (the update may not
   have landed) or subscribe raw (every touch is a potential — expensive —
   inference wake-up). `await when('app.order.status', s => s === 'confirmed')`
   names the condition the agent is waiting for; inference spends nothing
   until the world actually reaches it. tosijs observers already accept
   predicates, so this is surface sugar over an existing primitive — and the
   named condition lands in the audit log, so *what the agent was waiting
   for* is as inspectable as what it did.

These are the audit log and the observation channel revealed as one stream
consumed two ways — push for the vigilant, drain for the episodic — which also
means observation is inherently auditable. (And `changes(since)` exposed *as a
WebMCP tool* works today within the standard's tools-only constraints — while
doubling as the existence proof that the standard needs a real notification
channel.)

### Exposure tiers (what "or what the programmer explicitly tells it" means)

1. **Off** (default) — nothing. Zero cost, zero surface.
2. **Introspection mode** — everything tosijs knows, **dev-only and explicitly
   unstable**. For exploration, debugging, agent-assisted development, and
   *discovering what belongs in the schema*. Also a better haltija/Playwright
   substrate than selector-scraping — but nothing durable (tests, agent
   workflows) should script against it, because its shape is whatever the
   app's internals happen to be today.
3. **Manifest mode** (production floor) — only declared roots/actions are
   visible:
   ```
   enableAgentInterface({
     expose: {
       roots: ['app.cart', 'app.filter'],
       actions: ['app.addItem', 'app.checkout'],
     },
   })
   ```
4. **Contracted mode** (the product) — manifest + **tosijs-schema** per root:
   shapes, constraints, computed predicates. Now `write()` validates against
   the contract, `describe()` tells the agent *what's legal* rather than what
   exists — and since tosijs-schema already embeds serialized predicates,
   **preconditions ride along free**. **The seam is shipped:**
   `expose.contract = { check(path, value) → true | Error, describe() }` —
   tosijs stays zero-dependency (the core knows a *check*, not a schema
   language); the blessed adapter is ~10 lines over tosijs-schema's
   `validate` (its `onError` messages become the refusal text). Refused
   writes throw the *reason* and land in the audit log as
   `write rejected: …` notes — a refusal is part of the surface, because
   agents self-correct from reasons, not booleans. Free, and crucially **legible**: a bare
   `bindEnabled: app.cart.valid` tells the agent *that* an action is gated
   but not *why* — when the flag is `false` a human infers the reason from
   visual context; an agent hits a causal dead end. A serialized predicate
   is the why: `describe()` can hand over the failing condition itself
   ("cart requires ≥ 3 items"), turning "button disabled" into a
   self-correction plan.

**The tiers are a funnel, not a menu.** An earlier draft of this document led
with "the surface derives for free" and treated declaration as the fallback.
Adversarial review inverted that hierarchy, and the inversion stands: **the
declared, schema-filtered surface is the product; the automatic map is the
discovery tool that makes declaring cheap.** The auto-map is how you find out
what to put in the schema — it should never be what anyone scripts against.
Two reasons, and only one of them is security:

- **Security (the asterisked half).** In a zero-trust app the *write* path adds
  no attack surface — anything the surface can invoke, devtools could already
  invoke. The asterisk is the read path: **the UI exposes what's rendered; the
  automatic map exposes what's resident.** Prefetched data, client-side caches,
  feature flags, records loaded for other views — invisible on screen, all
  greppable in the map. "We never hold client-side data we don't show" is a
  discipline worth stating as a rule rather than assuming, because it's exactly
  the invariant that holds until one convenient cache breaks it. And an
  undeclared `call()` surface is **an RPC endpoint with good documentation** —
  *which handlers are agent-invokable* is a security boundary, not a
  convenience.
- **Hyrum's law (the half that always applies).** UI users tolerate UI change;
  scripts don't. The moment fifty tests and an agent workflow depend on the
  accidental shape of the auto-map, every internal rename is a breaking change
  — refactoring freedom lost over precisely the code you most want to keep
  fluid. You would never promise pixel-stable UI; don't accidentally promise
  structure-stable internals. The schema is the contract: version *it*, and
  refactor freely behind it.

The resolution costs one boolean: expose both, mark the auto-map explicitly
unstable, and keep everything durable on the schema'd view. A bonus falls out:
the schema **doubles as the agent's tool manifest** — filtered map + typed
affordances is essentially MCP tool definitions generated from application
code, and the same contract can be handed to an agent as a plain context
preamble when no protocol is in play. The infrastructure is
transport-agnostic.

### What running both layers buys: adaptation and diagnosis

Two operational advantages fall out of exposing the schema (the promise) and
the auto-map (the actuality) side by side:

- **The adaptation burden shifts from developer to agent.** The auto-map's
  instability is only a liability for *dumb* consumers. A hard-coded test
  script breaks when an internal path renames; an LLM agent just re-reads the
  map on its next turn and proceeds. Declared-but-undurable is precisely the
  contract LLMs are good at consuming — the ephemerality of the map is a
  *feature* for adaptive consumers and a trap only for static ones, which is
  exactly why the durable ones belong on the schema.
- **The diagnostic delta.** An agent that can see both the blueprint and the
  build can *diff them*. An action declared in the schema but reachable from
  no wired element; an input affordance the schema says is writable but whose
  binding is `toDOM`-only; a declared root with no bindings at all — each is
  a structural bug, detected without running anything, by comparing promise
  against actuality. This turns the agent from a blind navigator into a
  structural debugger — a class of introspection that DOM-scraping automation
  cannot express, because it only ever sees the build.

### The contract is a test (shipped: `exerciseContract`)

If a contract carries **example values**, the contract is executable — the
equivalent of tjs-lang's signature tests, one layer up. `exerciseContract(agent)`
reads the declared contract and exercises it **through the real surface**:

- every `examples:` entry (standard JSON Schema keyword) must be *accepted*
  by `write()` **and round-trip** — `read()` must return exactly what was
  written, with faithful (not JSON-normalizing) comparison, so a contract
  whose own spec can't survive the surface (a `Date` in an example, an app
  that mangles writes) is caught, not just values the contract refuses;
- every `$counterexamples:` entry (our convention) must be *refused* — a
  gate that never says no isn't a gate, and the harness proves the no.

State snapshots and restores around each root, and the report is per-trial,
so a lying contract says exactly which claim lied. This is why the
declaration stays true: it isn't a comment, it feeds a harness that breaks
visibly. Future: richer exercise steps as custom properties (`$exercise`)
written in **AJS** — serializable like the schema, executable like a test,
sandboxable like neither `Function` nor `eval` — making the contract file
the entire conformance suite, shippable over the wire.

### Why declaration wins: intent captured at authoring time

The deep reason schema-first works is *when* the declaration happens: at
authoring time, while the purpose is still known. Everything expensive in
software archaeology — comprehension, test-writing, drift detection — is
expensive because intent decayed between writing and reading, and everyone
downstream (maintainer, test suite, agent) has to re-infer it from behavior.
Capturing intent while it's free, in a form that's machine-checkable forever
after, is the same trade tjs makes with types.

And the discipline holds for the same reason types beat docstrings: the
declaration isn't a comment — **it's load-bearing**. Comments rot because
nothing breaks when they lie. A declaration that feeds the map, the tests, and
the agent's context breaks visibly when it lies. That's what keeps it true.

### ComponentMap: one declaration, four consumers

The manifest idea has a component-level counterpart, and it unifies four
things that are today separate (or absent): **the contract** (what `value`,
attributes, and methods are legal), **the description** (what an agent — or a
reader — is told), **the test harness** (the declaration is exercisable), and
**the map of parts to internal elements** (what PartsMap types today). One
`static componentMap`, four consumers — a component that lies about itself
fails tests, not users.

**Shipped (the additive slice):**

    class Counter extends Component {
      static componentMap: ComponentMap = {
        description: 'a counter with a labeled readout and a reset',
        value: { type: 'number', examples: [0, 42] },
        methods: { reset: { description: 'set the count back to zero' } },
        parts: { readout: 'span', increment: 'button' },
      }
      …
    }

- `describe()` harvests it: any wired instance's record carries
  `component: <the map>` — the element doesn't just *have* affordances, it
  **describes** them, per class, once.
- `exerciseComponent(el)` executes it: every declared part must resolve
  *inside the instance* (via the saga-hardened parts proxy — ownership-
  correct, where a bare querySelector could false-positive on a nested
  component's same-named part) and match its declared tag; every declared
  method must exist; every `value` example must round-trip faithfully. The
  component equivalent of a signature test.

**Not yet (core-API reshaping — decide before building):** superseding the
`PartsMap` generic (so `this.parts.readout` is *typed by* the map — the
declaration becomes the type); subsuming `initAttributes` (attribute schemas
with defaults replacing type-inferred defaults); and enforcing the `value`
contract in the value setter (needs a validation hook in core, and should
share the app-level contract seam). Shadow components stay agent-shaped
(the value is the interface; the internals are private) — ComponentMap is how
a component *says so in a checkable form*.

