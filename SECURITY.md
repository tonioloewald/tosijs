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
| 1.11.x | ✅ |
| ≤ 1.10.x | ❌ — upgrade |

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

### Disclosed in 1.11.0

`describe()` published `href`, `placeholder`, `title`-as-`label`,
`aria-description` and a checkbox's `checked` state past `data-tosi-secret`, in
**every release that has ever had the agent surface** (1.8.0 through 1.10.1).
Fixed in 1.11.0.

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
