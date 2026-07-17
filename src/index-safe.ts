// EXPERIMENTAL tjs-built safe bundle: type errors return MonadicError values
// (silent, recoverable) once runtime enforcement exists — see the configure
// module for the current state. The configure import MUST come first: ESM
// evaluates it before './index', so the __tjs config is in place before any
// library module captures it.
import './configure-tjs-safe'

export * from './index'
