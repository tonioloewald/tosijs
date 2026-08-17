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

/** JSON-Schema keywords the built-in subset actually enforces */
const ENFORCED = new Set(['type', 'enum', 'const'])
/** keywords that are METADATA, not constraints — silence is correct */
const NOT_CONSTRAINTS = new Set([
  'description',
  'title',
  'default',
  'examples',
  '$counterexamples',
  '$comment',
  '$id',
  '$schema',
])
const failsOpenWarned = new Set<string>()

/**
 * Warn once per shape when a schema declares constraints the built-in
 * subset cannot check. Without this, the SAME shipped component enforces
 * differently depending on whether the host happened to register a full
 * validator — and nothing anywhere says so.
 */
const warnIfFailsOpen = (schema: any): void => {
  if (contractValidator != null) return // a real engine is installed
  const inert = Object.keys(schema).filter(
    (key) => !ENFORCED.has(key) && !NOT_CONSTRAINTS.has(key)
  )
  if (inert.length === 0) return
  const key = inert.sort().join(',')
  if (failsOpenWarned.has(key)) return
  failsOpenWarned.add(key)
  console.warn(
    `tosijs contracts: ${inert.join(', ')} ${inert.length === 1 ? 'is' : 'are'} ` +
      'NOT enforced by the built-in checker, which understands only ' +
      'type/enum/const — those constraints are currently inert. Register a ' +
      'full schema engine with setContractValidator(validate) (e.g. from ' +
      'tosijs-schema) to enforce them. Warned once per keyword set.'
  )
}

// the zero-dependency structural subset — covers the common case
// (value: { type: 'number' }) without any schema engine
export const contractViolation = (value: any, schema: any): string | null => {
  warnIfFailsOpen(schema)
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
