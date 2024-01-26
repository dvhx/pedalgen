// Measure current, return true if current matches config constraints
// linter: ngspicejs-lint
"use strict";
// global: tran_check

function valid_current(aConfig) {
    // Measure current, return true if current matches config constraints
    var min_value = eng(aConfig.constraints.current.min);
    var max_value = eng(aConfig.constraints.current.max);
    // basic tran
    if (tran_check()) {
        return;
    }
    var t = tran().start(aConfig.tran.start).step(aConfig.tran.step).interval(aConfig.tran.interval).run();
    // measure battery current
    var current = t.rms('I(V2)');
    //echo('  current', current.toEng());
    // found!
    if (current >= min_value && current <= max_value) {
        echo('    Valid current', current.toEng());
        return true;
    }
    return false;
}

globalThis.valid_current = valid_current;
globalThis.exports = valid_current;



