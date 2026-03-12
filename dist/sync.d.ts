export interface SyncMessage {
    path: string;
    value: any;
}
export interface SyncTransport {
    /** Send a batch of outbound deltas */
    send(messages: SyncMessage[]): void;
    /** Register the handler for inbound message batches */
    onReceive(handler: (messages: SyncMessage[]) => void): void;
    /** Open the connection */
    connect(): Promise<void> | void;
    /** Close the connection */
    disconnect(): void;
}
export interface SyncOptions {
    /** Outbound throttle interval in ms (default: 100) */
    throttleInterval?: number;
}
export declare function sync(transport: SyncTransport, options: SyncOptions, ...proxies: any[]): Promise<{
    disconnect: () => void;
}>;
