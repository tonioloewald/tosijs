/**
 * Interface for form validation functionality.
 * This is the public API that form-associated components expose.
 */
export interface FormValidation {
    /** The ElementInternals object for form participation */
    internals?: ElementInternals;
    /** The ValidityState of the element */
    readonly validity: ValidityState | undefined;
    /** The validation message */
    readonly validationMessage: string;
    /** Whether the element will be validated */
    readonly willValidate: boolean;
    /** Returns true if valid, fires 'invalid' event if not */
    checkValidity(): boolean;
    /** Like checkValidity() but also shows validation UI */
    reportValidity(): boolean;
    /** Set a custom error message (empty string clears) */
    setCustomValidity(message: string): void;
    /** Set validation state with optional focus anchor */
    setValidity(flags: ValidityStateFlags, message?: string, anchor?: HTMLElement): void;
    /** Update the form value */
    setFormValue(value: File | string | FormData | null, state?: File | string | FormData | null): void;
    /** Validate against required/minlength/maxlength/pattern attributes */
    validateValue(): void;
}
/**
 * Validates a value against standard HTML constraint attributes.
 * Used by Component.validateValue() - extracted here for clarity.
 */
export declare function validateAgainstConstraints(element: HTMLElement & {
    internals?: ElementInternals;
    value?: any;
}, value: string): void;
