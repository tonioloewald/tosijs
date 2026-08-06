export declare function setContractValidator(validator: ((value: any, schema: Record<string, any>) => true | Error) | null): void;
export declare const contractViolation: (value: any, schema: any) => string | null;
