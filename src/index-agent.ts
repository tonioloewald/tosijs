/*{ "parent": "utilities", "description": "tosijs/agent — the agent surface, the schematic renderer, the contract harnesses and the accessibility audit, in one opt-in subpath." }*/
/*#
# tosijs/agent

Everything that describes an app to a *non-human* user, behind one door:

    import { enableAgentInterface } from 'tosijs/agent'

    // nothing is exposed until you say so
    const agent = enableAgentInterface({ expose: { roots: ['app'] } })
    agent.describe()                       // the affordance map

| export | what |
| --- | --- |
| `enableAgentInterface` | the surface: describe / read / write / observe / call / changes / when / log |
| `webmcpTools`, `webmcpAdapter` | the generated WebMCP tool set (auto-registered by `enableAgentInterface` where a host exists) |
| `schematicSVG`, `rasterizeSVG`, `boundsOf` | the map, drawn (from **tosijs-floorplan**, vendored) |
| `auditAccessibility`, `auditFlags`, `contrastRatio` | findings over the map |
| `exerciseContract`, `exerciseComponent` | contracts as tests |

**Why a subpath and not the main entry.** This is ~11 kB gzipped, and an app
that never describes itself should not carry it. Bundler users would shake
it out — but the IIFE (CDN, `<script>`, our own doc pages) cannot, and that
is the most-loaded artifact we publish. Keeping it here means the cost falls
only on consumers who opt in, and the default bundle stays roughly where
1.7.x left it.

`ComponentMap` (the `static contract` shape) is exported from **both**
`tosijs` and here: declaring a contract is a component-authoring act that
must not require importing the agent surface. It is type-only, so it costs
nothing either way.
*/
export {
  enableAgentInterface,
  isAgentRefusal,
  BOUND_TO_DOM,
  BOUND_TWO_WAY,
  AGENT_SURFACE_VERSION,
  AGENT_CAPABILITIES,
} from './agent'
export type {
  AgentInterface,
  AgentInterfaceOptions,
  AgentContract,
  AgentDescription,
  AgentWiringRecord,
  AgentLogEntry,
  AgentSurfaceVersion,
  AgentExpose,
  AgentRefusalKind,
  AgentRefusalError,
  ComponentMap,
  ComponentTestStep,
} from './agent'
export { webmcpTools, webmcpAdapter } from './webmcp'
export type { WebMCPTool, WebMCPAdapterOptions } from './webmcp'
export { schematicSVG, rasterizeSVG, boundsOf } from './schematic'
export type { SchematicOptions, SchematicBounds } from './schematic'
export { auditAccessibility, auditFlags, contrastRatio } from './audit'
export type {
  AuditReport,
  AuditFinding,
  AuditOptions,
  AuditSeverity,
} from './audit'
export { exerciseContract, exerciseComponent } from './contract'
export type {
  ContractReport,
  ContractTrial,
  ComponentReport,
  ComponentTrial,
} from './contract'
