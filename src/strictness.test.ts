import { test, expect, describe, afterEach } from 'bun:test'
import { tosi } from './xin-proxy'
import { xin, boxed } from './xin'
import { settings } from './settings'

const captureWarn = (fn: () => void): string[] => {
  const warnings: string[] = []
  const orig = console.warn
  console.warn = (m: string) => warnings.push(m)
  try {
    fn()
  } finally {
    console.warn = orig
  }
  return warnings
}

afterEach(() => {
  settings.strictness = 'warn'
})

describe('assignment strictness', () => {
  test("warn (default): type change warns but still assigns (it's permissive)", () => {
    tosi({ sw: { count: 42 } })
    const warnings = captureWarn(() => {
      ;(xin as any).sw.count = 'oops'
    })
    expect(
      warnings.some(
        (w) => w.includes("type 'string'") && w.includes("type 'number'")
      )
    ).toBe(true)
    expect((xin as any).sw.count).toBe('oops')
  })

  test('same type does not warn', () => {
    tosi({ ss: { count: 42 } })
    const warnings = captureWarn(() => {
      ;(xin as any).ss.count = 7
    })
    expect(warnings).toEqual([])
    expect((xin as any).ss.count).toBe(7)
  })

  test('new property (no prior type) does not warn', () => {
    tosi({ sn: {} as any })
    const warnings = captureWarn(() => {
      ;(xin as any).sn.fresh = 'hello'
    })
    expect(warnings).toEqual([])
  })

  test('nullish transitions are allowed (clear / first-set)', () => {
    tosi({ snull: { a: 5, b: null as any } })
    const warnings = captureWarn(() => {
      ;(xin as any).snull.a = null // value -> null
      ;(xin as any).snull.b = 'now set' // null -> value
    })
    expect(warnings).toEqual([])
  })

  test('throw mode throws and blocks the write', () => {
    settings.strictness = 'throw'
    tosi({ st: { count: 42 } })
    expect(() => {
      ;(xin as any).st.count = 'oops'
    }).toThrow(/changes the value's type/)
    expect((xin as any).st.count).toBe(42) // unchanged
  })

  test('off mode does not warn', () => {
    settings.strictness = 'off'
    tosi({ so: { count: 42 } })
    const warnings = captureWarn(() => {
      ;(xin as any).so.count = 'oops'
    })
    expect(warnings).toEqual([])
    expect((xin as any).so.count).toBe('oops')
  })

  test('array↔object mismatch warns; object→object (reshape) does not', () => {
    tosi({ sa: { list: [1, 2], obj: { x: 1 } } })
    const w1 = captureWarn(() => {
      ;(xin as any).sa.list = { not: 'an array' }
    })
    expect(w1.some((w) => w.includes("type 'array'"))).toBe(true)
    const w2 = captureWarn(() => {
      ;(xin as any).sa.obj = { totally: 'different', shape: true }
    })
    expect(w2).toEqual([])
  })

  test('.valueAndType bypasses the check (changes value + type)', () => {
    tosi({ sv: { count: 42 } })
    const warnings = captureWarn(() => {
      ;(boxed as any).sv.count.valueAndType = 'now a string'
    })
    expect(warnings).toEqual([])
    expect((xin as any).sv.count).toBe('now a string')
  })

  test('.valueAndType works even in throw mode', () => {
    settings.strictness = 'throw'
    tosi({ svt: { count: 42 } })
    expect(() => {
      ;(boxed as any).svt.count.valueAndType = true
    }).not.toThrow()
    expect((xin as any).svt.count).toBe(true)
  })

  test('the boxed scalar .value setter is checked too', () => {
    tosi({ sbv: { count: 42 } })
    const warnings = captureWarn(() => {
      ;(boxed as any).sbv.count.value = 'oops'
    })
    expect(warnings.some((w) => w.includes("type 'string'"))).toBe(true)
  })
})
