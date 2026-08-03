/*{ "parent": "utilities", "description": "EXPERIMENTAL contract harness: exercise an agent surface's declared contract — schema examples must be accepted, counterexamples refused — through the real surface." }*/
/*#
# contract harness (EXPERIMENTAL)

If a contract carries **example values**, the contract is a test. This is the
contract equivalent of tjs-lang's signature tests: the declaration proves
itself by execution, and a declaration that feeds tests is load-bearing —
it breaks visibly when it lies.

    import { enableAgentInterface, exerciseContract } from 'tosijs'

    const agent = enableAgentInterface({ expose: { roots, contract } })
    const report = exerciseContract(agent)
    // report.failed === 0, or report.trials says exactly what lied

Conventions read from each root's serialized contract (`describe().contract`):

- **`examples: [...]`** (standard JSON Schema keyword) — every example is
  WRITTEN through the real surface: it must be accepted, and it must
  round-trip (`read()` returns what was written — catching contracts the app
  itself violates, not just values the contract refuses).
- **`$counterexamples: [...]`** (our convention) — every one must be
  REFUSED by `write()`. A contract that never refuses anything isn't a
  contract; counterexamples prove the gate exists.

State is snapshotted per root and restored after each root's trials.

Future: richer exercise steps as custom properties (e.g. `$exercise`)
written in **AJS** — serializable like the schema, executable like a test,
sandboxable like neither `Function` nor `eval`. The contract file becomes
the whole conformance suite, shippable over the wire.

> **EXPERIMENTAL.** Ships alongside the agent surface; shapes may change.
*/
import { AgentInterface } from './agent'

export interface ContractTrial {
  root: string
  kind: 'example' | 'counterexample'
  value: any
  passed: boolean
  error?: string
}

export interface ContractReport {
  passed: number
  failed: number
  trials: ContractTrial[]
}

// faithful structural equality — deliberately NOT JSON.stringify comparison,
// which normalizes Dates (via toJSON) on both sides and so hides exactly the
// serialization infidelity round-tripping exists to catch
const same = (a: any, b: any): boolean => {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null)
    return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  // only plain data survives the surface; anything fancier must be identical
  const plain = (x: any) =>
    x.constructor === Object || x.constructor === Array || x.constructor == null
  if (!plain(a) || !plain(b)) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => same(a[key], b[key]))
}

/**
 * Exercise every example and counterexample in the surface's declared
 * contract, through the surface itself. Pure over the public API — usable
 * from bun test, a doc fence, or an agent's own self-check.
 */
export const exerciseContract = (agent: AgentInterface): ContractReport => {
  const contract = agent.describe().contract ?? {}
  const trials: ContractTrial[] = []

  for (const [root, schema] of Object.entries(contract)) {
    const examples: any[] = (schema as any)?.examples ?? []
    const counterexamples: any[] = (schema as any)?.$counterexamples ?? []
    const snapshot = agent.read(root)

    for (const value of examples) {
      let passed = true
      let error: string | undefined
      try {
        agent.write(root, value)
        const readBack = agent.read(root)
        if (!same(readBack, value)) {
          passed = false
          error = 'round-trip mismatch: read() returned a different value'
        }
      } catch (e) {
        passed = false
        error = `example rejected: ${(e as Error).message}`
      }
      trials.push({ root, kind: 'example', value, passed, error })
    }

    for (const value of counterexamples) {
      let passed = false
      let error: string | undefined
      try {
        agent.write(root, value)
        error = 'counterexample was ACCEPTED'
      } catch {
        passed = true // refusal is the pass
      }
      trials.push({ root, kind: 'counterexample', value, passed, error })
    }

    if (snapshot !== undefined) {
      try {
        agent.write(root, snapshot)
      } catch (_e) {
        // a snapshot the contract itself refuses is a finding, not a crash —
        // it will already have surfaced as a failed example or in app tests
      }
    }
  }

  const failed = trials.filter((trial) => !trial.passed).length
  return { passed: trials.length - failed, failed, trials }
}
