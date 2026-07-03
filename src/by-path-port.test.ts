// Validates the native TJS port (by-path.tjs) is behavior-identical to the TS
// original by running the same assertions through the real .tjs Bun plugin.
// Imports the .tjs explicitly (Bun doesn't auto-resolve the extension yet).
import { test, expect } from 'bun:test'
// @ts-expect-error — .tjs has no ambient types; loaded via the tjs Bun plugin
import { getByPath, setByPath, deleteByPath, pathParts } from './by-path.tjs'

const makeObj = () =>
  ({
    foo: 17,
    bar: { baz: 'lurman' },
    movies: ['strictly ballroom', 'romeo+juliet'],
    movieObjs: [
      {
        id: 17,
        name: 'strictly ballroom',
        reviews: { rottenTomatoes: 88, metaCritic: 72 },
      },
      {
        id: 123,
        name: 'romeo+juliet',
        reviews: { rottenTomatoes: 73, metaCritic: 60 },
      },
    ],
  }) as any

test('[tjs] getByPath works', () => {
  const obj = makeObj()
  expect(getByPath(obj, '')).toBe(obj)
  expect(getByPath(obj, 'foo')).toBe(17)
  expect(getByPath(obj, '[=foo]')).toBe(17)
  expect(getByPath(obj, 'bar.baz')).toBe(obj.bar.baz)
  expect(getByPath(obj, 'movies[0]')).toBe(obj.movies[0])
  expect(getByPath(obj, 'movieObjs[id=123]')).toBe(obj.movieObjs[1])
  expect(getByPath(obj, 'movieObjs[reviews.metaCritic=72]')).toBe(
    obj.movieObjs[0]
  )
})

test('[tjs] setByPath works + returns changed flag', () => {
  const obj = makeObj()
  expect(setByPath(obj, 'foo', -11)).toBe(true)
  expect(obj.foo).toBe(-11)
  expect(setByPath(obj, 'foo', -11)).toBe(false)
  setByPath(obj, 'bar.baz', 'luhrman')
  expect(obj.bar.baz).toBe('luhrman')
  setByPath(obj, 'movies[1]', 'moulin rouge')
  expect(getByPath(obj, 'movies[1]')).toBe('moulin rouge')
})

test('[tjs] setByPath adds nested properties and arrays', () => {
  const obj = makeObj()
  setByPath(obj, 'deep.down.there', true)
  expect(obj.deep.down.there).toBe(true)
  setByPath(obj, 'items[0]', 'first')
  expect(obj.items[0]).toBe('first')
})

test('[tjs] id-path insert, delete, and edge cases', () => {
  const obj = makeObj()
  deleteByPath(obj, 'movieObjs[reviews.metaCritic=72]')
  expect(getByPath(obj, 'movieObjs[id=17]')).toBe(undefined)
  expect(getByPath(obj, 'movieObjs[0].id')).toBe(123)
  setByPath(obj, 'movieObjs[id=777]', { id: 777, name: 'australia' })
  expect(getByPath(obj, 'movieObjs[id=777].name')).toBe('australia')
})

test('[tjs] pathParts formats', () => {
  expect(pathParts('')).toEqual([])
  expect(pathParts('foo.bar')).toEqual([['foo', 'bar']])
  expect(pathParts('arr[0].prop')).toEqual([['arr'], '0', ['prop']])
  expect(pathParts('list[id=abc].name')).toEqual([['list'], 'id=abc', ['name']])
  const parsed = [['foo'], 'bar']
  expect(pathParts(parsed)).toBe(parsed)
})

test('[tjs] getByPath id path handles = in values', () => {
  const obj = {
    items: [
      { key: 'a=b', value: 1 },
      { key: 'c=d', value: 2 },
    ],
  } as any
  expect(getByPath(obj, 'items[key=a=b]')).toEqual({ key: 'a=b', value: 1 })
})

test('[tjs] setByPath throws on empty path', () => {
  expect(() => setByPath({}, '', 'value')).toThrow(
    'setByPath cannot be used to set the root object'
  )
})
