import { XinEventHandler, XinTouchableType, XinBinding, XinBindingSpec, TakeDescriptor, EventType } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
/**
 * Hydrate every bound element in a subtree that just entered the document.
 *
 * EXPORTED SO IT CAN BE TESTED. It used to be an inline closure inside the
 * MutationObserver callback, and coverage showed the whole block had never
 * executed in ANY of the suite's tests — including the isolation try/catch —
 * while sitting on top of a live defect (below). happy-dom delivers mutation
 * records unreliably enough that a test written against the observer passes
 * and fails by run order, which is the same hazard the throttled-handler note
 * in CLAUDE.md describes: test the function, let the real browser test the
 * wiring (there is a ```test doc fence for that).
 */
export declare function hydrateInsertedSubtree(node: Element): void;
interface BindingOptions {
    [key: string]: any;
}
export declare const warnIfShadowed: (element: Element, what: string) => void;
export declare function bind<T extends Element = Element>(element: T, what: XinTouchableType | XinBindingSpec | TakeDescriptor, binding: XinBinding<T>, options?: BindingOptions): T;
type RemoveListener = VoidFunction;
export declare function on<E extends HTMLElement, K extends EventType>(element: E, eventType: K, eventHandler: XinEventHandler<HTMLElementEventMap[K], E>): RemoveListener;
export {};
