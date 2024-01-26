// In optimize mode here we save currently best value against which new pedals are compared
// linter: ngspicejs-lint
// global: config
"use strict";

// best score
var max_score = 0;
var min_score = Number.MAX_VALUE;

function optimize_one(aConfigName, aValue) {
    // In optimize mode here we save currently best value against which new pedals are compared
    var aMaximize = aConfigName.substr(0, 4) === 'max ';
    // if config option is checked
    if (config.optimize[aConfigName]) {
        // are we minimizing or maximizing that value?
        if (aMaximize) {
            // is value bigger than current best?
            if (aValue > max_score) {
                // yes, remember it
                max_score = aValue;
                echo('    ' + aConfigName + ' improved', max_score);
                return true;
            } else {
                // no, discard this pedal
                echo('    ' + aConfigName + ' remained', max_score);
            }
        } else {
            // is value lower than current best?
            if (aValue < min_score) {
                // yes, remember it
                min_score = aValue;
                echo('    ' + aConfigName + ' improved', min_score);
                return true;
            } else {
                // no, discard this pedal
                echo('    ' + aConfigName + ' remained', min_score);
            }
        }
    } else {
        // not this option
        return true;
    }
}

globalThis.optimize_one = optimize_one;
globalThis.exports = optimize_one;


