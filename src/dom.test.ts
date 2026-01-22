import { test, expect, describe } from 'bun:test'
import {
  dispatch,
  setValue,
  getValue,
  appendContentToElement,
  resizeObserver,
} from './dom'

describe('dispatch', () => {
  test('dispatches custom event to element', () => {
    const element = document.createElement('div')
    let eventReceived = false

    element.addEventListener('custom-event', () => {
      eventReceived = true
    })

    dispatch(element, 'custom-event')
    expect(eventReceived).toBe(true)
  })
})

describe('setValue', () => {
  test('sets value on text input', () => {
    const input = document.createElement('input')
    input.type = 'text'
    setValue(input, 'hello')
    expect(input.value).toBe('hello')
  })

  test('sets checked on checkbox', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'

    setValue(checkbox, true)
    expect(checkbox.checked).toBe(true)

    setValue(checkbox, false)
    expect(checkbox.checked).toBe(false)
  })

  test('sets checked on radio based on value match', () => {
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.value = 'option1'

    setValue(radio, 'option1')
    expect(radio.checked).toBe(true)

    setValue(radio, 'option2')
    expect(radio.checked).toBe(false)
  })

  test('sets value on textarea', () => {
    const textarea = document.createElement('textarea')
    setValue(textarea, 'multi\nline\ntext')
    expect(textarea.value).toBe('multi\nline\ntext')
  })

  test('sets valueAsDate on date input', () => {
    const dateInput = document.createElement('input')
    dateInput.type = 'date'
    const testDate = '2024-01-15'
    setValue(dateInput, testDate)
    expect(dateInput.valueAsDate).toBeInstanceOf(Date)
  })

  test('sets selected options on multi-select', () => {
    const select = document.createElement('select')
    select.setAttribute('multiple', '')

    const opt1 = document.createElement('option')
    opt1.value = 'a'
    const opt2 = document.createElement('option')
    opt2.value = 'b'
    const opt3 = document.createElement('option')
    opt3.value = 'c'

    select.append(opt1, opt2, opt3)

    setValue(select, { a: true, b: false, c: true })

    expect(opt1.selected).toBe(true)
    expect(opt2.selected).toBe(false)
    expect(opt3.selected).toBe(true)
  })
})

describe('getValue', () => {
  test('gets value from text input', () => {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = 'test value'
    expect(getValue(input)).toBe('test value')
  })

  test('gets checked state from checkbox', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'

    checkbox.checked = true
    expect(getValue(checkbox)).toBe(true)

    checkbox.checked = false
    expect(getValue(checkbox)).toBe(false)
  })

  test('gets value from selected radio in group', () => {
    const container = document.createElement('div')
    const radio1 = document.createElement('input')
    radio1.type = 'radio'
    radio1.name = 'group'
    radio1.value = 'option1'

    const radio2 = document.createElement('input')
    radio2.type = 'radio'
    radio2.name = 'group'
    radio2.value = 'option2'

    container.append(radio1, radio2)
    document.body.append(container)

    radio2.checked = true
    expect(getValue(radio1)).toBe('option2')

    container.remove()
  })

  test('returns null for unchecked radio group', () => {
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.name = 'unchecked-group'
    radio.value = 'option1'

    expect(getValue(radio)).toBe(null)
  })

  test('gets value from textarea', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'textarea content'
    expect(getValue(textarea)).toBe('textarea content')
  })

  test('gets selected options from multi-select', () => {
    const select = document.createElement('select')
    select.setAttribute('multiple', '')

    const opt1 = document.createElement('option')
    opt1.value = 'a'
    opt1.selected = true
    const opt2 = document.createElement('option')
    opt2.value = 'b'
    opt2.selected = false
    const opt3 = document.createElement('option')
    opt3.value = 'c'
    opt3.selected = true

    select.append(opt1, opt2, opt3)

    const value = getValue(select)
    expect(value).toEqual({ a: true, b: false, c: true })
  })

  test('gets value from single select', () => {
    const select = document.createElement('select')
    const opt1 = document.createElement('option')
    opt1.value = 'first'
    const opt2 = document.createElement('option')
    opt2.value = 'second'
    opt2.selected = true

    select.append(opt1, opt2)

    expect(getValue(select)).toBe('second')
  })

  test('gets ISO string from date input', () => {
    const dateInput = document.createElement('input')
    dateInput.type = 'date'
    dateInput.valueAsDate = new Date('2024-01-15T00:00:00.000Z')
    const value = getValue(dateInput)
    expect(value).toContain('2024-01-15')
  })
})

describe('appendContentToElement', () => {
  test('appends string as textContent', () => {
    const element = document.createElement('div')
    appendContentToElement(element, 'hello world')
    expect(element.textContent).toBe('hello world')
  })

  test('appends single element', () => {
    const container = document.createElement('div')
    const child = document.createElement('span')
    child.textContent = 'child'

    appendContentToElement(container, child)

    expect(container.children.length).toBe(1)
    expect(container.children[0].tagName).toBe('SPAN')
  })

  test('appends array of elements', () => {
    const container = document.createElement('div')
    const child1 = document.createElement('span')
    const child2 = document.createElement('p')

    appendContentToElement(container, [child1, child2])

    expect(container.children.length).toBe(2)
  })

  test('handles null element gracefully', () => {
    expect(() => appendContentToElement(null, 'content')).not.toThrow()
  })

  test('handles null content gracefully', () => {
    const element = document.createElement('div')
    expect(() => appendContentToElement(element, null)).not.toThrow()
  })

  test('clones elements by default', () => {
    const container = document.createElement('div')
    const child = document.createElement('span')
    child.textContent = 'original'

    appendContentToElement(container, child, true)

    expect(container.children[0]).not.toBe(child)
    expect(container.children[0].textContent).toBe('original')
  })

  test('does not clone when cloneElements is false', () => {
    const container = document.createElement('div')
    const child = document.createElement('span')

    appendContentToElement(container, child, false)

    expect(container.children[0]).toBe(child)
  })

  test('throws for invalid content type', () => {
    const container = document.createElement('div')
    expect(() => {
      // @ts-expect-error testing invalid input
      appendContentToElement(container, { invalid: 'object' })
    }).toThrow('expect text content or document node')
  })
})

describe('resizeObserver', () => {
  test('resizeObserver has observe and unobserve methods', () => {
    expect(typeof resizeObserver.observe).toBe('function')
    expect(typeof resizeObserver.unobserve).toBe('function')
  })

  test('resizeObserver can observe an element', () => {
    const element = document.createElement('div')
    document.body.append(element)

    // Should not throw
    expect(() => resizeObserver.observe(element)).not.toThrow()
    expect(() => resizeObserver.unobserve(element)).not.toThrow()

    element.remove()
  })
})
