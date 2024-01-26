// Create cache of net, its element names and their types
// linter: ngspicejs-lint
"use strict";

function cache_net_element_type(aElements) {
    // Create cache of net, its element names and their types
    // {"vcc": {"R1": "resistor", "R2": "resistor"}, "1000": {"R1": "resistor"}, ...}
    var ret = {};
    aElements.forEach((e) => {
        e.nets.forEach((n) => {
            ret[n] = ret[n] || {};
            ret[n][e.name] = e.type;
        });
    });
    return ret;
}

globalThis.cache_net_element_type = cache_net_element_type;
globalThis.exports = cache_net_element_type;

