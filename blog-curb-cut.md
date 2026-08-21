<!-- as-of: 2026-08-21 | blog draft: WebMCP/Chrome status, who has shipped agent
     exposure (Shopify/Cloudflare/Angular/crawlers), the "a11y structure got
     worse for the first time in six years" survey finding, and the measured
     size of the tosijs agent surface. Re-check all five before publishing. -->

<img alt="person on escooter using curb cut" src="https://firebasestorage.googleapis.com/v0/b/liquid-force-425209-g2.appspot.com/o/blog%2Fperson-on-escooter-using-curb-cut?alt=media&token=017c594f-58d2-4cbb-929f-f79ec7a245bd" style="width: 1174px; aspect-ratio: 1174 / 1174;">

Just as curb cuts for wheelchairs ended up benefiting cyclists and people with rolling luggage, designing a solid user interface architecture for one platform gives you a massive head start everywhere else.

But now, user interface designers have inherited a completely new type of user: Agents.

My mental model of an AI agent navigating a *graphical* user interface is a blind polymath who speed-reads braille. They don't "see" things; they read descriptions of things. Ideally, *structural* descriptions. When you realize this, the way we currently force agents to interact with web apps is absurd.

## The Status Quo: Guessing the Floorplan from Street View

<img alt="street view" src="https://firebasestorage.googleapis.com/v0/b/liquid-force-425209-g2.appspot.com/o/blog%2Fstreet-view.png?alt=media&token=19950e9d-f624-4378-86d2-a8e7d49a192d" style="width: 1333px; aspect-ratio: 1333 / 738;">

> Agents currently try to navigate apps by surface detail. It's like trying to infer the floorplan and wiring of a house from street view. I used to live in this house and I can't figure out what went where from this.

Most agents still interact with browsers through Playwright scripts, CDP, or visual screenshot loops. They treat the web page as an opaque, external artifact. They are either trying to "see" pixels—which requires jumping through heavy WebRTC security hoops and dealing with visual noise—or they are reverse-engineering an unholy mess of mutated HTML nodes.

If you've ever tried to extract semantics from the DOM via the console, you know it's a nightmare. This is why tools like my [haltija](https://www.npmjs.com/package/haltija) library exist: to help agents translate what's displayed into highly optimized tokens. But it's still fundamentally a hack. You are forcing the agent to play text-based archaeology on a rendered page.

The industry noticed. **WebMCP**—a W3C proposal from Google and Microsoft—lets a page hand agents typed, callable tools directly, and it's real: a public Chrome origin trial, `document.modelContext`, default-on across Shopify storefronts and any site behind Cloudflare.

So the interesting question is no longer *should the page tell the agent what's possible*. That argument is over. The question is **where that description comes from, and what it costs to keep true.**

## The 3D Epiphany

The sheer friction of this became obvious to me when I was building UIs for a 3D environment using my `tosijs-3d` library. Building UIs in 3D is notoriously painful, and debugging them with an agent using screenshots is nearly impossible due to those same security blockers.

To solve the 3D UI problem, I realized we could just build UIs in SVG, bridge the events from the 3D raycast world to the DOM, and update the texture as needed. Rendering SVGs into canvases is cheap and easy to serialize.

<img alt="tosijs 3d virtual table scrolling" src="https://firebasestorage.googleapis.com/v0/b/liquid-force-425209-g2.appspot.com/o/blog%2Ftosijs-3d-virtual-table-scrolling.gif?alt=media&token=07fcf905-9472-4619-b452-facc195962f7" style="width: 678px; aspect-ratio: 678 / 324;">

> tosijs-3d implements a *unified user interface* using SVG that works across the DOM, "flat" 3D surfaces, and in VR. And it leverages the declarative binding logic of tosijs.

Suddenly, debugging went into overdrive. Because I was giving the agent *what's actually there and matters* instead of a pixel screenshot or a messy DOM tree, the agent understood exactly what it was looking at.

## We Built the House. We Know Where the Wires Go.

This led to a bolt from heaven regarding standard 2D web development.

My framework, [tosijs](https://tosijs.net), doesn't rely on parsing the DOM to figure out what's happening. You use an `elementCreator` to style, bind state to properties, and bind events to actions at the moment of creation.

Would you rather write Vanilla JS that easily falls out of sync? Or React, which returns an opaque object that eventually renders? Or `tosijs`:

```javascript
export const userButton = () => elements.button(
  { 
    onClick: app.user.openConfig,
    style: { backgroundColor: vars.userButtonBg }
  }, 
  app.user.name
)

```

In `tosijs`, if `app.user.name` changes, the button updates automatically. But more importantly, `tosijs` *remembers this mapping*. It maintains a live, two-way map from state to the DOM, and from the DOM to event handlers.

Because `tosijs` has this internal map, it can draw a schematic map of the app—skipping cosmetics—showing exactly where data is coming from and what actions are available.

## Nobody Hand-Writes This Anymore. That's Not the Same as Getting It Free.

Everyone is converging on the same instinct from different directions.

**Cloudflare** takes what it can *see* of your site and turns it into something an agent finds easier to comprehend. **Shopify** actually solved it for their case—every storefront gets catalog, cart and checkout, no merchant asked—but that's Shopify's domain model, not yours, and it stops describing reality the moment a merchant customizes hard enough. **Angular** takes the usual approach: more boilerplate, one opt-in at a time.

All of this beats hand-writing a tool per button. But every one of them is a *second artifact*—another description of your app, maintained beside it. It's the difference between adding online help and fixing your user interface.

Which is a problem every developer already recognizes wearing different clothes. **It's the documentation problem.** Two descriptions of one system, kept in step by a promise—and that promise is always kept for a while and never kept forever. We already know the only fix: stop maintaining the second copy and generate it from the first.

An agent surface is the same shape. Derive it from the wiring the framework already holds and the map can't quietly go stale, because it isn't a copy. If it's wrong, the app is wrong—and *that*, someone notices.

## Handing Agents the Floorplan and the Wiring Diagram

When your framework already maintains this bi-directional map of state paths and executable actions, forcing an agent to inspect the page from the outside is ridiculous.

Instead of making the agent scrape the DOM, calling `enableAgentInterface()` exposes `tosiAgent`—a global protocol-neutral surface—and registers a generated WebMCP tool set with the browser's own `document.modelContext`.

<img alt="tosiAgent creating schematics" src="https://firebasestorage.googleapis.com/v0/b/liquid-force-425209-g2.appspot.com/o/blog%2FtosiAgent-creating-schematics?alt=media&token=a1ecbed0-2a51-4d4c-8d5c-b40f682a49bf" style="width: 678px; aspect-ratio: 678 / 324;">

Nothing is exposed until you ask, and the default only *looks*: a bare `enableAgentInterface()` gives read-only introspection, where `write()` and `call()` refuse and tell you how to enable them. Production is an allowlist—you name the state roots and actions an agent may touch, and a manifest scopes what can be *seen*; letting an agent *change* things is a separate, explicit grant. Point a schema at those roots and refusals come back with reasons, which is what an agent actually needs to correct itself.

Agents don't need to *guess* where to click, take screenshots, or mine the DOM. They receive a diagram of what the application *is* (the wiring diagram) and (if you provide it) a curated map (the floor plan). The browser stops being a display output that an agent has to hack its way into, and becomes a structured, interactive partner.

## A Virtuous Circle

This is where the curb cut becomes a virtuous circle. Because this schematic is derived from a single source of truth, any effort you spend improving the app for one audience automatically improves it for the others.

When you add ARIA labels or accessibility hints to assist a human using a screen reader, `tosijs` absorbs those details and automatically surfaces them as richer schema descriptions in the map. Conversely, if you curate the map to clarify a messy action for an agent, you are forced to untangle your underlying state architecture—resulting in a more robust application for human users and a dramatically easier system for programmers to test.

And it runs in a direction a scraper structurally cannot. tosijs ships an accessibility audit that runs over that same map: anonymous affordances, actions nothing can name, controls too small to hit, contrast failures, inputs labeled only by a placeholder that vanishes the moment you type.

That audit is only possible because the map holds *both sides*—what you declared the thing to be, and what it actually rendered as. A tool reading only the rendered page has nothing to compare against; it inherits your accessibility bugs and faithfully reports them as facts. **An integration absorbs discrepancies. An intrinsic surface prosecutes them.**

So this isn't "we remembered to think about accessibility too." The mechanism that serves agents *is* the mechanism that finds the accessibility bugs. Same records, same pass.

Which matters more than it used to, because accessibility is currently *losing*. Surveys this year report page structure getting worse for the first time in six years—and that same structure is what agents read. So the curb cut cuts both ways: semantics stop being a compliance checkbox somebody defers, and become load-bearing for a feature the business actually wants. Two reasons to fix it instead of one. Then the library has to hold up its end and make the fix cheap—declare a role and a description once on a component and they materialize as real ARIA, and the audit tells you which ones you still owe.

Instead of doing extra, siloed work to support agents, the work pays dividends across the board.

* **Humans** consume the visual DOM (or the 3D SVG projection), benefiting from a usable, accessible, responsive user interface.
* **Code** consumes the centralized state registry, benefiting from predictable architecture.
* **Agents** consume both the floor plan and the wiring diagram, all provided clearly and concisely.

And the "curb cut" metaphor runs deep, even for the programmer. The agent surface reads the framework's own records, so when the map is wrong, something real is wrong. We found and shipped a core bug fix within hours of the map looking odd. If the curb cut doesn't look right, maybe the sidewalk has a problem.

Testing with `haltija`'s shipped native tier, and Chrome's own `executeTool` in Canary, the agent successfully read the map, called actions, and updated the DOM without any vision or CSS selectors. And because the agent interacts via explicit contracts, every change, action, awaited condition, and refusal lands in a single audit log.

Writing DRY code around a single source of truth benefits everyone—not just the end users, but the engineers themselves. It means less work today, and less code to read, maintain, fix, and keep in sync tomorrow.

The total cost to expose the information architecture of your app to agents in a form they can understand is **about 6.7kB gzipped**—or 10.6kB if you also ship the schematic renderer and the accessibility audit *(measured against tosijs 1.8.0, August 2026)*. A better UI architecture for humans turns out to enable a "curb cut" for agents that's almost free—and ultimately benefits all users.
