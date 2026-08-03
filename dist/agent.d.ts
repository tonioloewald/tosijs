/**
 * The contract seam — tosijs stays zero-dependency, so the core doesn't know
 * any schema language; it knows a CHECK. The blessed adapter is a few lines
 * over tosijs-schema (`validate` on write, schemas into `describe()`), but
 * anything that can say "no, and here's why" fits.
 */
export interface AgentContract {
    /** validate a write at `path`; `true`, or an Error saying WHY (the refusal
     * is part of the surface — agents self-correct from reasons, not booleans) */
    check: (path: string, value: any) => true | Error;
    /** serializable per-root contract (JSON-Schema-shaped, by convention) —
     * lands in describe().contract: "what's legal", not just what exists */
    describe?: () => Record<string, any>;
}
/**
 * A component's self-declaration: contract, description, part map, and test
 * fixture in ONE structure. Declared as `static componentMap` on a Component
 * subclass; harvested by describe() for any wired instance; exercised by
 * `exerciseComponent()` — a declaration that feeds the map, the agent, and
 * the harness breaks visibly when it lies.
 */
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
    /** declared parts: part name → expected tag (lowercase) */
    parts?: Record<string, string>;
}
export interface AgentExpose {
    roots?: string[];
    actions?: string[];
    contract?: AgentContract;
}
export interface AgentInterfaceOptions {
    expose?: AgentExpose;
    /** install as globalThis.tosiAgent (default true); pass a string to rename */
    global?: boolean | string;
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
    /** harvested from aria-label / title / placeholder / alt */
    label?: string;
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
    /** page-relative geometry — the layout IS part of the semantics; zero-size
     * means "not currently visible", which is itself information */
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
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
    describe: (options?: {
        styles?: boolean;
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
}
export declare function enableAgentInterface(options?: AgentInterfaceOptions): AgentInterface;
