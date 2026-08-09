import { WebMCPAdapterOptions } from './webmcp';
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
    check: (path: string, value: any, proposal?: {
        root: string;
        proposed: any;
    }) => true | Error;
    /** serializable per-root contract (JSON-Schema-shaped, by convention) —
     * lands in describe().contract: "what's legal", not just what exists.
     * Its KEYS also tell core which roots are contracted (read once at
     * enable time) so proposals can be routed. */
    describe?: () => Record<string, any>;
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
    set?: Record<string, any>;
    /** click a declared part by name */
    click?: string;
    /** assertions: value (faithful deep-equal) and/or per-part textContent */
    expect?: {
        value?: any;
        text?: Record<string, string>;
    };
}
export interface ComponentMap {
    /** one line for humans and agents alike */
    description?: string;
    /** the value contract (JSON-Schema-shaped; examples/$counterexamples make
     * it executable — see exerciseComponent) */
    value?: Record<string, any>;
    /** attribute contracts by attribute name (JSON-Schema-shaped) */
    attributes?: Record<string, Record<string, any>>;
    /** methods the component exposes, by name */
    methods?: Record<string, {
        description?: string;
    }>;
    /** declared parts: part name → expected tag (lowercase). When the class is
     * declared `Component<typeof map>` (map `as const`), these tags TYPE
     * `this.parts` — the declaration is the type. */
    parts?: Record<string, string>;
    /** named behavioral tests as serializable step scripts — run by
     * exerciseComponent, declared beside the behavior they pin. An ARRAY, on
     * purpose: execution order should be explicit in a serializable contract
     * (JS objects reorder integer-like keys, and other languages' maps promise
     * nothing) — and each test still snapshot/restores, so order-independence
     * remains the goal, just not a load-bearing assumption. */
    tests?: Array<{
        name: string;
        steps: ComponentTestStep[];
    }>;
}
export interface AgentExpose {
    roots?: string[];
    actions?: string[];
    contract?: AgentContract;
}
export interface AgentInterfaceOptions {
    expose?: AgentExpose;
    /**
     * POST-HOC component contracts, by tag name — for lofting components whose
     * classes you don't control (a legacy app, a library's widgets, the doc
     * system itself). A class's OWN `static contract` always wins; these fill
     * the gaps. Works in ANY mode: the whole surface can be attached from
     * outside the app — a console, a userscript, an extension — and with this,
     * so can the component-level self-descriptions.
     */
    components?: Record<string, ComponentMap>;
    /** install as globalThis.tosiAgent (default true); pass a string to rename */
    global?: boolean | string;
    /**
     * Auto-register the generated WebMCP tool set when the browser provides a
     * model-context host (default true — a no-op where no host exists). Pass
     * adapter options to configure, or `false` to keep the surface off the
     * browser's tool registry. NOTE: per-action tools snapshot the surface at
     * enable time — enable AFTER the UI is wired (re-enabling reconfigures).
     */
    webmcp?: boolean | WebMCPAdapterOptions;
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
export declare const BOUND_TO_DOM = "\u27F5";
export declare const BOUND_TWO_WAY = "\u27F7";
/**
 * One wired element, flat: semantically visible facts (tag, label, text,
 * bound props, handlers) at the top; anything that can't be expressed flat
 * drops one level into `detail`.
 */
export interface AgentWiringRecord {
    tag: string;
    id?: string;
    part?: string;
    role?: string;
    /** harvested from aria-label(ledby) / title / alt — the accessible NAME */
    label?: string;
    /** the placeholder hint, kept distinct from label: an empty input with a
     * placeholder must never read as an input with content */
    placeholder?: string;
    /** input kind when it isn't plain text (checkbox, radio, range, …) */
    type?: string;
    /** live checked state for checkboxes and radios — DOM truth at map time */
    checked?: boolean;
    /** this element holds keyboard focus right now — where the user IS */
    focused?: boolean;
    /** resolved aria-describedby text — the author's own explanation */
    description?: string;
    /** present and true when the affordance is currently disabled */
    disabled?: boolean;
    /** present and true when the field is required */
    required?: boolean;
    /** present and true when the control's live ValidityState says invalid
     * (or aria-invalid is set) — the map reads what :invalid styles */
    invalid?: boolean;
    /** a link's destination — "says X" is not "goes to Y". Links are
     * intrinsic affordances: enumerated even when nothing else wires them;
     * the renderer captions nameless links by their href and always carries
     * href in the legend (URLs are the facts most often too long to draw) */
    href?: string;
    /** contenteditable: surfaces AS an input field. What matters to an agent
     * is that the region EXISTS and which path feeds it — it will read and
     * write the bound state directly, not synthesize keystrokes — so the
     * record leads with existence + bindings (live text as value,
     * aria-placeholder as hint), mapped even before bindings attach */
    contentEditable?: boolean;
    /** textContent — static ("foo") or bound ("foo ⟵ path") */
    text?: string;
    /** event handlers by type — a path string when nameable, 'ƒ' when anonymous */
    on?: Record<string, string | string[]>;
    /** a list binding rendering a collection */
    list?: {
        path: string;
        idPath?: string;
    };
    /** the component's own self-declaration, when its class carries a
     * `static componentMap` — the element doesn't just have affordances, it
     * DESCRIBES them */
    component?: ComponentMap;
    /** inline contract declared where the element was built
     * (`input({ bindValue, contract })`) — JSON-Schema-shaped; also aggregated
     * into describe().contract under the element's bound path */
    contract?: Record<string, any>;
    /** page-relative geometry — the layout IS part of the semantics; zero-size
     * means "not currently visible", which is itself information */
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** the element rides the VIEWPORT (fixed/sticky ancestry): bounds are
     * viewport coordinates, not page coordinates — screen furniture has no
     * stable page position */
    viewportFixed?: boolean;
    /** structure, not affordance: headings, landmarks, and the containers of
     * wired elements — the page's information architecture, mappable and
     * filterable */
    structural?: boolean;
    /** computed colors, harvested when describe({ styles: true }) */
    style?: {
        background: string;
        borderColor: string;
        color: string;
    };
    /** bindings that couldn't be named as a flat prop */
    detail?: Array<{
        path: string;
        readable: boolean;
        writable: boolean;
    }>;
    /** named bound props (value, checked, disabled, …): "value ⟷ path" strings */
    [boundProp: string]: unknown;
}
export interface AgentDescription {
    roots: Record<string, string>;
    wiring: AgentWiringRecord[];
    actions: string[];
    exposure: 'introspection' | 'manifest';
    /** what's LEGAL, per root — present when the manifest declares a contract */
    contract?: Record<string, any>;
}
export interface AgentChange {
    path: string;
    value: any;
}
export interface AgentLogEntry {
    seq: number;
    path: string;
    /** synthetic audit notes (e.g. when() arming/resolution) — not state touches */
    note?: string;
}
export interface AgentInterface {
    /**
     * `scope` limits the wiring walk to one element's SUBTREE — hierarchy
     * scoping ("this part of the app"), stable regardless of how big the
     * subtree renders. Contrast schematicSVG's `within` rect, which is
     * REGIONAL ("this area of the page") and includes whatever overlaps it.
     */
    describe: (options?: {
        styles?: boolean;
        scope?: Element;
        /** include the structural tier (headings/landmarks/containers) —
         * default true; pass false for affordances only */
        structure?: boolean;
        /** 'page' (default): every record, true unrolled-document coordinates —
         * the atlas. 'viewport': only what is VISIBLE right now, in screen
         * coordinates — the camera. Users see the viewport; pages are designed
         * to be legible in that frame, and so is its map. */
        view?: 'page' | 'viewport';
    }) => AgentDescription;
    read: (path: string) => any;
    write: (path: string, value: any) => void;
    observe: (path: string, callback: (path: string) => void) => () => void;
    call: (actionPath: string, ...args: any[]) => any;
    changes: (since?: number) => {
        cursor: number;
        changes: AgentChange[];
    };
    /**
     * Await a state CONDITION, not a change: resolves (with the satisfying
     * value) as soon as the value at `path` satisfies `predicate` — immediately
     * if it already does. The episodic agent's missing middle: name the world
     * you're waiting for and spend no inference until it arrives. The wait is
     * audit-logged. No built-in timeout — Promise.race one in if you need it.
     */
    when: (path: string, predicate: (value: any) => boolean) => Promise<any>;
    log: () => AgentLogEntry[];
    disable: () => void;
    /** names of the WebMCP tools auto-registered at enable time — set only
     * when a model-context host was present (feature-detect by presence) */
    webmcp?: {
        tools: string[];
    };
}
export declare function enableAgentInterface(options?: AgentInterfaceOptions): AgentInterface;
