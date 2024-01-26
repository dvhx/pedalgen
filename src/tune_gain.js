// Tune circuit until gain matches config constraints
// linter: ngspicejs-lint
// global: reason
"use strict";

function tune_gain(aConfig, aRandomizeCallback) {
    // Tune circuit until gain matches config constraints
    var c = aConfig.constraints.gain;
    var frequencies = c.map((a) => a.frequency);
    var attempts = 300;
    var a, v;
    var values;
    var easy_ok = false;
    var ret = [];

    // instead of doing 200x attempt at gain <A, B> first try 20x to find gain <A/10, B*10>
    // if we don't find gain that has 10x looser interval, we will never find match for actual gain interval
    easy:
    for (a = 0; a < attempts / 10; a++) {
        echo_progress();
        values = ac_fast(aConfig.ac.fstart, aConfig.ac.fstop, 'load', frequencies, true);
        for (v = 0; v < values.length; v++) {
            if ((values[v] < c[v].min / 10) || (values[v] > c[v].max * 10)) {
                reason.inc('tune: easy gain');
                aRandomizeCallback();
                continue easy;
            }
        }
        //echo('easy passed', values);
        easy_ok = true;
        break;
    }
    if (!easy_ok) {
        //echo('easy not ok');
        return;
    }

    // check actual gain interval
    hard:
    for (a = 0; a < attempts; a++) {
        echo_progress();
        values = ac_fast(aConfig.ac.fstart, aConfig.ac.fstop, 'load', frequencies, true);
        //values = ac().fast_values_at('load', frequencies, true);
        //echo(values.map(a => a.toFixed(6)).join(', '));
        for (v = 0; v < values.length; v++) {
            if (values[v] < c[v].min || values[v] > c[v].max) {
                reason.inc('tune: full gain');
                aRandomizeCallback();
                continue hard;
            }
        }
        for (v = 0; v < values.length; v++) {
            ret.push({value: values[v], frequency: frequencies[v]});
        }
        echo('  Tuned gains', values.map(a => a.toFixed(3)).join(', '));
        return {
            gain: values[0],
            ac: ret
        };
    }
}

globalThis.tune_gain = tune_gain;
globalThis.exports = tune_gain;




