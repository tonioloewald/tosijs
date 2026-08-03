import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface, AgentContract } from './agent'
import { exerciseContract } from './contract'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'
import { validate } from 'tosijs-schema'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
})

// ---------------------------------------------------------------------------
// the blessed adapter shape: a few lines over tosijs-schema. The core seam
// knows nothing about schemas — this is what an app (or eventually
// tosijs-schema itself) supplies.
const schemaContract = (schemas: Record<string, any>): AgentContract => ({
  check(path, value) {
    const schema = schemas[path]
    if (schema == null) return true // no contract at this root — allow
    const reasons: string[] = []
    const ok = validate(value, schema, {
      onError: (at: string, msg: string) => void reasons.push(`${at}: ${msg}`),
    })
    return ok ? true : new Error(`contract violation at ${path} — ${reasons.join('; ')}`)
  },
  describe: () => schemas,
})
// ---------------------------------------------------------------------------

const orderSchema = {
  type: 'object',
  properties: {
    item: { type: 'string' },
    qty: { type: 'number' },
  },
  required: ['item', 'qty'],
  examples: [
    { item: 'kumquat', qty: 3 },
    { item: 'fig', qty: 1 },
  ],
  $counterexamples: [
    { item: 'kumquat' }, // missing qty
    { item: 42, qty: 1 }, // wrong type
    'not even an object',
  ],
}

describe('agent contract seam — write() enforces, describe() declares', () => {
  test('valid writes pass; invalid writes throw the reason and leave state untouched', async () => {
    tosi({ conApp: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conApp'],
        contract: schemaContract({ 'conApp.order': orderSchema }),
      },
    }))

    agent.write('conApp.order', { item: 'kumquat', qty: 3 })
    expect(agent.read('conApp.order')).toEqual({ item: 'kumquat', qty: 3 })

    expect(() => agent.write('conApp.order', { item: 'yuzu' })).toThrow(
      'contract violation'
    )
    // the refused write changed nothing
    expect(agent.read('conApp.order')).toEqual({ item: 'kumquat', qty: 3 })
  })

  test('refusals are audit events, invisible to the changes() drain', async () => {
    tosi({ conAudit: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conAudit'],
        contract: schemaContract({ 'conAudit.order': orderSchema }),
      },
    }))
    const { cursor } = agent.changes()
    expect(() => agent.write('conAudit.order', 'nope')).toThrow()
    const rejection = agent
      .log()
      .find((entry) => entry.note?.startsWith('write rejected'))
    expect(rejection).toBeDefined()
    expect(rejection!.note).toContain('contract violation')
    // the drain reports only real state changes — a refusal is not one
    expect(agent.changes(cursor).changes).toEqual([])
  })

  test('describe() carries the serialized contract — what is LEGAL, not just what exists', async () => {
    tosi({ conDesc: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conDesc'],
        contract: schemaContract({ 'conDesc.order': orderSchema }),
      },
    }))
    const description = agent.describe()
    expect(description.contract).toBeDefined()
    expect(description.contract!['conDesc.order'].required).toEqual([
      'item',
      'qty',
    ])
    // examples travel with the contract: the spec is executable by any reader
    expect(description.contract!['conDesc.order'].examples.length).toBe(2)
  })
})

describe('exerciseContract — the contract is a test', () => {
  test('a truthful contract: every example accepted, every counterexample refused, state restored', async () => {
    tosi({ conRun: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conRun'],
        contract: schemaContract({ 'conRun.order': orderSchema }),
      },
    }))

    const report = exerciseContract(agent)
    expect(report.failed).toBe(0)
    expect(report.passed).toBe(5) // 2 examples + 3 counterexamples
    // trials ran through the REAL surface, and state came back
    expect(agent.read('conRun.order')).toEqual({ item: 'plum', qty: 2 })
  })

  test('a lying contract is caught: a gate that never refuses fails its counterexamples', async () => {
    tosi({ conLiar: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conLiar'],
        contract: {
          check: () => true, // "enforcement" that enforces nothing
          describe: () => ({ 'conLiar.order': orderSchema }),
        },
      },
    }))
    const report = exerciseContract(agent)
    expect(report.failed).toBe(3) // all counterexamples ACCEPTED = all fail
    expect(
      report.trials
        .filter((t) => !t.passed)
        .every((t) => t.error === 'counterexample was ACCEPTED')
    ).toBe(true)
  })

  test('round-trip fidelity catches examples that cannot survive the surface', async () => {
    // the surface serializes (JSON semantics) — an example carrying a Date
    // is a contract whose own spec can't round-trip, and the harness says so
    tosi({ conDate: { order: { item: 'plum', qty: 2 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['conDate'],
        contract: {
          check: () => true,
          describe: () => ({
            'conDate.order': {
              examples: [{ item: 'x', qty: 1, at: new Date(0) }],
            },
          }),
        },
      },
    }))
    const report = exerciseContract(agent)
    expect(report.failed).toBe(1)
    expect(report.trials[0].error).toContain('round-trip mismatch')
  })
})
