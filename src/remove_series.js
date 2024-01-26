// Remove series capacitors (ngspice don't like them)
// linter: ngspicejs-lint
// global: cache_net_element_type, cache_element_by_name
"use strict";

function remove_series(aElements) {
    // Remove series capacitors (ngspice doesn't like them)
    var removed = false;
    var net_element_type = cache_net_element_type(aElements);
    var element_by_name = cache_element_by_name(aElements);
    var is_external = {'in': true, 'out': true, 'vcc': true, '0': true};
    for (const [key, val] of Object.entries(net_element_type)) {
        var common_net = key;
        if (is_external[common_net]) {
            continue;
        }
        var names = Object.keys(val);
        var values = Object.values(val).join(',');
        if (names.length === 2 && (values === 'capacitor,capacitor' || values === 'resistor,resistor')) {
            //echo(key, names, val, values, common_net);
            // get elements
            var e1 = element_by_name[names[0]];
            var e2 = element_by_name[names[1]];
            // in second component find the other net
            // jshint -W083
            var other_net = e2.nets.filter(a => a != common_net)[0];
            //echo('other_net', other_net);
            // replace common net in first component with other net
            e1.nets = e1.nets.map(a => a === common_net ? other_net : a);
            // jshint +W083
            //echo(names[0], e1.nets);
            //echo(names[1], e2.nets);
            // remove second component
            aElements.splice(aElements.indexOf(e2), 1);
            removed = true;
        }
    }
    //echo_json(aElements, true);
    return removed;
}

globalThis.remove_series = remove_series;
globalThis.exports = remove_series;

