import { ElementProps, ElementCreator, TosiBinding } from './xin-types';
import { type ElementsProxy } from './elements-types';
export declare const propBindingKey: (binding: TosiBinding) => string | undefined;
/**
 * Fold one props object into another — `bind` ACCUMULATES, everything else is
 * last-write-wins.
 *
 * Last-write-wins is right for scalar props and WRONG for `bind`: since
 * `.tosi.listBinding()` started emitting `bind` instead of the deprecated
 * `bindList`, a plain `Object.assign` silently destroyed one of two bindings.
 * Both orders failed without a word — caller's bind first dropped the caller's
 * binding, listBinding first destroyed the ENTIRE LIST, template unconsumed.
 *
 * EXPORTED AND SHARED because there are TWO addresses that fold props this
 * way: `create()` here and `Component.hydrate()`. The first fix landed only
 * here, so the identical bug survived in hydrate() — where host props in a
 * content array are documented to apply "just as they would be applied to the
 * element being created by div()". One helper, so they cannot drift again.
 */
export declare const mergeElementProps: (target: any, item: any) => void;
export declare const elementSet: (elt: HTMLElement, key: string, value: any) => void;
/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export declare const elements: ElementsProxy;
interface SVGElementsProxy {
    [key: string]: ElementCreator<SVGElement>;
}
export declare const svgElements: SVGElementsProxy;
interface MathMLElementsProxy {
    [key: string]: ElementCreator<MathMLElement>;
}
export declare const mathML: MathMLElementsProxy;
export declare function bindParts(root: Element, bindingMap: Record<string, ElementProps>, dataAttribute?: string): void;
export {};
