/*{ "parent": "utilities", "description": "EXPERIMENTAL agent interface: expose a tosijs app's state, wiring, and actions to AI agents (and test harnesses) as a described, observable, path-addressed surface." }*/
/*#
# agent (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

    import { enableAgentInterface } from 'tosijs'

    const agent = enableAgentInterface() // introspection mode: expose everything

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read('app.filter')  // serializable value
    agent.write('app.filter', 'milk') // through the same observers as any write
    agent.observe('app.cart', (path) => { ... }) // push; returns un-observe
    agent.call('app.addItem', 'buy milk')        // invoke an action by path
    agent.changes(cursor)     // turn-based drain: final value per changed path
    await agent.when('app.order.status', (s) => s === 'confirmed') // await a condition
    agent.log()               // the audit trail

In production, expose only what you declare:

    enableAgentInterface({
      expose: {
        roots: ['app.cart', 'app.filter'],
        actions: ['app.addItem', 'app.checkout'],
      },
    })

> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it, not inside it.
*/
import { registry } from './registry';
import { observe, unobserve } from './path-listener';
import { setByPath } from './by-path';
import { xin } from './xin';
import { BOUND_CLASS, getElementBindings, elementToHandlers, tosiValue, } from './metadata';
import { bindings } from './bindings';
import { propBindingKey } from './elements';
/**
 * Provenance tokens for bound properties in describe() output. A bound prop
 * reads `"<current value> <arrow> <path>"` — the arrow both marks the value
 * as live and carries its direction:
 *   ⟵  state flows to the DOM only (display)
 *   ⟷  two-way (fromDOM present — a user-writable affordance)
 * Chosen as tokens unlikely to occur in real values; parsers should split on
 * ` ⟷ ` / ` ⟵ ` (spaces included). A plain value with no arrow is static.
 */
export const BOUND_TO_DOM = '⟵';
export const BOUND_TWO_WAY = '⟷';
// a path is "under" a root if it IS the root or extends it by a segment
const underRoot = (path, root) => path === root ||
    (path.startsWith(root) &&
        (path[root.length] === '.' || path[root.length] === '['));
// values leave the surface as plain serializable data — proxies unwrapped,
// functions elided (they are actions, addressed by path, not data)
const serialize = (value) => {
    const raw = tosiValue(value);
    if (raw === undefined || typeof raw === 'function')
        return undefined;
    try {
        return JSON.parse(JSON.stringify(raw));
    }
    catch (_e) {
        return undefined;
    }
};
// measure an element in TRUE DOCUMENT coordinates: accumulate every
// ancestor's scroll (apps commonly scroll an inner container, not the
// window; the walk reaches <html>, whose scrollTop IS the window scroll).
// Fixed/sticky elements ride the viewport: they keep viewport coordinates
// and are flagged, because screen furniture has no stable page position.
const measureBounds = (el) => {
    const rect = el.getBoundingClientRect?.();
    if (rect == null)
        return null;
    let fixed = false;
    if (typeof globalThis.getComputedStyle === 'function') {
        let probe = el;
        for (let hop = 0; probe != null && hop < 12; hop++) {
            const position = globalThis.getComputedStyle(probe).position;
            if (position === 'fixed' || position === 'sticky') {
                fixed = true;
                break;
            }
            probe = probe.parentElement;
        }
    }
    let scrollX = 0;
    let scrollY = 0;
    if (!fixed) {
        let ancestor = el.parentElement;
        while (ancestor != null) {
            scrollX += ancestor.scrollLeft ?? 0;
            scrollY += ancestor.scrollTop ?? 0;
            ancestor = ancestor.parentElement;
        }
    }
    return {
        bounds: {
            x: Math.round(rect.x + scrollX),
            y: Math.round(rect.y + scrollY),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        },
        fixed,
    };
};
// the join: the element's own semantic self-description, harvested from
// attributes the developer wrote for humans and a11y
const describeElement = (el) => {
    const record = {
        tag: el.tagName.toLowerCase(),
    };
    if (el.id)
        record.id = el.id;
    const part = el.getAttribute('part');
    if (part)
        record.part = part;
    const role = el.getAttribute('role');
    if (role)
        record.role = role;
    const label = el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.getAttribute('placeholder') ||
        el.getAttribute('alt');
    if (label)
        record.label = label;
    return record;
};
// "value ⟷ path" — current value plus provenance in one parseable string
const boundValue = (path, twoWay) => {
    const raw = serialize(xin[path]);
    const shown = raw === undefined ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw);
    const arrow = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM;
    return shown ? `${shown} ${arrow} ${path}` : `${arrow} ${path}`;
};
// name a binding by identity: the shared bindings collection first, then the
// element-prop binding cache; textContent surfaces under the friendlier `text`
const bindingName = (binding) => {
    for (const key of Object.keys(bindings)) {
        if (bindings[key] === binding)
            return key;
    }
    const propKey = propBindingKey(binding);
    return propKey === 'textContent' ? 'text' : propKey;
};
let active;
let activeGlobalName;
export function enableAgentInterface(options = {}) {
    // re-enabling reconfigures: tear down the previous surface first
    if (active != null)
        active.disable();
    const { expose, components, global = true } = options;
    const roots = expose?.roots;
    const exposedActions = expose?.actions;
    const contract = expose?.contract;
    // contracted roots (the describe() keys) are read ONCE at enable time so
    // sub-path writes can be routed to a whole-root proposal
    const contractRoots = contract?.describe != null ? Object.keys(contract.describe()) : [];
    const manifestMode = expose != null;
    const inScope = (path) => !manifestMode ||
        (roots ?? []).some((root) => underRoot(path, root)) ||
        (exposedActions ?? []).some((action) => underRoot(path, action));
    // writes are gated on declared ROOTS only: a declared action is callable,
    // not writable — otherwise `actions: ['app.checkout']` would let an agent
    // REPLACE app.checkout (a function) with agent-supplied data
    const writable = (path) => !manifestMode || (roots ?? []).some((root) => underRoot(path, root));
    const assertScope = (path) => {
        if (!inScope(path)) {
            throw new Error(`agent interface: "${path}" is not exposed (manifest mode)`);
        }
    };
    // the audit ledger — one global observer; every touch lands here.
    // log/changes are two consumptions of this one stream. Entries with a
    // `note` are synthetic audit events (when() arming etc.), visible in
    // log() but skipped by the changes() drain.
    let seq = 0;
    const ledger = [];
    const pendingWhens = new Set();
    const ledgerListener = observe(() => true, (path) => {
        if (inScope(path))
            ledger.push({ seq: ++seq, path });
    });
    const subscriptions = new Set();
    const read = (path) => {
        assertScope(path);
        return serialize(xin[path]);
    };
    const surface = {
        describe(options = {}) {
            const rootNames = manifestMode
                ? (roots ?? []).slice()
                : Object.keys(registry);
            const rootSummary = {};
            for (const root of rootNames) {
                rootSummary[root] = Array.isArray(tosiValue(xin[root]))
                    ? 'array'
                    : typeof tosiValue(xin[root]);
            }
            // wiring: every data-bound element (enumerable via the marker class),
            // plus every event-wired element (probe the handler map on a tree walk).
            // With `scope`, both walks are confined to that element's subtree —
            // hierarchy scoping, stable however large the subtree renders.
            const wiring = [];
            if (typeof document !== 'undefined') {
                const walkRoot = options.scope ?? document.body;
                const seen = new Set();
                const recordFor = (el) => {
                    if (seen.has(el))
                        return undefined;
                    seen.add(el);
                    const { dataBindings, eventBindings } = getElementBindings(el);
                    const record = describeElement(el);
                    let wired = false;
                    if (dataBindings != null) {
                        for (const b of dataBindings) {
                            if (!inScope(b.path))
                                continue;
                            wired = true;
                            const idPath = b.options?.idPath;
                            if (idPath != null || b.binding === bindings.list) {
                                record.list = idPath ? { path: b.path, idPath } : { path: b.path };
                                continue;
                            }
                            const name = bindingName(b.binding);
                            if (name != null && record[name] === undefined) {
                                record[name] = boundValue(b.path, b.binding.fromDOM != null);
                            }
                            else {
                                // obscure stuff one level deeper
                                record.detail ??= [];
                                record.detail.push({
                                    path: b.path,
                                    readable: b.binding.toDOM != null,
                                    writable: b.binding.fromDOM != null,
                                });
                            }
                        }
                    }
                    if (eventBindings != null) {
                        const on = {};
                        for (const [type, set] of Object.entries(eventBindings)) {
                            const names = Array.from(set, (h) => typeof h === 'string' ? h : 'ƒ');
                            on[type] = names.length === 1 ? names[0] : names;
                        }
                        if (Object.keys(on).length > 0) {
                            record.on = on;
                            wired = true;
                        }
                    }
                    // static text, when textContent isn't already surfaced as bound
                    if (record.text === undefined) {
                        const text = (el.textContent || '').trim().slice(0, 40);
                        if (text)
                            record.text = text;
                    }
                    // a custom element may carry its own self-declaration. OWN statics
                    // only: statics inherit through the prototype chain, and a subclass
                    // must not silently wear its parent's claims (the _elementCreator
                    // lesson, applied to contracts). Post-hoc contracts (expose.
                    // components, keyed by tag) fill the gaps for classes you don't
                    // control — the class's own declaration always wins.
                    if (record.tag.includes('-')) {
                        const cls = globalThis.customElements?.get?.(record.tag);
                        if (cls != null &&
                            Object.prototype.hasOwnProperty.call(cls, 'contract')) {
                            record.component = cls.contract;
                        }
                        else if (components?.[record.tag] != null) {
                            record.component = components[record.tag];
                        }
                    }
                    // geometry: the layout is part of the semantics
                    const measured = measureBounds(el);
                    if (measured != null) {
                        record.bounds = measured.bounds;
                        if (measured.fixed)
                            record.viewportFixed = true;
                    }
                    if (options.styles === true &&
                        typeof globalThis.getComputedStyle === 'function') {
                        const cs = globalThis.getComputedStyle(el);
                        record.style = {
                            background: cs.backgroundColor,
                            borderColor: cs.borderTopColor,
                            color: cs.color,
                        };
                    }
                    return wired ? record : undefined;
                };
                for (const el of Array.from(walkRoot.getElementsByClassName(BOUND_CLASS))) {
                    const record = recordFor(el);
                    if (record)
                        wiring.push(record);
                }
                for (const el of [walkRoot, ...Array.from(walkRoot.querySelectorAll('*'))]) {
                    if (elementToHandlers.has(el)) {
                        const record = recordFor(el);
                        if (record)
                            wiring.push(record);
                    }
                }
                // the structural tier (unless structure: false): headings and
                // landmarks — the page's information architecture — plus the
                // custom-element containers wired elements live inside. Structure
                // is what turns a scatter of affordances into a MAP.
                if (options.structure !== false) {
                    const structural = Array.from(walkRoot.querySelectorAll('h1,h2,h3,h4,h5,h6,main,article,section,nav,aside,header,footer'));
                    for (const wired of Array.from(seen)) {
                        let ancestor = wired.parentElement;
                        while (ancestor != null && ancestor !== walkRoot) {
                            if (ancestor.tagName.includes('-'))
                                structural.push(ancestor);
                            ancestor = ancestor.parentElement;
                        }
                    }
                    for (const el of structural) {
                        if (seen.has(el))
                            continue;
                        seen.add(el);
                        const record = describeElement(el);
                        record.structural = true;
                        const heading = /^H[1-6]$/.test(el.tagName);
                        if (heading && record.text === undefined) {
                            const text = (el.textContent || '').trim().slice(0, 60);
                            if (text)
                                record.text = text;
                        }
                        const measured = measureBounds(el);
                        if (measured == null ||
                            measured.bounds.width === 0 ||
                            measured.bounds.height === 0) {
                            continue;
                        }
                        record.bounds = measured.bounds;
                        if (measured.fixed)
                            record.viewportFixed = true;
                        wiring.push(record);
                    }
                }
            }
            // actions: functions reachable from exposed roots (bounded walk)
            const actions = [];
            if (manifestMode) {
                actions.push(...(exposedActions ?? []));
            }
            else {
                const walk = (value, path, depth) => {
                    if (depth > 3 || value == null || typeof value !== 'object')
                        return;
                    for (const key of Object.keys(value)) {
                        const child = value[key];
                        const childPath = `${path}.${key}`;
                        if (typeof child === 'function')
                            actions.push(childPath);
                        else
                            walk(child, childPath, depth + 1);
                    }
                };
                for (const root of rootNames) {
                    walk(registry[root], root, 0);
                }
            }
            const description = {
                roots: rootSummary,
                wiring,
                actions,
                exposure: manifestMode ? 'manifest' : 'introspection',
            };
            if (contract?.describe != null) {
                description.contract = contract.describe();
            }
            return description;
        },
        read,
        write(path, value) {
            assertScope(path);
            if (!writable(path)) {
                throw new Error(`agent interface: "${path}" is callable, not writable (declare it under roots to allow writes)`);
            }
            if (contract != null) {
                // route the WRITE, not the schema: judge a sub-path write as the
                // whole contracted root it would produce (clone + hypothetical
                // apply) — closes the sub-path bypass, and root-level cross-field
                // constraints and $predicates see the edit in context
                let proposal;
                const root = contractRoots
                    .filter((contractRoot) => underRoot(path, contractRoot))
                    .sort((a, b) => b.length - a.length)[0];
                if (root != null) {
                    if (path === root) {
                        proposal = { root, proposed: value };
                    }
                    else {
                        const wrapper = { root: serialize(xin[root]) };
                        const relative = path.slice(root.length);
                        setByPath(wrapper, relative.startsWith('[')
                            ? `root${relative}`
                            : `root.${relative.replace(/^\./, '')}`, value);
                        proposal = { root, proposed: wrapper.root };
                    }
                }
                const verdict = contract.check(path, value, proposal);
                if (verdict !== true) {
                    // refusals are audit events: what an agent TRIED matters as much
                    // as what it did
                    ledger.push({
                        seq: ++seq,
                        path,
                        note: `write rejected: ${verdict.message}`,
                    });
                    throw verdict;
                }
            }
            xin[path] = value;
        },
        observe(path, callback) {
            assertScope(path);
            const listener = observe(path, callback);
            subscriptions.add(listener);
            return () => {
                subscriptions.delete(listener);
                unobserve(listener);
            };
        },
        call(actionPath, ...args) {
            if (manifestMode && !(exposedActions ?? []).includes(actionPath)) {
                throw new Error(`agent interface: action "${actionPath}" is not exposed (manifest mode)`);
            }
            const fn = xin[actionPath];
            if (typeof fn !== 'function') {
                throw new Error(`agent interface: "${actionPath}" is not an action`);
            }
            return fn(...args);
        },
        // await a state condition: the value now if it already satisfies,
        // otherwise the first settling round where it does
        when(path, predicate) {
            assertScope(path);
            const current = serialize(xin[path]);
            let alreadySatisfied;
            try {
                alreadySatisfied = predicate(current);
            }
            catch (e) {
                // predicate errors use one channel: the returned promise
                return Promise.reject(e);
            }
            if (alreadySatisfied) {
                ledger.push({ seq: ++seq, path, note: 'when: already satisfied' });
                return Promise.resolve(current);
            }
            ledger.push({
                seq: ++seq,
                path,
                note: `when: armed ${String(predicate).slice(0, 80)}`,
            });
            return new Promise((resolve, reject) => {
                const pending = { reject };
                pendingWhens.add(pending);
                const settle = (fn) => {
                    pendingWhens.delete(pending);
                    subscriptions.delete(listener);
                    unobserve(listener);
                    fn();
                };
                const listener = observe(path, () => {
                    const value = serialize(xin[path]);
                    let satisfied;
                    try {
                        satisfied = predicate(value);
                    }
                    catch (e) {
                        settle(() => reject(e));
                        return;
                    }
                    if (satisfied) {
                        ledger.push({ seq: ++seq, path, note: 'when: resolved' });
                        settle(() => resolve(value));
                    }
                });
                subscriptions.add(listener);
            });
        },
        // turn-based drain: everything since the cursor, coalesced to one entry
        // per path (final value read at drain time — updates()' settling
        // semantics, extended across agent turns)
        changes(since = 0) {
            const seenPaths = new Set();
            const coalesced = [];
            for (let i = ledger.length - 1; i >= 0; i--) {
                const entry = ledger[i];
                if (entry.seq <= since)
                    break;
                if (entry.note != null)
                    continue; // audit notes are not state changes
                if (seenPaths.has(entry.path))
                    continue;
                seenPaths.add(entry.path);
                coalesced.unshift({ path: entry.path, value: read(entry.path) });
            }
            return { cursor: seq, changes: coalesced };
        },
        log() {
            return ledger.slice();
        },
        disable() {
            unobserve(ledgerListener);
            for (const listener of subscriptions)
                unobserve(listener);
            subscriptions.clear();
            for (const pending of pendingWhens) {
                pending.reject(new Error('agent interface disabled'));
            }
            pendingWhens.clear();
            if (activeGlobalName != null) {
                delete globalThis[activeGlobalName];
                activeGlobalName = undefined;
            }
            if (active === surface)
                active = undefined;
        },
    };
    if (global !== false) {
        activeGlobalName = typeof global === 'string' ? global : 'tosiAgent';
        globalThis[activeGlobalName] = surface;
    }
    active = surface;
    return surface;
}
