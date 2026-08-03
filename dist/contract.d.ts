import { AgentInterface, ComponentMap } from './agent';
export interface ContractTrial {
    root: string;
    kind: 'example' | 'counterexample';
    value: any;
    passed: boolean;
    error?: string;
}
export interface ContractReport {
    passed: number;
    failed: number;
    trials: ContractTrial[];
}
/**
 * Exercise every example and counterexample in the surface's declared
 * contract, through the surface itself. Pure over the public API — usable
 * from bun test, a doc fence, or an agent's own self-check.
 */
export declare const exerciseContract: (agent: AgentInterface) => ContractReport;
export interface ComponentTrial {
    claim: string;
    passed: boolean;
    error?: string;
}
export interface ComponentReport {
    passed: number;
    failed: number;
    trials: ComponentTrial[];
}
/**
 * Exercise a CONNECTED component instance against its own `componentMap`
 * self-declaration (passed explicitly, or read from the instance's class):
 *
 * - every declared **part** must resolve inside the instance and match its
 *   declared tag — the map of parts to internal elements, verified live;
 * - every declared **method** must exist as a function;
 * - every **value example** must round-trip through the instance's `value`
 *   (faithful comparison — the same discipline as exerciseContract).
 *
 * The component equivalent of a signature test: the declaration that types
 * the parts, informs the agent, and documents the component is the same one
 * the harness executes.
 */
export declare const exerciseComponent: (element: HTMLElement, map?: ComponentMap) => ComponentReport;
