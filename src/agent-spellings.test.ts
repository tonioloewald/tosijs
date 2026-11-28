/*
 * THE SPELLING TABLE FOR THE AGENT SURFACE'S GATES (#4312).
 *
 * A place in the state tree has several valid spellings, and every gate on
 * the agent surface used to compare the one it was handed: a declared action
 * was guarded as `app.checkout` and not as `app[=checkout]`; a secret was
 * withheld as `list[id=a1].pw` and not as `list[label=work].pw`. Each release
 * that fixed one spelling found the next in review (tosijs#32, #52, #4312).
 *
 * So this does not list spellings. It GENERATES every valid spelling of each
 * place (two per key, three or four per row, at every position) and asks the
 * surface the same question of each one. The answer must be the answer the
 * canonical spelling gets. A hand-kept list holds the spellings someone
 * thought of; see the same lesson in src/proto-corpus.test.ts.
 */
import { test, expect, describe, afterAll, beforeAll } from 'bun:test'
import { enableAgentInterface } from './agent'
import { tosi } from './xin-proxy'
import { xin } from './xin'
import { updates } from './path-listener'
import { elements } from './elements'

type Segment =
  | { key: string }
  | { row: number; of: 'list' | 'plain'; id?: string; label: string }

const SECRETS = ['hunter2', 'pw-one', 'pw-two', 'plain-one', 'plain-two']

// every valid spelling of one segment; `first` drops the leading dot
const spellings = (segment: Segment, first: boolean): string[] => {
  if ('key' in segment) {
    return [first ? segment.key : `.${segment.key}`, `[=${segment.key}]`]
  }
  const out = [
    `[${segment.row}]`,
    `.${segment.row}`,
    `[label=${segment.label}]`,
  ]
  if (segment.id !== undefined) out.push(`[id=${segment.id}]`)
  return out
}

// the cartesian product: every spelling of the whole path
const everySpelling = (place: Segment[]): string[] =>
  place.reduce<string[]>(
    (paths, segment, i) =>
      paths.flatMap((path) =>
        spellings(segment, i === 0).map((spelled) => path + spelled)
      ),
    ['']
  )

const k = (key: string): Segment => ({ key })
const listRow = (row: number): Segment =>
  row === 0
    ? { row, of: 'list', id: 'a1', label: 'work' }
    : { row, of: 'list', id: 'a2', label: 'home' }
const plainRow = (row: number): Segment => ({
  row,
  of: 'plain',
  label: row === 0 ? 'x' : 'y',
})

let agent: ReturnType<typeof enableAgentInterface>
let host: HTMLElement
let probes = 0

beforeAll(async () => {
  const { sp } = tosi({
    sp: {
      checkout() {
        return 'paid'
      },
      gate: { level: 3 },
      login: { password: 'hunter2' },
      open: { note: 'hello' },
      list: [
        { id: 'a1', label: 'work', pw: 'pw-one' },
        { id: 'a2', label: 'home', pw: 'pw-two' },
      ],
      plain: [
        { label: 'x', pw: 'plain-one' },
        { label: 'y', pw: 'plain-two' },
      ],
    },
  })
  await updates()
  const { div, input } = elements
  host = div(
    input({ bindValue: 'sp.gate.level', contract: { type: 'integer' } }),
    input({ type: 'password', bindValue: 'sp.login.password' }),
    div(
      ...sp.list.tosi.listBinding(
        ({ div, input }: any) =>
          div(input({ type: 'password', bindValue: '^.pw' })),
        { idPath: 'id' }
      )
    ),
    div(
      ...sp.plain.tosi.listBinding(({ div, input }: any) =>
        div(input({ type: 'password', bindValue: '^.pw' }))
      )
    )
  )
  document.body.append(host)
  await updates()
  agent = enableAgentInterface({
    quiet: true,
    global: false,
    expose: { roots: ['sp'], actions: ['sp.checkout'], write: true },
  })
})

afterAll(() => {
  agent?.disable()
  host?.remove()
})

describe('every spelling of a place gets the canonical answer (#4312)', () => {
  const READS: Array<[string, Segment[]]> = [
    ['an ordinary value', [k('sp'), k('open'), k('note')]],
    ['an ordinary object', [k('sp'), k('open')]],
    ['a secret', [k('sp'), k('login'), k('password')]],
    ['the object holding a secret', [k('sp'), k('login')]],
    ['a contracted value', [k('sp'), k('gate'), k('level')]],
    ['a row of a list with an idPath', [k('sp'), k('list'), listRow(0)]],
    ['its secret', [k('sp'), k('list'), listRow(0), k('pw')]],
    ['its label', [k('sp'), k('list'), listRow(1), k('label')]],
    ['a row of a list with no idPath', [k('sp'), k('plain'), plainRow(1)]],
    ['its secret', [k('sp'), k('plain'), plainRow(1), k('pw')]],
    ['its label', [k('sp'), k('plain'), plainRow(0), k('label')]],
    ['a whole list', [k('sp'), k('list')]],
  ]

  for (const [what, place] of READS) {
    test(`read: ${what}`, () => {
      const all = everySpelling(place)
      // the first spelling generated is the plain one: dotted keys, [n] rows
      const expected = JSON.stringify(agent.read(all[0]))
      for (const secret of SECRETS) expect(expected).not.toContain(secret)
      for (const path of all) {
        probes += 1
        const got = JSON.stringify(agent.read(path))
        if (got !== expected) {
          throw new Error(
            `read(${JSON.stringify(path)}) answered ${got}, but ` +
              `read(${JSON.stringify(all[0])}) answers ${expected}`
          )
        }
      }
      expect(all.length).toBeGreaterThan(1)
    })
  }

  test('write: a declared action is refused under every spelling', () => {
    for (const path of everySpelling([k('sp'), k('checkout')])) {
      probes += 1
      expect(() => agent.write(path, 'x')).toThrow('callable')
    }
    expect(typeof (xin as any).sp.checkout).toBe('function')
  })

  test('write: an inline contract is asked under every spelling', () => {
    for (const path of everySpelling([k('sp'), k('gate'), k('level')])) {
      probes += 1
      expect(() => agent.write(path, 'seven')).toThrow('contract')
    }
    expect((xin as any).sp.gate.level).toBe(3)
  })

  test('write: an allowed write lands on the place under every spelling', () => {
    let n = 100
    for (const path of everySpelling([
      k('sp'),
      k('list'),
      listRow(1),
      k('label'),
    ])) {
      probes += 1
      const value = `label-${n++}`
      agent.write(
        path.replace('[label=home]', `[label=${currentLabel()}]`),
        value
      )
      expect((xin as any).sp.list[1].label).toBe(value)
    }
    ;(xin as any).sp.list[1].label = 'home'
  })

  test('call: a declared action is callable under every spelling', () => {
    for (const path of everySpelling([k('sp'), k('checkout')])) {
      probes += 1
      expect(agent.call(path)).toBe('paid')
    }
  })

  test('the table is not empty', () => {
    // a generator that produces nothing passes everything
    expect(probes).toBeGreaterThan(150)
  })
})

// the label selector must name the row as it is NOW: the write test above
// changes row 1's label on every probe
const currentLabel = (): string => (xin as any).sp.list[1].label
