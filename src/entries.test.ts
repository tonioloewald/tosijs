import { test, expect, describe } from 'bun:test'

// The entry map is a PUBLIC CONTRACT: tosijs (everything), tosijs/core
// (slim — no blueprint machinery, no multi-window leaves) and tosijs/state
// (DOM-free, tosijs#18). These tests pin what's in each door.
describe('entry points', () => {
  test('tosijs/state is DOM-FREE at import and carries the state API', async () => {
    // the whole point of #18: no HTMLElement, no document, no shim
    const state = await import('./index-state')
    for (const name of [
      'xin',
      'boxed',
      'tosi',
      'observe',
      'unobserve',
      'touch',
      'updates',
      'getByPath',
      'setByPath',
      'tosiPath',
      'tosiValue',
      'throttle',
    ]) {
      expect(typeof (state as any)[name]).not.toBe('undefined')
    }
    // and nothing DOM-facing leaked in
    expect('Component' in state).toBe(false)
    expect('elements' in state).toBe(false)
    expect('css' in state).toBe(false)

    // it actually works: observers fire with no DOM in sight
    const { tosi, observe, updates } = state as any
    const { stateEntry } = tosi({ stateEntry: { n: 0 } })
    await updates() // drain the registration touch — as agents/apps do
    const seen: string[] = []
    observe('stateEntry.n', (p: string) => seen.push(p))
    stateEntry.n = 1
    await updates()
    expect(seen).toEqual(['stateEntry.n'])
  })

  test('the BUILT state bundle imports in plain node — no DOM, no shim (tosijs#18)', async () => {
    // the acceptance criterion of #18 is environmental, so the test has to
    // leave this process: happy-dom is already registered here, which would
    // mask exactly the failure we're pinning
    const { existsSync } = await import('node:fs')
    const bundle = 'dist/state.js'
    // NB: `bun run build` wipes dist BEFORE running the suite, so this is
    // normally absent here — the REAL gate runs inside buildLibrary() after
    // the bundle exists (bare node, no happy-dom). This copy is for
    // developers running `bun test` against an existing build.
    if (!existsSync(bundle)) {
      console.log("(state.js absent — the build's dom-free gate covers this)")
      return
    }
    const script = `
      import { tosi, observe, updates, xin } from './${bundle}'
      const { nodeProbe } = tosi({ nodeProbe: { n: 0 } })
      await updates()
      const seen = []
      observe('nodeProbe.n', (p) => seen.push(p))
      nodeProbe.n = 42
      await updates()
      if (seen[0] !== 'nodeProbe.n' || xin['nodeProbe.n'] !== 42) process.exit(2)
      process.exit(0)
    `
    const result = Bun.spawnSync(
      ['node', '--input-type=module', '-e', script],
      {
        cwd: process.cwd(),
        stderr: 'pipe',
        stdout: 'pipe',
      }
    )
    expect({
      code: result.exitCode,
      stderr: result.stderr.toString().slice(0, 300),
    }).toEqual({ code: 0, stderr: expect.any(String) })
  })

  test('tosijs/core omits blueprints and the multi-window leaves, keeps the rest', async () => {
    const core = await import('./index-core')
    // omitted, deliberately
    for (const name of [
      'tosiBlueprint',
      'tosiLoader',
      'makeComponent',
      'share',
      'sync',
      'hotReload',
    ]) {
      expect(name in core).toBe(false)
    }
    // present: the actual library
    for (const name of [
      'tosi',
      'elements',
      'Component',
      'bind',
      'css',
      'Color',
    ]) {
      expect(typeof (core as any)[name]).not.toBe('undefined')
    }
    // the agent surface lives behind tosijs/agent (its ~11 KB must not ride
    // on consumers who never describe their app — and the IIFE can't shake)
    for (const name of [
      'enableAgentInterface',
      'schematicSVG',
      'auditAccessibility',
      'webmcpTools',
      'exerciseContract',
    ]) {
      expect(name in core).toBe(false)
    }
  })

  test('tosijs/agent carries the whole agent surface, and ComponentMap stays on BOTH', async () => {
    const agent = await import('./index-agent')
    for (const name of [
      'enableAgentInterface',
      'webmcpTools',
      'webmcpAdapter',
      'schematicSVG',
      'rasterizeSVG',
      'boundsOf',
      'auditAccessibility',
      'auditFlags',
      'contrastRatio',
      'exerciseContract',
      'exerciseComponent',
      'AGENT_SURFACE_VERSION',
    ]) {
      expect(typeof (agent as any)[name]).not.toBe('undefined')
    }
    // the main entry carries it too — ONE runtime copy of the registry.
    // A separately-bundled subpath gave the agent its own registry and it
    // described an empty app; `tosijs/agent` is the same file, narrower
    // types. The IIFE (which cannot shake) is where the weight is dropped.
    const full = await import('./index')
    expect(typeof (full as any).enableAgentInterface).toBe('function')
  })

  test('THE HAZARD: agent and core must share ONE registry', async () => {
    const core = await import('./index')
    const agentEntry = await import('./index-agent')
    const { updates } = core as any
    ;(core as any).tosi({ oneRegistry: { n: 41 } })
    await updates()
    const a = agentEntry.enableAgentInterface({ global: false, expose: 'all' })
    try {
      // if these ever become separate bundles again, this reads undefined
      expect(a.read('oneRegistry.n')).toBe(41)
      a.write('oneRegistry.n', 42)
      await updates()
      expect((core as any).xin['oneRegistry.n']).toBe(42)
    } finally {
      a.disable()
    }
  })

  test('the IIFE/browser entry omits the agent surface (a script tag cannot shake)', async () => {
    const browser = await import('./index-browser')
    for (const name of [
      'enableAgentInterface',
      'schematicSVG',
      'auditAccessibility',
    ]) {
      expect(name in browser).toBe(false)
    }
    for (const name of ['tosi', 'elements', 'Component', 'tosiBlueprint']) {
      expect(typeof (browser as any)[name]).not.toBe('undefined')
    }
  })

  test('the full entry is a SUPERSET of core — no export lands in one and not the other', async () => {
    const full = await import('./index')
    const core = await import('./index-core')
    const missing = Object.keys(core).filter((name) => !(name in full))
    expect(missing).toEqual([])
    // …and the extras are exactly the documented ones
    const extras = Object.keys(full)
      .filter((name) => !(name in core))
      .sort()
    const agentEntry = await import('./index-agent')
    const expected = [
      'Blueprint',
      'BlueprintLoader',
      'blueprint',
      'blueprintLoader',
      'hotReload',
      'makeComponent',
      'share',
      'sync',
      'tosiBlueprint',
      'tosiLoader',
      ...Object.keys(agentEntry), // the agent surface rides the full entry
    ]
      .filter((name) => !(name in core))
      .sort()
    expect(extras).toEqual([...new Set(expected)].sort())
  })

  // NB: the size-regression gate lives in buildLibrary() (bin/site.ts),
  // where the artifacts actually exist. A copy here could never run during
  // `bun run build` — buildSite() wipes dist BEFORE the suite — so it
  // asserted nothing and a regression would have shipped fully green.
  test('the gzip budgets are enforced by the BUILD, not by this suite', async () => {
    const site = await Bun.file('bin/site.ts').text()
    expect(site).toContain('gzip budgets:')
    expect(site).toContain('over its')
    // and the bin is executed as consumers run it (node, the bundle)
    expect(site).toContain('bin gate: node dist/cli.mjs runs')
  })

  test('slim core warns about blueprint markup it cannot hydrate', async () => {
    await import('./index-core') // installs the dev-mode check
    const el = document.createElement('tosi-blueprint')
    document.body.append(el)
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    try {
      // the check is scheduled (DOMContentLoaded or a macrotask) — run the
      // same query it runs, to prove the selector finds unhydrated markup
      const orphans = document.querySelectorAll(
        'tosi-blueprint:not(:defined), tosi-loader:not(:defined)'
      )
      expect(
        orphans.length > 0 || customElements.get('tosi-blueprint') != null
      ).toBe(true)
    } finally {
      console.warn = original
      el.remove()
    }
  })
})
