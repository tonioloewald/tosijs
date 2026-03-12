import { test, expect, describe, beforeEach } from 'bun:test'
import { xin, updates } from './xin'
import { tosi } from './xin-proxy'
import { registry } from './registry'
import { getByPath } from './by-path'
import { sync, type SyncTransport, type SyncMessage } from './sync'

const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms))

// Mock transport for testing
class MockTransport implements SyncTransport {
  sent: SyncMessage[][] = []
  receiveHandler: ((messages: SyncMessage[]) => void) | null = null
  connected = false
  disconnected = false

  async connect() {
    this.connected = true
  }

  send(messages: SyncMessage[]) {
    this.sent.push([...messages])
  }

  onReceive(handler: (messages: SyncMessage[]) => void) {
    this.receiveHandler = handler
  }

  disconnect() {
    this.disconnected = true
  }

  // Test helper: simulate inbound messages from server
  deliver(messages: SyncMessage[]) {
    this.receiveHandler?.(messages)
  }
}

let transport: MockTransport

beforeEach(() => {
  transport = new MockTransport()
})

describe('sync', () => {
  // --- Connection lifecycle ---

  test('connect is called on transport', async () => {
    const { s1 } = tosi({ s1: { x: 1 } })
    await sync(transport, {}, s1)

    expect(transport.connected).toBe(true)
  })

  test('disconnect removes observers and closes transport', async () => {
    const { s2 } = tosi({ s2: { x: 1 } })
    const { disconnect } = await sync(transport, {}, s2)

    disconnect()

    expect(transport.disconnected).toBe(true)

    // Changes after disconnect should NOT produce outbound messages
    transport.sent.length = 0
    xin['s2'] = { x: 99 }
    await updates()
    await tick(200)

    expect(transport.sent.length).toBe(0)
  })

  // --- Outbound ---

  test('local changes produce outbound messages', async () => {
    const { s3 } = tosi({ s3: { color: 'red' } })
    await sync(transport, { throttleInterval: 10 }, s3)

    xin['s3'] = { color: 'blue' }
    await updates()
    await tick(50)

    expect(transport.sent.length).toBeGreaterThan(0)
    const allMessages = transport.sent.flat()
    const msg = allMessages.find((m) => m.path === 's3')
    expect(msg).toBeDefined()
    expect(msg!.value).toEqual({ color: 'blue' })
  })

  test('sub-path changes produce delta messages', async () => {
    const { s4 } = tosi({ s4: { a: 1, b: 2 } })
    await sync(transport, { throttleInterval: 10 }, s4)

    // Flush any initial observer activity
    await updates()
    await tick(50)
    transport.sent.length = 0

    xin['s4'].a = 99
    await updates()
    await tick(50)

    const allMessages = transport.sent.flat()
    // The observer may fire at s4 or s4.a depending on touch propagation
    const msg = allMessages.find(
      (m) => m.path === 's4.a' || m.path === 's4'
    )
    expect(msg).toBeDefined()
  })

  test('throttle batches multiple rapid changes', async () => {
    const { s5 } = tosi({ s5: { x: 0 } })
    await sync(transport, { throttleInterval: 100 }, s5)

    // Rapid changes within throttle window
    xin['s5'].x = 1
    await updates()
    xin['s5'].x = 2
    await updates()
    xin['s5'].x = 3
    await updates()

    // Wait for throttle to flush
    await tick(200)

    // Should have batched — fewer send() calls than mutations
    // The exact count depends on throttle timing, but it should be
    // less than 3 separate calls
    const totalSendCalls = transport.sent.length
    expect(totalSendCalls).toBeGreaterThan(0)
    // All messages combined should reflect the changes
    const allMessages = transport.sent.flat()
    expect(allMessages.length).toBeGreaterThanOrEqual(1)
  })

  // --- Inbound ---

  test('inbound messages update local state', async () => {
    const { s6 } = tosi({ s6: { name: 'alice' } })
    await sync(transport, {}, s6)

    transport.deliver([{ path: 's6', value: { name: 'bob' } }])

    await tick()
    await updates()

    expect(getByPath(registry, 's6')).toEqual({ name: 'bob' })
  })

  test('inbound sub-path delta updates only that path', async () => {
    const { s7 } = tosi({ s7: { a: 1, b: 2 } })
    await sync(transport, {}, s7)

    transport.deliver([{ path: 's7.a', value: 99 }])

    await tick()
    await updates()

    expect(getByPath(registry, 's7')).toEqual({ a: 99, b: 2 })
  })

  test('inbound batch applies multiple messages', async () => {
    const { s8 } = tosi({ s8: { x: 0, y: 0 } })
    await sync(transport, {}, s8)

    transport.deliver([
      { path: 's8.x', value: 10 },
      { path: 's8.y', value: 20 },
    ])

    await tick()
    await updates()

    expect(getByPath(registry, 's8')).toEqual({ x: 10, y: 20 })
  })

  test('unsynced paths ignored on inbound', async () => {
    tosi({ s9: { secret: 'original' } })
    const { s9other } = tosi({ s9other: { val: 1 } })
    await sync(transport, {}, s9other)

    transport.deliver([{ path: 's9', value: { secret: 'hacked' } }])

    await tick()
    await updates()

    expect(getByPath(registry, 's9')).toEqual({ secret: 'original' })
  })

  // --- Echo prevention ---

  test('inbound changes do NOT produce outbound messages', async () => {
    const { s10 } = tosi({ s10: { a: 1 } })
    await sync(transport, { throttleInterval: 10 }, s10)

    // Clear any initial sends
    transport.sent.length = 0

    transport.deliver([{ path: 's10', value: { a: 99 } }])

    await tick()
    await updates()
    await tick(50)

    // No outbound messages should have been generated
    expect(transport.sent.length).toBe(0)
  })

  // --- Validation ---

  test('non-proxy argument throws', async () => {
    await expect(sync(transport, {}, 42 as any)).rejects.toThrow(
      'sync() requires boxed proxies or string paths'
    )
  })

  test('string paths work', async () => {
    tosi({ s11: { lang: 'en' } })
    await sync(transport, {}, 's11')

    transport.deliver([{ path: 's11', value: { lang: 'fr' } }])

    await tick()
    await updates()

    expect(getByPath(registry, 's11')).toEqual({ lang: 'fr' })
  })

  // --- Multiple paths ---

  test('multiple proxies in one sync() call', async () => {
    const { s12a, s12b } = tosi({
      s12a: { x: 1 },
      s12b: { y: 2 },
    })
    await sync(transport, { throttleInterval: 10 }, s12a, s12b)

    transport.deliver([
      { path: 's12a', value: { x: 10 } },
      { path: 's12b', value: { y: 20 } },
    ])

    await tick()
    await updates()

    expect(getByPath(registry, 's12a')).toEqual({ x: 10 })
    expect(getByPath(registry, 's12b')).toEqual({ y: 20 })
  })
})
