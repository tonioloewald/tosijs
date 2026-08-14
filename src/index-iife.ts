import * as tosijs from './index'
import * as agent from './index-agent'
import * as tosijsui from 'tosijs-ui'

// The DOC bundle merges the agent subpath into the `tosijs` global so live
// examples can exercise it. Doc fences still IMPORT from 'tosijs/agent' —
// the live-example rewriter destructures from this global by specifier, and
// what a reader copies must be the real path.
const merged = { ...tosijs, ...agent }
Object.assign(globalThis, {
  tosijs: merged,
  'tosijs/agent': agent,
  tosijsui,
  xinjs: merged,
  xinjsui: tosijsui,
})
