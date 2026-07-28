export interface AgentExpose {
    roots?: string[];
    actions?: string[];
}
export interface AgentInterfaceOptions {
    expose?: AgentExpose;
    /** install as globalThis.tosiAgent (default true); pass a string to rename */
    global?: boolean | string;
}
export interface AgentWiringRecord {
    element: {
        tag: string;
        id?: string;
        part?: string;
        role?: string;
        label?: string;
    };
    bindings?: Array<{
        path: string;
        readable: boolean;
        writable: boolean;
        idPath?: string;
    }>;
    handlers?: Record<string, string[]>;
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
    describe: () => AgentDescription;
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
