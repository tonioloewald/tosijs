import { test, expect } from 'bun:test'
import { camelToKabob, kabobToCamel } from './string-case'
import {
  initVars,
  vars,
  css,
  varDefault,
  invertLuminance,
  processProp,
} from './css'
import { Color } from './color'

test('camelToKabob works', () => {
  expect(camelToKabob('x')).toBe('x')
  expect(camelToKabob('X')).toBe('-x')
  expect(camelToKabob('thisIsATest')).toBe('this-is-a-test')
  expect(camelToKabob('hello world')).toBe('hello world')
  expect(camelToKabob('innerHTML')).toBe('inner-h-t-m-l')
  expect(camelToKabob('InnerHTML')).toBe('-inner-h-t-m-l')
  expect(camelToKabob('_thisIsATest')).toBe('_this-is-a-test')
  expect(camelToKabob('__thisIsATest')).toBe('__this-is-a-test')
})

test('kabobToCamel works', () => {
  expect(kabobToCamel('-a')).toBe('A')
  expect(kabobToCamel('a')).toBe('a')
  expect(kabobToCamel('this-is-a-test')).toBe('thisIsATest')
  expect(kabobToCamel('-wabbit-season')).toBe('WabbitSeason')
  expect(kabobToCamel('-inner-h-t-m-l')).toBe('InnerHTML')
  expect(kabobToCamel('inner-h-t-m-l')).toBe('innerHTML')
})

test('vars works', () => {
  expect(vars.foo).toBe('var(--foo)')
  expect(vars.fooBar).toBe('var(--foo-bar)')
  expect(vars.fooBar50).toBe('calc(var(--foo-bar) * 0.5)')
  expect(vars.fooBar_50).toBe('calc(var(--foo-bar) * -0.5)')
  expect(vars.h2Scale).toBe('var(--h2-scale)')
  expect(vars.h2FontSize80).toBe('calc(var(--h2-font-size) * 0.8)')
  expect(vars.h2FontSize_50).toBe('calc(var(--h2-font-size) * -0.5)')
})

test('initVars works', () => {
  expect(
    initVars({
      foo: 17,
    })['--foo']
  ).toBe('17px')
})

const cssText = `:root {
  --foo: 17px;
  --foo-width: 666px;
}

bar {
  baz-lurman: calc(var(--foo-bar) * 0.75);
  cohen-bros: calc(var(--fargo) * -1);
}`

test('css works', () => {
  expect(
    css({
      ':root': initVars({
        foo: 17,
        fooWidth: 666,
      }),
      bar: {
        bazLurman: vars.fooBar75,
        cohenBros: vars.fargo_100,
      },
    })
  ).toBe(cssText)
})

test('varDefault Works', () => {
  expect(varDefault.fooBar('50px')).toBe('var(--foo-bar, 50px)')
})

test('vars.default Works', () => {
  expect(vars.default.barBaz('#f00')).toBe('var(--bar-baz, #f00)')
})

test('vars color manipulation - brighten (b)', () => {
  const result = vars.brandColor50b
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color50b)')
})

test('vars color manipulation - darken (negative b)', () => {
  const result = vars.brandColor_50b
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color_50b)')
})

test('vars color manipulation - saturate (s)', () => {
  const result = vars.brandColor50s
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color50s)')
})

test('vars color manipulation - desaturate (negative s)', () => {
  const result = vars.brandColor_50s
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color_50s)')
})

test('vars color manipulation - hue rotation (h)', () => {
  const result = vars.brandColor50h
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color50h)')
})

test('vars color manipulation - opacity (o)', () => {
  const result = vars.brandColor50o
  // Now returns CSS variable reference, Color computes the actual value
  expect(result).toBe('var(--brand-color50o)')
})

test('vars throws for unrecognized method', () => {
  expect(() => vars.brandColor50x).toThrow('Unrecognized method x')
})

test('processProp handles numeric values without px for special props', () => {
  const result = processProp('z-index', 100)
  expect(result.value).toBe('100')
})

test('processProp adds px to numeric values for regular props', () => {
  const result = processProp('width', 100)
  expect(result.value).toBe('100px')
})

test('processProp handles _ prefix for CSS variables', () => {
  const result = processProp('_myVar', 'red')
  expect(result.prop).toBe('--myVar')
  expect(result.value).toBe('red')
})

test('processProp handles __ prefix for CSS variables with default', () => {
  const result = processProp('__myVar', 'blue')
  expect(result.prop).toBe('--myVar')
  expect(result.value).toBe('var(--myVar-default, blue)')
})

test('css handles @import', () => {
  const result = css({
    '@import': 'https://example.com/styles.css',
  })
  expect(result).toBe("@import url('https://example.com/styles.css');")
})

test('css throws for non-@import string values', () => {
  expect(() =>
    css({
      '.foo': 'invalid string' as any,
    })
  ).toThrow('top-level string value only allowed for `@import`')
})

test('css handles nested rules (media queries)', () => {
  const result = css({
    '@media (min-width: 768px)': {
      '.container': {
        width: 750,
      },
    },
  })
  expect(result).toContain('@media (min-width: 768px)')
  expect(result).toContain('.container')
  expect(result).toContain('width: 750px')
})

test('css handles Color values', () => {
  const red = new Color(255, 0, 0)
  const result = css({
    '.red': {
      color: red,
    },
  })
  expect(result).toContain('color:')
  expect(result).toContain('#ff0000')
})

test('invertLuminance inverts Color values', () => {
  const red = new Color(255, 0, 0)
  const result = invertLuminance({
    primary: red,
  })
  expect(result.primary).toBeInstanceOf(Color)
})

test('invertLuminance inverts hex color strings', () => {
  const result = invertLuminance({
    primary: '#ff0000',
  })
  expect(result.primary).toBeInstanceOf(Color)
})

test('invertLuminance inverts rgb() color strings', () => {
  const result = invertLuminance({
    primary: 'rgb(255, 0, 0)',
  })
  expect(result.primary).toBeInstanceOf(Color)
})

test('invertLuminance inverts hsl() color strings', () => {
  const result = invertLuminance({
    primary: 'hsl(0, 100%, 50%)',
  })
  expect(result.primary).toBeInstanceOf(Color)
})

test('invertLuminance ignores non-color values', () => {
  const result = invertLuminance({
    width: '100px',
    color: '#ff0000',
  })
  expect(result.width).toBeUndefined()
  expect(result.color).toBeInstanceOf(Color)
})

// Observant StyleSheet tests
import { StyleSheet, onStylesheetChange } from './css'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'

test('StyleSheet creates style element with id', () => {
  StyleSheet('test-static-stylesheet', {
    '.test': { color: 'red' },
  })
  const el = document.getElementById('test-static-stylesheet')
  expect(el).not.toBeNull()
  expect(el?.tagName.toLowerCase()).toBe('style')
  expect(el?.textContent).toContain('color: red')
  el?.remove()
})

test('StyleSheet with proxy is observant', async () => {
  const { theme } = tosi({
    theme: {
      body: { color: 'blue' },
    },
  })

  StyleSheet('test-observant-stylesheet', theme)
  const el = document.getElementById('test-observant-stylesheet')
  expect(el).not.toBeNull()
  expect(el?.textContent).toContain('color: blue')

  // Change the proxy value
  theme.body.color = 'green'
  await updates()

  // Stylesheet should have been updated
  expect(el?.textContent).toContain('color: green')
  el?.remove()
})

test('onStylesheetChange notifies when observant stylesheet updates', async () => {
  const { notifyTheme } = tosi({
    notifyTheme: {
      body: { background: 'white' },
    },
  })

  let notified = false
  const unsubscribe = onStylesheetChange(() => {
    notified = true
  })

  StyleSheet('test-notify-stylesheet', notifyTheme)
  const el = document.getElementById('test-notify-stylesheet')

  // Change triggers notification
  notifyTheme.body.background = 'black'
  await updates()

  expect(notified).toBe(true)

  unsubscribe()
  el?.remove()
})

test('Color.registerComputedColor registers computed color variables', () => {
  // Access a computed color variable
  const ref = vars.testColor50b
  expect(ref).toBe('var(--test-color50b)')

  // Color should have registered this for computation
  // (We can't easily test the internal state, but the reference format is correct)
})
