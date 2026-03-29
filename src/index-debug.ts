// Debug build: type errors throw immediately with full stack traces
const g = globalThis as any
if (g.__tjs?.configure) {
  g.__tjs.configure({ throwTypeErrors: true, logTypeErrors: true })
} else {
  g.__tjs = {
    ...g.__tjs,
    getConfig: () => ({ throwTypeErrors: true, logTypeErrors: true }),
  }
}

export * from './index'
