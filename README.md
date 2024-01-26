# pedalgen

Generate random analog guitar pedals in ngspicejs

# How it works

Pedalgen is a [ngspicejs](https://github.com/dvhx/ngspicejs) script that
generates random network of passive components (resistors, capacitors,
inductors, diodes, NPN and PNP transistors) and then simulates them in ngspice.
Then it performs Transient analysis, measures AC characteristic and FFT and
compare the results with user-specified requirements. If the pedal matches the
requirements it is saved, all charts are saved as gif images and wav file with 3s long chord is
passed through the pedal and output is saved as wav file. Then new pedal is generated
and cycle continues. After few minutes you can have tens of pedals generated
which you can then review and build the ones you like.

# How to use it

- Install and compile [ngspicejs](https://github.com/dvhx/ngspicejs)
- Download pedalgen
- Edit pedalgen.json config file
- Run pedalgen.ngjs script
- Saved pedals will be in batch/ directory

# Configuration file

Everything is defined in one configuration file [pedalgen.json](pedalgen.json).
The options are:

```json
    "seed": 0,
```

"seed" is seed for pseudo-random generator, this is only for debugging, leave it 0 to
generate trully random pedals, any positive value will always generate the same pedals
which is useful during testing and development.

```json
    "generate_how_many_pedals": 20,
```

"generate_how_many_pedals" defines how many pedals you want to generate, after that the program ends.
The default config file generates 20 pedals in 15 minutes or so.

```json
    "input": {
        "amplitude": 0.1,
        "frequency": 196,
        "ls": 2.85,
        "rs": 5360,
        "cp": "258p",
        "rp": "245k",
        "capacitor": "10u",
        "wav": "wav/chord.wav"
    },
```

"input" defines the input section of the pedal. "amplitude" and "frequency" are the
parameters of the sinewave generator at the input. "ls" is series inductance,
"rs" is series resistance, "cp" is parallel capacitance and "rp" is parallel resistance
of the singlecoil pickup model. "capacitor" is value of input capacitor, "wav" is the
filename of the wav file used to test how the pedal sounds.

```json
    "output": {
        "capacitor": "10u",
        "load": "50k"
    },
```

"output" defines what is connected to the output of the pedal, "capacitor" is value of output capacitor
and "load" is resistance of the load.

```json
    "supply": {
        "voltage": 9
    },
```

"supply" defines the battery voltage, e.g. 9V battery.

```json
    "complexity": {
        "net":            {"min": 2, "max": 5},
        "resistor":       {"min": 1, "max": 6, "pins": 2, "tune": true, "prefix": "R", "values": "series_e12", "values_min": "1", "values_max": "10M"},
        "capacitor":      {"min": 1, "max": 6, "pins": 2, "tune": true, "prefix": "C", "values": "series_e12", "values_min": "10p", "values_max": "470u"},
        "transistor_npn": {"min": 1, "max": 2, "pins": 3, "tune": false, "prefix": "Q", "values": ["2N3904", "BC547", "2N2222A"]},
        "transistor_pnp": {"min": 0, "max": 0, "pins": 3, "tune": false, "prefix": "Q", "values": ["2N3906", "BC557"]},
        "diode":          {"min": 0, "max": 2, "pins": 2, "tune": false, "prefix": "D", "values": ["1N34A", "1N4148", "1N5819", "1N60P", "1N5399", "FR207", "FR107", "1N4007", "BAT43", "LED_GREEN", "LED_BLUE", "LED_RED", "LED_YELLOW", "LED_WHITE"]},
        "inductor":       {"min": 0, "max": 0, "pins": 2, "tune": true, "prefix": "L", "values": "series_e12", "values_min": "1u", "values_max": "100m"}
    },
```

"complexity" defines how many nets and components are being used and allowed value of the components.
"min" and "max" defines the count, a random value between "min" and "max" is used in randomly generated pedals.
For transistors and diodes you can specify models in "values" array (you can only use models that ngspicejs
supports). Leave "pins", "tune" and "prefix" as they are.

```json
    "ac": {
        "fstart": 16,
        "fstop": "10k"
    },
```

"ac" defines the AC small signal analysis' starting (fstart) and ending (fstop) frequencies in Hz.

```json
    "tran": {
        "start": 0,
        "step": "20u",
        "interval": "20m"
    },
```

"tran" defines "interval" and "step" for transient analysis. To allow for 48kHz audio
keep the step at 20us or lower (1/48000 = 20.833us).

```json
    "fft": {
        "interval": 0.3,
        "fstop": "2k",
        "harmonics": 10
    },
```

"fft" defined the FFT analysis, "interval" is duration used for FFT, the longer the
duration the narrower the peaks will be, "fstop" is maximal frequency and "harmonics"
is number of harmonics used to calculate THD.

```json
    "constraints": {
        "gain": [
            {"frequency": 196, "min": 1.1, "max": 99999},
            {"frequency": 1000, "min": 0.1, "max": 99999}
        ],
        "current": {"min": "40u",  "max": "20m"},
        "thd":     {"min": 0.10,   "max": 99999},
        "even":    {"min": 0,      "max": 1},
        "odd":     {"min": 0,      "max": 1}
    },
```

"constraints" block defines how the pedals will be judged. The padal will only
be saved if it passes all constraints, all other pedals will be ignored.

"gain" defines AC characteristic constraints e.g. at 196Hz minimal gain is 1.1,
if you use value above 1.0 you can be almost certain that transistor is in signal
path and you didn't just generate passive tone circuit. However sometimes you want
more pedals so you can lower it to 0.5 or 0.3. At 1000Hz it uses 0.1 because the
input pickup is high inductance singlecoil (inductance 2.85H) which often makes
AC fall sharply so if you use too high gain at 1kHz it will probably never find any
pedals. If you don't want muddy pedals you can set gain at 1kHz higher and then
use low or no inductance source (like a buffer or something).

"current" defines minimal and maximal current that pedal consumes. Real world
pedals with very low consumption need around 80uA or so, so 40uA is good minimal value.
You also don't want pedal to consume too much power so 20mA max is good default.
Of course you can change those values.

"thd" defines minimal and maximal total harmonic distortion. If you are designing
clean amplifier use min: 0, max: 0.01, if you are designing gentle distortion use min:0.1, max: 0.3
if you want heavy fuzz use min: 0.3 or even 0.5 and max: 99999.

"even" defines ratio of even harmonics, if you want mostly even harmonics use min: 0.5 max: 1.0

"odd" defines ratio of odd harmonics, if you want mostly odd harmonics use min: 0.5 max: 1.0

```json
    "optimize": {
        "max gain": false,
        "min current": false,
        "min thd": false,
        "max thd": false,
        "max even": false,
        "max odd": false,
        "max thd*even": false,
        "max thd*odd": false
    }
```

"optimize" block is used if you are only interested in pedal with maximal or minimal attribute, for example
if you are looking for pedal with maximal thd set "max thd": true. This doesn't
change how pedals are generated but if pedal is found with thd 0.10 and the next
found pedal has 0.08 it will be ignored. If the next pedal has thd 0.15 it will be
saved and next pedal will be only saved if it is higher than 0.15. So instead of 100 pedals
you will have only few, each with slightly higher thd. If you want to find ever-cleaner
amp choose "min thd": true.

* Example batches *

I let the pedalgen run for a two days with different settings and here are few cherry-picked pedals
out of 600+ pedals it found:

- [batch/cherrypicked/index.html](batch/cherrypicked/index.html)

# Support

You can support development on [Patreon](https://www.patreon.com/DusanHalicky) or you can hire me.
via [Upwork](https://www.upwork.com/freelancers/~013b4c3d6e772fdb01)


