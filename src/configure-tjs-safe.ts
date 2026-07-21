// EXPERIMENTAL — configuration for the tjs-built safe bundle (tosijs/safe).
// See configure-tjs-debug.ts for why this must evaluate before the library
// (import-order fix) and for the plainly-stated current state of these
// bundles. The safe build is production-facing, so unlike the debug build it
// does not announce itself on the console.
import { configureTjs } from './configure-tjs'

configureTjs({ throwTypeErrors: false, logTypeErrors: false })
