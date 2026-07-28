/*{ "parent": "utilities", "description": "EXPERIMENTAL agent interface: expose a tosijs app's state, wiring, and actions to AI agents (and test harnesses) as a described, observable, path-addressed surface." }*/
/*#
# agent (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

    import { enableAgentInterface } from 'tosijs'

    const agent = enableAgentInterface() // introspection mode: expose everything

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read('app.filter')  // serializable value
    agent.write('app.filter', 'milk') // through the same observers as any write
    agent.observe('app.cart', (path) => { ... }) // push; returns un-observe
    agent.call('app.addItem', 'buy milk')        // invoke an action by path
    agent.changes(cursor)     // turn-based drain: final value per changed path
    agent.log()               // the audit trail

In production, expose only what you declare:

    enableAgentInterface({
      expose: {
        roots: ['app.cart', 'app.filter'],
        actions: ['app.addItem', 'app.checkout'],
      },
    })

> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it, not inside it.
*/
import { registry } from './registry'
import { observe, unobserve, Listener } from './path-listener'
import { xin } from './xin'
import {
  BOUND_CLASS,
  getElementBindings,
  elementToHandlers,
  tosiValue,
} from './metadata'

export interface AgentExpose {
  roots?: string[]
  actions?: string[]
}

export interface AgentInterfaceOptions {
  expose?: AgentExpose
  /** install as globalThis.tosiAgent (default true); pass a string to rename */
  global?: boolean | string
}

export interface AgentWiringRecord {
  element: {
    tag: string
    id?: string
    part?: string
    role?: string
    label?: string
  }
  bindings?: Array<{
    path: string
    readable: boolean
    writable: boolean
    idPath?: string
  }>
  handlers?: Record<string, string[]>
}

export interface AgentDescription {
  roots: Record<string, string>
  wiring: AgentWiringRecord[]
  actions: string[]
  exposure: 'introspection' | 'manifest'
}

export interface AgentChange {
  path: string
  value: any
}

export interface AgentInterface {
  describe: () => AgentDescription
  read: (path: string) => any
  write: (path: string, value: any) => void
  observe: (path: string, callback: (path: string) => void) => () => void
  call: (actionPath: string, ...args: any[]) => any
  changes: (since?: number) => { cursor: number; changes: AgentChange[] }
  log: () => Array<{ seq: number; path: string }>
  disable: () => void
}

// a path is "under" a root if it IS the root or extends it by a segment
const underRoot = (path: string, root: string): boolean =>
  path === root ||
  (path.startsWith(root) &&
    (path[root.length] === '.' || path[root.length] === '['))

// values leave the surface as plain serializable data — proxies unwrapped,
// functions elided (they are actions, addressed by path, not data)
const serialize = (value: any): any => {
  const raw = tosiValue(value)
  if (raw === undefined || typeof raw === 'function') return undefined
  try {
    return JSON.parse(JSON.stringify(raw))
  } catch (_e) {
    return undefined
  }
}

// the join: the element's own semantic self-description, harvested from
// attributes the developer wrote for humans and a11y
const describeElement = (el: Element): AgentWiringRecord['element'] => {
  const record: AgentWiringRecord['element'] = {
    tag: el.tagName.toLowerCase(),
  }
  if (el.id) record.id = el.id
  const part = el.getAttribute('part')
  if (part) record.part = part
  const role = el.getAttribute('role')
  if (role) record.role = role
  const label =
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('alt') ||
    (el.textContent || '').trim().slice(0, 40)
  if (label) record.label = label
  return record
}

let active: AgentInterface | undefined
let activeGlobalName: string | undefined

export function enableAgentInterface(
  options: AgentInterfaceOptions = {}
): AgentInterface {
  // re-enabling reconfigures: tear down the previous surface first
  if (active != null) active.disable()

  const { expose, global = true } = options
  const roots = expose?.roots
  const exposedActions = expose?.actions
  const manifestMode = expose != null

  const inScope = (path: string): boolean =>
    !manifestMode ||
    (roots ?? []).some((root) => underRoot(path, root)) ||
    (exposedActions ?? []).some((action) => underRoot(path, action))

  const assertScope = (path: string): void => {
    if (!inScope(path)) {
      throw new Error(
        `agent interface: "${path}" is not exposed (manifest mode)`
      )
    }
  }

  // the audit ledger — one global observer; every touch lands here.
  // log/changes are two consumptions of this one stream.
  let seq = 0
  const ledger: Array<{ seq: number; path: string }> = []
  const ledgerListener: Listener = observe(
    () => true,
    (path: string) => {
      if (inScope(path)) ledger.push({ seq: ++seq, path })
    }
  )
  const subscriptions = new Set<Listener>()

  const read = (path: string): any => {
    assertScope(path)
    return serialize(xin[path])
  }

  const surface: AgentInterface = {
    describe(): AgentDescription {
      const rootNames = manifestMode
        ? (roots ?? []).slice()
        : Object.keys(registry)
      const rootSummary: Record<string, string> = {}
      for (const root of rootNames) {
        rootSummary[root] = Array.isArray(tosiValue(xin[root]))
          ? 'array'
          : typeof tosiValue(xin[root])
      }

      // wiring: every data-bound element (enumerable via the marker class),
      // plus every event-wired element (probe the handler map on a tree walk)
      const wiring: AgentWiringRecord[] = []
      if (typeof document !== 'undefined') {
        const seen = new Set<Element>()
        const recordFor = (el: Element): AgentWiringRecord | undefined => {
          if (seen.has(el)) return undefined
          seen.add(el)
          const { dataBindings, eventBindings } = getElementBindings(el)
          const record: AgentWiringRecord = { element: describeElement(el) }
          if (dataBindings != null) {
            const bindings = dataBindings
              .filter((b) => inScope(b.path))
              .map((b) => {
                const entry: NonNullable<AgentWiringRecord['bindings']>[0] = {
                  path: b.path,
                  readable: b.binding.toDOM != null,
                  writable: b.binding.fromDOM != null,
                }
                const idPath = (b.options as any)?.idPath
                if (idPath) entry.idPath = idPath
                return entry
              })
            if (bindings.length > 0) record.bindings = bindings
          }
          if (eventBindings != null) {
            const handlers: Record<string, string[]> = {}
            for (const [type, set] of Object.entries(eventBindings)) {
              handlers[type] = Array.from(set as Set<any>, (h) =>
                typeof h === 'string' ? h : 'ƒ'
              )
            }
            if (Object.keys(handlers).length > 0) record.handlers = handlers
          }
          return record.bindings != null || record.handlers != null
            ? record
            : undefined
        }
        for (const el of Array.from(
          document.getElementsByClassName(BOUND_CLASS)
        )) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        for (const el of Array.from(document.body.querySelectorAll('*'))) {
          if (elementToHandlers.has(el)) {
            const record = recordFor(el)
            if (record) wiring.push(record)
          }
        }
      }

      // actions: functions reachable from exposed roots (bounded walk)
      const actions: string[] = []
      if (manifestMode) {
        actions.push(...(exposedActions ?? []))
      } else {
        const walk = (value: any, path: string, depth: number): void => {
          if (depth > 3 || value == null || typeof value !== 'object') return
          for (const key of Object.keys(value)) {
            const child = value[key]
            const childPath = `${path}.${key}`
            if (typeof child === 'function') actions.push(childPath)
            else walk(child, childPath, depth + 1)
          }
        }
        for (const root of rootNames) {
          walk(registry[root], root, 0)
        }
      }

      return {
        roots: rootSummary,
        wiring,
        actions,
        exposure: manifestMode ? 'manifest' : 'introspection',
      }
    },

    read,

    write(path: string, value: any): void {
      assertScope(path)
      xin[path] = value
    },

    observe(path: string, callback: (path: string) => void): () => void {
      assertScope(path)
      const listener = observe(path, callback)
      subscriptions.add(listener)
      return () => {
        subscriptions.delete(listener)
        unobserve(listener)
      }
    },

    call(actionPath: string, ...args: any[]): any {
      if (manifestMode && !(exposedActions ?? []).includes(actionPath)) {
        throw new Error(
          `agent interface: action "${actionPath}" is not exposed (manifest mode)`
        )
      }
      const fn = xin[actionPath]
      if (typeof fn !== 'function') {
        throw new Error(`agent interface: "${actionPath}" is not an action`)
      }
      return fn(...args)
    },

    // turn-based drain: everything since the cursor, coalesced to one entry
    // per path (final value read at drain time — updates()' settling
    // semantics, extended across agent turns)
    changes(since = 0): { cursor: number; changes: AgentChange[] } {
      const seenPaths = new Set<string>()
      const coalesced: AgentChange[] = []
      for (let i = ledger.length - 1; i >= 0; i--) {
        const entry = ledger[i]
        if (entry.seq <= since) break
        if (seenPaths.has(entry.path)) continue
        seenPaths.add(entry.path)
        coalesced.unshift({ path: entry.path, value: read(entry.path) })
      }
      return { cursor: seq, changes: coalesced }
    },

    log(): Array<{ seq: number; path: string }> {
      return ledger.slice()
    },

    disable(): void {
      unobserve(ledgerListener)
      for (const listener of subscriptions) unobserve(listener)
      subscriptions.clear()
      if (activeGlobalName != null) {
        delete (globalThis as any)[activeGlobalName]
        activeGlobalName = undefined
      }
      if (active === surface) active = undefined
    },
  }

  if (global !== false) {
    activeGlobalName = typeof global === 'string' ? global : 'tosiAgent'
    ;(globalThis as any)[activeGlobalName] = surface
  }
  active = surface
  return surface
}
