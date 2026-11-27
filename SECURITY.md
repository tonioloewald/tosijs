# Security policy

## Reporting a vulnerability

**Email `tloewald@gmail.com`** with `tosijs security` in the subject. Please do
not open a public issue for an unreported vulnerability.

Include what you have — a minimal reproduction is worth more than a careful
writeup, and a careful writeup is worth more than nothing. You should get an
acknowledgement within a few days.

This is a small project maintained by one person. There is no bounty and no
guaranteed response time. What there is: a private address, and a maintainer who
would rather hear about it from you than from a consumer.

## Supported versions

Fixes land on the current minor. There are no maintenance branches — if you are
on an older line, the upgrade path is forward.

| version | supported |
| --- | --- |
| the current minor | ✅ |
| anything older | ❌ — upgrade |

(Deliberately not numbered. A hardcoded table here said `1.11.x ✅ / ≤ 1.10.x ❌`
while the published `latest` was 1.10.2 — so the policy told every reporter their
version was unsupported and pointed them at a release that did not exist. It
shipped that way, because a renumber updated the two references further down this
file and missed these two.)

## Scope, and what the agent surface changes about it

Most of tosijs has no security boundary in it: it is a state library and a DOM
binding layer, running entirely in the page, with the same privileges as the
code that called it.

**The agent surface (`enableAgentInterface`) is the exception**, because it
exists to hand a description of your app to something that is not the author —
a model-context host, a browser agent, an automation. It is CLOSED by default
and refuses every verb until you declare a manifest; `expose: 'all'` is a
development posture and says so at runtime. Reports about that surface are the
ones most likely to be real, in particular:

- anything reaching `describe()`, `read()` or `changes()` that a declared
  manifest does not cover;
- anything defeating `data-tosi-secret` or the password/`autocomplete`
  heuristics — **`src/agent.ts` carries a list of shapes known NOT to be
  covered**, kept deliberately honest; a shape not on that list is a bug;
- a write or `call()` reaching a path or action the manifest did not declare.

**Two more places take untrusted input and are in scope:**

- **`enableDeclarativeBinding()`** (opt-in): markup that is not the author's
  binds against explicit `read`/`write`/`actions` grants. In scope: markup
  reading, writing or calling anything ungranted; a bound value executing
  (script, style, an `on*` or HTML sink); a value granted only `read` acting
  (`href`, `src` and other non-inert targets); a write replacing a granted
  action. Not in scope: disclosure of what you granted `read` to whoever wrote
  the markup, including a bound field inside a `<form action>` elsewhere (a
  `form-action` CSP is the control for that).
- **The path sink** (`setByPath`, the proxy, `share()`/`sync()` inbound): a
  path or key from data must never reach the prototype chain, whatever its
  spelling. (One known residual, for READS: a path through an inherited
  `constructor`. See below.)

### Disclosed in 1.10.13

Fixed in 1.10.13, with the detail in `CHANGELOG.md`:

- **A read could hand out a built-in prototype** through a `__proto__`
  segment: the `[=__proto__]` spelling, or `__proto__` anywhere but the end
  of a path. Every version tested from 1.6.0. App code that then changed
  what it had read changed every object; under `expose: 'all'`,
  `agent.call()` could run a prototype's method. The path engine refuses
  `__proto__` for reads now, as it did for writes.
- **A contract validator that returned `false` enforced nothing**, 1.8.0 to
  1.10.12. Register tosijs-schema's `validate` with `{ strict: true }`: bare,
  it samples.
- **Appending `=` to an id read a secret in cleartext through
  `agent.read()`**, 1.8.0 to 1.10.12.

Known and still open, so not news if you find them:

- **A read through an inherited `constructor`** returns the built-in
  constructor, and from it the prototype (`boxed.x.constructor.prototype.value`).
  Writes through the proxy are refused; the hand-out is to code that mutates
  what it read.
- **The agent surface's gates compare the path as the caller spelled it.**
  Under a manifest, `write('app[=checkout]', x)` overwrites a declared action,
  `write('app.gate[=level]', x)` skips an inline contract, a write to a
  parent path skips one too, and `read('app[=login].password')` returns a
  secret the dotted spelling withholds. Same cause as tosijs#32 and #52.

A respelling or a route NOT listed here is a bug worth reporting.

### Disclosed in 1.10.2

`describe()` published `href`, `placeholder`, `title`-as-`label`,
`aria-description` and a checkbox's `checked` state past `data-tosi-secret`, in
**every release that has ever had the agent surface** (1.8.0 through 1.10.1).
Fixed in 1.10.2.

**Deliberately not deprecated or filed as an advisory**, and it is worth being
clear why, because it also tells you what `data-tosi-secret` is for. Everything
that leaked is ordinary client-side DOM: any script on the page, any extension,
and anyone with devtools can read all of it with `querySelector` regardless of
what this library does. The marker asks *tosijs* not to copy those attributes
into a description — it is a redaction convenience, **not a control against
code already running in your origin**, and it cannot be made into one. The
failure disclosed nothing to a page-local attacker who could not already read
it.

The exception, and the reason the fix still matters: a description can **leave
the origin** — `tosi_describe` is registered with a model-context host in every
posture. If you pipe descriptions to such a host from a page carrying tokens in
links, treat those as having travelled. Full entry in `CHANGELOG.md`.
