import { LIST_BINDING_REF } from './metadata';
import { XinObject, ListBindingOptions } from './xin-types';
import { Listener } from './path-listener';
export declare class ListBinding {
    boundElement: Element;
    listTop: HTMLElement;
    listBottom: HTMLElement;
    template: Element;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, Element>;
    array: any[];
    private readonly _update?;
    private _previousSlice?;
    static filterBoundObservers: WeakMap<Element, Listener>;
    constructor(boundElement: Element, value: any[], options?: ListBindingOptions);
    private visibleSlice;
    private needle?;
    filter: (...args: any[]) => void;
    update(array?: any[], isSlice?: boolean): void;
}
interface ListBoundElement extends Element {
    [LIST_BINDING_REF]?: ListBinding;
}
export declare const getListBinding: (boundElement: ListBoundElement, value?: any[], options?: ListBindingOptions) => ListBinding | undefined;
export declare const getListInstance: (element: Element) => {
    element: Element;
    item: any;
} | undefined;
export declare const getListItem: (element: Element) => any;
export declare const deleteListItem: (element: Element) => boolean;
export {};
