// Return true if direct edge exists from one net to another
// linter: ngspicejs-lint
"use strict";

function edge_exists(aEdges, aFromNet, aToNet) {
    // Return true if direct edge exists from one net to another
    // path via external interface nets is not direct path
    var seen = {}, found = false;
    function one(aNet) {
        // recursion
        if (aNet === aToNet) {
            found = true;
            return;
        }
        if (found) {
            return;
        }
        // path via external nets is not direct path
        if (aNet !== aFromNet && aNet !== aToNet) {
            if (aNet === 'vcc' || aNet === '0' || aNet === 'in' || aNet === 'out') {
                return;
            }
        }
        if (!seen[aNet]) {
            seen[aNet] = true;
            Object.keys(aEdges[aNet]).forEach((n) => one(n));
        }
    }
    one(aFromNet, []);
    return found;
}

globalThis.edge_exists = edge_exists;
globalThis.exports = edge_exists;
