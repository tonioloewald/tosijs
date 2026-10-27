import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * tosijs loaded by a classic <script> in <head> (#3511). That script runs
 * before <body> is parsed, so document.body is null; the module-scope
 * hydration observer used to call observe(document.body) and throw, aborting
 * the whole bundle — no exports, no custom elements, an inert page.
 *
 * dist/main.js (CommonJS) behind a module.exports shim is the synchronous,
 * classic-script form of the library with its API reachable, so this spec can
 * check that what hangs on the delegation root still works once <body> exists:
 * hydration of an element bound while detached, two-way value binding, and
 * on() event delegation.
 */

const mainSource = readFileSync(
  join(__dirname, '..', 'dist', 'main.js'),
  'utf-8'
)
const ORIGIN = 'https://head-script.test'

const html = `<!doctype html><meta charset="utf-8">
<html><head>
<script>var module = { exports: {} }, exports = module.exports</script>
<script src="/main.js"></script>
<script>window.tosijs = module.exports</script>
</head>
<body>
<script>
{ // a block: main.js as a classic script declares its own globals
  const { tosi, bind, bindings, on, elements } = window.tosijs
  const { headScript } = tosi({ headScript: { label: 'first', clicks: 0 } })
  window.headScript = headScript
  const { div, span, input, button } = elements
  // bound while detached, inserted later: only the observer renders it
  const panel = div(span({ class: 'label' }))
  bind(panel.querySelector('.label'), 'headScript.label', bindings.text)
  setTimeout(() => document.body.append(panel), 0)
  const field = input({ class: 'field', bindValue: headScript.label })
  const clicker = button({ class: 'clicker' }, 'click')
  on(clicker, 'click', () => { headScript.clicks.value += 1 })
  document.body.append(field, clicker)
}
</script>
</body></html>`

test('tosijs loaded from a <head> script evaluates and binds', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route(`${ORIGIN}/**`, (route) => {
    const path = new URL(route.request().url()).pathname
    return path === '/main.js'
      ? route.fulfill({ contentType: 'text/javascript', body: mainSource })
      : route.fulfill({ contentType: 'text/html', body: html })
  })
  await page.goto(`${ORIGIN}/`)

  expect(errors).toEqual([])
  expect(await page.evaluate(() => typeof (window as any).tosijs?.tosi)).toBe(
    'function'
  )
  // hydration: the panel was bound before it was in the document
  await expect(page.locator('.label')).toHaveText('first')
  // two-way binding through the delegated input listener
  await page.locator('.field').fill('typed')
  await expect(page.locator('.label')).toHaveText('typed')
  // on() delegation
  await page.locator('.clicker').click()
  await page.locator('.clicker').click()
  expect(
    await page.evaluate(() => (window as any).headScript.clicks.value)
  ).toBe(2)
})
