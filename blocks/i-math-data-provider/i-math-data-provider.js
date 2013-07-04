(function(Vis) {

Vis.blocks['i-math-data-provider'] = {
    init: function(params) {
        var _this = this,
            timeRangeProvider = _this.timeRangeProvider = params.timeRangeProvider;

        _this.params = params;
        _this.ready = 0;

        timeRangeProvider.on('update.vis', function() {
            _this.range = timeRangeProvider.get();
            _this.ready += 1;
            $(_this).trigger('update.vis');
        });
        _this.range = timeRangeProvider.get();
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    get: function() {
        var tbegin = this.range.min,
            tend = this.range.max;

        var step = this.params.step || 1;
        var f = this[this.params.func || 'sin'] || this.sin;
        var factor = this.params.factor || 1;

        var t = Math.ceil(tbegin / step) * step;
        var i = 0;
        var length = Math.floor((tend - t) / step);
        var xData = new Array(length);
        var yData = new Array(length);
        while (t < tend) {
            var tmp = f.call(this, t * factor);
            xData[i] = tmp.x;
            yData[i] = tmp.y;
            t += step;
            i += 1;
        }
        return {
            x: xData,
            y: yData
        };
    },

    sin: function(t) {
        return { x: t, y: Math.sin(t) };
    },

    cos: function(t) {
        return { x: t, y: Math.cos(t) };
    },

    sin2: function(t) {
        return { x: t, y: Math.pow(Math.sin(t), 2) };
    },

    cos2: function(t) {
        return { x: t, y: Math.pow(Math.cos(t), 2) };
    },

    lissajous: function(t) {
        return {
            x: Math.sin(this.params.a * t),
            y: Math.sin(this.params.b * t)
        };
    },

    demo1: function(t) {
        var a = 0.05;
        return {
            x: t,
            y:
             1.5*Math.sin(51*a*t) +
            -1.4*Math.sin(21*a*t) +
             1.3*Math.sin(11*a*t) +
            -1.2*Math.sin(9*a*t) +
             1.1*Math.sin(2*a*t) +
               5*Math.sin(1.73205*a*t) +
                 Math.sin(a*t) +
               7*Math.sin(0.707106*a*t) +
                 Math.sin(0.6*a*t) +
              10*Math.sin(0.1*a*t) +
              11*Math.sin(0.223606*a*t) +
               7*Math.sin(0.173205*a*t) +
               5*Math.sin(0.141421*a*t) +
              20*Math.sin(0.02*a*t) +
               5*Math.sin(0.03*a*t) +
              20*Math.sin(0.025*a*t) +
              11*Math.sin(0.0158770*a*t) +
              17*Math.sin(0.00294565*a*t) +
              19*Math.sin(0.000977518*a*t) +
              11*Math.sin(0.0000305185*a*t)
        }
    }
};

})(Vis);
