import { registry } from './registry'
import { settings } from './settings'
import { MonadicError } from './make-error'
// @ts-expect-error — .tjs has no ambient types; loaded via the tjs Bun plugin
import { describePath } from './by-path.tjs'

/**
 * Read-side path safety: binding to or observing a path that will never exist.
 *
 * This is the same bug class as writing to a fabricated path, and just as
 * invisible — the boxed proxies never fail on the way down, so `boxed.appp.user`
 * is a perfectly happy path string that simply never fires. The binding is silent
 * forever and the UI just... doesn't update.
 *
 * Two severities, because two things are being detected:
 *
 *   TYPO (stern, console.error) — the key is absent from a container that exists
 *   and already has a shape. `appp` is not in the registry; `usre` is not in a
 *   populated `app`. Nothing will ever put it there. This is a bug, full stop.
 *
 *   UNRESOLVED (soft, console.warn) — the path passes through a null/undefined
 *   stub, so we cannot see far enough to judge. It may be data that hasn't
 *   arrived. But production code shape-stubs before it fetches, so an unresolved
 *   path is still worth a word — and staying silent here is how `appp.user` typos
 *   get missed.
 *
 * Both report at any mode above 'off'.
 *
 * WHY THIS IS DEFERRED: `tosi()` registration is synchronous, but binding is
 * always async. Checking on the next microtask lets every synchronous `tosi()`
 * call in the current tick land first, so module import-order can never make a
 * correctly-spelled path look missing. The check is diagnostic, so deferring it
 * costs nothing.
 */
export const checkPath = (path: string, what: 'bind' | 'observe'): void => {
  if (settings.bindingPaths === 'off') return
  queueMicrotask(() => {
    // re-read the mode: it may have been changed during setup
    const mode = settings.bindingPaths
    if (mode === 'off') return

    const found = describePath(registry, path)
    if (found.ok === true) return

    const detail = found.absent
      ? `${what}("${path}") — "${found.absent}" does not exist on "${
          found.at
        }", which is already populated. Nothing will ever put it there, so this ${
          what === 'bind' ? 'binding' : 'observer'
        } will never fire. Check the spelling.`
      : `${what}("${path}") — the path does not resolve; it stops at "${
          found.at || '(root)'
        }". If it is awaiting async data, initialize a stub so the shape is declared; otherwise check the spelling.`

    if (mode === 'throw') throw new MonadicError('binding-path', detail, path)
    // a contradicted path is a bug; an unresolved one is only suspicious
    if (found.absent) console.error(detail)
    else console.warn(detail)
  })
}
