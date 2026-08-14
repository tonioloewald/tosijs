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
// type-only: keeps this module import-free at runtime, so agent.ts can
// import the adapter for auto-registration without a module cycle
import type { AgentInterface } from './agent'

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
      name: toolName(prefix, 'surface'),
      description:
        'What this agent surface IS: shape-contract version, tosijs ' +
        'version, and enumerable capabilities. Ask before assuming — a ' +
        'consumer that checks capabilities degrades honestly instead of ' +
        'rendering a confident blank.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => agent.version,
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
// hosts that provide NO unregistration path (no handle.unregister, no
// unregisterTool — Chrome Canary's registerTool today) get REGISTER-ONCE
// semantics per tool name: re-registering a held name is a console error on
// the host side and would strand a stale closure on ours. Skip names the
// host already holds — paired with enableAgentInterface's live-bound
// delegate, the existing registration already talks to the current surface.
const registeredOnHost: WeakMap<object, Set<string>> = new WeakMap()

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
    let held = registeredOnHost.get(mc)
    if (held == null) {
      held = new Set()
      registeredOnHost.set(mc, held)
    }
    for (const tool of tools) {
      if (held.has(tool.name)) continue // already live on this host
      try {
        const handle = mc.registerTool(tool)
        if (handle != null && typeof handle.unregister === 'function') {
          undo.push(() => handle.unregister())
        } else if (typeof mc.unregisterTool === 'function') {
          undo.push(() => mc.unregisterTool(tool.name))
        } else {
          held.add(tool.name) // no way back: remember it's registered
        }
      } catch (_e) {
        held.add(tool.name) // the host says it already holds this name
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
