export interface AgentExpose {
    roots?: string[];
    actions?: string[];
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
}
export interface AgentChange {
    path: string;
    value: any;
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
    log: () => Array<{
        seq: number;
        path: string;
    }>;
    disable: () => void;
}
export declare function enableAgentInterface(options?: AgentInterfaceOptions): AgentInterface;
