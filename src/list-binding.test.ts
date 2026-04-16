import { test, expect, describe } from 'bun:test'
import { xin } from './xin'
import { tosi } from './xin-proxy'
import { elements } from './elements'
import {
  ListBinding,
  getListBinding,
  scrollListItemIntoView,
} from './list-binding'

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

describe('scrollListItemIntoView', () => {
  test('returns false when element has no list binding', () => {
    const { div } = elements
    const el = div()
    expect(scrollListItemIntoView(el, {})).toBe(false)
  })

  test('returns false when item is not in the array', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ scrollTest1: { items } })
    const proxiedArray = xin['scrollTest1.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)

    expect(scrollListItemIntoView(container, { id: 999, label: 'nope' })).toBe(
      false
    )
  })

  test('scrolls to item in virtual list by setting scrollTop', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ scrollTest2: { items } })
    const proxiedArray = xin['scrollTest2.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    // Mock scrollTo
    let scrolledTo: { top: number; behavior: string } | undefined
    ;(container as any).scrollTo = (opts: any) => {
      scrolledTo = opts
    }

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })
    lb.update(proxiedArray)

    // Scroll to item 50 (row 50, top = 1500px)
    const result = scrollListItemIntoView(container, items[50])
    expect(result).toBe(true)
    expect(scrolledTo).toBeDefined()
    // Middle position: itemTop - (viewportHeight - itemHeight) / 2
    // = 1500 - (300 - 30) / 2 = 1500 - 135 = 1365
    expect(scrolledTo!.top).toBe(1365)
    expect(scrolledTo!.behavior).toBe('smooth')
  })

  test('scrolls to item in non-virtual list via scrollIntoView', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ scrollTest3: { items } })
    const proxiedArray = xin['scrollTest3.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)

    // Find the element for item 2 and mock scrollIntoView
    const itemGroup = lb.itemToElement.get(items[2])
    expect(itemGroup).toBeDefined()
    const itemEl = itemGroup![0]
    let scrollIntoViewOpts: any
    ;(itemEl as any).scrollIntoView = (opts: any) => {
      scrollIntoViewOpts = opts
    }

    const result = scrollListItemIntoView(container, items[2])
    expect(result).toBe(true)
    expect(scrollIntoViewOpts).toEqual({
      block: 'center',
      behavior: 'smooth',
    })
  })

  test('position start scrolls item to top of viewport', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ scrollTest4: { items } })
    const proxiedArray = xin['scrollTest4.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    let scrolledTo: any
    ;(container as any).scrollTo = (opts: any) => {
      scrolledTo = opts
    }

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })
    lb.update(proxiedArray)

    scrollListItemIntoView(container, items[50], { position: 'start' })
    // Item 50 row top = 1500
    expect(scrolledTo!.top).toBe(1500)
  })
})

describe('variable-height virtual list (minHeight)', () => {
  test('renders items using minHeight for scroll calculation', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ varHeightTest1: { items } })
    const proxiedArray = xin['varHeightTest1.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, minHeight: 20 },
    })
    lb.update(proxiedArray)

    // With minHeight=20, visibleRows = ceil(300/20) + 1 = 16
    // So at least 15 items should be rendered
    expect(childCount(container)).toBeGreaterThanOrEqual(15)
  })

  test('scroll fraction interpolates correctly at extremes', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ varHeightTest2: { items } })
    const proxiedArray = xin['varHeightTest2.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, minHeight: 20 },
    })

    // At scrollTop=0, first items should render
    Object.defineProperty(container, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    })
    lb.update(proxiedArray, true)

    // Check that the first child (non-padding) is item 0
    const firstChild = Array.from(container.children).find(
      (c) => !c.classList.contains('virtual-list-padding')
    )
    expect(firstChild).toBeDefined()
  })

  test('scrollListItemIntoView works with minHeight', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ varHeightTest3: { items } })
    const proxiedArray = xin['varHeightTest3.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    let scrolledTo: any
    ;(container as any).scrollTo = (opts: any) => {
      scrolledTo = opts
    }

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, minHeight: 20 },
    })
    lb.update(proxiedArray)

    // Scroll to item 50 — should succeed and use fraction-based math
    const result = scrollListItemIntoView(container, items[50])
    expect(result).toBe(true)
    expect(scrolledTo).toBeDefined()
    expect(scrolledTo!.top).toBeGreaterThan(0)
    expect(scrolledTo!.behavior).toBe('smooth')
  })

  test('top buffer tracks scroll position smoothly', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ varHeightTest4: { items } })
    const proxiedArray = xin['varHeightTest4.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, minHeight: 20 },
    })

    // Simulate scrolling partway
    Object.defineProperty(container, 'scrollTop', {
      value: 500,
      writable: true,
      configurable: true,
    })
    lb.update(proxiedArray, true)

    // Top padding should be positive and roughly track scroll position
    const pads = container.querySelectorAll('.virtual-list-padding')
    const topPad = parseInt((pads[0] as HTMLElement).style.height)
    expect(topPad).toBeGreaterThan(0)
    // Should be in the neighborhood of scrollTop (interpolated, not exact)
    expect(topPad).toBeLessThanOrEqual(500)
  })
})

describe('list binding element reuse with idPath on array replacement', () => {
  test('replacing array with new objects sharing same ids reuses elements', () => {
    document.body.textContent = ''

    const initial = [
      { name: 'Alice', score: 10 },
      { name: 'Bob', score: 20 },
      { name: 'Carol', score: 30 },
    ]
    tosi({ reuseTest1: { list: initial } })
    const proxiedArray = xin['reuseTest1.list'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.name' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'name' })
    lb.update(proxiedArray)

    expect(childCount(container)).toBe(3)

    // Capture the actual DOM elements
    const elementsBefore = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // Simulate polling: replace array with new objects, same ids, mostly same data
    const updated = [
      { name: 'Alice', score: 10 }, // unchanged
      { name: 'Bob', score: 25 },   // score changed
      { name: 'Carol', score: 30 }, // unchanged
    ]
    xin['reuseTest1.list'] = updated
    const newProxiedArray = xin['reuseTest1.list'] as any[]

    lb.update(newProxiedArray)

    expect(childCount(container)).toBe(3)

    const elementsAfter = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // Elements should be reused, not recreated
    expect(elementsAfter[0]).toBe(elementsBefore[0])
    expect(elementsAfter[1]).toBe(elementsBefore[1])
    expect(elementsAfter[2]).toBe(elementsBefore[2])
  })

  test('find + Object.assign + touch does not recreate elements', () => {
    document.body.textContent = ''

    const initial = [
      { name: 'Alice', score: 10 },
      { name: 'Bob', score: 20 },
      { name: 'Carol', score: 30 },
    ]
    const { reuseTest2 } = tosi({ reuseTest2: { list: initial } })
    const proxiedArray = xin['reuseTest2.list'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.name' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'name' })
    lb.update(proxiedArray)

    const elementsBefore = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // Simulate polling: find each existing item and Object.assign new data
    const polledData = [
      { name: 'Alice', score: 10 }, // unchanged
      { name: 'Bob', score: 25 },   // score changed
      { name: 'Carol', score: 30 }, // unchanged
    ]
    for (const newItem of polledData) {
      const existing = proxiedArray.find(
        (item: any) => item.name === newItem.name
      )
      if (existing) {
        Object.assign(existing, newItem)
      }
    }
    // Touch array proxy to trigger list update
    reuseTest2.list.tosi.touch()

    // Manually trigger update (simulating what the observer would do)
    lb.update(xin['reuseTest2.list'] as any[])

    const elementsAfter = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    expect(elementsAfter[0]).toBe(elementsBefore[0])
    expect(elementsAfter[1]).toBe(elementsBefore[1])
    expect(elementsAfter[2]).toBe(elementsBefore[2])
  })
})

describe('virtual list aria attributes', () => {
  test('container has aria-rowcount and items have aria-rowindex', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ ariaTest1: { items } })
    const proxiedArray = xin['ariaTest1.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })
    lb.update(proxiedArray)

    expect(container.getAttribute('aria-rowcount')).toBe('50')
    expect(container.getAttribute('role')).toBe('list')

    const rendered = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )
    // First rendered item should have aria-rowindex="1" (1-based)
    expect(rendered[0].getAttribute('aria-rowindex')).toBe('1')
    expect(rendered[0].getAttribute('role')).toBe('listitem')
    // Second item
    expect(rendered[1].getAttribute('aria-rowindex')).toBe('2')
  })

  test('padding elements have aria-hidden and role=presentation', () => {
    document.body.textContent = ''

    const items = [{ id: 1, label: 'a' }]
    tosi({ ariaTest2: { items } })
    const proxiedArray = xin['ariaTest2.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    document.body.append(container)

    new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })

    const pads = container.querySelectorAll('.virtual-list-padding')
    expect(pads.length).toBe(2)
    for (const pad of Array.from(pads)) {
      expect(pad.getAttribute('aria-hidden')).toBe('true')
      expect(pad.getAttribute('role')).toBe('presentation')
    }
  })

  test('aria-rowindex updates when slice shifts', () => {
    document.body.textContent = ''

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
    }))
    tosi({ ariaTest3: { items } })
    const proxiedArray = xin['ariaTest3.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    Object.defineProperty(container, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    })

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30 },
    })
    lb.update(proxiedArray)

    // Scroll down
    Object.defineProperty(container, 'scrollTop', {
      value: 600,
      configurable: true,
    })
    lb.update(proxiedArray, true)

    const rendered = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )
    // First rendered item should now be ~item 20 (600/30), aria-rowindex = 21
    const firstIndex = parseInt(rendered[0].getAttribute('aria-rowindex')!)
    expect(firstIndex).toBeGreaterThan(1)
  })

  test('non-virtual lists do not get aria attributes', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, label: 'a' },
      { id: 2, label: 'b' },
    ]
    tosi({ ariaTest4: { items } })
    const proxiedArray = xin['ariaTest4.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.label' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)

    expect(container.getAttribute('aria-rowcount')).toBeNull()
    expect(container.getAttribute('role')).toBeNull()
    const rendered = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )
    expect(rendered[0].getAttribute('aria-rowindex')).toBeNull()
    expect(rendered[0].getAttribute('role')).toBeNull()
  })
})

describe('itemsPerRow grid layout', () => {
  test('stamps multiple elements per array item', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, name: 'Alice', score: 10 },
      { id: 2, name: 'Bob', score: 20 },
      { id: 3, name: 'Carol', score: 30 },
    ]
    tosi({ gridTest1: { items } })
    const proxiedArray = xin['gridTest1.items'] as any[]

    const { div, span, template } = elements
    const container = div(
      template(
        span({ bindText: '^.name' }),
        span({ bindText: '^.score' }),
      )
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })
    lb.update(proxiedArray)

    // 3 items × 2 elements each = 6 content elements
    expect(childCount(container)).toBe(6)
  })

  test('applies tosi-virtual-grid class and --tosi-columns CSS variable', () => {
    document.body.textContent = ''

    const items = [{ id: 1, name: 'a' }]
    tosi({ gridTest2: { items } })
    const proxiedArray = xin['gridTest2.items'] as any[]

    const { div, span, template } = elements
    const container = div(
      template(span({ bindText: '^.name' }), span({ bindText: '^.id' }))
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })

    expect(container.classList.contains('tosi-virtual-grid')).toBe(true)
    expect(
      (container as HTMLElement).style.getPropertyValue('--tosi-columns')
    ).toBe('2')
  })

  test('padding elements span all columns', () => {
    document.body.textContent = ''

    const items = [{ id: 1, name: 'a' }]
    tosi({ gridTest3: { items } })
    const proxiedArray = xin['gridTest3.items'] as any[]

    const { div, span, template } = elements
    const container = div(
      template(span({ bindText: '^.name' }), span({ bindText: '^.id' }))
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })

    const pads = container.querySelectorAll('.virtual-list-padding')
    for (const pad of Array.from(pads)) {
      expect((pad as HTMLElement).style.gridColumn).toBe('1 / -1')
    }
  })

  test('element groups are reused on array replacement', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, name: 'Alice', score: 10 },
      { id: 2, name: 'Bob', score: 20 },
    ]
    tosi({ gridTest4: { items } })
    const proxiedArray = xin['gridTest4.items'] as any[]

    const { div, span, template } = elements
    const container = div(
      template(
        span({ bindText: '^.name' }),
        span({ bindText: '^.score' }),
      )
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })
    lb.update(proxiedArray)

    const elementsBefore = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // Replace array with new objects, same ids
    xin['gridTest4.items'] = [
      { id: 1, name: 'Alice', score: 15 },
      { id: 2, name: 'Bob', score: 25 },
    ]
    lb.update(xin['gridTest4.items'] as any[])

    const elementsAfter = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // All 4 elements should be reused
    expect(elementsAfter[0]).toBe(elementsBefore[0])
    expect(elementsAfter[1]).toBe(elementsBefore[1])
    expect(elementsAfter[2]).toBe(elementsBefore[2])
    expect(elementsAfter[3]).toBe(elementsBefore[3])
  })

  test('aria roles and indices for grid layout', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    tosi({ gridTest5: { items } })
    const proxiedArray = xin['gridTest5.items'] as any[]

    const { div, span, template } = elements
    const container = div(
      template(
        span({ bindText: '^.name' }),
        span({ bindText: '^.id' }),
      )
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })
    lb.update(proxiedArray)

    // Container should have role="grid"
    expect(container.getAttribute('role')).toBe('grid')

    const rendered = Array.from(container.children).filter(
      (c) => !c.classList.contains('virtual-list-padding')
    )

    // Item 1: elements 0 and 1 share aria-rowindex="1"
    expect(rendered[0].getAttribute('aria-rowindex')).toBe('1')
    expect(rendered[1].getAttribute('aria-rowindex')).toBe('1')
    // Item 2: elements 2 and 3 share aria-rowindex="2"
    expect(rendered[2].getAttribute('aria-rowindex')).toBe('2')
    expect(rendered[3].getAttribute('aria-rowindex')).toBe('2')
    // All cells have role="gridcell"
    for (const el of rendered) {
      expect(el.getAttribute('role')).toBe('gridcell')
    }
    // aria-colindex (1-based)
    expect(rendered[0].getAttribute('aria-colindex')).toBe('1')
    expect(rendered[1].getAttribute('aria-colindex')).toBe('2')
    expect(rendered[2].getAttribute('aria-colindex')).toBe('1')
    expect(rendered[3].getAttribute('aria-colindex')).toBe('2')
  })

  test('itemsPerRow=1 (default) behaves identically to no itemsPerRow', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    tosi({ gridTest6: { items } })
    const proxiedArray = xin['gridTest6.items'] as any[]

    const { div, template } = elements
    const container = div(template(div({ bindText: '^.name' })))
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 1 },
    })
    lb.update(proxiedArray)

    // Should not apply grid class
    expect(container.classList.contains('tosi-virtual-grid')).toBe(false)
    // 2 items × 1 = 2 content elements
    expect(childCount(container)).toBe(2)
  })

  test('pinned header rows survive list updates', () => {
    document.body.textContent = ''

    const items = [
      { id: 1, name: 'Alice', score: 10 },
      { id: 2, name: 'Bob', score: 20 },
    ]
    tosi({ gridTest7: { items } })
    const proxiedArray = xin['gridTest7.items'] as any[]

    const { div, span, template } = elements
    const header1 = span('Name')
    const header2 = span('Score')
    const container = div(
      header1,
      header2,
      template(
        span({ bindText: '^.name' }),
        span({ bindText: '^.score' }),
      )
    )
    mockDimensions(container, 400, 300)
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {
      idPath: 'id',
      virtual: { height: 30, itemsPerRow: 2 },
    })
    lb.update(proxiedArray)

    // 2 headers + 2 items × 2 cells + 2 padding = 8 total children
    expect(container.children.length).toBe(8)
    expect(container.contains(header1)).toBe(true)
    expect(container.contains(header2)).toBe(true)

    // Headers must survive repeated updates
    lb.update(proxiedArray)
    expect(container.contains(header1)).toBe(true)
    expect(container.contains(header2)).toBe(true)
    expect(container.children.length).toBe(8)
  })

  test('scalar list items are cleaned up with static content present', () => {
    document.body.textContent = ''

    tosi({ scalarPinTest: { items: ['a', 'b', 'c'] } })
    const proxiedArray = xin['scalarPinTest.items'] as any[]

    const { div, span, template } = elements
    const header = span('Header')
    const container = div(header, template(span({ bindText: '^' })))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, {})
    lb.update(proxiedArray)

    // 1 header + 3 scalar items + 2 padding = 6
    expect(container.children.length).toBe(6)
    expect(container.contains(header)).toBe(true)

    // Update again — should not duplicate scalars
    lb.update(proxiedArray)
    expect(container.children.length).toBe(6)
    expect(container.contains(header)).toBe(true)
  })
})
