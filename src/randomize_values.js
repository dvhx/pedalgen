// Randomize only values of elements, do not randomize nets or models
// linter: ngspicejs-lint
// global: config, pedal
"use strict";

function randomize_values() {
    // Randomize only values of elements, do not randomize nets or models
    // Basically only elements that supports fast alter
    var changes = {},
        change_what = {resistor: 'r', capacitor: 'c', inductor: 'l'};
    pedal.elements.forEach((e) => {
        // only change values if tune=true (i.e. don't change transistor models because we are not changing models during tuning)
        if (config.complexity[e.type].tune) {
            if (!change_what[e.type]) {
                throw "Cannot decide which attribute to change during tuning of " + e.type;
            }
            var values = config.complexity[e.type].values;
            var attr_name = change_what[e.type];
            var val = values.randomItem();
            changes[e.name] = val;
            // change aElements object
            e.value = val;
            // aElements is just an array of {type,name,nets,value}, change also device so that we can call alter() function
            e.device.attr[attr_name] = val;
            e.device.alter();
        }
    });
    //echo(JSON.stringify(changes));
}

globalThis.exports = randomize_values;
