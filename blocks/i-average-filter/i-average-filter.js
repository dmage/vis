(function(Vis) {
"use strict";

Vis.blocks['i-average-filter'] = {
    init: function(params) {
        this.params = params || {};
    },

    run: function(item, data) {
        var xSliceName = this.params.xSliceName || "x",
            ySliceName = this.params.ySliceName || "y",
            step = this.params.step || 300;

        var xSlice = data[xSliceName] || [];
        var ySlice = data[ySliceName] || [];

        if (xSlice.length === 0) {
            return data;
        }

        var xResult = [],
            yResult = [];

        var px = Math.floor(xSlice[0]/step)*step;
        var py = ySlice[0];
        var n = 1;
        for (var j = 1; j < xSlice.length; ++j) {
            var x = xSlice[j],
                y = ySlice[j];
            var sx = Math.floor(x/step)*step;
            if (sx != px) {
                xResult.push(px + step/2);
                yResult.push(py/n);
                py = 0;
                n = 0;
            }
            px = sx;
            py += y;
            n += 1;
        }
        xResult.push(px + step/2);
        yResult.push(py/n);

        data[xSliceName] = xResult;
        data[ySliceName] = yResult;

        return data;
    }
};

})(Vis);
