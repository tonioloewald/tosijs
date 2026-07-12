export type Strictness = 'off' | 'warn' | 'throw';
export type PathCreation = 'off' | 'warn' | 'throw';
export declare const settings: {
    debug: boolean;
    perf: boolean;
    strictness: Strictness;
    pathCreation: PathCreation;
};
