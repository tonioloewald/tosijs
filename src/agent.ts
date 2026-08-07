/*{ "parent": "utilities", "description": "EXPERIMENTAL agent interface: expose a tosijs app's state, wiring, and actions to AI agents (and test harnesses) as a described, observable, path-addressed surface." }*/
/*#
# agent (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

    import { enableAgentInterface } from 'tosijs'

    const agent = enableAgentInterface() // introspection mode: expose everything

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read('app.filter')  // serializable value
    agent.write('app.filter', 'milk') // through the same observers as any write
    agent.observe('app.cart', (path) => { ... }) // push; returns un-observe
    agent.call('app.addItem', 'buy milk')        // invoke an action by path
    agent.changes(cursor)     // turn-based drain: final value per changed path
    await agent.when('app.order.status', (s) => s === 'confirmed') // await a condition
    agent.log()               // the audit trail

In production, expose only what you declare:

    enableAgentInterface({
      expose: {
        roots: ['app.cart', 'app.filter'],
        actions: ['app.addItem', 'app.checkout'],
      },
    })

One call is the whole story: where the browser provides a WebMCP host
(`document.modelContext`), `enableAgentInterface()` also registers the
generated tool set automatically — `agent.webmcp` is the receipt, and
`webmcp: false` opts out. No host, no-op.

> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it; the WebMCP
> auto-registration is a convenience over that adapter, not a dependency.
*/
import { registry } from './registry'
import { observe, unobserve, Listener } from './path-listener'
import { setByPath } from './by-path'
import { xin } from './xin'
import {
  BOUND_CLASS,
  getElementBindings,
  elementToHandlers,
  elementContract,
  tosiValue,
  tosiPath,
} from './metadata'
import { contractViolation } from './contract-check'
import { bindings } from './bindings'
import { propBindingKey } from './elements'
import { webmcpAdapter, WebMCPAdapterOptions } from './webmcp'

/**
 * The contract seam — tosijs stays zero-dependency, so the core doesn't know
 * any schema language; it knows a CHECK. The blessed adapter is a few lines
 * over tosijs-schema (`validate` on write, schemas into `describe()`), but
 * anything that can say "no, and here's why" fits.
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
  /** one line for humans and agents alike */
  description?: string
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
}

export interface AgentInterfaceOptions {
  expose?: AgentExpose
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

export interface AgentDescription {
  roots: Record<string, string>
  wiring: AgentWiringRecord[]
  actions: string[]
  exposure: 'introspection' | 'manifest'
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
  changes: (since?: number) => { cursor: number; changes: AgentChange[] }
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
  /** names of the WebMCP tools auto-registered at enable time — set only
   * when a model-context host was present (feature-detect by presence) */
  webmcp?: { tools: string[] }
}

// a path is "under" a root if it IS the root or extends it by a segment
const underRoot = (path: string, root: string): boolean =>
  path === root ||
  (path.startsWith(root) &&
    (path[root.length] === '.' || path[root.length] === '['))

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
): { bounds: NonNullable<AgentWiringRecord['bounds']>; fixed: boolean } | null => {
  const rect = (el as HTMLElement).getBoundingClientRect?.()
  if (rect == null) return null
  if (viewportView) {
    // the camera: screen coordinates, and only what the screen shows
    const vw = (globalThis as any).innerWidth ?? 0
    const vh = (globalThis as any).innerHeight ?? 0
    const onScreen =
      rect.x < vw && rect.y < vh && rect.x + rect.width > 0 && rect.y + rect.height > 0
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
    labelEl =
      el.ownerDocument?.querySelector?.(`label[for="${el.id}"]`) ?? null
  }
  const text = labelEl?.textContent?.trim().slice(0, 60)
  return text || undefined
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
  // form controls: the control's kind and LIVE state are facts of the map
  if (record.tag === 'input') {
    const type = (el as any).type || 'text'
    if (type !== 'text') record.type = type
    if (type === 'checkbox' || type === 'radio') {
      record.checked = (el as any).checked === true
    }
  }
  const description = referencedText(el, 'aria-describedby')
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
    ((el as any).willValidate === true &&
      (el as any).validity?.valid === false)
  ) {
    record.invalid = true
  }
  return record
}

// resolve the inline contract governing a path, if any element declares one:
// scanned from the live bound elements at write time — deliberately NOT a
// path→element index (virtual lists thrash those; the DOM is the registry)
const inlineSchemaFor = (path: string): Record<string, any> | undefined => {
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
const boundValue = (path: string, twoWay: boolean): string => {
  const raw = serialize(xin[path])
  const shown =
    raw === undefined ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
  const arrow = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM
  return shown ? `${shown} ${arrow} ${path}` : `${arrow} ${path}`
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

let active: AgentInterface | undefined
let activeGlobalName: string | undefined

export function enableAgentInterface(
  options: AgentInterfaceOptions = {}
): AgentInterface {
  // re-enabling reconfigures: tear down the previous surface first
  if (active != null) active.disable()

  const { expose, components, global = true, webmcp = true } = options
  let webmcpRegistration:
    | { tools: string[]; unregister: () => void }
    | undefined
  const roots = expose?.roots
  const exposedActions = expose?.actions
  const contract = expose?.contract
  // contracted roots (the describe() keys) are read ONCE at enable time so
  // sub-path writes can be routed to a whole-root proposal
  const contractRoots =
    contract?.describe != null ? Object.keys(contract.describe()) : []
  const manifestMode = expose != null

  const inScope = (path: string): boolean =>
    !manifestMode ||
    (roots ?? []).some((root) => underRoot(path, root)) ||
    (exposedActions ?? []).some((action) => underRoot(path, action))

  // writes are gated on declared ROOTS only: a declared action is callable,
  // not writable — otherwise `actions: ['app.checkout']` would let an agent
  // REPLACE app.checkout (a function) with agent-supplied data
  const writable = (path: string): boolean =>
    !manifestMode || (roots ?? []).some((root) => underRoot(path, root))

  const assertScope = (path: string): void => {
    if (!inScope(path)) {
      throw new Error(
        `agent interface: "${path}" is not exposed (manifest mode)`
      )
    }
  }

  // the audit ledger — one global observer; every touch lands here.
  // log/changes are two consumptions of this one stream. Entries with a
  // `note` are synthetic audit events (when() arming etc.), visible in
  // log() but skipped by the changes() drain.
  let seq = 0
  const ledger: AgentLogEntry[] = []
  const pendingWhens = new Set<{ reject: (reason: Error) => void }>()
  const ledgerListener: Listener = observe(
    () => true,
    (path: string) => {
      if (inScope(path)) ledger.push({ seq: ++seq, path })
    }
  )
  const subscriptions = new Set<Listener>()

  const read = (path: string): any => {
    assertScope(path)
    return serialize(xin[path])
  }

  const surface: AgentInterface = {
    describe(
      options: {
        styles?: boolean
        scope?: Element
        structure?: boolean
        view?: 'page' | 'viewport'
      } = {}
    ): AgentDescription {
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
                record.list = idPath ? { path: b.path, idPath } : { path: b.path }
                continue
              }
              const name = bindingName(b.binding)
              if (name != null && record[name] === undefined) {
                record[name] = boundValue(b.path, b.binding.fromDOM != null)
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
            for (const [type, set] of Object.entries(eventBindings)) {
              const names = Array.from(set as Set<any>, (h) => {
                if (typeof h === 'string') return h
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
              wired = true
            }
          }
          // static text, when textContent isn't already surfaced as bound
          if (record.text === undefined) {
            const text = (el.textContent || '').trim().slice(0, 40)
            if (text) record.text = text
          }
          // an UNBOUND form control still holds a live value — harvest it
          // (no provenance arrow: a plain string means "current, not bound")
          if (
            record.value === undefined &&
            record.checked === undefined &&
            (record.tag === 'input' ||
              record.tag === 'textarea' ||
              record.tag === 'select')
          ) {
            const liveValue = String((el as any).value ?? '').slice(0, 40)
            if (liveValue) record.value = liveValue
          }
          // contenteditable: live text is its value; the region is an
          // affordance in itself, mapped even before bindings attach
          if (record.contentEditable === true) {
            if (record.value === undefined) {
              const liveText = (el.textContent || '').trim().slice(0, 40)
              if (liveText) record.value = liveText
            }
            wired = true
          }
          if (inline != null) {
            record.contract = inline
            if (inlinePath != null && inlineContracts[inlinePath] === undefined) {
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
            if (
              cls != null &&
              Object.prototype.hasOwnProperty.call(cls, 'contract')
            ) {
              record.component = (cls as any).contract
            } else if (components?.[record.tag] != null) {
              record.component = components[record.tag]
            }
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
          return wired ? record : undefined
        }
        for (const el of Array.from(
          walkRoot.getElementsByClassName(BOUND_CLASS)
        )) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        for (const el of [walkRoot, ...Array.from(walkRoot.querySelectorAll('*'))]) {
          if (elementToHandlers.has(el)) {
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
        roots: rootSummary,
        wiring,
        actions,
        exposure: manifestMode ? 'manifest' : 'introspection',
      }
      // inline declarations fill the contract; top-level curation OVERRIDES
      // on collision — declare where you build, curate at the top
      const declared =
        contract?.describe != null ? contract.describe() : undefined
      const merged = { ...inlineContracts, ...(declared ?? {}) }
      if (Object.keys(merged).length > 0) {
        description.contract = merged
      }
      return description
    },

    read,

    write(path: string, value: any): void {
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
          .filter((contractRoot) => underRoot(path, contractRoot))
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
          ledger.push({
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
      const curated =
        contract != null &&
        contractRoots.some((contractRoot) => underRoot(path, contractRoot))
      if (!curated) {
        const schema = inlineSchemaFor(path)
        if (schema != null) {
          const err = contractViolation(value, schema)
          if (err != null) {
            ledger.push({
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
      return () => {
        subscriptions.delete(listener)
        unobserve(listener)
      }
    },

    call(actionPath: string, ...args: any[]): any {
      if (manifestMode && !(exposedActions ?? []).includes(actionPath)) {
        throw new Error(
          `agent interface: action "${actionPath}" is not exposed (manifest mode)`
        )
      }
      const fn = xin[actionPath]
      if (typeof fn !== 'function') {
        throw new Error(`agent interface: "${actionPath}" is not an action`)
      }
      return fn(...args)
    },

    // await a state condition: the value now if it already satisfies,
    // otherwise the first settling round where it does
    when(path: string, predicate: (value: any) => boolean): Promise<any> {
      assertScope(path)
      const current = serialize(xin[path])
      let alreadySatisfied: boolean
      try {
        alreadySatisfied = predicate(current)
      } catch (e) {
        // predicate errors use one channel: the returned promise
        return Promise.reject(e)
      }
      if (alreadySatisfied) {
        ledger.push({ seq: ++seq, path, note: 'when: already satisfied' })
        return Promise.resolve(current)
      }
      ledger.push({
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
            ledger.push({ seq: ++seq, path, note: 'when: resolved' })
            settle(() => resolve(value))
          }
        })
        subscriptions.add(listener)
      })
    },

    // turn-based drain: everything since the cursor, coalesced to one entry
    // per path (final value read at drain time — updates()' settling
    // semantics, extended across agent turns)
    changes(since = 0): { cursor: number; changes: AgentChange[] } {
      const seenPaths = new Set<string>()
      const coalesced: AgentChange[] = []
      for (let i = ledger.length - 1; i >= 0; i--) {
        const entry = ledger[i]
        if (entry.seq <= since) break
        if (entry.note != null) continue // audit notes are not state changes
        if (seenPaths.has(entry.path)) continue
        seenPaths.add(entry.path)
        coalesced.unshift({ path: entry.path, value: read(entry.path) })
      }
      return { cursor: seq, changes: coalesced }
    },

    log(): AgentLogEntry[] {
      return ledger.slice()
    },

    disable(): void {
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
      if (activeGlobalName != null) {
        delete (globalThis as any)[activeGlobalName]
        activeGlobalName = undefined
      }
      if (active === surface) active = undefined
    },
  }

  if (global !== false) {
    activeGlobalName = typeof global === 'string' ? global : 'tosiAgent'
    ;(globalThis as any)[activeGlobalName] = surface
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
