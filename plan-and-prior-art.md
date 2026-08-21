# Plan & Prior Art

<!--{ "parent": "One User Interface", "order": 5, "description": "Phases 0–5, open questions, and the prior-art survey: WebMCP, the window, and the unclaimed tosijs delta." }-->

_Part of [One User Interface](/one-user-interface/) — what shipped, what
remains open, and why the window is real._

> **Where this stands at 1.8.0.** Phases 0–3 **shipped**: the surface, the
> contracts, the drawn map, and the browser bridge (registration _and_
> invocation verified in Chrome Canary; haltija ships a native tier that
> consumes `describe()` directly). Phases 4 and 5 are **not built** — they
> are recorded here as direction, and the pages say so. Every "shipped"
> below happened in a shipping browser or a real test lane, not on paper.
>
> The prior-art survey further down is the part worth reading even if you
> never use the agent surface: it is the only written comparison of the
> WebMCP landscape we know of, and it explains _why_ a framework-native
> map is a different thing from an automation adapter.

## The plan

| phase                     | status                                                                                                                                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — prove it              | ✅ live demos on every page of this family                                                                                                                                                                                                   |
| 1 — the surface           | ✅ shipped in 1.8.0 (`tosijs/agent`)                                                                                                                                                                                                         |
| 2 — manifests + contracts | ✅ shipped — app, component **and** inline element contracts                                                                                                                                                                                 |
| 3 — the bridge            | ✅ shipped — WebMCP auto-registration; registration **and invocation** verified in Chrome Canary 153; haltija ships a native tier. Open: [haltija#16](https://github.com/tonioloewald/haltija/issues/16) bridge design, which 1.8.0 unblocks |
| 4 — distance              | ⬜ not built — design recorded below                                                                                                                                                                                                         |
| 5 — headless embodiment   | ⬜ not built — see [Headless Embodiment](/headless-embodiment/) for what _is_ real                                                                                                                                                           |

- **Phase 0 — prove it (no new code).** A doc-site demo: an "agent panel"
  drives the todo example through raw paths while the reader clicks the same
  UI. Two actors, one state, zero sync. **Done — and split across the family:**
  the proofs live as live examples in the [intro](/one-user-interface/)
  (two actors), [The Derived Surface](/derived-surface/) (describe()), and
  [Headless Embodiment](/headless-embodiment/) (elementsSSR) — the manifesto
  demonstrating its own thesis inline.
- **Phase 1 — the surface (introspection). Built** — `enableAgentInterface()`
  with `describe`/`read`/`write`/`observe`/`call`/`changes`/`when`/`log`,
  the `tosiAgent` global, manifest scoping (declared actions are _callable,
  not writable_), flat geometric records with arrow provenance, plus the
  downstream pure functions (`schematicSVG`/`rasterizeSVG`, `webmcpTools`).
  **Published** as the `tosijs/agent` subpath (the same file as `tosijs`
  with narrower types — a separately-bundled surface would carry its own
  copy of the state registry), marked EXPERIMENTAL like `tosijs/debug`, and
  omitted from the `<script>`/CDN build, which cannot tree-shake. Still open from the original scope:
  preconditions from enabled-bindings and item schemas from list templates
  (both land naturally with Phase 2's contracts).
- **Phase 2 — manifest + contracts.** **Core shipped** (2026-08-03): the
  zero-dependency contract seam (`expose.contract = { check, describe }`),
  `write()` enforcement with audited refusals, `describe().contract`
  ("what's legal"), and **`exerciseContract()`** — contracts carrying
  `examples` / `$counterexamples` are executable specs, the contract
  equivalent of tjs signature tests (see
  [The Agent Surface](/agent-surface/)). The blessed adapter now **ships
  FROM tosijs-schema** (1.5.0's `agentContract(schemas)`, closing
  tosijs-schema#2) — stricter than our hand-rolled original: it fails
  CLOSED on contracted writes without a proposal, and refuses at
  construction any schema keyword `validate` doesn't enforce; our suite
  runs against the published adapter and pins the proposal seam from this
  side (tosijs#25). **ComponentMap
  shipped** (2026-08-03): `static contract` (one word everywhere) = contract
  - description + test fixture + parts map in one declaration;
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
  import) _are_ its prerequisites, and both are already on the roadmap.

Sequencing note: phases 0–1 are cheap and demonstrable now; 2 is where the
`schematic`/2.0 work and this plan become the same work; 3–4 are ecosystem
plays (file, don't fix — designs land as issues on haltija/tjs-lang/lukko);
5 is where the plan and tosijs 2.0 converge entirely.

### The empirical lane: LLM-in-the-loop tests (cross-cutting)

Every legibility claim in this plan — flat records beat nested, arrows beat
booleans, PNG schematic beats screenshot beats SVG source, glance-then-zoom
beats full-dump — is currently an _argument_. All of them are **measurable**:
give a model a task battery (find the affordance for X; which action changes
path Y; complete this flow) against each encoding of the same app (JSON map /
schematic PNG / raw screenshot / a11y tree), and score task success × token
cost × turns. Once tjs makes model calls stupidly easy, this becomes a test
lane like any other — sampled and budgeted rather than per-commit (models are
slow, priced, and flaky), but _regression-shaped_: _a change to `describe()`'s
shape gets a measured delta, not vibes._ The earlier design reviews kept
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
  would make exposure a property of _registration_ — arguably the most
  tosijs-shaped answer of all.
- **Is the map the whole truth?** Time travel, state diffing, and deterministic
  replay come free _if the map is the source of truth for state_. In tosijs the
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
  vs. incidental, and how the schema versions, should be decided _before_ fifty
  tests depend on the accidental shape — much cheaper than after.

## Prior art & the window (surveyed 2026-07-28, **re-surveyed 2026-08-21**)

> **Three and a half weeks moved this a lot.** The transport slot went from
> "shipping in Canary" to *default-on across Shopify storefronts and
> Cloudflare-fronted sites*, and derivation — the thing this plan claimed was
> unclaimed — is now being attempted from three directions at once. The core
> delta survives, but **one of the five claims below had to be restated, not
> just re-dated.** Corrections from this pass are marked ⚠️.

- **WebMCP** (`document.modelContext`): a W3C WebML CG standard from Google +
  Microsoft, announced 2026-02-10; the explainer dates to August 2025 and the
  current Draft Community Group Report to 2026-07-21. ⚠️ Not "Chrome 146
  Canary" any more — it is a **public origin trial in Chrome 149**;
  `navigator.modelContext` is deprecated in Chrome 150 in favour of
  `document.modelContext`, and **Chrome 153** can withdraw a tool without
  cancelling in-flight executions. It remains a page-registers-tools API.
- ⚠️ **Unregistration exists, and we were not asking for it.** The spec's path
  is `registerTool(tool, { signal })` + `controller.abort()`. Our adapter
  probed only for a returned handle and for `unregisterTool`, found neither on
  the one browser that ships WebMCP, and fell back to overwriting tools with
  refusing stubs — pretend revocation where real revocation was available. Now
  supported and feature-probed (`supportsAbortSignal`). **This also cancels the
  upstream issue we were about to file.**
- ⚠️ **Platform auto-exposure arrived, from the platform layer.** Shopify
  switched WebMCP on for every Liquid storefront (Hydrogen in developer
  preview) on **2026-08-05** — catalog, cart, checkout, policy lookup, no
  merchant asked, opt out with `webMcp={false}`. Cloudflare followed on
  **08-06**: any site behind Cloudflare, dashboard toggle, no redeploy. Read
  the mechanism before reading the threat: Cloudflare ships **two pre-defined
  tool packs** (Content Credentials, and a proxy to an existing server-side MCP
  server), and Shopify ships **commerce primitives it already knows**. Neither
  derives anything from *your* application.
- ⚠️ **A declarative HTML API now synthesizes tools from `<form>`s.** Annotate
  with `toolname` / `tooldescription` / `toolparamdescription` and the browser
  builds the tool. Forms only, and annotation is still declaration — but it is
  the first standards-track derivation.
- ⚠️ **`webmcp-core`** (keak-ai): a **build-time Playwright crawler** — BFS the
  site, snapshot the DOM, record network calls, cluster them into tools, emit
  TS/React/HTML/JSON. Works across Next/React/Vue/Svelte/Astro/Shopify. This is
  the closest thing to "derived", and its epistemic position is the point: it
  **reconstructs** intent from rendered output, exactly like a11y-tree
  scraping, only moved to build time. Unannotated forms are guessed at from
  `aria-label` / `<label>` / headings.
- **Framework integrations, still hand-registered per tool:**
  `@mcp-b/react-webmcp` (a hook per tool, Zod schemas by hand);
  GoogleChromeLabs `use-webmcp-tool`. ⚠️ **Angular's function is
  `provideExperimentalWebMcpTools()`**, not `provideWebMcpTools()`, and it is
  experimental across all versions ("APIs are subject to change even outside of
  major versions"). Signal Forms do auto-derive a JSON schema from the form's
  data model — but **per form, on opt-in** via `experimentalWebMcpTool`. Still
  the most interesting prior art, and still scoped to forms.
- **Playwright MCP / Operator / Computer Use / Mariner:** unchanged in kind —
  a11y-tree + vision + synthesized input, impersonating the human user.
  **Scope honesty, unchanged:** their value is working on *arbitrary* sites.
  This plan doesn't do that for free; it makes it unnecessary for apps you
  control. ⚠️ One external datum now argues our side: accessibility surveys in
  2026 report the structure agents depend on **getting worse for the first time
  in six years** — a11y-tree scraping is building on subsiding ground.
- **Phoenix LiveView / Hotwire:** unchanged — real prior art for the inversion,
  but opaque process state, no agent interface, one embodiment.
- **HATEOAS / hypermedia:** unchanged — the philosophical ancestor of
  `describe()`, done for REST twenty years early.
- **llms.txt:** unchanged — static self-description; the agent surface is its
  runtime sibling.

**What remains unclaimed — the tosijs delta, re-checked:**

1. **State, not just tools.** ✅ **Holds, and the spec confirms it.** WebMCP is
   tools-only: no MCP `resources`, no readable/writable state. Its own open
   questions list multimodal I/O, `outputSchema` and service workers — state is
   not on the list. Nobody exposes a path-addressable, writable, observable
   model.
2. ⚠️ **Derived, not declared — RESTATED.** The old wording ("every integration
   hand-registers tools") is now **false**, and shipping it would be an
   own-goal: Shopify and Cloudflare register nothing by hand, the declarative
   API synthesizes from markup, and `webmcp-core` crawls. The honest claim is
   about *where the knowledge comes from*, and it is a sharper claim than the
   one it replaces:
   - platform packs (Shopify, Cloudflare) know **their** domain, not your app;
   - the declarative API and Angular's Signal Forms derive from a **declaration
     you wrote for that purpose** (an attribute, an opt-in flag), and only for
     forms;
   - `webmcp-core` and the a11y-tree agents **reconstruct** intent from
     rendered output — a guess, however good, and one that decays as markup
     does;
   - tosijs **reads records it already holds** because it created the
     bindings. Not a guess, not an annotation, not a pack. Still nobody else's
     claim, because no other mainstream framework has a wiring record to read.
3. **One-truth propagation.** ✅ Holds. An agent write updates the human's UI
   because both observe the same registry. Every integration surveyed routes
   through a tool `execute()` and relies on the author to sync.
4. **Push observation.** ✅ **Holds, and the gap is now documented upstream.**
   The only event in the API is `toolchange` — the *tool list* changed, not the
   *state*. `observe(path)` remains a channel nobody offers.
5. **Embodiment independence.** ✅ Holds. Headless app + vended UI still has no
   equivalent in the agent-web space.

⚠️ **The curb-cut framing itself is no longer novel** — it is now mainstream
(the a11y tree as the thing agents read; a W3C CG document disambiguating
"WAI-ARIA" from "Agent-ARIA"). Claim the **mechanism**, not the metaphor: what
is ours is that the surface is derived from the framework's own records and
therefore **prosecutes** a11y defects rather than absorbing them —
`auditAccessibility` over the same map, and `contract.role`/`description`
materializing as real ARIA. An integration absorbs discrepancies; an intrinsic
surface prosecutes them.

**Strategic consequence (updated).** Targeting WebMCP first was right and is
now clearly right — it is a real origin trial with default-on deployments, not
a proposal. But **the window narrowed**: "derived agent surface" is being
approached from the platform layer, the markup layer and the crawler layer
simultaneously. None of them reach the app's own records, and that is the
defensible ground — so the framing to ship is *derived from what the framework
already knows*, contrasted explicitly against packs, annotations and crawls.
The parts nobody is near — **state, propagation, observation, embodiment** —
are the durable delta, and they are where the next phase should spend.
