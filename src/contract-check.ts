/*{ "parent": "utilities", "description": "shared zero-dependency contract validation: the structural JSON-Schema subset (type/enum/const) plus the pluggable full-schema validator, used by component value contracts and inline element contracts alike." }*/

// full-schema validation is pluggable (the setPredicateEvaluator idiom —
// tosijs stays zero-dep); until one is registered, the native structural
// subset below (type / enum / const) still enforces
let contractValidator:
  | ((value: any, schema: Record<string, any>) => true | Error)
  | null = null
export function setContractValidator(
  validator: ((value: any, schema: Record<string, any>) => true | Error) | null
): void {
  contractValidator = validator
}

// the zero-dependency structural subset — covers the common case
// (value: { type: 'number' }) without any schema engine
export const contractViolation = (value: any, schema: any): string | null => {
  if (schema.const !== undefined && value !== schema.const) {
    return `expected const ${JSON.stringify(schema.const)}`
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    return `expected one of ${JSON.stringify(schema.enum)}`
  }
  if (typeof schema.type === 'string') {
    const t = schema.type
    const ok =
      t === 'array'
        ? Array.isArray(value)
        : t === 'null'
        ? value === null
        : t === 'integer'
        ? typeof value === 'number' && Number.isInteger(value)
        : t === 'object'
        ? typeof value === 'object' && value !== null && !Array.isArray(value)
        : typeof value === t
    if (!ok) {
      return `expected type ${t}, got ${
        Array.isArray(value) ? 'array' : typeof value
      }`
    }
  }
  if (contractValidator != null) {
    const verdict = contractValidator(value, schema)
    if (verdict !== true) return verdict.message
  }
  return null
}
