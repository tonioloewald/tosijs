export interface TosiSettings {
    debug: boolean;
    perf: boolean;
    /**
     * Silence tosijs's own **advisory** output. Opt-OUT, so a safety net cannot
     * be inert by default.
     *
     * What this silences — things that tell you about a CHOICE:
     * - deprecation warnings (`warnDeprecated`, the largest family)
     * - the `on<Event>` member-collision advice
     * - the agent surface's posture notices
     * - the slim entry's "this page has blueprint markup I cannot hydrate" check
     *
     * What it deliberately does **not** silence, and will not: anything
     * reporting that something is WRONG. A binding that threw, a contract
     * violated from a binding, a blueprint source refused by policy, a WebMCP
     * tool name lost to another script, a wrong-typed attribute write. Those are
     * defect reports, not advice, and a flag called `quiet` should never be the
     * reason nobody heard about one.
     *
     * The doc comment used to say "advisory warnings and friends" while the flag
     * was honoured at 2 of ~20 sites, which promised the second list as well as
     * the first.
     */
    quiet: boolean;
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
    blueprintSrcCheck?: (src: string, el: Element) => boolean;
}
export declare const settings: TosiSettings;
