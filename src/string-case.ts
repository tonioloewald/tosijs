// NOT the toLocale* methods: they follow the BROWSER'S language. In a Turkish
// or Azerbaijani locale `I` lower-cases to dotless `ı` and `i` upper-cases to
// dotted `İ`, so `alignItems` became `align-ıtems`, `myInput` became
// `<my-ınput>` and a `maxItems` attribute was observed as `max-ıtems`
// (Firefox and Safari; fixed in 1.10.13). These convert IDENTIFIERS, which
// are ASCII by the regexes below, so the plain methods are exact.

export function camelToKabob(s: string): string {
  return s.replace(/[A-Z]/g, (c: string): string => {
    return `-${c.toLowerCase()}`
  })
}

export function kabobToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_: string, c: string): string => {
    return c.toUpperCase()
  })
}
