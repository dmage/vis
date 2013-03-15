(function(Vis) {

Vis.blocks['i-scale-linear'] = {
    update: function() {
        var inputMin = this.inputMin;
        var outputMin = this.outputMin;
        var factor = (this.outputMax - outputMin)/(this.inputMax - inputMin);

        this.f = function f(x) {
            return outputMin + (x - inputMin)*factor;
        };

        this.fInv = function fInv(x) {
            return inputMin + (x - outputMin)/factor;
        };
    },

    input: function(min, max) {
        if (min == max) {
            if (min >= 0 && min - 1 >= 0) {
                this.inputMin = min - 1;
                this.inputMax = min + 2;
            } else if (min >= 0 && min - 1 < 0) {
                this.inputMin = 0;
                this.inputMax = (min > 0 ? 3*min : 1);
            } else if (min < 0) {
                this.inputMin = min - 2;
                this.inputMax = min + 1;
            }
        } else if (min > max) {
            console.log('i-scale-linear.input: min > max;', { min: min, max: max });
            this.inputMax = min;
            this.inputMin = max;
        } else {
            this.inputMin = min;
            this.inputMax = max;
        }

        this.update();
    },

    output: function(min, max) {
        if (min >= max) {
            console.log('i-scale-linear.output: min >= max;', { min: min, max: max });
            this.outputMax = min;
            this.outputMin = max;
        } else {
            this.outputMin = min;
            this.outputMax = max;
        }

        this.update();
    },

    f: function(x) {
        return undefined;
    },

    fInv: function(x) {
        return undefined;
    },

    ticks: function(n, units) {
        var range = (this.inputMax - this.inputMin);
        var delta = range/n;

        if (units == 'unixtime' && range > 2*24*60*60) {
            return this.dayTicks(n);
        }

        var factor, volume;
        if (units == 'unixtime') {
            factor = 1;
            volume = 60;
        }
        else {
            var l = Math.ceil(Math.log(delta)/Math.log(10));
            factor = Math.pow(10, l - 2);
            volume = 100;
        }

        delta /= factor;

        // Searching nearest factor of volume
        var rounded_delta = Math.round(delta),
            diff = 0;
        for (var i = 1; i < volume; ++i) {
            if (rounded_delta <= delta) {
                diff = Math.floor(i/2);
            } else {
                diff = -Math.floor(i/2);
            }
            rounded_delta = Math.round(delta) + diff;
            if (volume % rounded_delta === 0) {
                break;
            }
        }

        delta = rounded_delta*factor;

        var result = [],
            xMin = Math.ceil(this.inputMin/delta)*delta,
            xMax = Math.floor(this.inputMax/delta)*delta,
            x = xMin,
            steps = Math.round((xMax - xMin)/delta) + 1;
        for (i = 0; i < steps; ++i) {
            result.push(x);
            x += delta;
        }

        return result;
    },

    dayTicks: function(n) {
        var range = (this.inputMax - this.inputMin);
        var minD = new Date(this.inputMin*1000);
        var maxD = new Date(this.inputMax*1000);
        var d = new Date(this.inputMin*1000);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        var result = [];
        while (+d <= +maxD) {
            if (+d < +minD) {
                d.setDate(d.getDate() + 1);
                continue;
            }
            result.push(+d/1000);
            d.setDate(d.getDate() + 1);
        }
        return result;
    },

    format: function(value) {
        return Math.round(value*100)/100;
    }
};

})(Vis);
