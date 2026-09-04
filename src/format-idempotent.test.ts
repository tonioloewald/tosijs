import { test, expect } from 'bun:test'

/*
 * FORMATTING MUST BE A FIXED POINT: format(format(x)) === format(x).
 *
 * `prettier --check` (our `format:check` CI gate) answers a different
 * question — "is this file formatted?" — and on a file the printer cannot
 * stabilise it is UNSATISFIABLE: you run `--write`, `--check` still fails, and
 * the only ways out are to fight it or to switch the gate off.
 *
 * That is not hypothetical. Prettier's markdown printer gains four spaces of
 * list indentation on every `--write` without converging, and it silently
 * mangled `TODO.md` over months — content flattened, a sentence dedented
 * mid-way — while nothing complained. `--check` would only ever have said
 * "not formatted".
 *
 * So this asserts the property directly, and reports the two cases
 * differently: an unstable file is a FORMATTER defect (exclude the file type,
 * report upstream), an unformatted one is a user defect (`bun run format`).
 * Markdown is excluded via .prettierignore; this is what makes it safe to add
 * a file type back — and what will notice if the exclusion is ever undone.
 *
 * In-process via prettier's API, not `npx` per file: ~110 files twice is a
 * fraction of a second, so it can live in the unit suite.
 */
test('every file prettier formats is a fixed point', async () => {
  const prettier = await import('prettier')

  const tracked = Bun.spawnSync(['git', 'ls-files'], { stdout: 'pipe' })
    .stdout.toString()
    .split('\n')
    .filter(Boolean)

  const unstable: Array<{ file: string; passes: number }> = []
  let checked = 0

  for (const file of tracked) {
    // let prettier itself decide what is in scope — it reads .prettierignore,
    // so this cannot drift from the config the way a hand-kept list would
    const info = await (prettier as any).getFileInfo(file, {
      ignorePath: '.prettierignore',
    })
    if (info.ignored || info.inferredParser == null) continue

    const source = await Bun.file(file).text()
    const options = {
      ...((await (prettier as any).resolveConfig(file)) ?? {}),
      filepath: file,
    }
    const once = await (prettier as any).format(source, options)
    const twice = await (prettier as any).format(once, options)
    checked++
    if (once !== twice) unstable.push({ file, passes: 2 })
  }

  // guard against the check silently examining nothing — the failure mode
  // that makes a gate report safety it never established
  expect(checked).toBeGreaterThan(50)
  expect(unstable).toEqual([])
}, 120_000)
