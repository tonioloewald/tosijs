import { PathTestFunction, ObserverCallbackFunction, TosiTouchableType } from './xin-types';
/**
 * Return this from an observer callback to retire that observer.
 *
 * The only teardown form usable from INSIDE the callback, which makes it the
 * natural one for "stop when the thing I was updating is gone":
 *
 *     observe('app.thing', () => {
 *       if (!el.isConnected) return OBSERVER_SHOULD_BE_REMOVED
 *       ...
 *     })
 *
 * ⚠️ It was `observerShouldBeRemoved` and exported from THIS MODULE ONLY, so
 * it reached no entry point and no consumer could import it — the mechanism
 * was implemented, documented and unusable, and returning `undefined` instead
 * silently retired nothing (tosijs#45). Renamed to match the convention every
 * other exported constant here follows (TOSI_ACCESSOR, BOUND_CLASS,
 * TARGET_SIZE_DEFAULT) and wired into the entries. The rename is safe because
 * the `exports` map has no wildcard, so a deep import could never have
 * resolved it.
 */
export declare const OBSERVER_SHOULD_BE_REMOVED: unique symbol;
export declare const listeners: Listener[];
/**
 * Synthesize id-path touches for a given array path, item index, and property suffix.
 * Called when we know we're touching something inside an array item.
 */
export declare function synthesizeIdPathTouches(arrayPath: string, index: number, item: any, suffix: string): string[];
export declare const extendsPath: (prefix: string, path: string) => boolean;
export declare class Listener {
    description: string;
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
export declare const updates: () => Promise<void>;
export declare const touch: (touchable: TosiTouchableType) => void;
export declare const observe: (test: string | RegExp | PathTestFunction, callback: ObserverCallbackFunction) => Listener;
export declare const unobserve: (listener: Listener) => void;
