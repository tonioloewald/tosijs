import { test, expect, describe } from 'bun:test'
import { throttle, debounce } from './throttle'

describe('debounce', () => {
  test('delays execution until interval passes', async () => {
    let callCount = 0
    const fn = debounce(() => {
      callCount++
    }, 50)

    fn()
    fn()
    fn()
    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(callCount).toBe(1)
  })

  test('resets timer on each call', async () => {
    let callCount = 0
    const fn = debounce(() => {
      callCount++
    }, 50)

    fn()
    await new Promise((resolve) => setTimeout(resolve, 30))
    fn()
    await new Promise((resolve) => setTimeout(resolve, 30))
    fn()
    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(callCount).toBe(1)
  })

  test('passes last arguments to wrapped function', async () => {
    let lastArg: string | undefined
    const fn = debounce((arg: string) => {
      lastArg = arg
    }, 50)

    fn('first')
    fn('second')
    fn('third')

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(lastArg).toBe('third')
  })

  test('uses default interval of 250ms', async () => {
    let callCount = 0
    const fn = debounce(() => {
      callCount++
    })

    fn()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(callCount).toBe(1)
  })
})

describe('throttle', () => {
  test('executes immediately on first call', async () => {
    let callCount = 0
    const fn = throttle(() => {
      callCount++
    }, 50)

    fn()
    expect(callCount).toBe(1)
  })

  test('throttles subsequent calls within interval', async () => {
    let callCount = 0
    const fn = throttle(() => {
      callCount++
    }, 50)

    fn()
    fn()
    fn()
    expect(callCount).toBe(1)

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(callCount).toBe(2) // Final debounced call
  })

  test('allows calls after interval passes', async () => {
    let callCount = 0
    const fn = throttle(() => {
      callCount++
    }, 50)

    fn()
    expect(callCount).toBe(1)

    await new Promise((resolve) => setTimeout(resolve, 60))
    fn()
    expect(callCount).toBe(2)
  })

  test('guarantees last call goes through', async () => {
    let lastArg: string | undefined
    const fn = throttle((arg: string) => {
      lastArg = arg
    }, 50)

    fn('first')
    fn('second')
    fn('third')
    expect(lastArg).toBe('first')

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(lastArg).toBe('third')
  })

  test('uses default interval of 250ms', async () => {
    let callCount = 0
    const fn = throttle(() => {
      callCount++
    })

    fn()
    expect(callCount).toBe(1)

    fn()
    expect(callCount).toBe(1) // Still throttled

    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(callCount).toBe(2) // Debounced final call went through
  })
})

describe('throttle single-fire contract', () => {
  test('a single isolated call fires exactly once', async () => {
    let callCount = 0
    const fn = throttle(() => {
      callCount++
    }, 50)

    fn()
    expect(callCount).toBe(1)

    // before the fix, an uncancelled trailing timer fired a duplicate here
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(callCount).toBe(1)
  })

  test('a burst fires leading with first args and one trailing with last args', async () => {
    const seen: number[] = []
    const fn = throttle((n: number) => {
      seen.push(n)
    }, 50)

    fn(1)
    fn(2)
    fn(3)
    expect(seen).toEqual([1])

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(seen).toEqual([1, 3])
  })
})

test('debounce and throttle preserve `this` (medium backlog)', async () => {
  const obj = {
    n: 0,
    bump(this: any) {
      this.n += 1
    },
  } as any
  obj.debounced = debounce(obj.bump, 20)
  obj.throttled = throttle(obj.bump, 20)
  obj.throttled() // leading edge, synchronous
  expect(obj.n).toBe(1) // `this` was lost before -> TypeError or wrong target
  obj.debounced()
  await new Promise((r) => setTimeout(r, 60))
  expect(obj.n).toBe(2)
})
