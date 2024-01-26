// Create cache of {net:{element:{pin:true,...}...}...}
// linter: ngspicejs-lint
"use strict";

function cache_net_element_pin(aElements) {
    // Create cache of {net:{element:{pin:true,...}...}...}
    var ret = {};
    aElements.forEach((e) => {
        e.nets.forEach((n,i) => {
            ret[n] = ret[n] || {};
            ret[n][e.name] = ret[n][e.name] || {};
            ret[n][e.name][i] = true;
        });
    });
    return ret;
}

globalThis.cache_net_element_pin = cache_net_element_pin;
globalThis.exports = cache_net_element_pin;
