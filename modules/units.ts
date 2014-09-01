module Units {
"use strict";

var Units = {
    siUnits : ['A', 'V', 'Hz'],

    binaryUnits : [
        'bit', 'bits', 'b',
        'byte', 'bytes', 'Byte', 'Bytes', 'B'
    ]
};

export function getPrefix(value, unit) {
    // ...
    return {
        value: value,
        volume: 1000
    };
};

export function format(value, units, scale) {
    if (units == "unixtime") {
        var d = new Date(value*1000),
            hh = '' + d.getHours(),
            mm = '' + d.getMinutes(),
            ss = '' + d.getSeconds();
        if (hh.length === 1) hh = "0" + hh;
        if (mm.length === 1) mm = "0" + mm;
        if (ss.length === 1) ss = "0" + ss;
        return hh + ":" + mm + ":" + ss;
    } else {
        return scale.format(value);
    }
};

export function formatTicks(ticks, units, scale) {
    var labeledTicks = [];
    var i, l, tickValue;

    if (units == "unixtime") {
        for (i = 0, l = ticks.length; i < l; ++i) {
            tickValue = ticks[i];
            var labeledTick = {
                tickValue: tickValue,
                label: this.format(tickValue, units, scale),
                extraLabel: undefined
            };
            var d = new Date(ticks[i]*1000);
            if (i === 0 || new Date(ticks[i - 1]*1000).getDate() !== d.getDate()) {
                labeledTick.extraLabel = d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
            }
            labeledTicks.push(labeledTick);
        }
    } else {
        for (i = 0, l = ticks.length; i < l; ++i) {
            tickValue = ticks[i];
            labeledTicks.push({
                tickValue: tickValue,
                label: this.format(tickValue, units, scale)
            });
        }
    }

    return labeledTicks;
}

}
