import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * Shadow-DOM secret redaction, in REAL engines.
 *
 * The unit suite covers this now, but happy-dom is not a trustworthy witness
 * for shadow-boundary behaviour, and this defect is exactly the shape that
 * hides behind a shim: every secret scan in `agent.ts` used
 * `document.querySelectorAll` / `closest`, which stop at a shadow boundary,
 * while `bind` deliberately crosses it. A password inside a styled Component
 * reached `read()`, `changes()` and `describe()` in cleartext — against a
 * guarantee stated unconditionally in the docs — and ~15 existing secret
 * tests, all light-DOM, went on passing.
 *
 * The general rule this lane exists for (CLAUDE.md): an environment-suppressed
 * assertion is a passing test that proves nothing. If a guard depends on the
 * DOM's real semantics, make a real DOM answer.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

test('a password inside a shadow root never reaches the agent surface', async ({
  page,
}) => {
  await page.route('**/__tosi-test/module.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')

  const result = await page.evaluate(async () => {
    const { tosi, elements, bind, bindings, updates, enableAgentInterface } =
      await import('/__tosi-test/module.js')

    const { creds } = tosi({ creds: { user: 'ada', password: 'hunter2' } })
    await updates()

    // the SUPPORTED pattern: a component with a shadow root, its value bound
    // from outside, the secret control rendered inside the shadow tree
    const host = document.createElement('div')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const field = elements.input({ type: 'password' })
    shadow.append(field)
    bind(field, 'creds.password', bindings.value)
    await updates()

    const agent = enableAgentInterface({ quiet: true, expose: 'all' })
    const out = {
      direct: agent.read('creds.password'),
      ancestor: JSON.stringify(agent.read('creds')),
      described: JSON.stringify(agent.describe()),
    }
    agent.disable()
    host.remove()
    return out
  })

  expect(result.direct).toBe('⟨secret⟩')
  expect(result.ancestor).toContain('⟨secret⟩')
  expect(result.ancestor).not.toContain('hunter2')
  // the non-secret sibling is still readable — redaction, not blanket refusal
  expect(result.ancestor).toContain('ada')
  expect(result.described).not.toContain('hunter2')
})
