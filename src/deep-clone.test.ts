import { test, expect, describe } from 'bun:test'
import { deepClone } from './deep-clone'

describe('deepClone', () => {
  test('returns primitives unchanged', () => {
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(42)).toBe(42)
    expect(deepClone(true)).toBe(true)
    expect(deepClone(false)).toBe(false)
  })

  test('handles null and undefined', () => {
    expect(deepClone(null as any)).toBe(null)
    expect(deepClone(undefined as any)).toBe(undefined)
  })

  test('clones simple objects', () => {
    const original = { a: 1, b: 'hello', c: true }
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  test('clones nested objects', () => {
    const original = {
      level1: {
        level2: {
          value: 'deep',
        },
      },
    }
    const cloned = deepClone(original) as typeof original

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.level1).not.toBe(original.level1)
    expect(cloned.level1.level2).not.toBe(original.level1.level2)
  })

  test('clones arrays', () => {
    const original = [1, 2, 3]
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  test('clones arrays with objects', () => {
    const original = [{ id: 1 }, { id: 2 }]
    const cloned = deepClone(original) as typeof original

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned[0]).not.toBe(original[0])
  })

  test('clones nested arrays', () => {
    const original = [
      [1, 2],
      [3, 4],
    ]
    const cloned = deepClone(original) as typeof original

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned[0]).not.toBe(original[0])
  })

  test('clones Sets', () => {
    const original = new Set([1, 2, 3])
    const cloned = deepClone(original) as Set<number>

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.has(1)).toBe(true)
    expect(cloned.has(2)).toBe(true)
    expect(cloned.has(3)).toBe(true)
  })

  test('preserves functions', () => {
    const fn = () => 'test'
    expect(deepClone(fn)).toBe(fn)
  })

  test('handles mixed nested structures', () => {
    const original = {
      array: [1, { nested: true }],
      object: { key: 'value' },
      primitive: 42,
    }
    const cloned = deepClone(original) as typeof original

    expect(cloned).toEqual(original)
    expect(cloned.array).not.toBe(original.array)
    expect(cloned.object).not.toBe(original.object)
  })
})

test('deepClone preserves Dates as Dates', () => {
  const d = new Date('2026-07-18T12:00:00Z')
  const clone = deepClone({ when: d }) as any
  expect(clone.when).toBeInstanceOf(Date)
  expect(clone.when.getTime()).toBe(d.getTime())
  expect(clone.when).not.toBe(d)
})

test('deepClone preserves Maps with deep-cloned entries', () => {
  const m = new Map([['a', { n: 1 }]])
  const clone = deepClone(m as any) as any
  expect(clone).toBeInstanceOf(Map)
  expect(clone.get('a')).toEqual({ n: 1 })
  expect(clone.get('a')).not.toBe(m.get('a'))
})

test('deepClone deep-clones Set members', () => {
  const item = { n: 1 }
  const s = new Set([item])
  const clone = deepClone(s as any) as any
  expect(clone).toBeInstanceOf(Set)
  const clonedItem = Array.from(clone)[0] as any
  expect(clonedItem).toEqual({ n: 1 })
  expect(clonedItem).not.toBe(item)
})

test('deepClone survives circular references and reproduces the cycle', () => {
  const obj: any = { name: 'root' }
  obj.self = obj
  obj.list = [obj]
  const clone = deepClone(obj) as any
  expect(clone.name).toBe('root')
  expect(clone.self).toBe(clone) // cycle reproduced, not re-cloned
  expect(clone.list[0]).toBe(clone)
  expect(clone).not.toBe(obj)
})
