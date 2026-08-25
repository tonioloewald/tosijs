import { describe, test, expect } from 'bun:test'

// The validator plug is process-global BY DESIGN (one gate, every
// declaration site), and { final: true } is permanent BY DESIGN — there is
// no unlock. So every test takes its own module instance via a cache-busting
// query specifier; without this a single lock test would poison the file.
let instances = 0
const freshModule = async (): Promise<typeof import('./contract-check')> =>
  (await import(`./contract-check.ts?case=${++instances}`)) as any

const captureWarnings = async (fn: () => void): Promise<string[]> => {
  const warnings: string[] = []
  const original = console.warn
  console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
  try {
    fn()
  } finally {
    console.warn = original
  }
  return warnings
}

const permissive = function permissive() {
  return true as const
}
const strict = function strict() {
  return new Error('nope')
}

describe('setContractValidator — the plug is a security boundary (SEC-13)', () => {
  test('getContractValidator reads back what is actually installed', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    expect(getContractValidator()).toBe(null)
    setContractValidator(permissive)
    expect(getContractValidator()).toBe(permissive)
    await captureWarnings(() => setContractValidator(null)) // warns: see below
    expect(getContractValidator()).toBe(null)
  })

  test('installing the FIRST validator is silent — nothing is being replaced', async () => {
    const { setContractValidator } = await freshModule()
    const warnings = await captureWarnings(() => {
      setContractValidator(permissive)
    })
    expect(warnings).toEqual([])
  })

  test('replacing an installed validator warns, naming both sides', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    setContractValidator(strict)
    const warnings = await captureWarnings(() => {
      setContractValidator(permissive)
    })
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('REPLACED')
    expect(warnings[0]).toContain('strict()')
    expect(warnings[0]).toContain('permissive()')
    expect(warnings[0]).toContain('getContractValidator()')
    expect(warnings[0]).toContain('final: true')
    // the replacement still happens — this announces, it does not veto
    expect(getContractValidator()).toBe(permissive)
  })

  test('REMOVING a validator warns too — uninstalling enforcement is the same event', async () => {
    const { setContractValidator } = await freshModule()
    setContractValidator(strict)
    const warnings = await captureWarnings(() => {
      setContractValidator(null)
    })
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('REMOVED')
    expect(warnings[0]).toContain('strict()')
  })

  test('the warning is once per swap, not once per call', async () => {
    const { setContractValidator } = await freshModule()
    setContractValidator(strict)
    const warnings = await captureWarnings(() => {
      setContractValidator(permissive)
      setContractValidator(strict)
      setContractValidator(permissive) // strict>permissive again: already said
    })
    expect(warnings.length).toBe(2)
  })

  test('{ final: true } makes a later replacement THROW', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    setContractValidator(strict, { final: true })
    expect(() => setContractValidator(permissive)).toThrow(/FINAL/)
    expect(() => setContractValidator(permissive, { final: true })).toThrow(
      /FINAL/
    )
    expect(getContractValidator()).toBe(strict)
  })

  test('a final validator cannot be REMOVED either', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    setContractValidator(strict, { final: true })
    expect(() => setContractValidator(null)).toThrow(/FINAL/)
    expect(getContractValidator()).toBe(strict)
  })

  test('locking BEFORE anyone installs one keeps the surface at the built-in subset', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    setContractValidator(null, { final: true })
    expect(() => setContractValidator(permissive)).toThrow(/FINAL/)
    expect(getContractValidator()).toBe(null)
  })

  test('re-registering the SAME function is a no-op and does not trip the lock', async () => {
    const { setContractValidator, getContractValidator } = await freshModule()
    setContractValidator(strict, { final: true })
    const warnings = await captureWarnings(() => {
      setContractValidator(strict) // a module evaluated twice, or hot reload
      setContractValidator(strict, { final: true })
    })
    expect(warnings).toEqual([])
    expect(getContractValidator()).toBe(strict)
  })

  test('a validator installed without { final: true } can be locked by a later identical call', async () => {
    const { setContractValidator } = await freshModule()
    setContractValidator(strict)
    setContractValidator(strict, { final: true })
    expect(() => setContractValidator(null)).toThrow(/FINAL/)
  })

  test('a hostile always-true validator is a DOWNGRADE, not a bypass', async () => {
    const { setContractValidator, contractViolation } = await freshModule()
    setContractValidator(permissive)
    // the built-in structural subset runs first and still refuses
    expect(contractViolation('two', { type: 'number' })).toContain(
      'expected type number'
    )
    expect(contractViolation(3, { type: 'number', minimum: 10 })).toBe(null)
  })
})

// The fail-open warning and the `const` branch had no coverage — and the
// reported coverage number for this module is structurally misleading, so
// nobody would have noticed from the figure. Each test below takes a FRESH
// module instance (`?case=N`), because both the validator and the warning
// latch are module-global; that idiom means the coverage tool attributes hits
// to N different modules and reports each as barely exercised.
describe('the fail-open warning: a contract must never quietly mean less', () => {
  test('warns once, naming the keywords the built-in checker ignores', async () => {
    const { contractViolation } = await freshModule()
    const warnings = await captureWarnings(() => {
      contractViolation(5, { type: 'number', minimum: 1, maximum: 10 })
    })
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('minimum')
    expect(warnings[0]).toContain('maximum')
    expect(warnings[0]).toContain('setContractValidator')
  })

  test('the latch is per KEYWORD SET, not per call or per schema', async () => {
    const { contractViolation } = await freshModule()
    const first = await captureWarnings(() => {
      contractViolation(5, { type: 'number', minimum: 1 })
      contractViolation(9, { type: 'number', minimum: 3 }) // same keyword set
    })
    expect(first.length).toBe(1)
    // a DIFFERENT unenforceable keyword is a different set, and speaks again
    const second = await captureWarnings(() => {
      contractViolation('x', { type: 'string', pattern: '^a' })
    })
    expect(second.length).toBe(1)
    expect(second[0]).toContain('pattern')
  })

  test('silent once a real engine is installed — it is no longer failing open', async () => {
    const { contractViolation, setContractValidator } = await freshModule()
    setContractValidator(() => true)
    const warnings = await captureWarnings(() => {
      contractViolation(5, { type: 'number', minimum: 1, maximum: 10 })
    })
    expect(warnings).toEqual([])
  })

  test('a fully-enforceable schema never warns', async () => {
    const { contractViolation } = await freshModule()
    const warnings = await captureWarnings(() => {
      contractViolation('b', { type: 'string', enum: ['a', 'b'] })
    })
    expect(warnings).toEqual([])
  })
})

describe('the built-in subset: type, enum, const', () => {
  test('const is enforced, and reports what it expected', async () => {
    const { contractViolation } = await freshModule()
    expect(contractViolation(1, { const: 1 })).toBeNull()
    const err = contractViolation(2, { const: 1 })
    expect(err).toContain('const')
    expect(err).toContain('1')
  })

  test('enum is enforced', async () => {
    const { contractViolation } = await freshModule()
    expect(contractViolation('a', { enum: ['a', 'b'] })).toBeNull()
    // the message names the ALLOWED set, not the offending value — worth
    // pinning, since a caller shows this to a user or an agent
    expect(contractViolation('z', { enum: ['a', 'b'] })).toContain('one of')
  })

  test('type is enforced', async () => {
    const { contractViolation } = await freshModule()
    expect(contractViolation(1, { type: 'number' })).toBeNull()
    expect(contractViolation('1', { type: 'number' })).toContain('number')
  })
})
