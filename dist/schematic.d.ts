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
/**
 * Rasterize an SVG string to a PNG Blob — the vision-encoder form of the map
 * (rasterize at 2× so labels land large enough to OCR near-losslessly).
 *
 * Browser-only by design: it uses Image + canvas, which keeps tosijs at zero
 * dependencies. Under bun/node, use `@resvg/resvg-js` directly instead:
 *
 *     const { Resvg } = await import('@resvg/resvg-js')
 *     const png = new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 } })
 *       .render().asPng()
 */
export declare const rasterizeSVG: (svg: string, options?: {
    scale?: number;
}) => Promise<Blob>;
