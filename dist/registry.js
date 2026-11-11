export const registry = {};
// Lazy reference to xin proxy - set by xin.ts on initialization
let _xin = null;
export const setXinProxy = (xin) => {
    _xin = xin;
};
export const getXinProxy = () => {
    if (_xin === null) {
        throw new Error('xin proxy not initialized');
    }
    return _xin;
};
let _bind = null;
let _on = null;
export const setBindFunctions = (bind, on) => {
    _bind = bind;
    _on = on;
};
export const getBind = () => {
    if (_bind === null) {
        throw new Error('bind not initialized');
    }
    return _bind;
};
export const getOn = () => {
    if (_on === null) {
        throw new Error('on not initialized');
    }
    return _on;
};
