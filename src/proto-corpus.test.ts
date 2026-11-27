import { test, expect, describe } from 'bun:test'
import { xin, boxed, updates } from './xin'
import { tosi } from './xin-proxy'
import { tosiValue, tosiPath, XIN_VALUE } from './metadata'
import { getByPath, UnsafePathError } from './by-path'
import { registry } from './registry'
import { enableAgentInterface } from './agent'

/*
 * NO READ HANDS OUT A BUILT-IN PROTOTYPE.
 *
 * Writes that reach the prototype chain are refused at the sink (setByPath).
 * A read was thought harmless, and is not: it can return the prototype object
 * itself, and the app that changes what it read changes every object.
 *
 * Three releases guarded this by spelling, at the proxy, with a hand-listed
 * table of the spellings someone had thought of (1.10.10 `[=key]` writes,
 * 1.10.11 `[__proto__]`, 1.10.13 `[=__proto__]`), and each review found the
 * next one. So this generates them: every way of writing a `__proto__`
 * segment, at every position, under every kind of parent, asked every way a
 * value comes out of a proxy. The guard it tests is in getByPath, where every
 * compound path and every `.value` resolves; remove it and this goes red.
 *
 * Reads through an inherited `constructor` are the open residual (board
 * #4271) and are pinned at the bottom.
 */

const BUILT_INS = new Map<unknown, string>([
  [Object.prototype, 'Object.prototype'],
  [Array.prototype, 'Array.prototype'],
  [Function.prototype, 'Function.prototype'],
  [String.prototype, 'String.prototype'],
  [Number.prototype, 'Number.prototype'],
  [Boolean.prototype, 'Boolean.prototype'],
])

// "Is this a built-in prototype?" has to see through a proxy. A proxy over
// Object.prototype is not identical to it and is as bad to hand out, and
// tosiValue() does not help: it reads by path, not from the target. A proxy
// with default traps answers reflection from its target, so compare shape:
// the same own property names, on the same prototype.
const builtInNamed = (value: unknown): string | undefined => {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function')
  )
    return undefined
  for (const [proto, name] of BUILT_INS) {
    if (value === proto) return name
    try {
      const mine = Object.getOwnPropertyNames(value)
      const theirs = Object.getOwnPropertyNames(proto as object)
      if (
        Object.getPrototypeOf(value) === Object.getPrototypeOf(proto) &&
        mine.length === theirs.length &&
        theirs.every((key) => mine.includes(key))
      )
        return `a proxy over ${name}`
    } catch {
      // reflection refused: not a hand-out
    }
  }
  return undefined
}

const ROOT = 'protoCorpus'
const PARENTS = [
  ROOT,
  `${ROOT}.map`,
  `${ROOT}.rows`,
  `${ROOT}.rows[0]`,
  `${ROOT}.rows[id=1]`,
  `${ROOT}.deep.inner`,
  `${ROOT}.name`,
  `${ROOT}.count`,
  `${ROOT}.bare`,
  `${ROOT}.act`,
  // getByPath takes another branch for anything whose `length` is 0
  `${ROOT}.empty`,
  `${ROOT}.zeroLength`,
  `${ROOT}.blank`,
]
const PROTO_SEGMENTS = ['.__proto__', '[__proto__]', '[=__proto__]']
const TAILS = [
  '',
  '.value',
  '.path',
  '.x',
  '.constructor',
  '.valueOf',
  '.toString',
  '.hasOwnProperty',
  '.push',
  '.tosi',
  '.xinValue',
  '.tosiValue',
  '[0]',
  '.__proto__',
  '[=__proto__]',
]

// every way a value comes out of what a proxy returned
const EXTRACTIONS: Array<[string, (got: any) => unknown]> = [
  ['itself', (got) => got],
  ['tosiValue()', (got) => tosiValue(got)],
  ['.value', (got) => got?.value],
  ['.valueOf()', (got) => got?.valueOf?.()],
  ['.tosi.value', (got) => got?.tosi?.value],
  ['[XIN_VALUE]', (got) => got?.[XIN_VALUE]],
  ['.xinValue', (got) => got?.xinValue],
]

// 'a.b[c].d' as the keys a caller would index with, one at a time
const segmentsOf = (path: string): string[] =>
  path.match(/\[[^\]]*\]|[^.[\]]+/g) ?? []

interface Probe {
  how: string
  ask: () => unknown
}

// Keep indexing only while the value in hand is one of OUR proxies. `xin`
// returns a raw string for a string, and `'Ada'['__proto__']` is JavaScript,
// not tosijs: counting it would bury the hand-outs that are ours.
const indexWhileProxy = (start: unknown, keys: string[]): unknown => {
  let at: any = start
  for (const key of keys) {
    if (tosiPath(at) === undefined) return at
    at = at[key]
  }
  return at
}

const probesFor = (path: string, boundaries: number[]): Probe[] => {
  const probes: Probe[] = []
  for (const [name, proxy] of [
    ['xin', xin],
    ['boxed', boxed],
  ] as Array<[string, any]>) {
    probes.push({ how: `${name}['${path}']`, ask: () => proxy[path] })
    // the same path cut in two at each place a caller might cut it
    for (const at of boundaries) {
      const left = path.slice(0, at)
      const right = path.slice(at).replace(/^\./, '')
      if (left === '' || right === '') continue
      probes.push({
        how: `${name}['${left}']['${right}']`,
        ask: () => indexWhileProxy(proxy[left], [right]),
      })
    }
    // and one key at a time
    const [first, ...rest] = segmentsOf(path)
    probes.push({
      how: `${name}['${first}']${rest.map((key) => `['${key}']`).join('')}`,
      ask: () => indexWhileProxy(proxy[first], rest),
    })
  }
  return probes
}

describe('no read returns a built-in prototype', () => {
  const handedOut: string[] = []
  let asked = 0
  let refused = 0

  const record = (how: string, value: unknown) => {
    const name = builtInNamed(value)
    if (name !== undefined) handedOut.push(`${how} is ${name}`)
  }

  test('the corpus: __proto__ at every position, in every spelling', async () => {
    const bare = Object.create(null)
    bare.k = 1
    tosi({
      [ROOT]: {
        map: {},
        rows: [{ id: 1 }, 'text'],
        deep: { inner: { leaf: 1 } },
        name: 'Ada',
        count: 3,
        bare,
        act() {
          return 'called'
        },
        empty: [],
        zeroLength: { length: 0 },
        blank: '',
      },
    })
    await updates()

    for (const parent of PARENTS) {
      for (const segment of PROTO_SEGMENTS) {
        for (const tail of TAILS) {
          const path = parent + segment + tail
          const boundaries = [parent.length, parent.length + segment.length]
          for (const { how, ask } of probesFor(path, boundaries)) {
            let got: unknown
            asked++
            try {
              got = ask()
            } catch (e) {
              if (e instanceof UnsafePathError) refused++
              continue
            }
            for (const [label, extract] of EXTRACTIONS) {
              try {
                record(`${how} → ${label}`, extract(got))
              } catch (e) {
                if (e instanceof UnsafePathError) refused++
              }
            }
          }
          // the engine asked directly, which is what `.value` does
          asked++
          try {
            record(`getByPath('${path}')`, getByPath(registry, path))
          } catch (e) {
            if (e instanceof UnsafePathError) refused++
          }
        }
      }
    }

    expect(handedOut).toEqual([])
    // or the loop above proved nothing. When this was written: 5,187 asked,
    // 2,956 refused. Hand-outs found with a guard removed: 390 without
    // getByPath's dotted check, 189 without the `[=key]` read check, 583
    // without either, and 324 without the proxy trap's own checks.
    expect(asked).toBeGreaterThan(4500)
    expect(refused).toBeGreaterThan(2500)
  })

  test('agent.call() cannot reach a prototype method through one', async () => {
    // under expose: 'all' this returned 1 and left [][0] === 'x' page-wide.
    // Its own state, so it means the same run alone.
    tosi({ protoCall: { rows: ['a'] } })
    await updates()
    const agent = enableAgentInterface({
      quiet: true,
      expose: 'all',
      global: false,
    })
    // [path, must the refusal be the prototype guard's?]. `[__proto__]` is
    // an index segment to the path engine, reads undefined, and is refused
    // as "not callable": no prototype is reached, by another route.
    const attempts: Array<[string, boolean]> = [
      ['protoCall.rows[=__proto__].push', true],
      ['protoCall.rows.__proto__.push', true],
      ['protoCall.rows[__proto__].push', false],
    ]
    const outcomes: string[] = []
    try {
      for (const [path, byGuard] of attempts) {
        try {
          agent.call(path, 'x')
          outcomes.push(`${path}: CALLED`)
        } catch (e: any) {
          outcomes.push(
            !byGuard || e instanceof UnsafePathError
              ? `${path}: refused`
              : `${path}: threw ${e?.name}, not the guard`
          )
        }
      }
    } finally {
      agent.disable()
      const polluted = Array.prototype.length
      Array.prototype.length = 0
      expect(polluted).toBe(0)
    }
    expect(outcomes).toEqual(attempts.map(([path]) => `${path}: refused`))
  })

  test('the detector sees a hand-out when there is one', () => {
    // what the corpus must never find: the prototype, or a proxy over it
    expect(builtInNamed(Object.getPrototypeOf({}))).toBe('Object.prototype')
    expect(builtInNamed(new Proxy(Object.prototype, {}))).toBe(
      'a proxy over Object.prototype'
    )
    expect(builtInNamed(new Proxy(Array.prototype, {}))).toBe(
      'a proxy over Array.prototype'
    )
    // and what it must not mistake for one
    expect(builtInNamed({})).toBe(undefined)
    expect(builtInNamed(Object.create(null))).toBe(undefined)
    expect(builtInNamed([])).toBe(undefined)
    expect(builtInNamed('Ada')).toBe(undefined)
    expect(builtInNamed(() => 1)).toBe(undefined)
  })

  // STILL OPEN (board #4271): an inherited `constructor` is readable, and
  // through it the prototype. States the right answer and fails on purpose,
  // so it goes red when someone closes it.
  test.failing('nor through an inherited constructor (#4271)', () => {
    const found: string[] = []
    for (const [how, ask] of [
      [
        'boxed.map.constructor.prototype.value',
        () => (boxed as any)[ROOT].map.constructor.prototype.value,
      ],
      [
        'boxed.map.constructor.value',
        () => (boxed as any)[ROOT].map.constructor.value,
      ],
      [
        "xin['map.constructor.prototype']",
        () => (xin as any)[`${ROOT}.map.constructor.prototype`],
      ],
    ] as Array<[string, () => unknown]>) {
      const got = ask()
      if (builtInNamed(got) !== undefined || got === Object) found.push(how)
    }
    expect(found).toEqual([])
  })
})
