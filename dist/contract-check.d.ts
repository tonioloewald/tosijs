/**
 * A class's OWN `static contract`, or undefined.
 *
 * OWN, not inherited, and that is the whole point: `static` members reach a
 * subclass through the prototype chain, so `class Fancy extends Counter {}`
 * would otherwise silently wear Counter's claims — its parts map, its value
 * schema, its declared tests — and then fail them, or worse, pass them while
 * describing something it is not. The same reasoning that made
 * `_elementCreator` an own-property check.
 *
 * This was copy-pasted at six sites across four modules, with the rationale
 * re-written at four of them and the sites already differing in what they did
 * next. Callers that want a fallback (the agent surface's post-hoc
 * `components[tag]` map, `makeComponent`'s spec-level fill) layer it on top of
 * this, deliberately and visibly.
 */
export declare const ownContract: (cls: any) => any;
export type ContractValidator = (value: any, schema: Record<string, any>) => true | Error;
export interface SetContractValidatorOptions {
    /** later replacement (or removal) throws instead of warning */
    final?: boolean;
}
/**
 * Register the full-schema engine — or `null` to remove it.
 *
 * This is process-global and last-writer-wins, which is why replacement is
 * announced: one line anywhere in the bundle changes what every contract in
 * the app means. Pass `{ final: true }` to make later replacement throw.
 */
export declare function setContractValidator(validator: ContractValidator | null, options?: SetContractValidatorOptions): void;
/**
 * What full-schema engine is actually installed, if any. Without a read-back
 * an app cannot tell enforcement from the appearance of it.
 */
export declare function getContractValidator(): ContractValidator | null;
export declare const contractViolation: (value: any, schema: any) => string | null;
