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
    const original = [[1, 2], [3, 4]]
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
