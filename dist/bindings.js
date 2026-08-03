import { getListBinding } from './list-binding';
import { getValue, setValue } from './dom';
export const bindings = {
    value: {
        toDOM: setValue,
        fromDOM(element) {
            return getValue(element);
        },
    },
    text: {
        toDOM(element, value) {
            element.textContent = value;
        },
    },
    enabled: {
        toDOM(element, value) {
            element.disabled = !value;
        },
    },
    disabled: {
        toDOM(element, value) {
            element.disabled = Boolean(value);
        },
    },
    list: {
        toDOM(element, value, options) {
            const listBinding = getListBinding(element, value, options);
            listBinding.update(value);
        },
    },
};
