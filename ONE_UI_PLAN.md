# Plan & Prior Art
<!--{ "parent": "One User Interface", "order": 5, "description": "Phases 0–5, open questions, and the prior-art survey: WebMCP, the window, and the unclaimed tosijs delta." }-->

*Part of [One User Interface](/ONE_USER_INTERFACE/) — how we get there, what remains open, and why the window is real.*

## The plan

- **Phase 0 — prove it (no new code).** A doc-site demo: an "agent panel"
  drives the todo example through raw paths while the reader clicks the same
  UI. Two actors, one state, zero sync. **Done — and split across the family:**
  the proofs live as live examples in the [intro](/ONE_USER_INTERFACE/)
  (two actors), [The Derived Surface](/ONE_UI_DERIVED/) (describe()), and
  [Headless Embodiment](/ONE_UI_HEADLESS/) (elementsSSR) — the manifesto
  demonstrating its own thesis inline.
- **Phase 1 — `tosijs/agent` (introspection).** Export `getElementBindings`;
  build `describe()`/`read`/`write`/`observe`/`call`/`log`/`changes` over
  existing primitives as an optional subpath (tree-shaken away when unused).
  The toggle and the global. Ship EXPERIMENTAL, like `tosijs/debug`. Scope
  note: `describe()` is not a wiring dump — it is the **joined, typed,
  directional affordance graph** from [The Derived Surface](/ONE_UI_DERIVED/)
  (labels ×
  paths × actions, writability from binding direction, preconditions from
  enabled-bindings, item schemas from list templates).
- **Phase 2 — manifest + contracts.** The `expose` allowlist; tosijs-schema
  integration for shapes/constraints; `describe()` grows "what's legal." This
  is where the hierarchy inverts for real: the declared surface becomes the
  product and introspection is demoted to the discovery tool (see
  [The Agent Surface](/ONE_UI_DESIGN/)). Includes the **ComponentMap** design
  (the component-level contract
  superseding PartsMap). Feeds directly into 2.0's `schematic` design rather
  than duplicating it. **Gate:** state-level validation is a hard prerequisite
  for production `write()` access (see [Trust](/ONE_UI_TRUST/)) — until this
  phase lands, production surfaces are read/observe/call-only. Also here:
  `agent.when(path, predicate)` — the episodic agent's await-a-condition
  primitive (sugar over predicate observers; see
  [The Agent Surface](/ONE_UI_DESIGN/)).
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
- **Is the map the whole truth?** Time travel, state diffing, and deterministic
  replay come free *if the map is the source of truth for state*. In tosijs the
  registry is the norm — but apps can and do hold state in closures the map
  only observes after the fact. Worth stating as a discipline ("state lives in
  the registry") the way zero-trust is stated as one, and worth `describe()`
  being honest about what it can't see.
- **Wake policy for episodic agents.** `when(path, predicate)` answers "sleep
  until the world reaches a named condition," but the general policy question
  remains: which changes justify spending an inference pass? Candidates:
  predicate-gated wake (`when`), coalesced drains on a cadence, priority
  paths declared in the manifest ("wake me for `app.order.*`, batch the
  rest"). Probably all three, declared per subscription.
- **Versioning the contract.** Once haltija tests and agent workflows script
  against the schema'd surface, its shape is a public API. What's contractual
  vs. incidental, and how the schema versions, should be decided *before* fifty
  tests depend on the accidental shape — much cheaper than after.


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
  **Scope honesty:** their actual value proposition is working on *arbitrary*
  sites. This plan doesn't implement that for free — it makes it **unnecessary
  for apps you control**, reading intent from the source instead of
  reconstructing it from a rendered DOM. A different claim, arguably the better
  one — but it's why haltija keeps a DOM-driving fallback for everything that
  isn't tosijs.
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
