// Return short bill of materials, e.g. 4R 3C 1Q 1D
// linter: ngspicejs-lint
// global: config
"use strict";

function elements_to_short_bom(aElements) {
    // Return short bill of materials, e.g. 4R 3C 1Q 1D
    var p = {};
    aElements.forEach((e) => {
        var k = config.complexity[e.type].prefix;
        p[k] = p[k] || 0;
        p[k]++;
    });
    return Object.entries(p).map((a) => a[1] + a[0]).join(' ');
}

globalThis.elements_to_short_bom = elements_to_short_bom;
globalThis.exports = elements_to_short_bom;

