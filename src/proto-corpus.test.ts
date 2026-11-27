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
    const name = BUILT_INS.get(value)
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
    // or the loop above proved nothing: 3,990 asked and 2,411 refused when
    // this was written, and 463 hand-outs with the getByPath guard removed
    expect(asked).toBeGreaterThan(3000)
    expect(refused).toBeGreaterThan(2000)
  })

  test('agent.call() cannot reach a prototype method through one', () => {
    // under expose: 'all' this returned 1 and left [][0] === 'x' page-wide
    const agent = enableAgentInterface({
      quiet: true,
      expose: 'all',
      global: false,
    })
    const attempts = [
      `${ROOT}.rows[=__proto__].push`,
      `${ROOT}.rows.__proto__.push`,
      `${ROOT}.rows[__proto__].push`,
    ]
    const outcomes: string[] = []
    try {
      for (const path of attempts) {
        try {
          agent.call(path, 'x')
          outcomes.push(`${path}: called`)
        } catch {
          outcomes.push(`${path}: refused`)
        }
      }
    } finally {
      agent.disable()
      const polluted = Array.prototype.length
      Array.prototype.length = 0
      expect(polluted).toBe(0)
    }
    expect(outcomes).toEqual(attempts.map((path) => `${path}: refused`))
  })

  test('the detector sees a hand-out when there is one', () => {
    // not through a proxy: this is what the corpus must never find
    const found: string[] = []
    const name = BUILT_INS.get(Object.getPrototypeOf({}))
    if (name !== undefined) found.push(name)
    expect(found).toEqual(['Object.prototype'])
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
      if (BUILT_INS.has(got) || got === Object) found.push(how)
    }
    expect(found).toEqual([])
  })
})
