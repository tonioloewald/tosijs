import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface } from './agent'
import { webmcpTools, webmcpAdapter } from './webmcp'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
})

/** run fn with console.warn/error captured (and out of the test output) */
const captured = <T>(
  fn: () => T
): { result: T; warnings: string[]; errors: string[] } => {
  const warnings: string[] = []
  const errors: string[] = []
  const [warn, error] = [console.warn, console.error]
  console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
  console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
  try {
    return { result: fn(), warnings, errors }
  } finally {
    console.warn = warn
    console.error = error
  }
}

describe('webmcpTools — the tools write themselves', () => {
  test('core tools plus one named tool per discovered action', async () => {
    tosi({
      mcpApp: {
        list: [] as string[],
        addItem(_item: string) {},
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const tools = webmcpTools(agent)
    const names = tools.map((t) => t.name)
    expect(names).toContain('tosi_describe')
    expect(names).toContain('tosi_read')
    expect(names).toContain('tosi_changes')
    expect(names).toContain('tosi_act_mcpApp_addItem') // derived, not declared
  })

  test('write tool: EXPLICIT consent only — never inferred from a mode', async () => {
    tosi({ mcpGate: { x: 1, go() {} } })
    await updates()
    // 1.8.0: introspection mode is no longer consent to publish an
    // unvalidated write endpoint to the browser's tool registry
    const dev = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(webmcpTools(dev).some((t) => t.name === 'tosi_write')).toBe(false)
    expect(
      webmcpTools(dev, { allowWrites: true }).some(
        (t) => t.name === 'tosi_write'
      )
    ).toBe(true)
    dev.disable()

    const prod = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['mcpGate'], actions: ['mcpGate.go'] },
    }))
    expect(webmcpTools(prod).some((t) => t.name === 'tosi_write')).toBe(false)
    expect(
      webmcpTools(prod, { allowWrites: true }).some(
        (t) => t.name === 'tosi_write'
      )
    ).toBe(true)
    // manifest mode still gets its declared action as a named tool
    expect(
      webmcpTools(prod).some((t) => t.name === 'tosi_act_mcpGate_go')
    ).toBe(true)
  })

  test('execute plumbing round-trips through the real surface', async () => {
    const store = {
      mcpExec: {
        items: [] as string[],
        add(item: string) {
          ;(mcpExec.items as any).push(item)
        },
      },
    }
    const { mcpExec } = tosi(store)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const tools = Object.fromEntries(webmcpTools(agent).map((t) => [t.name, t]))

    const { cursor } = tools.tosi_changes.execute({})
    tools.tosi_act_mcpExec_add.execute({ args: ['from a tool'] })
    // the write tool exists only with explicit consent
    const writeTool = Object.fromEntries(
      webmcpTools(agent, { allowWrites: true }).map((t) => [t.name, t])
    ).tosi_write
    writeTool.execute({ path: 'mcpExec.items[0]', value: 'rewritten' })
    await updates()

    expect(tools.tosi_read.execute({ path: 'mcpExec.items' })).toEqual([
      'rewritten',
    ])
    const drained = tools.tosi_changes.execute({ since: cursor })
    expect(drained.changes.length).toBeGreaterThan(0)
    const map = tools.tosi_describe.execute({})
    expect(map.exposure).toBe('introspection')
  })
})

describe('webmcpAdapter — registration against a host', () => {
  test('no host: returns undefined (callers feature-detect by result)', () => {
    tosi({ mcpNoHost: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(webmcpAdapter(agent)).toBeUndefined()
  })

  test('registerTool host: registers each tool, unregister reverses', () => {
    tosi({ mcpHostA: { go() {} } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const registered: string[] = []
    const removed: string[] = []
    const host = {
      registerTool(tool: any) {
        registered.push(tool.name)
        return { unregister: () => removed.push(tool.name) }
      },
    }
    const mcp = webmcpAdapter(agent, { modelContext: host })!
    expect(mcp.tools).toEqual(registered)
    expect(registered).toContain('tosi_act_mcpHostA_go')
    mcp.unregister()
    expect(removed).toEqual(registered)
  })

  test('provideContext host: batch registration, unregister clears', () => {
    tosi({ mcpHostB: { x: 0 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const calls: any[] = []
    const host = { provideContext: (ctx: any) => calls.push(ctx) }
    const mcp = webmcpAdapter(agent, { modelContext: host })!
    expect(calls[0].tools.map((t: any) => t.name)).toEqual(mcp.tools)
    mcp.unregister()
    expect(calls[1].tools).toEqual([])
  })
})

describe('enableAgentInterface — one call, whole surface', () => {
  test('auto-registers with the model-context host; disable() unregisters', () => {
    tosi({ mcpAuto: { go() {} } })
    const registered: string[] = []
    const removed: string[] = []
    const host = {
      registerTool(tool: any) {
        registered.push(tool.name)
        return { unregister: () => removed.push(tool.name) }
      },
    }
    current = enableAgentInterface({
      global: false,
      expose: 'all', // act tools require a surface that will EXECUTE them
      webmcp: { modelContext: host },
    })
    expect(registered).toContain('tosi_describe')
    expect(registered).toContain('tosi_act_mcpAuto_go')
    current.disable()
    expect(removed).toEqual(registered)
    current = undefined
  })

  test('webmcp: false keeps the surface off a detectable host; default finds it', () => {
    tosi({ mcpOptOut: { x: 1 } })
    const registered: string[] = []
    const host = {
      registerTool(tool: any) {
        registered.push(tool.name)
        return { unregister() {} }
      },
    }
    ;(document as any).modelContext = host
    try {
      // the option gates registration even though detection WOULD succeed
      current = enableAgentInterface({ global: false, webmcp: false })
      expect(registered).toEqual([])
      expect(current.webmcp).toBeUndefined()
      current.disable()
      // default true: the host is discovered without being injected
      current = enableAgentInterface({ global: false, expose: 'all' })
      expect(registered).toContain('tosi_describe')
      expect(current.webmcp?.tools).toEqual(registered)
    } finally {
      delete (document as any).modelContext
    }
  })
})

describe('handle-less hosts (Canary today) — register once, stay live', () => {
  test('re-enable neither duplicates nor strands: old tools hit the CURRENT surface', () => {
    tosi({ mcpDup: { x: 1, go() {} }, mcpDupPriv: { y: 2 } })
    const registered: any[] = []
    const host = {
      registerTool(tool: any) {
        if (registered.some((t) => t.name === tool.name)) {
          throw new Error(`duplicate tool name: ${tool.name}`)
        }
        registered.push(tool)
        // returns nothing: no unregister handle, no unregisterTool — Canary
      },
    }
    // both roots declared: tosi_read publishes only for a scoped surface
    current = enableAgentInterface({
      global: false,
      webmcp: { modelContext: host },
      expose: { roots: ['mcpDup', 'mcpDupPriv'] },
    })
    const count = registered.length
    const readTool = registered.find((t) => t.name === 'tosi_read')
    expect(readTool.execute({ path: 'mcpDup.x' })).toBe(1)

    // re-enable (mode switch): same host — no duplicate registrations,
    // no console errors, no throw
    current = enableAgentInterface({
      global: false,
      webmcp: { modelContext: host },
      expose: { roots: ['mcpDup'] },
    })
    expect(registered.length).toBe(count)
    // the ORIGINAL registration is late-bound: it now speaks to the
    // manifest-mode surface, refusals included
    expect(() => readTool.execute({ path: 'mcpDupPriv.y' })).toThrow(
      /not exposed/
    )
    expect(readTool.execute({ path: 'mcpDup.x' })).toBe(1)

    // disabled with nothing active = REFUSED — the forever-registered tool
    // neither resurrects a dead surface nor pins one for the page's life
    current!.disable()
    current = undefined
    expect(() => readTool.execute({ path: 'mcpDup.x' })).toThrow(
      /no active surface/
    )
  })
})

describe('tosi_surface — the identity tool (tosijs#23)', () => {
  test('a WebMCP consumer can interrogate the surface before trusting it', async () => {
    tosi({ mcpSurface: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const tools = Object.fromEntries(webmcpTools(agent).map((t) => [t.name, t]))
    expect(tools.tosi_surface).toBeDefined()
    const identity = tools.tosi_surface.execute({})
    expect(typeof identity.surface).toBe('string')
    expect(Array.isArray(identity.capabilities)).toBe(true)
    expect(identity.capabilities.includes('describe')).toBe(true)
  })
})

describe('a refused tool is not a registered tool (review M23)', () => {
  test('the receipt lists what the host ACCEPTED, and a failure is not held', () => {
    tosi({ mcpRefuse: { x: 1, go() {} } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const accepted: string[] = []
    const host = {
      registerTool(tool: any) {
        // a host that rejects one tool (bad schema, quota, transient…)
        if (tool.name === 'tosi_changes') throw new Error('schema rejected')
        accepted.push(tool.name)
        return { unregister() {} }
      },
    }
    const {
      result: mcp,
      warnings,
      errors,
    } = captured(() => webmcpAdapter(agent, { modelContext: host })!)
    // the receipt does not claim a tool the host never received
    expect(mcp.tools).toEqual(accepted)
    expect(mcp.tools).not.toContain('tosi_changes')
    expect(warnings.some((w) => w.includes('tosi_changes'))).toBe(true)
    // …and the gap between generated and held is escalated (SEC-12)
    expect(errors.some((e) => e.includes('tosi_changes'))).toBe(true)

    // …and the failure did not blacklist the name: a later attempt retries
    const retryHost = {
      registerTool(tool: any) {
        accepted.push(`retry:${tool.name}`)
        return { unregister() {} }
      },
    }
    const second = webmcpAdapter(agent, { modelContext: retryHost })!
    expect(second.tools).toContain('tosi_changes')
  })
})

describe('B5: advertise only what the surface will execute', () => {
  test('a read-only surface publishes no act tools', async () => {
    tosi({ readOnlyTools: { x: 1, go() {} } })
    await updates()
    const readOnly = (current = enableAgentInterface({ global: false }))
    const names = webmcpTools(readOnly).map((t) => t.name)
    // a menu where every item throws on invocation is worse than no menu
    expect(names.some((n) => n.startsWith('tosi_act_'))).toBe(false)
    expect(names).toContain('tosi_describe')
    expect(names).toContain('tosi_surface')
    readOnly.disable()

    // …and they appear the moment the surface can actually execute them
    const acting = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(
      webmcpTools(acting).some((t) => t.name === 'tosi_act_readOnlyTools_go')
    ).toBe(true)
  })
})

describe('SEC-7: an unscoped read-only surface publishes no read tools', () => {
  test('read/changes need a declared scope — or explicit allowReads', async () => {
    tosi({ sec7: { x: 1 }, sec7Private: { token: 'CSRF-TOKEN-123' } })
    await updates()
    // the no-options default reads the WHOLE registry: publishing that to a
    // model-context host is a cross-principal disclosure nobody asked for
    const bare = (current = enableAgentInterface({ global: false }))
    const bareNames = webmcpTools(bare).map((t) => t.name)
    expect(bareNames).toContain('tosi_describe')
    expect(bareNames).toContain('tosi_surface')
    expect(bareNames).not.toContain('tosi_read')
    expect(bareNames).not.toContain('tosi_changes')
    // the surface can still read — this is a PUBLICATION gate, not a verb gate
    expect(bare.read('sec7Private.token')).toBe('CSRF-TOKEN-123')
    // …and the author can still opt in deliberately
    const consenting = webmcpTools(bare, { allowReads: true }).map(
      (t) => t.name
    )
    expect(consenting).toContain('tosi_read')
    expect(consenting).toContain('tosi_changes')
    bare.disable()

    // declaring what's exposed re-enables them: reads are now bounded
    const scoped = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['sec7'] },
    }))
    const scopedNames = webmcpTools(scoped).map((t) => t.name)
    expect(scopedNames).toContain('tosi_read')
    expect(scopedNames).toContain('tosi_changes')
    scoped.disable()

    // as does introspection mode, which is deliberate by definition
    const all = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(webmcpTools(all).map((t) => t.name)).toContain('tosi_read')
  })

  test('auto-registration on a host obeys the same gate', () => {
    tosi({ sec7Host: { x: 1 } })
    const registered: string[] = []
    const host = {
      registerTool(tool: any) {
        registered.push(tool.name)
        return { unregister() {} }
      },
    }
    current = enableAgentInterface({
      global: false,
      webmcp: { modelContext: host },
    })
    expect(registered).toEqual(['tosi_describe', 'tosi_surface'])
    expect(current.webmcp?.tools).toEqual(registered)
  })
})

describe('SEC-11: revocation must not be a claim the host cannot keep', () => {
  test('the receipt lists tools the host is holding but cannot give back', () => {
    tosi({ sec11Held: { x: 1 } })
    const registered: string[] = []
    const host = {
      registerTool(tool: any) {
        registered.push(tool.name)
        // Canary: no handle, no unregisterTool
      },
    }
    current = enableAgentInterface({
      global: false,
      expose: { roots: ['sec11Held'] },
      webmcp: { modelContext: host },
    })
    const first = current.webmcp?.tools ?? []
    expect(first).toContain('tosi_read')

    // re-enable on the same host: nothing new is registered, but every one
    // of those tools is still live and still late-bound to this surface —
    // the receipt used to omit exactly the tools nobody can withdraw
    current = enableAgentInterface({
      global: false,
      expose: { roots: ['sec11Held'] },
      webmcp: { modelContext: host },
    })
    expect(registered.length).toBe(first.length) // no duplicate registrations
    expect(current.webmcp?.tools).toEqual(first)
  })

  test('narrowing revokes: a dropped tool is overwritten with a refusing stub', () => {
    tosi({ sec11Narrow: { x: 1 } })
    const live = new Map<string, any>()
    // handle-less, but tolerant of re-registration (overwrites by name)
    const host = { registerTool: (tool: any) => live.set(tool.name, tool) }
    current = enableAgentInterface({
      global: false,
      expose: 'all',
      webmcp: { modelContext: host, allowWrites: true },
    })
    expect(live.has('tosi_write')).toBe(true)

    // the same surface re-enabled WITHOUT write consent: the host has no
    // unregisterTool, so "revoked" would otherwise mean "still callable"
    current = enableAgentInterface({
      global: false,
      expose: 'all',
      webmcp: { modelContext: host },
    })
    expect(current.webmcp?.tools).not.toContain('tosi_write')
    expect(live.get('tosi_write').description).toMatch(/REVOKED/)
    expect(() =>
      live.get('tosi_write').execute({ path: 'sec11Narrow.x', value: 2 })
    ).toThrow(/revoked/)
    expect(current.read('sec11Narrow.x')).toBe(1) // the stub wrote nothing
  })

  test('a register-once host that refuses the overwrite gets a console.error', () => {
    tosi({ sec11Once: { x: 1 } })
    const live = new Map<string, any>()
    const host = {
      registerTool(tool: any) {
        if (live.has(tool.name)) {
          throw new Error(`duplicate tool name: ${tool.name}`)
        }
        live.set(tool.name, tool)
      },
    }
    current = enableAgentInterface({
      global: false,
      expose: 'all',
      webmcp: { modelContext: host, allowWrites: true },
    })
    const { errors } = captured(() => {
      current = enableAgentInterface({
        global: false,
        expose: 'all',
        webmcp: { modelContext: host },
      })
    })
    // the tool really is stranded — say so instead of quietly delisting it
    expect(errors.some((e) => /CANNOT REVOKE.*tosi_write/.test(e))).toBe(true)
    expect(current!.webmcp?.tools).not.toContain('tosi_write')
    // stranded, but not a hole: it is late-bound, so the surface still rules
    expect(() =>
      live.get('tosi_write').execute({ path: 'sec11Once.x', value: 2 })
    ).not.toThrow()
  })
})

describe('SEC-12: a name you did not get is a name someone else answers', () => {
  test('a lost tool name is a console.error, not routine host chatter', () => {
    tosi({ sec12: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // another script got here first and owns the unnamespaced name
    const squatted = new Set(['tosi_read'])
    const host = {
      registerTool(tool: any) {
        if (squatted.has(tool.name)) {
          throw new Error(`tool already registered: ${tool.name}`)
        }
      },
    }
    const { result: mcp, errors } = captured(
      () => webmcpAdapter(agent, { modelContext: host })!
    )
    expect(mcp.tools).not.toContain('tosi_read')
    expect(errors.some((e) => e.includes('tosi_read'))).toBe(true)
    expect(errors.some((e) => e.includes('prefix'))).toBe(true)

    // the escalation persists: a name lost to another script is not
    // re-attempted, and must never be reported as ours
    const { result: again, errors: more } = captured(
      () => webmcpAdapter(agent, { modelContext: host })!
    )
    expect(again.tools).not.toContain('tosi_read')
    expect(more.some((e) => e.includes('tosi_read'))).toBe(true)

    // …and the documented way out lands cleanly
    const { result: prefixed, errors: none } = captured(
      () => webmcpAdapter(agent, { modelContext: host, prefix: 'myapp' })!
    )
    expect(prefixed.tools).toContain('myapp_read')
    expect(none).toEqual([])
  })
})

// Chrome shipped `registerTool(tool, { signal })` + `controller.abort()` as
// THE unregistration path (and since 153 it withdraws a tool without breaking
// in-flight executions). We probed only for a returned handle and for
// `unregisterTool`, found neither on the one browser that ships WebMCP, and
// fell through to best-effort stubbing — so revocation was pretend when it
// could have been real. Found by re-surveying the landscape, 2026-08-21.
describe('AbortSignal unregistration (the shape Chrome actually shipped)', () => {
  const specHost = () => {
    const live = new Map<string, any>()
    return {
      live,
      registerTool(tool: any, options?: { signal?: AbortSignal }) {
        live.set(tool.name, tool)
        options?.signal?.addEventListener('abort', () => live.delete(tool.name))
        // no return value, no unregisterTool — exactly Chrome's shape
      },
      getTools: () => Array.from(live.values()),
    }
  }

  test('a spec-shaped host really loses the tools on unregister', async () => {
    tosi({ abortApp: { n: 1 } })
    await updates()
    const host = specHost()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
      webmcp: false,
    }))
    const reg = webmcpAdapter(agent, { modelContext: host as any })
    expect(reg).toBeDefined()
    expect(host.live.size).toBeGreaterThan(0)
    // the probe tool must not linger in the host's menu
    expect(
      host.getTools().some((t: any) => t.name.includes('abort_probe'))
    ).toBe(false)
    reg!.unregister()
    expect(host.live.size).toBe(0)
  })

  test('a host that ignores the options argument still gets the stub fallback', async () => {
    tosi({ abortLegacy: { n: 1 } })
    await updates()
    const live = new Map<string, any>()
    // register-once, options ignored — the pre-153 shape we already handled
    const legacyHost = {
      registerTool(tool: any) {
        live.set(tool.name, tool)
      },
      getTools: () => Array.from(live.values()),
    }
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
      webmcp: false,
    }))
    const reg = webmcpAdapter(agent, { modelContext: legacyHost as any })
    const before = live.size
    expect(before).toBeGreaterThan(0)
    reg!.unregister()
    // nothing was withdrawn — which is the truth on such a host, and is why
    // the revoke-by-stub path exists
    expect(live.size).toBe(before)
  })
})
