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
        var xbegin = this.range.min,
            xend = this.range.max;

        var step = this.params.step || 1;
        var f = this[this.params.func || 'sin'] || this.sin;
        var factor = this.params.factor || 1;

        var x = Math.ceil(xbegin / step) * step;
        var i = 0;
        var length = Math.floor((xend - x) / step);
        var xData = new Array(length);
        var yData = new Array(length);
        while (x < xend) {
            xData[i] = x;
            yData[i] = f(x * factor);
            x += step;
            i += 1;
        }
        return {
            x: xData,
            y: yData
        };
    },

    // range: function(begin, end) {
    //     this.trigger('update');
    // },

    sin: Math.sin,

    cos: Math.cos,

    sin2: function(x) {
        return Math.pow(Math.sin(x), 2);
    },

    cos2: function(x) {
        return Math.pow(Math.cos(x), 2);
    }
};

})(Vis);
