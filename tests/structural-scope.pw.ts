import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * describe()'s structural tier under a MANIFEST, in real engines.
 *
 * The tier drops anything measuring 0×0, and happy-dom measures everything
 * 0×0 — so the unit tests only see it through a mocked
 * `getBoundingClientRect`, which is validating the fix with a stub of the
 * thing that hid the bug. Here real layout supplies the geometry.
 *
 * Pins both halves of the documented boundary (Secrets, agent.ts): scope
 * withholds a heading BOUND to an undeclared path, and says so with
 * `textWithheld`; it cannot see an UNBOUND heading's text, and the author's
 * `data-tosi-secret` still withholds that.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

test('structural headings under a manifest: bound is withheld and marked, unbound is published', async ({
  page,
}) => {
  await page.route('**/__tosi-test/module.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')

  const records = await page.evaluate(async () => {
    const { tosi, elements, bind, bindings, updates, enableAgentInterface } =
      await import('/__tosi-test/module.js')

    const { stPriv } = tosi({
      stPub: { title: 'PUBLIC-TITLE' },
      stPriv: { key: 'sk-BROWSER-STRUCT' },
    })
    await updates()
    const bound = elements.h2({ id: 'st-bound' })
    const copied = elements.h2(
      { id: 'st-copied' },
      `Copied ${stPriv.key.value}`
    )
    const marked = elements.h2({ id: 'st-marked' }, 'MARKED-STRUCT')
    marked.setAttribute('data-tosi-secret', '')
    const plain = elements.h2({ id: 'st-plain' }, 'Plain Section')
    const hidden = elements.h2(
      { id: 'st-hidden', 'aria-hidden': 'true' },
      'HIDDEN-STRUCT'
    )
    // a LANDMARK holding a child bound to the undeclared path
    const leaf = elements.span()
    const landmark = elements.section({ id: 'st-section' }, 'Key: ', leaf)
    const wrap = elements.div(bound, copied, marked, plain, hidden, landmark)
    document.body.append(wrap)
    bind(bound, 'stPriv.key', bindings.text)
    bind(leaf, 'stPriv.key', bindings.text)
    await updates()

    const agent = enableAgentInterface({
      quiet: true,
      expose: { roots: ['stPub'] },
    })
    const out = agent
      .describe()
      .wiring.filter((r: any) => r.id?.startsWith('st-'))
    agent.disable()
    wrap.remove()
    return out
  })

  const byId = (id: string) => records.find((r: any) => r.id === id)
  const json = JSON.stringify(records)
  // POSITIVE CONTROL: real layout put the tier on the map at all
  expect(byId('st-plain')?.text).toBe('Plain Section')
  expect(byId('st-plain')?.textWithheld).toBeUndefined()
  // bound to an undeclared path: withheld, and marked as withheld
  expect(byId('st-bound')).toBeDefined()
  expect(byId('st-bound')?.text).toBeUndefined()
  expect(byId('st-bound')?.textWithheld).toBe(true)
  // unbound copy: published — the documented limit of scope
  expect(byId('st-copied')?.text).toBe('Copied sk-BROWSER-STRUCT')
  // the author's marker still withholds unbound text
  expect(json).not.toContain('MARKED-STRUCT')
  expect(byId('st-marked')?.textWithheld).toBe(true)
  // aria-hidden: hidden from assistive tech means hidden here, in a real engine
  expect(json).not.toContain('HIDDEN-STRUCT')
  // the landmark is mapped, but carries none of its bound child's value
  expect(byId('st-section')).toBeDefined()
  expect(JSON.stringify(byId('st-section'))).not.toContain('sk-BROWSER-STRUCT')
})
