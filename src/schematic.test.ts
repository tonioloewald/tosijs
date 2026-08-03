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

  test('root svg carries explicit width/height (intrinsic size; Firefox canvas-draw requires it)', () => {
    const svg = schematicSVG(description)
    // bbox: x 10-260 (+8 pad both sides), y 20-68 (+8 both sides)
    expect(svg).toContain('width="266"')
    expect(svg).toContain('height="64"')
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

describe('spatial scoping — within', () => {
  test('within keeps intersecting records and the viewBox IS the region', () => {
    const region = { x: 0, y: 0, width: 300, height: 60 }
    const svg = schematicSVG(description, { within: region })
    // input (10,20 200x30) and span (220,20 40x30) intersect; button at y60
    // height 8 touches the edge? y:60 vs region 0..60 — 60 < 60 false → excluded
    expect(svg).toContain('data-record="0"')
    expect(svg).toContain('data-record="1"')
    expect(svg).not.toContain('data-record="3"')
    // viewBox is the region (padded by default 8)
    expect(svg).toContain('viewBox="-8 -8 316 76"')
  })

  test('a region intersecting nothing yields the empty svg', () => {
    const svg = schematicSVG(description, {
      within: { x: 5000, y: 5000, width: 10, height: 10 },
    })
    expect(svg).toContain('viewBox="0 0 0 0"')
  })
})

describe('containment-aware captions', () => {
  test('a container box gets no text-derived caption — its children speak', () => {
    const nested: AgentDescription = {
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [
        {
          tag: 'ul',
          text: 'alpha beta', // concatenated child text — must NOT render
          bounds: { x: 0, y: 0, width: 200, height: 100 },
        },
        {
          tag: 'span',
          text: 'alpha',
          bounds: { x: 10, y: 10, width: 80, height: 20 },
        },
        {
          tag: 'span',
          text: 'beta',
          bounds: { x: 10, y: 40, width: 80, height: 20 },
        },
      ],
    }
    const svg = schematicSVG(nested)
    expect(svg).not.toContain('alpha beta')
    expect(svg).toContain('>alpha</text>')
    expect(svg).toContain('>beta</text>')
  })

  test('a container with an explicit label keeps it', () => {
    const labeled: AgentDescription = {
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [
        {
          tag: 'ul',
          label: 'todo list',
          text: 'alpha',
          bounds: { x: 0, y: 0, width: 200, height: 100 },
        },
        {
          tag: 'span',
          text: 'alpha',
          bounds: { x: 10, y: 10, width: 80, height: 20 },
        },
      ],
    }
    const svg = schematicSVG(labeled)
    expect(svg).toContain('todo list')
  })
})
