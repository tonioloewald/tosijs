export function makePropList(obj) {
    return Object.keys(obj).map((key) => ({
        key,
        get value() {
            return obj[key];
        },
        set value(newValue) {
            obj[key] = newValue;
        },
    }));
}
