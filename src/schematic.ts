/*{ "parent": "utilities", "description": "EXPERIMENTAL schematic renderer: draw an agent-surface description as SVG — the app's affordance map at its true geometry, DOM-free." }*/
/*#
# schematic (EXPERIMENTAL)

`schematicSVG(description)` renders `agent.describe()` output as an SVG
string — one rectangle per visible wired element at its **actual position and
size** (`bounds` rides in the map), captioned from the map, optionally wearing
the app's computed colors (`describe({ styles: true })`).

    import { enableAgentInterface, schematicSVG } from 'tosijs'

    const agent = enableAgentInterface()
    const svg = schematicSVG(agent.describe({ styles: true }))

It is a **pure function over plain data** — no DOM, no layout engine, no
screenshots — so it runs anywhere the description can travel: in the page, in
a headless embodiment, or on the far side of a wire from an app nobody is
viewing.

Division of labor per consumer: **JSON for text reasoning**, **rasterized
PNG for vision encoders** (rasterize the SVG at 2× so labels OCR cleanly —
canvas in a browser, `@resvg/resvg-js` under bun), **SVG for humans and
tools** (deterministic, diffable, and each `<g>` carries `data-record="<i>"`
linking it back to `description.wiring[i]` — the image as index).

> **EXPERIMENTAL.** Ships alongside the agent surface; shapes may change.
*/
import { AgentDescription, BOUND_TWO_WAY, BOUND_TO_DOM } from './agent'

export interface SchematicBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface SchematicOptions {
  /** padding around the drawn region, px (default 8) */
  pad?: number
  /** boxes shorter than this get no caption (default 14) */
  minLabelHeight?: number
  /** caption length limit (default 36) */
  maxCaption?: number
  /** caption font size, px (default 11) */
  fontSize?: number
  /**
   * Scope the map SPATIALLY: only records whose bounds intersect this
   * page-coordinate rect are drawn, and the viewBox IS the rect — the
   * schematic becomes "this region of the page". Use `boundsOf(element)`
   * to scope to an element's region; omit for the whole map.
   */
  within?: SchematicBounds
  /**
   * Stamp each box with its wiring index (top-right corner) — the raster
   * form of `data-record`: a vision consumer reads the number off the image
   * and looks the record up in `description.wiring[n]` — image as legend.
   */
  index?: boolean
}

// strip provenance from a bound-value string: "shown ⟷ path" → "shown"
// (empty when the binding holds no value yet); a plain string (no arrow)
// is a live-but-unbound value and passes through whole
const shownValue = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  for (const arrow of [BOUND_TWO_WAY, BOUND_TO_DOM]) {
    const at = v.indexOf(arrow)
    if (at >= 0) return v.slice(0, at).trim()
  }
  return v
}

/**
 * An element's page-coordinate bounds (the same space describe() records) —
 * the natural `within` argument for a region-scoped schematic.
 */
export const boundsOf = (element: Element): SchematicBounds => {
  const rect = element.getBoundingClientRect()
  return {
    x: Math.round(rect.x + ((globalThis as any).scrollX ?? 0)),
    y: Math.round(rect.y + ((globalThis as any).scrollY ?? 0)),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

const intersects = (a: SchematicBounds, b: SchematicBounds): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height

const contains = (outer: SchematicBounds, inner: SchematicBounds): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height

// string args (not regexes) — tjs convert's lexer mis-reads a quote inside a
// regex literal (/"/g) as a string opener; see tjs-lang issue
const esc = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

export const schematicSVG = (
  description: AgentDescription,
  options: SchematicOptions = {}
): string => {
  const {
    pad = 8,
    minLabelHeight = 14,
    maxCaption = 36,
    fontSize = 11,
    within,
    index: showIndex = false,
  } = options
  const boxes = description.wiring.filter(
    (w) =>
      w.bounds != null &&
      w.bounds.width > 0 &&
      w.bounds.height > 0 &&
      // fully negative coordinates = hidden by off-page positioning (the
      // spatial analog of zero-size): invisible to humans, invisible here
      (w.viewportFixed === true ||
        (w.bounds.x + w.bounds.width > 0 && w.bounds.y + w.bounds.height > 0)) &&
      (within == null ||
        w.viewportFixed === true ||
        intersects(w.bounds, within))
  )
  // viewport furniture (fixed/sticky) has viewport coordinates: it neither
  // stretches the viewBox nor sits at a page position — it gets PINNED as an
  // overlay at the map's origin, which is where it lives on screen
  const flow = boxes.filter((w) => w.viewportFixed !== true)
  if (boxes.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"></svg>'
  }
  // scoped: the viewBox IS the region; unscoped: fit the FLOW boxes (pinned
  // furniture must not stretch the map)
  const fitBoxes = flow.length > 0 ? flow : boxes
  const minX =
    within != null
      ? within.x - pad
      : Math.min(...fitBoxes.map((w) => w.bounds!.x)) - pad
  const minY =
    within != null
      ? within.y - pad
      : Math.min(...fitBoxes.map((w) => w.bounds!.y)) - pad
  const maxX =
    within != null
      ? within.x + within.width + pad
      : Math.max(...fitBoxes.map((w) => w.bounds!.x + w.bounds!.width)) + pad
  const maxY =
    within != null
      ? within.y + within.height + pad
      : Math.max(...fitBoxes.map((w) => w.bounds!.y + w.bounds!.height)) + pad

  // explicit width/height (not just viewBox): gives the svg an intrinsic
  // size as a document/img, and Firefox refuses to draw an svg image onto a
  // canvas without them — which rasterizeSVG depends on
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${
      maxX - minX
    } ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}">`,
  ]
  // structure behind affordances: dotted outlines the eye (and the raster)
  // reads as grouping, not controls. A LIST CONTAINER is ground too — it's
  // wired (the collection binds here, and the JSON record says so), but its
  // items are the affordances; drawing it solid would read as actionable.
  const ground = (w: (typeof boxes)[number]): boolean =>
    w.structural === true || (w.list != null && w.on == null)
  const drawOrder = [...boxes].sort(
    (a, b) => Number(ground(b)) - Number(ground(a))
  )
  for (const w of drawOrder) {
    const index = description.wiring.indexOf(w)
    const pinOffsetX = w.viewportFixed === true ? minX + pad : 0
    const pinOffsetY = w.viewportFixed === true ? minY + pad : 0
    const x = w.bounds!.x + pinOffsetX
    const y = w.bounds!.y + pinOffsetY
    const { width, height } = w.bounds!
    // a box that CONTAINS other drawn boxes is a container: its textContent
    // is its children's text concatenated, so a text-derived caption would
    // overprint the children's own captions — the children speak for
    // themselves. Only an explicit label earns a container a caption.
    const isContainer =
      w.viewportFixed !== true &&
      boxes.some(
        (other) =>
          other !== w &&
          other.viewportFixed !== true &&
          contains(w.bounds!, other.bounds!)
      )
    // caption truth, per control kind:
    // - checkbox/radio: the state is GEOMETRY (✕ in the box, dot in the
    //   circle — drawn below, legible at any raster scale); the caption is
    //   just the label, set to the RIGHT of the control
    // - other form controls: the live VALUE wins; an empty control falls
    //   back to its placeholder in italics (a hint must not read as content)
    // - everything else: label, then text, then value
    const toggle = w.type === 'checkbox' || w.type === 'radio'
    let caption: string
    let hint = false
    if (isContainer) {
      caption = String(w.label ?? '')
    } else if (toggle) {
      caption = String(w.label ?? '')
    } else if (
      w.tag === 'input' ||
      w.tag === 'textarea' ||
      w.tag === 'select' ||
      w.contentEditable === true
    ) {
      const value = shownValue(w.value)
      if (value) {
        // both name and value known: say both — "qty: 3"
        caption = w.label != null ? `${w.label}: ${value}` : value
      } else if (w.placeholder != null && w.placeholder !== '') {
        caption = String(w.placeholder)
        hint = true
      } else {
        caption = String(w.label ?? w.text ?? `<${w.tag}>`)
      }
    } else {
      caption = String(
        w.label ?? shownValue(w.text) ?? shownValue(w.value) ?? `<${w.tag}>`
      )
    }
    const structural = ground(w)
    // the affordance grammar, explicit: BOLD outline = wired to act (has
    // handlers); a trailing ⟷ on the caption = editable here (two-way
    // binding), added when the caption is a label that would otherwise
    // hide it. Solid = affordance, dotted = structure.
    const actable = !structural && w.on != null
    const editable =
      !structural &&
      (w.contentEditable === true ||
        Object.values(w).some(
          (v) => typeof v === 'string' && v.includes(BOUND_TWO_WAY)
        ))
    const fill = structural
      ? 'none'
      : w.style != null
        ? w.style.background
        : 'transparent'
    const stroke =
      !structural && w.style != null && w.style.borderColor !== TRANSPARENT
        ? w.style.borderColor
        : 'currentColor'
    const color = w.style != null ? w.style.color : 'currentColor'
    const emphasis = structural
      ? ' stroke-dasharray="1 3" stroke-linecap="round" opacity="0.45"'
      : w.disabled === true
        ? ' opacity="0.4"'
        : actable
          ? ' stroke-width="2"'
          : ''
    parts.push(`<g data-record="${index}">`)
    if (w.type === 'radio') {
      // a radio IS a circle — and its state is a filled dot, legible at any
      // raster scale (text glyphs are mush at 13px; geometry is not)
      const r = Math.min(width, height) / 2
      const cx = x + width / 2
      const cy = y + height / 2
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="${esc(fill)}" ` +
          `stroke="${esc(stroke)}"${emphasis}/>`
      )
      if (w.checked === true) {
        parts.push(
          `<circle cx="${cx}" cy="${cy}" r="${Math.max(2, r * 0.45)}" ` +
            `fill="${esc(color)}"/>`
        )
      }
    } else {
      parts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
          `fill="${esc(fill)}" stroke="${esc(stroke)}"${emphasis}/>`
      )
      if (w.type === 'checkbox' && w.checked === true) {
        // checked = an ✕ drawn corner to corner, inset a hair
        const inset = 3
        parts.push(
          `<line x1="${x + inset}" y1="${y + inset}" x2="${x + width - inset}" ` +
            `y2="${y + height - inset}" stroke="${esc(color)}" stroke-width="1.5"/>`,
          `<line x1="${x + inset}" y1="${y + height - inset}" ` +
            `x2="${x + width - inset}" y2="${y + inset}" ` +
            `stroke="${esc(color)}" stroke-width="1.5"/>`
        )
      }
    }
    // invalid = the spreadsheet error-corner: a red flag at top-left
    // (index owns top-right, ↔ owns bottom-right) — geometry, so it's
    // legible at any raster scale and in any font
    if (w.invalid === true && !structural) {
      parts.push(`<path d="M${x} ${y} l7 0 l-7 7 z" fill="#d32f2f"/>`)
    }
    // focus ring: a second outline just outside the box — where the user IS
    if (w.focused === true && !structural) {
      parts.push(
        `<rect x="${x - 2.5}" y="${y - 2.5}" width="${width + 5}" ` +
          `height="${height + 5}" fill="none" stroke="${esc(stroke)}" ` +
          `stroke-width="1.5"/>`
      )
    }
    // editable = an ↔ badge at the box's right edge — SEPARATE from the
    // caption text: rasterizers resolve fonts per text run, and one exotic
    // glyph (⟷ is rare in monospace fonts) can tofu the whole caption.
    // ↔ (U+2194) is near-universal; isolated, it can only cost itself.
    if (editable && !toggle) {
      parts.push(
        `<text x="${x + width - 3}" y="${y + height - 4}" ` +
          `font-size="${fontSize}" text-anchor="end" ` +
          `font-family="monospace" fill="${esc(color)}">↔</text>`
      )
    }
    // required wears the universal asterisk on its caption — ASCII-safe
    const shownCaption =
      w.required === true && !structural && caption !== ''
        ? `${caption} *`
        : caption
    if (toggle) {
      // the toggle's label sits to the RIGHT of the control, like the real
      // layout — the control itself already says everything else
      if (shownCaption !== '') {
        parts.push(
          `<text x="${x + width + 4}" ` +
            `y="${y + height / 2 + fontSize / 2 - 1}" ` +
            `font-size="${fontSize}" font-family="monospace" ` +
            `fill="${esc(color)}">` +
            `${esc(shownCaption.slice(0, maxCaption + 2))}</text>`
        )
      }
    } else if (height >= minLabelHeight && shownCaption !== '') {
      parts.push(
        `<text x="${x + 4}" y="${y + Math.min(height - 4, fontSize + 2)}" ` +
          `font-size="${fontSize}" font-family="monospace" fill="${esc(color)}"` +
          `${hint ? ' font-style="italic" opacity="0.6"' : ''}>` +
          `${esc(shownCaption.slice(0, maxCaption + 2))}</text>`
      )
    }
    if (showIndex) {
      // the raster's data-record: a number a vision consumer can read off
      // the image and look up in description.wiring. Toggles are too small
      // to wear it inside — theirs sits just left of the control. A mostly
      // opaque white backdrop keeps the digits legible over ANY artwork.
      const indexX = toggle ? x - 3 : x + width - 2
      const digits = String(index).length
      parts.push(
        `<rect x="${indexX - digits * 5 - 1}" y="${y + 1}" ` +
          `width="${digits * 5 + 2}" height="8" fill="white" ` +
          `opacity="0.85" data-index-backdrop="true"/>`,
        `<text x="${indexX}" y="${y + 8}" font-size="8" ` +
          `text-anchor="end" font-family="monospace" fill="black" ` +
          `opacity="0.8">${index}</text>`
      )
    }
    parts.push('</g>')
  }
  parts.push('</svg>')
  return parts.join('')
}

/**
 * Rasterize an SVG string to a PNG Blob — the vision-encoder form of the map
 * (rasterize at 2× so labels land large enough to OCR near-losslessly).
 *
 * Browser-only by design: it uses Image + canvas, which keeps tosijs at zero
 * dependencies. Under bun/node, use `@resvg/resvg-js` directly instead:
 *
 *     const { Resvg } = await import('@resvg/resvg-js')
 *     const png = new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 } })
 *       .render().asPng()
 */
export const rasterizeSVG = (
  svg: string,
  options: { scale?: number } = {}
): Promise<Blob> => {
  const { scale = 2 } = options
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return Promise.reject(
      new Error(
        'rasterizeSVG needs a browser (Image + canvas); under bun/node use @resvg/resvg-js — see the doc comment'
      )
    )
  }
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const img = new Image()
  return new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      try {
        const width = (img.naturalWidth || 800) * scale
        const height = (img.naturalHeight || 600) * scale
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx == null) throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob != null) resolve(blob)
          else reject(new Error('canvas.toBlob produced no data'))
        }, 'image/png')
      } catch (e) {
        reject(e as Error)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG failed to load as an image'))
    }
    img.src = url
  })
}
