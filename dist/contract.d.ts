import { AgentInterface } from './agent';
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
