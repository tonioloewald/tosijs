// EXPERIMENTAL tjs-built debug bundle: type errors throw immediately with
// full stack traces (once runtime enforcement exists — see configure module).
// The configure import MUST come first: ESM evaluates it before './index',
// so the __tjs config is in place before any library module captures it.
import './configure-tjs-debug'

export * from './index'
