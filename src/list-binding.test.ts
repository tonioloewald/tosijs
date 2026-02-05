import { test, expect, describe } from 'bun:test'
import { xin } from './xin'
import { tosi } from './xin-proxy'
import { elements } from './elements'
import { ListBinding } from './list-binding'

function mockDimensions(el: HTMLElement, width: number, height: number): void {
  Object.defineProperty(el, 'offsetWidth', {
    value: width,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(el, 'offsetHeight', {
    value: height,
    writable: true,
    configurable: true,
  })
}

// Happy DOM doesn't support :scope, so count direct children manually
function childCount(container: Element): number {
  let count = 0
  for (const child of Array.from(container.children)) {
    if (!child.classList.contains('virtual-list-padding')) {
      count++
    }
  }
  return count
}

function bottomPadHeight(container: Element): string {
  const pads = container.querySelectorAll('.virtual-list-padding')
  return (pads[1] as HTMLElement).style.height
}

describe('virtual list binding - dimensionless container race condition', () => {
  test('renders items when container goes from zero to real dimensions', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ vlTest1: { items } })
    const proxiedArray = xin['vlTest1.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 0, 0)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })

    // First render at zero dimensions (simulates initial layout in hidden container)
    lb.update(proxiedArray)
    const zeroCount = childCount(container)
    // At zero height, visibleRows = ceil(0/30) + 1 = 1, so at most 1 item
    expect(zeroCount).toBeLessThanOrEqual(1)

    // Container gets real dimensions (e.g. tab becomes visible)
    mockDimensions(container, 400, 300)

    // This is what the throttled resize handler calls — isSlice=true
    lb.update(proxiedArray, true)
    const realCount = childCount(container)

    // With 300px/30px = 10 visible rows + 1 chunk = 11 items
    expect(realCount).toBeGreaterThanOrEqual(10)
    expect(realCount).toBeGreaterThan(zeroCount)
  })

  test('visibleColumns recalculates when container width changes', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      label: `Cell ${i}`,
    }))
    tosi({ vlTest2: { items } })
    const proxiedArray = xin['vlTest2.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 0, 400)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 40, width: 100 },
    })

    // Render at zero width — columns = max(1, floor(0/100)) = 1
    lb.update(proxiedArray)
    const narrowCount = childCount(container)

    // Widen to 500px — columns = floor(500/100) = 5
    mockDimensions(container, 500, 400)
    lb.update(proxiedArray, true)
    const wideCount = childCount(container)

    // 5x more columns means ~5x more items rendered
    expect(wideCount).toBeGreaterThan(narrowCount)
    expect(wideCount).toBeGreaterThanOrEqual(narrowCount * 3)
  })

  test('update not skipped when only buffer sizes change (small list)', () => {
    document.body.textContent = ''

    // 3 items where firstItem=0 and lastItem=2 in both cases.
    // Without the buffer check fix, this update would be skipped.
    const items = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ vlTest3: { items } })
    const proxiedArray = xin['vlTest3.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 0)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })

    // Render at zero height — only 1 item rendered
    lb.update(proxiedArray)
    const zeroCount = childCount(container)

    // Resize to real height
    mockDimensions(container, 400, 300)
    lb.update(proxiedArray, true)

    // All 3 items should be rendered now
    expect(childCount(container)).toBe(3)
    // Bottom padding should be 0 since all items fit
    expect(bottomPadHeight(container)).toBe('0px')
  })

  test('bottom buffer updates correctly after dimension change', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ vlTest4: { items } })
    const proxiedArray = xin['vlTest4.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 0)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })

    // Render at zero height
    lb.update(proxiedArray)

    // Give it real dimensions
    mockDimensions(container, 400, 300)
    lb.update(proxiedArray, true)

    const rendered = childCount(container)
    expect(rendered).toBeGreaterThanOrEqual(10)

    // Total rows = 50, viewport shows ~11 rows, so bottom buffer should be > 0
    const bottomPx = parseInt(bottomPadHeight(container))
    expect(bottomPx).toBeGreaterThan(0)
  })

  test('visibleColumns not permanently cached on options object', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Cell ${i}`,
    }))
    tosi({ vlTest5: { items } })
    const proxiedArray = xin['vlTest5.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    const virtualOpts = { height: 40, width: 100 } as any

    mockDimensions(container, 200, 400)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: virtualOpts,
    })

    // First render at 200px width — 2 columns
    lb.update(proxiedArray)
    const twoColCount = childCount(container)

    // The options object should NOT have visibleColumns baked in
    expect(virtualOpts.visibleColumns).toBeUndefined()

    // Widen to 500px — should now compute 5 columns dynamically
    mockDimensions(container, 500, 400)
    lb.update(proxiedArray, true)
    const fiveColCount = childCount(container)

    expect(fiveColCount).toBeGreaterThan(twoColCount)
  })
})
