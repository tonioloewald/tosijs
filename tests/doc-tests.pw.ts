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
  expect(
    ran,
    'no inline doc tests ran — the runner never started'
  ).toBeGreaterThan(0)

  // `ran > 0` alone is not a gate: drop a page from docPaths, or mistype one
  // fence language tag, and the corpus silently shrinks while both CI lanes
  // stay green. These pages carry the ONLY real-browser coverage of the agent
  // surface, so each must contribute at least one passing test by name, and
  // the total is pinned so a loss anywhere has to be acknowledged deliberately.
  // matched as substrings: markdown pages key by filename, but a doc block
  // inside a source file keys by its own slug, and pinning the exact form
  // would just be a second thing to keep in sync
  const REQUIRED_PAGES = [
    'agent-surface',
    'one-user-interface',
    'derived-surface',
    'bind',
  ]
  const pageKeys = Object.keys(results.pages)
  for (const page of REQUIRED_PAGES) {
    expect(
      pageKeys.some((key) => key.includes(page)),
      `no inline doc tests ran for "${page}" (saw: ${pageKeys.join(', ')}) — ` +
        'was it dropped from docPaths, or did a fence language tag get mistyped?'
    ).toBe(true)
  }

  const MINIMUM_CORPUS = 17
  expect(
    ran,
    `the inline doc-test corpus shrank to ${ran} (expected at least ` +
      `${MINIMUM_CORPUS}). If that is deliberate, lower MINIMUM_CORPUS in the ` +
      'same commit; otherwise a page or a fence went missing.'
  ).toBeGreaterThanOrEqual(MINIMUM_CORPUS)

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
