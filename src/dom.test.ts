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

  test('gets a Date from a date input (H-6 typed-control read)', () => {
    const dateInput = document.createElement('input')
    dateInput.type = 'date'
    dateInput.valueAsDate = new Date('2024-01-15T00:00:00.000Z')
    const value = getValue(dateInput)
    expect(value).toBeInstanceOf(Date)
    expect((value as Date).toISOString()).toContain('2024-01-15')
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

describe('typed-control reads and guards (H-6)', () => {
  test('number/range inputs read as numbers; empty reads as raw string', () => {
    const n = document.createElement('input')
    n.type = 'number'
    n.value = '42.5'
    expect(getValue(n)).toBe(42.5)
    n.value = ''
    expect(getValue(n)).toBe('') // never fabricate a number from emptiness
    const r = document.createElement('input')
    r.type = 'range'
    r.value = '7'
    expect(getValue(r)).toBe(7)
  })

  test('time inputs read as ms-since-midnight', () => {
    const t = document.createElement('input')
    t.type = 'time'
    t.value = '01:30:00'
    expect(getValue(t)).toBe(90 * 60000)
  })

  test('setValue radio: numeric state matches its string value', () => {
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.value = '5'
    setValue(radio, 5)
    expect(radio.checked).toBe(true)
    setValue(radio, 6)
    expect(radio.checked).toBe(false)
    setValue(radio, undefined)
    expect(radio.checked).toBe(false)
  })

  test('setValue renders missing values as empty, not "undefined"', () => {
    const input = document.createElement('input')
    setValue(input, undefined)
    expect(input.value).toBe('')
  })

  test('setValue date: null clears the field instead of 1970-01-01', () => {
    const d = document.createElement('input')
    d.type = 'date'
    d.value = '2026-07-18'
    setValue(d, null)
    expect(d.value).toBe('')
  })

  test('setValue date accepts Date, epoch number, and ISO string', () => {
    const d = document.createElement('input')
    d.type = 'date'
    setValue(d, new Date('2026-07-18T00:00:00Z'))
    expect(d.value).toBe('2026-07-18')
    setValue(d, Date.UTC(2025, 0, 2))
    expect(d.value).toBe('2025-01-02')
    setValue(d, '2024-03-04')
    expect(d.value).toBe('2024-03-04')
  })

  test('setValue time accepts ms-since-midnight', () => {
    const t = document.createElement('input')
    t.type = 'time'
    setValue(t, 90 * 60000)
    expect(t.value).toBe('01:30')
    setValue(t, 90 * 60000 + 5000)
    expect(t.value).toBe('01:30:05')
  })

  test('multi-select: undefined selects nothing (no throw); arrays work', () => {
    const select = document.createElement('select')
    select.setAttribute('multiple', '')
    for (const v of ['a', 'b', 'c']) {
      const o = document.createElement('option')
      o.value = v
      select.append(o)
    }
    setValue(select, undefined) // used to throw inside the observer flush
    expect(
      Array.from(select.querySelectorAll('option')).every((o) => !o.selected)
    ).toBe(true)
    setValue(select, ['a', 'c'])
    const selected = Array.from(select.querySelectorAll('option'))
      .filter((o) => o.selected)
      .map((o) => o.value)
    expect(selected).toEqual(['a', 'c'])
  })
})

describe('date-family control round-trips (post-1.7 coverage)', () => {
  test('datetime-local: setValue(Date) -> getValue Date round-trips', () => {
    const el = document.createElement('input')
    el.type = 'datetime-local'
    const d = new Date(2026, 6, 21, 14, 30) // local time
    setValue(el, d)
    const back = getValue(el)
    expect(back).toBeInstanceOf(Date)
    // datetime-local uses local fields — same wall-clock minute
    expect((back as Date).getFullYear()).toBe(2026)
    expect((back as Date).getHours()).toBe(14)
    expect((back as Date).getMinutes()).toBe(30)
  })

  test('month: setValue(Date) writes yyyy-MM; getValue returns a Date', () => {
    const el = document.createElement('input')
    el.type = 'month'
    setValue(el, new Date(Date.UTC(2026, 2, 15)))
    expect(el.value).toBe('2026-03')
    const back = getValue(el)
    // month inputs read back a Date (first of the month) or the string
    expect(back instanceof Date || back === '2026-03').toBe(true)
  })

  test('week: setValue(Date) does not throw and empty clears', () => {
    const el = document.createElement('input')
    el.type = 'week'
    expect(() => setValue(el, new Date(Date.UTC(2026, 0, 15)))).not.toThrow()
    setValue(el, null)
    expect(el.value).toBe('')
  })

  test('time: setValue(Date) uses the local clock', () => {
    const el = document.createElement('input')
    el.type = 'time'
    setValue(el, new Date(2026, 0, 1, 9, 5, 0))
    expect(el.value).toBe('09:05') // platform drops :00 seconds
    setValue(el, new Date(2026, 0, 1, 9, 5, 7))
    expect(el.value).toBe('09:05:07')
  })

  test('empty date-family control reads back the raw (empty) string', () => {
    for (const t of ['date', 'datetime-local', 'month', 'week']) {
      const el = document.createElement('input')
      el.type = t
      el.value = ''
      expect(getValue(el)).toBe('')
    }
  })
})
