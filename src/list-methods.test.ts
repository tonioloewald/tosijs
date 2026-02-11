import { test, expect, describe } from 'bun:test'
import { xin } from './xin'
import { tosi } from './xin-proxy'
import { tosiValue, tosiPath } from './metadata'
import { updates } from './path-listener'
import { elements } from './elements'
import { ListBinding } from './list-binding'

describe('listFind', () => {
  test('finds item by selector and returns proxied result', () => {
    const { findTest } = tosi({
      findTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Carol' },
        ],
      },
    })

    const item = findTest.items.listFind((item: any) => item.id, 2)
    expect(item).toBeDefined()
    expect(tosiPath(item)).toBe('findTest.items[1]')
    expect(item.name.value).toBe('Bob')
  })

  test('returns undefined for non-existent item', () => {
    const { findMissTest } = tosi({
      findMissTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    const item = findMissTest.items.listFind((item: any) => item.id, 999)
    expect(item).toBeUndefined()
  })

  test('mutations on found item trigger observers', async () => {
    const { findObsTest } = tosi({
      findObsTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      },
    })

    let observed = false
    const unsub = findObsTest.items[1].name.observe(() => {
      observed = true
    })

    const item = findObsTest.items.listFind((item: any) => item.id, 2)
    item.name.value = 'Robert'
    await updates()
    expect(observed).toBe(true)
    expect(findObsTest.items[1].name.value).toBe('Robert')
    unsub()
  })

  test('works with string ids', () => {
    const { findStrTest } = tosi({
      findStrTest: {
        items: [
          { uid: 'abc', label: 'first' },
          { uid: 'def', label: 'second' },
        ],
      },
    })

    const item = findStrTest.items.listFind((item: any) => item.uid, 'def')
    expect(item).toBeDefined()
    expect(item.label.value).toBe('second')
  })

  test('finds item at index 0', () => {
    const { findZeroTest } = tosi({
      findZeroTest: {
        items: [
          { id: 0, name: 'Zero' },
          { id: 1, name: 'One' },
        ],
      },
    })

    const item = findZeroTest.items.listFind((item: any) => item.id, 0)
    expect(item).toBeDefined()
    expect(item.name.value).toBe('Zero')
  })

  test('returns undefined on empty array', () => {
    const { findEmptyTest } = tosi({
      findEmptyTest: { items: [] as any[] },
    })

    const item = findEmptyTest.items.listFind((item: any) => item.id, 1)
    expect(item).toBeUndefined()
  })

  test('finds first match when multiple items have same field value', () => {
    const { findDupTest } = tosi({
      findDupTest: {
        items: [
          { category: 'a', name: 'first' },
          { category: 'a', name: 'second' },
          { category: 'b', name: 'third' },
        ],
      },
    })

    const item = findDupTest.items.listFind((item: any) => item.category, 'a')
    expect(item.name.value).toBe('first')
  })
})

describe('listUpdate', () => {
  test('updates existing item properties in place', () => {
    const { updateTest } = tosi({
      updateTest: {
        items: [
          { id: 1, name: 'Alice', score: 10 },
          { id: 2, name: 'Bob', score: 20 },
        ],
      },
    })

    const rawBefore = tosiValue(updateTest.items[1])
    updateTest.items.listUpdate((item: any) => item.id, {
      id: 2,
      name: 'Robert',
      score: 25,
    })
    const rawAfter = tosiValue(updateTest.items[1])

    // Object identity preserved
    expect(rawAfter).toBe(rawBefore)
    expect(updateTest.items[1].name.value).toBe('Robert')
    expect(updateTest.items[1].score.value).toBe(25)
    expect(updateTest.items.value.length).toBe(2)
  })

  test('only changed properties fire observers', async () => {
    const { updateObsTest } = tosi({
      updateObsTest: {
        items: [{ id: 1, name: 'Alice', score: 10 }],
      },
    })
    await updates()

    let nameChanged = false
    let scoreChanged = false
    const unsub1 = updateObsTest.items[0].name.observe(() => {
      nameChanged = true
    })
    const unsub2 = updateObsTest.items[0].score.observe(() => {
      scoreChanged = true
    })

    updateObsTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Alice', // unchanged
      score: 99, // changed
    })
    await updates()

    // Only score should have fired — name is unchanged
    expect(scoreChanged).toBe(true)
    expect(nameChanged).toBe(false)
    unsub1()
    unsub2()
  })

  test('pushes new item when not found', () => {
    const { updatePushTest } = tosi({
      updatePushTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    expect(updatePushTest.items.value.length).toBe(1)
    const result = updatePushTest.items.listUpdate((item: any) => item.id, {
      id: 2,
      name: 'Bob',
    })
    expect(updatePushTest.items.value.length).toBe(2)
    expect(result.name.value).toBe('Bob')
  })

  test('idempotent — same data twice does not duplicate', async () => {
    const { updateIdempTest } = tosi({
      updateIdempTest: {
        items: [{ id: 1, name: 'Alice', score: 10 }],
      },
    })
    await updates()

    updateIdempTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Alice',
      score: 10,
    })
    expect(updateIdempTest.items.value.length).toBe(1)

    // Second call — no property observers should fire since nothing changed
    let anyChanged = false
    const unsub1 = updateIdempTest.items[0].name.observe(() => {
      anyChanged = true
    })
    const unsub2 = updateIdempTest.items[0].score.observe(() => {
      anyChanged = true
    })
    updateIdempTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Alice',
      score: 10,
    })
    await updates()
    expect(anyChanged).toBe(false)
    unsub1()
    unsub2()
  })

  test('returns proxied item for existing update', () => {
    const { updateRetTest } = tosi({
      updateRetTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    const result = updateRetTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Updated',
    })
    expect(tosiPath(result)).toBeDefined()
    expect(result.name.value).toBe('Updated')
  })

  test('returns proxied item for new push', () => {
    const { updateRetNewTest } = tosi({
      updateRetNewTest: {
        items: [] as any[],
      },
    })

    const result = updateRetNewTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'New',
    })
    expect(tosiPath(result)).toBeDefined()
    expect(result.name.value).toBe('New')
  })

  test('updates item at index 0', () => {
    const { updateZeroTest } = tosi({
      updateZeroTest: {
        items: [
          { id: 0, name: 'Zero' },
          { id: 1, name: 'One' },
        ],
      },
    })

    const rawBefore = tosiValue(updateZeroTest.items[0])
    updateZeroTest.items.listUpdate((item: any) => item.id, {
      id: 0,
      name: 'Updated Zero',
    })
    const rawAfter = tosiValue(updateZeroTest.items[0])
    expect(rawAfter).toBe(rawBefore)
    expect(updateZeroTest.items[0].name.value).toBe('Updated Zero')
  })

  test('preserves sub-array references when unchanged', () => {
    const tags = ['a', 'b', 'c']
    const { updateSubTest } = tosi({
      updateSubTest: {
        items: [{ id: 1, name: 'Alice', tags }],
      },
    })

    const rawTagsBefore = tosiValue(updateSubTest.items[0]).tags
    updateSubTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Updated',
      tags, // same reference
    })
    const rawTagsAfter = tosiValue(updateSubTest.items[0]).tags
    expect(rawTagsAfter).toBe(rawTagsBefore)
  })
})

describe('listRemove', () => {
  test('removes existing item and returns true', () => {
    const { removeTest } = tosi({
      removeTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Carol' },
        ],
      },
    })

    const result = removeTest.items.listRemove((item: any) => item.id, 2)
    expect(result).toBe(true)
    expect(removeTest.items.value.length).toBe(2)
    expect(removeTest.items[0].name.value).toBe('Alice')
    expect(removeTest.items[1].name.value).toBe('Carol')
  })

  test('returns false for non-existent item', () => {
    const { removeMissTest } = tosi({
      removeMissTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    const result = removeMissTest.items.listRemove((item: any) => item.id, 999)
    expect(result).toBe(false)
    expect(removeMissTest.items.value.length).toBe(1)
  })

  test('returns false on empty array', () => {
    const { removeEmptyTest } = tosi({
      removeEmptyTest: { items: [] as any[] },
    })

    const result = removeEmptyTest.items.listRemove((item: any) => item.id, 1)
    expect(result).toBe(false)
  })

  test('fires observers on removal', async () => {
    const { removeObsTest } = tosi({
      removeObsTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      },
    })

    let observed = false
    removeObsTest.items.observe(() => {
      observed = true
    })

    removeObsTest.items.listRemove((item: any) => item.id, 1)
    await updates()
    expect(observed).toBe(true)
  })

  test('removes item at index 0', () => {
    const { removeZeroTest } = tosi({
      removeZeroTest: {
        items: [
          { id: 0, name: 'Zero' },
          { id: 1, name: 'One' },
        ],
      },
    })

    removeZeroTest.items.listRemove((item: any) => item.id, 0)
    expect(removeZeroTest.items.value.length).toBe(1)
    expect(removeZeroTest.items[0].name.value).toBe('One')
  })

  test('removes first match when duplicates exist', () => {
    const { removeDupTest } = tosi({
      removeDupTest: {
        items: [
          { category: 'a', name: 'first' },
          { category: 'a', name: 'second' },
          { category: 'b', name: 'third' },
        ],
      },
    })

    removeDupTest.items.listRemove((item: any) => item.category, 'a')
    expect(removeDupTest.items.value.length).toBe(2)
    expect(removeDupTest.items[0].name.value).toBe('second')
  })
})

describe('edge cases', () => {
  test('selector throws on invalid callback', () => {
    const { selectorTest } = tosi({
      selectorTest: { items: [{ id: 1 }] },
    })

    expect(() => {
      selectorTest.items.listFind(() => 'not a proxy field', 1)
    }).toThrow('selector must return a property of the item')
  })

  test('number/string id coercion works', () => {
    const { coerceTest } = tosi({
      coerceTest: {
        items: [{ id: 42, name: 'answer' }],
      },
    })

    // Find with string '42' matches number 42
    const item = coerceTest.items.listFind((item: any) => item.id, '42')
    expect(item).toBeDefined()
    expect(item.name.value).toBe('answer')
  })
})

// Helper: count non-padding children
function contentChildren(container: Element): Element[] {
  return Array.from(container.children).filter(
    (c) => !c.classList.contains('virtual-list-padding')
  )
}

describe('fine-grained DOM integration', () => {
  test('listUpdate reuses existing DOM elements (no teardown/recreation)', async () => {
    document.body.textContent = ''

    const { domUpdateTest } = tosi({
      domUpdateTest: {
        items: [
          { id: 1, name: 'Alice', score: 10 },
          { id: 2, name: 'Bob', score: 20 },
          { id: 3, name: 'Carol', score: 30 },
        ],
      },
    })

    const proxiedArray = xin['domUpdateTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(
      template(div(span({ bindText: '^.name' }), span({ bindText: '^.score' })))
    )
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    const children = contentChildren(container)
    expect(children.length).toBe(3)

    // Capture element references before update
    const el0 = children[0]
    const el1 = children[1]
    const el2 = children[2]

    // Verify initial content
    expect(el1.querySelector('span')!.textContent).toBe('Bob')

    // Update Bob's name via listUpdate
    domUpdateTest.items.listUpdate((item: any) => item.id, {
      id: 2,
      name: 'Robert',
      score: 20,
    })
    await updates()

    // Re-render the list (simulates observer-triggered update)
    lb.update(proxiedArray)

    const childrenAfter = contentChildren(container)
    expect(childrenAfter.length).toBe(3)

    // Same DOM elements — no teardown/recreation
    expect(childrenAfter[0]).toBe(el0)
    expect(childrenAfter[1]).toBe(el1)
    expect(childrenAfter[2]).toBe(el2)

    // The bound text was updated
    expect(el1.querySelector('span')!.textContent).toBe('Robert')
  })

  test('listUpdate only updates changed property DOM, not unchanged', async () => {
    document.body.textContent = ''

    const { domSurgicalTest } = tosi({
      domSurgicalTest: {
        items: [{ id: 1, name: 'Alice', score: 10 }],
      },
    })

    const proxiedArray = xin['domSurgicalTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(
      template(div(span({ bindText: '^.name' }), span({ bindText: '^.score' })))
    )
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    const itemEl = contentChildren(container)[0]
    const nameSpan = itemEl.children[0] as HTMLSpanElement
    const scoreSpan = itemEl.children[1] as HTMLSpanElement

    expect(nameSpan.textContent).toBe('Alice')
    expect(scoreSpan.textContent).toBe('10')

    // Sentinel: set a custom property to detect if element is replaced
    ;(nameSpan as any)._sentinel = true
    ;(scoreSpan as any)._sentinel = true

    // Update only score, leave name unchanged
    domSurgicalTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Alice',
      score: 99,
    })
    await updates()

    // Same elements still in DOM (sentinels survive)
    const itemElAfter = contentChildren(container)[0]
    expect(itemElAfter).toBe(itemEl)
    expect((itemElAfter.children[0] as any)._sentinel).toBe(true)
    expect((itemElAfter.children[1] as any)._sentinel).toBe(true)

    // Score updated, name untouched
    expect(itemElAfter.children[0].textContent).toBe('Alice')
    expect(itemElAfter.children[1].textContent).toBe('99')
  })

  test('listRemove removes exactly one DOM element', async () => {
    document.body.textContent = ''

    const { domRemoveTest } = tosi({
      domRemoveTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Carol' },
        ],
      },
    })

    const proxiedArray = xin['domRemoveTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(template(div(span({ bindText: '^.name' }))))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    expect(contentChildren(container).length).toBe(3)

    // Capture references to Alice and Carol's elements
    const aliceEl = contentChildren(container)[0]
    const carolEl = contentChildren(container)[2]
    ;(aliceEl as any)._sentinel = 'alice'
    ;(carolEl as any)._sentinel = 'carol'

    // Remove Bob
    domRemoveTest.items.listRemove((item: any) => item.id, 2)
    lb.update(xin['domRemoveTest.items'] as any[])
    await updates()

    const childrenAfter = contentChildren(container)
    expect(childrenAfter.length).toBe(2)

    // Alice and Carol's elements survive — same references
    expect((childrenAfter[0] as any)._sentinel).toBe('alice')
    expect((childrenAfter[1] as any)._sentinel).toBe('carol')

    // Correct content
    expect(childrenAfter[0].querySelector('span')!.textContent).toBe('Alice')
    expect(childrenAfter[1].querySelector('span')!.textContent).toBe('Carol')
  })

  test('listUpdate push adds exactly one new DOM element', async () => {
    document.body.textContent = ''

    const { domPushTest } = tosi({
      domPushTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    const proxiedArray = xin['domPushTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(template(div(span({ bindText: '^.name' }))))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    const aliceEl = contentChildren(container)[0]
    ;(aliceEl as any)._sentinel = 'alice'
    expect(contentChildren(container).length).toBe(1)

    // Push new item via listUpdate (item not found → push)
    domPushTest.items.listUpdate((item: any) => item.id, {
      id: 2,
      name: 'Bob',
    })
    lb.update(xin['domPushTest.items'] as any[])
    await updates()

    const childrenAfter = contentChildren(container)
    expect(childrenAfter.length).toBe(2)

    // Alice's element is still the same reference
    expect((childrenAfter[0] as any)._sentinel).toBe('alice')

    // New element for Bob
    expect(childrenAfter[1].querySelector('span')!.textContent).toBe('Bob')
  })

  test('multiple listUpdates preserve all element identities', async () => {
    document.body.textContent = ''

    const { domMultiTest } = tosi({
      domMultiTest: {
        items: [
          { id: 1, name: 'Alice', score: 10 },
          { id: 2, name: 'Bob', score: 20 },
          { id: 3, name: 'Carol', score: 30 },
        ],
      },
    })

    const proxiedArray = xin['domMultiTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(
      template(div(span({ bindText: '^.name' }), span({ bindText: '^.score' })))
    )
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    // Tag all elements
    const origElements = contentChildren(container)
    origElements.forEach((el, i) => {
      ;(el as any)._idx = i
    })

    // Update all three items in sequence
    domMultiTest.items.listUpdate((item: any) => item.id, {
      id: 1,
      name: 'Alice',
      score: 100,
    })
    domMultiTest.items.listUpdate((item: any) => item.id, {
      id: 2,
      name: 'Bobby',
      score: 200,
    })
    domMultiTest.items.listUpdate((item: any) => item.id, {
      id: 3,
      name: 'Carol',
      score: 300,
    })
    lb.update(proxiedArray)
    await updates()

    const afterElements = contentChildren(container)
    expect(afterElements.length).toBe(3)

    // All three elements are the exact same DOM nodes
    for (let i = 0; i < 3; i++) {
      expect((afterElements[i] as any)._idx).toBe(i)
    }

    // Verify updated content
    expect(afterElements[0].children[1].textContent).toBe('100')
    expect(afterElements[1].children[0].textContent).toBe('Bobby')
    expect(afterElements[2].children[1].textContent).toBe('300')
  })

  test('listFind by DOM element works with list-bound elements', async () => {
    document.body.textContent = ''

    const { domFindElTest } = tosi({
      domFindElTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Carol' },
        ],
      },
    })

    const proxiedArray = xin['domFindElTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(template(div(span({ bindText: '^.name' }))))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    // Get the second item's DOM element
    const bobEl = contentChildren(container)[1]

    // Use listFind with the DOM element
    const found = domFindElTest.items.listFind(bobEl)
    expect(found).toBeDefined()
    expect(found.name.value).toBe('Bob')
    expect(tosiPath(found)).toBe('domFindElTest.items[1]')
  })

  test('listFind by DOM child element walks up to list instance', async () => {
    document.body.textContent = ''

    const { domFindChildTest } = tosi({
      domFindChildTest: {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      },
    })

    const proxiedArray = xin['domFindChildTest.items'] as any[]
    const { div, span, template } = elements

    const container = div(template(div(span({ bindText: '^.name' }))))
    document.body.append(container)

    const lb = new ListBinding(container, proxiedArray, { idPath: 'id' })
    lb.update(proxiedArray)
    await updates()

    // Get a nested child span inside the second item
    const bobSpan = contentChildren(container)[1].querySelector('span')!

    // listFind should walk up from the span to the list instance element
    const found = domFindChildTest.items.listFind(bobSpan)
    expect(found).toBeDefined()
    expect(found.name.value).toBe('Bob')
  })

  test('listFind by unbound DOM element returns undefined', () => {
    const { domFindUnboundTest } = tosi({
      domFindUnboundTest: {
        items: [{ id: 1, name: 'Alice' }],
      },
    })

    const { div } = elements
    const randomEl = div()
    document.body.append(randomEl)

    const found = domFindUnboundTest.items.listFind(randomEl)
    expect(found).toBeUndefined()
  })
})
