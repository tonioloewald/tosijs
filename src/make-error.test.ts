import { test, expect } from 'bun:test'
import { makeError } from './make-error'

test('makeError creates an Error with a message', () => {
  const err = makeError('something went wrong')
  expect(err).toBeInstanceOf(Error)
  expect(err.message).toBe('"something went wrong"')
})

test('makeError joins multiple arguments', () => {
  const err = makeError('error:', 'code', 123)
  expect(err.message).toBe('"error:" "code" 123')
})

test('makeError handles objects', () => {
  const err = makeError('data:', { foo: 'bar' })
  expect(err.message).toBe('"data:" {"foo":"bar"}')
})

test('makeError handles circular references', () => {
  const circular: { self?: unknown } = {}
  circular.self = circular

  const err = makeError('circular:', circular)
  expect(err.message).toBe('"circular:" {has circular references}')
})

test('makeError handles arrays', () => {
  const err = makeError('items:', [1, 2, 3])
  expect(err.message).toBe('"items:" [1,2,3]')
})

test('makeError handles null and undefined', () => {
  const err = makeError(null, undefined)
  // undefined serializes to empty string via JSON.stringify
  expect(err.message).toBe('null ')
})
