import type { AgentInterface } from './agent';
export interface WebMCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    execute: (input: Record<string, any>) => any;
}
export interface WebMCPAdapterOptions {
    /** explicit host (tests, or a future relocation of the API) */
    modelContext?: any;
    /** register tosi_write even outside introspection mode (default false) */
    allowWrites?: boolean;
    /** register tosi_read / tosi_changes on an UNSCOPED read-only surface
     * (default false) — the deliberate opt-in for "publish a read of
     * everything" when you don't want to declare an `expose` manifest */
    allowReads?: boolean;
    /** tool-name prefix (default 'tosi') — namespace this surface when the
     * page carries more than one, or when another script owns the plain names */
    prefix?: string;
}
/**
 * Generate the WebMCP tool set from the agent surface — pure; derives
 * everything from describe() and closes over the agent for execution.
 */
export declare const webmcpTools: (agent: AgentInterface, options?: WebMCPAdapterOptions) => WebMCPTool[];
/**
 * Detect the WebMCP host, register the generated tools, return
 * { tools, unregister } — or undefined when no host API is present.
 */
export declare const webmcpAdapter: (agent: AgentInterface, options?: WebMCPAdapterOptions) => {
    tools: string[];
    unregister: () => void;
} | undefined;
