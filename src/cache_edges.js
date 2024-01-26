// Return all pairs of connected nets as {net1:{net2:true,net3:true}}
// linter: ngspicejs-lint
"use strict";

function cache_edges(aElements) {
    // Return all pairs of connected nets as {net1:{net2:true,net3:true}}
    var edges = {}, n, i, j, a, b;
    // find all connections between two nets
    aElements.forEach((e) => {
        n = e.nets;
        for (i = 0; i < n.length - 1; i++) {
            for (j = i + 1; j < n.length; j++) {
                a = n[i];
                b = n[j];
                edges[a] = edges[a] || {};
                edges[a][b] = true;
                edges[b] = edges[b] || {};
                edges[b][a] = true;
            }
        }
    });
    return edges;
}

globalThis.cache_edges = cache_edges;
globalThis.exports = cache_edges;
