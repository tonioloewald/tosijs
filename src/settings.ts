export interface TosiSettings {
  debug: boolean
  perf: boolean
  /** silence tosijs's own advisory warnings (the slim-entry blueprint check
   * and friends). Opt-OUT, so a safety net can't be inert by default. */
  quiet: boolean
  /**
   * Decide whether a `<tosi-blueprint src>` may be loaded. Return `false` to
   * refuse.
   *
   * A blueprint EXECUTES the module it names, and the element can arrive via
   * `innerHTML` — so an app that renders untrusted HTML has an
   * injection-to-script-execution sink unless it strips `<tosi-blueprint>` /
   * `<tosi-loader>`. tosijs does NOT default to same-origin, because loading a
   * blueprint from a CDN is the feature; this hook is how an app that does not
   * need that narrows it, e.g.
   *
   *     settings.blueprintSrcCheck = (src) =>
   *       new URL(src, location.href).origin === location.origin
   *
   * URLs that can never be an honest module reference (`javascript:`, `data:`,
   * `vbscript:`) are refused unconditionally, hook or no hook.
   */
  blueprintSrcCheck?: (src: string, el: Element) => boolean
}

export const settings: TosiSettings = {
  debug: false,
  perf: false,
  quiet: false,
}
