import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * WHAT `bind` DOES THAT A HAND-ROLLED `observe` DOES NOT — in real engines.
 *
 * These are the two properties the tosijs#44 RFC rests on, and neither had a
 * permanent test anywhere:
 *
 *   1. TEARDOWN IS STRUCTURAL. The dispatcher scans
 *      `document.getElementsByClassName(BOUND_CLASS)` at DISPATCH time, so
 *      removing an element from the document IS the teardown — `bind` holds no
 *      strong reference to it. An observer keeps running until something
 *      retires it, writing into a node nobody can see.
 *   2. `bind` APPLIES ON SETUP; `observe` does not. Every hand-rolled version
 *      therefore carries a manual priming call (tosijs-ui's `live-theme.ts:356`
 *      and `hash-state.ts:28` both do). Forget it and the UI is stale until the
 *      first change.
 *
 * WHY A REAL BROWSER. These depend on attach/detach semantics and on the
 * MutationObserver hydration path, and `bind.ts` says of that path: "happy-dom
 * delivers mutation records unreliably enough that a test written against the
 * observer passes and fails by run order." A unit test here would be exactly
 * the environment-suppressed assertion CLAUDE.md warns about — green, and
 * proving nothing.
 *
 * NB this is NOT a claim that `observe` leaks. It can be retired three ways
 * (`observerShouldBeRemoved`, `unobserve`, the unsubscribe returned by
 * `.observe()`), and arm 3 pins that those work. The difference is that `bind`
 * has nothing to remember.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)

const withModule = async (page: any, fn: string) => {
  await page.route('**/__tosi-test/module.js', (route: any) =>
    route.fulfill({ contentType: 'text/javascript', body: moduleSource })
  )
  await page.goto('/')
  return page.evaluate(fn)
}

test('bind stops when the element leaves the document; an unretired observer does not', async ({
  page,
}) => {
  const r = await withModule(
    page,
    `(async () => {
      const { tosi, elements, bind, updates } =
        await import('/__tosi-test/module.js')
      const { lc } = tosi({ lc: { v: 0 } })
      await updates()

      let boundRuns = 0
      let observeRuns = 0
      const bound = elements.div()
      const rolled = elements.div()
      document.body.append(bound, rolled)

      bind(bound, 'lc.v', {
        toDOM: (el, v) => { boundRuns++; el.textContent = String(v) },
      })
      lc.v.observe(() => { observeRuns++; rolled.textContent = String(lc.v.value) })
      await updates()

      lc.v.value = 1
      await updates()
      const attached = { bound: boundRuns, observe: observeRuns }

      bound.remove()
      rolled.remove()
      const b0 = boundRuns, o0 = observeRuns
      lc.v.value = 2; await updates()
      lc.v.value = 3; await updates()

      return {
        attached,
        afterDetach: { bound: boundRuns - b0, observe: observeRuns - o0 },
        text: { bound: bound.textContent, rolled: rolled.textContent },
      }
    })()`
  )

  // while attached, both track state
  expect(r.attached.bound).toBeGreaterThan(0)
  expect(r.attached.observe).toBeGreaterThan(0)

  // THE POINT: detaching is the teardown for bind, and nothing for observe
  expect(r.afterDetach.bound).toBe(0)
  expect(r.afterDetach.observe).toBeGreaterThan(0)

  // and the observer went on writing into a node nobody can see
  expect(r.text.rolled).toBe('3')
  expect(r.text.bound).not.toBe('3')
})

test('bind applies on setup — observe does not, which is the priming call', async ({
  page,
}) => {
  /*
   * SEPARATE PATHS, deliberately. `bind` applies on setup by TOUCHING its path,
   * and that touch notifies observers on the same path — so binding and
   * observing `ini.v` makes the observer look like it self-primes when it is
   * only riding bind's touch. The first draft of this test did exactly that and
   * asserted the opposite of the truth.
   */
  const r = await withModule(
    page,
    `(async () => {
      const { tosi, elements, bind, updates } =
        await import('/__tosi-test/module.js')
      const { ini } = tosi({ ini: { bound: 'START', watched: 'START' } })
      await updates()

      const a = elements.div(), b = elements.div()
      document.body.append(a, b)
      bind(a, 'ini.bound', { toDOM: (el, v) => { el.textContent = String(v) } })
      ini.watched.observe(() => { b.textContent = String(ini.watched.value) })
      await updates()
      await new Promise(r => setTimeout(r, 30))

      return { bound: a.textContent, observed: b.textContent }
    })()`
  )

  expect(r.bound).toBe('START') // applied itself — no priming call needed
  expect(r.observed).toBe('') // never ran, so every hand-rolled version needs one
})

test('an observer can be retired — all three forms, incl. the symbol (tosijs#45)', async ({
  page,
}) => {
  const r = await withModule(
    page,
    `(async () => {
      const mod = await import('/__tosi-test/module.js')
      const { tosi, elements, observe, unobserve, updates } = mod
      // tosijs#45 — this must be reachable from the PUBLISHED bundle. It was
      // exported from path-listener.ts and from no entry point, so it was
      // undefined here, so returning it retired nothing, silently.
      const OBSERVER_SHOULD_BE_REMOVED = mod.OBSERVER_SHOULD_BE_REMOVED
      const symbolReachable = typeof OBSERVER_SHOULD_BE_REMOVED === 'symbol'
      const { td } = tosi({ td: { v: 0 } })
      await updates()

      const el = elements.div()
      document.body.append(el)
      let magic = 0, explicit = 0, accessor = 0

      observe('td.v', () => {
        magic++
        if (!el.isConnected) return OBSERVER_SHOULD_BE_REMOVED
        el.textContent = String(td.v.value)
      })
      const listener = observe('td.v', () => { explicit++ })
      const stop = td.v.observe(() => { accessor++ })
      await updates()

      td.v.value = 1; await updates()
      el.remove(); unobserve(listener); stop()

      // round 1 — the symbol form is PULL-based, so it costs some bounded
      // number of calls to notice it should retire
      const m0 = magic, e0 = explicit, a0 = accessor
      td.v.value = 2; await updates()
      td.v.value = 3; await updates()
      const round1 = { magic: magic - m0, explicit: explicit - e0, accessor: accessor - a0 }

      // round 2 — by now every form must be gone. Asserting "it STOPS" rather
      // than guessing the cycle count is the property that actually matters.
      const m1 = magic, e1 = explicit, a1 = accessor
      td.v.value = 4; await updates()
      td.v.value = 5; await updates()
      await new Promise(r => setTimeout(r, 30))
      const round2 = { magic: magic - m1, explicit: explicit - e1, accessor: accessor - a1 }

      return { round1, round2, symbolReachable }
    })()`
  )

  // the two REACHABLE forms retire immediately and stay retired
  expect(r.round1.explicit).toBe(0)
  expect(r.round1.accessor).toBe(0)
  expect(r.round2.explicit).toBe(0)
  expect(r.round2.accessor).toBe(0)

  /*
   * tosijs#45, fixed: the symbol reaches a consumer, so the self-retiring form
   * works from a published bundle. It is PULL-based, so it costs a bounded
   * number of calls to notice — the property that matters is that it STOPS.
   */
  expect(r.symbolReachable).toBe(true)
  expect(r.round2.magic).toBe(0)
})

test('an unchanged scalar notifies nobody — identity, not deep equality', async ({
  page,
}) => {
  /*
   * The doc page asserted this in PROSE and got the condition backwards — it
   * said assigning a value that `!==` the current one does nothing, when
   * `!==` is precisely what fires `touch()` (src/xin.ts:1116, :1436). Caught
   * by review, in the page written to stop the library stating untruths.
   *
   * Prose cannot be wrong in the same direction as a passing test, so the
   * claim is pinned here now: both halves of it, including the deliberate
   * identity-vs-deep-equality asymmetry.
   */
  const r = await withModule(
    page,
    `(async () => {
      const { tosi, elements, bind, updates } =
        await import('/__tosi-test/module.js')
      const { nz } = tosi({ nz: { s: 'SAME', o: { k: 1 } } })
      await updates()

      let scalarRuns = 0, objectRuns = 0
      const a = elements.div(), b = elements.div()
      document.body.append(a, b)
      bind(a, 'nz.s', { toDOM: () => { scalarRuns++ } })
      bind(b, 'nz.o', { toDOM: () => { objectRuns++ } })
      await updates()

      const s0 = scalarRuns, o0 = objectRuns
      nz.s.value = 'SAME'              // identical scalar -> no touch
      await updates()
      const afterNoop = scalarRuns - s0

      nz.s.value = 'DIFFERENT'         // a real change -> one update
      await updates()
      const afterChange = scalarRuns - s0 - afterNoop

      nz.o.value = { k: 1 }            // deep-equal but a NEW object -> DOES fire
      await updates()
      const afterDeepEqualObject = objectRuns - o0

      return { afterNoop, afterChange, afterDeepEqualObject }
    })()`
  )

  expect(r.afterNoop).toBe(0) // the heading: an unchanged scalar notifies nobody
  expect(r.afterChange).toBeGreaterThan(0) // ...and a real change still does
  expect(r.afterDeepEqualObject).toBeGreaterThan(0) // identity, not deep equality
})
