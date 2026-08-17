import { test, expect, describe } from 'bun:test'
import { auditAccessibility, auditFlags, contrastRatio } from './audit'
import type { AgentDescription } from './agent'

const map = (wiring: any[]): AgentDescription =>
  ({
    version: { surface: '1.0.0', tosijs: 'test', capabilities: [] },
    roots: {},
    actions: [],
    exposure: 'introspection',
    wiring,
  } as AgentDescription)

const box = (extra: any = {}) => ({
  bounds: { x: 0, y: 0, width: 100, height: 40 },
  ...extra,
})

describe('auditAccessibility — the lint the map made obvious', () => {
  test('anonymous affordance: wired, but nothing announces it', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'div', on: { click: 'app.go' } }), // nameless
        box({ tag: 'button', text: 'Save', on: { click: 'app.save' } }), // fine
      ])
    )
    const anon = report.findings.filter(
      (f) => f.rule === 'anonymous-affordance'
    )
    expect(anon.length).toBe(1)
    expect(anon[0].index).toBe(0)
    expect(anon[0].severity).toBe('error')
    expect(report.failed).toBeGreaterThan(0)
  })

  test('unnameable action: an anonymous handler is a dead end for agents', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'button', text: 'A', on: { click: 'ƒ' } }),
        box({ tag: 'button', text: 'B', on: { click: 'app.named' } }),
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'unnameable-action')
    expect(found.length).toBe(1)
    expect(found[0].record.text).toBe('A')
  })

  test('missing role: a div that acts like a control', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'div', text: 'Delete', on: { click: 'app.del' } }),
        box({
          tag: 'div',
          text: 'Delete',
          role: 'button',
          on: { click: 'app.del' },
        }),
        box({ tag: 'button', text: 'Delete', on: { click: 'app.del' } }),
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'missing-role')
    expect(found.length).toBe(1)
    expect(found[0].index).toBe(0)
  })

  test('contrast: measured with tosijs Color, and SKIPPED loudly without styles', () => {
    expect(Math.round(contrastRatio('#000', '#fff')!)).toBe(21)
    expect(contrastRatio('#777', '#fff')!).toBeLessThan(4.5)

    const styled = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'faint',
          on: { click: 'a.x' },
          style: {
            color: 'rgb(170,170,170)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    const contrast = styled.findings.filter((f) => f.rule === 'contrast')
    expect(contrast.length).toBe(1)
    expect(contrast[0].message).toContain(':1')

    // no styles in the map = the rule cannot run, and SAYS SO (a silent
    // pass would read as "no contrast problems")
    const unstyled = auditAccessibility(
      map([box({ tag: 'button', text: 'x' })])
    )
    expect(unstyled.skipped.some((s) => s.startsWith('contrast:'))).toBe(true)
  })

  test('target size honours the WCAG 2.5.8 inline exception; toggles exempt', () => {
    const report = auditAccessibility(
      map([
        {
          tag: 'button',
          on: { click: 'a.x' },
          label: 'delete',
          bounds: { x: 0, y: 0, width: 18, height: 18 },
        },
        {
          tag: 'a',
          href: '/x',
          text: 'a text link',
          bounds: { x: 0, y: 0, width: 60, height: 16 },
        },
        {
          tag: 'input',
          type: 'checkbox',
          value: 'true ⟷ a.on',
          bounds: { x: 0, y: 0, width: 13, height: 13 },
        },
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'target-size')
    expect(found.length).toBe(1)
    expect(found[0].record.tag).toBe('button')
  })

  test('a placeholder is not a label', () => {
    const report = auditAccessibility(
      map([box({ tag: 'input', placeholder: 'Email', value: '⟷ app.email' })])
    )
    expect(
      report.findings.some((f) => f.rule === 'label-hidden-by-placeholder')
    ).toBe(true)
  })

  test('a clean map audits clean; exclude turns rules off', () => {
    const clean = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'Save',
          on: { click: 'app.save' },
          style: {
            color: 'rgb(0,0,0)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    expect(clean.findings).toEqual([])
    expect(clean.failed).toBe(0)

    const noisy = map([box({ tag: 'div', on: { click: 'ƒ' } })])
    expect(auditAccessibility(noisy).failed).toBeGreaterThan(0)
    expect(
      auditAccessibility(noisy, {
        exclude: ['anonymous-affordance', 'missing-role', 'unnameable-action'],
      }).findings
    ).toEqual([])
  })

  test('auditFlags feeds the schematic — findings become drawable', () => {
    const report = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'faint',
          on: { click: 'a.x' },
          style: {
            color: 'rgb(200,200,200)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    const flags = auditFlags(report)
    expect(flags[0]).toBeDefined()
    expect(flags[0][0].kind).toBe('contrast')
    expect(flags[0][0].label).toMatch(/[\d.]+:1/)
    expect(flags[0][0].severity).toBe('error')
  })
})

describe('contrast cannot be measured through transparency (round-2 review)', () => {
  test('a transparent background is reported as unmeasurable, not as black', () => {
    const report = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'on the page background',
          on: { click: 'a.x' },
          // what getComputedStyle returns for "inherit from behind me"
          style: {
            color: 'rgb(17,17,17)',
            background: 'rgba(0, 0, 0, 0)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    // it used to score 1.11:1 and fire an ERROR on almost every element
    expect(report.findings.filter((f) => f.rule === 'contrast')).toEqual([])
    expect(report.skipped.some((s) => s.includes('transparent'))).toBe(true)
    expect(report.failed).toBe(0)
  })
})
