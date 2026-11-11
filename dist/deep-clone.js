// `seen` maps original -> clone so circular references reproduce the cycle in
// the clone instead of blowing the stack, and shared references stay shared.
export function deepClone(obj, seen) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        // a Date is a value, not a container — clone it as one (it used to come
        // back as {}, which destroyed Date-valued component `value`s)
        return new Date(obj.getTime());
    }
    if (seen === undefined) {
        seen = new WeakMap();
    }
    else if (seen.has(obj)) {
        return seen.get(obj);
    }
    if (obj instanceof Set) {
        const clone = new Set();
        seen.set(obj, clone);
        for (const item of obj) {
            clone.add(deepClone(item, seen));
        }
        return clone;
    }
    if (obj instanceof Map) {
        const clone = new Map();
        seen.set(obj, clone);
        for (const [key, value] of obj) {
            clone.set(deepClone(key, seen), deepClone(value, seen));
        }
        return clone;
    }
    if (Array.isArray(obj)) {
        const clone = [];
        seen.set(obj, clone);
        for (const item of obj) {
            clone.push(deepClone(item, seen));
        }
        return clone;
    }
    const clone = {};
    seen.set(obj, clone);
    for (const key in obj) {
        clone[key] = deepClone(obj[key], seen);
    }
    return clone;
}
