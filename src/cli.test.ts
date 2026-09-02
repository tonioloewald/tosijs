import { test, expect, describe } from 'bun:test'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const CLI = resolve(import.meta.dir, '../bin/cli.ts')
const run = (args: string[], cwd: string) =>
  Bun.spawnSync(['bun', CLI, ...args], { cwd, stdout: 'pipe', stderr: 'pipe' })

describe('the scaffolder — bunx tosijs create …', () => {
  test('component (default): blueprint form, agent-ready, zero runtime imports', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    const result = run(['create', 'component', 'demo-widget'], dir)
    expect(result.exitCode).toBe(0)
    const source = readFileSync(join(dir, 'demo-widget.ts'), 'utf-8')
    expect(source).toContain('satisfies ComponentMap') // born with a contract
    expect(source).toContain('tests: [') // …and a declared test
    expect(source).toContain('export default blueprint')
    expect(source).toContain('import type {') // type-only: bundles dependency-free
    expect(source).not.toContain('preferredTagName') // the TAG comes at hydration
  })

  test('component --bare: plain class form', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    expect(
      run(['create', 'component', 'demo-widget', '--bare'], dir).exitCode
    ).toBe(0)
    const source = readFileSync(join(dir, 'demo-widget.ts'), 'utf-8')
    expect(source).toContain("static preferredTagName = 'demo-widget'")
    expect(source).toContain('static contract = contract')
    expect(source).toContain('elementCreator()')
  })

  test('a dashless tag is refused with a suggestion', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    const result = run(['create', 'component', 'widget'], dir)
    expect(result.exitCode).toBe(1)
    expect(result.stderr.toString()).toContain('tosi-widget')
  })

  test('app: runnable tree, agent-enabled, component included', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    expect(run(['create', 'app', 'my-app'], dir).exitCode).toBe(0)
    for (const file of [
      'my-app/package.json',
      'my-app/index.html',
      'my-app/src/app.ts',
      'my-app/src/components/my-app.ts',
      'my-app/README.md',
    ]) {
      expect(existsSync(join(dir, file))).toBe(true)
    }
    const app = readFileSync(join(dir, 'my-app/src/app.ts'), 'utf-8')
    expect(app).toContain('makeComponent')
    // the scaffold must ship the PRODUCTION posture — an allowlist, not a
    // wide-open surface written into every generated app
    expect(app).toContain('enableAgentInterface({')
    expect(app).toContain('roots:')
    expect(app).not.toMatch(/enableAgentInterface\(\)\s*$/m)
    // …and it must SAY how to widen it, so the dev affordance is a choice
    expect(app).toContain("expose: 'all'")
    /*
     * THE GENERATED README IS SHIPPED PROSE. (1.9.0 pre-minor review, M-1.)
     *
     * `bunx tosijs create app` writes this onto a machine we do not own, with
     * no rollback, and it told the reader that omitting `expose` "gives
     * read-only introspection over everything" for a whole release after that
     * stopped being true. Nothing caught it because these assertions only ever
     * read the generated app SOURCE, never the generated documentation.
     */
    const readme = readFileSync(join(dir, 'my-app/README.md'), 'utf-8')
    expect(readme).not.toMatch(/read-only introspection/i)
    expect(readme).toMatch(/exposes \*\*nothing\*\*|exposes nothing/i)
    // and it must not teach the pre-1.9.0 model, in which `expose` scoped
    // state only and `describe()` walked the whole page regardless
    expect(readme).not.toMatch(/scopes STATE, not the map/i)
    const pkg = JSON.parse(
      readFileSync(join(dir, 'my-app/package.json'), 'utf-8')
    )
    expect(pkg.dependencies.tosijs).toMatch(/^\^1\./)
  })

  test('blueprint: publishable package with zero-dep build and markup demo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    expect(run(['create', 'blueprint', 'neat-thing'], dir).exitCode).toBe(0)
    const pkg = JSON.parse(
      readFileSync(join(dir, 'neat-thing/package.json'), 'utf-8')
    )
    expect(pkg.files).toEqual(['dist'])
    expect(pkg.scripts.build).toContain('bun build')
    const html = readFileSync(join(dir, 'neat-thing/index.html'), 'utf-8')
    expect(html).toContain('<tosi-blueprint tag="neat-thing"')
    expect(html).toContain('<neat-thing></neat-thing>')
    // THE WRAPPER IS LOAD-BEARING: hydration runs from <tosi-loader>'s
    // connectedCallback, so a bare <tosi-blueprint> renders nothing and says
    // nothing. The substring match above passed happily on that broken
    // markup — and shipped it into the user's published README.
    expect(html).toMatch(
      /<tosi-loader>\s*<tosi-blueprint tag="neat-thing"[^>]*><\/tosi-blueprint>\s*<\/tosi-loader>/
    )
    const readme = readFileSync(join(dir, 'neat-thing/README.md'), 'utf-8')
    expect(readme).toContain('<tosi-loader>')
  })

  test('THE PROOF: a scaffolded component passes its own harness, out of the box', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'tosijs-cli-'))
    run(['create', 'component', 'proof-widget'], dir)
    // type-only tosijs imports erase at runtime — the file imports clean
    const mod = await import(join(dir, 'proof-widget.ts'))
    const { makeComponent } = await import('./make-component')
    const { exerciseComponent } = await import('./contract')
    const { creator } = await makeComponent('proof-widget', mod.default)
    const el = creator()
    document.body.append(el)
    const report = await exerciseComponent(el as HTMLElement)
    expect(report.failed).toBe(0)
    expect(report.passed).toBeGreaterThanOrEqual(4) // parts + examples + test
    el.remove()
  })
})
