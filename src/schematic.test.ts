import { test, expect, describe } from 'bun:test'
import { schematicSVG } from './schematic'
import { AgentDescription } from './agent'

const description: AgentDescription = {
  exposure: 'introspection',
  roots: { app: 'object' },
  actions: ['app.restock'],
  wiring: [
    {
      tag: 'input',
      label: 'filter stock…',
      value: 'milk ⟷ app.filter',
      bounds: { x: 10, y: 20, width: 200, height: 30 },
      style: {
        background: 'rgb(255, 255, 255)',
        borderColor: 'rgb(128, 128, 128)',
        color: 'rgb(17, 17, 17)',
      },
    },
    {
      tag: 'span',
      text: '3 ⟵ app.total',
      bounds: { x: 220, y: 20, width: 40, height: 30 },
    },
    {
      // hidden: zero-size — must not be drawn
      tag: 'div',
      text: 'invisible',
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      tag: 'button',
      text: 'a & "b" <c>',
      on: { click: 'app.restock' },
      bounds: { x: 10, y: 60, width: 80, height: 8 }, // too short for a caption
    },
  ],
}

describe('schematicSVG — pure, DOM-free rendering of the map', () => {
  test('draws visible wired elements at their true geometry', () => {
    const svg = schematicSVG(description)
    expect(svg.startsWith('<svg xmlns=')).toBe(true)
    expect(svg).toContain('<rect x="10" y="20" width="200" height="30"')
    expect(svg).toContain('<rect x="220" y="20" width="40" height="30"')
    expect(svg).toContain('filter stock…')
  })

  test('zero-size records (hidden elements) are not drawn', () => {
    const svg = schematicSVG(description)
    expect(svg).not.toContain('invisible')
    expect(svg).not.toContain('width="0"')
  })

  test('each group indexes back into description.wiring — the image as index', () => {
    const svg = schematicSVG(description)
    expect(svg).toContain('data-record="0"')
    expect(svg).toContain('data-record="1"')
    expect(svg).toContain('data-record="3"')
    expect(svg).not.toContain('data-record="2"') // the hidden one
  })

  test('styles are worn when present, defaults when not', () => {
    const svg = schematicSVG(description)
    expect(svg).toContain('fill="rgb(255, 255, 255)"')
    expect(svg).toContain('stroke="rgb(128, 128, 128)"')
    expect(svg).toContain('stroke="currentColor"') // the unstyled span
  })

  test('captions are XML-escaped and short boxes get none', () => {
    const svg = schematicSVG(description)
    // the button box is 8px tall — below minLabelHeight — so its caption
    // (which contains XML-hostile characters) must be absent entirely
    expect(svg).not.toContain('a &amp; &quot;b&quot;')
    const tall = schematicSVG(description, { minLabelHeight: 4 })
    expect(tall).toContain('a &amp; &quot;b&quot; &lt;c&gt;')
  })

  test('empty map renders an empty svg rather than throwing', () => {
    const svg = schematicSVG({
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [],
    })
    expect(svg).toContain('<svg')
  })
})
