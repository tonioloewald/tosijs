import { CSSSystemColor } from './css-system-color';
declare class HslColor {
    h: number;
    s: number;
    l: number;
    constructor(r: number, g: number, b: number);
}
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    static fromVar(varName: string, element?: HTMLElement): Color;
    static fromCss(spec: CSSSystemColor | string): Color;
    static fromHsl(h: number, s: number, l: number, a?: number): Color;
    static black: Color;
    static white: Color;
    constructor(r: number, g: number, b: number, a?: number);
    get inverse(): Color;
    get inverseLuminance(): Color;
    get opaque(): Color;
    contrasting(amount?: number): Color;
    get rgb(): string;
    get rgba(): string;
    get RGBA(): number[];
    get ARGB(): number[];
    private hslCached?;
    get _hsl(): HslColor;
    get hsl(): string;
    get hsla(): string;
    get mono(): Color;
    get brightness(): number;
    get html(): string;
    toString(): string;
    brighten(amount: number): Color;
    darken(amount: number): Color;
    saturate(amount: number): Color;
    desaturate(amount: number): Color;
    rotate(amount: number): Color;
    opacity(alpha: number): Color;
    swatch(): Color;
    blend(otherColor: Color, t: number): Color;
    static blendHue(a: number, b: number, t: number): number;
    mix(otherColor: Color, t: number): Color;
    colorMix(otherColor: Color, t: number): Color;
    private static computedColorStylesheet;
    private static computedColors;
    private static recomputeQueued;
    /**
     * Register a computed color variable. Called by vars proxy when a computed
     * color like `vars.primaryColor50b` is accessed.
     */
    static registerComputedColor(outputVar: string, sourceVar: string, scale: number, method: string): void;
    /**
     * Queue a recomputation of all computed color variables.
     * Called when observant stylesheets change.
     */
    static queueRecompute(): void;
    /**
     * Recompute all registered computed color variables and update the stylesheet.
     */
    private static recomputeColors;
}
export {};
