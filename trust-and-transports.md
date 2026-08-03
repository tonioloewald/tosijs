# Trust & Transports
<!--{ "parent": "One User Interface", "order": 3, "description": "The honest section — constraint bypass, capability scoping, secrets, prompt injection, audit — and the three transport distances." }-->

*Part of [One User Interface](/one-user-interface/) — what could go wrong, the governors (some shipped, some planned), and how far away an agent can stand.*

> **Status:** constraint enforcement **shipped** (the contract seam:
> validated writes, audited refusals, whole-root proposals). The audit log
> **shipped**. Capability sandboxing (AJS/lukko) is **not started**. Of the
> transports: in-page **shipped** (`tosiAgent`), bridged **shipped by
> haltija** (`hj map`'s native tier), remote sync-peer **not started**.

## Trust: the honest section

Direct model access is a superpower, and superpowers need governors. Naming the
problems now, with their planned answers:

- **Constraint bypass — CLOSED.** DOM-layer validation (`min`/`required`)
  never guarded path writes; now the **contract seam** does: schema-checked
  writes, refusals thrown *with reasons* and audited, sub-path writes judged
  as the whole root they'd produce. Agent writes are *more* validated than
  forged clicks, not less.
  Stated as sharply as it deserves: **state-level validation is a hard
  prerequisite for production write access, not an enhancement.** Manifest
  mode alone scopes *which* paths an agent may write, but nothing about what
  it writes there — a scoped agent can still silently install illegal states
  the visual UI could never have produced. Until contracts land, the honest
  production posture is read/observe/call-only; open `write()` is a dev-mode
  affordance.
- **Capability scoping.** "Run agent logic" must not mean "eval in my page."
  **tjs-lang's AJS** — gas-metered sandbox with injected capabilities — is the
  boundary: the sandbox receives a proxy scoped to exposed roots, nothing else.
  No `document`, no `fetch`, no unexposed state. (**lukko**'s
  capability-security work is the same concern from the middleware side; one
  design should serve both.)
- **Secrets and PII.** Introspection mode is a dev tool; production is
  manifest-only, allowlist, never denylist. The registry commonly holds tokens
  and user data — `describe()` must make *not* exposing them the path of least
  resistance. (This is the rendered-vs-resident asymmetry from
  [The Agent Surface](/agent-surface/)’s exposure tiers:
  the map can see everything the app is *holding*, not just showing.)
- **Prompt injection.** An agent's *inputs* (page content, fetched data) can be
  hostile even when its state access is scoped. Scoping limits blast radius —
  an agent that can only touch `app.cart` can't exfiltrate `app.auth` — and the
  audit log makes what happened inspectable. This is a reason *for* the
  path-level interface: "clicked around the DOM" is unauditable; `write()`
  calls are a ledger.
- **Audit.** Every mutation through the surface lands in `agent.log()` — the
  same path-touch stream DevTools consumes. One interface also means one place
  to watch.

## Transports: same surface, three distances

1. **In-page** — the global, for extension content scripts and injected agents.
2. **Bridged** — **haltija** detects the surface on page and exposes it as an
   MCP toolset (`read`/`write`/`observe`/`describe`/`call`), falling back to
   human-style DOM driving on pages without it. MCP is an *adapter here, not
   the core* — protocols come and go; paths are forever.
3. **Remote** — the striking one: **`sync.ts` already makes the agent a peer.**
   `SyncTransport` is pluggable and speaks `{path, value}` deltas with echo
   prevention solved. An MCP server implementing `SyncTransport` joins the
   state graph like any collaborative backend — the agent needn't be in the
   browser at all.

