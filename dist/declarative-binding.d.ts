export type DeclarativeGrant = Array<string | {
    [key: string]: any;
}> | ((path: string) => boolean);
export interface DeclarativeBindingOptions {
    /** paths (or proxies) markup may show */
    read?: DeclarativeGrant;
    /** paths a two-way binding may write */
    write?: DeclarativeGrant;
    /** functions markup may call, and paths trusted to act (href, src, …) */
    actions?: DeclarativeGrant;
    /** where to look; defaults to document.body */
    root?: Element;
}
export interface DeclarativeBinding {
    /** bind the data-tosi-* attributes on an element and its descendants */
    hydrate(element: Element): void;
    /** stop watching for inserted markup; bindings already made stay */
    disable(): void;
}
export declare const enableDeclarativeBinding: (options?: DeclarativeBindingOptions) => DeclarativeBinding;
