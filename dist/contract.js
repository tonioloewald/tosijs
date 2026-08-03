import { updates } from './path-listener';
// faithful structural equality — deliberately NOT JSON.stringify comparison,
// which normalizes Dates (via toJSON) on both sides and so hides exactly the
// serialization infidelity round-tripping exists to catch
const same = (a, b) => {
    if (a === b)
        return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null)
        return false;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    // only plain data survives the surface; anything fancier must be identical
    const plain = (x) => x.constructor === Object || x.constructor === Array || x.constructor == null;
    if (!plain(a) || !plain(b))
        return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length)
        return false;
    return aKeys.every((key) => same(a[key], b[key]));
};
/**
 * Exercise every example and counterexample in the surface's declared
 * contract, through the surface itself. Pure over the public API — usable
 * from bun test, a doc fence, or an agent's own self-check.
 */
export const exerciseContract = (agent) => {
    const contract = agent.describe().contract ?? {};
    const trials = [];
    for (const [root, schema] of Object.entries(contract)) {
        const examples = schema?.examples ?? [];
        const counterexamples = schema?.$counterexamples ?? [];
        const snapshot = agent.read(root);
        for (const value of examples) {
            let passed = true;
            let error;
            try {
                agent.write(root, value);
                const readBack = agent.read(root);
                if (!same(readBack, value)) {
                    passed = false;
                    error = 'round-trip mismatch: read() returned a different value';
                }
            }
            catch (e) {
                passed = false;
                error = `example rejected: ${e.message}`;
            }
            trials.push({ root, kind: 'example', value, passed, error });
        }
        for (const value of counterexamples) {
            let passed = false;
            let error;
            try {
                agent.write(root, value);
                error = 'counterexample was ACCEPTED';
            }
            catch {
                passed = true; // refusal is the pass
            }
            trials.push({ root, kind: 'counterexample', value, passed, error });
        }
        if (snapshot !== undefined) {
            try {
                agent.write(root, snapshot);
            }
            catch (_e) {
                // a snapshot the contract itself refuses is a finding, not a crash —
                // it will already have surfaced as a failed example or in app tests
            }
        }
    }
    const failed = trials.filter((trial) => !trial.passed).length;
    return { passed: trials.length - failed, failed, trials };
};
/**
 * Exercise a CONNECTED component instance against its own `componentMap`
 * self-declaration (passed explicitly, or read from the instance's class):
 *
 * - every declared **part** must resolve inside the instance and match its
 *   declared tag — the map of parts to internal elements, verified live;
 * - every declared **method** must exist as a function;
 * - every **value example** must round-trip through the instance's `value`
 *   (faithful comparison — the same discipline as exerciseContract).
 *
 * The component equivalent of a signature test: the declaration that types
 * the parts, informs the agent, and documents the component is the same one
 * the harness executes.
 */
export const exerciseComponent = async (element, map) => {
    // OWN static only — statics inherit through the prototype chain, and a
    // subclass must not silently wear its parent's claims
    const cls = element.constructor;
    const declared = map ??
        (Object.prototype.hasOwnProperty.call(cls, 'contract')
            ? cls.contract
            : undefined);
    const trials = [];
    if (declared == null) {
        return {
            passed: 0,
            failed: 1,
            trials: [
                {
                    claim: 'component declares a static contract',
                    passed: false,
                    error: 'no own static contract declared (and none passed in)',
                },
            ],
        };
    }
    const root = (element.shadowRoot ?? element);
    // prefer the component's own parts proxy — its resolution is
    // ownership-correct (pre-hydration capture); a bare querySelector can
    // false-positive on a nested component's same-named part
    const resolvePart = (name) => {
        let found = null;
        if (element.parts != null) {
            try {
                found = element.parts[name] ?? null;
            }
            catch {
                found = null; // the proxy throws for parts it never owned
            }
        }
        return found ?? root.querySelector(`[part="${name}"]`);
    };
    for (const [name, tag] of Object.entries(declared.parts ?? {})) {
        const found = resolvePart(name);
        trials.push(found == null
            ? {
                claim: `part "${name}" resolves`,
                passed: false,
                error: 'declared part not found in the instance',
            }
            : found.tagName.toLowerCase() !== tag
                ? {
                    claim: `part "${name}" is <${tag}>`,
                    passed: false,
                    error: `found <${found.tagName.toLowerCase()}>`,
                }
                : { claim: `part "${name}" resolves as <${tag}>`, passed: true });
    }
    for (const name of Object.keys(declared.methods ?? {})) {
        const isFn = typeof element[name] === 'function';
        trials.push({
            claim: `method "${name}" exists`,
            passed: isFn,
            error: isFn ? undefined : `typeof is ${typeof element[name]}`,
        });
    }
    const valueExamples = declared.value?.examples ?? [];
    if (valueExamples.length > 0) {
        const snapshot = element.value;
        for (const example of valueExamples) {
            ;
            element.value = example;
            const back = element.value;
            trials.push(same(back, example)
                ? { claim: `value example round-trips`, passed: true }
                : {
                    claim: `value example round-trips`,
                    passed: false,
                    error: `wrote ${JSON.stringify(example)}, read ${JSON.stringify(back)}`,
                });
        }
        ;
        element.value = snapshot;
    }
    // observers settle via updates(); component renders queue on rAF — a step
    // assertion must wait for BOTH (the same discipline as the doc-test lane)
    const settle = async () => {
        await updates();
        if (typeof requestAnimationFrame === 'function') {
            await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        }
    };
    // declared behavioral tests: serializable step scripts, run live, in
    // declared order (an array — order is explicit, never a map-key accident)
    for (const { name, steps } of declared.tests ?? []) {
        const snapshot = element.value;
        let error;
        try {
            for (const step of steps) {
                if (step.set != null)
                    Object.assign(element, step.set);
                if (step.click != null) {
                    const target = resolvePart(step.click);
                    if (target == null) {
                        throw new Error(`click target part "${step.click}" not found`);
                    }
                    ;
                    target.click();
                }
                await settle();
                if (step.expect != null) {
                    if ('value' in step.expect && !same(element.value, step.expect.value)) {
                        throw new Error(`expected value ${JSON.stringify(step.expect.value)}, got ${JSON.stringify(element.value)}`);
                    }
                    for (const [part, text] of Object.entries(step.expect.text ?? {})) {
                        const target = resolvePart(part);
                        const actual = (target?.textContent ?? '').trim();
                        if (actual !== text) {
                            throw new Error(`expected part "${part}" text "${text}", got "${actual}"`);
                        }
                    }
                }
            }
        }
        catch (e) {
            error = e.message;
        }
        ;
        element.value = snapshot;
        await settle();
        trials.push({ claim: `test "${name}"`, passed: error == null, error });
    }
    const failed = trials.filter((trial) => !trial.passed).length;
    return { passed: trials.length - failed, failed, trials };
};
