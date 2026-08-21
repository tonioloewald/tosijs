import { AgentDescription, AgentWiringRecord } from './agent';
export type AuditSeverity = 'error' | 'warn' | 'info';
export interface AuditFinding {
    /** stable rule id — see the table above */
    rule: string;
    severity: AuditSeverity;
    /** one line, phrased as what to fix */
    message: string;
    /** index into description.wiring — the same key the schematic stamps */
    index: number;
    record: AgentWiringRecord;
}
export interface AuditReport {
    findings: AuditFinding[];
    /** count of severity: 'error' findings */
    failed: number;
    /** rules that could not run, and why (an audit must not fail silently) */
    skipped: string[];
}
export interface AuditOptions {
    /** minimum interactive size, px (default 24 — WCAG 2.5.8 AA; 44/48 is the
     * platform touch bar). 0 disables the rule. */
    targetSize?: number;
    /** WCAG contrast floor (default 4.5 — AA for body text) */
    contrastRatio?: number;
    /** rule ids to skip */
    exclude?: string[];
}
export declare const contrastRatio: (foreground: string, background: string) => number | null;
/**
 * Audit an agent-surface description for accessibility defects. Pure over
 * plain data — no DOM — so it runs anywhere the map travels.
 */
export declare const auditAccessibility: (description: AgentDescription, options?: AuditOptions) => AuditReport;
/**
 * Audit findings as schematic `flags` — feed them straight to
 * `schematicSVG` and the drawing shows where the problems are.
 */
export declare const auditFlags: (report: AuditReport) => Record<number, Array<{
    kind: string;
    label: string;
    severity: AuditSeverity;
}>>;
