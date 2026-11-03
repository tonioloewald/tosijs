# Agent abuse and limits — design note

> **Status: DESIGN, nothing shipped.** Written 2026-11-03 from a brainstorm
> with the owner. Not in `docPaths` on purpose: when pieces ship, they move
> into `trust-and-transports.md` (the published "governors" section) and
> the agent-surface docs, and this note is trimmed to what is still open.

## The question

How do we stop agents (one hijacked agent, or a swarm) from fuzzing a
tosijs UI through the agent surface, including at scale and across many
instances?

## The premise that shapes everything: two adversaries

**1. An adversary who controls the client** (a swarm, a scraper, a fuzzer).
It owns the browser. It does not need `enableAgentInterface()`: it can
drive the DOM, call the app's API directly, or patch tosijs in memory.
**Anything enforced in the page is advice to this adversary.** A limit that
holds "across instances" needs a shared counter that the instances cannot
forge, and that is a server. The `data-tosi-secret` docs already make the
same point about secrets: nothing in the page constrains code running in it.

So for this adversary the library's jobs are:
- give the **server** what it needs to enforce;
- **not lower the cost of attack** below what the DOM already allows.

**2. A legitimate user whose agent has gone wrong** (prompt-injected by page
content, a confused model, a runaway loop). Here the page *is* on the right
side, and in-page limits are real protection. They protect the user from
their own agent.

Each measure below says which adversary it addresses. Mixing them up is the
failure mode: client-side budgets presented as swarm defence would be
security theatre.

## Measures

### Server tier (adversary 1): the manifest enforced twice

The manifest already states what may be read, written and called, so it is
an API spec. **Proposal: the same manifest is enforced on the server**
against inbound `sync()` traffic (and any action endpoint):

- write grants and contracts checked server-side, so a forged client gets
  the same refusals an honest one does;
- action grants checked server-side;
- **budgets per session and per account**: writes/min, calls/min,
  refusals/min, with a cooling-off or a challenge when one is exceeded;
- refusal *rate* as an abuse signal: honest clients rarely get refused,
  fuzzers mostly do.

The client check is UX (fast, explanatory refusals). The server check is
the security boundary. **One manifest, two enforcement points**, so the two
cannot drift (the dedupe rule: two copies of a policy means one is wrong).

Delivery: a DOM-free validator in `tosijs/state` (manifest + contract
check, no surface), which a server can import. The server integration
itself belongs in **service-compris** (see *Cards to file*).

**Agent-origin marking (cheap, honest-client only).** `sync()` outbound
batches could carry an `origin: 'agent'` mark for writes made through the
surface, so a server can apply a separate policy and keep separate logs.
A hostile client can forge or omit it, so it is labelling, not defence.

### Don't hand out a map (adversary 1)

- **Actions declared but not shown.** A manifest action with no
  corresponding control in the UI is listed by `describe()` for anyone. That
  makes the surface a cheaper reconnaissance tool than the DOM. Proposal: a
  dev-time warning (and an `auditAccessibility()`-style finding) for a
  declared action nothing in the UI can trigger.
- **Refusals must not be an existence oracle.** For a path outside the
  manifest, every observable must be identical whether or not the path
  exists: refusal kind, message, timing, and `when()` behaviour. The
  `out-of-scope-state` note shows we reasoned about part of this; nobody has
  audited it end to end. Proposal: a property test generating out-of-scope
  paths (existing and not) and asserting indistinguishable refusals.

### In-page governors (adversary 2)

- **Budgets per surface.** Calls and writes per window, globally and per
  path (so one hot path cannot starve the rest). Past the budget the surface
  refuses with a new kind, `'rate'`. Defaults generous enough that no
  honest agent notices; configurable on `enableAgentInterface()`.
- **Refusal circuit breaker.** N refusals within a window switch the surface
  to `'revoked'` until the page re-enables it (and the page is told, via a
  callback or event, so it can show something). Cheapest high-value item:
  fuzzing is mostly refusals.
- **Shared across tabs.** One budget per origin over `BroadcastChannel`
  (reusing the `share()` machinery), so one agent cannot open 50 tabs to get
  50 allowances. This is the "across instances" limit the client *can*
  honestly provide. Note: same-origin and same-profile only.
- **Human confirmation for dangerous actions.** A manifest marks an action
  `confirm: true`; `call()` resolves only after a **trusted user gesture**
  (`event.isTrusted`) on a confirmation the page renders. An agent driving
  the page through the surface cannot synthesise that gesture. (An agent
  driving the *browser*, e.g. via CDP, can. That is adversary 1 again.)
- **Registration caps.** `observe()` / `when()` registrations per surface
  are unbounded today; the audit ledger is already capped (10,000). Cap
  them too, refusing with `'rate'`.

### Content leaving the page (both adversaries)

`describe()` copies user-authored text into a model's context: an
injection channel. We already refuse a forged ` ⟷ ` separator. Proposal:
records mark user-authored text (bound from state the manifest marks as
untrusted, or from contenteditable/inputs) as untrusted, so a WebMCP host
can quote it rather than follow it. No standard for that marking exists
yet (stamp below).

## How it fits with what's in flight

- **#3743, the page-level WebMCP tool registry.** Third-party tools
  registered into the page's one registry must count against the same
  budget and circuit breaker, and honour `confirm`. Otherwise a library's
  tools are an unmetered side door. Design the registry and the budgets
  together.
- **Refusal kinds** (`AgentRefusalKind`): adds `'rate'`. `'revoked'` covers
  the circuit breaker. Both reach WebMCP callers tagged, as #53 now
  guarantees.
- **`enableDeclarativeBinding()`**: markup-triggered actions are gesture
  events only (already shipped). `confirm: true` should apply there too.

## Cards (filed 2026-11-03, backlog)

**tosijs**
1. #3784 Refusal circuit breaker (`'revoked'` after N refusals/window, page
   notified).
2. #3785 Per-surface budgets + `'rate'` refusal kind; registration caps.
3. #3786 Cross-tab shared budget over `BroadcastChannel`.
4. #3787 `confirm: true` actions gated on a trusted gesture.
5. #3788 Existence-oracle property test for out-of-scope refusals.
6. #3789 Dev warning: declared action with no UI affordance.
7. #3790 DOM-free manifest/contract validator in `tosijs/state` for servers.
8. #3791 Agent-origin mark on `sync()` batches.
9. #3792 Untrusted-text marking in `describe()` records.

**tosijs-ui**
- #3793 A standard confirmation component for `confirm: true` actions (accessible,
  focus-trapped, says which action and with what arguments, requires a
  real click). Every app shouldn't hand-roll the one dialog whose job is to
  be unforgeable.
- #3794 An agent-activity indicator: the surface is live, recent calls, budget
  state, circuit-breaker tripped (with a "re-enable" control). A user
  should be able to see an agent is acting.

**service-compris** (server tier). The npm package is `service-compris`;
the repo and board project are still `tosijs-platform` (local checkout:
`../loewald-dot-com`), mid-rename.
- **#3795, #3796: the existing limiter cannot hold across instances, and may be bypassable
  per request** (`functions/src/utilities.ts`, read 2026-11-03):
  - The counter is an in-memory `Map` *per function instance*. Cloud
    Functions scale out under load, so a swarm's effective limit is
    100/min × the number of instances it causes, which is the case the limit
    exists for. A shared counter (Firestore, or Redis/Memorystore) is needed
    for "across instances" to mean anything.
  - **Likely bypass, to verify:** it keys on the *leftmost*
    `X-Forwarded-For` entry, on the stated assumption that Google's load
    balancer overwrites the header. As far as I know, Google's front end
    *appends* (`<client-supplied…>, <client-ip>, <lb-ip>`), so the leftmost
    entry is whatever the client sent, and rotating it resets the counter on
    every request. Verify against a deployed function (send a forged
    header, log what arrives) before changing it; if confirmed, key on the
    entry the platform adds, not the first one.
  - Keyed on IP only. Swarms rotate IPs; agent traffic should also be keyed
    by session and account.
- #3797 Enforce a tosijs manifest on inbound sync/action traffic using the
  `tosijs/state` validator (card 7).
- #3798 Budgets per session and per account, refusal-rate abuse detection,
  cooling-off/challenge.
- Separate logging/policy for agent-marked traffic.

## Open questions

- Whether service-compris sits on the `sync()` path or beside it. The
  server cards assume it can see sync traffic; it does not use tosijs's
  `SyncTransport` today, so the manifest check may have to sit at its own
  write endpoints instead.
- Default budget numbers. They need a measurement of honest agent traffic
  (e.g. the `/one-user-interface/` demo driven by a real model) before any
  default is chosen.
- Should a tripped circuit breaker persist across reloads (`sessionStorage`)?
  It is per-profile anyway, and the page owner may prefer a fresh start.
- Is `'rate'` one kind, or `'rate'` (budget) vs `'revoked'` (breaker)? The
  draft above uses both; a caller retrying on `'rate'` must not retry on
  `'revoked'`.

<!-- as-of: 2026-11-03 | no standard exists for marking untrusted text in WebMCP tool results; WebMCP itself is in origin trial (see agent-surface.md stamp) -->
