# Plan & Prior Art
<!--{ "parent": "One User Interface", "order": 5, "description": "Phases 0–5, open questions, and the prior-art survey: WebMCP, the window, and the unclaimed tosijs delta." }-->

*Part of [One User Interface](/one-user-interface/) — how we get there, what remains open, and why the window is real.*

## The plan

- **Phase 0 — prove it (no new code).** A doc-site demo: an "agent panel"
  drives the todo example through raw paths while the reader clicks the same
  UI. Two actors, one state, zero sync. **Done — and split across the family:**
  the proofs live as live examples in the [intro](/one-user-interface/)
  (two actors), [The Derived Surface](/derived-surface/) (describe()), and
  [Headless Embodiment](/headless-embodiment/) (elementsSSR) — the manifesto
  demonstrating its own thesis inline.
- **Phase 1 — the surface (introspection). Built** — `enableAgentInterface()`
  with `describe`/`read`/`write`/`observe`/`call`/`changes`/`when`/`log`,
  the `tosiAgent` global, manifest scoping (declared actions are *callable,
  not writable*), flat geometric records with arrow provenance, plus the
  downstream pure functions (`schematicSVG`/`rasterizeSVG`, `webmcpTools`).
  Publishing shape TBD: likely a tree-shaken `tosijs/agent` subpath, shipped
  EXPERIMENTAL like `tosijs/debug`. Still open from the original scope:
  preconditions from enabled-bindings and item schemas from list templates
  (both land naturally with Phase 2's contracts).
- **Phase 2 — manifest + contracts.** **Core shipped** (2026-08-03): the
  zero-dependency contract seam (`expose.contract = { check, describe }`),
  `write()` enforcement with audited refusals, `describe().contract`
  ("what's legal"), and **`exerciseContract()`** — contracts carrying
  `examples` / `$counterexamples` are executable specs, the contract
  equivalent of tjs signature tests (see
  [The Agent Surface](/agent-surface/)). The blessed tosijs-schema adapter
  (~10 lines over `validate` + `onError`; `$predicate` strings ride into
  `describe()` as legible preconditions) is proven in tests here and should
  ship FROM tosijs-schema (file, don't fix). **ComponentMap
  shipped** (2026-08-03): `static contract` (one word everywhere) = contract
  + description + test fixture + parts map in one declaration;
  `Component<typeof contract>` types `this.parts` from the declared tags —
  THE DECLARATION IS THE TYPE (classic PartsMap still accepted in the same
  slot); `describe()` harvests own-statics only; `exerciseComponent()`
  executes parts/methods/value-examples AND declared `tests` (serializable
  set/click/expect step scripts, updates()+rAF settled). Shipped tests
  travel with the contract; dev-only tests go to tjs `test {}` blocks
  (stripped) — the native-TJS bridge is a test block calling
  exerciseComponent(). initAttributes subsumption + value-setter enforcement
  BOTH shipped 2026-08-03 (contract.attributes with defaults drives the
  machinery, both-declared throws, nudge-warn toward the ideal; setter
  enforces declared value contracts — native type/enum/const subset +
  pluggable setContractValidator; no contract, no check). Sub-path schema
  routing shipped (2026-08-03): writes at/under a contracted root are judged
  as the whole root they would produce (proposal = clone + hypothetical
  apply; adapters validate roots, core owns paths). Remaining: the AJS
  `$exercise` future. Feeds directly
  into 2.0's `schematic` design rather than duplicating it. **Gate:** state-level validation is a hard prerequisite
  for production `write()` access (see [Trust](/trust-and-transports/)) — until this
  phase lands, production surfaces are read/observe/call-only. `agent.when(path, predicate)`
  — the episodic agent's await-a-condition primitive — **shipped early**
  (2026-08-01): immediate-satisfaction check, audit-logged waits invisible to
  the `changes()` drain, predicate errors reject, `disable()` rejects pending
  waits.
- **Phase 3 — the bridge.** **WebMCP adapter prototype shipped** (2026-08-02):
  `webmcpTools(agent)` generates the tool set pure from `describe()` (core
  quartet + one named tool per action; `tosi_write` dev-gated per Trust);
  `webmcpAdapter()` feature-detects the host and tolerates both registration
  shapes (`registerTool` / `provideContext`) while the spec churns — live
  proof in [The Agent Surface](/agent-surface/). **The real-agent e2e has
  RUN** (2026-08-02): haltija shipped `hj map` with a native `tosi-agent`
  source that returns `describe()` **verbatim** (its own decision — reshaping
  would be the lossy reconstruction the tier exists to avoid), and a live
  session drove this very page through the surface — `call('oneUI.addItem')`
  through a private headless haltija, observers fired, the human-facing list
  rendered the agent's item, the audit log recorded the act. No vision, no
  selectors, no synthesized input. **The WebMCP-host
  registration e2e is CONFIRMED** (2026-08-03, Chrome Canary with the WebMCP
  flags enabled): the live demo detected the host and registered the
  generated tool set — witnessed on the page's own self-report. **And the INVOCATION
  e2e is done** (2026-08-03, later that night): through Chrome Canary 153's
  shipped `document.modelContext` — `getTools()` listed our five (the
  quartet + `tosi_act_mcpDemo_addNote`, derived not authored), and
  `executeTool(tool, input)` ran the derived action through the browser's
  own execution path: state updated, the human-visible list rendered the
  item, the audit log recorded it. Wire contract learned live:
  `executeTool` takes the `RegisteredTool` OBJECT (not a name) and the
  input as a JSON **string**; `inputSchema` round-trips as a string too.
  Our `registerTool` path matched the shipped API exactly. Remaining: only
  the bridge-convergence answers on haltija#16.
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

### The empirical lane: LLM-in-the-loop tests (cross-cutting)

Every legibility claim in this plan — flat records beat nested, arrows beat
booleans, PNG schematic beats screenshot beats SVG source, glance-then-zoom
beats full-dump — is currently an *argument*. All of them are **measurable**:
give a model a task battery (find the affordance for X; which action changes
path Y; complete this flow) against each encoding of the same app (JSON map /
schematic PNG / raw screenshot / a11y tree), and score task success × token
cost × turns. Once tjs makes model calls stupidly easy, this becomes a test
lane like any other — sampled and budgeted rather than per-commit (models are
slow, priced, and flaky), but *regression-shaped*: *a change to `describe()`'s
shape gets a measured delta, not vibes.* The earlier design reviews kept
ending at "the remaining questions are empirical" — this is the lane where
they get answered. It doubles as the marketing evidence: "agents complete
tasks N× more reliably against the map than against pixels" is a claim with a
number in it.

**First number (haltija, 2026-08-02):** on a trivial page JSON wins outright
(an image's fixed cost dominates); on a **60-control app the JSON map is
~1,567 tokens — right at the crossover with an image's ~1,000–1,600 vision
tokens**. Above that density the rasterized schematic wins, exactly the
DeepSeek-OCR curve. So the encoding choice is itself density-dependent, which
the eval lane should treat as a variable, not a constant.

## Open questions

- **Naming — SETTLED (2026-08-01): `tosiAgent`.** Self-describing wins for a
  console-first affordance whose consumers include LLMs; "MCP" stays reserved
  for the adapter that speaks it. **`pöllö`** (the owl) is reserved for the
  **schematic viewer** when it becomes a tool — the owl's-eye view: sees the
  whole territory, in the dark, without rendering it.
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
