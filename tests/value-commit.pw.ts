import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * Minimal repro for tosijs#21: a component whose `change` handler echoes the
 * live DOM (`input:checked`) into `this.value` — the <tosi-segmented> pattern.
 * Reported: on tosijs 1.7.7, after a real click, input.checked is correct but
 * this.value is stale by one interaction on Firefox/WebKit (Chromium fine).
 *
 * This is the interaction coverage the unit suite structurally cannot provide:
 * happy-dom has no real event loop / radio-group timing, and Chromium alone
 * masks the bug. It runs the click → change → value-commit → render round-trip
 * in every engine the lane covers.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

test('change handler committing input:checked into this.value sticks (tosijs#21)', async ({
  page,
}) => {
  await page.route('**/__tosi-test/module.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')

  await page.evaluate(async () => {
    const { Component, updates } = (await import(
      '/__tosi-test/module.js'
    )) as any

    class ValueEcho extends Component {
      static preferredTagName = 'value-echo'
      static initAttributes = { role: 'group' } // light DOM, like tosi-segmented
      value = 'yes'
      content = ({ div, label, input }: any) =>
        div(
          { part: 'options' },
          label(
            input({ type: 'radio', name: 'seg', value: 'yes' }),
            'yes'
          ),
          label(input({ type: 'radio', name: 'seg', value: 'no' }), 'no')
        )

      handleChange = () => {
        const input = (this.parts as any).options.querySelector(
          'input:checked'
        )
        this.value = input ? input.value : ''
      }

      connectedCallback() {
        super.connectedCallback()
        ;(this.parts as any).options.addEventListener(
          'change',
          this.handleChange
        )
      }

      render() {
        super.render()
        // idempotent reflect: value -> checked (post-hardening segmented style)
        ;(this.parts as any).options
          .querySelectorAll('input')
          .forEach((i: HTMLInputElement) => {
            i.checked = i.value === this.value
          })
      }
    }
    ValueEcho.elementCreator()
    const el = new ValueEcho()
    el.id = 'echo'
    document.body.append(el)
    await updates()
    ;(window as any).__updates = updates
  })

  // real user click on the "no" segment
  await page.click('#echo label:has-text("no")')
  await page.evaluate(() => (window as any).__updates())
  // let any queued render (rAF) run too
  await page.waitForTimeout(100)

  const result = await page.evaluate(() => {
    const el = document.getElementById('echo') as any
    return {
      value: el.value,
      checked: Array.from(el.querySelectorAll('input'))
        .filter((i: any) => i.checked)
        .map((i: any) => i.value),
    }
  })

  expect(result.checked).toEqual(['no']) // native click landed
  expect(result.value).toBe('no') // the handler's commit must stick
})
