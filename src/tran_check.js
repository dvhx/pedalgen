// Performant way to check if tran will fail on "timestep too small" error, returns true if it will fails
// linter: ngspicejs-lint
"use strict";
// global: config

function tran_check() {
    // Performant way to check if tran will fail on "timestep too small" error, returns true if it will fails
    // tran_check() takes ~8ms
    // singular_matrix() takes ~2ms (but cannot detect "timestepping too small" error)
    // tran().run() takes ~30ms
    var netlist = Internal.netlist_render(netlist_devices, Internal.netlist_line_markers, true, false);
    Internal.ngspice_command('destroy all');
    Internal.ngspice_netlist(netlist);
    Internal.ngspice_command('tran ' + config.tran.step.fromEng() + ' ' + config.tran.interval.fromEng() + ' ' + config.tran.start.fromEng());
    var l = Internal.ngspice_log();
    if (l.at(-1) === 'stderr tran simulation(s) aborted') {
        return false;
    }
    l = l.toString();
    if (l.indexOf('Warning: singular matrix') >= 0) {
        return true;
    }
    return false;
}

globalThis.tran_check = tran_check;
globalThis.exports = tran_check;

