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
    /** tool-name prefix (default 'tosi') */
    prefix?: string;
}
/**
 * Generate the WebMCP tool set from the agent surface — pure; derives
 * everything from describe() and closes over the agent for execution.
 */
export declare const webmcpTools: (agent: AgentInterface, options?: WebMCPAdapterOptions) => WebMCPTool[];
export declare const webmcpAdapter: (agent: AgentInterface, options?: WebMCPAdapterOptions) => {
    tools: string[];
    unregister: () => void;
} | undefined;
