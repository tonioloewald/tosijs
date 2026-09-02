/*{ "parent": "utilities", "description": "EXPERIMENTAL agent interface: expose a tosijs app's state, wiring, and actions to AI agents (and test harnesses) as a described, observable, path-addressed surface." }*/
/*#
# agent (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

    import { enableAgentInterface } from 'tosijs'

    const agent = enableAgentInterface() // READ-ONLY introspection (the default)

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read('app.filter')  // serializable value
    agent.observe('app.cart', (path) => { ... }) // push; returns un-observe
    agent.changes(cursor)     // turn-based drain: final value per changed path
    await agent.when('app.order.status', (s) => s === 'confirmed') // await a condition
    agent.log()               // the audit trail

The verbs that CHANGE things need consent, so they are not in that list —
`write()` and `call()` refuse on the default surface and say how to enable
them. Declare a manifest (below), or `expose: 'all'` while developing:

    const dev = enableAgentInterface({ expose: 'all' })
    dev.write('app.filter', 'milk') // through the same observers as any write
    dev.call('app.addItem', 'buy milk')          // invoke an action by path

In production, expose only what you declare:

    enableAgentInterface({
      expose: {
        roots: ['app.cart', 'app.filter'],
        actions: ['app.addItem', 'app.checkout'],
        write: true, // omit for scoped reads with no writes
      },
    })

A manifest scopes **sight**, not reach: `roots` says what may be seen,
`write: true` is a separate grant to change it, and declared `actions` stay
callable either way. `describe().writable` reports which you have.

One call is the whole story: where the browser provides a WebMCP host
(`document.modelContext`), `enableAgentInterface()` also registers the
generated tool set automatically — `agent.webmcp` is the receipt, and
`webmcp: false` opts out. No host, no-op.

> **🚧 CONTRACTS ARE IN FLUX.** `ComponentMap` / `static contract` /
> `expose.contract` will change shape without a deprecation cycle while the
> layering questions settle (tosijs#29, #30) — how `contract.attributes` and
> `initAttributes` divide the work, and whether an integrator's overlay may
> embellish a component's own declaration rather than replace it. Changes land
> in patch and minor releases and are called out in the CHANGELOG. For stable
> attribute declaration today, use `static initAttributes`; since 1.8.1 it is
> described to agents identically.
>
> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it; the WebMCP
> auto-registration is a convenience over that adapter, not a dependency.
*/
import { registry } from './registry'
import { version } from './version'
import { settings } from './settings'
import { observe, unobserve, extendsPath, Listener } from './path-listener'
import { getByPath, setByPath } from './by-path'
import { xin } from './xin'
import {
  BOUND_CLASS,
  getElementBindings,
  elementToHandlers,
  elementContract,
  anyInlineContracts,
  tosiValue,
  tosiPath,
  getArrayIdPaths,
} from './metadata'
import { contractViolation, ownContract } from './contract-check'
import { bindings } from './bindings'
import { propBindingKey } from './elements'
import { webmcpAdapter, WebMCPAdapterOptions } from './webmcp'

/**
 * The contract seam — tosijs stays zero-dependency, so the core doesn't know
 * any schema language; it knows a CHECK. The blessed adapter is a few lines
 * over tosijs-schema (`validate` on write, schemas into `describe()`), but
 * anything that can say "no, and here's why" fits.
 */
/**
 * **What a contract gates, and what it does not.** A contract is checked at
 * two boundaries: `agent.write()` (a non-human actor writing into your app)
 * and a Component's `value` setter. It is deliberately NOT a registry-wide
 * invariant — `share()`, `sync()` and `hotReload()` write straight to state.
 *
 * That is a trust boundary, not a gap: `share()` peers are same-origin by
 * construction (anything that can post to that channel can already assign
 * to `xin` directly), a `SyncTransport` is chosen and wired by the app
 * itself, and `hotReload()` restores what the same app wrote. Validation
 * would add ceremony, not safety. Those writes remain **auditable** — the
 * agent ledger observes every touch in scope.
 *
 * The case that MAY warrant enforcement is version skew (a peer or server
 * ahead of this client pushing a shape it doesn't expect); that is planned
 * as an opt-in on those APIs rather than a default, because refusing an
 * inbound delta leaves the receiver stuck rather than merely inconsistent.
 */
export interface AgentContract {
  /**
   * Validate a write at `path`; `true`, or an Error saying WHY (the refusal
   * is part of the surface — agents self-correct from reasons, not booleans).
   *
   * When the write lands at or under a contracted root (a key of
   * `describe()`), core supplies `proposal`: the root path and the
   * HYPOTHETICAL value of that whole root after this write. Validate the
   * proposal, not the leaf — sub-path writes then bypass nothing, and
   * root-level cross-field constraints and $predicates see every edit in
   * full context (a write to `app.docs[2].editor.value` is judged as the
   * docs array it would produce).
   */
  check: (
    path: string,
    value: any,
    proposal?: { root: string; proposed: any }
  ) => true | Error
  /** serializable per-root contract (JSON-Schema-shaped, by convention) —
   * lands in describe().contract: "what's legal", not just what exists.
   * Its KEYS also tell core which roots are contracted (read once at
   * enable time) so proposals can be routed. */
  describe?: () => Record<string, any>
}

/**
 * A component's self-declaration: contract, description, part map, and test
 * fixture in ONE structure. Declared as `static contract` on a Component
 * subclass (one word everywhere: the app manifest takes `expose.contract`,
 * the component declares `static contract`); harvested by describe() for any
 * wired instance; exercised by `exerciseComponent()` — a declaration that
 * feeds the map, the agent, and the harness breaks visibly when it lies.
 *
 * Declared tests here are SHIPPED, serializable claims (an agent can
 * self-verify a component wherever it mounts). Dev-only tests belong in tjs
 * `test {}` blocks instead (stripped from bundles) — and once components go
 * native-TJS, the bridge is a test block that calls exerciseComponent().
 */
/**
 * One step of a declared component test — PURE DATA, deliberately: today the
 * runner is exerciseComponent, tomorrow the same steps can be authored in
 * AJS, shipped over the wire, and replayed anywhere the component mounts.
 */
export interface ComponentTestStep {
  /** assign properties on the instance, e.g. { value: 3 } */
  set?: Record<string, any>
  /** click a declared part by name */
  click?: string
  /** assertions: value (faithful deep-equal) and/or per-part textContent */
  expect?: { value?: any; text?: Record<string, string> }
}

export interface ComponentMap {
  /** one line for humans and agents alike. Materializes as
   * `aria-description` — a description is NOT a name, and stamping it as
   * one made components announce developer prose instead of their content. */
  description?: string
  /** the ARIA role this component plays (`'button'`, `'tablist'`, …).
   * Materializes as the `role` attribute unless the author set one — which
   * fixes the audit's `missing-role` finding from the same declaration that
   * feeds the map, the types and the tests. */
  role?: string
  /** the value contract (JSON-Schema-shaped; examples/$counterexamples make
   * it executable — see exerciseComponent) */
  value?: Record<string, any>
  /** attribute contracts by attribute name (JSON-Schema-shaped) */
  attributes?: Record<string, Record<string, any>>
  /** methods the component exposes, by name */
  methods?: Record<string, { description?: string }>
  /** declared parts: part name → expected tag (lowercase). When the class is
   * declared `Component<typeof map>` (map `as const`), these tags TYPE
   * `this.parts` — the declaration is the type. */
  parts?: Record<string, string>
  /** named behavioral tests as serializable step scripts — run by
   * exerciseComponent, declared beside the behavior they pin. An ARRAY, on
   * purpose: execution order should be explicit in a serializable contract
   * (JS objects reorder integer-like keys, and other languages' maps promise
   * nothing) — and each test still snapshot/restores, so order-independence
   * remains the goal, just not a load-bearing assumption. */
  tests?: Array<{ name: string; steps: ComponentTestStep[] }>
}

export interface AgentExpose {
  roots?: string[]
  actions?: string[]
  contract?: AgentContract
  /**
   * Allow `write()` into the declared roots. **Defaults to false** — a
   * manifest scopes what may be SEEN; changing the world is a separate,
   * explicit grant.
   *
   * The 1.8.0 security pass found the two reachable postures were
   * unscoped-read and scoped-read-*plus-write*: narrowing reads with
   * `roots` simultaneously made those roots writable, so the safest-sounding
   * option was the one that granted the most. There was no way to say
   * "scoped reads, no writes" — the posture a production surface most often
   * wants. This flag is that posture's other half; `expose: 'all'` still
   * grants everything at once.
   *
   * Declared `actions` remain callable without it: `call()` invokes what the
   * app chose to publish, `write()` assigns arbitrary values into state.
   */
  write?: boolean
}

export interface AgentInterfaceOptions {
  /**
   * What this surface may touch. Omit for **read-only introspection**
   * (describe/read/observe/changes/when/log over everything; write and call
   * refuse). Pass a manifest — `{ roots, actions, contract }` — for the
   * production shape. Pass the literal `'all'` to get full read/write/call
   * over the whole registry, deliberately and with a warning.
   */
  expose?: AgentExpose | 'all'
  /**
   * POST-HOC component contracts, by tag name — for lofting components whose
   * classes you don't control (a legacy app, a library's widgets, the doc
   * system itself). A class's OWN `static contract` always wins; these fill
   * the gaps. Works in ANY mode: the whole surface can be attached from
   * outside the app — a console, a userscript, an extension — and with this,
   * so can the component-level self-descriptions.
   */
  components?: Record<string, ComponentMap>
  /** install as globalThis.tosiAgent (default true); pass a string to rename */
  global?: boolean | string
  /**
   * Auto-register the generated WebMCP tool set when the browser provides a
   * model-context host (default true — a no-op where no host exists). Pass
   * adapter options to configure, or `false` to keep the surface off the
   * browser's tool registry. NOTE: per-action tools snapshot the surface at
   * enable time — enable AFTER the UI is wired (re-enabling reconfigures).
   */
  webmcp?: boolean | WebMCPAdapterOptions
  /** audit-ledger cap (default 10,000 entries). The ledger records every
   * settled touch and surfaces are meant to be enabled once and left, so
   * it is a ring buffer; `changes()` reports `truncated: true` if a drain
   * spans dropped entries. */
  maxLog?: number
}

/**
 * Provenance tokens for bound properties in describe() output. A bound prop
 * reads `"<current value> <arrow> <path>"` — the arrow both marks the value
 * as live and carries its direction:
 *   ⟵  state flows to the DOM only (display)
 *   ⟷  two-way (fromDOM present — a user-writable affordance)
 * Chosen as tokens unlikely to occur in real values; parsers should split on
 * ` ⟷ ` / ` ⟵ ` (spaces included). A plain value with no arrow is static.
 */
export const BOUND_TO_DOM = '⟵'
export const BOUND_TWO_WAY = '⟷'

/**
 * One wired element, flat: semantically visible facts (tag, label, text,
 * bound props, handlers) at the top; anything that can't be expressed flat
 * drops one level into `detail`.
 */
export interface AgentWiringRecord {
  tag: string
  id?: string
  part?: string
  role?: string
  /** harvested from aria-label(ledby) / title / alt — the accessible NAME */
  label?: string
  /** the placeholder hint, kept distinct from label: an empty input with a
   * placeholder must never read as an input with content */
  placeholder?: string
  /** input kind when it isn't plain text (checkbox, radio, range, …) */
  type?: string
  /** live checked state for checkboxes and radios — DOM truth at map time */
  checked?: boolean
  /** this control holds a secret (password / one-time code): its VALUE is
   * never emitted, only the fact that it exists and what it's bound to */
  secret?: boolean
  /** this element holds keyboard focus right now — where the user IS */
  focused?: boolean
  /** resolved aria-describedby text — the author's own explanation */
  description?: string
  /** present and true when the affordance is currently disabled */
  disabled?: boolean
  /** present and true when the field is required */
  required?: boolean
  /** present and true when the control's live ValidityState says invalid
   * (or aria-invalid is set) — the map reads what :invalid styles */
  invalid?: boolean
  /** a link's destination — "says X" is not "goes to Y". Links are
   * intrinsic affordances: enumerated even when nothing else wires them;
   * the renderer captions nameless links by their href and always carries
   * href in the legend (URLs are the facts most often too long to draw) */
  href?: string
  /** contenteditable: surfaces AS an input field. What matters to an agent
   * is that the region EXISTS and which path feeds it — it will read and
   * write the bound state directly, not synthesize keystrokes — so the
   * record leads with existence + bindings (live text as value,
   * aria-placeholder as hint), mapped even before bindings attach */
  contentEditable?: boolean
  /** textContent — static ("foo") or bound ("foo ⟵ path") */
  text?: string
  /** event handlers by type — a path string when nameable, 'ƒ' when anonymous */
  on?: Record<string, string | string[]>
  /** a list binding rendering a collection */
  list?: { path: string; idPath?: string }
  /** the component's own self-declaration, when its class carries a
   * `static componentMap` — the element doesn't just have affordances, it
   * DESCRIBES them */
  component?: ComponentMap
  /** inline contract declared where the element was built
   * (`input({ bindValue, contract })`) — JSON-Schema-shaped; also aggregated
   * into describe().contract under the element's bound path */
  contract?: Record<string, any>
  /** page-relative geometry — the layout IS part of the semantics; zero-size
   * means "not currently visible", which is itself information */
  bounds?: { x: number; y: number; width: number; height: number }
  /** the element rides the VIEWPORT (fixed/sticky ancestry): bounds are
   * viewport coordinates, not page coordinates — screen furniture has no
   * stable page position */
  viewportFixed?: boolean
  /** structure, not affordance: headings, landmarks, and the containers of
   * wired elements — the page's information architecture, mappable and
   * filterable */
  structural?: boolean
  /** computed colors, harvested when describe({ styles: true }) */
  style?: { background: string; borderColor: string; color: string }
  /** bindings that couldn't be named as a flat prop */
  detail?: Array<{ path: string; readable: boolean; writable: boolean }>
  /** named bound props (value, checked, disabled, …): "value ⟷ path" strings */
  [boundProp: string]: unknown
}

/** the interrogable identity of an agent surface (tosijs#23) */
export interface AgentSurfaceVersion {
  /** shape-contract version — bump when describe()'s shape changes */
  surface: string
  /** the tosijs version that produced this surface */
  tosijs: string
  /** enumerable feature names — test membership, don't infer from semver */
  capabilities: string[]
}

/**
 * The SHAPE contract version. Bump on any change a consumer reading
 * describe() could notice: renamed/removed record fields, changed
 * provenance tokens, changed nesting. Additive optional fields do NOT
 * require a bump (they can't break a reader) — but DO add a capability.
 */
export const AGENT_SURFACE_VERSION = '1.0.0'

/**
 * Capabilities of this build's surface. A consumer asks
 * `agent.version.capabilities.includes('bounds')` rather than inferring
 * from a version number — the whole point of tosijs#23.
 */
export const AGENT_CAPABILITIES = [
  'describe', // the affordance map
  'read',
  'write',
  'observe',
  'call',
  'changes', // turn-based drain with a cursor
  'when', // await a state condition
  'log', // the audit ledger
  'bounds', // per-record geometry
  'styles', // describe({ styles: true }) computed colors
  'scope', // describe({ scope: element }) hierarchy scoping
  'viewport', // describe({ view: 'viewport' }) camera mode
  'structure', // the structural tier (headings/landmarks/containers)
  'aria', // resolved accessible names, describedby, disabled/required
  'validity', // live ValidityState + required as record facts
  'contract', // declared contracts in describe().contract
  'components', // per-component self-declaration (ComponentMap)
  'webmcp', // generated WebMCP tool set (auto-registered where hosted)
] as const

export interface AgentDescription {
  /** the surface's identity — travels WITH the map, so a serialized
   * description is self-describing wherever it lands (tosijs#23) */
  version: AgentSurfaceVersion
  roots: Record<string, string>
  wiring: AgentWiringRecord[]
  actions: string[]
  /** 'read-only' (the default: look, don't touch), 'introspection'
   * (expose: 'all' — everything, deliberately), or 'manifest' */
  exposure: 'read-only' | 'introspection' | 'manifest'
  /** whether `write()` can land at all. Orthogonal to `exposure`, because a
   * manifest scopes what may be SEEN: `expose: { roots }` is readable but
   * not writable until it says `write: true`. Read this rather than
   * inferring writability from the posture name. */
  writable: boolean
  /** what's LEGAL, per root — present when the manifest declares a contract */
  contract?: Record<string, any>
}

export interface AgentChange {
  path: string
  value: any
}

export interface AgentLogEntry {
  seq: number
  path: string
  /** synthetic audit notes (e.g. when() arming/resolution) — not state touches */
  note?: string
}

export interface AgentInterface {
  /**
   * `scope` limits the wiring walk to one element's SUBTREE — hierarchy
   * scoping ("this part of the app"), stable regardless of how big the
   * subtree renders. Contrast schematicSVG's `within` rect, which is
   * REGIONAL ("this area of the page") and includes whatever overlaps it.
   */
  describe: (options?: {
    styles?: boolean
    scope?: Element
    /** include the structural tier (headings/landmarks/containers) —
     * default true; pass false for affordances only */
    structure?: boolean
    /** 'page' (default): every record, true unrolled-document coordinates —
     * the atlas. 'viewport': only what is VISIBLE right now, in screen
     * coordinates — the camera. Users see the viewport; pages are designed
     * to be legible in that frame, and so is its map. */
    view?: 'page' | 'viewport'
  }) => AgentDescription
  read: (path: string) => any
  write: (path: string, value: any) => void
  observe: (path: string, callback: (path: string) => void) => () => void
  call: (actionPath: string, ...args: any[]) => any
  changes: (since?: number) => {
    cursor: number
    changes: AgentChange[]
    /** present and true when the drain reached past entries the ring
     * buffer had already dropped — you did not see everything */
    truncated?: boolean
  }
  /**
   * Await a state CONDITION, not a change: resolves (with the satisfying
   * value) as soon as the value at `path` satisfies `predicate` — immediately
   * if it already does. The episodic agent's missing middle: name the world
   * you're waiting for and spend no inference until it arrives. The wait is
   * audit-logged. No built-in timeout — Promise.race one in if you need it.
   */
  when: (path: string, predicate: (value: any) => boolean) => Promise<any>
  log: () => AgentLogEntry[]
  disable: () => void
  /**
   * What this surface IS, so consumers can ask instead of assume
   * (tosijs#23, raised by haltija after a shape mismatch rendered a
   * confident blank).
   *
   * - `surface` — the SHAPE contract version, bumped when the record/map
   *   shape changes in a way a consumer could notice. Independent of the
   *   library version: shape stability is the thing being promised.
   * - `tosijs` — the library version, for provenance.
   * - `capabilities` — enumerable feature names. Test membership rather
   *   than inferring from a version number.
   */
  version: AgentSurfaceVersion
  /** names of the WebMCP tools auto-registered at enable time — set only
   * when a model-context host was present (feature-detect by presence) */
  webmcp?: { tools: string[] }
}

// a path is "under" a root if it IS the root or extends it by a segment
// (the segment-boundary rule lives in path-listener as extendsPath — one
// helper, every site. A second implementation here would be a second thing
// to keep true, and this one guards what a production manifest may read
// and write.)

// values leave the surface as plain serializable data — proxies unwrapped,
// functions elided (they are actions, addressed by path, not data)
const serialize = (value: any): any => {
  const raw = tosiValue(value)
  if (raw === undefined || typeof raw === 'function') return undefined
  try {
    return JSON.parse(JSON.stringify(raw))
  } catch (_e) {
    return undefined
  }
}

// measure an element in TRUE DOCUMENT coordinates: accumulate every
// ancestor's scroll (apps commonly scroll an inner container, not the
// window; the walk reaches <html>, whose scrollTop IS the window scroll).
// Fixed/sticky elements ride the viewport: they keep viewport coordinates
// and are flagged, because screen furniture has no stable page position.
const measureBounds = (
  el: Element,
  viewportView = false
): {
  bounds: NonNullable<AgentWiringRecord['bounds']>
  fixed: boolean
} | null => {
  const rect = (el as HTMLElement).getBoundingClientRect?.()
  if (rect == null) return null
  if (viewportView) {
    // the camera: screen coordinates, and only what the screen shows
    const vw = (globalThis as any).innerWidth ?? 0
    const vh = (globalThis as any).innerHeight ?? 0
    const onScreen =
      rect.x < vw &&
      rect.y < vh &&
      rect.x + rect.width > 0 &&
      rect.y + rect.height > 0
    if (!onScreen) return null
    return {
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      fixed: false, // everything is viewport-anchored in this view
    }
  }
  let fixed = false
  if (typeof (globalThis as any).getComputedStyle === 'function') {
    let probe: Element | null = el
    for (let hop = 0; probe != null && hop < 12; hop++) {
      const position = (globalThis as any).getComputedStyle(probe).position
      if (position === 'fixed' || position === 'sticky') {
        fixed = true
        break
      }
      probe = probe.parentElement
    }
  }
  let scrollX = 0
  let scrollY = 0
  if (!fixed) {
    let ancestor: Element | null = el.parentElement
    while (ancestor != null) {
      scrollX += (ancestor as HTMLElement).scrollLeft ?? 0
      scrollY += (ancestor as HTMLElement).scrollTop ?? 0
      ancestor = ancestor.parentElement
    }
  }
  return {
    bounds: {
      x: Math.round(rect.x + scrollX),
      y: Math.round(rect.y + scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    fixed,
  }
}

// the join: the element's own semantic self-description, harvested from
// attributes the developer wrote for humans and a11y
const referencedText = (el: Element, attr: string): string | null => {
  const ids = el.getAttribute(attr)
  if (!ids) return null
  const text = ids
    .split(/\s+/)
    .map((id) => el.ownerDocument?.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(' ')
  return text || null
}

// a form control's <label> — wrapping, or associated via for="id" — names
// it, exactly as the accessible-name algorithm says (the kitchen-sink
// lesson: real HTML names controls with <label>, not aria-label)
const associatedLabel = (el: Element): string | undefined => {
  const tag = el.tagName
  if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') {
    return undefined
  }
  let labelEl: Element | null = el.closest?.('label') ?? null
  if (labelEl == null && el.id) {
    // an id is author data, and it was interpolated RAW into a selector: one
    // element with a `"` or `]` in its id threw, and because describeElement
    // is called bare, the exception blinded the entire map — describe(), the
    // audit and the schematic all went dark at once (SEC-10)
    const escaped = (globalThis as any).CSS?.escape
      ? (globalThis as any).CSS.escape(el.id)
      : el.id.replace(/["\\\]]/g, '\\$&')
    try {
      labelEl =
        el.ownerDocument?.querySelector?.(`label[for="${escaped}"]`) ?? null
    } catch (_e) {
      labelEl = null // a shim without CSS.escape and an exotic id: no label
    }
  }
  const text = labelEl?.textContent?.trim().slice(0, 60)
  return text || undefined
}

/**
 * Paths bound to a secret-bearing control. SECRECY IS A PROPERTY OF THE
 * PATH, not of a DOM record: `describe()` redacting a password field while
 * `read('app.login.password')` returns the cleartext is not redaction, it
 * is a speed bump — and the map publishes the very path to ask for. Learned
 * the hard way in the 1.8.0 security pass.
 *
 * Consulted by read / changes / when. It only ever grows: a path that was
 * once bound to a password field stays secret for the session, because the
 * alternative is a window where it isn't. (Over-redaction is the safe
 * direction; under-redaction is a leak.)
 */
const secretPaths = new Set<string>()

/*
 * FAIL CLOSED ON A SPELLING WE CANNOT RESOLVE.
 *
 * Matching is a string-prefix test, so `rows[id=r1].pw` has no prefix relation
 * to `rows[0].pw` even though they name the same value. That is not only an
 * agent constructing an odd query — tosijs's OWN id-path synthesis records
 * both spellings on an ordinary write, and `changes()` handed them over side
 * by side:
 *
 *   [{path:'rows[0].pw', value:'rotated'}, {path:'rows[id=r1].pw', value:'⟨secret⟩'}]
 *
 * The agent constructed nothing. A manifest does not contain it either — the
 * aliased path is INSIDE the declared root, and declaring the manifest is what
 * turns `read`/`changes` on in the first place.
 *
 * Full canonicalisation (resolve the index against live state, rewrite to the
 * id spelling) is the right fix and is tracked in tosijs#32. This is the
 * containment that can ship safely today: if a path indexes into an array that
 * has BOTH a registered idPath and some registered secret beneath it, then it
 * is an alias of a path we cannot cheaply resolve — so treat it as secret.
 *
 * Deliberately OVER-redacts (a non-secret sibling read by index is withheld
 * too). That is the correct direction for a redaction predicate, and it is
 * bounded to arrays that are both id-path-registered and actually carry a
 * secret. Anything that throws in here must also mean "secret".
 */
// NOTE the required trailing separator: this must match `rows[0].pw` (a path
// that could ALIAS a secret leaf) and NOT bare `rows[0]` (a row, which is an
// ANCESTOR of the secret and belongs to redactWithin's descent). Without it
// the rule blanket-redacted whole rows and `read('rows')` returned
// ['⟨secret⟩'] instead of the row with one field withheld — destroying the
// map's usefulness to buy nothing, since the descent already covers it.
const INDEX_SEGMENT = /^(.*?)(?:\[(\d+)\]|\.(\d+))(?:([.[].*)|$)/
const ID_SEGMENT = /^(.*?)\[[^\]=]+=[^\]]*\](?:([.[].*)|$)/

/**
 * Split a path at its first array-element segment: `[a, rest]`.
 * `rows[0].pw` and `rows[id=r1].pw` both split to `['rows', '.pw']`, which is
 * what lets one be recognised as an alias of the other.
 */
const splitAtElement = (
  path: string,
  pattern: RegExp
): [string, string] | undefined => {
  const m = pattern.exec(path)
  if (m == null || m[1] === '') return undefined
  return [m[1], m[m.length - 1] ?? '']
}

const indexSpellingAliasesSecret = (
  path: string,
  wantLeaf: boolean
): boolean => {
  try {
    const split = splitAtElement(path, INDEX_SEGMENT)
    if (split == null) return false
    const [arrayPath, rest] = split
    // only arrays whose rows are ALSO named by an idPath can be aliased
    const idPaths = getArrayIdPaths(arrayPath)
    if (idPaths == null || idPaths.size === 0) return false
    for (const secret of secretPaths) {
      if (!extendsPath(arrayPath, secret)) continue
      const secretSplit = splitAtElement(secret, ID_SEGMENT)
      if (secretSplit == null) continue
      const secretRest = secretSplit[1]
      // COMPARE THE REMAINDER, not just the array. `rows[0].pw` aliases
      // `rows[id=r1].pw`; `rows[0].label` aliases nothing and must still be
      // described — blanket-redacting the array withheld ordinary fields and
      // made the map useless to buy nothing.
      if (wantLeaf ? rest === secretRest : secretRest.startsWith(rest)) {
        return true
      }
    }
    return false
  } catch {
    return true // an error here means "possibly secret", never "not secret"
  }
}

/** is this path, or an ancestor of it, bound to a secret-bearing control? */
const isSecretPath = (path: string): boolean => {
  if (secretPaths.has(path)) return true
  for (const secret of secretPaths) {
    if (extendsPath(secret, path)) return true
  }
  if (indexSpellingAliasesSecret(path, true)) return true
  // ⚠️ NARROWED, NOT CLOSED — tosijs#32, and TODO.md "Agent surface —
  // secret-path matching is spelling-sensitive". Matching is by SPELLING and
  // the rule above is a conservative containment, not canonicalisation. An
  // earlier version of this comment claimed ancestor descent was fully
  // covered; that was FALSE, and it was load-bearing — it was the stated
  // reason the remaining gap was accepted. A secret learned as
  // `list[id=a1].pw` is not matched by a DIRECT read spelled `list[0].pw`.
  // Descending from an ancestor IS covered — redactWithin tries every
  // spelling — so `read('list')` is safe; it is the direct index-spelled
  // query that is not. Fixing it needs canonicalisation of the QUERY, which
  // must fail closed: an error in the canonicaliser has to mean "possibly
  // secret", never "not secret".
  return false
}

/** would this read expose a secret nested anywhere beneath it? */
const containsSecret = (path: string): boolean => {
  for (const secret of secretPaths) {
    if (extendsPath(path, secret)) return true
  }
  // an index-spelled ANCESTOR — `rows[0]` — has no prefix relation to a secret
  // learned as `rows[id=r1].pw`, so without this the read returned the whole
  // row in cleartext. Saying "contains" (rather than "is") keeps the descent,
  // so only the secret field is withheld.
  return indexSpellingAliasesSecret(path, false)
}

const SECRET_SENTINEL = '⟨secret⟩'

/**
 * Learn which state paths are bound to secret-bearing controls, BEFORE
 * anything reads or publishes them.
 *
 * Harvesting this during the describe walk alone left two windows open:
 * `read('login.password')` called without a prior `describe()` was never
 * redacted at all (a WebMCP host can call `tosi_read` first), and within a
 * single walk an element bound to the same path that happened to be visited
 * *before* the password field had already put the value in its record. So
 * the scan runs up front — at `enableAgentInterface()`, at the top of every
 * describe, and before every read/when.
 *
 * It is cheap by construction: the selector matches only the handful of
 * controls that can be secret, not every bound element on the page.
 */
/**
 * ONE token list, two consumers. The selector and the predicate below were
 * written separately and drifted: the predicate accepted input/textarea/select
 * but the selector carried autocomplete arms for `input` only, so a bound
 * `<textarea autocomplete="cc-number">` (or the standard
 * `<select autocomplete="cc-exp-month">`) returned CLEARTEXT from read()
 * before any describe() and `⟨secret⟩` after — turn-to-turn inconsistent, in
 * exactly the tosi_read-called-first window the up-front scan exists to close.
 */
const SECRET_TAGS = ['input', 'textarea', 'select']
const SECRET_AUTOCOMPLETE_PREFIXES = [
  'cc-',
  'current-password',
  'new-password',
  'one-time-code',
]
const SECRET_INPUT_TYPES = ['password', 'hidden']

const SECRET_CONTROL_SELECTOR = [
  '[data-tosi-secret]',
  ...SECRET_INPUT_TYPES.map((type) => `input[type="${type}"]`),
  ...SECRET_TAGS.flatMap((tag) =>
    SECRET_AUTOCOMPLETE_PREFIXES.map(
      (prefix) => `${tag}[autocomplete^="${prefix}"]`
    )
  ),
].join(',')

/**
 * NO CACHE HERE. THIS SCAN RUNS EVERY TIME, ON PURPOSE.
 *
 * A binding-generation cache was added, measured at ~24% per read, and
 * REVERTED — it was a security regression, and the way it failed is the
 * argument for never trying again without a very different invalidation story.
 *
 * The generation was bumped from three call sites, two of which sat inside
 * `if (dataBindings == null)` — so only an element's FIRST binding bumped.
 * That produced five reachable leaks, each returning cleartext from `read()`
 * where rc.1 returned the sentinel:
 *
 *   1. `type` flipped to `password` after a read (a show/hide toggle)
 *   2. `data-tosi-secret` added later — the author's EXPLICIT opt-in
 *   3. `autocomplete="cc-…"` set when a payment method is chosen
 *   4. a second `bind()` on an already-mounted element — PERMANENT, since no
 *      DOM mutation follows to rescue it
 *   5. same-task append after a detached bind, and `cloneWithBindings()`
 *
 * Three of those are ATTRIBUTE changes on an element that never re-binds, so
 * no binding-shaped signal can see them at all; correctness would need a
 * MutationObserver on `type`/`autocomplete`/`data-tosi-secret` plus bumps at
 * every binding mutation — at which point the 24% is gone anyway.
 *
 * The selector is deliberately narrow (only controls that CAN be secret), so
 * the uncached scan matches almost nothing.
 *
 * ⚠️ **It is not free, and an earlier version of this comment said it was.**
 * That text claimed "1.3µs a read … not a trade worth revisiting" — a
 * happy-dom figure, and happy-dom memoises `querySelectorAll`. Real engines do
 * not: measured in Chromium, this scan costs **~350µs at 2k elements and
 * 1–2ms at 7k**, with or without an intervening mutation. 200 `tosi_read`
 * calls in one WebMCP turn is 200 of those.
 *
 * The revert still stands — a redaction guarantee is worth real milliseconds,
 * and the invalidation this replaced could not be made correct (see above).
 * But the SHAPE is the open question, not the trade: 15 selector arms, 12 of
 * them `[autocomplete^=…]` prefix matches no engine can bucket. A cheaper scan
 * that is still correct — narrowing to bound elements, or checking secrecy at
 * the point a path is read rather than sweeping the document — would be a real
 * improvement. Tracked in TODO.md.
 *
 * Two lessons in one comment: do not benchmark a DOM operation in happy-dom,
 * and do not write a number into a comment phrased to close future argument.
 */
const refreshSecretPaths = (): void => {
  if (typeof document === 'undefined') return
  let candidates: Element[]
  try {
    // Array.from, not for-of: the lib target types NodeListOf without
    // Symbol.iterator, and happy-dom's list is not iterable either
    candidates = Array.from(document.querySelectorAll(SECRET_CONTROL_SELECTOR))
  } catch (_e) {
    return // a DOM shim without full selector support: nothing to learn
  }
  for (const el of candidates) {
    if (!isSecretControl(el)) continue
    const { dataBindings } = getElementBindings(el)
    if (dataBindings == null) continue
    for (const b of dataBindings) secretPaths.add(b.path)
  }
}

/** replace secret-bound leaves inside a serialized value */
const redactWithin = (path: string, value: any): any => {
  if (value == null || typeof value !== 'object') return value
  const clone: any = Array.isArray(value) ? [...value] : { ...value }
  const isArray = Array.isArray(value)
  const idPaths = isArray ? getArrayIdPaths(path) : undefined
  for (const key of Object.keys(clone)) {
    /*
     * EVERY SPELLING THAT CAN NAME THIS CHILD — because secrecy must not
     * depend on which one the binding happened to use (review B2).
     *
     * A first attempt descended by id-path only, which fixed lists that
     * register one and left two holes wide open:
     *   - a list with NO idPath is a documented, supported configuration, and
     *     `ListBinding` names its rows `rows[0]`; the walk built `rows.0`, so
     *     nothing matched and `read('rows')` returned every secret in
     *     cleartext — the exact bug the fix was written to close;
     *   - two bindings registering DIFFERENT idPaths for one array meant
     *     `[...idPaths][0]` picked one and secrets under the other leaked.
     *
     * So: collect the candidates, redact if ANY is secret, and recurse under
     * whichever one actually contains a secret.
     */
    const candidates: string[] = []
    if (isArray) {
      candidates.push(`${path}[${key}]`, `${path}.${key}`)
      if (idPaths != null) {
        for (const idPath of idPaths) {
          // `clone[key] == null` guard: getByPath tolerates undefined but
          // THROWS on null, so a single null row (a cleared entry, a hole in
          // a server payload) took read/describe/changes down for the page —
          // and changes() threw inside its coalescing loop, killing every
          // subsequent poll. Introduced by the first version of this fix.
          const idValue =
            clone[key] == null ? undefined : getByPath(clone[key], idPath)
          if (idValue !== undefined && idValue !== null) {
            candidates.push(`${path}[${idPath}=${String(idValue)}]`)
          }
        }
      }
    } else {
      candidates.push(`${path}.${key}`)
    }
    if (candidates.some((candidate) => isSecretPath(candidate))) {
      clone[key] = SECRET_SENTINEL
      continue
    }
    // DESCEND UNDER *EVERY* SPELLING THAT CONTAINS A SECRET, not the first.
    // The leaf test above is `some` — OR across spellings — and this used
    // `find`, so with two idPaths registered on one array the recursion ran
    // under one spelling and the secret registered under the other came back
    // in cleartext, through `read()` AND through `describe()` in the
    // read-only default posture. Both leaves redacted individually, which is
    // exactly what made it invisible: every test used a single spelling per
    // array, so the suite was structurally incapable of catching it.
    for (const candidate of candidates) {
      if (containsSecret(candidate)) {
        clone[key] = redactWithin(candidate, clone[key])
      }
    }
  }
  return clone
}

/**
 * Does this control hold something that must never travel? A DENYLIST is
 * defence in depth, not the control — the control is manifest scoping, and
 * `data-tosi-secret` is the author's explicit opt-in. Applies to
 * input/textarea/select, not just `<input type=password>`: hidden CSRF
 * tokens and `autocomplete="cc-*"` payment fields are the common cases.
 */
const isSecretControl = (el: Element, type?: string): boolean => {
  if (el.hasAttribute?.('data-tosi-secret')) return true
  const tag = el.tagName.toLowerCase()
  if (!SECRET_TAGS.includes(tag)) return false
  const kind = type ?? (el as any).type ?? ''
  if (SECRET_INPUT_TYPES.includes(kind)) return true
  const autocomplete = el.getAttribute('autocomplete') ?? ''
  // the SAME token list the selector is built from — this pair drifting is
  // what let a bound <textarea autocomplete="cc-number"> leak
  return SECRET_AUTOCOMPLETE_PREFIXES.some((prefix) =>
    autocomplete.startsWith(prefix)
  )
}

const describeElement = (el: Element): AgentWiringRecord => {
  const record: AgentWiringRecord = {
    tag: el.tagName.toLowerCase(),
  }
  if (el.id) record.id = el.id
  const part = el.getAttribute('part')
  if (part) record.part = part
  const role = el.getAttribute('role')
  if (role) record.role = role
  // the accessible-name algorithm, abridged: what a screen reader would say.
  // placeholder is deliberately NOT folded in — it's a hint, not a name, and
  // conflating them makes an empty input read like it has content
  const label =
    el.getAttribute('aria-label') ||
    referencedText(el, 'aria-labelledby') ||
    associatedLabel(el) ||
    el.getAttribute('title') ||
    el.getAttribute('alt')
  if (label) record.label = label
  const placeholder =
    el.getAttribute('placeholder') || el.getAttribute('aria-placeholder')
  if (placeholder) record.placeholder = placeholder
  // a link IS an affordance — its destination is a fact of the map
  const href = el.getAttribute?.('href')
  if (href) record.href = href
  // contenteditable IS an input field — an affordance in itself, whatever
  // custom bindings ride it (and they usually do)
  const editableAttr = el.getAttribute?.('contenteditable')
  if (
    (el as any).isContentEditable === true ||
    editableAttr === '' ||
    editableAttr === 'true' ||
    editableAttr === 'plaintext-only'
  ) {
    record.contentEditable = true
  }
  // where the user IS: keyboard focus is part of the scene
  if ((globalThis as any).document?.activeElement === el) {
    record.focused = true
  }
  // secrecy is not an <input> concern: a textarea or an author-marked
  // control can hold one too
  if (record.tag !== 'input' && isSecretControl(el)) record.secret = true
  // form controls: the control's kind and LIVE state are facts of the map
  if (record.tag === 'input') {
    const type = (el as any).type || 'text'
    if (type !== 'text') record.type = type
    // SECRETS ARE NEVER VALUES. A password field's content is exactly what
    // must not travel to an agent, a log, a WebMCP host or a screenshot of
    // the map. The affordance is still described — kind, name, bound path,
    // geometry — just never its content.
    if (isSecretControl(el, type)) record.secret = true
    if (type === 'checkbox' || type === 'radio') {
      record.checked = (el as any).checked === true
    }
  }
  const description =
    referencedText(el, 'aria-describedby') ||
    el.getAttribute('aria-description')
  if (description) record.description = description
  if (
    (el as any).disabled === true ||
    el.getAttribute('aria-disabled') === 'true'
  ) {
    record.disabled = true
  }
  if (
    (el as any).required === true ||
    el.getAttribute('aria-required') === 'true'
  ) {
    record.required = true
  }
  // live validity — the same truth :invalid styling and screen readers get:
  // the platform's ValidityState (native controls AND form-associated
  // components via ElementInternals) or an explicit aria-invalid
  if (
    el.getAttribute('aria-invalid') === 'true' ||
    ((el as any).willValidate === true && (el as any).validity?.valid === false)
  ) {
    record.invalid = true
  }
  return record
}

// resolve the inline contract governing a path, if any element declares one:
// scanned from the live bound elements at write time — deliberately NOT a
// path→element index (virtual lists thrash those; the DOM is the registry)
const inlineSchemaFor = (path: string): Record<string, any> | undefined => {
  // the common case, answered without touching the DOM: no element on this
  // page has ever declared an inline contract, so there is nothing to find
  if (!anyInlineContracts()) return undefined
  const doc = (globalThis as any).document
  if (doc?.getElementsByClassName == null) return undefined
  for (const el of Array.from(
    doc.getElementsByClassName(BOUND_CLASS)
  ) as Element[]) {
    const schema = elementContract(el)
    if (schema == null) continue
    const { dataBindings } = getElementBindings(el)
    if (dataBindings?.some((b: any) => b.path === path)) {
      return schema
    }
  }
  return undefined
}

// aria-hidden means invisible to assistive tech — and the agent reads the
// page the way assistive tech does. Hidden is hidden.
const ariaHidden = (el: Element): boolean => {
  let probe: Element | null = el
  for (let hop = 0; probe != null && hop < 12; hop++) {
    if (probe.getAttribute?.('aria-hidden') === 'true') return true
    probe = probe.parentElement
  }
  return false
}

// "value ⟷ path" — current value plus provenance in one parseable string
/**
 * Neutralize provenance tokens inside DATA. The arrows are structure, not
 * content: an attacker-controlled string containing ` ⟷ ` forged one, and
 * every consumer believed it — the schematic truncated the shown value at
 * the fake arrow and decided editability by `includes(BOUND_TWO_WAY)`, so a
 * plain string could DRAW itself a false affordance, and the audit reported
 * on it (SEC-8). Fixed here at the source, which fixes every consumer at
 * once; the replacement character is visually honest about what happened.
 */
const stripArrows = (text: string): string =>
  text.includes(BOUND_TWO_WAY) || text.includes(BOUND_TO_DOM)
    ? text.split(BOUND_TWO_WAY).join('<->').split(BOUND_TO_DOM).join('<-')
    : text

const boundValue = (path: string, twoWay: boolean, secret = false): string => {
  const arrowOnly = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM
  // a secret's PATH is useful (an agent can still see what it's bound to);
  // its content never is
  //
  // SECRECY IS A PROPERTY OF THE PATH — the invariant this file states at the
  // top of the secret-scan section, and which this function used to violate.
  // It redacted on `secret`, the flag for THIS DOM record, and never consulted
  // the path. So `describe()` published in cleartext what `read()` refuses:
  //
  //   - an element bound to the EXACT secret path with a non-value binding
  //     (`bindings.enabled` on a token — "enable when a session exists") has
  //     record.secret === false, because nothing of the value reaches the DOM;
  //   - an element bound to an ANCESTOR serialised the whole subtree, secret
  //     included.
  //
  // Both leak in the READ-ONLY DEFAULT posture, through `tosi_describe` — the
  // one WebMCP tool published in every posture, while `tosi_read` sits behind
  // a gate precisely because reads are considered too much to publish unasked.
  // So the surface handed out the exact value the gate exists to withhold.
  // Now mirrors `readScanned()` exactly. THE MECHANISM THAT KEEPS THEM IN
  // STEP IS SEC-2b in agent.test.ts, which mutation-fails if either arm of
  // this dispatch is removed — not this comment.
  if (secret || isSecretPath(path)) return `${arrowOnly} ${path}`
  const serialized = serialize(xin[path])
  const raw = containsSecret(path)
    ? redactWithin(path, serialized)
    : serialized
  const shown =
    raw === undefined ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
  const arrow = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM
  return shown ? `${stripArrows(shown)} ${arrow} ${path}` : `${arrow} ${path}`
}

// name a binding by identity: the shared bindings collection first, then the
// element-prop binding cache; textContent surfaces under the friendlier `text`
const bindingName = (binding: any): string | undefined => {
  for (const key of Object.keys(bindings)) {
    if ((bindings as any)[key] === binding) return key
  }
  const propKey = propBindingKey(binding)
  return propKey === 'textContent' ? 'text' : propKey
}

/** the posture last announced — notices fire on CHANGE, not once per process */
let lastPostureAnnounced: string | undefined

/**
 * Reset the once-per-process posture notices (testing only). Without this
 * the `expose: 'all'` consent warning could not be asserted — the latch is
 * spent by the first surface any test creates, so the assertion had to be
 * written as "…or no warnings at all", which can never fail. That warning
 * is the only signal that every state root is writable through a global.
 */
export function _resetPostureNotices(): void {
  lastPostureAnnounced = undefined
}
let active: AgentInterface | undefined

export function enableAgentInterface(
  options: AgentInterfaceOptions = {}
): AgentInterface {
  // re-enabling reconfigures: tear down the previous surface first
  if (active != null) active.disable()

  const { expose, components, global = true, webmcp = true } = options
  let webmcpRegistration:
    | { tools: string[]; unregister: () => void }
    | undefined
  // THE POSTURE (1.8.0). Three modes, safest by default:
  //
  //   enableAgentInterface()                    read-only introspection
  //   enableAgentInterface({ expose: {roots} }) manifest — the production shape
  //   enableAgentInterface({ expose: 'all' })   everything, deliberately
  //
  // The docs have always said production posture is manifest-only,
  // allowlist-never-denylist, and that open write() is a dev-mode
  // affordance. The code used to ship the opposite as its DEFAULT: no
  // `expose` meant read, write AND call over the entire registry, on a
  // global any third-party script shares, with an unvalidated `tosi_write`
  // auto-published to the browser's tool registry. Now the default keeps
  // the part that only LOOKS (the map is the point) and requires consent
  // for the verbs that change the world.
  const exposeAll = expose === 'all'
  const manifest =
    typeof expose === 'object' && expose !== null ? expose : undefined
  const roots = manifest?.roots
  const exposedActions = manifest?.actions
  const contract = manifest?.contract
  // contracted roots (the describe() keys) are read ONCE at enable time so
  // sub-path writes can be routed to a whole-root proposal
  const contractRoots =
    contract?.describe != null ? Object.keys(contract.describe()) : []
  /**
   * Is this path already governed by top-level curation?
   *
   * Two callers must agree on this and only this: `describe()`, which drops
   * superseded inline schemas so THE MAP DOES NOT ADVERTISE WHAT `write()`
   * WILL NOT ENFORCE, and `write()`, which skips inline checking under a
   * curated root. They were two copies of one expression sitting either side
   * of a comment calling their disagreement "the worst possible defect" — so
   * now there is one expression, and `curationHonoured()` below proves the
   * two uses still line up.
   */
  const supersededByCuration = (path: string): boolean =>
    contract != null && contractRoots.some((root) => extendsPath(root, path))

  const manifestMode = manifest != null
  /** read-only introspection: no manifest, and no explicit `expose: 'all'` */
  const readOnly = !manifestMode && !exposeAll
  // A MANIFEST SCOPES SIGHT, NOT REACH. `expose: { roots }` used to confer
  // writes over those roots as a side effect of narrowing reads, which made
  // the safest-sounding posture the most permissive one available and left
  // "scoped reads, no writes" inexpressible (1.8.0 security pass, SEC-7).
  // Writes now need saying so — `write: true`, or `expose: 'all'`.
  const writesAllowed = exposeAll || (manifestMode && manifest?.write === true)
  const callsAllowed = exposeAll || manifestMode

  // ANNOUNCE EVERY TRANSITION, not just the first one. These were
  // once-per-process latches, so the documented dev workflow — open it up,
  // narrow it to a manifest, open it up again — announced full access ONCE
  // and stayed silent through every later widening (SEC-14). Latching on the
  // posture keeps repeated identical enables quiet while making each change
  // of posture speak.
  const posture = exposeAll ? 'all' : manifestMode ? 'manifest' : 'read-only'
  const announce = posture !== lastPostureAnnounced && settings.quiet !== true
  if (announce) lastPostureAnnounced = posture
  if (readOnly && announce) {
    console.info(
      'tosijs agent: read-only introspection. describe/read/observe/changes/' +
        'when/log work over EVERYTHING in the registry — and this surface is ' +
        `installed as globalThis.${
          typeof global === 'string' ? global : 'tosiAgent'
        }${
          webmcp !== false
            ? ' and published to any WebMCP host as tosi_describe/tosi_surface'
            : ''
        }. write() and call() refuse. Declare expose: { roots, actions } for ` +
        "production, or expose: 'all' while developing."
    )
  }
  if (exposeAll && announce) {
    console.warn(
      "tosijs agent: expose: 'all' — every state root is readable, WRITABLE " +
        'and callable through globalThis.tosiAgent, which any script on this ' +
        'page can reach. Intended for development. Production posture is ' +
        'expose: { roots, actions } with a contract.'
    )
  }

  let disabled = false
  let myGlobalName: string | undefined
  const surfaceVersion: AgentSurfaceVersion = {
    surface: AGENT_SURFACE_VERSION,
    tosijs: version,
    capabilities: [...AGENT_CAPABILITIES],
  }

  const inScope = (path: string): boolean =>
    !manifestMode ||
    (roots ?? []).some((root) => extendsPath(root, path)) ||
    (exposedActions ?? []).some((action) => extendsPath(action, path))

  // writes are gated on declared ROOTS only: a declared action is callable,
  // not writable — otherwise `actions: ['app.checkout']` would let an agent
  // REPLACE app.checkout (a function) with agent-supplied data.
  //
  // Consulting the roots alone did not actually achieve that, because an
  // action normally LIVES under a declared root: with
  // `{ roots: ['app'], actions: ['app.checkout'] }`,
  // `write('app.checkout', 'x')` disabled the action and `write('app', {})`
  // wiped every one of them (SEC-9). So a write is refused when it lands ON
  // a declared action, UNDER one, or on an ancestor that CONTAINS one.
  const hitsDeclaredAction = (path: string): boolean =>
    (exposedActions ?? []).some(
      (action) => extendsPath(action, path) || extendsPath(path, action)
    )
  const writable = (path: string): boolean =>
    !hitsDeclaredAction(path) &&
    (!manifestMode || (roots ?? []).some((root) => extendsPath(root, path)))

  const assertScope = (path: string): void => {
    if (!inScope(path)) {
      throw new Error(
        `agent interface: "${path}" is not exposed (manifest mode)`
      )
    }
  }

  /** the verbs that CHANGE things need consent; looking does not */
  const assertMutable = (verb: string, path: string): void => {
    const allowed = verb === 'call' ? callsAllowed : writesAllowed
    if (allowed) return
    if (readOnly) {
      throw new Error(
        `agent interface: ${verb}("${path}") refused — this surface is ` +
          `read-only introspection. Declare expose: { roots${
            verb === 'call' ? ', actions' : ''
          } } to allow it, or expose: 'all' while developing.`
      )
    }
    throw new Error(
      `agent interface: ${verb}("${path}") refused — this manifest exposes ` +
        'its roots for reading only. Add write: true to the manifest to ' +
        "allow writes, or use expose: 'all' while developing."
    )
  }

  // the audit ledger — one global observer; every touch lands here.
  // log/changes are two consumptions of this one stream. Entries with a
  // `note` are synthetic audit events (when() arming etc.), visible in
  // log() but skipped by the changes() drain.
  let seq = 0
  // RING BUFFER. `observe(() => true, …)` records every settled touch, and
  // the documented pattern is enable-once-and-leave — 20k touches measured
  // 3.2 MB. `seq` stays monotonic so cursors keep working across a trim,
  // and a drain that spans dropped entries says so rather than pretending
  // it saw everything.
  const maxLog = options.maxLog ?? 10_000
  let dropped = 0
  const ledger: AgentLogEntry[] = []
  // TRIM IN BATCHES, not on every touch. splice(0, 1) once the ledger is full
  // re-indexes the whole array per touch — measured 155.6ms per 200k touches
  // against 1.6ms batched, ~100×, and it starts silently once an app has been
  // running a while (which is the documented usage: enable once and leave).
  // Let it grow 10% past the cap, then trim back to it in one move.
  const trimAt = Math.max(maxLog + 1, Math.ceil(maxLog * 1.1))
  const record = (entry: AgentLogEntry): void => {
    ledger.push(entry)
    if (ledger.length >= trimAt) {
      const excess = ledger.length - maxLog
      dropped += excess
      ledger.splice(0, excess)
    }
  }
  const pendingWhens = new Set<{ reject: (reason: Error) => void }>()
  const ledgerListener: Listener = observe(
    () => true,
    (path: string) => {
      if (inScope(path)) record({ seq: ++seq, path })
    }
  )
  const subscriptions = new Set<Listener>()

  // the read itself, once the secret-path set is known to be current
  const readScanned = (path: string): any => {
    assertScope(path)
    if (isSecretPath(path)) return SECRET_SENTINEL
    const value = serialize(xin[path])
    // an ANCESTOR read must not hand back what a direct read refuses
    return containsSecret(path) ? redactWithin(path, value) : value
  }

  const read = (path: string): any => {
    refreshSecretPaths()
    return readScanned(path)
  }

  // one scan at enable time, so the very first read is already redacted
  // even if the caller never asks for a description
  refreshSecretPaths()

  const surface: AgentInterface = {
    describe(
      options: {
        styles?: boolean
        scope?: Element
        structure?: boolean
        view?: 'page' | 'viewport'
      } = {}
    ): AgentDescription {
      // learn the secret-bound paths BEFORE any record harvests a value:
      // within a single walk, an element bound to the same path could be
      // visited before the password field that makes it secret
      refreshSecretPaths()
      const viewportView = options.view === 'viewport'
      const rootNames = manifestMode
        ? (roots ?? []).slice()
        : Object.keys(registry)
      const rootSummary: Record<string, string> = {}
      for (const root of rootNames) {
        rootSummary[root] = Array.isArray(tosiValue(xin[root]))
          ? 'array'
          : typeof tosiValue(xin[root])
      }

      // wiring: every data-bound element (enumerable via the marker class),
      // plus every event-wired element (probe the handler map on a tree walk).
      // With `scope`, both walks are confined to that element's subtree —
      // hierarchy scoping, stable however large the subtree renders.
      const wiring: AgentWiringRecord[] = []
      // inline element contracts aggregate here, keyed by bound path —
      // merged into describe().contract below (curation keys win)
      const inlineContracts: Record<string, any> = {}
      if (typeof document !== 'undefined') {
        const walkRoot: Element =
          options.scope ?? (document.body as unknown as Element)
        const seen = new Set<Element>()
        const recordFor = (el: Element): AgentWiringRecord | undefined => {
          if (seen.has(el)) return undefined
          seen.add(el)
          if (ariaHidden(el)) return undefined // hidden from AT = hidden here
          const { dataBindings, eventBindings } = getElementBindings(el)
          const record = describeElement(el)
          // inline contract: declared at the element, aggregated (below) into
          // describe().contract under the element's bound path — declaration
          // is distributed, curation is central
          const inline = elementContract(el)
          let inlinePath: string | undefined
          let inlineTwoWay = false
          let wired = false
          if (dataBindings != null) {
            for (const b of dataBindings) {
              if (!inScope(b.path)) continue
              wired = true
              if (inline != null && !inlineTwoWay) {
                if (b.binding.fromDOM != null) {
                  inlinePath = b.path // the writable path is the one it gates
                  inlineTwoWay = true
                } else {
                  inlinePath ??= b.path
                }
              }
              const idPath = (b.options as any)?.idPath
              if (idPath != null || b.binding === (bindings as any).list) {
                record.list = idPath
                  ? { path: b.path, idPath }
                  : { path: b.path }
                continue
              }
              const name = bindingName(b.binding)
              // remember the PATH, so read/changes/when redact it too — the
              // map publishes this path, so withholding only the DOM value
              // would just be telling the agent what to ask for
              if (record.secret === true) secretPaths.add(b.path)
              if (name != null && record[name] === undefined) {
                record[name] = boundValue(
                  b.path,
                  b.binding.fromDOM != null,
                  record.secret === true
                )
              } else {
                // obscure stuff one level deeper
                record.detail ??= []
                record.detail.push({
                  path: b.path,
                  readable: b.binding.toDOM != null,
                  writable: b.binding.fromDOM != null,
                })
              }
            }
          }
          if (eventBindings != null) {
            const on: Record<string, string | string[]> = {}
            // SCOPE COMES FROM PROVENANCE, NEVER FROM THE RENDERED STRING.
            // This used to test `name !== 'ƒ'`, so a plain named function
            // (`button({ onClick: addItem })` — our own documented idiom)
            // rendered as "ƒ addItem", counted as in-scope, and dragged the
            // element's text and live value into a manifest-scoped map. A
            // plain function has no path and can never be in-manifest.
            let anyHandlerInScope = false
            for (const [type, set] of Object.entries(eventBindings)) {
              // MANIFEST SCOPE APPLIES HERE TOO. Data bindings were filtered
              // but handlers were not, so an allowlisted surface published
              // the private action namespace ('app.secret.wipe') — and,
              // because an unscoped handler still flipped `wired`, the
              // record then harvested text, live control values, labels and
              // geometry from regions the manifest deliberately excluded.
              const names = Array.from(set as Set<any>, (h) => {
                if (typeof h === 'string') {
                  // a by-path handler outside the manifest is not ours to
                  // name — report it as anonymous rather than leaking the
                  // path (the element is still visibly interactive)
                  if (inScope(h)) {
                    anyHandlerInScope = true
                    return h
                  }
                  return 'ƒ'
                }
                // on() normalizes proxies to paths at registration; this is
                // defense for handlers registered around it. A raw function
                // contributes its NAME as a breadcrumb when it has a real
                // one ('ƒ addThing' — worth little under minification, but
                // free) — prop-key artifacts (onClick, handleClick method
                // shorthand) say nothing, so they stay plain 'ƒ'
                const path = tosiPath(h)
                if (path != null) return path
                const name = (h as any)?.name
                return name && !/^(on|handle)[A-Z]/.test(name)
                  ? `ƒ ${name}`
                  : 'ƒ'
              })
              on[type] = names.length === 1 ? names[0] : names
            }
            if (Object.keys(on).length > 0) {
              record.on = on
              // in manifest mode, handlers that are ALL out of scope do not
              // make this element part of the exposed surface
              if (!manifestMode || anyHandlerInScope) wired = true
            }
          }
          // static text, when textContent isn't already surfaced as bound
          if (record.text === undefined) {
            const text = stripArrows((el.textContent || '').trim()).slice(0, 40)
            if (text) record.text = text
          }
          // an UNBOUND form control still holds a live value — harvest it
          // (no provenance arrow: a plain string means "current, not bound").
          // NOT in manifest mode: an allowlist that hides `read('app.pin')`
          // must not hand the same digits over as DOM content, and an
          // unbound control's value is by definition outside every declared
          // root.
          if (
            !manifestMode &&
            record.value === undefined &&
            record.checked === undefined &&
            record.secret !== true &&
            (record.tag === 'input' ||
              record.tag === 'textarea' ||
              record.tag === 'select')
          ) {
            const liveValue = stripArrows(
              String((el as any).value ?? '')
            ).slice(0, 40)
            if (liveValue) record.value = liveValue
          }
          // links are affordances in themselves — a bare <a href> is on
          // the map whether or not anything else wires it
          if (record.href != null && record.tag === 'a') {
            wired = true
          }
          // contenteditable: live text is its value; the region is an
          // affordance in itself, mapped even before bindings attach
          if (record.contentEditable === true) {
            if (record.value === undefined) {
              const liveText = stripArrows((el.textContent || '').trim()).slice(
                0,
                40
              )
              if (liveText) record.value = liveText
            }
            wired = true
          }
          if (inline != null) {
            record.contract = inline
            if (
              inlinePath != null &&
              inlineContracts[inlinePath] === undefined
            ) {
              inlineContracts[inlinePath] = inline
            }
          }
          // a custom element may carry its own self-declaration. OWN statics
          // only: statics inherit through the prototype chain, and a subclass
          // must not silently wear its parent's claims (the _elementCreator
          // lesson, applied to contracts). Post-hoc contracts (expose.
          // components, keyed by tag) fill the gaps for classes you don't
          // control — the class's own declaration always wins.
          if (record.tag.includes('-')) {
            const cls = (globalThis as any).customElements?.get?.(record.tag)
            const own = ownContract(cls)
            const declared =
              own !== undefined ? own : (components?.[record.tag] ?? undefined)
            if (declared != null) {
              record.component = declared
            }
            // a self-DECLARED component is an affordance by declaration:
            // carrying a contract announces it to the surface, shadow
            // internals or not
            if (record.component != null) {
              wired = true
            }
            // ATTRIBUTES, HOWEVER THEY WERE DECLARED (tosijs#29). Reading them
            // off `static contract` alone meant a component using
            // `static initAttributes` — the terse form nearly every component
            // uses, and the only one the component reference documents — sat
            // in the map with no attribute description at all.
            //
            // DELIBERATELY GATED ON `wired`, and it never sets it. Declaration
            // stays the announce signal: every component has attributes, so
            // letting them make an element wired would flood the map with
            // every custom element on the page. This only fills in the surface
            // of something already in the map.
            if (wired) {
              const described =
                typeof (cls as any)?._describedAttributes === 'function'
                  ? (cls as any)._describedAttributes()
                  : undefined
              if (described != null && Object.keys(described).length > 0) {
                record.component = {
                  ...(record.component ?? {}),
                  attributes: described,
                }
              }
            }
          }
          // BAIL FIRST. measureBounds is a getBoundingClientRect plus a
          // fixed/sticky ancestor walk that calls getComputedStyle up to 12
          // times — and every custom element on the page is fed in here.
          // Measuring before the wired check meant ~70% of that work was
          // thrown away on a redraw the docs recommend running on every
          // state change.
          if (!wired) {
            seen.delete(el) // release the claim; the structural tier may want it
            return undefined
          }
          // geometry: the layout is part of the semantics
          const measured = measureBounds(el, viewportView)
          if (measured != null) {
            record.bounds = measured.bounds
            if (measured.fixed) record.viewportFixed = true
          } else if (viewportView) {
            return undefined // the camera doesn't record what it can't see
          }
          if (
            options.styles === true &&
            typeof (globalThis as any).getComputedStyle === 'function'
          ) {
            const cs = (globalThis as any).getComputedStyle(el)
            record.style = {
              background: cs.backgroundColor,
              borderColor: cs.borderTopColor,
              color: cs.color,
            }
          }
          return record
        }
        for (const el of Array.from(
          walkRoot.getElementsByClassName(BOUND_CLASS)
        )) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        for (const el of [
          walkRoot,
          ...Array.from(walkRoot.querySelectorAll('*')),
        ]) {
          // handlers wire an element; a custom element may instead be
          // self-declared (own static contract / post-hoc components map) —
          // recordFor decides, we just make sure it gets ASKED
          if (elementToHandlers.has(el) || el.tagName.includes('-')) {
            const record = recordFor(el)
            if (record) wiring.push(record)
          }
        }
        // contenteditable regions are affordances in themselves — enumerated
        // even before any binding or handler attaches (the walk otherwise
        // only visits WIRED elements)
        for (const el of Array.from(
          walkRoot.querySelectorAll('[contenteditable]')
        )) {
          if (el.getAttribute('contenteditable') === 'false') continue
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        // links likewise: navigation is app surface, bindings or not
        for (const el of Array.from(walkRoot.querySelectorAll('a[href]'))) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        // the structural tier (unless structure: false): headings and
        // landmarks — the page's information architecture — plus the
        // custom-element containers wired elements live inside. Structure
        // is what turns a scatter of affordances into a MAP.
        if (options.structure !== false) {
          const structural: Element[] = Array.from(
            walkRoot.querySelectorAll(
              'h1,h2,h3,h4,h5,h6,main,article,section,nav,aside,header,footer'
            )
          )
          for (const wired of Array.from(seen)) {
            let ancestor = wired.parentElement
            while (ancestor != null && ancestor !== walkRoot) {
              if (ancestor.tagName.includes('-')) structural.push(ancestor)
              ancestor = ancestor.parentElement
            }
          }
          for (const el of structural) {
            if (seen.has(el)) continue
            seen.add(el)
            const record = describeElement(el)
            record.structural = true
            const heading = /^H[1-6]$/.test(el.tagName)
            if (heading && record.text === undefined) {
              const text = (el.textContent || '').trim().slice(0, 60)
              if (text) record.text = text
            }
            const measured = measureBounds(el, viewportView)
            if (
              measured == null ||
              measured.bounds.width === 0 ||
              measured.bounds.height === 0
            ) {
              continue
            }
            record.bounds = measured.bounds
            if (measured.fixed) record.viewportFixed = true
            wiring.push(record)
          }
        }
      }

      // actions: functions reachable from exposed roots (bounded walk)
      const actions: string[] = []
      if (manifestMode) {
        actions.push(...(exposedActions ?? []))
      } else {
        const walk = (value: any, path: string, depth: number): void => {
          if (depth > 3 || value == null || typeof value !== 'object') return
          for (const key of Object.keys(value)) {
            const child = value[key]
            const childPath = `${path}.${key}`
            if (typeof child === 'function') actions.push(childPath)
            else walk(child, childPath, depth + 1)
          }
        }
        for (const root of rootNames) {
          walk(registry[root], root, 0)
        }
      }

      const description: AgentDescription = {
        version: surfaceVersion,
        roots: rootSummary,
        wiring,
        actions,
        exposure: manifestMode
          ? 'manifest'
          : exposeAll
          ? 'introspection'
          : 'read-only',
        writable: writesAllowed,
      }
      // inline declarations fill the contract; top-level curation OVERRIDES
      // on collision — declare where you build, curate at the top
      const declared =
        contract?.describe != null ? contract.describe() : undefined
      // THE MAP MUST NOT ADVERTISE WHAT write() WILL NOT ENFORCE. Curation
      // supersedes inline declarations beneath its roots — that is the
      // documented precedence — but the inline schema was still emitted, so
      // describe().contract stated a rule the surface would then accept a
      // violation of. For a surface whose whole claim is that its
      // description is honest, that is the worst possible defect: drop the
      // superseded entries instead.
      const enforceable: Record<string, any> = {}
      for (const [path, schema] of Object.entries(inlineContracts)) {
        if (!supersededByCuration(path)) enforceable[path] = schema
      }
      const merged = { ...enforceable, ...(declared ?? {}) }
      if (Object.keys(merged).length > 0) {
        description.contract = merged
      }
      return description
    },

    read,

    write(path: string, value: any): void {
      assertMutable('write', path)
      assertScope(path)
      if (!writable(path)) {
        throw new Error(
          `agent interface: "${path}" is callable, not writable (declare it under roots to allow writes)`
        )
      }
      if (contract != null) {
        // route the WRITE, not the schema: judge a sub-path write as the
        // whole contracted root it would produce (clone + hypothetical
        // apply) — closes the sub-path bypass, and root-level cross-field
        // constraints and $predicates see the edit in context
        let proposal: { root: string; proposed: any } | undefined
        const root = contractRoots
          .filter((contractRoot) => extendsPath(contractRoot, path))
          .sort((a, b) => b.length - a.length)[0]
        if (root != null) {
          if (path === root) {
            proposal = { root, proposed: value }
          } else {
            const wrapper = { root: serialize(xin[root]) }
            const relative = path.slice(root.length)
            setByPath(
              wrapper,
              relative.startsWith('[')
                ? `root${relative}`
                : `root.${relative.replace(/^\./, '')}`,
              value
            )
            proposal = { root, proposed: wrapper.root }
          }
        }
        const verdict = contract.check(path, value, proposal)
        if (verdict !== true) {
          // refusals are audit events: what an agent TRIED matters as much
          // as what it did
          record({
            seq: ++seq,
            path,
            note: `write rejected: ${verdict.message}`,
          })
          throw verdict
        }
      }
      // inline contracts gate wherever top-level curation does NOT cover the
      // path — declared at the element, enforced at the surface. Curation
      // always wins: an expose.contract root supersedes ("curate away") any
      // inline declarations beneath it.
      if (!supersededByCuration(path)) {
        const schema = inlineSchemaFor(path)
        if (schema != null) {
          const err = contractViolation(value, schema)
          if (err != null) {
            record({
              seq: ++seq,
              path,
              note: `write rejected: ${err}`,
            })
            throw new TypeError(
              `agent interface: inline contract violation at "${path}": ${err}`
            )
          }
        }
      }
      xin[path] = value
    },

    observe(path: string, callback: (path: string) => void): () => void {
      assertScope(path)
      const listener = observe(path, callback)
      subscriptions.add(listener)
      let off = false
      return () => {
        if (off) return // idempotent: unobserve throws on a stranger
        off = true
        subscriptions.delete(listener)
        unobserve(listener)
      }
    },

    call(actionPath: string, ...args: any[]): any {
      assertMutable('call', actionPath)
      if (manifestMode && !(exposedActions ?? []).includes(actionPath)) {
        throw new Error(
          `agent interface: action "${actionPath}" is not exposed (manifest mode)`
        )
      }
      const fn = xin[actionPath]
      if (typeof fn !== 'function') {
        throw new Error(`agent interface: "${actionPath}" is not an action`)
      }
      // THE INVOCATION IS THE AUDIT EVENT. The ledger records in-scope
      // TOUCHES, so a call-only surface (`roots: []`) mutating state through
      // its action left no trace at all — the one posture where the app has
      // told us exactly what an agent is allowed to do was the one where the
      // log went blank. Arguments are deliberately not recorded: they are
      // arbitrary caller data and can carry secrets.
      record({
        seq: ++seq,
        path: actionPath,
        note: `call: ${args.length} arg${args.length === 1 ? '' : 's'}`,
      })
      return fn(...args)
    },

    // await a state condition: the value now if it already satisfies,
    // otherwise the first settling round where it does
    when(path: string, predicate: (value: any) => boolean): Promise<any> {
      assertScope(path)
      refreshSecretPaths()
      const current = serialize(xin[path])
      let alreadySatisfied: boolean
      try {
        alreadySatisfied = predicate(current)
      } catch (e) {
        // predicate errors use one channel: the returned promise
        return Promise.reject(e)
      }
      if (alreadySatisfied) {
        record({ seq: ++seq, path, note: 'when: already satisfied' })
        // resolve through read() so a secret-bound path redacts here exactly
        // as it does on a direct read. The PREDICATE still sees the truth —
        // it has to, or a condition on a secret could never be expressed —
        // and that is not a hole: a predicate is a live function, so anyone
        // who can pass one already runs code in this page. What matters is
        // that the value handed BACK travels the same redacted channel as
        // read(), which is the one a WebMCP host or a serialized transport
        // can actually reach.
        return Promise.resolve(read(path))
      }
      record({
        seq: ++seq,
        path,
        note: `when: armed ${String(predicate).slice(0, 80)}`,
      })
      return new Promise((resolve, reject) => {
        const pending = { reject }
        pendingWhens.add(pending)
        const settle = (fn: () => void) => {
          pendingWhens.delete(pending)
          subscriptions.delete(listener)
          unobserve(listener)
          fn()
        }
        const listener = observe(path, () => {
          const value = serialize(xin[path])
          let satisfied: boolean
          try {
            satisfied = predicate(value)
          } catch (e) {
            settle(() => reject(e as Error))
            return
          }
          if (satisfied) {
            record({ seq: ++seq, path, note: 'when: resolved' })
            settle(() => resolve(read(path)))
          }
        })
        subscriptions.add(listener)
      })
    },

    // turn-based drain: everything since the cursor, coalesced to one entry
    // per path (final value read at drain time — updates()' settling
    // semantics, extended across agent turns)
    changes(since = 0): {
      cursor: number
      changes: AgentChange[]
      truncated?: boolean
    } {
      // ONE scan for the whole drain: the per-path read used to rescan the
      // DOM for secret-bound controls on every entry, so a 200-path drain
      // did 200 querySelectorAlls to learn the same thing 200 times
      refreshSecretPaths()
      const seenPaths = new Set<string>()
      const coalesced: AgentChange[] = []
      for (let i = ledger.length - 1; i >= 0; i--) {
        const entry = ledger[i]
        if (entry.seq <= since) break
        if (entry.note != null) continue // audit notes are not state changes
        if (seenPaths.has(entry.path)) continue
        seenPaths.add(entry.path)
        // push + one reverse: unshift in a loop is O(n²) — a 10,000-path
        // drain measured 5.46ms against 0.25ms, for identical output
        coalesced.push({ path: entry.path, value: readScanned(entry.path) })
      }
      coalesced.reverse()
      // a drain that reaches past trimmed entries cannot claim completeness:
      // compare against the OLDEST entry still held, not a computed offset
      const oldestHeld = ledger.length > 0 ? ledger[0].seq : seq + 1
      const truncated = dropped > 0 && oldestHeld > since + 1
      return truncated
        ? { cursor: seq, changes: coalesced, truncated: true }
        : { cursor: seq, changes: coalesced }
    },

    log(): AgentLogEntry[] {
      return ledger.slice()
    },

    version: surfaceVersion,

    disable(): void {
      // IDEMPOTENT. A second disable() used to throw out of unobserve —
      // after already unregistering WebMCP, so subscriptions, pending
      // when()s and the global were left behind. The documented reconfigure
      // flow (enableAgentInterface auto-disables the previous surface, then
      // the app calls its own cleanup) hit this every time.
      if (disabled) return
      disabled = true
      webmcpRegistration?.unregister()
      webmcpRegistration = undefined
      delete surface.webmcp
      unobserve(ledgerListener)
      for (const listener of subscriptions) unobserve(listener)
      subscriptions.clear()
      for (const pending of pendingWhens) {
        pending.reject(new Error('agent interface disabled'))
      }
      pendingWhens.clear()
      // delete OUR global, and only if it is still ours: a stale surface
      // must never remove the current one's (activeGlobalName was
      // module-level, so it did exactly that)
      if (
        myGlobalName != null &&
        (globalThis as any)[myGlobalName] === surface
      ) {
        delete (globalThis as any)[myGlobalName]
      }
      if (active === surface) active = undefined
    },
  }

  if (global !== false) {
    myGlobalName = typeof global === 'string' ? global : 'tosiAgent'
    ;(globalThis as any)[myGlobalName] = surface
  }
  // one call, whole surface: where the browser provides a model-context
  // host, the generated WebMCP tool set registers automatically (and a
  // re-enable or disable() unregisters it — where the host allows). The
  // tools are LATE-BOUND: they always talk to the currently active surface,
  // so on hosts without unregistration (Canary today) a re-enable can't
  // strand the browser's tools on a disabled surface.
  active = surface
  if (webmcp !== false) {
    // the delegate deliberately captures NOTHING but the module-level
    // `active` (registration happens after it's set, above): on hosts
    // without unregistration the browser's tools live forever, and a
    // `?? surface` fallback would pin the first (long-disabled) surface —
    // and its ledger — for the page's lifetime, then talk to the ghost.
    // Disabled means REFUSED, and dead surfaces get to be garbage.
    const live = (): AgentInterface => {
      if (active == null) {
        throw new Error('agent interface: disabled (no active surface)')
      }
      return active
    }
    const delegate: AgentInterface = {
      describe: (o) => live().describe(o),
      read: (path) => live().read(path),
      write: (path, value) => live().write(path, value),
      observe: (path, cb) => live().observe(path, cb),
      call: (path, ...args) => live().call(path, ...args),
      changes: (since) => live().changes(since),
      when: (path, predicate) => live().when(path, predicate),
      log: () => live().log(),
      disable: () => live().disable(),
      // the delegate must be interrogable too — a WebMCP consumer asking
      // tosi_surface gets the CURRENT surface's identity, not a snapshot
      get version() {
        return live().version
      },
    }
    webmcpRegistration = webmcpAdapter(
      delegate,
      typeof webmcp === 'object' ? webmcp : {}
    )
    if (webmcpRegistration != null) {
      surface.webmcp = { tools: webmcpRegistration.tools }
    }
  }
  return surface
}
