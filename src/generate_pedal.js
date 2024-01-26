// Generate pedal of given complexity
// linter: ngspicejs-lint
// global: cache_net_element_pin, reason, cache_edges, edge_exists, remove_parallel_capacitors, remove_series, cache_net_element_type
"use strict";

function try_generate_pedal(aComplexity) {
    // Try to generate pedal of given complexity, return undefined if some internal check failed

    // pick random net count first
    aComplexity.net.count = random_int(aComplexity.net.min, aComplexity.net.max);

    // pick net numbers: 4 external (vcc,in,out,0=gnd) and numbers (1000,1001,1002,...) for internal networks of pedal
    var nets = {
        'in': [],
        'out': [],
        'vcc': [],
        0: []
    };
    var net_names_internal = [];
    for (let i = 0; i < aComplexity.net.count; i++) {
        var s = ('net' + (i + 1)).toString();
        net_names_internal.push(s);
        nets[s] = [];
    }
    var net_names = Object.keys(nets);
    //echo_json(net_names);

    function random_nets(aPinCount, aOnlyInternalNets) {
        // Return array of random nets, if count is only 2 make sure they differ
        var r = [];
        while (r[0] === r[1]) {
            r = [];
            for (var i = 0; i < aPinCount; i++) {
                r.push((aOnlyInternalNets ? net_names_internal : net_names).randomItem());
            }
        }
        return r;
    }

    // various caches and lookups
    var net_element_pin = {};
    var element_by_name = {};

    // pick random counts and generate random items
    var prefix_counter = {};
    var element, elements = [];
    for (const [key, obj] of Object.entries(aComplexity)) {
        if (key === 'net') {
            continue;
        }
        // random count
        if (obj.min > obj.max) {
            throw new Exception('Config.complexity.' + key + '.min (' + obj.min + ') must be lower or equal than max (' + obj.max + ')');
        }
        obj.count = random_int(obj.min, obj.max);
        obj.items = [];
        // counter for unique names
        prefix_counter[obj.prefix] = prefix_counter[obj.prefix] || 0;
        // convert series_e3/e6/e12 to actual values
        if (obj.values === 'series_e3') {
            obj.values = series_e3(obj.values_min, obj.values_max, true);
        }
        if (obj.values === 'series_e6') {
            obj.values = series_e6(obj.values_min, obj.values_max, true);
        }
        if (obj.values === 'series_e12') {
            obj.values = series_e12(obj.values_min, obj.values_max, true);
        }
        // generate random items
        for (let i = 0; i < obj.count; i++) {
            prefix_counter[obj.prefix]++;
            element = {
                type: key,                                     // resistor
                name: obj.prefix + prefix_counter[obj.prefix], // R1
                value: obj.values.randomItem(),                // random value
                nets: random_nets(obj.pins)                    // random nets
            };
            element_by_name[element.name] = element;
            obj.items.push(element);
            element.index = elements.push(element);
        }
    }

    net_element_pin = cache_net_element_pin(elements);
    //echo_elements_as_netlist(elements);

    // check if all nets can be connected
    if (net_names.length - 1 > Object.keys(elements).length) {
        reason.inc('Generator: Too many nets for given amount of components');
        return;
    }

    // check if all external nets are used (at least once)
    // check if all internal nets are used (at least twice)
    var edges = cache_edges(elements);
    //echo_json(edges, true);
    //echo_json(net_names, true);
    var is_external = {'in': true, 'out': true, 'vcc': true, '0': true};
    for (var i = 0; i < net_names.length; i++) {
        var n = net_names[i];
        if (!edges[n]) {
            reason.inc('Generator: Missing net ' + n);
            return;
        }
        if (Object.keys(edges[n]).length < (is_external[n] ? 1 : 2)) {
            reason.inc('Generator: Net ' + n + ' needs more connections');
            return;
        }
    }

    // check if all required nets are used
    var used_nets = Object.keys(net_element_pin);
    ignore(used_nets);
    //var missing_nets = net_names.complement(used_nets);
    net_element_pin = cache_net_element_pin(elements);
    if (Object.keys(net_element_pin).length != net_names.length) {
        reason.inc('Generator: Not all nets were used: ' + Object.keys(net_element_pin).join(', '));
        return;
    }

    // check if path from input to output exists
    if (!edge_exists(edges, 'in', 'vcc')) {
        reason.inc('Generator: No in-vcc path');
        return;
    }
    if (!edge_exists(edges, 'in', 'out')) {
        reason.inc('Generator: No in-out path');
        return;
    }
    if (!edge_exists(edges, 'in', '0')) {
        reason.inc('Generator: No in-0 path');
        return;
    }
    if (!edge_exists(edges, 'out', 'vcc')) {
        reason.inc('Generator: No out-vcc path');
        return;
    }
    if (!edge_exists(edges, 'out', '0')) {
        reason.inc('Generator: No out-0 path');
        return;
    }

    // check for parallel capacitors
    remove_parallel_capacitors(elements);

    // remove series components of the same kind (resistors, caps)
    if (remove_series(elements)) {
        net_element_pin = null;
        element_by_name = null;
    }

    // transistors must have path to (in,out,vcc,0)
    var tran_path_to_ext = true;
    var which = '';
    elements.filter(e => e.nets.length === 3).forEach((e) => {
        //echo(e.type, e.name, e.nets);
        var edges = cache_edges(elements);
        var dst = ['in', 'out', 'vcc', '0'];
        dst.forEach(d => {
            e.nets.forEach(n => {
                if ((n !== d) && !edge_exists(edges, n, d)) {
                    //reason.inc(Generator: e.type + ' ' + e.name + ' has no path from ' + n + ' to ' + d);
                    tran_path_to_ext = false;
                    which = e.type;
                    return;
                }
            });
        });
    });
    if (!tran_path_to_ext) {
        reason.inc('Generator: ' + which + ' has no path to external net');
        return;
    }

    // in/out directly to only caps (making a series cap combination where it's hard to remove)
    var net_element_type = cache_net_element_type(elements);
    if (!net_element_type.in) {
        reason.inc('Generator: No in');
        return;
    }
    if (Object.values(net_element_type.in).unique().join('') === 'capacitor') {
        reason.inc('Generator: Input has only caps');
        return;
    }
    if (!net_element_type.out) {
        reason.inc('Generator: No out');
        return;
    }
    if (Object.values(net_element_type.out).unique().join('') === 'capacitor') {
        reason.inc('Generator: Output has only caps');
        return;
    }
    // vcc/gnd to only caps (no DC path)
    if (!net_element_type.vcc) {
        reason.inc('Generator: No Vcc');
        return;
    }
    if (Object.values(net_element_type.vcc).unique().join('') === 'capacitor') {
        reason.inc('Generator: Vcc has only caps');
        return;
    }
    if (!net_element_type[0]) {
        reason.inc('Generator: No Gnd');
        return;
    }
    if (Object.values(net_element_type['0']).unique().join('') === 'capacitor') {
        reason.inc('Generator: Ground has only caps');
        return;
    }

    reason.inc('Generator: Generated');

    return {
        net_names,
        elements,
        net_element_pin
    };
}

function generate_pedal(aComplexity) {
    // Keep generating pedal until it is valid
    var attempt = 0;
    var pedal;
    while (!pedal) {
        attempt++;
        echo_progress();
        pedal = try_generate_pedal(aComplexity);
    }
    pedal.attempt = attempt;
    return pedal;
}

globalThis.generate_pedal = generate_pedal;
globalThis.exports = generate_pedal;

