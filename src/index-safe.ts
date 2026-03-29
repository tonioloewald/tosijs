// Safe build: type errors return MonadicError values (silent, recoverable)
const g = globalThis as any
if (g.__tjs?.configure) {
  g.__tjs.configure({ throwTypeErrors: false, logTypeErrors: false })
} else {
  g.__tjs = {
    ...g.__tjs,
    getConfig: () => ({ throwTypeErrors: false, logTypeErrors: false }),
  }
}

export * from './index'
