const stringify = (x: any): string => {
  try {
    return JSON.stringify(x)
  } catch (_) {
    return '{has circular references}'
  }
}

export const makeError = (...messages: any[]): Error =>
  new Error(messages.map(stringify).join(' '))

/**
 * A error as a *value* — returned rather than thrown, so a caller can handle a
 * failure without exceptions.
 *
 * It extends `Error` deliberately. A monadic error is a value you return, but it
 * must also survive being thrown: bare assignment (`boxed.app.x = v`) has no
 * return channel — a Proxy `set` trap's return is `ToBoolean`-coerced, so an
 * error object handed back from it reads as *success* — but a trap CAN throw, and
 * a thrown value escapes assignment intact. So throw is the only channel bare `=`
 * has, and extending `Error` means the same value works in both roles, keeps a
 * stack, and behaves properly in a `catch`.
 *
 * Check it with `isMonadicError()`, never with truthiness — it is an object, and
 * every object in JS is truthy (`ToBoolean` has no user hook). Testing
 * `if (result)` on a returned monad reads a failure as a success.
 */
export class MonadicError extends Error {
  /** what kind of failure — e.g. 'path-creation', 'type-drift' */
  readonly kind: string
  /** the state path the failure concerns, when there is one */
  readonly path?: string

  constructor(kind: string, message: string, path?: string) {
    super(message)
    this.name = 'MonadicError'
    this.kind = kind
    this.path = path
  }
}

export const isMonadicError = (value: any): value is MonadicError =>
  value instanceof MonadicError
