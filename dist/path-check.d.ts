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
export declare const checkPath: (path: string, what: "bind" | "observe") => void;
