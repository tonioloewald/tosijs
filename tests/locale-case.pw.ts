import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * Case conversion in a TURKISH browser (#4239).
 *
 * `camelToKabob` and `kabobToCamel` used the toLocale* string methods, which
 * follow the browser's language. In Turkish and Azerbaijani `I` lower-cases to
 * dotless `ı` and `i` upper-cases to dotted `İ`, so every CSS property,
 * attribute and tag name with that letter in it was corrupted: `alignItems`
 * became `align-ıtems`, `elements.myInput()` made `<my-ınput>`, and a
 * `maxItems` attribute was observed as `max-ıtems`, so markup never reached it.
 * Every release to 1.10.12.
 *
 * No unit environment has a locale, so the unit suite can only emulate this
 * (src/string-case.test.ts). Here real engines run with `locale: 'tr-TR'`.
 *
 * Firefox and WebKit apply the emulated locale to case mapping. Chromium does
 * not (neither does launching it with --lang=tr), so on Chromium this spec
 * cannot see the defect and SKIPS rather than pass over nothing. Whether a
 * Chrome on a Turkish operating system was affected is unverified.
 */

test.use({ locale: 'tr-TR' })

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

test('identifiers are converted the same way in a Turkish locale', async ({
  page,
  browserName,
}) => {
  await page.route('**/__tosi-test/module.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')

  // the control: does this engine's case mapping follow the locale at all?
  const dotless = await page.evaluate(() => 'I'.toLocaleLowerCase())
  if (browserName === 'chromium') {
    test.skip(
      dotless !== 'ı',
      'Chromium does not apply the emulated locale to case mapping'
    )
  } else {
    // if this ever stops holding, the assertions below prove nothing
    expect(dotless).toBe('ı')
  }

  const result = await page.evaluate(async () => {
    const { css, elements, Component } = await import('/__tosi-test/module.js')

    const sheet: string = css({
      '.x': {
        alignItems: 'center',
        zIndex: 2,
        backgroundImage: 'none',
        marginInline: 4,
      },
    })

    const made = elements.myInput()

    // no preferredTagName: the tag is derived from the class name
    class TosiInfoIcon extends Component {
      static initAttributes = { maxItems: 3 }
    }
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: unknown[]) => warnings.push(args.join(' '))
    const creator = TosiInfoIcon.elementCreator()
    console.warn = original

    const holder = document.createElement('div')
    document.body.append(holder)
    holder.innerHTML = '<tosi-info-icon max-items="7"></tosi-info-icon>'
    const fromMarkup = holder.firstElementChild as any
    const fromCreator = creator() as any
    holder.append(fromCreator)
    fromCreator.maxItems = 9
    await new Promise((resolve) => setTimeout(resolve, 50))

    const out = {
      sheet,
      madeTag: made.localName,
      derivedTag: fromCreator.localName,
      warnings,
      observed: (TosiInfoIcon as any).observedAttributes as string[],
      markupUpgraded: fromMarkup instanceof TosiInfoIcon,
      markupValue: fromMarkup.maxItems,
      attributesAfterWrite: fromCreator.getAttributeNames() as string[],
      instanceId: fromCreator.instanceId as string,
    }
    holder.remove()
    return out
  })

  expect(result.sheet).toContain('align-items: center;')
  expect(result.sheet).toContain('z-index: 2;') // and not "2px"
  expect(result.sheet).toContain('background-image: none;')
  expect(result.sheet).toContain('margin-inline: 4px;')
  expect(result.sheet).not.toContain('ı')

  expect(result.madeTag).toBe('my-input')

  expect(result.derivedTag).toBe('tosi-info-icon')
  expect(result.warnings).toEqual([])
  expect(result.observed).toContain('max-items')
  expect(result.markupUpgraded).toBe(true)
  expect(result.markupValue).toBe(7)
  expect(result.attributesAfterWrite).toContain('max-items')
  expect(result.attributesAfterWrite.join(' ')).not.toContain('ı')
  expect(result.instanceId).toMatch(/^tosi-info-icon-\d+$/)
})
