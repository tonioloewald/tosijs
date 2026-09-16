# After-action reports

Newest first. **Facts, not analysis** — 3–6 bullets, five minutes. The whys are
asked periodically, by the Tier 3 quarterly audit reading these across projects
(`practices/releasing.md` step 10). Do not root-cause here.

## 1.10.2 — 2026-09-16

- **Went well:** the budget ledger added this release (build emits
  bundle/gz/budget/spare) caught two bundles falling under the 1 kB headroom
  floor, and later caught the version restamp moving every bundle by a byte or
  two. Post-publish verification was clean first try: 8/8 bundles byte-identical
  to the tag, 7/7 entry points from the registry with 0 undefined exports.
- **Went well:** the `auditView` deletion was proven by executing the deleted
  code against its replacement over a 116,640-record matrix rather than by
  reading the upstream changelog.
- **Didn't:** shipped a false remedy in a security note — *"marking the control
  itself … works in all of these"* is wrong for the first shape in its own
  bullet list, two lines below the bullet that says so. Found by executing the
  published tarball, after release. Fixed on main.
- **Didn't:** #41 was described as "closed completely" mid-session; the
  2-levels-up wrapper still returns cleartext. The issue stays open.
- **Surprised:** three `perl` mutation checks silently matched nothing (prettier
  had rewrapped the conditions), each producing a confident *false* negative
  that pointed at deleting a working guard.
- **Surprised:** `bun -e` and `node -e` disagree ~1% on gzip; measuring with the
  wrong one produced a written accusation that a correct file was careless.
- **Friction:** twelve review rounds under the label 1.11.0, then renumbered to
  1.10.2 at tag time — 70 references across 17 files, two of which were
  historical and would have been corrupted by a blanket replace.
- **Cycle:** yes, three deep. R10 fix (withhold `href`) → R11 blocker
  (`<select>` leaked via flag-vs-decision) → R11 fix (audit gate on `secret`) →
  R12 majors (same flag-vs-decision error, one file over, in both directions).
