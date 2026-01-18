import { test, expect, describe } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements } from './elements'
import { updates } from './path-listener'
import { bindings } from './bindings'

// Initialize a proxy first to ensure proper module loading order
const { _testState } = tosi({ _testState: {} })

describe('bindings.value', () => {
  test('toDOM sets input value', () => {
    const input = document.createElement('input')
    bindings.value.toDOM!(input, 'test value')
    expect(input.value).toBe('test value')
  })

  test('toDOM sets checkbox checked state', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'

    bindings.value.toDOM!(checkbox, true)
    expect(checkbox.checked).toBe(true)

    bindings.value.toDOM!(checkbox, false)
    expect(checkbox.checked).toBe(false)
  })

  test('fromDOM gets input value', () => {
    const input = document.createElement('input')
    input.value = 'from input'
    expect(bindings.value.fromDOM!(input)).toBe('from input')
  })

  test('fromDOM gets checkbox checked state', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = true
    expect(bindings.value.fromDOM!(checkbox)).toBe(true)
  })
})

describe('bindings.text', () => {
  test('toDOM sets textContent', () => {
    const element = document.createElement('div')
    bindings.text.toDOM!(element, 'hello world')
    expect(element.textContent).toBe('hello world')
  })

  test('toDOM handles numbers', () => {
    const element = document.createElement('span')
    bindings.text.toDOM!(element, 42)
    expect(element.textContent).toBe('42')
  })

  test('toDOM handles empty string', () => {
    const element = document.createElement('p')
    element.textContent = 'original'
    bindings.text.toDOM!(element, '')
    expect(element.textContent).toBe('')
  })
})

describe('bindings.enabled', () => {
  test('toDOM enables element when truthy', () => {
    const button = document.createElement('button') as HTMLButtonElement
    button.disabled = true

    bindings.enabled.toDOM!(button, true)
    expect(button.disabled).toBe(false)

    bindings.enabled.toDOM!(button, 'truthy string')
    expect(button.disabled).toBe(false)

    bindings.enabled.toDOM!(button, 1)
    expect(button.disabled).toBe(false)
  })

  test('toDOM disables element when falsy', () => {
    const button = document.createElement('button') as HTMLButtonElement
    button.disabled = false

    bindings.enabled.toDOM!(button, false)
    expect(button.disabled).toBe(true)

    bindings.enabled.toDOM!(button, null)
    expect(button.disabled).toBe(true)

    bindings.enabled.toDOM!(button, 0)
    expect(button.disabled).toBe(true)

    bindings.enabled.toDOM!(button, '')
    expect(button.disabled).toBe(true)
  })
})

describe('bindings.disabled', () => {
  test('toDOM disables element when truthy', () => {
    const input = document.createElement('input') as HTMLInputElement
    input.disabled = false

    bindings.disabled.toDOM!(input, true)
    expect(input.disabled).toBe(true)

    bindings.disabled.toDOM!(input, 'truthy')
    expect(input.disabled).toBe(true)
  })

  test('toDOM enables element when falsy', () => {
    const input = document.createElement('input') as HTMLInputElement
    input.disabled = true

    bindings.disabled.toDOM!(input, false)
    expect(input.disabled).toBe(false)

    bindings.disabled.toDOM!(input, null)
    expect(input.disabled).toBe(false)

    bindings.disabled.toDOM!(input, 0)
    expect(input.disabled).toBe(false)
  })
})

describe('bindings.list', () => {
  test('exists and has toDOM', () => {
    expect(bindings.list).toBeDefined()
    expect(bindings.list.toDOM).toBeDefined()
  })

  test('creates list items from array', async () => {
    const { listTest } = tosi({
      listTest: {
        items: ['apple', 'banana', 'cherry'],
      },
    })

    const { ul, li, template } = elements
    const list = ul(template(li()))

    document.body.append(list)
    bindings.list.toDOM!(list, listTest.items.valueOf() as string[])

    await updates()
    const items = list.querySelectorAll('li')
    expect(items.length).toBe(3)
  })
})
