import { test, expect, describe, beforeEach } from 'bun:test'
import { xin, updates } from './xin'
import { tosi } from './xin-proxy'
import { hotReload } from './hot-reload'

const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms))

beforeEach(() => {
  localStorage.clear()
})

describe('hotReload (H-10)', () => {
  test('restores a root scalar value exactly', () => {
    localStorage.setItem('xin-state', JSON.stringify({ hrNum: 42 }))
    tosi({ hrNum: 0 })
    hotReload((key) => key === 'hrNum')
    expect(xin['hrNum']).toBe(42) // Object.assign(0, 42) used to drop it
  })

  test('restores an array with the saved length (no stale tail)', () => {
    localStorage.setItem('xin-state', JSON.stringify({ hrArr: ['a'] }))
    tosi({ hrArr: ['x', 'y', 'z'] })
    hotReload((key) => key === 'hrArr')
    expect([...xin['hrArr']]).toEqual(['a']) // was ['a','y','z'] via merge
  })

  test('a deep write triggers a save (root-key test function still matches)', async () => {
    // The observer now matches on the touched path's ROOT segment, aligning
    // with the documented contract that `test` judges root-level keys. (This
    // is defensive: deep writes already touch the root path too, so saves
    // happened either way — the change makes the filter consistent with the
    // restore side, which filters Object.keys(state) by the same test.)
    tosi({ hrDeep: { user: { name: 'x' } } })
    hotReload((key) => key === 'hrDeep')
    xin['hrDeep.user.name'] = 'changed'
    await updates()
    await tick(600) // debounced 500ms
    const saved = JSON.parse(localStorage.getItem('xin-state') ?? '{}')
    expect(saved.hrDeep?.user?.name).toBe('changed')
  })
})
