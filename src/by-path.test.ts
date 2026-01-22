import { test, expect } from 'bun:test'
import { getByPath, setByPath, deleteByPath, pathParts } from './by-path'
import { XinObject } from './xin-types'

const obj = {
  foo: 17,
  bar: {
    baz: 'lurman',
  },
  movies: ['strictly ballroom', 'romeo+juliet'],
  movieObjs: [
    {
      id: 17,
      name: 'strictly ballroom',
      reviews: {
        rottenTomatoes: 88,
        metaCritic: 72,
      },
    },
    {
      id: 123,
      name: 'romeo+juliet',
      reviews: {
        rottenTomatoes: 73,
        metaCritic: 60,
      },
    },
  ],
} as XinObject

test('getByPath works', () => {
  expect(getByPath(obj, '')).toBe(obj)
  expect(getByPath(obj, 'foo')).toBe(17)
  expect(getByPath(obj, '[=foo]')).toBe(17)
  expect(getByPath(obj, 'bar.baz')).toBe(obj.bar.baz)
  expect(getByPath(obj, 'movies')).toBe(obj.movies)
  expect(getByPath(obj, 'movies[0]')).toBe(obj.movies[0])
  expect(getByPath(obj, 'movieObjs[0]')).toBe(obj.movieObjs[0])
  expect(getByPath(obj, 'movieObjs[id=123]')).toBe(obj.movieObjs[1])
  expect(getByPath(obj, 'movieObjs[reviews.metaCritic=72]')).toBe(
    obj.movieObjs[0]
  )
})

test('setByPath works', () => {
  setByPath(obj, 'foo', -11)
  expect(obj.foo).toBe(-11)
  setByPath(obj, 'bar.baz', 'luhrman')
  expect(obj.bar.baz).toBe('luhrman')
  ;(getByPath(obj, 'movies') as any[]).push('TBD')
  expect(obj.movies.length).toBe(3)
  setByPath(obj, 'movies[2]', 'moulin rouge')
  expect(getByPath(obj, 'movies[2]')).toBe('moulin rouge')
  ;(getByPath(obj, 'movieObjs') as any[]).push({
    id: 666,
    name: 'moulin rouge',
  })
  expect(getByPath(obj, 'movieObjs[2].name')).toBe('moulin rouge')
  expect(getByPath(obj, 'movieObjs[id=666].name')).toBe('moulin rouge')
  setByPath(obj, 'movieObjs[id=666].reviews', {
    metaCritic: 66,
    rottenTomatoes: 75,
  })
  expect(getByPath(obj, 'movieObjs[reviews.metaCritic=66].name')).toBe(
    'moulin rouge'
  )
})

test('setByPath does not change values that do not need changing', () => {
  expect(setByPath(obj, 'foo', 1000)).toBe(true)
  expect(setByPath(obj, 'foo', 1000)).toBe(false)
  expect(setByPath(obj, 'foo', '1000')).toBe(true)
  const newObj = { hello: 'world' }
  expect(setByPath(obj, 'newObj', newObj)).toBe(true)
  newObj.hello = 'out of sight'
  expect(setByPath(obj, 'newObj', newObj)).toBe(false)
})

test('setByPath adds properties to objects if needed', () => {
  setByPath(obj, 'pi', Math.PI)
  expect(obj.pi).toBe(Math.PI)
  setByPath(obj, 'deep.down.there', true)
  expect(obj.deep.down.there).toBe(true)
  setByPath(obj, 'deep.space', ' ')
  expect(obj.deep.space).toBe(' ')
  setByPath(obj, 'deep', {})
  expect(obj.deep.space).toBe(undefined)
})

test('id-path edge cases, including deleteByPath', () => {
  const romeoPlusJuliet = getByPath(obj, 'movieObjs[id=17]')
  expect(romeoPlusJuliet).toBe(obj.movieObjs[0])
  expect(getByPath(obj, 'movieObjs[reviews.rottenTomatoes=73]')).toBe(
    obj.movieObjs[1]
  )
  deleteByPath(obj, 'movieObjs[reviews.metaCritic=72]')
  expect(getByPath(obj, 'movieObjs[id=17]')).toBe(undefined)
  expect(getByPath(obj, 'movieObjs[0].id')).toBe(123)
  try {
    setByPath(obj, 'movieObjects[id=11111]', {})
  } catch (e) {
    expect(!!e).toBe(true)
  }
  setByPath(obj, 'movieObjs[id=777]', {
    id: 777,
    name: 'australia',
  })
  expect(obj.movieObjs.length).toBe(3)
  setByPath(obj, 'movieObjs[id=17]', romeoPlusJuliet)
  expect(obj.movieObjs[3]).toBe(romeoPlusJuliet)
  setByPath(obj, 'movieObjs[id=777].reviews', {
    metaCritic: 53,
  })
  expect(getByPath(obj, 'movieObjs[id=777].reviews.metaCritic')).toBe(53)
  expect(getByPath(obj, 'movieObjs[id=777].name')).toBe('australia')

  setByPath(obj, 'movieObjs[id=777]', {})
  expect(getByPath(obj, 'movieObjs[id=777].name')).toBe(undefined)
})

test('pathParts handles various path formats', () => {
  expect(pathParts('')).toEqual([])
  expect(pathParts('foo')).toEqual([['foo']])
  expect(pathParts('foo.bar')).toEqual([['foo', 'bar']])
  expect(pathParts('arr[0]')).toEqual([['arr'], '0'])
  expect(pathParts('arr[0].prop')).toEqual([['arr'], '0', ['prop']])
  expect(pathParts('[id=123]')).toEqual(['id=123'])
  expect(pathParts('list[id=abc].name')).toEqual([['list'], 'id=abc', ['name']])
})

test('pathParts handles already-parsed arrays', () => {
  const parts = [['foo'], 'bar']
  expect(pathParts(parts)).toBe(parts)
})

test('setByPath throws on empty path', () => {
  expect(() => setByPath({}, '', 'value')).toThrow(
    'setByPath cannot be used to set the root object'
  )
})

test('setByPath with array index on existing array', () => {
  const testObj = { foo: [{ bar: 'old' }] } as XinObject
  setByPath(testObj, 'foo[0].bar', 'new')
  expect(testObj.foo[0].bar).toBe('new')
})

test('setByPath handles =key syntax for object properties', () => {
  const testObj = { prop: 'value' } as XinObject
  setByPath(testObj, '[=prop]', 'newValue')
  expect(testObj.prop).toBe('newValue')
})

test('getByPath handles empty array with = syntax', () => {
  const testObj = { arr: [] as any[] } as XinObject
  expect(getByPath(testObj, 'arr[=0]')).toBe(undefined)
})

test('getByPath returns undefined for non-existent nested paths', () => {
  const testObj = { a: { b: 1 } } as XinObject
  expect(getByPath(testObj, 'a.b.c.d')).toBe(undefined)
  expect(getByPath(testObj, 'x.y.z')).toBe(undefined)
})

test('deleteByPath does nothing for non-existent paths', () => {
  const testObj = { foo: 'bar' } as XinObject
  // Should not throw
  deleteByPath(testObj, 'nonexistent')
  expect(testObj.foo).toBe('bar')
})

test('setByPath returns false when deleting non-existent property', () => {
  const testObj = { foo: 'bar' } as XinObject
  // Deleting non-existent key returns false
  expect(setByPath(testObj, 'baz.qux', {})).toBe(true)
  // Property should be created
  expect(testObj.baz.qux).toEqual({})
})

test('setByPath with array index creates intermediate arrays', () => {
  const testObj = {} as XinObject
  setByPath(testObj, 'items[0]', 'first')
  expect(testObj.items[0]).toBe('first')
})

test('getByPath with id path handles values with = in them', () => {
  const testObj = {
    items: [
      { key: 'a=b', value: 1 },
      { key: 'c=d', value: 2 },
    ],
  } as XinObject
  expect(getByPath(testObj, 'items[key=a=b]')).toEqual({ key: 'a=b', value: 1 })
})
