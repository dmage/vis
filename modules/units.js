(function(exports) {
"use strict";

var Units = {
    siUnits : ['A', 'V', 'Hz'],

    binaryUnits : [
        'bit', 'bits', 'b',
        'byte', 'bytes', 'Byte', 'Bytes', 'B'
    ]
};

Units.getPrefix = function(value, unit) {
    // ...
    return {
        value: value,
        volume: 1000
    };
};

Units.format = function(value, units, scale) {
    if (units == "unixtime") {
        var d = new Date(value*1000),
            hh = d.getHours(),
            mm = d.getMinutes(),
            ss = d.getSeconds();
        if (hh < 10) hh = "0" + hh;
        if (mm < 10) mm = "0" + mm;
        if (ss < 10) ss = "0" + ss;
        return hh + ":" + mm + ":" + ss;
    } else {
        return scale.format(value);
    }
};

Units.formatTicks = function(ticks, units, scale) {
    var labeledTicks = [];
    var i, l, tickValue;

    if (units == "unixtime") {
        for (i = 0, l = ticks.length; i < l; ++i) {
            tickValue = ticks[i];
            var labeledTick = {
                tickValue: tickValue,
                label: this.format(tickValue, units, scale)
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
};

exports.Units = Units;

})(window);
