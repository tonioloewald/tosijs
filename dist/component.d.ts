import { XinStyleSheet } from './css-types';
import { ElementsProxy } from './elements-types';
import { elements } from './elements';
import { ElementCreator, ContentType, PartsMap } from './xin-types';
interface ElementCreatorOptions extends ElementDefinitionOptions {
    tag?: string;
    styleSpec?: XinStyleSheet;
}
export declare abstract class Component<T = PartsMap> extends HTMLElement {
    static elements: ElementsProxy;
    private static _elementCreator?;
    static initAttributes?: Record<string, any>;
    static formAssociated?: boolean;
    internals?: ElementInternals;
    static get observedAttributes(): string[];
    instanceId: string;
    styleNode?: HTMLStyleElement;
    static styleSpec?: XinStyleSheet;
    static styleNode?: HTMLStyleElement;
    content: ContentType | ((e: typeof elements) => ContentType) | null;
    isSlotted?: boolean;
    private static _tagName;
    static get tagName(): null | string;
    [key: string]: any;
    _legacyTrackedAttrs?: Set<string>;
    private _attrValues?;
    static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement;
    static elementCreator<C = Component>(this: new () => C, options?: ElementCreatorOptions): ElementCreator<C>;
    /**
     * @deprecated Use static initAttributes instead.
     * Example:
     *   static initAttributes = { caption: '', count: 0, disabled: false }
     */
    initAttributes(...attributeNames: string[]): void;
    private initValue;
    private _parts?;
    get parts(): T;
    /**
     * Native web component callback for attribute changes.
     * Only called for attributes declared in static observedAttributes.
     */
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    constructor();
    /**
     * Sets up property accessors from static initAttributes.
     */
    private _setupAttributeAccessors;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _changeQueued;
    private _renderQueued;
    queueRender(triggerChangeEvent?: boolean): void;
    private _hydrated;
    private hydrate;
    render(): void;
}
interface SlotParts extends PartsMap {
    slotty: HTMLSlotElement;
}
declare class XinSlot extends Component<SlotParts> {
    name: string;
    content: null;
    static replaceSlot(slot: HTMLSlotElement): void;
    constructor();
}
export declare const xinSlot: ElementCreator<XinSlot>;
export {};
