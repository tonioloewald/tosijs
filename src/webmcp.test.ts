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

describe('webmcpTools — the tools write themselves', () => {
  test('core tools plus one named tool per discovered action', async () => {
    tosi({
      mcpApp: {
        list: [] as string[],
        addItem(_item: string) {},
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
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
    const dev = (current = enableAgentInterface({ global: false, expose: 'all' }))
    expect(webmcpTools(dev).some((t) => t.name === 'tosi_write')).toBe(false)
    expect(
      webmcpTools(dev, { allowWrites: true }).some((t) => t.name === 'tosi_write')
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
    expect(webmcpTools(prod).some((t) => t.name === 'tosi_act_mcpGate_go')).toBe(
      true
    )
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
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
    const tools = Object.fromEntries(
      webmcpTools(agent).map((t) => [t.name, t])
    )

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
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
    expect(webmcpAdapter(agent)).toBeUndefined()
  })

  test('registerTool host: registers each tool, unregister reverses', () => {
    tosi({ mcpHostA: { go() {} } })
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
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
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
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
    current = enableAgentInterface({
      global: false,
      webmcp: { modelContext: host },
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
    const agent = (current = enableAgentInterface({ global: false, expose: 'all' }))
    const tools = Object.fromEntries(webmcpTools(agent).map((t) => [t.name, t]))
    expect(tools.tosi_surface).toBeDefined()
    const identity = tools.tosi_surface.execute({})
    expect(typeof identity.surface).toBe('string')
    expect(Array.isArray(identity.capabilities)).toBe(true)
    expect(identity.capabilities.includes('describe')).toBe(true)
  })
})
