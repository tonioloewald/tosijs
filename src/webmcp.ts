/*{ "parent": "utilities", "description": "EXPERIMENTAL WebMCP adapter: generate the browser-agent tool set from the agent surface — the tools write themselves from wiring the app already records." }*/
/*#
# webmcp (EXPERIMENTAL)

The WebMCP standard (`navigator.modelContext`, migrating to `document`) lets a
page expose typed, callable **tools** to browser agents — but every existing
integration hand-writes those tools. tosijs doesn't have to: the agent surface
already knows the app's state roots, wiring, and actions, so **the tool set is
generated, not authored**.

    import { enableAgentInterface, webmcpAdapter } from 'tosijs'

    const agent = enableAgentInterface()
    const mcp = webmcpAdapter(agent) // detect, generate, register
    // …
    mcp?.unregister()

Two layers, split like `schematicSVG`:

- **`webmcpTools(agent)`** — pure: returns the tool definitions
  (`{ name, description, inputSchema, execute }`) derived from `describe()`.
  Test it, print it, hand it to any MCP-shaped host — no browser API needed.
- **`webmcpAdapter(agent, options)`** — feature-detects the runtime
  (`document.modelContext` first, then `navigator.modelContext`, or an
  injected `options.modelContext`), registers the tools through whichever
  registration shape the host offers (`registerTool` per tool, or
  `provideContext({ tools })` as a batch), and returns `{ tools, unregister }`
  — or `undefined` when no host API exists (callers feature-detect by result).

The generated set:

| tool | does |
| --- | --- |
| `tosi_describe` | the live affordance map — start here |
| `tosi_read` | serializable value at a path |
| `tosi_changes` | turn drain: final-value-per-path since your cursor |
| `tosi_act_<path>` | one **named** tool per discovered/declared action |
| `tosi_write` | direct state writes — **dev-gated** (see below) |

`tosi_write` registers only in introspection mode (or with an explicit
`allowWrites: true`): production surfaces are read/observe/call-only until
state-level contracts land — an unvalidated write tool is an RPC endpoint
with good documentation.

> **EXPERIMENTAL.** The WebMCP spec is churning; the adapter is deliberately
> tolerant of both registration shapes and takes an injected host for tests.
*/
import { AgentInterface } from './agent'

export interface WebMCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
  execute: (input: Record<string, any>) => any
}

export interface WebMCPAdapterOptions {
  /** explicit host (tests, or a future relocation of the API) */
  modelContext?: any
  /** register tosi_write even outside introspection mode (default false) */
  allowWrites?: boolean
  /** tool-name prefix (default 'tosi') */
  prefix?: string
}

const toolName = (prefix: string, ...parts: string[]): string =>
  [prefix, ...parts].join('_').replace(/[^A-Za-z0-9_]/g, '_')

/**
 * Generate the WebMCP tool set from the agent surface — pure; derives
 * everything from describe() and closes over the agent for execution.
 */
export const webmcpTools = (
  agent: AgentInterface,
  options: WebMCPAdapterOptions = {}
): WebMCPTool[] => {
  const { prefix = 'tosi', allowWrites = false } = options
  const description = agent.describe()
  const tools: WebMCPTool[] = [
    {
      name: toolName(prefix, 'describe'),
      description:
        "The app's live affordance map: state roots, wired elements (flat " +
        'records — tag/label/text, bound props as "value ⟷ path" where ⟷ ' +
        'means two-way/user-writable and ⟵ means display-only), named ' +
        'actions, and per-element geometry (bounds). Start here.',
      inputSchema: {
        type: 'object',
        properties: { styles: { type: 'boolean' } },
      },
      execute: (input) => agent.describe({ styles: input?.styles === true }),
    },
    {
      name: toolName(prefix, 'read'),
      description:
        'Read the serializable value at a state path (paths come from ' +
        `${toolName(prefix, 'describe')}).`,
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string' } },
        required: ['path'],
      },
      execute: (input) => agent.read(String(input?.path)),
    },
    {
      name: toolName(prefix, 'changes'),
      description:
        'Everything that changed since your last turn, coalesced to ' +
        'final-value-per-path. Pass the cursor from your previous call; ' +
        'the response includes the next cursor.',
      inputSchema: {
        type: 'object',
        properties: { since: { type: 'number' } },
      },
      execute: (input) => agent.changes(Number(input?.since ?? 0)),
    },
  ]
  for (const actionPath of description.actions) {
    tools.push({
      name: toolName(prefix, 'act', actionPath),
      description:
        `Invoke the app action \`${actionPath}\` — the same function the ` +
        'UI is wired to. Arguments are passed through positionally.',
      inputSchema: {
        type: 'object',
        properties: { args: { type: 'array' } },
      },
      execute: (input) =>
        agent.call(actionPath, ...((input?.args as any[]) ?? [])),
    })
  }
  if (allowWrites || description.exposure === 'introspection') {
    tools.push({
      name: toolName(prefix, 'write'),
      description:
        'Write a value to a state path — it flows through the same ' +
        'observers as user input, so every bound widget updates. DEV MODE: ' +
        'writes are unvalidated until state-level contracts land.',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string' }, value: {} },
        required: ['path'],
      },
      execute: (input) => {
        agent.write(String(input?.path), input?.value)
        return { written: input?.path }
      },
    })
  }
  return tools
}

/**
 * Detect the WebMCP host, register the generated tools, return
 * { tools, unregister } — or undefined when no host API is present.
 */
export const webmcpAdapter = (
  agent: AgentInterface,
  options: WebMCPAdapterOptions = {}
): { tools: string[]; unregister: () => void } | undefined => {
  const mc =
    options.modelContext ??
    (globalThis as any).document?.modelContext ??
    (globalThis as any).navigator?.modelContext
  if (mc == null) return undefined

  const tools = webmcpTools(agent, options)
  const undo: Array<() => void> = []
  if (typeof mc.registerTool === 'function') {
    for (const tool of tools) {
      const handle = mc.registerTool(tool)
      if (handle != null && typeof handle.unregister === 'function') {
        undo.push(() => handle.unregister())
      } else if (typeof mc.unregisterTool === 'function') {
        undo.push(() => mc.unregisterTool(tool.name))
      }
    }
  } else if (typeof mc.provideContext === 'function') {
    // NOTE: provideContext replaces the page's whole tool context — if the
    // app also registers its own tools this way, coordinate registration in
    // one place (or use a registerTool-shaped host)
    mc.provideContext({ tools })
    undo.push(() => mc.provideContext({ tools: [] }))
  } else {
    return undefined
  }
  return {
    tools: tools.map((tool) => tool.name),
    unregister: () => {
      for (const fn of undo) fn()
    },
  }
}
