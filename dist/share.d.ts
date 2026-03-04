/**
 * Pluggable store interface for testing.
 * Default implementation uses IndexedDB. Tests can replace with an in-memory store.
 */
export interface ShareStore {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}
/** Replace the default IndexedDB store (mainly for testing). */
export declare function setShareStore(s: ShareStore): void;
export declare function share(...proxies: any[]): Promise<{
    restored: any[];
}>;
