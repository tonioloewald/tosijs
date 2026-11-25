import { test, expect, describe } from 'bun:test'
import { xin, boxed, updates } from './xin'
import { tosi } from './xin-proxy'
import { tosiValue, tosiPath } from './metadata'
import { getByPath } from './by-path'
import { registry } from './registry'

/*
 * The proxy and the path engine each answer "what is at this path", and they
 * were written separately. Wherever they differ, one of them is wrong, and
 * nothing compared them: every defect this file was written for (1.10.13) was
 * found by lining the two up, not by a failing test.
 *
 *   - `null` inside an array threw through the proxy (#4240)
 *   - an id containing `=` named another row through the proxy (#4241)
 *   - a null-prototype object came back unproxied, with no path (#4240)
 *   - a path through `null` threw in the engine and answered null in the proxy
 *
 * So this walks state trees, generates every path into them, and asks the same
 * question four ways: the walk itself, `getByPath`, `xin[path]` and
 * `boxed[path]`, plus the same route taken one segment at a time. The trees are
 * generated from a fixed seed, so a failure reproduces.
 *
 * What they still disagree on is at the bottom, as tests that fail on purpose.
 */

// --- generating state -------------------------------------------------------

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Keys that are plain identifiers, including the ones a boxed proxy also uses
// for its own API (`value`, `path`): data under them shadows the accessor.
// Not here, each for a stated reason:
//   - keys containing `.`, `[` or `=`: path syntax, pinned below
//   - `tosi`, `valueOf`, `toJSON`, `toString`: a boxed proxy answers these
//     itself, by design, so data under them is reachable only through `xin`
const KEYS = ['a', 'b', 'name', 'id', 'items', 'value', 'path', 'length', '$d']
const SCALARS = [null, null, 0, 17, 1.5, '', 'text', 'a=b', true, false]
// ids that are ordinary in real data and awkward in a path: base64 padding,
// an email address, a number, a space, an id that is a prefix of another
const IDS = ['YWJj', 'YWJj=', 'x==', 'a=b', 'a', 'ada@example.com', 17, '4 2']

type Rand = () => number
const pick = <T>(rand: Rand, list: T[]): T =>
  list[Math.floor(rand() * list.length)]

const makeObject = (rand: Rand, depth: number): any => {
  // every fourth object has no prototype, like Object.groupBy's result
  const out: any = rand() < 0.25 ? Object.create(null) : {}
  const count = 1 + Math.floor(rand() * 3)
  for (let i = 0; i < count; i++) {
    out[pick(rand, KEYS)] = makeValue(rand, depth - 1, false)
  }
  return out
}

const makeArray = (rand: Rand, depth: number): any[] => {
  const kind = rand()
  if (kind < 0.15) return []
  if (kind < 0.55) {
    // rows with unique ids, in a random order, with a null among them
    const ids = IDS.filter(() => rand() < 0.6)
    const rows: any[] = ids.map((id) => ({ ...makeObject(rand, depth), id }))
    if (rand() < 0.5) rows.splice(Math.floor(rand() * rows.length), 0, null)
    return rows
  }
  const length = 1 + Math.floor(rand() * 4)
  // an array directly inside an array is pinned below, so not generated here
  return Array.from({ length }, () => makeValue(rand, depth - 1, true))
}

const makeValue = (rand: Rand, depth: number, inArray: boolean): any => {
  const kind = rand()
  if (depth <= 0 || kind < 0.35) return pick(rand, SCALARS)
  if (kind < 0.7 || inArray) return makeObject(rand, depth)
  return makeArray(rand, depth)
}

// --- generating paths -------------------------------------------------------

interface Route {
  path: string
  // the same route as single segments, for walking a proxy one step at a time
  steps: string[]
  raw: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

function* routesInto(
  raw: unknown,
  path: string,
  steps: string[]
): Generator<Route> {
  yield { path, steps, raw }
  if (Array.isArray(raw)) {
    for (let index = 0; index < raw.length; index++) {
      const item = raw[index]
      yield* routesInto(item, `${path}[${index}]`, [...steps, `[${index}]`])
      if (isObject(item) && 'id' in item && !isObject(item.id)) {
        const segment = `[id=${String(item.id)}]`
        yield* routesInto(item, `${path}${segment}`, [...steps, segment])
      }
    }
  } else if (isObject(raw)) {
    for (const key of Object.keys(raw)) {
      yield* routesInto(raw[key], `${path}.${key}`, [...steps, key])
    }
  }
}

const walk = (proxy: any, steps: string[]): unknown => {
  let at = proxy
  for (const step of steps) {
    if (!isObject(at) && typeof at !== 'function') return at
    at = at[step]
  }
  return at
}

// --- the comparison ---------------------------------------------------------

const TREES = 40

describe('the proxy and the path engine agree', () => {
  const routes: Route[] = []

  test(`${TREES} generated trees are registered`, async () => {
    const state: Record<string, unknown> = {}
    for (let seed = 1; seed <= TREES; seed++) {
      state[`diff${seed}`] = makeObject(mulberry32(seed), 4)
    }
    tosi(state)
    await updates()
    for (const root of Object.keys(state)) {
      routes.push(...routesInto(state[root], root, [root]))
    }
    // the generator must actually produce the shapes this file exists for,
    // or every test below passes over nothing
    const count = (pattern: RegExp) =>
      routes.filter((route) => pattern.test(route.path)).length
    expect(routes.length).toBeGreaterThan(1500)
    expect(count(/\[id=[^\]]*=[^\]]*\]/)).toBeGreaterThan(50) // '=' in an id
    expect(count(/\[id=[^\]]*\]\./)).toBeGreaterThan(200) // a property under one
    expect(
      routes.filter((route) => route.raw === null && route.path.endsWith(']'))
        .length
    ).toBeGreaterThan(30) // null array elements
    expect(
      routes.filter(
        (route) =>
          isObject(route.raw) &&
          !Array.isArray(route.raw) &&
          Object.getPrototypeOf(route.raw) === null
      ).length
    ).toBeGreaterThan(50) // null-prototype objects
  })

  test('getByPath finds what the walk found', () => {
    for (const { path, raw } of routes) {
      expect([path, getByPath(registry, path)]).toEqual([path, raw])
      expect(getByPath(registry, path)).toBe(raw)
    }
  })

  test('xin[path] is the same value', () => {
    for (const { path, raw } of routes) {
      const got = tosiValue((xin as any)[path])
      if (got !== raw) expect([path, got]).toEqual([path, raw])
      expect(got).toBe(raw)
    }
  })

  test('boxed[path] is the same value, and knows its path', () => {
    for (const { path, raw } of routes) {
      const proxy = (boxed as any)[path]
      const got = tosiValue(proxy)
      if (got !== raw) expect([path, got]).toEqual([path, raw])
      expect(got).toBe(raw)
      expect(tosiPath(proxy)).toBe(path)
    }
  })

  test('one segment at a time arrives at the same value', () => {
    for (const { path, steps, raw } of routes) {
      const viaXin = tosiValue(walk(xin, steps))
      if (viaXin !== raw) expect([path, viaXin]).toEqual([path, raw])
      expect(viaXin).toBe(raw)
      const viaBoxed = walk(boxed, steps)
      expect(tosiValue(viaBoxed)).toBe(raw)
      expect(tosiPath(viaBoxed)).toBe(path)
    }
  })

  test('every container comes back as a proxy that knows its path', () => {
    for (const { path, raw } of routes) {
      if (!isObject(raw)) continue
      // a raw object handed back unproxied has no path, and a write through
      // it notifies nobody
      expect([path, tosiPath((xin as any)[path])]).toEqual([path, path])
    }
  })

  test('a path that runs past null or a missing value answers the same', () => {
    let checked = 0
    for (const { path, raw } of routes) {
      if (raw != null) continue
      for (const beyond of [`${path}.x`, `${path}[0]`, `${path}.x.y`]) {
        const expected = getByPath(registry, beyond)
        // through null is null, through nothing is nothing
        expect([beyond, expected]).toEqual([beyond, raw])
        expect([beyond, (xin as any)[beyond]]).toEqual([beyond, expected])
        expect([beyond, (boxed as any)[beyond]]).toEqual([beyond, expected])
        checked++
      }
    }
    expect(checked).toBeGreaterThan(300)
  })
})

// --- the cases by name ------------------------------------------------------

describe('null inside an array (#4240)', () => {
  test('reads as null, through every spelling', async () => {
    tosi({ nullInArray: { list: [null, 1, { id: 'x', v: 2 }] } })
    await updates()
    // each of these threw "A Proxy's 'target' should be an Object"
    expect((xin as any).nullInArray.list[0]).toBe(null)
    expect((xin as any)['nullInArray.list[0]']).toBe(null)
    expect((boxed as any).nullInArray.list[0].value).toBe(null)
    expect((boxed as any).nullInArray.list[0].path).toBe('nullInArray.list[0]')
    const seen: unknown[] = []
    for (const item of (xin as any).nullInArray.list) seen.push(tosiValue(item))
    expect(seen).toEqual([null, 1, { id: 'x', v: 2 }])
  })

  test('an id lookup over such an array finds its item', () => {
    // the id map asked every item for its id, and threw on the null one
    expect(getByPath(registry, 'nullInArray.list[id=x].v')).toBe(2)
    expect((xin as any)['nullInArray.list[id=x]'].v).toBe(2)
    expect(
      (boxed as any).nullInArray.list.listFind((i: any) => i.id, 'x').v.value
    ).toBe(2)
  })

  test('writing a null element, and over one, notifies', async () => {
    const seen: string[] = []
    const { observe, unobserve } = await import('./xin')
    const listener = observe(/^nullInArray\.list/, (path: string) => {
      seen.push(path)
    })
    ;(xin as any).nullInArray.list[1] = null
    ;(xin as any).nullInArray.list[0] = { id: 'y', v: 3 }
    await updates()
    unobserve(listener)
    expect(seen).toContain('nullInArray.list[1]')
    expect(seen).toContain('nullInArray.list[0]')
    expect(getByPath(registry, 'nullInArray.list')).toEqual([
      { id: 'y', v: 3 },
      null,
      { id: 'x', v: 2 },
    ])
  })
})

describe('an id that contains "=" (#4241)', () => {
  test('names its own row, not the row whose id is its prefix', async () => {
    tosi({
      eqIds: {
        list: [
          { id: 'YWJj', v: 'unpadded' },
          { id: 'YWJj=', v: 'padded' },
          { id: 'a=b', v: 'has-equals' },
          { id: 'a', v: 'plain-a' },
        ],
      },
    })
    await updates()
    // each of these returned the other row
    expect((xin as any)['eqIds.list[id=YWJj=]'].v).toBe('padded')
    expect((xin as any)['eqIds.list[id=a=b]'].v).toBe('has-equals')
    expect((boxed as any)['eqIds.list[id=YWJj=]'].v.value).toBe('padded')
    expect((xin as any).eqIds.list['id=a=b'].v).toBe('has-equals')
    // and the proxy's path named a row it was not holding
    const held = (boxed as any)['eqIds.list[id=a=b]']
    expect(held.path).toBe('eqIds.list[id=a=b]')
    expect(held.value).toBe(getByPath(registry, 'eqIds.list[id=a=b]'))
    // the unpadded ones still resolve
    expect((xin as any)['eqIds.list[id=YWJj]'].v).toBe('unpadded')
    expect((xin as any)['eqIds.list[id=a]'].v).toBe('plain-a')
    expect((xin as any)['eqIds.list[id=nope]']).toBe(undefined)
  })

  test('a write through such a row lands on that row', async () => {
    ;(boxed as any)['eqIds.list[id=YWJj=]'].v = 'written'
    await updates()
    const list = getByPath(registry, 'eqIds.list')
    expect(list[1].v).toBe('written')
    expect(list[0].v).toBe('unpadded')
  })

  test('when ids repeat, every id-path read names the same (last) row', async () => {
    // the proxy searched from the front and the engine's map keeps the last,
    // so `list[id=1]` and `list[id=1].v` used to be different rows
    tosi({
      dupIds: {
        list: [
          { id: 1, v: 'first' },
          { id: 1, v: 'last' },
        ],
      },
    })
    await updates()
    expect(getByPath(registry, 'dupIds.list[id=1]').v).toBe('last')
    expect((xin as any)['dupIds.list[id=1].v']).toBe('last')
    expect((xin as any)['dupIds.list[id=1]'].v).toBe('last')
  })
})

describe('an object with no prototype is a container like any other (#4240)', () => {
  test('Object.groupBy results are proxied, with paths', async () => {
    const grouped = (Object as any).groupBy(
      [
        { kind: 'fruit', name: 'fig' },
        { kind: 'veg', name: 'kale' },
      ],
      (item: any) => item.kind
    )
    expect(Object.getPrototypeOf(grouped)).toBe(null)
    tosi({ noProto: { grouped } })
    await updates()
    // these were undefined: the object came back raw
    expect((boxed as any).noProto.grouped.path).toBe('noProto.grouped')
    expect((boxed as any).noProto.grouped.fruit.path).toBe(
      'noProto.grouped.fruit'
    )
    expect((boxed as any).noProto.grouped.fruit[0].name.value).toBe('fig')
    expect((xin as any).noProto.grouped).not.toBe(grouped)
    expect(tosiValue((xin as any).noProto.grouped)).toBe(grouped)
  })

  test('a write through one notifies', async () => {
    const seen: string[] = []
    const { observe, unobserve } = await import('./xin')
    const listener = observe('noProto.grouped', (path: string) => {
      seen.push(path)
    })
    ;(boxed as any).noProto.grouped.fruit[0].name = 'date'
    await updates()
    unobserve(listener)
    expect(seen).toEqual(['noProto.grouped.fruit[0].name'])
  })

  test('so is an object from another realm', async () => {
    // an iframe's objects, or a vm context's here, are not `instanceof Object`
    const vm = await import('node:vm')
    const foreign = vm.runInNewContext(
      '({ name: "elsewhere", nested: { n: 1 } })'
    )
    expect(foreign instanceof Object).toBe(false)
    tosi({ otherRealm: { foreign } })
    await updates()
    expect((boxed as any).otherRealm.foreign.path).toBe('otherRealm.foreign')
    expect((boxed as any).otherRealm.foreign.nested.path).toBe(
      'otherRealm.foreign.nested'
    )
    expect(tosiValue((xin as any).otherRealm.foreign)).toBe(foreign)
  })

  test('a write into one held in an array does not throw', async () => {
    const row = Object.create(null)
    row.id = 1
    row.name = 'before'
    tosi({ noProtoRows: { rows: [row] } })
    await updates()
    // threw: setByPath failed: expected Object, found {"id":1,"name":"before"}
    ;(xin as any).noProtoRows.rows[0].name = 'after'
    expect(row.name).toBe('after')
    ;(xin as any)['noProtoRows.rows[id=1].name'] = 'by id'
    expect(row.name).toBe('by id')
  })
})

/*
 * STILL WRONG. Each test states the right answer and is marked failing, so the
 * suite stays green while they are wrong and goes red the moment one is fixed,
 * which is the prompt to delete the marker. They share a cause with the cases
 * above: the proxy resolves a key itself instead of asking the path engine
 * (lean plan, package 1.2a). Board: #4261.
 */
describe('known disagreements, pinned', () => {
  test.failing('adjacent brackets: grid[0][1]', async () => {
    tosi({
      pinnedGrid: {
        grid: [
          [1, 2],
          [3, 4],
        ],
      },
    })
    await updates()
    expect(getByPath(registry, 'pinnedGrid.grid[0][1]')).toBe(2)
    // undefined: the fourth compound-path pattern drops the second "["
    expect((xin as any)['pinnedGrid.grid[0][1]']).toBe(2)
  })

  test.failing('a final [=key] segment through xin', async () => {
    tosi({ pinnedKeys: { dict: { 'readme.md': 'dotted' } } })
    await updates()
    expect(getByPath(registry, 'pinnedKeys.dict[=readme.md]')).toBe('dotted')
    // undefined through xin; boxed answers, by way of a scalar proxy's read
    expect((xin as any)['pinnedKeys.dict[=readme.md]']).toBe('dotted')
  })

  test.failing('an object key containing "=" read by name', async () => {
    tosi({ pinnedEq: { dict: { 'a=b': 1 } } })
    await updates()
    // throws from inside the id lookup; so do JSON.stringify and a spread
    expect((xin as any).pinnedEq.dict['a=b']).toBe(1)
    expect(JSON.stringify((xin as any).pinnedEq.dict)).toBe('{"a=b":1}')
  })

  test.failing('an object key containing "." read by name', async () => {
    tosi({ pinnedDot: { dict: { 'readme.md': 2 } } })
    await updates()
    // undefined: the key is read as a path
    expect((xin as any).pinnedDot.dict['readme.md']).toBe(2)
  })

  test.failing('a path that runs past a scalar', async () => {
    tosi({ pinnedScalar: { name: 'Ada' } })
    await updates()
    expect(getByPath(registry, 'pinnedScalar.name.length')).toBe(3)
    // 'Ada': the proxy hands back the scalar it stopped at
    expect((xin as any)['pinnedScalar.name.length']).toBe(3)
  })

  test.failing('[=key] on an object that has a length of 0', () => {
    // the engine's own bug: it takes the object for an empty array
    expect(getByPath({ box: { length: 0, foo: 1 } }, 'box[=foo]')).toBe(1)
  })
})
