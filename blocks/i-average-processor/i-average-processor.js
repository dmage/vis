(function(Vis) {
"use strict";

Vis.blocks['i-average-processor'] = {
    init: function(params) {
        this.params = params || {};
    },

    run: function(items) {
        var xSliceName = this.params.xSliceName || "x",
            ySliceName = this.params.ySliceName || "y",
            width = this.params.dimensions.width,
            factor = this.params.factor || 1;

        for (var i = 0, l = items.length; i < l; ++i) {
            var scale = items[i].xAxis.scale;
            var step = (scale.inputMax - scale.inputMin)/width*factor;
            var renderData = items[i].renderData;
            var xSlice = renderData[xSliceName] || [];
            var ySlice = renderData[ySliceName] || [];

            if (xSlice.length === 0) {
                continue;
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

            renderData[xSliceName] = xResult;
            renderData[ySliceName] = yResult;
        }
    }
};

})(Vis);
