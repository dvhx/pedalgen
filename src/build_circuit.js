// Build ngspicejs circuit including the interface (pickup, battery, load)
// linter: ngspicejs-lint
// global: config
"use strict";

function build_circuit(aElements) {
    // Build ngspicejs circuit including the interface (pickup, battery, load)
    netlist_clear();
    // interface
    // pickup
    inductor('LS', 'sig', 'sig1', config.input.ls);
    resistor('RS', 'sig1', 'sig2', config.input.rs);
    var v1 = sinewave('V1', 'sig2', 0).v(config.input.amplitude).f(config.input.frequency);
    resistor('RP', 'sig', 0, config.input.rp);
    capacitor('CP', 'sig', 0, config.input.cp);
    // rest of the interface
    battery('V2', 'vcc', 0, config.supply.voltage);
    capacitor('CIN', 'sig', 'in', config.input.capacitor);
    capacitor('COUT', 'out', 'load', config.output.capacitor);
    resistor('RLOAD', 'load', 0, config.output.load);
    // pedal
    aElements.forEach((e) => {
        // convert '0' to 0 (ngspicejs wants either numbers (123) or string ('vcc') but not 'numbers' ('123')
        var n = e.nets.map((a) => a === '0' ? 0 : a);
        switch (e.type) {
        case "resistor":
            e.device = resistor(e.name, n[0], n[1], e.value);
            break;
        case "capacitor":
            e.device = capacitor(e.name, n[0], n[1], e.value);
            break;
        case "inductor":
            e.device = inductor(e.name, n[0], n[1], e.value);
            break;
        case "diode":
            e.device = diode(e.name, n[0], n[1], e.value);
            break;
        case "transistor_npn":
            e.device = npn(e.name, n[0], n[1], n[2], e.value);
            break;
        case "transistor_pnp":
            e.device = pnp(e.name, n[0], n[1], n[2], e.value);
            break;
        default:
            hint(JSON.stringify(e, undefined, 4));
            throw "Unsupported element type: " + e.type;
        }
    });
    // return sinewave source (for good pedals it will be replaced with audio source)
    return {v1};
}

globalThis.build_circuit = build_circuit;
globalThis.exports = build_circuit;
