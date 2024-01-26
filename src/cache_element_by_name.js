// Create cache of {element_name:element}
// linter: ngspicejs-lint
"use strict";

function cache_element_by_name(aElements) {
    // Create cache of {element_name:element}
    var ret = {};
    aElements.forEach((e) => ret[e.name] = e);
    return ret;
}

globalThis.cache_element_by_name = cache_element_by_name;
globalThis.exports = cache_element_by_name;
