import { test, expect } from 'bun:test'
import { getCssVar } from './get-css-var'

test('getCssVar returns CSS variable value', () => {
  // Set a CSS variable on the body
  document.body.style.setProperty('--test-color', 'red')

  const value = getCssVar('--test-color')
  expect(value).toBe('red')
})

test('getCssVar handles var() syntax', () => {
  document.body.style.setProperty('--wrapped-var', 'blue')

  const value = getCssVar('var(--wrapped-var)')
  expect(value).toBe('blue')
})

test('getCssVar returns empty string for undefined variable', () => {
  const value = getCssVar('--nonexistent-variable')
  expect(value).toBe('')
})

test('getCssVar can read from a specific element', () => {
  const div = document.createElement('div')
  div.style.setProperty('--element-var', 'green')
  document.body.appendChild(div)

  const value = getCssVar('--element-var', div)
  expect(value).toBe('green')

  document.body.removeChild(div)
})
