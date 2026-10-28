export declare const under: (path: string, root: string) => boolean;
export declare const findRoot: (roots: Iterable<string>, path: string) => string | undefined;
export declare const inboundTracker: () => {
    isInbound: (path: string) => boolean;
    apply(path: string, value: any): void;
};
