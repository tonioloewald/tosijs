import { TosiEventHandler, TosiTouchableType, TosiBinding, TosiBindingSpec, TakeDescriptor, EventType } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
export declare function hydrateInsertedSubtree(node: Element): void;
interface BindingOptions {
    [key: string]: any;
}
export declare const warnIfShadowed: (element: Element, what: string) => void;
export declare function bind<T extends Element = Element>(element: T, what: TosiTouchableType | TosiBindingSpec | TakeDescriptor, binding: TosiBinding<T>, options?: BindingOptions): T;
type RemoveListener = VoidFunction;
export declare function on<E extends HTMLElement, K extends EventType>(element: E, eventType: K, eventHandler: TosiEventHandler<HTMLElementEventMap[K], E>): RemoveListener;
export {};
