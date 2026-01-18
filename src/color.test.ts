import { test, expect, describe } from 'bun:test'
import { Color } from './color'

describe('Color constructor', () => {
  test('creates color with rgb values', () => {
    const white = new Color(255, 255, 255)
    const black = new Color(0, 0, 0)
    const red = new Color(255, 0, 0)

    expect(white.html).toBe('#ffffff')
    expect(black.html).toBe('#000000')
    expect(red.html).toBe('#ff0000')
  })

  test('creates color with alpha', () => {
    const semiTransparent = new Color(255, 0, 0, 0.5)
    expect(semiTransparent.a).toBe(0.5)
    // Alpha channel may round slightly differently
    expect(semiTransparent.html).toMatch(/^#ff0000[78][0-9a-f]$/)
  })

  test('clamps values to valid ranges', () => {
    const clamped = new Color(300, -10, 128, 2)
    expect(clamped.r).toBe(255)
    expect(clamped.g).toBe(0)
    expect(clamped.b).toBe(128)
    expect(clamped.a).toBe(1)
  })
})

describe('Color.fromHsl', () => {
  test('creates color from HSL values', () => {
    // Red is 0 degrees
    const red = Color.fromHsl(0, 1, 0.5)
    expect(red.r).toBeCloseTo(255, 0)
    expect(red.g).toBeCloseTo(0, 0)
    expect(red.b).toBeCloseTo(0, 0)

    // Green is 120 degrees
    const green = Color.fromHsl(120, 1, 0.5)
    expect(green.r).toBeCloseTo(0, 0)
    expect(green.g).toBeCloseTo(255, 0)
    expect(green.b).toBeCloseTo(0, 0)

    // Blue is 240 degrees
    const blue = Color.fromHsl(240, 1, 0.5)
    expect(blue.r).toBeCloseTo(0, 0)
    expect(blue.g).toBeCloseTo(0, 0)
    expect(blue.b).toBeCloseTo(255, 0)
  })

  test('handles achromatic colors (saturation = 0)', () => {
    const gray = Color.fromHsl(0, 0, 0.5)
    // Allow for rounding (127.5 rounds to either 127 or 128)
    expect(gray.r).toBeGreaterThanOrEqual(127)
    expect(gray.r).toBeLessThanOrEqual(128)
    expect(gray.r).toBe(gray.g)
    expect(gray.g).toBe(gray.b)
  })

  test('caches HSL values for accuracy', () => {
    const color = Color.fromHsl(180, 0.5, 0.5)
    expect(color._hsl.h).toBeCloseTo(180, 1)
    expect(color._hsl.s).toBeCloseTo(0.5, 2)
    expect(color._hsl.l).toBeCloseTo(0.5, 2)
  })
})

describe('Color static properties', () => {
  test('has black and white constants', () => {
    expect(Color.black.html).toBe('#000000')
    expect(Color.white.html).toBe('#ffffff')
  })
})

describe('Color properties', () => {
  test('rgb returns rgb format', () => {
    const color = new Color(128, 64, 32)
    expect(color.rgb).toBe('rgb(128,64,32)')
  })

  test('rgba returns rgba format', () => {
    const color = new Color(128, 64, 32, 0.5)
    expect(color.rgba).toBe('rgba(128,64,32,0.50)')
  })

  test('RGBA returns array of normalized values', () => {
    const color = new Color(255, 128, 0, 0.5)
    const rgba = color.RGBA
    expect(rgba[0]).toBe(1)
    expect(rgba[1]).toBeCloseTo(0.5, 1)
    expect(rgba[2]).toBe(0)
    expect(rgba[3]).toBe(0.5)
  })

  test('ARGB returns array with alpha first', () => {
    const color = new Color(255, 128, 0, 0.5)
    const argb = color.ARGB
    expect(argb[0]).toBe(0.5)
    expect(argb[1]).toBe(1)
    expect(argb[2]).toBeCloseTo(0.5, 1)
    expect(argb[3]).toBe(0)
  })

  test('hsl returns hsl format', () => {
    const red = new Color(255, 0, 0)
    expect(red.hsl).toMatch(/hsl\(\d+deg \d+% \d+%\)/)
  })

  test('hsla returns hsla format', () => {
    const red = new Color(255, 0, 0, 0.5)
    expect(red.hsla).toMatch(/hsl\(\d+deg \d+% \d+% \/ \d+%\)/)
  })

  test('brightness uses BT.601', () => {
    // White should be 1
    expect(Color.white.brightness).toBeCloseTo(1, 2)
    // Black should be 0
    expect(Color.black.brightness).toBeCloseTo(0, 2)
    // Yellow is very bright, blue is dark
    const yellow = new Color(255, 255, 0)
    const blue = new Color(0, 0, 255)
    expect(yellow.brightness).toBeGreaterThan(blue.brightness)
  })

  test('mono returns grayscale based on brightness', () => {
    const red = new Color(255, 0, 0)
    const mono = red.mono
    expect(mono.r).toBe(mono.g)
    expect(mono.g).toBe(mono.b)
  })

  test('inverse returns photonegative', () => {
    const red = new Color(255, 0, 0)
    const inverse = red.inverse
    expect(inverse.r).toBe(0)
    expect(inverse.g).toBe(255)
    expect(inverse.b).toBe(255)
  })

  test('inverseLuminance inverts lightness but keeps hue', () => {
    const darkRed = Color.fromHsl(0, 1, 0.2)
    const lightRed = darkRed.inverseLuminance
    // Should still be red (hue ~0) but light
    expect(lightRed._hsl.h).toBeCloseTo(0, 0)
    expect(lightRed._hsl.l).toBeCloseTo(0.8, 1)
  })

  test('opaque returns color with alpha 1', () => {
    const transparent = new Color(255, 0, 0, 0.5)
    const opaque = transparent.opaque
    expect(opaque.a).toBe(1)
    expect(opaque.r).toBe(255)

    // Already opaque color returns itself
    const alreadyOpaque = new Color(0, 255, 0)
    expect(alreadyOpaque.opaque).toBe(alreadyOpaque)
  })
})

describe('Color transformations', () => {
  test('blend mixes colors in RGB space', () => {
    const red = new Color(255, 0, 0)
    const yellow = new Color(255, 255, 0)
    const orange = red.blend(yellow, 0.5)
    expect(orange.html).toBe('#ff8000')
  })

  test('mix blends colors in HSL space', () => {
    const red = Color.fromHsl(0, 1, 0.5)
    const blue = Color.fromHsl(240, 1, 0.5)
    const purple = red.mix(blue, 0.5)
    // Hue should be around 300 (magenta/purple area)
    expect(purple._hsl.h).toBeGreaterThan(200)
  })

  test('mix handles achromatic colors', () => {
    const gray = Color.fromHsl(0, 0, 0.5)
    const blue = Color.fromHsl(240, 1, 0.5)
    const result = gray.mix(blue, 0.5)
    // Should use blue's hue since gray has no saturation
    expect(result._hsl.h).toBe(240)
  })

  test('brighten increases lightness', () => {
    const dark = Color.fromHsl(0, 1, 0.3)
    const brightened = dark.brighten(0.5)
    expect(brightened._hsl.l).toBeGreaterThan(dark._hsl.l)
  })

  test('darken decreases lightness', () => {
    const light = Color.fromHsl(0, 1, 0.7)
    const darkened = light.darken(0.5)
    expect(darkened._hsl.l).toBeLessThan(light._hsl.l)
  })

  test('saturate increases saturation', () => {
    const muted = Color.fromHsl(0, 0.3, 0.5)
    const saturated = muted.saturate(0.5)
    expect(saturated._hsl.s).toBeGreaterThan(muted._hsl.s)
  })

  test('desaturate decreases saturation', () => {
    const vivid = Color.fromHsl(0, 0.8, 0.5)
    const desaturated = vivid.desaturate(0.5)
    expect(desaturated._hsl.s).toBeLessThan(vivid._hsl.s)
  })

  test('rotate shifts hue', () => {
    const red = Color.fromHsl(0, 1, 0.5)
    const green = red.rotate(120)
    expect(green._hsl.h).toBeCloseTo(120, 0)

    const blue = green.rotate(120)
    expect(blue._hsl.h).toBeCloseTo(240, 0)
  })

  test('rotate handles negative angles', () => {
    const red = Color.fromHsl(0, 1, 0.5)
    const rotated = red.rotate(-60)
    expect(rotated._hsl.h).toBeCloseTo(300, 0)
  })

  test('opacity sets alpha', () => {
    const red = new Color(255, 0, 0)
    const transparent = red.opacity(0.5)
    expect(transparent.a).toBe(0.5)
    expect(transparent.r).toBe(255)
  })

  test('contrasting returns black or white based on brightness', () => {
    const dark = new Color(30, 30, 30)
    const light = new Color(220, 220, 220)

    // Dark colors should get white contrast
    const contrastForDark = dark.contrasting()
    expect(contrastForDark.brightness).toBeGreaterThan(0.5)

    // Light colors should get black contrast
    const contrastForLight = light.contrasting()
    expect(contrastForLight.brightness).toBeLessThan(0.5)
  })

  test('contrasting with amount parameter', () => {
    const mid = new Color(128, 128, 128)
    const full = mid.contrasting(1)
    const partial = mid.contrasting(0.5)

    // Full contrast should be more extreme
    expect(Math.abs(full.brightness - mid.brightness)).toBeGreaterThan(
      Math.abs(partial.brightness - mid.brightness)
    )
  })
})

describe('Color.blendHue', () => {
  test('blends hues correctly', () => {
    // Direct path when shorter
    const result = Color.blendHue(0, 120, 0.5)
    expect(result).toBeCloseTo(60, 0)
  })

  test('blends across 0/360 boundary', () => {
    // From 350 to 10 - result should be around 0 or 360 (equivalent)
    const result = Color.blendHue(350, 10, 0.5)
    // 0 and 360 are equivalent for hue
    const normalizedResult = result % 360
    expect(normalizedResult).toBeCloseTo(0, 0)
  })
})

describe('Color toString', () => {
  test('returns html format', () => {
    const color = new Color(255, 128, 64)
    expect(color.toString()).toBe(color.html)
  })
})
