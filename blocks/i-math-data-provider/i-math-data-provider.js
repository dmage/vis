(function(Vis) {

Vis.blocks['i-math-data-provider'] = {
    init: function(params) {
        var _this = this,
            timeRangeProvider = _this.timeRangeProvider = params.timeRangeProvider;

        _this.params = params;

        timeRangeProvider.on('update.vis', function() {
            _this.range = timeRangeProvider.get();
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

    sin2: function(x) {
        return { x: t, y: Math.pow(Math.sin(t), 2) };
    },

    cos2: function(x) {
        return { x: t, y: Math.pow(Math.cos(t), 2) };
    },

    lissajous: function(t) {
        return {
            x: Math.sin(this.params.a * t),
            y: Math.sin(this.params.b * t)
        };
    }
};

})(Vis);
