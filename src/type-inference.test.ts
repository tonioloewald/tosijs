/**
 * Type Inference Tests for BoxedProxy
 *
 * This file tests that TypeScript correctly infers types for tosi() proxies.
 * It uses @ts-expect-error to verify that invalid operations are caught at compile time.
 *
 * The tests here are primarily compile-time checks - if this file compiles,
 * the type inference is working correctly.
 */

import { test, expect } from 'bun:test'
import { tosi } from './xin-proxy'

// Create a test proxy with various types
const { testState } = tosi({
  testState: {
    num: 42,
    str: 'hello',
    bool: true,
    nested: {
      deep: {
        value: 100,
      },
    },
    arr: [1, 2, 3],
    objArr: [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ],
  },
})

test('type inference - BoxedScalar properties exist', () => {
  // New short names should exist and have correct types
  expect(typeof testState.num.value).toBe('number')
  expect(typeof testState.num.path).toBe('string')
  expect(typeof testState.str.value).toBe('string')
  expect(typeof testState.bool.value).toBe('boolean')
})

test('type inference - nested access preserves types', () => {
  expect(typeof testState.nested.deep.value.value).toBe('number')
  expect(typeof testState.nested.deep.value.path).toBe('string')
})

test('type inference - .value returns correct primitive', () => {
  // These should compile and return the correct primitive types
  const numVal: number = testState.num.value
  const strVal: string = testState.str.value
  const boolVal: boolean = testState.bool.value

  expect(numVal).toBe(42)
  expect(strVal).toBe('hello')
  expect(boolVal).toBe(true)
})

test('type inference - .path returns string', () => {
  const path: string = testState.num.path
  expect(path).toBe('testState.num')
})

test('type inference - assignment via .value works', () => {
  // Assignment through .value should work
  testState.num.value = 100
  expect(testState.num.value).toBe(100)

  testState.str.value = 'world'
  expect(testState.str.value).toBe('world')

  // Reset for other tests
  testState.num.value = 42
  testState.str.value = 'hello'
})

test('type inference - comparison via .value works', () => {
  // Correct way to compare
  expect(testState.num.value === 42).toBe(true)
  expect(testState.str.value === 'hello').toBe(true)
  expect(testState.bool.value === true).toBe(true)
})

// ============================================================
// COMPILE-TIME TYPE CHECKS
// These use @ts-expect-error to verify TypeScript catches errors
// ============================================================

test('type inference - direct comparison is type error (comparison trap)', () => {
  // Comparing BoxedScalar directly to primitive should be a type error
  // This catches the common mistake of writing proxy.x === 3 instead of proxy.x.value === 3

  // @ts-expect-error - BoxedScalar<number> cannot be compared to number
  testState.num === 42

  // @ts-expect-error - BoxedScalar<string> cannot be compared to string
  testState.str === 'hello'

  // @ts-expect-error - BoxedScalar<boolean> cannot be compared to boolean
  testState.bool === true

  // This test passes if the file compiles (the @ts-expect-error comments are satisfied)
  expect(true).toBe(true)
})

test('type inference - direct assignment is type error', () => {
  // Direct assignment to proxy property should be a type error
  // (TypeScript limitation - mapped types can't have asymmetric get/set)

  // @ts-expect-error - cannot assign number to BoxedScalar<number>
  testState.num = 100

  // @ts-expect-error - cannot assign string to BoxedScalar<string>
  testState.str = 'world'

  // @ts-expect-error - cannot assign boolean to BoxedScalar<boolean>
  testState.bool = false

  expect(true).toBe(true)
})

test('type inference - wrong type assignment to .value is type error', () => {
  // These @ts-expect-error comments verify that TypeScript catches type errors.
  // We wrap them in a never-executed block so they don't pollute test state at runtime.

  if (false as boolean) {
    // @ts-expect-error - cannot assign string to number
    testState.num.value = 'wrong'

    // @ts-expect-error - cannot assign number to string
    testState.str.value = 123

    // @ts-expect-error - cannot assign string to boolean
    testState.bool.value = 'yes'
  }

  expect(true).toBe(true)
})

test('type inference - legacy names still work (deprecated)', () => {
  // Legacy names should still work for backwards compatibility
  // They will trigger a deprecation warning at runtime

  expect(typeof testState.num.xinValue).toBe('number')
  expect(typeof testState.num.xinPath).toBe('string')
  expect(typeof testState.num.tosiValue).toBe('number')
  expect(typeof testState.num.tosiPath).toBe('string')
})

test('type inference - array access preserves element types', () => {
  // Array elements should be BoxedProxy of the element type
  const firstNum = testState.arr[0]
  expect(typeof firstNum.value).toBe('number')

  // Object array elements should have typed properties
  const firstObj = testState.objArr[0]
  expect(typeof firstObj.id.value).toBe('string')
  expect(typeof firstObj.name.value).toBe('string')
})

test('type inference - destructuring works', () => {
  const { nested } = testState
  expect(typeof nested.deep.value.value).toBe('number')
})

// ============================================================
// NULL AND UNDEFINED ADDRESSABILITY TESTS
// These verify that null/undefined values can be accessed via proxy
// for binding to yet-to-be-initialized values
// ============================================================

// Create a test proxy with null and undefined values
const { nullableState } = tosi({
  nullableState: {
    nullValue: null as string | null,
    undefinedValue: undefined as string | undefined,
    nested: {
      maybeNull: null as number | null,
      maybeUndefined: undefined as boolean | undefined,
    },
    initializedLater: undefined as { name: string } | undefined,
  },
})

test('null values are addressable via proxy', () => {
  // Should be able to get .value and .path from null values
  expect(nullableState.nullValue.value).toBe(null)
  expect(nullableState.nullValue.path).toBe('nullableState.nullValue')
})

test('undefined values are addressable via proxy', () => {
  // Should be able to get .value and .path from undefined values
  expect(nullableState.undefinedValue.value).toBe(undefined)
  expect(nullableState.undefinedValue.path).toBe('nullableState.undefinedValue')
})

test('nested null values are addressable', () => {
  expect(nullableState.nested.maybeNull.value).toBe(null)
  expect(nullableState.nested.maybeNull.path).toBe(
    'nullableState.nested.maybeNull'
  )
})

test('nested undefined values are addressable', () => {
  expect(nullableState.nested.maybeUndefined.value).toBe(undefined)
  expect(nullableState.nested.maybeUndefined.path).toBe(
    'nullableState.nested.maybeUndefined'
  )
})

test('null/undefined values can be assigned new values', () => {
  // Initially null
  expect(nullableState.nullValue.value).toBe(null)

  // Assign a value
  nullableState.nullValue.value = 'now has value'
  expect(nullableState.nullValue.value).toBe('now has value')

  // Reset to null
  nullableState.nullValue.value = null
  expect(nullableState.nullValue.value).toBe(null)
})

test('undefined values can be assigned new values', () => {
  // Initially undefined
  expect(nullableState.undefinedValue.value).toBe(undefined)

  // Assign a value
  nullableState.undefinedValue.value = 'initialized'
  expect(nullableState.undefinedValue.value).toBe('initialized')

  // Reset to undefined
  nullableState.undefinedValue.value = undefined
  expect(nullableState.undefinedValue.value).toBe(undefined)
})

test('null/undefined proxies have observe method', () => {
  expect(typeof nullableState.nullValue.observe).toBe('function')
  expect(typeof nullableState.undefinedValue.observe).toBe('function')
})

test('null/undefined proxies have bind method', () => {
  expect(typeof nullableState.nullValue.bind).toBe('function')
  expect(typeof nullableState.undefinedValue.bind).toBe('function')
})

test('null/undefined proxies have binding method', () => {
  expect(typeof nullableState.nullValue.binding).toBe('function')
  expect(typeof nullableState.undefinedValue.binding).toBe('function')

  // binding() should return an object with bind property
  const bindingResult = nullableState.nullValue.binding({
    toDOM: (el, val) => {
      el.textContent = String(val)
    },
  })
  expect(bindingResult.bind).toBeDefined()
  expect(bindingResult.bind.value).toBe('nullableState.nullValue')
})
