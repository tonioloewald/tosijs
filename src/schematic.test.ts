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
    // the input HOLDS a value — name and value both speak: "label: value" —
    // and editability is a SEPARATE right-edge ↔ badge (rasterizer-safe)
    expect(svg).toContain('filter stock…: milk</text>')
    expect(svg).toContain('>↔</text>')
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

describe('viewport-fixed furniture', () => {
  test('pinned records neither stretch the viewBox nor sit mid-document', () => {
    const withChrome: AgentDescription = {
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [
        {
          tag: 'input',
          text: 'content',
          bounds: { x: 100, y: 5000, width: 200, height: 30 },
        },
        {
          tag: 'nav',
          label: 'site nav',
          viewportFixed: true,
          bounds: { x: 0, y: 0, width: 180, height: 400 },
        },
      ],
    }
    const svg = schematicSVG(withChrome)
    // viewBox fits the FLOW content only (y around 5000), not the nav
    expect(svg).toContain('viewBox="92 4992 216 46"')
    // the nav is pinned at the map origin (min + pad), not at page 0,0
    expect(svg).toContain('<rect x="100" y="5000"')
  })
})

describe('off-page hiding', () => {
  test('fully negative-coordinate records are excluded — hidden is hidden', () => {
    const stashed: AgentDescription = {
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [
        {
          tag: 'input',
          text: 'visible',
          bounds: { x: 10, y: 10, width: 100, height: 30 },
        },
        {
          tag: 'button',
          text: 'stashed off-page',
          bounds: { x: 400, y: -1358, width: 90, height: 36 },
        },
      ],
    }
    const svg = schematicSVG(stashed)
    expect(svg).not.toContain('stashed off-page')
    expect(svg).toContain('viewBox="2 2 116 46"') // fits the visible box only
  })
})

describe('the affordance grammar — actionable is explicit', () => {
  test('handler-wired elements get a bold outline; editable boxes wear the badge', () => {
    const grammar: AgentDescription = {
      exposure: 'introspection',
      roots: {},
      actions: [],
      wiring: [
        {
          tag: 'input',
          label: 'add a todo…', // label hides the bound-value arrow…
          value: ' ⟷ app.newItem',
          bounds: { x: 0, y: 0, width: 200, height: 30 },
        },
        {
          tag: 'button',
          text: 'add',
          on: { click: 'app.addItem' },
          bounds: { x: 210, y: 0, width: 60, height: 30 },
        },
        {
          tag: 'span',
          text: '3 ⟵ app.total', // display-only: no bold, no suffix
          bounds: { x: 280, y: 0, width: 40, height: 30 },
        },
      ],
    }
    const svg = schematicSVG(grammar)
    // …so the ↔ badge carries it: editable is explicit, and isolated in its
    // own text run so a font missing it can only tofu the badge itself
    expect(svg).toContain('add a todo…</text>')
    expect(svg).toContain('>↔</text>')
    expect(svg).not.toContain('⟷</text>') // the rare glyph never rides a caption
    // the wired button is BOLD; the display-only span is not
    expect(svg).toContain('x="210" y="0" width="60" height="30" fill="transparent" stroke="currentColor" stroke-width="2"')
    expect(svg).toContain('x="280" y="0" width="40" height="30" fill="transparent" stroke="currentColor"/>')
  })
})

// ---------------------------------------------------------------------------
// the kitchen-sink truths: control state must RENDER, hints must not read as
// content, and the raster can carry its own legend
describe('schematicSVG — control-state truth', () => {
  const bounds = (x: number) => ({ x, y: 10, width: 120, height: 24 })
  const sink: any = {
    roots: {},
    actions: [],
    exposure: 'introspection',
    wiring: [
      // checkbox: checked and not — the state is the caption
      { tag: 'input', type: 'checkbox', checked: true, value: 'true ⟷ a.on', bounds: { x: 10, y: 10, width: 13, height: 13 } },
      { tag: 'input', type: 'checkbox', checked: false, bounds: { x: 30, y: 10, width: 13, height: 13 } },
      // radios
      { tag: 'input', type: 'radio', checked: true, label: 'medium', bounds: bounds(150) },
      { tag: 'input', type: 'radio', checked: false, label: 'large', bounds: bounds(280) },
      // empty input with placeholder: an italic HINT, not content
      { tag: 'input', placeholder: 'add a todo…', value: '⟷ a.newItem', bounds: bounds(410) },
      // input with BOTH: the value wins
      { tag: 'input', placeholder: 'search…', value: 'milk ⟷ a.filter', bounds: bounds(540) },
      // unbound input harvested live (plain string, no arrow)
      { tag: 'input', value: 'typed by hand', bounds: bounds(670) },
    ],
  }

  test('toggle state is GEOMETRY: ✕ in the checked box, dot in the checked radio', () => {
    const svg = schematicSVG(sink)
    // the checked checkbox draws an ✕ (two lines); the unchecked one none
    expect(svg.match(/<line /g)!.length).toBe(2)
    // radios are circles: two outlines, ONE filled dot (the checked one)
    expect(svg.match(/<circle /g)!.length).toBe(3)
    // toggle labels sit to the right of the control, not inside it
    expect(svg).toContain('>medium</text>')
    expect(svg).toContain('>large</text>')
    // the radio rows draw no <rect> boxes — the circle IS the control
    expect(svg).not.toContain('<rect x="150"')
  })

  test('placeholder renders as an italic hint; a held value beats it', () => {
    const svg = schematicSVG(sink)
    expect(svg).toContain('font-style="italic"')
    expect(svg).toContain('add a todo…')
    expect(svg).toContain('milk</text>')
    expect(svg).not.toContain('search…') // value present — hint suppressed
    expect(svg).toContain('typed by hand') // live unbound value surfaces
  })

  test('index: true stamps each box with its wiring index — image as legend', () => {
    const svg = schematicSVG(sink, { index: true })
    for (let i = 0; i < sink.wiring.length; i++) {
      expect(svg).toContain(`data-record="${i}"`)
    }
    // one backdropped digit per record (the ↔ badge also anchors end, so
    // count the backdrops — white, mostly opaque, always legible)
    expect(svg.match(/data-index-backdrop/g)!.length).toBe(sink.wiring.length)
  })
})

describe('focus — where the user is', () => {
  test('a focused record draws a second outline just outside its box', () => {
    const focusMap: any = {
      roots: {},
      actions: [],
      exposure: 'introspection',
      wiring: [
        {
          tag: 'input',
          focused: true,
          value: '⟷ a.q',
          bounds: { x: 10, y: 10, width: 100, height: 24 },
        },
        {
          tag: 'input',
          value: '⟷ a.r',
          bounds: { x: 10, y: 50, width: 100, height: 24 },
        },
      ],
    }
    const svg = schematicSVG(focusMap)
    // the ring: offset 2.5px out, 5px larger, unfilled
    expect(svg).toContain('<rect x="7.5" y="7.5" width="105" height="29"')
    // exactly one ring — the unfocused input gets none
    expect(svg.match(/stroke-width="1\.5"/g)!.length).toBe(1)
  })
})

describe('list containers are ground, not figure', () => {
  test('a list-bound container draws dotted like structure — its items act', () => {
    const listMap: any = {
      roots: {},
      actions: [],
      exposure: 'introspection',
      wiring: [
        {
          tag: 'ul',
          list: { path: 'app.items', idPath: 'id' },
          bounds: { x: 0, y: 0, width: 200, height: 100 },
        },
        {
          tag: 'input',
          type: 'checkbox',
          checked: true,
          value: 'true ⟷ app.items[id=1].done',
          bounds: { x: 10, y: 10, width: 13, height: 13 },
        },
      ],
    }
    const svg = schematicSVG(listMap)
    // the ul: dotted, unfilled — wired in the JSON, ground in the drawing
    expect(svg).toContain('stroke-dasharray="1 3"')
    expect(svg).toContain('fill="none"')
    // …but a container that also HANDLES events stays a solid affordance
    listMap.wiring[0].on = { click: 'app.select' }
    const svg2 = schematicSVG(listMap)
    expect(svg2).not.toContain('stroke-dasharray')
  })
})

describe('required and invalid — the form-truth grammar', () => {
  const formMap: any = {
    roots: {},
    actions: [],
    exposure: 'introspection',
    wiring: [
      {
        tag: 'input',
        label: 'email',
        required: true,
        invalid: true,
        value: '⟷ a.email',
        bounds: { x: 10, y: 10, width: 160, height: 24 },
      },
      {
        tag: 'input',
        label: 'nickname',
        value: 'ada ⟷ a.nick',
        bounds: { x: 10, y: 50, width: 160, height: 24 },
      },
    ],
  }

  test('required wears the asterisk; invalid wears the red corner flag', () => {
    const svg = schematicSVG(formMap)
    expect(svg).toContain('email *')
    expect(svg).toContain('fill="#d32f2f"')
    expect(svg).toContain(`<path d="M10 10 l7 0 l-7 7 z"`)
    // the valid field wears neither
    expect(svg).not.toContain('nickname: ada *')
    expect(svg.match(/#d32f2f/g)!.length).toBe(1)
  })
})
