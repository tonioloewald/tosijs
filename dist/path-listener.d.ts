import { PathTestFunction, ObserverCallbackFunction, XinTouchableType } from './xin-types';
export declare const observerShouldBeRemoved: unique symbol;
export declare const listeners: Listener[];
/**
 * Synthesize id-path touches for a given array path, item index, and property suffix.
 * Called when we know we're touching something inside an array item.
 */
export declare function synthesizeIdPathTouches(arrayPath: string, index: number, item: any, suffix: string): string[];
export declare class Listener {
    description: string;
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
export declare const updates: () => Promise<void>;
export declare const touch: (touchable: XinTouchableType) => void;
export declare const observe: (test: string | RegExp | PathTestFunction, callback: ObserverCallbackFunction) => Listener;
export declare const unobserve: (listener: Listener) => void;
