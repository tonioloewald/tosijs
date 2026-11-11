// unique tokens passed to set by path to delete or create properties
import { makeError } from './make-error';
const now36 = () => new Date(parseInt('1000000000', 36) + Date.now())
    .valueOf()
    .toString(36)
    .slice(1);
let _seq = 0;
const seq = () => (parseInt('10000', 36) + ++_seq).toString(36).slice(-5);
export const id = () => now36() + seq();
const _delete_ = Symbol('delete');
const _newObject_ = Symbol('new-object');
const _auto_ = Symbol('automatic-index');
function pathParts(path) {
    if (path === '') {
        return [];
    }
    if (Array.isArray(path)) {
        return path;
    }
    else {
        const parts = [];
        while (path.length > 0) {
            let index = path.search(/\[[^\]]+\]/);
            if (index === -1) {
                parts.push(path.split('.'));
                break;
            }
            else {
                const part = path.slice(0, index);
                path = path.slice(index);
                if (part !== '') {
                    parts.push(part.split('.'));
                }
                index = path.indexOf(']') + 1;
                parts.push(path.slice(1, index - 1));
                // handle paths dereferencing array element like foo[0].id
                if (path.slice(index, index + 1) === '.') {
                    index += 1;
                }
                path = path.slice(index);
            }
        }
        return parts;
    }
}
const idPathMaps = new WeakMap();
function buildIdPathValueMap(array, idPath) {
    if (idPathMaps.get(array) === undefined) {
        idPathMaps.set(array, {});
    }
    // Always rebuild into a FRESH map. Merging into the existing one preserves
    // stale keys for items removed outside setByPath (proxied splice/pop, direct
    // mutation + touch), and keyToIndex's validation fallback reads those stale
    // entries back — so a read returns, and a write clobbers, the wrong item.
    const map = {};
    idPathMaps.get(array)[idPath] = map;
    if (idPath === '_auto_') {
        array.forEach((item, idx) => {
            if (item[_auto_] === undefined)
                item[_auto_] = id();
            map[item[_auto_] + ''] = idx;
        });
    }
    else {
        array.forEach((item, idx) => {
            map[getByPath(item, idPath) + ''] = idx;
        });
    }
    return map;
}
function getIdPathMap(array, idPath) {
    if (idPathMaps.get(array) === undefined ||
        idPathMaps.get(array)[idPath] === undefined) {
        return buildIdPathValueMap(array, idPath);
    }
    else {
        return idPathMaps.get(array)[idPath];
    }
}
function keyToIndex(array, idPath, idValue) {
    idValue = idValue + '';
    let idx = getIdPathMap(array, idPath)[idValue];
    if (idx === undefined ||
        getByPath(array[idx], idPath) + '' !== idValue) {
        idx = buildIdPathValueMap(array, idPath)[idValue];
    }
    return idx;
}
/**
 * Path segments that would escape the object graph into the prototype chain.
 * A path is untrusted data — it arrives from an agent, a WebMCP host, a
 * sync server or a peer tab — so a segment must never be able to reach
 * `Object.prototype`. Rejected at the SINK, which covers every caller at
 * once: `agent.write()`, its contract proposal clone, `share()` and
 * `sync()`. (Found by the 1.8.0 security pass: a manifest-scoped
 * `write('app.cart.__proto__.isAdmin', true)` polluted Object.prototype
 * origin-wide, left the registry untouched so nothing showed in the map or
 * the audit ledger, and passed a schema contract — because the polluted
 * write never appeared in the proposed value being validated.)
 */
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
export class UnsafePathError extends Error {
    constructor(key) {
        super(`unsafe path segment "${key}": it would escape the object graph into ` +
            'the prototype chain');
        this.name = 'UnsafePathError';
    }
}
/**
 * Throws on a segment that would reach the prototype chain while DESCENDING.
 * All three names are refused here, because descending through any of them
 * lands outside the object graph.
 */
export const isUnsafeKey = (key) => FORBIDDEN_SEGMENTS.has(key);
export function assertSafeKey(key) {
    if (isUnsafeKey(key))
        throw new UnsafePathError(key);
}
/**
 * The same guard for a TERMINAL assignment — deliberately narrower.
 *
 * Only `__proto__` is a sink at a leaf: `obj.__proto__ = x` reassigns the
 * prototype, so it must never be a data key. `constructor` and `prototype` are
 * ordinary own properties when you merely ASSIGN them — and they are real
 * data keys in real apps, because dictionaries get keyed by user data (an i18n
 * table, a cache, a colour-name map). Refusing them at a leaf broke code that
 * worked in 1.7.9 and bought nothing: descent is where they are dangerous, and
 * descent still refuses all three (assertSafeKey above, plus byKey's
 * own-property check).
 */
export function assertSafeLeafKey(key) {
    if (key === '__proto__')
        throw new UnsafePathError(key);
}
function byKey(obj, key, valueToInsert) {
    assertSafeKey(key);
    // TWO different things are "not a container here", and only one of them is
    // about ownership:
    //   - an INHERITED member (toString, valueOf, …) — never ours to descend
    //     into or overwrite, which is why this asks hasOwnProperty rather than
    //     `=== undefined`
    //   - an own property whose VALUE is undefined — ours, but empty
    // Testing ownership alone conflated them: `{ app: { config: undefined } }`
    // reported the key as present, so nothing was created and `undefined` came
    // back for the descent to dereference. That is ordinary state — a TS
    // placeholder (`user: undefined as User | undefined`, which our own
    // bind-before-data guidance encourages) or a cleared subtree
    // (`xin['app.config'] = undefined` writes an own undefined) — so the very
    // next deep write crashed, and inbound share()/sync() deltas crashed inside
    // the receive handler.
    const own = Object.prototype.hasOwnProperty.call(obj, key);
    if ((!own || obj[key] === undefined) && valueToInsert !== undefined) {
        obj[key] = valueToInsert;
    }
    return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}
function byIdPath(array, idPath, idValue, valueToInsert) {
    if (idPath === '') {
        // `[=key]` is a KEY, spelled as an id-path, so it takes the same guard as
        // a dotted key. It took none: `x[=constructor].y = 1` wrote onto Object,
        // `x[=constructor].assign` replaced Object.assign, and `x[=__proto__] =
        // {...}` swapped a prototype, through agent.write, share and sync alike
        // (found in the 1.10.10 review; in every release since the 1.8.0 guard).
        // Descending goes through byKey, which is where the dotted form is guarded.
        if (valueToInsert === _newObject_)
            return byKey(array, idValue, {});
        // a READ is unguarded, like a dotted read: it cannot pollute, and refusing
        // it made a [=constructor] data key writable but unreadable (so share and
        // sync silently stopped sending it)
        if (valueToInsert !== undefined && valueToInsert !== _delete_)
            assertSafeLeafKey(idValue);
    }
    else {
        for (const key of idPath.split('.'))
            assertSafeKey(key);
    }
    let idx = idPath !== '' ? keyToIndex(array, idPath, idValue) : idValue;
    if (valueToInsert === _delete_) {
        // splice(undefined, 1) coerces to splice(0, 1) — deleting a nonexistent
        // id must be a no-op, not the silent removal of the first item
        if (idx !== undefined) {
            array.splice(idx, 1);
            idPathMaps.delete(array);
        }
        return Symbol('deleted');
    }
    else if (valueToInsert === _newObject_) {
        // descending through [idPath=value]: an existing item or nothing
    }
    else if (valueToInsert !== undefined) {
        if (idx !== undefined) {
            array[idx] = valueToInsert;
        }
        else if (idPath !== '' &&
            getByPath(valueToInsert, idPath) + '' === idValue + '') {
            array.push(valueToInsert);
            idx = array.length - 1;
        }
        else {
            throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`);
        }
    }
    return array[idx];
}
function expectArray(obj) {
    if (!Array.isArray(obj)) {
        throw makeError('setByPath failed: expected array, found', obj);
    }
}
function expectObject(obj) {
    if (obj == null || !(obj instanceof Object)) {
        throw makeError('setByPath failed: expected Object, found', obj);
    }
}
function getByPath(obj, path) {
    const parts = pathParts(path);
    let found = obj;
    let i, iMax, j, jMax;
    for (i = 0, iMax = parts.length; found !== undefined && i < iMax; i++) {
        const part = parts[i];
        if (Array.isArray(part)) {
            for (j = 0, jMax = part.length; found !== undefined && j < jMax; j++) {
                const key = part[j];
                found = found[key];
            }
        }
        else {
            if (found.length === 0) {
                found = found[Number(part.slice(1))];
                if (part[0] !== '=') {
                    return undefined;
                }
            }
            else if (part.includes('=')) {
                const [idPath, ...tail] = part.split('=');
                found = byIdPath(found, idPath, tail.join('='));
            }
            else {
                j = parseInt(part, 10);
                found = found[j];
            }
        }
    }
    return found;
}
function setByPath(orig, path, val) {
    let obj = orig;
    if (path === '')
        throw new Error('setByPath cannot be used to set the root object');
    const parts = pathParts(path);
    while (obj != null && parts.length > 0) {
        const part = parts.shift();
        if (typeof part === 'string') {
            const equalsOffset = part.indexOf('=');
            if (equalsOffset > -1) {
                if (equalsOffset === 0) {
                    expectObject(obj);
                }
                else {
                    expectArray(obj);
                }
                const idPath = part.slice(0, equalsOffset);
                const idValue = part.slice(equalsOffset + 1);
                obj = byIdPath(obj, idPath, idValue, parts.length > 0 ? _newObject_ : val);
                if (parts.length === 0) {
                    return true;
                }
            }
            else {
                expectArray(obj);
                const idx = parseInt(part, 10);
                if (parts.length > 0) {
                    obj = obj[idx];
                }
                else {
                    if (val !== _delete_) {
                        if (obj[idx] === val) {
                            return false;
                        }
                        ;
                        obj[idx] = val;
                    }
                    else {
                        ;
                        obj.splice(idx, 1);
                    }
                    return true;
                }
            }
        }
        else if (Array.isArray(part) && part.length > 0) {
            expectObject(obj);
            while (part.length > 0) {
                const key = part.shift();
                if (part.length > 0 || parts.length > 0) {
                    // if we're at the end of part.length then we need to insert an array
                    obj = byKey(obj, key, part.length > 0 ? {} : []);
                    // the OUTER loop guards `obj != null`; this one never did, so a
                    // byKey that legitimately declines to create a container (an
                    // inherited member) reported it as a raw TypeError from library
                    // internals instead of naming the path
                    if (obj == null) {
                        throw new Error(`setByPath failed at "${key}" in "${path}": not a container`);
                    }
                }
                else {
                    assertSafeLeafKey(key);
                    if (val !== _delete_) {
                        if (obj[key] === val) {
                            return false;
                        }
                        ;
                        obj[key] = val;
                    }
                    else {
                        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                            return false;
                        }
                        delete obj[key];
                    }
                    return true;
                }
            }
        }
        else {
            throw new Error(`setByPath failed, bad path ${path}`);
        }
    }
    throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`);
}
function deleteByPath(orig, path) {
    if (getByPath(orig, path) !== null) {
        setByPath(orig, path, _delete_);
    }
}
export { getByPath, setByPath, deleteByPath, pathParts };
