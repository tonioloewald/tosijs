#!/usr/bin/env bun
/**
 * Find every "as of DATE" stamp in the repo and report how old it is.
 *
 * Some facts cannot be generated from anything we own — browser versions,
 * whether a competitor has shipped, the state of a spec. The house rule is to
 * STAMP them rather than promise to keep them current (see
 * tosijs-coding-practices → documentation-surface.md, move 5). A stamp is only
 * useful if you can FIND it later, so it has one machine-readable spelling:
 *
 *     <!-- as-of: 2026-08-21 | what this covers, briefly -->
 *
 * Then `bun run stamps` answers "what have we asserted that is now old?" in
 * one place, instead of relying on someone remembering which pages contain
 * perishable claims.
 *
 * This is deliberately NOT a build gate. A doc going stale is not a broken
 * build, and failing `bun run build` over the age of a survey would train
 * everyone to bypass it. It IS a release step (see CLAUDE.md → Releasing),
 * where `--max-age` makes it exit non-zero so a stale load-bearing claim has
 * to be re-surveyed or consciously re-stamped before shipping.
 */
const STAMP = /<!--\s*as-of:\s*(\d{4}-\d{2}-\d{2})\s*(?:\|\s*([^>]*?))?\s*-->/g

interface Stamp {
  file: string
  line: number
  date: string
  note: string
  ageDays: number
}

const args = process.argv.slice(2)
const maxAgeArg = args.indexOf('--max-age')
const maxAge = maxAgeArg > -1 ? Number(args[maxAgeArg + 1]) : undefined

// git ls-files, so we scan what is tracked and skip node_modules/dist/docs
const listed = Bun.spawnSync(['git', 'ls-files'], { stdout: 'pipe' })
const files = listed.stdout
  .toString()
  .split('\n')
  .filter((f) => /\.(md|ts|tsx|js|mjs|html|txt|json)$/.test(f))
  // docs/ is generated (buildSite rm -rf's it) — stamps there are copies
  .filter((f) => !f.startsWith('docs/') && !f.startsWith('dist/'))

const today = new Date()
const stamps: Stamp[] = []

for (const file of files) {
  let text: string
  try {
    text = await Bun.file(file).text()
  } catch {
    continue // binary or unreadable
  }
  if (!text.includes('as-of:')) continue
  // scan the WHOLE text, not line by line: an HTML comment legitimately wraps
  // across lines, and a per-line regex silently skips exactly the stamps whose
  // note was long enough to need wrapping — i.e. the most informative ones
  STAMP.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = STAMP.exec(text)) !== null) {
    const date = match[1]
    const ageDays = Math.floor(
      (today.getTime() - new Date(date + 'T00:00:00Z').getTime()) / 86_400_000
    )
    stamps.push({
      file,
      line: text.slice(0, match.index).split('\n').length,
      date,
      note: (match[2] ?? '').replace(/\s+/g, ' ').trim(),
      ageDays,
    })
  }
}

if (stamps.length === 0) {
  console.log(
    'No "as of" stamps found. If this repo asserts anything about the outside ' +
      "world — browser support, what a competitor ships, a spec's status — it " +
      'should carry one:\n\n' +
      '    <!-- as-of: YYYY-MM-DD | what this covers, briefly -->\n'
  )
  process.exit(0)
}

stamps.sort((a, b) => b.ageDays - a.ageDays)

const stale =
  maxAge !== undefined ? stamps.filter((s) => s.ageDays > maxAge) : []

console.log(`\n${stamps.length} dated claim(s), oldest first:\n`)
for (const s of stamps) {
  const flag = maxAge !== undefined && s.ageDays > maxAge ? ' ← STALE' : ''
  const age =
    s.ageDays === 0
      ? 'today'
      : `${s.ageDays} day${s.ageDays === 1 ? '' : 's'} old`
  console.log(`  ${s.file}:${s.line}`)
  console.log(`    ${s.date} (${age})${flag}`)
  if (s.note !== '') console.log(`    covers: ${s.note}`)
}

if (maxAge !== undefined && stale.length > 0) {
  console.error(
    `\n${stale.length} claim(s) older than ${maxAge} days. Re-survey and ` +
      're-stamp, or re-stamp deliberately if you have checked and nothing ' +
      'moved. Do NOT write the update as a diff against the previous survey — ' +
      'rewrite it as a fresh statement and let git hold the history.\n'
  )
  process.exit(1)
}

console.log(
  '\nStamps are snapshots, not promises. Re-survey before a claim is ' +
    'load-bearing for a release or a post — not on a schedule.\n'
)
