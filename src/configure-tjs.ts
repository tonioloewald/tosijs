// Shared __tjs bootstrap for the experimental tjs-built debug/safe bundles.
// See configure-tjs-debug.ts for the import-order requirement (this must
// evaluate before any library module captures the runtime) and the
// plainly-stated current state (metadata now, enforcement in 2.0).
export function configureTjs(config: {
  throwTypeErrors: boolean
  logTypeErrors: boolean
}): void {
  const g = globalThis as any
  if (g.__tjs?.configure) {
    g.__tjs.configure(config)
  } else {
    g.__tjs = { ...g.__tjs, getConfig: () => config }
  }
}
