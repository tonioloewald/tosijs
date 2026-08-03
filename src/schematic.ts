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
import { AgentDescription } from './agent'

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
  } = options
  const boxes = description.wiring.filter(
    (w) =>
      w.bounds != null &&
      w.bounds.width > 0 &&
      w.bounds.height > 0 &&
      (within == null || intersects(w.bounds, within))
  )
  if (boxes.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"></svg>'
  }
  // scoped: the viewBox IS the region; unscoped: fit the drawn boxes
  const minX =
    within != null ? within.x - pad : Math.min(...boxes.map((w) => w.bounds!.x)) - pad
  const minY =
    within != null ? within.y - pad : Math.min(...boxes.map((w) => w.bounds!.y)) - pad
  const maxX =
    within != null
      ? within.x + within.width + pad
      : Math.max(...boxes.map((w) => w.bounds!.x + w.bounds!.width)) + pad
  const maxY =
    within != null
      ? within.y + within.height + pad
      : Math.max(...boxes.map((w) => w.bounds!.y + w.bounds!.height)) + pad

  // explicit width/height (not just viewBox): gives the svg an intrinsic
  // size as a document/img, and Firefox refuses to draw an svg image onto a
  // canvas without them — which rasterizeSVG depends on
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${
      maxX - minX
    } ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}">`,
  ]
  for (const w of boxes) {
    const index = description.wiring.indexOf(w)
    const { x, y, width, height } = w.bounds!
    const caption = String(w.label ?? w.text ?? w.value ?? `<${w.tag}>`)
    const fill = w.style != null ? w.style.background : 'transparent'
    const stroke =
      w.style != null && w.style.borderColor !== TRANSPARENT
        ? w.style.borderColor
        : 'currentColor'
    const color = w.style != null ? w.style.color : 'currentColor'
    parts.push(`<g data-record="${index}">`)
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" ` +
        `fill="${esc(fill)}" stroke="${esc(stroke)}"/>`
    )
    if (height >= minLabelHeight) {
      parts.push(
        `<text x="${x + 4}" y="${y + Math.min(height - 4, fontSize + 2)}" ` +
          `font-size="${fontSize}" font-family="monospace" fill="${esc(color)}">` +
          `${esc(caption.slice(0, maxCaption))}</text>`
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
