import { TosiStyleSheet } from './css-types';
import { ElementsProxy } from './elements-types';
import { elements } from './elements';
import { ElementCreator, ContentType, PartsMap } from './xin-types';
import { setContractValidator } from './contract-check';
import type { ComponentMap } from './agent';
export { setContractValidator };
/**
 * The marker `Component.computed()` returns, and the guard against wrapping a
 * setter twice (a subclass would otherwise double-queue every render).
 */
declare const COMPUTED_ATTRIBUTE: unique symbol;
export interface ComputedAttribute {
    [COMPUTED_ATTRIBUTE]: true;
    /** '' or false — records whether markup delivers a string or presence */
    shape: string | boolean;
}
/** tag-name literal → element type, for parts declared in a component contract */
type TagToElement<T> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element;
/**
 * Resolve the `parts` type from the Component generic. Two shapes are
 * accepted in the same slot:
 *
 * - a classic PartsMap (`{ readout: HTMLSpanElement }`) — used as-is;
 * - `typeof <contract>` (declare the contract `as const` so tags stay
 *   literal) — parts derive from `contract.parts` tag names, so THE
 *   DECLARATION IS THE TYPE, and the same declaration feeds describe(),
 *   exerciseComponent(), and this.parts typing.
 *
 * **"The declaration is the type" is ADDITIVE, not exhaustive** — worth
 * stating because the phrase oversells it. The derived shape is intersected
 * with `PartsMap` (`Record<string, Element>`), which it has to be: parts
 * resolve lazily by `[part]` attribute, so an undeclared part is a legitimate
 * runtime lookup, not an error. The cost is that a TYPO also typechecks —
 * `this.parts.readuot` is `Element` to tsc and throws when nothing matches.
 *
 * So the declaration buys you precise types for what you DID declare
 * (`this.parts.readout` is `HTMLSpanElement`, not `Element`); it does not
 * close the set. If you want the closed behaviour, the check that catches it
 * is `exerciseComponent()`, which verifies every declared part resolves and
 * matches its declared tag at runtime.
 */
export type PartsOf<T> = T extends {
    parts: infer P extends Record<string, string>;
} ? {
    [K in keyof P]: TagToElement<P[K]>;
} & PartsMap : T extends Record<string, Element> ? T : T extends ComponentMap ? PartsMap : T;
interface ElementCreatorOptions extends ElementDefinitionOptions {
    tag?: string;
    styleSpec?: TosiStyleSheet;
}
/**
 * The instance properties a component's `static initAttributes` installs.
 *
 * `initAttributes` keys become instance properties at hydration, which the
 * type system cannot infer from a static. Declare them in ONE line, using the
 * same declaration-merging trick `Component` uses internally:
 *
 *     export class Widget extends Component {
 *       static initAttributes = { month: 0, label: '' }
 *       render() { this.month + 1; this.label.trim() }   // typed, not `any`
 *     }
 *     export interface Widget extends ComponentAttrs<typeof Widget.initAttributes> {}
 *
 * You get real types (`number`, `string`) instead of the `any` the old
 * `[key: string]: any` index signature handed out — and typos still fail,
 * which is the point (tosijs#36).
 */
export type ComponentAttrs<T> = {
    -readonly [K in keyof T]: T[K];
};
/**
 * Declare a component's attributes as a VALUE, and get them typed on `this`.
 *
 *     export class TosiMonth extends withAttributes({
 *       month: 0,
 *       label: '',
 *     })<MonthParts> {
 *       render() {
 *         this.month + 1        // number
 *         this.label.trim()     // string
 *         this.nope()           // still a type error
 *       }
 *     }
 *
 * THE UNDERLYING PROBLEM: `static initAttributes` installs *instance*
 * properties at hydration, and TypeScript cannot derive an instance type from
 * a static declared in the same class — so `this.month` was only ever typed by
 * `Component`'s `[key: string]: any`, which typed it as `any` and, far worse,
 * accepted every typo in every component anyone wrote (tosijs#36).
 *
 * Passing the map as a value instead lets inference do the work: there is no
 * extra declaration to write and keep in step, and the attribute types are
 * read off the object you already had. `static initAttributes` still works
 * exactly as before — this is additive, and the two forms produce the same
 * runtime.
 */
/**
 * The attributes `withAttributes` declares ON the instance.
 *
 * COMPUTED attributes are deliberately excluded: `Component.computed()` means
 * "this class implements the property itself", normally as `get`/`set`. If the
 * synthesised base declared them too, every computed attribute would be a
 * property in the base and an accessor in the derived class — TS2611 — and its
 * type would be the `ComputedAttribute` marker rather than what the accessor
 * actually returns. Omitting them is not a workaround: the class IS the
 * declaration for those, which is the whole point of `computed()`.
 */
export type DeclaredAttributes<A> = {
    [K in keyof A as A[K] extends ComputedAttribute ? never : K]: A[K];
};
/**
 * What `withAttributes()` returns — NAMED, because an anonymous intersection
 * cannot be written into a downstream declaration file.
 *
 * tosijs-ui hit this adopting 1.10.0 (tosijs#38): `tsc --noEmit` was clean and
 * `tsc --declaration` failed with **TS2742** on all 34 migrated files —
 * "the inferred type of 'TosiMonth' cannot be named without a reference to
 * '../node_modules/tosijs/dist/component.js'". The pieces were all nameable;
 * the intersection was not, and `dist/component.d.ts` is not reachable through
 * `package.json` `exports`. So the package would have shipped JS with no types
 * for every component built this way — and it is not fixable downstream: a
 * named base const moves the error verbatim, and a `paths` mapping emits an
 * import their own consumers cannot resolve.
 *
 * Naming it here is the whole fix: `dist/` layout stays private, and a
 * downstream author who needs an explicit annotation has something to write.
 */
export type WithAttributes<A extends Record<string, any>> = (new <T = PartsMap>() => Component<T> & DeclaredAttributes<A>) & Omit<typeof Component, 'prototype' | 'initAttributes'> & {
    initAttributes: Record<string, any>;
};
export declare const withAttributes: <A extends Record<string, any>>(initAttributes: A) => WithAttributes<A>;
export declare abstract class Component<T = PartsMap> extends HTMLElement {
    static elements: ElementsProxy;
    private static _elementCreator?;
    static initAttributes?: Record<string, any>;
    static formAssociated?: boolean;
    static preferredTagName?: string;
    static shadowStyleSpec?: TosiStyleSheet;
    static lightStyleSpec?: TosiStyleSheet;
    static extends?: string;
    internals?: ElementInternals;
    get validity(): ValidityState | undefined;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    setCustomValidity(message: string): void;
    /**
     * Set validation state. Pass empty flags {} to clear validity.
     * The anchor element is used for focus when reportValidity() is called.
     */
    setValidity(flags: ValidityStateFlags, message?: string, anchor?: HTMLElement): void;
    /**
     * Set the form value. Call this when your component's value changes.
     */
    setFormValue(value: File | string | FormData | null, state?: File | string | FormData | null): void;
    /**
     * The attribute map the machinery actually uses. The two declaration forms
     * COMPOSE — they are not rivals:
     *
     * - `static initAttributes` DECLARES: name + default, type inferred. Terse,
     *   and what nearly every component uses.
     * - `contract.attributes` ENRICHES: the same, plus constraints the built-in
     *   checker enforces (`enum`, `const`) and anything a registered schema
     *   engine adds.
     *
     * A key in both is the INTENDED composition — declare it tersely, then
     * constrain it — so a contract entry may omit `default` when the key is
     * already declared in `initAttributes`. The contract wins per key.
     *
     * This used to THROW when a class declared both, which was wrong twice over:
     * the same two declarations split across a prototype chain already merged
     * cleanly (identical intent, opposite outcome, decided only by placement),
     * and "one source of truth" is a property of an attribute NAME, not of a
     * class — two disjoint declarations create no ambiguity at all. tosijs#29.
     */
    static _resolveInitAttributes(): Record<string, any> | undefined;
    /**
     * Declare an attribute the class computes itself.
     *
     *     static initAttributes = {
     *       fullName: Component.computed(''),      // markup delivers a string
     *       collapsed: Component.computed(false),  // presence = true
     *     }
     *     get fullName() { return `${this.first} ${this.last}` }
     *     set fullName(v: string) { … }            // MUST tolerate a string
     *
     * The class owns the value; tosijs owns the attribute-ness. Your setter is
     * wrapped so a change always re-renders — you never call `queueRender()`
     * yourself — and the name lands in `observedAttributes`, so markup changes
     * re-render too.
     *
     * The argument is a SHAPE, not a default: `''` for string-valued, `false`
     * for presence-valued. There is no number shape, because markup has no
     * numbers — take the string and parse it in your setter.
     *
     * A getter with no setter is legal, and means a read-only derived attribute.
     */
    static computed(shape?: string | boolean): ComputedAttribute;
    /**
     * The attributes as an AGENT should see them — `{ type, default }` per name,
     * however they were declared.
     *
     * THE BUG THIS EXISTS TO FIX (tosijs#29): `describe()` read a component's
     * attributes from `static contract` alone, so a component declaring
     * `static initAttributes` — the terse form nearly every component uses, and
     * the only one the component reference documents — appeared in the map with
     * NO attribute description at all. The agent surface could see the element
     * and what its value was bound to, and had no idea what attributes it had.
     * The majority API was invisible to the feature 1.8.0 was named for.
     *
     * Types are inferred exactly as the attribute machinery infers them, from
     * the default — including through a `Component.computed()` marker, whose
     * `shape` IS the type example. A `contract.attributes` entry wins per key,
     * because it is the richer statement (it can carry `enum`/`const`).
     */
    static _describedAttributes(): Record<string, any> | undefined;
    static get observedAttributes(): string[];
    instanceId: string;
    styleNode?: HTMLStyleElement;
    static styleSpec?: TosiStyleSheet;
    static styleNode?: HTMLStyleElement;
    content: ContentType | ((e: typeof elements) => ContentType) | null;
    isSlotted?: boolean;
    private static _tagName;
    static get tagName(): null | string;
    _legacyTrackedAttrs?: Set<string>;
    private _attrValues?;
    private _valueChanged;
    private _pendingAttrOps?;
    static StyleNode(styleSpec: TosiStyleSheet): HTMLStyleElement;
    static elementCreator<C = Component>(this: new () => C, options?: ElementCreatorOptions): ElementCreator<C>;
    /**
     * @deprecated Use static initAttributes instead.
     * Example:
     *   static initAttributes = { caption: '', count: 0, disabled: false }
     */
    initAttributes(...attributeNames: string[]): void;
    private initValue;
    private _parts?;
    private _partsCache;
    get parts(): PartsOf<T>;
    /**
     * Native web component callback for attribute changes.
     * Only called for attributes declared in static observedAttributes.
     */
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    /** computed attributes currently being applied FROM markup (re-entry guard) */
    private _applyingComputedAttr?;
    constructor();
    private _warnOnHandlerCollisions;
    private _installAttributeQueue;
    private _drainPendingAttrOps;
    /**
     * Sets up property accessors from static initAttributes.
     */
    private _installedAttrAccessors?;
    /** attrName → the typed value written and the string it reflected as, so a
     * type-contradicting write reads back as written (tosijs#24) */
    private _attrTypedOverride?;
    /**
     * Wire a computed attribute: the class owns `get`/`set`, we own the promise
     * that it behaves like an attribute.
     *
     * An attribute has two defining qualities, and neither is reflection:
     *
     * 1. **It re-renders when it changes after initialization.** If that is
     *    definitional then it has to be GUARANTEED, not documented — an author
     *    who forgets `this.queueRender()` in their setter has not written a
     *    slightly-broken attribute, they have written something that is not one.
     *    So the setter is wrapped rather than trusted. Changes arriving from
     *    MARKUP are already covered: `observedAttributes` derives from
     *    `initAttributes` keys, so `attributeChangedCallback` fires for these
     *    too.
     * 2. **It accepts a string (or boolean presence).** Markup can only deliver
     *    those, and `<el full-name>` delivers the EMPTY string specifically —
     *    the case a naive `split(' ')` setter gets wrong. The declared `shape`
     *    records which of the two this is, for `describe()` and the contract.
     *
     * A getter with no setter is legal and means a read-only derived attribute:
     * quality 1 still holds via `attributeChangedCallback`, and quality 2 is
     * vacuous because nothing can set it.
     */
    private _installComputedAttribute;
    /** computed attribute name → declared shape ('string' | 'boolean') */
    private _computedAttrShapes?;
    private _setupAttributeAccessors;
    private _installAttrAccessor;
    private _recoverShadowedAttrAccessors;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * Called when the form is reset. Override to customize reset behavior.
     * Default: resets value to defaultValue or empty string.
     */
    formResetCallback(): void;
    /**
     * Called when the form or a parent fieldset is disabled/enabled.
     * Default: syncs the disabled attribute.
     */
    formDisabledCallback(disabled: boolean): void;
    /**
     * Called when browser restores form state (back/forward navigation).
     * Default: restores the value.
     */
    formStateRestoreCallback(state: string | File | FormData | null): void;
    private _changeQueued;
    private _renderQueued;
    queueRender(triggerChangeEvent?: boolean): void;
    private _hydrated;
    private _whenHydrated?;
    private _resolveHydrated?;
    /**
     * `true` once `hydrate()` has run (content instantiated, shadow root
     * attached). Read this instead of probing `parts` to find out whether the
     * element is ready — a pre-hydration `parts` read is meaningless (there is no
     * content yet) and used to permanently poison the proxy.
     */
    get hydrated(): boolean;
    /**
     * Resolves once the element is hydrated. `await el.whenHydrated` before doing
     * `parts`-dependent work on an element that may not be inserted yet (e.g. one
     * fresh from `elementCreator()`), instead of hand-queuing pending operations.
     * Already-hydrated elements resolve immediately.
     */
    get whenHydrated(): Promise<void>;
    private hydrate;
    render(): void;
    /**
     * Validates the current value against standard constraints (required, minlength, maxlength, pattern).
     * Called automatically in render() when value changes. Override to add custom validation.
     * Call super.validateValue() to include standard validation.
     *
     * See [web-component-validation](/form-validation/) for details.
     */
    validateValue(): void;
}
interface SlotParts extends PartsMap {
    slotty: HTMLSlotElement;
}
declare class TosiSlot extends Component<SlotParts> {
    static preferredTagName: string;
    static initAttributes: {
        name: string;
    };
    /** installed by `initAttributes` at hydration — see the Blueprint note */
    name: string;
    content: null;
    static replaceSlot(slot: HTMLSlotElement): void;
}
export declare const tosiSlot: ElementCreator<TosiSlot>;
/**
 * @deprecated Use `tosiSlot()`. Kept because 1.7's warning never named a
 * removal version — only `data-ref` did — so removing it outright in a
 * MINOR would have broken code that was promised nothing. It now creates a
 * `<tosi-slot>` (composition is identical; only the tag name differs, which
 * matters solely if you wrote CSS against `xin-slot`). Removed in 2.0.
 */
export declare const xinSlot: typeof tosiSlot;
