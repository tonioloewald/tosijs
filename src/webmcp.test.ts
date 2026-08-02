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
    const agent = (current = enableAgentInterface({ global: false }))
    const tools = webmcpTools(agent)
    const names = tools.map((t) => t.name)
    expect(names).toContain('tosi_describe')
    expect(names).toContain('tosi_read')
    expect(names).toContain('tosi_changes')
    expect(names).toContain('tosi_act_mcpApp_addItem') // derived, not declared
  })

  test('write tool: present in introspection mode, absent in manifest mode, opt-in override', async () => {
    tosi({ mcpGate: { x: 1, go() {} } })
    await updates()
    const dev = (current = enableAgentInterface({ global: false }))
    expect(webmcpTools(dev).some((t) => t.name === 'tosi_write')).toBe(true)
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
    const agent = (current = enableAgentInterface({ global: false }))
    const tools = Object.fromEntries(
      webmcpTools(agent).map((t) => [t.name, t])
    )

    const { cursor } = tools.tosi_changes.execute({})
    tools.tosi_act_mcpExec_add.execute({ args: ['from a tool'] })
    tools.tosi_write.execute({ path: 'mcpExec.items[0]', value: 'rewritten' })
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
    const agent = (current = enableAgentInterface({ global: false }))
    expect(webmcpAdapter(agent)).toBeUndefined()
  })

  test('registerTool host: registers each tool, unregister reverses', () => {
    tosi({ mcpHostA: { go() {} } })
    const agent = (current = enableAgentInterface({ global: false }))
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
    const agent = (current = enableAgentInterface({ global: false }))
    const calls: any[] = []
    const host = { provideContext: (ctx: any) => calls.push(ctx) }
    const mcp = webmcpAdapter(agent, { modelContext: host })!
    expect(calls[0].tools.map((t: any) => t.name)).toEqual(mcp.tools)
    mcp.unregister()
    expect(calls[1].tools).toEqual([])
  })
})
