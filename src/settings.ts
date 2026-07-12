// Write-path safety. Reads are self-limiting — a bad `getByPath` returns
// undefined and the caller deals with it, nothing is corrupted. Writes are the
// dangerous direction, because `setByPath` *creates* the structure it walks
// through, so a bad write doesn't fail: it silently grows a branch of state
// that no observer is bound to. Both knobs below guard writes.

// Assignment strictness: what happens when you assign a value whose type
// differs from what a path currently holds (e.g. a string over a number).
// - 'off'   no check
// - 'warn'  console.warn but still assign (default)
// - 'throw' throw and block the assignment
// (A monadic mode is planned; it needs assignment to have a value-returning
// channel. The Proxy `set` trap cannot be that channel — its return is coerced
// to a boolean, so a returned error object would read as *success* — and a JS
// assignment expression always evaluates to the RHS. The channel has to be a
// call: `setByPath`, an explicit `trySet`, or a TJS assignment transform, which
// tjs-lang does not implement yet. See TJS-PORT-DX.md.) Assign via the proxy's
// `.valueAndType` setter (the deliberate counterpart to `.value`) to change a
// value AND its type on purpose, without tripping the check.
export type Strictness = 'off' | 'warn' | 'throw'

// Path creation: what happens when a write has to *fabricate* structure to
// reach its target — `app.usre.name = 'x'` inventing `app.usre` because of a
// typo. Adding a new leaf to an existing parent is normal and never reported;
// inventing an intermediate container almost never is. Severity is graded by
// how many levels were fabricated: one is suspicious, two or more is a typo or
// missing initialization essentially every time.
// - 'off'   no check
// - 'warn'  report but keep the write (default); deeper fabrication reports louder
// - 'throw' roll back the fabricated branch and throw, so the write is blocked
export type PathCreation = 'off' | 'warn' | 'throw'

export const settings: {
  debug: boolean
  perf: boolean
  strictness: Strictness
  pathCreation: PathCreation
} = {
  debug: false,
  perf: false,
  strictness: 'warn',
  pathCreation: 'warn',
}
