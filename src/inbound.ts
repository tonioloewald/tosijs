// Shared by share.ts (cross-tab) and sync.ts (network): applying a delta that
// arrived from elsewhere, and recognising its echo so it is not sent back.
// Each channel keeps its OWN tracker: one shared set would let a sync delta
// suppress a share broadcast.
import { setByPath } from './by-path'
import { registry } from './registry'
import { touch, updates, extendsPath } from './path-listener'

export const findRoot = (
  roots: Iterable<string>,
  path: string
): string | undefined => {
  // extendsPath, not a local startsWith(root + '.'): that copy missed index
  // paths, so a write to root[0].x was never sent (tosijs #3544)
  for (const root of roots) if (extendsPath(root, path)) return root
}

export const inboundTracker = () => {
  const inbound = new Set<string>()
  return {
    isInbound: (path: string): boolean => findRoot(inbound, path) !== undefined,
    apply(path: string, value: any): void {
      inbound.add(path)
      try {
        setByPath(registry, path, value)
        touch(path)
      } catch (e) {
        // A REFUSED DELTA MUST NOT POISON THE CHANNEL. The path is registered
        // as inbound BEFORE the write so the echo suppressor can recognize it;
        // if the write throws, the cleanup below is never scheduled, so the
        // path stayed inbound for the life of the page — and isInbound()
        // matches by PREFIX, so every later LOCAL change to that subtree was
        // mistaken for an echo and silently never sent. setByPath REFUSES
        // unsafe path segments (1.8.0), and a peer or server supplies paths.
        inbound.delete(path)
        console.error(
          `tosijs: refused an inbound delta at "${path}" —`,
          e,
          '(the local state is unchanged and this channel keeps working)'
        )
        return
      }
      updates().then(() => {
        inbound.delete(path)
      })
    },
  }
}
