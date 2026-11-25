import { test, expect } from 'bun:test'
import { camelToKabob, kabobToCamel } from './string-case'

test('camelToKabob works', () => {
  expect(camelToKabob('aBc')).toBe('a-bc')
  expect(camelToKabob('a-bc')).toBe('a-bc')
  expect(camelToKabob('testHTML')).toBe('test-h-t-m-l')
  expect(camelToKabob('testHtml')).toBe('test-html')
  expect(camelToKabob('h2Scale')).toBe('h2-scale')
})

test('kabobToCamel works', () => {
  expect(kabobToCamel('aBc')).toBe('aBc')
  expect(kabobToCamel('a-bc')).toBe('aBc')
})

/*
 * 1.10.13 (#4239). Both functions used the toLocale* methods, which follow the
 * browser's language. In Turkish and Azerbaijani `I` lower-cases to dotless
 * `ı` and `i` upper-cases to dotted `İ`, so every CSS property, attribute and
 * tag name containing that letter was corrupted (Firefox and Safari; all
 * versions to 1.10.12).
 *
 * No unit environment runs in a Turkish locale, so this makes the argument-less
 * toLocale* methods answer the way a Turkish browser does, using the engine's
 * own Turkish mapping. tests/locale-case.pw.ts asks real browsers.
 */
const asInTurkish = async <T>(fn: () => T | Promise<T>): Promise<T> => {
  const proto = String.prototype as any
  const { toLocaleLowerCase, toLocaleUpperCase } = proto
  proto.toLocaleLowerCase = function (this: string) {
    return toLocaleLowerCase.call(this, 'tr')
  }
  proto.toLocaleUpperCase = function (this: string) {
    return toLocaleUpperCase.call(this, 'tr')
  }
  try {
    return await fn()
  } finally {
    proto.toLocaleLowerCase = toLocaleLowerCase
    proto.toLocaleUpperCase = toLocaleUpperCase
  }
}

test('the emulation bites: a locale-following conversion goes wrong under it', async () => {
  // otherwise every assertion below could pass for the wrong reason
  expect(await asInTurkish(() => 'I'.toLocaleLowerCase())).toBe('ı')
  expect(await asInTurkish(() => 'i'.toLocaleUpperCase())).toBe('İ')
  expect('I'.toLocaleLowerCase()).toBe('i') // and it is undone afterwards
})

test('case conversion does not follow the locale', async () => {
  await asInTurkish(() => {
    expect(camelToKabob('alignItems')).toBe('align-items')
    expect(camelToKabob('zIndex')).toBe('z-index')
    expect(camelToKabob('TosiInfoIcon')).toBe('-tosi-info-icon')
    expect(kabobToCamel('max-items')).toBe('maxItems')
    expect(kabobToCamel('aria-invalid')).toBe('ariaInvalid')
  })
})

test('css(), elements and Component are locale-independent', async () => {
  const { css } = await import('./css')
  const { elements } = await import('./elements')
  const { Component } = await import('./component')
  await asInTurkish(() => {
    // the unitless table is keyed by the kebab name, so a corrupted name also
    // turned `z-index: 2` into `2px`
    const sheet = css({
      '.x': { alignItems: 'center', zIndex: 2, backgroundImage: 'none' },
    })
    expect(sheet).toContain('align-items: center;')
    expect(sheet).toContain('z-index: 2;')
    expect(sheet).toContain('background-image: none;')
    expect(sheet).not.toContain('ı')

    expect(elements.myInput().tagName).toBe('MY-INPUT')

    // tag derived from the class name, and an attribute with an `I` in it
    class LocaleInfoIcon extends Component {
      static initAttributes = { maxItems: 3 }
    }
    const creator = LocaleInfoIcon.elementCreator()
    expect((LocaleInfoIcon as any)._tagName).toBe('locale-info-icon')
    expect((LocaleInfoIcon as any).observedAttributes).toContain('max-items')
    const el = creator({ maxItems: 7 } as any) as any
    expect(el.tagName).toBe('LOCALE-INFO-ICON')
    expect(el.instanceId).toMatch(/^locale-info-icon-\d+$/)
    document.body.append(el)
    expect(el.getAttribute('max-items')).toBe('7')
    el.setAttribute('max-items', '9')
    expect(el.maxItems).toBe(9)
    el.remove()
  })
})

// The fix is two method names, so the guard is the absence of the other two.
// Doc blocks are excluded: their examples lower-case search TEXT, which is the
// one job the locale-following methods are for.
test('library code never case-converts by locale', async () => {
  const { readdirSync, readFileSync } = await import('fs')
  const { join } = await import('path')
  const offenders: string[] = []
  for (const file of readdirSync(__dirname)) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue
    const code = readFileSync(join(__dirname, file), 'utf-8').replace(
      /\/\*#[\s\S]*?\*\//g,
      ''
    )
    code.split('\n').forEach((line, i) => {
      // a comment may name the methods; a call may not
      if (/\.toLocale(Lower|Upper)Case\(/.test(line))
        offenders.push(`${file}: ${line.trim()} (line ${i + 1} of the code)`)
    })
  }
  expect(offenders).toEqual([])
})
