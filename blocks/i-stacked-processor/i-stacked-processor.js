(function(Vis) {
"use strict";

Vis.blocks['i-stacked-processor'] = {
    init: function(params) {
        this.params = params || {};
    },

    run: function(items) {
        var sliceName = this.params.sliceName || "y",
            xSliceName = this.params.xSliceName || "x",
            shiftSliceName = this.params.shiftSliceName || "shift",
            yslices = [], xslices = [],
            renderSlices = [], renderX = [], renderShifts = [];

        var interpolate = {
            linear: function(x, x0, x1, y0, y1) {
                if (x0 == x1) {
                    return (y0 + y1)/2;
                } else {
                    return y0 + (y1 - y0)*(x - x0)/(x1 - x0);
                }
            }
        };

        for (var i = 0, l = items.length; i < l; ++i) {
            var renderData = items[i].renderData;
            var ySlice = renderData[sliceName] || [];
            var xSlice = renderData[xSliceName] || [];
            var shiftSlice = renderData[shiftSliceName] || [];
            yslices.push(ySlice);
            xslices.push(xSlice);
            renderSlices.push([]);
            renderShifts.push([]);
        }

        var it = [], // iterators
            pit = [], // previous iterator value
            nit = [], // next iterator value
            st = [], // state
            s = 0, // shift
            c = 0, // elements in each renderSlices and renderX
            x = null;

        // Initialize iterators and search minimal X value
        for (var i = 0; i < items.length; ++i) {
            var xData = xslices[i],
                yData = yslices[i],
                j = 0, j = 0, l = yData.length;

            if (xData.length > 0) {
                if (x === null || xData[0] < x) {
                    x = xData[0];
                }
            }

            st.push(null);
            while (j < l && yData[j] === null) {
                ++j;
            }
            it.push(j);
            pit.push(j);
            nit.push(j);
        }

        // Main loop
        var done = (x === null);
        while (!done) {
            var s = 0;
            for (var i = 0; i < items.length; ++i) {
                var y;

                // Get Y for current X value
                if (xslices[i][it[i]] == x) {
                    y = yslices[i][it[i]];
                    if (y === null) {
                        st[i] = y;
                    } else {
                        st[i] = true;

                        pit[i] = it[i];
                        nit[i] = it[i] + 1;
                        while (nit[i] < xslices[i].length - 1 && yslices[i][nit[i]] === null) {
                            ++nit[i];
                        }
                        if (nit[i] >= xslices[i].length - 1 || yslices[i][nit[i]] === null) {
                            nit[i] = it[i];
                        }
                    }
                    ++it[i];
                } else {
                    y = null;
                }

                if (y === null) {
                    y = interpolate.linear(
                        x,
                        xslices[i][pit[i]],
                        xslices[i][nit[i]],
                        yslices[i][pit[i]],
                        yslices[i][nit[i]]
                    );
                }

                if (st[i] !== true) {
                    renderSlices[i][c] = st[i];
                } else {
                    renderSlices[i][c] = y;
                }
                renderShifts[i][c] = s;
                s += y;
            }
            renderX[c] = x;
            ++c;

            // Search for next X value
            x = null;
            done = true;
            for (var i = 0, l = items.length; i < l; ++i) {
                if (it[i] == xslices[i].length) {
                    continue;
                }
                done = false;

                if (x === null || xslices[i][it[i]] < x) {
                    x = xslices[i][it[i]];
                }
            }
        }

        for (var i = 0, l = items.length; i < l; ++i) {
            var renderData = items[i].renderData;
            renderData[sliceName] = renderSlices[i];
            renderData[xSliceName] = renderX;
            renderData[shiftSliceName] = renderShifts[i];
            items[i]._rendered = false;
        }
    }
};

})(Vis);
