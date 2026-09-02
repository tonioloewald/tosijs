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
    /** register tosi_write even outside `expose: 'all'` (default false) */
    allowWrites?: boolean;
    /** register tosi_read / tosi_changes on a CLOSED surface (default false).
     * Rarely what you want since 1.9.0: a closed surface exposes nothing, so
     * the published tools refuse every path. Declare `expose: { roots }`
     * instead — that publishes them AND gives them something to read. */
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
