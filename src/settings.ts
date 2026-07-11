// Assignment strictness: what happens when you assign a value whose type
// differs from what a path currently holds (e.g. a string over a number).
// - 'off'   no check
// - 'warn'  console.warn but still assign (default)
// - 'throw' throw and block the assignment
// (A monadic 'strict' mode is planned once assignment has a value-returning
// channel; see TJS-PORT-DX.md.) Assign via the proxy's `.valueAndType` setter
// (the deliberate counterpart to `.value`) to change a value AND its type on
// purpose, without tripping the check.
export type Strictness = 'off' | 'warn' | 'throw'

export const settings: {
  debug: boolean
  perf: boolean
  strictness: Strictness
} = {
  debug: false,
  perf: false,
  strictness: 'warn',
}
