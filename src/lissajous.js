// Lissajous X-Y chart (x=input, y=output)
// linter: ngspicejs-lint
// global: pearson
"use strict";

function lissajous(aTran, aVectorX, aVectorY) {
    // Create lissajous X-Y curve from 2 vectors of transient analysis
    // example: lissajous(tran().run(), 'V(3)', 'V(16)').width(402).height(402).show();
    Internal.assert_arguments_length(arguments, 3, 3, 'lissajous(tran,vectorX,vectorY)');
    Internal.assert_object_keys(aTran.data, [aVectorX, aVectorY], 'tran.data', 'lissajous(tran,vectorX,vectorY)');
    Internal.assert_not_modified(aTran, 'lissajous(tran,vectorX,vectorY)', 'tran.run()', 'Example: var t = tran().run(); lissayous(t,"V(1)","V(2)"); <-- here you have to call tran.run() before lissajous()');
    var c = chart_xy();
    c.add_series(aTran.data[aVectorX], aTran.data[aVectorY]);
    // find phase of input/output
    var xx = aTran.data[aVectorX].normalize();
    var yy = aTran.data[aVectorY].normalize();
    var p = pearson.phase(xx, yy);
    // shift the output signal to match the input phase
    /*
    chart_xy()
        .add_series(aTran.data.time, xx, 'input')
        .add_series(aTran.data.time, yy, 'output/orig')
        .show();
    */
    echo('phase', p.phase + '/' + aTran.data[aVectorY].length, 'correlation', p.correlation);
    // add green curve with phase shift removed
    if (p.phase > 0) {
        var y = aTran.data[aVectorY].slice(0);
        for (var i = 0; i < p.phase; i++) {
            y.unshift(0);
            y.pop();
        }
        /*
        chart_xy()
            .add_series(aTran.data.time, xx, 'input')
            .add_series(aTran.data.time, y.normalize(), 'output/phased')
            .show();
        */
        c.add_series(aTran.data[aVectorX], y);
    }
    // find maximal range of values to scale chart uniformly
    var b = [
        aTran.data[aVectorX].min(),
        aTran.data[aVectorX].max(),
        aTran.data[aVectorY].min(),
        aTran.data[aVectorY].max()
    ].map(Math.abs).max();
    var a = 1.1 * b;
    c.min_x(-a);
    c.max_x(a);
    c.min_y(-a);
    c.max_y(a);
    c.width(150);
    c.height(150);
    if (ngspicejs_version() >= 5) {
        c.border(false);
    }
    return c;
}

globalThis.lissajous = lissajous;
globalThis.exports = lissajous;

