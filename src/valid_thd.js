// Measure THD, return true if it matches config constraints
// linter: ngspicejs-lint
"use strict";

function valid_thd(aConfig) {
    // Measure THD, return true if it matches config constraints
    var min_thd = eng(aConfig.constraints.thd.min);
    var max_thd = eng(aConfig.constraints.thd.max);
    var min_even = eng(aConfig.constraints.even.min);
    var max_even = eng(aConfig.constraints.even.max);
    var min_odd = eng(aConfig.constraints.odd.min);
    var max_odd = eng(aConfig.constraints.odd.max);
    // basic fft
    var f = fft().interval(aConfig.fft.interval).fstop(aConfig.fft.fstop).run('V(load)');
    // measure thd, even and odd harmonics
    var thd = f.thd(aConfig.input.frequency, aConfig.fft.harmonics);
    var even = f.even(aConfig.input.frequency, aConfig.fft.harmonics);
    var odd = f.odd(aConfig.input.frequency, aConfig.fft.harmonics);
    // found?
    if (thd >= min_thd && thd <= max_thd &&
        even >= min_even && even <= max_even &&
        odd >= min_odd && odd <= max_odd
    ) {
        echo('      Valid thd', thd.toFixed(3), 'odd', odd.toFixed(3), 'even', even.toFixed(3));
        return true;
    }
    echo('      Invalid thd', thd.toFixed(3), 'odd', odd.toFixed(3), 'even', even.toFixed(3));
    return false;
}

globalThis.valid_thd = valid_thd;
globalThis.exports = valid_thd;


