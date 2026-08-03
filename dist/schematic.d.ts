import { AgentDescription } from './agent';
export interface SchematicBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface SchematicOptions {
    /** padding around the drawn region, px (default 8) */
    pad?: number;
    /** boxes shorter than this get no caption (default 14) */
    minLabelHeight?: number;
    /** caption length limit (default 36) */
    maxCaption?: number;
    /** caption font size, px (default 11) */
    fontSize?: number;
    /**
     * Scope the map SPATIALLY: only records whose bounds intersect this
     * page-coordinate rect are drawn, and the viewBox IS the rect — the
     * schematic becomes "this region of the page". Use `boundsOf(element)`
     * to scope to an element's region; omit for the whole map.
     */
    within?: SchematicBounds;
}
/**
 * An element's page-coordinate bounds (the same space describe() records) —
 * the natural `within` argument for a region-scoped schematic.
 */
export declare const boundsOf: (element: Element) => SchematicBounds;
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
