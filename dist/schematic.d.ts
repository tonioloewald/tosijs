import { AgentDescription } from './agent';
export interface SchematicOptions {
    /** padding around the drawn region, px (default 8) */
    pad?: number;
    /** boxes shorter than this get no caption (default 14) */
    minLabelHeight?: number;
    /** caption length limit (default 36) */
    maxCaption?: number;
    /** caption font size, px (default 11) */
    fontSize?: number;
}
export declare const schematicSVG: (description: AgentDescription, options?: SchematicOptions) => string;
