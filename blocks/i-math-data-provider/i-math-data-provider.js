(function(Vis) {

Vis.blocks['i-math-data-provider'] = {
    init: function(params) {
        this.params = params;
    },

    get: function(xbegin, xend) {
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
