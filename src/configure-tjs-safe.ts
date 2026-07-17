// EXPERIMENTAL — configuration for the tjs-built safe bundle (tosijs/safe).
// See configure-tjs-debug.ts for why this must evaluate before the library
// (import-order fix) and for the plainly-stated current state of these
// bundles. The safe build is production-facing, so unlike the debug build it
// does not announce itself on the console.
const g = globalThis as any
if (g.__tjs?.configure) {
  g.__tjs.configure({ throwTypeErrors: false, logTypeErrors: false })
} else {
  g.__tjs = {
    ...g.__tjs,
    getConfig: () => ({ throwTypeErrors: false, logTypeErrors: false }),
  }
}
