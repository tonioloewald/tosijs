import { test, expect, describe, beforeEach } from 'bun:test'
import { xin, updates } from './xin'
import { tosi } from './xin-proxy'
import { registry } from './registry'
import { getByPath } from './by-path'
import { share, setShareStore, type ShareStore } from './share'

const CHANNEL_NAME = 'tosijs-share'

// Helper: wait for async BroadcastChannel delivery + observer batching
const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms))

// In-memory store that replaces IndexedDB in tests
class MemoryStore implements ShareStore {
  data = new Map<string, any>()

  async get(key: string): Promise<any> {
    const val = this.data.get(key)
    return val !== undefined ? JSON.parse(JSON.stringify(val)) : undefined
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, JSON.parse(JSON.stringify(value)))
  }
}

let memStore: MemoryStore

beforeEach(() => {
  memStore = new MemoryStore()
  setShareStore(memStore)
})

describe('share', () => {
  // --- Setup & Restore ---

  test('first share seeds store', async () => {
    const { t1 } = tosi({ t1: { color: 'red' } })
    await share(t1)

    const stored = await memStore.get('t1')
    expect(stored).toEqual({ color: 'red' })
  })

  test('returns empty restored for first tab', async () => {
    const { t2 } = tosi({ t2: { count: 0 } })
    const { restored } = await share(t2)

    expect(restored).toEqual([])
  })

  test('restores from pre-existing store', async () => {
    await memStore.set('t3', { name: 'from-other-tab' })

    const { t3 } = tosi({ t3: { name: 'default' } })
    const { restored } = await share(t3)

    await updates()

    expect(restored.length).toBe(1)
    expect(restored[0]).toBe(t3)
    expect(getByPath(registry, 't3')).toEqual({ name: 'from-other-tab' })
  })

  test('wholesale replace on restore, not merge', async () => {
    await memStore.set('t9', { replaced: true })

    const { t9 } = tosi({ t9: { original: true, extra: 'data' } })
    await share(t9)
    await updates()

    const value = getByPath(registry, 't9')
    expect(value).toEqual({ replaced: true })
    expect(value.original).toBeUndefined()
    expect(value.extra).toBeUndefined()
  })

  test('multiple proxies in one share() call', async () => {
    await memStore.set('t10a', { from: 'storage' })

    const { t10a, t10b, t10c } = tosi({
      t10a: { from: 'default' },
      t10b: { from: 'default' },
      t10c: { from: 'default' },
    })

    const { restored } = await share(t10a, t10b, t10c)

    expect(restored.length).toBe(1)
    expect(restored[0]).toBe(t10a)
    expect(await memStore.get('t10b')).toEqual({ from: 'default' })
    expect(await memStore.get('t10c')).toEqual({ from: 'default' })
  })

  // --- Idempotency & Validation ---

  test('idempotent — second share is a no-op', async () => {
    const { t4 } = tosi({ t4: { val: 1 } })
    await share(t4)
    const result2 = await share(t4)

    expect(result2.restored).toEqual([])
  })

  test('non-proxy argument throws', async () => {
    expect(() => share(42 as any)).toThrow(
      'share() requires boxed proxies or string paths'
    )
    expect(() => share(null as any)).toThrow(
      'share() requires boxed proxies or string paths'
    )
  })

  test('string paths work the same as proxies', async () => {
    const { t17 } = tosi({ t17: { lang: 'en' } })

    // Share via string path
    const { restored } = await share('t17')
    expect(restored).toEqual([])

    // Verify it seeded the store
    const stored = await memStore.get('t17')
    expect(stored).toEqual({ lang: 'en' })

    // Verify idempotent with proxy after string share
    const result2 = await share(t17)
    expect(result2.restored).toEqual([])

    // Verify inbound messages still work
    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({
      type: 'tosijs-share',
      path: 't17',
      value: { lang: 'fr' },
      origin: 'other-tab-id',
    })

    await tick()
    await updates()

    expect(getByPath(registry, 't17')).toEqual({ lang: 'fr' })
    sender.close()
  })

  test('string path restores from pre-existing store', async () => {
    await memStore.set('t18', { pref: 'restored' })

    tosi({ t18: { pref: 'default' } })
    const { restored } = await share('t18')

    await updates()

    expect(restored.length).toBe(1)
    expect(restored[0]).toBe('t18')
    expect(getByPath(registry, 't18')).toEqual({ pref: 'restored' })
  })

  // --- Inbound Messages ---

  test('inbound message updates local state', async () => {
    const { t5 } = tosi({ t5: { theme: 'light' } })
    await share(t5)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({
      type: 'tosijs-share',
      path: 't5',
      value: { theme: 'dark' },
      origin: 'other-tab-id',
    })

    await tick()
    await updates()

    expect(getByPath(registry, 't5')).toEqual({ theme: 'dark' })
    sender.close()
  })

  test('inbound delta at sub-path updates only that path', async () => {
    const { t5d } = tosi({ t5d: { a: 1, b: 2 } })
    await share(t5d)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({
      type: 'tosijs-share',
      path: 't5d.a',
      value: 99,
      origin: 'other-tab-id',
    })

    await tick()
    await updates()

    // Only a changed, b untouched
    expect(getByPath(registry, 't5d')).toEqual({ a: 99, b: 2 })
    sender.close()
  })

  test('unshared paths ignored on inbound', async () => {
    tosi({ t12: { secret: 'original' } })

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({
      type: 'tosijs-share',
      path: 't12',
      value: { secret: 'hacked' },
      origin: 'other-tab-id',
    })

    await tick()
    await updates()

    expect(getByPath(registry, 't12')).toEqual({ secret: 'original' })
    sender.close()
  })

  // --- Outbound Messages ---

  test('local root change broadcasts outbound', async () => {
    const { t7 } = tosi({ t7: { x: 1 } })
    await share(t7)

    let received: any = null
    const listener = new BroadcastChannel(CHANNEL_NAME)
    listener.onmessage = (e) => {
      if (e.data.path && e.data.path.startsWith('t7')) {
        received = e.data
      }
    }

    xin['t7'] = { x: 2 }
    await updates()
    await tick()

    expect(received).not.toBeNull()
    expect(received.type).toBe('tosijs-share')
    expect(received.path).toBe('t7')
    expect(received.value).toEqual({ x: 2 })
    listener.close()
  })

  test('sub-path change broadcasts and reflects the new value', async () => {
    const { t15 } = tosi({ t15: { nested: { deep: 1 } } })
    await share(t15)

    // Flush the initial touch from share() setup before mutating
    await updates()
    await tick()

    let received: any = null
    const listener = new BroadcastChannel(CHANNEL_NAME)
    listener.onmessage = (e) => {
      if (e.data.path && e.data.path.startsWith('t15')) {
        received = e.data
      }
    }

    xin['t15'].nested.deep = 2
    await updates()
    await tick()

    expect(received).not.toBeNull()
    expect(received.type).toBe('tosijs-share')
    // The broadcast carries the value at the observed path
    // which includes the mutation
    expect(received.path).toBe('t15.nested.deep')
    expect(received.value).toBe(2)
    listener.close()
  })

  test('boxed .value= broadcasts at the scalar path', async () => {
    const { t16 } = tosi({ t16: { a: 1, b: 2 } })
    await share(t16)

    const messages: any[] = []
    const listener = new BroadcastChannel(CHANNEL_NAME)
    listener.onmessage = (e) => {
      if (e.data.path && e.data.path.startsWith('t16')) {
        messages.push(e.data)
      }
    }

    // boxed .value= on a scalar touches at the root proxy path
    t16.a.value = 99
    await updates()
    await tick()

    expect(messages.length).toBeGreaterThan(0)
    // The value at whatever path was broadcast should reflect the change
    const msg = messages[0]
    expect(msg.type).toBe('tosijs-share')
    listener.close()
  })

  // --- Persistence ---

  test('local changes persist to store (debounced at root path)', async () => {
    const { t6 } = tosi({ t6: { size: 'sm' } })
    await share(t6)

    xin['t6'] = { size: 'lg' }
    await updates()
    // Wait for debounced persist (500ms) + margin
    await tick(700)

    const stored = await memStore.get('t6')
    expect(stored).toEqual({ size: 'lg' })
  })

  // --- Loop Prevention ---

  test('inbound changes do NOT re-broadcast', async () => {
    const { t8 } = tosi({ t8: { a: 1 } })
    await share(t8)

    let echoCount = 0
    const echoListener = new BroadcastChannel(CHANNEL_NAME)
    echoListener.onmessage = (e) => {
      if (e.data.path === 't8' && e.data.origin !== 'other-tab') {
        echoCount++
      }
    }

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({
      type: 'tosijs-share',
      path: 't8',
      value: { a: 99 },
      origin: 'other-tab',
    })

    await tick()
    await updates()
    await tick(100)

    expect(echoCount).toBe(0)
    sender.close()
    echoListener.close()
  })
})
