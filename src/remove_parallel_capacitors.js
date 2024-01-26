// Remove parallel capacitors (ngspice don't like them)
// linter: ngspicejs-lint
"use strict";

function remove_parallel_capacitors(aElements) {
    // Remove parallel capacitors (ngspice don't like them)
    var o = {}, nn;
    aElements.forEach((a,i) => {
        if (a.type !== 'capacitor') {
            return;
        }
        // parallel
        nn = a.nets[0] + ',' + a.nets[1];
        if (o[nn]) {
            //echo('removed', JSON.stringify(aElements[i]));
            aElements.splice(i, 1);
            return;
        }
        // anti-parallel
        nn = a.nets[1] + ',' + a.nets[0];
        if (o[nn]) {
            //echo('removed', JSON.stringify(aElements[i]));
            aElements.splice(i, 1);
            return;
        }
        o[nn] = 1;
    });
}

globalThis.remove_parallel_capacitors = remove_parallel_capacitors;
globalThis.exports = remove_parallel_capacitors;
