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
import { BoxedProxy } from './xin-types'

// Create a test proxy with various types
const { testState } = tosi({
  testState: {
    num: 42,
    str: 'hello',
    bool: true,
    nested: {
      deep: {
        value: 100
      }
    },
    arr: [1, 2, 3],
    objArr: [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' }
    ]
  }
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
  const _badCompare1 = testState.num === 42

  // @ts-expect-error - BoxedScalar<string> cannot be compared to string
  const _badCompare2 = testState.str === 'hello'

  // @ts-expect-error - BoxedScalar<boolean> cannot be compared to boolean
  const _badCompare3 = testState.bool === true

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
  // Assigning wrong type should be caught

  // @ts-expect-error - cannot assign string to number
  testState.num.value = 'wrong'

  // @ts-expect-error - cannot assign number to string
  testState.str.value = 123

  // @ts-expect-error - cannot assign string to boolean
  testState.bool.value = 'yes'

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
