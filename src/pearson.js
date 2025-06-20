// Pearson correlation
// linter: ngspicejs-lint
// global:
"use strict";

function pearsonCorrelation(x, y) {
    // Find Pearson correlation between two signals
    // +1 = maximally positively correlated, 0 = not corelated, -1 = maximally negatively correlated
    const n = x.length;
    const avgX = x.reduce((a, b) => a + b) / n;
    const avgY = y.reduce((a, b) => a + b) / n;
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - avgX;
        const dy = y[i] - avgY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }
    return numerator / Math.sqrt(denomX * denomY);
}

function pearsonPhase(x, y) {
    // Find phase between 2 signals using pearson correlation
    var k = pearsonCorrelation(x, y);
    var i = 0;
    var b = y.slice(0);
    var ret = {phase: 0, correlation: k};
    var limit = y.length / 5;
    while (i < x.length) {
        b.unshift(0);
        b.pop();
        var k2 = pearsonCorrelation(x, b);
        //echo('i', i, 'k', k, 'k2', k2);
        if (k2 > k) {
            //echo('i', i, 'k', k, 'k2', k2);
            //echo('improved');
            k = k2;
            ret.phase = i;
            ret.correlation = k2;
        } else {
            //echo('no improvement', ret.phase, ret.correlation);
            if (i > limit) {
                //echo('over limit A', ret.phase, ret.correlation);
                return ret;
            }
        }
        i++;
        if (i > limit) {
            //echo('over limit B', ret.phase, ret.correlation);
            return ret;
        }
    }
    return ret;
}

globalThis.pearsonCorrelation = pearsonCorrelation;
globalThis.pearsonPhase = pearsonPhase;
globalThis.exports = {correlation: pearsonCorrelation, phase: pearsonPhase};

