# Lean plan: a leaner, cleaner tosijs that is easier to learn

Written 2026-11-25 against `main` at `3a8e6c87` (v1.10.12). This is a plan. Nothing in
`src/` was changed to produce it.

Two phases, as asked:

1. **Phase 1 removes no functionality.** Dead code goes, duplicated logic becomes one
   implementation, a few things that leak or crash stop doing so. Every export, every
   spelling and every `.d.ts` signature a consumer can reach stays as it is.
2. **Phase 2 removes duplicate ways of doing the same thing.** One obvious spelling per
   task. Per `DECISIONS.md` ("Breaking changes wait for 2.0") that means: deprecate in 1.x,
   migrate the ecosystem, delete in 2.0.

Lining up copies turned up thirteen defects in the code and several in the docs. They are
neither cleanup nor redundancy, so they are listed first, and four of them are worth a
patch release on their own.

## In brief

- **A locale bug is live.** In Firefox and Safari set to Turkish, `css()` emits
  `align-ıtems` and `z-ındex`, and components lose attributes and tag names (F1). Two
  characters fix it.
- **Installing a schema validator the way the warning says to turns enforcement off.** A
  validator that returns `false` is read as "valid", and tosijs-schema's `validate`
  returns a boolean (F10).
- **The proxy and the path engine each resolve a key, and they disagree** on `null` in
  arrays, ids containing `=`, null-prototype objects and `length` keys (F2, F3, F6, F7).
  Phase 1 makes the proxy ask the path engine.
- **The README's only component example throws** when run, and `Migration.md` still
  gives secrecy advice the agent page retracts (1.7).
- **Phase 1** is about two dozen deletions, about thirty-five merges, four structural
  splits and two new tests. Nothing a consumer can import changes.
- **Phase 2** adds sixteen spellings to the existing purge list. Most have no caller in
  any of the 24 repos that depend on tosijs.
- **Warnings are the best single lever.** Seventeen separate once-only latches become one
  function, which fixes the inconsistent deprecation warnings, generates the purge
  inventory, and puts about 6 kB of gzipped message text behind one decision.

## How to read the evidence

- **Read:** every non-test module in `src/` except the vendored `schematic.ts`. I read the
  core, DOM, list, CSS and sync modules line by line. The agent-surface files
  (`agent.ts`, `webmcp.ts`, `audit.ts`, `contract.ts`, `contract-check.ts`) and the docs
  were each read by a second reviewer; every finding of theirs quoted here I checked
  against the file, and the ones marked ✔ I ran.
- **✔ means executed**, not inferred. Unit-level checks ran against `src/` in Bun with
  happy-dom. Browser checks ran the published `dist/module.js` in Firefox 153, WebKit 26.5
  and Chromium 151 through Playwright. The scripts are throwaway and not committed.
- **Usage counts** are regex counts over the 24 sibling repositories that depend on
  tosijs (about 1,200 source files that mention it). They show which spelling won. They do
  not prove a removal is safe: namespace imports and blueprint factories dodge them
  (ngx-tosijs reaches `tosiPath` through `import * as t`), and outside users are invisible.
  Every removal still needs the consumer-compile check the purge inventory asks for.
- **Line numbers** are for `3a8e6c87`.

## The numbers that frame it

| | |
| --- | --- |
| `src/`, non-test | 23,344 lines: 11,808 code, 6,737 doc block, 4,799 comment |
| Largest files (code / comment lines) | `agent.ts` 1,742 / 1,740 · `component.ts` 1,349 / 749 · `list-binding.ts` 988 / 142 |
| Runtime exports | 90 from `tosijs`; 69 without the agent surface |
| Exports named in an `import` anywhere in the 24 repos | about 30 |
| Message text in `module.js` | 186 literals, 15.1 kB raw, about 6.3 kB gzipped (≈13% of the bundle) ✔ |
| npm payload | 2.84 MB of a 3.0 MB budget. 0.52 MB is `module.debug.js` + `module.safe.js`; 0.53 MB of the shipped `src/` is comments and doc blocks ✔ |
| Warn-once latches | 17, each hand-rolled |
| Ways to read a proxy's value | 11 |

---

## Fix first: defects found on the way

None of these is new in 1.10.12. F1, F2, F3 and F10 are worth a patch release (1.10.13)
by themselves, with the documentation fixes in 1.7.

| # | Defect | Evidence | Where | Card |
| --- | --- | --- | --- | --- |
| **F1** | **Case conversion follows the browser's locale.** In a Turkish or Azerbaijani locale `I` lower-cases to `ı` and `i` upper-cases to `İ`, so every CSS property, attribute and tag name containing that letter is corrupted. | ✔ Firefox 153 and WebKit 26.5, `locale: 'tr-TR'`, published 1.10.12 bundle: `css({'.x': {alignItems: 'center', zIndex: 2}})` gives `align-ıtems: center; z-ındex: 2px;` · `elements.myInput()` creates `<my-ınput>` · class `TosiInfoIcon` logs "tosi-ınfo-ıcon is not a legal tag" and becomes `custom-elt0` · `initAttributes = { maxItems: 3 }` observes `max-ıtems`, so `max-items="7"` in markup is ignored and a property write adds a second attribute. Chromium did not reproduce on this machine, neither with Playwright's locale emulation nor launched with `--lang=tr`; a Chrome whose operating system is set to Turkish is unverified. WebKit means every iOS browser. | `string-case.ts:3,9` · inline copy `elements.ts:972` · `component.ts:2117` | #4239 |
| **F2** | **`null` inside an array throws when read through the proxy.** `typeof null === 'object'`, so the array branch calls `new Proxy(null)`. | ✔ `tosi({ v: { list: [null, 1] } })` then `xin.v.list[0]`, `boxed.v.list[0]` and `xin['v.list[0]']` all throw "A Proxy's 'target' should be an Object". `{ n: null }` on an object is fine. `for…of` and a list binding over such an array hit the same throw. | `xin.ts:1466` | #4240 |
| **F3** | **An id containing `=` resolves to the wrong list item.** The proxy splits the segment on every `=`; `by-path` re-joins the tail. | ✔ With ids `'YWJj'` and `'YWJj='`, `xin['eq.list[id=YWJj=]']` returns the unpadded item while `getByPath` returns the padded one. `boxed['eq.list[id=a=b]'].path` reports `eq.list[id=a=b]` while holding the item whose id is `a`. Base64 ids are the ordinary way to hit it. | `xin.ts:1422` vs `by-path.ts:264` | #4241 |
| **F4** | **A window-scrolled virtual list is never released.** Its `scroll` and `resize` listeners on `window` are never removed; nothing in `list-binding.ts` tears anything down. | ✔ After `host.remove()`, three window scrolls ran `update()` three times against the detached element. | `list-binding.ts:1404-1415` | #4242 |
| **F5** | **The idPath registry only grows.** `unregisterArrayIdPath` is called by one test and by no library code. | ✔ After the list was removed, `list[2].name = …` still synthesised a touch on `list[id=2].name`. | `metadata.ts:138` · `list-binding.ts:1303` | #4242 |
| **F6** | **A null-prototype object in state comes back unproxied.** `instanceof Object` is false for it, so `box()` hands back the raw object. `.path` and `.value` are undefined and writes through it notify nobody. | ✔ `Object.create(null)` stored under `tosi()`. | `xin.ts:1431`, `1006` | #4240 |
| **F7** | **`[=key]` cannot read an object that has a `length: 0` property.** | ✔ `getByPath({ box: { length: 0, foo: 1 } }, 'box[=foo]')` is `undefined`; with `length: 2` it is `1`. | `by-path.ts:258-262` |  |
| **F8** | **A held proxy's `.on()` binds a stale function.** `.value` resolves by path (the 1.9.2 fix); `.on()` still reads the captured target. | ✔ After the parent object was replaced, `held.value` was the new function and `held.on(btn, 'click')` registered the old one. | `xin.ts:1107` vs `1125-1131` |  |
| **F9** | **Deprecation warnings disagree with each other and with `settings.quiet`.** | ✔ `.xinValue` on an object proxy warns 0 times, on a scalar proxy once. `xinValue()` warns with `settings.quiet = true`, though `settings.ts` documents `quiet` as silencing deprecations. By reading: `static StyleNode()` and an instance `styleNode` call `console.warn` unguarded, so they warn every time. | `xin.ts:1337-1342` vs `1374-1378` · `metadata.ts:180` · `component.ts:1707`, `2870` |  |
| **F10** | **A schema validator that returns `false` is read as "valid".** `contractViolation` returns `verdict.message`, which is `undefined` for `false`. tosijs-schema's `validate` returns a boolean, and both the runtime warning and the `{ final: true }` example tell the reader to pass it directly. | ✔ Component with `contract = { value: { type: 'number', minimum: 5 } }`: with `setContractValidator(validate)` from tosijs-schema, `el.value = 1` is accepted and the "`minimum` is NOT enforced" warning no longer appears. A validator returning an `Error` refuses it. The agent's own copy of the protocol (`agent.ts:3330`) refuses on anything but `true`. | `contract-check.ts:224-227`, `190-192`, `36` | #4250 |
| **F11** | **The accessibility audit skips contrast on any background whose blue channel is 0.** The "is it transparent" regex lets `[^)]*` swallow the first channels. | ✔ `rgb(0, 0, 0)`, `rgb(255, 0, 0)`, `rgb(255, 255, 0)` and `rgb(0, 128, 0)` all match as transparent; white and blue do not. Dark themes are not audited for contrast. | `audit.ts:328` | #4251 |
| **F12** | **`agent.disable()` can throw part-way and stay half torn down.** It sets its latch, then calls `unobserve` on every subscription, and `unobserve` throws on a listener that already retired itself. | ✔ After a subscriber returned `OBSERVER_SHOULD_BE_REMOVED`, `disable()` threw "unobserve failed, listener not found", a second `disable()` returned at the latch, another subscriber was still registered and `globalThis.tosiAgent` was still set. | `agent.ts:3694-3706`, `3407`, `3620-3621` | #4252 |
| **F13** | **`Component` writes a subclass's private `_value`.** It assigns an undeclared `_value` in the constructor and again on connect, from the `value` attribute. Nothing in tosijs reads it, but nine consumer components keep `private _value` behind their own `value` accessor. | ✔ A component whose `_value` is typed `{ title } \| null` and whose setter accepts only objects, created from `<x value="from-markup">`: after connect `_value` is the string and the setter ran 0 times. For string-valued components the same write happens to seed the store, which may be why it has gone unreported. | `component.ts:2118`, `2703-2705` | #4254 |

F2, F3, F6 and F7 have one cause: the proxy's `get` trap answers "what is the child at
this key" itself, three different ways, instead of asking `by-path`. Package 1.2a removes
the cause.

Suggested fixes, all small:

- **F1:** `toLowerCase()` / `toUpperCase()`. The regexes already restrict input to
  `[A-Z]` / `[a-z]`, so the plain methods are exact. Add one browser-lane test that runs
  under `locale: 'tr-TR'` in Firefox and WebKit, because no unit test can see this class.
- **F4, F5:** keep DOM-as-registry. The throttled handler checks
  `boundElement.isConnected`; when false it removes its own listeners, unobserves and
  unregisters, and `update()` re-arms on the next dispatch (a re-attached cached view
  already gets one from `hydrateInsertedSubtree`). No new lifecycle API.
- **F8:** the accessor's `on` passes the *path* to `on()`, which already stores proxies as
  paths (`bind.ts:946`). That also deletes the `target.valueOf ? … : …` branching.
- **F10:** normalise at the boundary. Anything but `true` is a violation
  (`verdict instanceof Error ? verdict.message : 'schema violation'`), and the warning text
  shows a call that works.
- **F11:** ask the parsed colour: `Color.fromCss(…).a === 0`.
- **F12:** one `release(listener)` that tolerates an already-retired listener, used at the
  four sites that unobserve, and the latch set last.
- **F13** is a decision before it is a fix: either `_value` is the protocol and gets
  documented as reserved, or the base hands the attribute to the public `value` setter.

---

## Phase 1: no functionality removed

Guard for every package below: the unit suite and the browser lane pass,
`src/type-surface.test.ts` passes, the list of runtime exports of each entry is unchanged
(snapshot it once, before starting), and `git diff dist/*.d.ts` shows only internals
that were deleted on purpose. Since `dist/` is committed, that diff is a readable record
of what moved.

### 1.1 Delete what nothing uses

All verified by searching `src/`, the tests and every entry module.

| What | Where | Note |
| --- | --- | --- |
| `makePropList`, the whole module | `src/object-property-list.ts` | Imported by nothing. Ships as `dist/object-property-list.d.ts` and in the tarball's `src/`. |
| `bindingGeneration()` and the counter behind it | `metadata.ts:346-365`; bumped at `bind.ts:458, 704, 819` | Nothing reads it. Its comment calls it security-relevant and says the agent's secret-path scan reads it. That cache was reverted on purpose as a security regression (`agent.ts:1484-1528`); the counter, its comment and its three call sites are what the revert left behind. |
| `_getArrayIdPathRegistry()` | `metadata.ts:151` | No references, tests included. |
| `XinEventBindings` | `metadata.ts:459` | A deprecated alias that no entry module exports. |
| `static filterBoundObservers` | `list-binding.ts:1289` | Declared, never used. |
| `export { setContractValidator }` | `component.ts:1009` | The entries import it from `contract-check`. |
| `ctor.styleNode = …; delete ctor.styleNode` | `component.ts:2866-2867` | Assign, then delete. |
| `const debugPaths = true` | `xin.ts:973` | A constant flag guarding one check. |
| Unreachable object check | `xin.ts:1475-1479` | That `else` is only reached when `target[prop] === undefined`. |
| `elt[attr] !== undefined` branch | `elements.ts:579-580` | Unreachable unless a property name contains a hyphen. |
| `if (propagationStopped) { continue }` | `bind.ts:885-887` | Last statement of the loop body. |
| String-callback handling in `Listener` | `path-listener.ts:253-256, 276-280` | Accepts a string, describes it, then throws. The public `observe` resolves strings before it gets here. |
| Duplicate keys in `LEGACY_MAP` | `xin.ts:1264-1282` | `XIN_OBSERVE`, `XIN_BIND`, `XIN_ON` *are* the strings `'xinObserve'` etc., so each appears twice. |
| `madeComponents` | `make-component.ts:77, 135` | Written, never read. |
| Unused `index` parameter | `path-listener.ts:205` | |

### 1.2 One implementation each

Each row is logic that exists more than once. Where the copies differ, the difference is
a finding to settle while merging (the merged version takes the union of the guards), not
something to pick a winner for.

**a. The state core**

| Merge | Copies | What merging settles |
| --- | --- | --- |
| "Is this a container?" | `xin.ts:1006` (`typeof` object or function), `1431` (`instanceof Object`), `1466` (`typeof` object), `declarative-binding.ts:262` | F2 and F6. One predicate: not null, and object or function. |
| Wrap a child value | five sites in the `get` trap: `xin.ts:1406, 1434, 1457, 1467` and `box()` | One `wrap(value, path, boxScalars)`. The trap becomes "resolve the key, then wrap". |
| Id-path lookup | `xin.ts:1421-1426` re-implements `byIdPath` (`by-path.ts:183`) | F3. The trap calls the path engine. |
| String or proxy to path | `path-listener.ts:368`, `bind.ts:800, 807`, `share.ts:324`, `sync.ts:242`, `xin.ts:1186`, `declarative-binding.ts:238`, `agent.ts:853` | One `pathOf(x)`. The agent's `toPath` keeps its refusal message on top of it. |
| Write with a no-op check | `xin.ts:1199-1203` and `1533-1536`; a third comparison in `bind.ts:627-671`, which also hand-rolls `tosiValue` twice (`633-637`) | See below. |
| Shallow unwrap on set | `xin.ts:1498-1514` | Two loops identical apart from how keys are listed. |
| "Queue unless covered" | `path-listener.ts:382-386` and `401-408` | |
| Element to list item | `xin.ts:1038-1046` and `getListInstance` (`list-binding.ts:2089`) | Belongs in `metadata.ts`, beside the symbol both read. |

*The write path.* Every write first reads the same path back through the proxy
(`tosiValue(xin[fullPath])`) to compare, then calls `setByPath`, which compares again at
the leaf and returns `false` when nothing changed. Only the id-path leaf (`byIdPath`)
lacks that check. Give it one and the pre-read can go. Measured ✔ with a quick loop in
Bun, 200k iterations, to be read as a ratio and not as a benchmark: a write by path
string costs 516 ns, a read of the same path 396 ns, and `setByPath` plus `touch` alone
91 ns.

**b. Warnings**

Seventeen hand-rolled latches (`bind.ts:436, 739` · `contract-check.ts:85, 168` ·
`component.ts:1012, 1016, 1177, 1180, 1187, 1189` · `metadata.ts:156, 184` ·
`list-binding.ts:1222, 1281` · `xin.ts:1078` · `declarative-binding.ts:312` ·
`agent.ts:2362`), three separate test resets (`_resetShadowWarning`,
`_resetDeprecationWarnings`, `_resetPostureNotices`), and `settings.quiet` consulted at
six of about 46 `console.warn`/`console.error` sites.

One `warnOnce(key, message, { advisory })` in one module: one latch store, one reset for
tests, and `quiet` applied by the rule `settings.ts` already states (advice is silenced,
defect reports never are). This closes F9 and removes the test-order flake class that
`_resetShadowWarning`'s own comment describes.

Deprecations then become a table: `{ key, since, replacement, removedIn }`. Call sites
pass a key, the message is built from the row, and the 2.0 purge inventory is generated
from the table. The hand-kept inventory in the archive is already stale (see 2.1).

**c. DOM helpers**

| Merge | Copies |
| --- | --- |
| camel ↔ kebab | `string-case.ts`; inline at `elements.ts:972`; `kebabToCamel` at `declarative-binding.ts:228`, which is spelled differently and is the only locale-safe copy (F1) |
| Hop out of a shadow root | `bind.ts`: `closestAcrossShadow` (555), `nextAcrossShadow` (572), `parentAcrossShadow` (584), `warnIfShadowed` (750). `nextAcrossShadow(el, s)` is exactly `closestAcrossShadow(parentAcrossShadow(el), s)`. `agent.ts:1159` `closestAcrossRoots` is the same function again. |
| Set or remove a boolean attribute | `elements.ts:525-533` and `581-589`, `declarative-binding.ts:255-260`, `component.ts:1201-1204`, `2733-2737` |
| Get-or-create an element's bindings | `bind.ts:699-705` and `814-820` |
| Ancestors of a path | `agent.ts:1263` and `declarative-binding.ts:252` |

**d. Elements, components, lists**

| Merge | Copies |
| --- | --- |
| The three creator proxies | `elements.ts:968, 989, 1009` differ only in namespace and kebab-casing. One factory. |
| Typed-override lookup in the attribute getter | `component.ts:2481-2487` defines a closure on every property read; `2516-2522` repeats its body inline. |
| Columns and viewport of a virtual list | `list-binding.ts:1465-1468` and `2170-2173` |
| Media-query strings | `css.ts:806-816` and `827-835` |

**e. Agent surface**

The second reviewer returned forty findings for `agent.ts`, `webmcp.ts`, `audit.ts`,
`contract.ts` and `contract-check.ts`. F10 to F12 came from that list. These are the
merges; most of them are places where the copies already differ.

| Merge | Copies | How they differ |
| --- | --- | --- |
| "May this record's text be published?" | four harvest sites: `agent.ts:2884-2892`, `2922-2936`, `2990-3000`, `3202-3211` | Only the heading site sets `textWithheld` when scope is what blocks. Elsewhere the text is withheld with no mark, and the audit then reports a button with visible text as an anonymous affordance. Next to board #1673, but here the decision field itself is under-set. |
| Which paths an inline contract governs | `describe()` files it under one path (`agent.ts:2773`, `3009`); `write()` matches any bound path exactly (`:2284`); curated contracts use `extendsPath` (`:3311`) | A write to an ancestor path skips the inline contract, which is the bypass the curated branch closes. |
| The manifest gate | `agent.ts:2435, 2536-2537, 2573-2576` and `declarative-binding.ts:239-248, 306-310` | The same three predicates in two closures. The agent's resolver refuses a non-path; the other drops it silently (board #4044). |
| "Is this element secret?" | `agent.ts:1174-1176`, `2549-2551`, `2149-2150` | `contentWithheld` begins with exactly `referencedNodeIsSecret`'s three tests, and two call sites (`:1092-1093`, `:1219-1220`) run both, so each referenced node gets two deep subtree scans. |
| "Unobserve what is still ours" | guarded at `agent.ts:3421, 3510, 3535`; unguarded at `:3620-3621` | F12. |
| Bound elements at or under X | `bind.ts:470`, `list-binding.ts:1200`, `agent.ts:3113, 3125` | `describe({ scope: el })` leaves out `el` itself, and reads `document.body` raw (`:2730`) where `bind.ts` has `delegationRoot()` for the head-script case. |
| The redacted read | `agent.ts:2658` and `2342-2343` | Kept in step by a test, as its own comment says (`:2337-2339`). |
| Free-text harvest | `agent.ts:2890`, `2932-2934`, `2995-2998`, `3219-3222`, `1221`, `1094` | One expression, five variants: two skip the arrow neutraliser and one is uncapped. |
| An id-path segment | `agent.ts:1836`, `path-listener.ts:217`, `list-binding.ts:1813-1814` | Three sites, three different guards for a null id. |
| A value computed twice | posture at `agent.ts:2474` and `3266`; the arrow glyph at `:2318` and `:2347`; `roots` and `exposedActions` defaulted with `?? []` at seven sites | |

Dead in the same files: `boundPaths` is written and never read (`agent.ts:2740, 2791`) ·
`unindexedSecrets` can never be populated (`:1298`, the `try` wraps a regex `exec`) · an
unreachable handler branch (`:2844-2845`; `on()` already stored the path) ·
`record.text === undefined` is always true (`:3204, 3212`) · `boundValue`'s `secret`
parameter and `isSecretControl`'s `type` parameter never change an answer (`:2340`,
`:2219`) · `describeElement` sets `record.secret` three times, the last two redundantly.

Comments that assert a mechanism the code does not have: `agent.ts:2431` cites
`curationHonoured()`, which does not exist · `:3213` cites lines "(2234, 2255, 2296)"
that are now 2890, 2932 and 2995 · `agent.ts:2706-2727` and `:3090-3111` tell the same
story twice in different words · `metadata.ts:351` (the `bindingGeneration` claim in 1.1).

Two robustness items the reviewer flagged that would change behaviour, so they are for
you to decide and not for Phase 1: `ariaHidden()` stops looking after 12 ancestors
(`agent.ts:2295`), and the up-front secrecy scan is the one `catch` in that code that
fails open (`:1563`) where its four siblings fail closed. Also outside Phase 1 because it
adds to the surface: `AgentChange` and `AgentSettled` are named in public signatures
(`agent.ts:902, 936`) and exported from no entry.

On `bindingGeneration` (1.1): `refreshSecretPaths` has no cache, by decision. It runs
`deepQueryAll(document, …)` on every `describe`, `read`, `when` and `changes`, and the
comment at `agent.ts:1484-1528` records the generation cache being added, measured and
reverted as a security regression. Deleting the counter finishes that revert; it does
not reopen the decision.

### 1.3 Declarations derived from the data they describe

A type written beside the value it describes is a second copy of a fact.

| Derive | From | Today |
| --- | --- | --- |
| The named-colour type | `cssColors` (`css-colors.ts`) | `css-system-color.ts` is a second list and has already drifted: 147 names against 148, missing `rebeccapurple` ✔. It is also named `CSSSystemColor` and lists named colours. |
| `ElementsProxy` | `HTMLElementTagNameMap` | 125 hand-listed tags, including `acronym`, `basefont`, `big`, `center`. Deriving it also answers board #1654. |
| `TosiFactory` | the object `makeComponent` passes | The 17 members are listed twice (`make-component.ts:15-36` and `100-118`). |
| `FormValidation` | `Component` | The interface restates Component's form API; Component does not declare that it implements it. |
| CSS value unions | a spell pass at least | `css-types.ts:25` `'aternate-reverse'`, `:26` `'node'` for `'none'`. These are autocomplete, and they suggest typos. |

### 1.4 Teardown and caches

- **List binding** (F4, F5): self-retiring handlers, as above.
- **Shadow styles are regenerated per instance.** `hydrate()` runs `css(shadowStyleSpec)`,
  builds a `<style>` and then clones it, for every instance (`component.ts:2864-2879`).
  ✔ Two instances carried separate, identical 2.8 kB style nodes; `css()` on a 25-rule
  spec took 15 µs each time. Cache the generated node per class in a `WeakMap` and clone
  that. (Sharing one constructable stylesheet through `adoptedStyleSheets` is the larger
  win but changes what a consumer sees in the shadow root, so it is a Phase 2 question.)
- **`handleBoundEvent`** allocates a `Proxy` and a `Set` for every event of a handled type
  before it knows any handler exists (`bind.ts:856-869`). Return early when the walk finds
  no handler element.

### 1.5 Structure, with no behaviour change

| Function | Size | Seam |
| --- | --- | --- |
| `buildLibrary()` | `bin/site.ts:259-933`, about 675 lines | Every build gate is inline. One named function per gate; per-phase timing (board #1748) then costs one wrapper. |
| `enableAgentInterface()` | `agent.ts:2376` to about 3700, one closure; `describe()` is `2673-3290` | It is four modules in one file: types and constants (`321-955`), secrecy (`1101-1180` and `1225-1882`, about 740 lines with no per-surface state), element description (`975-1099`, `1182-1223`, `1884-2359`) and the surface closure. `describe()` reads only posture frozen at enable and never the ledger or the subscriptions, so it lifts out whole, which takes the closure from about 1,390 lines to about 780. `recordFor` (`2732-3089`) then splits along its own comment headings. The merges in 1.2e are what this split is for. |
| `regHandler.get` | `xin.ts:1288-1481` | Falls out of 1.2a: resolve, then wrap. |
| `ListBinding.update` and `visibleSlice` | `list-binding.ts:1611-1871`, `1436-1601` | Fixed-height and variable-height are two strategies interleaved by `if (virtual.minHeight != null)`. The archive already asks for this split. |

Doc comments that sit above the wrong declaration, because another was inserted between
them and their target: `bind.ts:414-425` (written for `hydrateInsertedSubtree`),
`elements.ts:613-628` (for `mergeElementProps`), `component.ts:1328-1353` (for
`withAttributes`). The second reviewer found four more: `agent.ts:370-387` (so the
exported `ComponentMap` has no doc), `:1441-1455` and `:1484-1528` (both written for
`refreshSecretPaths`), `:1884-1909`, and `webmcp.ts:250-262`.

**Comments.** This is a judgement and yours to make. Comment lines are 41% of code lines
overall and equal to code in `agent.ts`. Many record how a bug was found and which review
round found it. That history is also in `CHANGELOG.md`, `reviews/` and git, and since
1.10.2 the source ships in the tarball, where comments and doc blocks are 0.53 MB of
about 0.9 MB. A workable rule: the comment keeps the invariant and one pointer, the story
lives where history lives. I would not do this as a sweep; I would do it file by file
whenever one of the packages above touches the code.

### 1.6 Tests and build

- **A differential test for the proxy.** For generated state and paths, a read through
  `xin[path]` must equal `getByPath(registry, path)`. F2, F3, F6 and F7 are all cases
  where they disagree, and a few dozen generated shapes (null elements, `=` in ids,
  null-prototype objects, `length` keys) would have found each.
- **A locale lane.** One Firefox and one WebKit run of the doc tests under `tr-TR`.
- **One Playwright harness.** Seven spec files each read `dist/module.js`, pick an origin
  and wire `page.route`. Four unit-test files define the same `tick`.
- **Wrong-layer imports** are already measured on the board: `tosijs/state` carries the
  DOM layer through one import (#3543: 18.4 to 5.5 kB gz) and list binding (#2838). They
  belong to this phase's spirit and to #4022's scope; I add nothing to those cards.

### 1.7 Documentation, without changing the API

Surveyed: `README.md`, `Building-Apps.md`, `Migration.md`, `React.md`, `Angular.md`,
`llms.txt`, the nine pages in `src/docs/` and the 27 `/*# … */` doc blocks, about 9,500
lines, by a second reviewer. Everything quoted below I checked against the file.

**Wrong today**

| What | Where |
| --- | --- |
| **The README's only component example throws.** ✔ `static shadowStyleSpec = css({…})` hands `css()`'s string to a field that takes a style object; hydration calls `css()` on it again and throws "top-level string value only allowed for `@import`". It is also a shadow-DOM component extending `Component` directly, two lines above the advice to use `withAttributes()`. | `README.md:220-230` |
| **`Migration.md` still gives the security advice `agent.ts` retracts.** Migration: "Marking the control itself, or its immediate wrapper, works in all of them and is the reliable form." The agent page: that sentence's "first half is false in ALL THREE shapes above". | `Migration.md:64-65` vs `agent.ts:208-215` |
| `<xin-slot>` is documented as removed in 1.8.0; the code registers it and says it goes in 2.0. | `component.ts:306`, `Migration.md:285-292` vs `component.ts:3037-3050` |
| The agent surface's cost is "roughly 15 kB" by hand in two places and a generated 18.5 kB in the README. One of the two is in the paragraph that says "This paragraph deliberately states no digits." | `index-agent.ts:40-41, 55` · `index-core.ts:16` · `README.md:98-99` |
| `styleNode` is documented as the way a component gets a shadow root, on the same page that says `shadowStyleSpec` is. | `component.ts:142, 437-448, 774` vs `:83` |
| The metadata page gives `xinValue` and `xinPath` (deprecated) a section each and has none for `tosiValue` / `tosiPath`, which its own description promises. | `metadata.ts:1, 34-58` |
| The CSS page teaches `initVars({…})` unmarked, with `background.toHTML`, a property `Color` does not have. | `css.ts:273-277` |
| The list binding's documented options include `initInstance` and `updateInstance`, which exist nowhere in the code. ✔ | `bindings.ts:100-101, 107-110` |
| Names that do not exist: `Stylesheet()` for `StyleSheet()`, `Color.fromCSS()` for `fromCss()`; the throttle example calls `debounce` for both. | `css.ts:51, 56` · `color.ts:27` · `throttle.ts:9` |
| Examples that cannot run as written: `':root', {` (comma for colon); a live list example that calls `touch()` without importing it. The reviewer lists twelve such; I checked the ones in this table. | `css.ts:95` · `list-binding.ts:866, 894` |

**The docs disagree about what to teach**

| Question | One answer | Another |
| --- | --- | --- |
| What is `observe` for? | "`observe` is for reactions that touch **no DOM**" (`src/docs/bind-vs-observe.md:10`) | The README's first `observe` toggles a body class (`README.md:331-333`); "Toggle a body class… That's what `observe()` is for" (`Building-Apps.md:366-367`). The dark-mode toggle is shown five times: three with `observe`, two with `bind`. |
| Does `find` give proxies? | "Array callbacks like `find` and `forEach` pass raw items" (`Building-Apps.md:310`) | "`for…of` and `.find()` give you proxies" (`Building-Apps.md:699`). Both are half of it: the callback gets raw items, the result is proxied (`xin.ts:1444-1464`). |
| Which form takes a path string? | "`bindText` … is the only form that takes a path string" (`Building-Apps.md:112-114`) | "For a path **string** … use the inline form" (same paragraph, `:110-111`) |
| Are scalars proxied? | "but not scalars" (`README.md:344-347`) | "It boxes booleans, numbers, and strings" (`xin.ts:9-11`) |
| Which attribute form is recommended? | `withAttributes`: "the recommended form for new components" (`component.ts:503-504`) | `static initAttributes`: "the stable, terse way … what most components use" (`component.ts:544-545`) |
| How do you filter a list? | `hiddenProp` / `visibleProp`, in an options list that omits `filter` (`bindings.ts:98-105, 138-140`) | "**This is the way to filter or sort a bound list**", about `filter` + `needle` (`list-binding.ts:844`) |
| `.value` or `.tosi.value`? | `.value` is "the everyday spelling" (`xin.ts:469-470`) | "use `.tosi.value`, `.tosi.path`" (`xin.ts:519-520`) |
| Can data shadow `.tosi`? | yes (`metadata.ts:10-11`) | no (`metadata.ts:18`). No is right ✔. |

**How many spellings the docs show per task** (the reviewer's inventory, one file:line
each): read a value, 11 · write a value, 10 · bind text, 10 · attach an event handler,
10 · theme or dark mode, 8 · two-way bind a control, 7 · render a list, 7. There are three
to-do apps (`README.md:111-167`, `xin.ts:728-770`, `Building-Apps.md:267-306`) and each
uses a different set of spellings.

**The first hour.** The hello-world at `README.md:29-39` is good and comes first. The next
runnable thing is the to-do list at `:111-167`, and it teaches the escape hatch: it
mutates the raw object and calls `touch()`, removes rows with `deleteListItem`, and
appends to a `preview` the README never defines. Between the two, `README.md:83-109`
names about thirteen things without explaining them (virtual lists, three entry points,
the agent surface, blueprints, share and sync).

**What to do**

1. **Decide the canonical spelling per task once.** The Phase 2 tables are that decision.
   Then gate it: a test that fails when a doc uses a non-canonical spelling outside a
   section marked legacy. The repo already gates budget comments the same way.
2. **One to-do app,** written in the canonical spellings, reused wherever one is needed.
3. **Explain each concept in one place and link to it.** About thirty concepts are
   explained two to seven times ("what `tosi()` returns" in seven places, bind against
   observe in five, and those five disagree).
4. **Run the display-only examples.** The README example that throws is an indented
   block, which nothing executes. Board #1712 already asks for this.
5. **Fix the "wrong today" table now.** None of it needs a design decision.

Related cards: #3246 (docs pass findings), #3127 (exports never mentioned in docs),
#1717, #1712.

### 1.8 Message text: your call

About 6.3 kB gzipped of `module.js` is prose in warnings and errors (3.5 kB of the
script-tag build, 1.1 kB of `tosijs/state`). The messages teach, which is why they are
long. Once 1.2b exists there is one place to decide: keep them, or ship a short message
with a link to a docs page that carries the teaching. I would keep defect reports whole
and shorten advice. Board #4022 already names this lever.

---

## Phase 2: one way to do each thing

### 2.1 Finish the purge already promised

The inventory in `reviews/TODO-archive-2026-09-26.md` § "2.0 — THE PURGE INVENTORY" is a
snapshot of 1.8.2, and says so. Re-derived today, it is missing:

| Missing from the inventory | Where | Status today |
| --- | --- | --- |
| `.take()` (renamed `.as()`) | `xin.ts:1175` | warns, key `take` |
| `static StyleNode()` | `component.ts:1706` | warns on every call, outside the registry |
| instance `styleNode` | `component.ts:2869` | warns on every hydrate, outside the registry |
| static `styleNode` | `component.ts:2864` | honoured silently |
| blueprint spec `styleSpec` | `make-component.ts:60, 126` | `@deprecated` in the type, no warning |
| `-xin-empty-list` class | `list-binding.ts:1638` | emitted beside `-tosi-empty-list`; kith-email styles the old one |
| `.xinValue` and friends on object proxies; `'xinValue'`/`'tosiValue'` as set keys | `xin.ts:1374-1378`, `1525-1526` | honoured silently (F9) |
| `xinjs` / `xinjsui` globals | `index-iife.ts:32-33` | doc bundle only |
| `'xin-state'` storage key | `hot-reload.ts:87, 106` | naming residue; renaming needs a read-old, write-new step |

One more reason to prioritise the style entries: `styleSpec` means the **shadow** sheet as
`static styleSpec` (`component.ts:2857`) and the **light** sheet as
`elementCreator({ styleSpec })` (`:1777`) and in a blueprint spec. The same name, opposite
meanings.

Ecosystem state of the already-deprecated spellings: `xinValue(` 19 (manta-recon),
`this.initAttributes(` 2 and `xin-slot` 4 (loewald-dot-com), `static styleSpec` 1
(editor2), `elementCreator({…})` 26 (kith-email 14, lukko 6; both pinned to 1.3.7 / ^1.4
and unaffected until they upgrade), `.take(` 1 (tosijs-3d), `Xin*` type names about 90
(`XinStyleSheet` 47, `XinStyleRule` 22). tosijs-ui has to move off the `Xin*` types before
they can go.

### 2.2 New candidates

Each row is a second way to do something another spelling already does. "Uses" is the
count across the 24 repos.

| Task | Redundant spelling | Same as | Uses | Notes |
| --- | --- | --- | --- | --- |
| Create state | `xinProxy(obj)` | `tosi(obj)`, which has 125 uses in 11 repos | 3, all ngx-tosijs | Not deprecated today; only its `(obj, true)` form is. Returns the unboxed `xin`, so it also keeps the dual-proxy split alive. |
| Reach the accessor | `tosiAccessor(p)`, `p[TOSI_ACCESSOR]` | `p.tosi` | 0 and 0 | The trap serves `.tosi` before it looks at data (`xin.ts:1301`), so it cannot be shadowed ✔. Three spellings for one guaranteed thing. |
| Replace a value | `tosiSetValue(p, v)` | `p.value = v` ✔ | 0 | Not mentioned in any guide or doc block. |
| Bind from the proxy | `p.bind(el, binding)` | `bind(el, p, binding)` | 0 as `.tosi.bind(` | Argument order is the only difference. |
| Listen from the proxy | `p.on(el, type)` | `on(el, type, p)` or `onClick: p` | 0 as `.tosi.on(` | Also the source of F8. |
| Build an inline binding | `p.binding(b)` | `{ bind: { value: p, binding: b } }` | 0 | |
| Observe | `observe(path, 'path.to.fn')` | `observe(path, fn)` | 0 | Undocumented; two unit tests are its only callers. |
| CSS variable with a fallback | `vars.default.x(v)` | `varDefault.x(v)`, 326 uses | 0 | Not mentioned in any guide or doc block. |
| Element to list item | `getListInstance(el)` | `getListItem(el)`, 18 uses | 0 | Keep as an internal helper. |
| Delete a list item | `deleteListItem(el)` | `list.listRemove(…)` | 0 | It also requires `idPath`, although all it does is an `indexOf` and a `splice`. |
| Find the item for an element | `list.listFind(el)` | `getListItem(el)` | 0 | One job, two entry points. `getListItem` has every user and needs no reference to the list. Keep one. |
| Hide list items by a flag | `visibleProp` | `hiddenProp`, negated | 0 (and 1) | A mirror pair. |
| Mix two colours | `.mix()`, `.colorMix()` | `.blend()` | 0, 0 (and 2) | `colorMix` round-trips through a DOM element and computed style. Fold into #1693 / #1694. |
| A colour as text | `.html` | `String(color)` | not counted | An alias. |
| Component tag name | derived from the class name | `static preferredTagName` | 157 statics against 163 `elementCreator()` calls | `CLAUDE.md` already calls the fallback unreliable under minification, and F1 hits it. Warn when it is used; require the static in 2.0. |
| Component role | a `role` instance field, reflected at connect (`component.ts:2644`) | `contract.role`, or a `role` host prop | 0 | Undocumented. |

Taken together, the accessor rows shrink the accessor from 13 names to 9
(`value`, `path`, `touch`, `observe`, `as`, `listBinding`, `listFind`, `listUpdate`,
`listRemove`), and the unboxing rows plus 2.1 take "read a proxy's value" from eleven
spellings to three:

| Keep | For |
| --- | --- |
| `p.value` / `p.path` | everyday use |
| `p.tosi.value` / `p.tosi.path` | when the data has its own `value` or `path` key |
| `tosiValue(x)` / `tosiPath(x)` | when `x` may not be a proxy |

(`valueOf()` and `toJSON()` remain; they are JavaScript's own coercion hooks, not API to
teach.)

`Symbol.for('xin-value')` stays as a protocol constant, exported once under a tosi name as
board #4015 asks: tjs-lang recognises a proxy by it. It is not a fourth way to unbox.

### 2.3 Not proposing

Things that look redundant and that I am leaving alone, with the reason.

- **The `bind*` shortcuts** (`bindText`, `bindValue`, `bindList`, `bindEnabled`,
  `bindDisabled`). Settled in 1.9.1: they are the only form that binds a path string.
  `bindEnabled` and `bindDisabled` have no users, which is worth knowing and does not
  change the reasoning.
- **`static initAttributes` beside `withAttributes()`.** Settled: `withAttributes` emits
  the static, and the static is the only way to add attributes to an existing class. The
  docs should teach one first (see 1.7).
- **`filter` / `needle`.** You said on #3277 that it stays until `.as()` is built to
  replace it.
- **Inline `bind: { value, binding }`.** Replacing it with `.as()` is already a 2.0
  intention. The counts say it is real work: 57 inline `bind:` (tosijs-virta 23,
  kith-email 22) against zero `.as(`. It needs a codemod, and two-way custom bindings need
  somewhere to go (a named entry in `bindings`).
- **`xin` beside `boxed`.** Boxed-only is already a 2.0 intention. `xin.` appears 15 times
  in 3 repos, `boxed.` never.
- **`observe()` returning a `Listener` while `proxy.observe()` returns a stop function.**
  #3485 was answered by making `unobserve` accept both. Returning one kind of handle would
  be tidier and is not worth a breaking change by itself.
- **Blueprints beside classes, `share` beside `sync`, `StyleSheet` beside `css`.** Different
  jobs.

### 2.4 Unused, but not redundant

Not recommendations. These are exports with no caller in the 24 repos that do not
duplicate anything, listed because "leaner" may want them moved rather than kept:
`bindParts`, `touchElement`, `tosiUnique`, `getCssVar`, `onStylesheetChange`,
`getThemePreferences` / `onThemePreferencesChange`, `hotReload`, `mathML`,
`validateAgainstConstraints`, `setContractValidator`, `BOUND_CLASS` / `BOUND_SELECTOR`,
`TAKE_DESCRIPTOR`, `enableDeclarativeBinding` (new in 1.10.11), and the `tosijs/core`,
`tosijs/state` and `tosijs/agent` entry points (react-tosijs, the stated consumer of
`tosijs/state`, is not on this machine).

Two are worth a decision:

- **`tosijs/debug` and `tosijs/safe`.** `CLAUDE.md` describes them as experimental and
  currently inert. They are the two largest files in the package (259 kB each, 18% of the
  payload), nothing imports them, and building them is the `tjs convert` step with its
  known log noise. Keep them as the 2.0 on-ramp, or stop shipping them until enforcement
  exists.
- **`hotReload` beside `share`.** Both make state survive a reload. `hotReload` has no
  callers; `share` has one.

### 2.5 How to run Phase 2

1. **1.11.0 deprecates, and breaks nothing.** Each row in 2.2 gets a row in the
   deprecation table from 1.2b and warns once. The docs teach the surviving spelling only.
2. **Migrate the ecosystem** with a codemod per row, starting with tosijs-ui (the `Xin*`
   types) and the repos named above. A row is ready for removal when the 24 repos are
   clean and a scratch consumer compiles.
3. **2.0 deletes**, one commit per category (types, runtime, markup), as the purge
   inventory already prescribes. Markup tombstones go last.

---

## Order of work

| Step | Content | Release |
| --- | --- | --- |
| 1 | F1, F2, F3, F10, the "wrong today" docs table, the locale test and the differential test | 1.10.13 |
| 1b | F4, F5, F11, F12, and F13 once decided | patch |
| 2 | 1.1 deletions | patch |
| 3 | 1.2b `warnOnce` and the deprecation table (closes F9) | patch |
| 4 | 1.2a state core (closes F6, F7, F8 and removes the cause of F2, F3) | patch |
| 5 | 1.2c, 1.2d, 1.2e, 1.3, 1.4 | patches |
| 6 | 1.5 structure, one file per change; 1.6 harness | no release needed |
| 7 | 1.7 docs | with any release |
| 8 | 2.5 step 1 | 1.11.0 |
| 9 | 2.5 steps 2 and 3 | 2.0 |

Each step that removes bytes lowers the budgets in `bin/bundles.ts`, which is what board
#4022 asks for. I have not estimated bytes for any of it; the build's gz table will say.

## What this did not cover

- `schematic.ts` is vendored; its cleanup belongs to tosijs-floorplan.
- The 23,000 lines of tests were sampled for repeated harness code, not reviewed.
- tosijs-ui and the other consumers were counted, not read.
- Usage outside the 24 repos is unknown.
- Nothing here was prototyped. The fixes for F1 to F13 are sketches until they have tests.
- Of the second reviewer's forty agent-surface findings I ran three and read the sites of
  the rest that are quoted here. The ones not quoted are in the review's own report, which
  I can attach to a card if you want them.
