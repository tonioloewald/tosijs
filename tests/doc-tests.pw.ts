import { test, expect } from '@playwright/test'

/*
 * The inline ```test fences across the tosijs docs are the real-browser
 * regression coverage for behaviors happy-dom can't exercise (composed-event
 * retargeting, spec-correct <template> cloning, getComputedStyle-resolved
 * derived CSS vars). The doc-browser's background runner iframes every
 * page-with-tests on localhost and resolves window.__docTestResults with the
 * totals; we await it and assert nothing failed. One navigation gates the
 * whole corpus. (Mirrors tosijs-ui/tests/doc-tests.pw.ts.)
 */
interface PageResult {
  passed: boolean
  totalPassed: number
  totalFailed: number
  tests: { name: string; passed: boolean; error?: string }[]
}
interface DocTestResults {
  passed: number
  failed: number
  pages: Record<string, PageResult>
}

test('every inline doc test passes (the whole ```test tier)', async ({
  page,
  browserName,
}) => {
  // WebKit: the iframe runner never posts per-page completion, so pages wait
  // out the 30s per-page timeout (chromium+firefox run them all green). We
  // don't enable a webkit project, but skip defensively if one is added.
  test.skip(
    browserName === 'webkit',
    'WebKit: iframe test-runner does not signal per-page completion'
  )
  test.setTimeout(180_000)

  await page.goto('/')
  const results = (await page.evaluate(
    () => (window as any).__docTestResults as Promise<DocTestResults>
  )) as DocTestResults

  const ran = results.passed + results.failed
  expect(ran, 'no inline doc tests ran — the runner never started').toBeGreaterThan(0)

  if (results.failed > 0) {
    const detail = Object.entries(results.pages)
      .filter(([, p]) => !p.passed)
      .map(([file, p]) => {
        const failed = p.tests
          .filter((t) => !t.passed)
          .map((t) => `    ✗ ${t.name}${t.error ? ` — ${t.error}` : ''}`)
          .join('\n')
        return `  ${file} (${p.totalFailed} failed):\n${failed}`
      })
      .join('\n')
    throw new Error(`${results.failed} inline doc test(s) failed:\n${detail}`)
  }
})
