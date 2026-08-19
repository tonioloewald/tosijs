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
