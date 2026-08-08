/**
 * tosijs-schematic — render an agent-surface map as a schematic SVG.
 *
 * A PURE FUNCTION over plain data: one record per wired element, drawn at
 * its true geometry, wearing the affordance grammar. No DOM, no framework,
 * no dependencies — the map travels as JSON, so this runs in the page, in
 * a headless embodiment, or on the far side of a wire from an app nobody
 * is viewing.
 *
 * The RECORD FORMAT is the contract (see README): tosijs's describe()
 * produces it, but anything that emits records gets the renderer — and
 * every consumer inherits the grammar's hard-won rules (geometry over
 * glyphs, hints are not content, ground is not figure).
 */
/** provenance tokens for bound values: "shown ⟵ path" (display-only) and
 * "shown ⟷ path" (two-way — user-writable). Part of the record format. */
export declare const BOUND_TO_DOM = "\u27F5";
export declare const BOUND_TWO_WAY = "\u27F7";
/**
 * One wired element, flat. Producers may include fields beyond these —
 * bound props ride as "value ⟷ path" strings under their own keys.
 */
export interface SchematicRecord {
    tag: string;
    id?: string;
    part?: string;
    role?: string;
    label?: string;
    placeholder?: string;
    type?: string;
    checked?: boolean;
    focused?: boolean;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    contentEditable?: boolean;
    description?: string;
    text?: string;
    on?: Record<string, string | string[]>;
    list?: {
        path: string;
        idPath?: string;
    };
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    viewportFixed?: boolean;
    structural?: boolean;
    style?: {
        background: string;
        borderColor: string;
        color: string;
    };
    /** a DURABLE, actionable handle from the producer (haltija's `@42`) —
     * survives re-renders where a wiring index doesn't; rendered in the
     * index slot in preference to the index, and emitted as data-ref */
    ref?: string;
    /** computed verdicts about this element (WCAG contrast failures, etc.) —
     * drawn as severity-colored bars on the LEFT edge (the unclaimed slot),
     * with the first flag's label */
    flags?: Array<{
        kind: string;
        label: string;
        severity?: 'info' | 'warn' | 'error';
    }>;
    /** pixels a pure renderer can't obtain: a data-URL snapshot of inline
     * media (serialized <svg>, <canvas>.toDataURL()) drawn IN PLACE — on an
     * illustration-led page the picture IS the content */
    image?: string;
    [boundProp: string]: unknown;
}
/** the map: only `wiring` is read. The named optional fields are the
 * known producer extras (tosijs's describe() shape) — deliberately NOT an
 * index signature, which would stop interface-typed producers (TS gives
 * implicit index signatures to literals, never to interfaces) from
 * assigning without casts. */
export interface SchematicDescription {
    wiring: SchematicRecord[];
    roots?: unknown;
    actions?: unknown;
    exposure?: unknown;
    contract?: unknown;
}
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
    /**
     * Stamp each box with its wiring index (top-right corner) — the raster
     * form of `data-record`: a vision consumer reads the number off the image
     * and looks the record up in `description.wiring[n]` — image as legend.
     */
    index?: boolean;
    /**
     * EXPERIMENTAL plugin seam: called once per drawn record, just before
     * its <g> closes — emit extra SVG into the record's group. The corner
     * slots already spoken for: top-left = invalid flag, top-right = index,
     * bottom-right = ↔ badge, outline = focus ring / emphasis. Claim empty
     * real estate; the first real plugins will shape the successor API.
     */
    decorate?: (ctx: {
        record: SchematicRecord;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        structural: boolean;
        emit: (svg: string) => void;
    }) => void;
}
/**
 * An element's page-coordinate bounds (the same space describe() records) —
 * the natural `within` argument for a region-scoped schematic.
 */
export declare const boundsOf: (element: Element) => SchematicBounds;
export declare const schematicSVG: (description: SchematicDescription, options?: SchematicOptions) => string;
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
