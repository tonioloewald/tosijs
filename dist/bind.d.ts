import { TosiEventHandler, TosiTouchableType, TosiBinding, TosiBindingSpec, TakeDescriptor, EventType } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
export declare function hydrateInsertedSubtree(node: Element): void;
interface BindingOptions {
    [key: string]: any;
}
/**
 * Re-arm the once-per-session shadow warning (testing only). The latch is
 * process-wide, so whichever test FIRST binds inside a shadow root spends it —
 * and which one that is depends on the order Bun runs test files, which
 * differs between macOS and Linux. The assertion that the warning fires then
 * passed on one OS and failed on the other.
 */
export declare function _resetShadowWarning(): void;
export declare const warnIfShadowed: (element: Element, what: string) => void;
export declare function bind<T extends Element = Element>(element: T, what: TosiTouchableType | TosiBindingSpec | TakeDescriptor, binding: TosiBinding<T>, options?: BindingOptions): T;
type RemoveListener = VoidFunction;
export declare function on<E extends HTMLElement, K extends EventType>(element: E, eventType: K, eventHandler: TosiEventHandler<HTMLElementEventMap[K], E>): RemoveListener;
export {};
