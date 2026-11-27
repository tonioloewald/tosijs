import { describe, test, expect } from 'bun:test'
import { validate } from 'tosijs-schema'

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

// 1.10.13 (#4250). `contractViolation` returned `verdict.message`, which is
// undefined for `false`, and both callers read "no reason" as "no violation".
// tosijs-schema's `validate` returns a boolean, and the fail-open warning tells
// the reader to pass it in directly: doing so enforced nothing AND silenced
// that warning. Present from 1.8.0.
describe('the verdict protocol: anything but `true` is a violation', () => {
  test("a boolean validator enforces (tosijs-schema's validate, bare)", async () => {
    const { contractViolation, setContractValidator } = await freshModule()
    setContractValidator(validate)
    const schema = { type: 'number', minimum: 5 }
    expect(contractViolation(1, schema)).toBe('schema violation')
    expect(contractViolation(7, schema)).toBeNull()
    // a keyword the built-in subset has never heard of, on another type
    expect(contractViolation('zebra', { type: 'string', pattern: '^a' })).toBe(
      'schema violation'
    )
    expect(
      contractViolation('aardvark', { type: 'string', pattern: '^a' })
    ).toBeNull()
  })

  // Off-protocol returns fail CLOSED. A truthy non-true value is not "valid":
  // the result object of an ajv-style engine ({ valid: false, errors }) is
  // truthy, and a Promise from an async validator is too.
  const notTrue: Array<[string, unknown]> = [
    ['false', false],
    ['undefined (a validator with no return)', undefined],
    ['null', null],
    ['0', 0],
    ['1', 1],
    ['a string', 'looks fine'],
    ['a result object', { valid: true }],
    ['a Promise', Promise.resolve(true)],
  ]
  for (const [label, verdict] of notTrue) {
    test(`a validator returning ${label} refuses the value`, async () => {
      const { contractViolation, setContractValidator } = await freshModule()
      setContractValidator((() => verdict) as any)
      expect(contractViolation(5, { type: 'number' })).toBe('schema violation')
    })
  }

  test('an Error says why; an Error with no message still refuses', async () => {
    const { contractViolation, setContractValidator } = await freshModule()
    setContractValidator(() => new Error('below the minimum of 5'))
    expect(contractViolation(1, { type: 'number' })).toBe(
      'below the minimum of 5'
    )
    const second = await freshModule()
    second.setContractValidator(() => new Error(''))
    expect(second.contractViolation(1, { type: 'number' })).toBe(
      'schema violation'
    )
  })

  // The wiring the docs and the runtime warning teach. Bare `validate`
  // SAMPLES a large array or object and skips `maxProperties`, and the sample
  // is predictable, so a writer can place the bad item where it is not
  // looked at (1.10.13 review, M1: 900 of 1000 positions accepted). These
  // three cases get through the bare call and must not get through this one.
  const documentedWiring = (value: any, schema: any) =>
    validate(value, schema, { strict: true })
  const large = Array.from({ length: 1000 }, () => 1)
  const sampledCases: Array<[string, any, any]> = [
    [
      'a 1000-item array with one bad item',
      { type: 'array', items: { type: 'number', minimum: 0 } },
      large.map((n, i) => (i === 2 ? -1 : n)),
    ],
    [
      'a 1000-key map with one bad value',
      { type: 'object', additionalProperties: { type: 'number' } },
      Object.fromEntries(
        large.map((n, i) => [`k${i}`, i === 2 ? 'not a number' : n])
      ),
    ],
    [
      'maxProperties: 1 on three keys',
      { type: 'object', maxProperties: 1 },
      { a: 1, b: 2, c: 3 },
    ],
  ]
  for (const [label, schema, value] of sampledCases) {
    test(`the documented strict wiring refuses ${label}`, async () => {
      const { contractViolation, setContractValidator } = await freshModule()
      setContractValidator(documentedWiring)
      expect(contractViolation(value, schema)).toBe('schema violation')
      // and the bare call lets it through, which is why the docs say strict.
      // If this starts failing, tosijs-schema changed its default and the
      // warning in the docs above can go.
      const bare = await freshModule()
      bare.setContractValidator(validate)
      expect(bare.contractViolation(value, schema)).toBeNull()
    })
  }

  test('`true` is still the one way to say valid', async () => {
    const { contractViolation, setContractValidator } = await freshModule()
    setContractValidator(() => true)
    expect(contractViolation(1, { type: 'number', minimum: 5 })).toBeNull()
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
