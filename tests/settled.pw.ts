import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * agent.settled() in REAL engines (tosijs#48). The unit suite fakes
 * requestAnimationFrame to hold a Component render; here the browser's own
 * frame timing decides when the render runs, and settled() must wait for it.
 * The not-covered case is pinned too: a timer write still pending when
 * settled resolves true.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

test('settled() waits for real renders and returned work, and is honest about a pending timer', async ({
  page,
}) => {
  await page.route('**/__tosi-test/module.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')

  const out = await page.evaluate(async () => {
    const { tosi, Component, updates, enableAgentInterface } = await import(
      '/__tosi-test/module.js'
    )
    let renders = 0
    class SettledProbe extends Component {
      static preferredTagName = 'settled-probe'
      render() {
        super.render()
        renders++
      }
    }
    const { sp } = tosi({
      sp: {
        n: 0,
        save: () => new Promise((r) => setTimeout(r, 120)),
      },
    })
    await updates()
    const agent = enableAgentInterface({ quiet: true, expose: 'all' })

    // a render queued by connecting a component, plus returned async work
    const el = SettledProbe.elementCreator()()
    document.body.append(el)
    agent.call('sp.save')
    const a = await agent.settled({ quietMs: 20 })
    const rendersAtSettle = renders

    // NOT covered: a timer that writes state after settled resolves
    setTimeout(() => (sp.n.value = 1), 300)
    const b = await agent.settled({ quietMs: 20 })
    const nAtSettle = sp.n.value

    agent.disable()
    el.remove()
    return { a, rendersAtSettle, b, nAtSettle }
  })

  expect(out.a.settled).toBe(true)
  expect(out.a.waitedMs).toBeGreaterThanOrEqual(115) // waited for the returned promise
  expect(out.rendersAtSettle).toBeGreaterThan(0) // and the real-frame render ran first
  expect(out.b.settled).toBe(true)
  expect(out.nAtSettle).toBe(0) // ← settled, with a timer write still pending
  expect(out.b.notCovered).toContain('timers')
})
