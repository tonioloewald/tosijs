/**
 * Reference Bun WebSocket relay server for tosijs sync().
 *
 * Usage:
 *   bun run examples/sync-server.ts
 *
 * Clients connect via WebSocket and exchange SyncMessage[] batches.
 * The server:
 *   1. Relays each batch to all other connected clients
 *   2. Stores latest values per path for snapshot-on-connect
 *   3. Sends the full snapshot to newly connected clients
 *   4. Detects dead clients via idle timeout (requires client-side ping)
 *   5. Rate-limits messages per client
 *
 * This is a starting point — extend with authentication, rooms,
 * validation, or conflict resolution as needed.
 */

interface SyncMessage {
  path: string
  value: any
}

const PORT = parseInt(process.env.PORT ?? '8019', 10)

// --- Rate limiting ---
const RATE_WINDOW_MS = 1000
const MAX_MESSAGES_PER_WINDOW = 60

interface ClientData {
  messageCount: number
  windowStart: number
}

function checkRateLimit(data: ClientData): boolean {
  const now = Date.now()
  if (now - data.windowStart > RATE_WINDOW_MS) {
    data.windowStart = now
    data.messageCount = 0
  }
  data.messageCount++
  return data.messageCount <= MAX_MESSAGES_PER_WINDOW
}

// Authoritative state: latest value per path
const state = new Map<string, any>()

const server = Bun.serve({
  port: PORT,

  fetch(req, server) {
    if (server.upgrade(req, { data: { messageCount: 0, windowStart: Date.now() } })) return
    return new Response('tosijs sync server', { status: 200 })
  },

  websocket: {
    // Close connections with no data for 30s.
    // Clients should send periodic pings to stay alive.
    idleTimeout: 30,

    open(ws) {
      ws.subscribe('sync')
      console.log(`client connected (${server.pendingWebSockets} pending)`)

      // Send snapshot of current state to new client
      if (state.size > 0) {
        const snapshot: SyncMessage[] = []
        for (const [path, value] of state) {
          snapshot.push({ path, value })
        }
        ws.send(JSON.stringify(snapshot))
      }
    },

    message(ws, raw) {
      // Rate limit
      if (!checkRateLimit(ws.data as ClientData)) {
        console.warn('rate limited client')
        return
      }

      let messages: SyncMessage[]
      try {
        messages = JSON.parse(
          typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
        )
      } catch {
        console.warn('malformed message from client')
        return
      }

      if (!Array.isArray(messages)) return

      // Update authoritative state
      for (const msg of messages) {
        if (typeof msg.path === 'string') {
          state.set(msg.path, msg.value)
        }
      }

      // Relay to all other clients
      ws.publish('sync', JSON.stringify(messages))
    },

    close(ws, code, reason) {
      ws.unsubscribe('sync')
      console.log(`client disconnected (code=${code}${reason ? `, reason=${reason}` : ''})`)
    },
  },
})

// --- Graceful shutdown ---
function shutdown() {
  console.log('\nshutting down...')
  server.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log(`tosijs sync server listening on ws://localhost:${server.port}`)
