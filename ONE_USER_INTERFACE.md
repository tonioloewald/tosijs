# One User Interface

*A plan and a manifesto: one source of truth for state, UI — and AI.*

> **Status: design document.** Nothing here is shipped API. Names are provisional
> (see Open Questions). This is the map we intend to build against.

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

## The design: a launch toggle, not a framework

Nothing is exposed by default. The programmer flips a switch at launch:

```
import { enableAgentInterface } from 'tosijs/agent'

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
```

`describe()` is the novel part, and it's assembled from the wiring tosijs
already records — enumerate `BOUND_CLASS`, map each element through
`getElementBindings`, walk the tree probing event wiring, list registry
functions. A sketch of what an agent sees:

```json
{
  "roots": { "app": { "items": "…", "filter": "…" } },
  "wiring": [
    { "element": "input#search", "bind": { "value": "app.filter" } },
    { "element": "ul.results", "list": { "path": "app.items", "idPath": "id" } },
    { "element": "button.add", "on": { "click": "app.addItem" } }
  ],
  "actions": [ { "path": "app.addItem", "params": ["reminder"] } ]
}
```

An agent reading that doesn't need vision, doesn't need to guess selectors, and
doesn't need to forge events. It needs `write('app.filter', 'milk')` and
`call('app.addItem', 'buy milk')` — and the human watching the screen sees the
UI respond, because there is only one interface.

### Exposure tiers (what "or what the programmer explicitly tells it" means)

1. **Off** (default) — nothing. Zero cost, zero surface.
2. **Introspection mode** (dev default when enabled) — everything tosijs knows.
   For development, testing, and agent-assisted debugging. This is also a
   *better haltija/Playwright substrate*: tests that read and write paths
   instead of scraping selectors.
3. **Manifest mode** (production) — only declared roots/actions are visible:
   ```
   enableAgentInterface({
     expose: {
       roots: ['app.cart', 'app.filter'],
       actions: ['app.addItem', 'app.checkout'],
     },
   })
   ```
4. **Contracted mode** — manifest + **tosijs-schema** per root: shapes,
   constraints, computed predicates. Now `write()` validates against the
   contract, and `describe()` tells the agent *what's legal*, not just what
   exists.

## Trust: the honest section

Direct model access is a superpower, and superpowers need governors. Naming the
problems now, with their planned answers:

- **Constraint bypass.** Today `min`/`max`/`required` live in the DOM layer
  (form-validation). An agent writing paths skips them. The fix is the one 2.0
  already wants: **schema at the state layer** (the `schematic` idea —
  schema-first, validated-from-birth state). Contracted mode is its first
  consumer; agent writes become *more* validated than forged clicks, not less.
- **Capability scoping.** "Run agent logic" must not mean "eval in my page."
  **tjs-lang's AJS** — gas-metered sandbox with injected capabilities — is the
  boundary: the sandbox receives a proxy scoped to exposed roots, nothing else.
  No `document`, no `fetch`, no unexposed state. (**lukko**'s
  capability-security work is the same concern from the middleware side; one
  design should serve both.)
- **Secrets and PII.** Introspection mode is a dev tool; production is
  manifest-only, allowlist, never denylist. The registry commonly holds tokens
  and user data — `describe()` must make *not* exposing them the path of least
  resistance.
- **Prompt injection.** An agent's *inputs* (page content, fetched data) can be
  hostile even when its state access is scoped. Scoping limits blast radius —
  an agent that can only touch `app.cart` can't exfiltrate `app.auth` — and the
  audit log makes what happened inspectable. This is a reason *for* the
  path-level interface: "clicked around the DOM" is unauditable; `write()`
  calls are a ledger.
- **Audit.** Every mutation through the surface lands in `agent.log()` — the
  same path-touch stream DevTools consumes. One interface also means one place
  to watch.

## Transports: same surface, three distances

1. **In-page** — the global, for extension content scripts and injected agents.
2. **Bridged** — **haltija** detects the surface on page and exposes it as an
   MCP toolset (`read`/`write`/`observe`/`describe`/`call`), falling back to
   human-style DOM driving on pages without it. MCP is an *adapter here, not
   the core* — protocols come and go; paths are forever.
3. **Remote** — the striking one: **`sync.ts` already makes the agent a peer.**
   `SyncTransport` is pluggable and speaks `{path, value}` deltas with echo
   prevention solved. An MCP server implementing `SyncTransport` joins the
   state graph like any collaborative backend — the agent needn't be in the
   browser at all.

## The inversion: headless embodiment ("server-side rendering of an MCP")

Follow the thesis to its end and the priority flips. If the agent interface is
paths + wiring + actions, then **the DOM was never the application — it was one
projection of it.** So run the projectionless app:

- A tosijs app as a **purely abstract, server-side embodiment**: state, actions,
  bindings-as-declarations, observers — no DOM, no browser. Agents connect to
  it *natively* (the MCP adapter over the same `describe`/`read`/`write`/
  `observe`/`call` surface). It is an application that happens not to be
  currently visible.
- **On demand, it vends a user interface.** When a human shows up, the same app
  definition materializes HTML (prerender + hydrate) and the human joins the
  session the agent was already in — same state, same wiring, same truth.
  Classic SSR renders markup early and bolts interactivity on later; this runs
  the *application* continuously and mints markup lazily. SSR for humans;
  native protocol for agents; one source.

This is less speculative than it sounds, because every load-bearing piece has a
precedent in the stack today:

- **DOM-free core** — tosijs#18 (a state-only entry point; DOM globals are
  currently required at import time) is *exactly* the enabling work. This idea
  is #18's killer app.
- **Vending HTML** — the doc-site system already evaluates components in a
  DOM-shimmed subprocess and emits prerendered, hydrating pages. The machinery
  for "definition → markup on demand" exists; it needs pointing at app state.
- **Session sync** — `share.ts`/`sync.ts` already move `{path, value}` deltas
  between contexts. A human's late-joining browser is just another sync peer of
  the headless app — as is the agent.
- **Wiring without DOM** — bindings are *declared* (`bindValue: app.filter`,
  `onClick: 'app.addItem'`); headlessly, the declarations themselves are the
  wiring graph. `describe()` doesn't need elements to exist — elements are what
  the declarations *become* when a human needs them.

And note what falls out **before any AI enters the picture**: the headless
embodiment is an *intermediate, fully testable version of the application*.
Drive the whole app — state, actions, observers, declared wiring — with no
browser, no DOM shim, no flake: `write('app.filter', 'milk')`,
`call('app.addItem', …)`, assert on `read()` and the observation stream. Today
that seam is exactly where testing is weakest: unit DOMs (happy-dom) lie about
interaction timing and Chromium-only lanes lie about other engines — the
segmented saga (tosijs#21) shipped green through both. A headless embodiment
splits the problem correctly: business logic and interaction *semantics* get
fast, deterministic, DOM-free tests against the real application; real-browser
lanes shrink to testing what they alone can test — the projection. The agent
interface and the test harness turn out to be the same interface, which is the
thesis again: one interface, and a test runner is just one more user.

The endgame framing: **an app is a model plus a set of embodiments.** Browser
DOM for humans present now; prerendered HTML for humans arriving; MCP for
agents; sync peers for other machines — and the test harness, which is an agent
that never gets bored. tosijs is the model and the switchboard.

## The plan

- **Phase 0 — prove it (no new code).** A doc-site demo: an "agent panel"
  drives the todo example through raw paths while the reader clicks the same
  UI. Two actors, one state, zero sync. This page *is* the manifesto's proof.
- **Phase 1 — `tosijs/agent` (introspection).** Export `getElementBindings`;
  build `describe()`/`read`/`write`/`observe`/`call`/`log` over existing
  primitives as an optional subpath (tree-shaken away when unused). The toggle
  and the global. Ship EXPERIMENTAL, like `tosijs/debug`.
- **Phase 2 — manifest + contracts.** The `expose` allowlist; tosijs-schema
  integration for shapes/constraints; `describe()` grows "what's legal."
  Feeds directly into 2.0's `schematic` design rather than duplicating it.
- **Phase 3 — the bridge.** File the haltija design issue (detection, MCP
  adapter, DOM fallback); wire the demo to a real agent end-to-end.
- **Phase 4 — distance.** The `SyncTransport` MCP peer; AJS capability
  sandboxing for agent-submitted logic; lukko alignment.
- **Phase 5 — headless embodiment.** The DOM-free core (tosijs#18) running an
  app server-side as its abstract self; UI vended on demand via the prerender
  pipeline; humans and agents as co-equal session peers. This is the 2.0-era
  horizon — `schematic` (validated-from-birth state) plus #18 (no DOM at
  import) *are* its prerequisites, and both are already on the roadmap.

Sequencing note: phases 0–1 are cheap and demonstrable now; 2 is where the
`schematic`/2.0 work and this plan become the same work; 3–4 are ecosystem
plays (file, don't fix — designs land as issues on haltija/tjs-lang/lukko);
5 is where the plan and tosijs 2.0 converge entirely.

## Open questions

- **Naming.** `tosiModel`, `tosiMCP`, `tosiAgent`, `tosi.agent`? Leaning:
  protocol-neutral core (`tosijs/agent`, global `tosiAgent`), "MCP" reserved
  for the adapter that speaks it. The word "agent" says who it's *for*;
  "model" undersells (it's model + wiring + actions); "MCP" over-commits to a
  protocol.
- **Handler enumeration cost.** Data bindings are enumerable via `BOUND_CLASS`;
  event wiring is per-element (WeakMap probe during a tree walk on
  `describe()`). Fine on demand; if it ever needs to be live, the toggle can
  turn on a ledger — never a cost when disabled.
- **Element identity across the wire.** `describe()` needs stable element
  references for remote agents (in-page gets real elements). Candidates:
  generated selector, instanceId, or path-of-binding as the primary key.
- **`describe()` freshness.** Snapshot vs. live subscription to wiring changes
  (elements mount/unmount constantly in list bindings). Likely: snapshot +
  "wiring changed" notification, not a live graph.
- **Does the manifest belong in `tosi()` itself?** `tosi({...}, { expose })`
  would make exposure a property of *registration* — arguably the most
  tosijs-shaped answer of all.

---

*The observant model, stated for 2026: the framework watches state and updates
the UI. A human is an observer with eyes. An agent is an observer with a model.
Neither needs a special interface, because there is only one.*

## Prior art & the window (surveyed 2026-07-28)

The transport slot is being standardized *right now* — and the core idea remains
unclaimed:

- **WebMCP** (`navigator.modelContext`, migrating to `document`): a W3C WebML CG
  standard from Google + Microsoft, announced 2026-02-10 — pages expose typed,
  callable **tools** to browser agents. Chrome 146 Canary shipped it; spec is
  churning (Chrome 150 deprecates the `navigator` location). This validates the
  manifesto's framing almost verbatim ("the website tells the agent what's
  possible") — but it is a *manual registration API*: every tool is hand-written.
- **Framework integrations, all hand-rolled:** `webmcp-react` / `@mcp-b/react-webmcp`
  (a `useMcpTool` hook per tool, Zod schemas by hand); **Angular v22
  `provideWebMcpTools()`** — the most interesting: Signal Forms auto-become tools
  (validation + submission wired to agent feedback). That's one genuine step
  toward "derive from framework records," scoped to forms only.
- **Playwright MCP / Operator / Computer Use / Mariner:** a11y-tree + vision +
  synthesized input — impersonating the human user, the thing this plan replaces.
- **Phoenix LiveView / Hotwire:** real prior art for the *inversion* (app lives
  server-side, DOM is a projection) — but the model is opaque process state; no
  agent interface, no introspection, one embodiment.
- **HATEOAS / hypermedia:** the philosophical ancestor of `describe()` — the
  interface advertising its own affordances — done for REST, twenty years early.
- **llms.txt:** static self-description for sites (we already ship it); the agent
  surface is its runtime sibling.

**What remains unclaimed — the tosijs delta:**
1. **State, not just tools.** WebMCP exposes callable functions; nobody exposes a
   path-addressable, *writable, observable* model.
2. **Derived, not declared.** Every integration above hand-registers tools.
   tosijs can *generate* the surface from wiring it already records — because no
   other mainstream framework HAS a wiring record to derive from.
3. **One-truth propagation.** An agent write updates the human's UI because both
   are observers of the same registry — everyone else needs the tool author to
   remember to sync.
4. **Push observation.** WebMCP is request/response; `observe(path)` is a
   subscription channel nobody offers.
5. **Embodiment independence.** Headless app + vended UI has no equivalent
   anywhere in the agent-web space.

**Strategic consequence:** Phase 3's first adapter should target **WebMCP**
(`document.modelContext`), not a bespoke bridge — it's the standard slot,
shipping in Chrome, and tosijs can be *the first framework where the WebMCP
tools write themselves*. haltija/MCP remains the second transport (and covers
non-WebMCP browsers). The window is real: announcement→Chrome→framework
integrations took five months; forms-to-tools is already Angular-official. The
full inversion is still on the table — but "derived agent surface" won't stay
unclaimed for long.
