// EXPERIMENTAL — configuration for the tjs-built debug bundle (tosijs/debug).
//
// This module must be imported BEFORE any library module evaluates: converted
// modules capture `globalThis.__tjs?.createRuntime?.()` at evaluation time, so
// configuration that lands after `export * from './index'` has already
// evaluated the library configures nothing (the bug that made these bundles
// inert through 1.6.x). index-debug.ts imports this module first, which ESM
// guarantees evaluates first.
//
// Current state, plainly: `tjs convert` marks all converted-from-TS functions
// unsafe (TS source is presumed tsc-checked; safety is opt-in in native TJS),
// so no runtime checks fire on this build line yet. What this bundle ships
// today is complete __tjs runtime type metadata per function, and config
// plumbing that is genuinely in place for runtime enforcement as modules go
// native TJS in 2.0.
import { version } from './version'

const g = globalThis as any
if (g.__tjs?.configure) {
  g.__tjs.configure({ throwTypeErrors: true, logTypeErrors: true })
} else {
  g.__tjs = {
    ...g.__tjs,
    getConfig: () => ({ throwTypeErrors: true, logTypeErrors: true }),
  }
}

// the debug build announces itself — that's what debug builds are for
console.info(
  `tosijs/debug ${version} — EXPERIMENTAL tjs-built bundle. Ships runtime ` +
    'type metadata (__tjs) per function; runtime type enforcement arrives ' +
    'as modules move to native TJS (tosijs 2.0). Not for production.'
)
