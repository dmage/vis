(function($, Vis) {

Vis.blocks['b-line-render'] = {
    init: function(params) {
        this.params = params;
    },

    drawItem: function(sched, layers, itemNo) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            item = content.items[itemNo],
            xAxis = content.xAxes[item.xAxisNo || 0] || Vis.error("No x-axis for item #" + itemNo),
            yAxis = content.yAxes[item.yAxisNo || 0] || Vis.error("No y-axis for item #" + itemNo),
            canvas = layers[itemNo].canvas,
            ctx = layers[itemNo].ctx,
            xData = item.renderData.x,
            yData = item.renderData.y,
            shiftData = item.renderData.shift || [],
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y, prev,
            i, l, dots,
            colorMixin = this.params.colorMixin,
            colorMixinLevel = this.params.colorMixinLevel || 0.5,
            mozilla = (navigator.oscpu || "").indexOf('Linux') > 0 &&
                navigator.userAgent.indexOf('Firefox') > 0;

        xData = item.data.x;
        yData = item.data.y;
        console.log(xData, yData);
        console.log(this.params, xAxis.scale);
        //console.time('render ' + itemNo);

        if (canvas) {
            ctx.clearRect(0, 0, dim.width, dim.height);
            canvas.css('left', '0');
            canvas.css('width', '100%');
        }

        var color = item.color || "rgb(0,0,0)";
        if (typeof colorMixin !== 'undefined') {
            var colorRgba = $.colorToRgba(color),
                mixinRgba = $.colorToRgba(colorMixin),
                lvl = colorMixinLevel;

            var result = {
                r: Math.floor((1 - lvl)*colorRgba.r + lvl*mixinRgba.r),
                g: Math.floor((1 - lvl)*colorRgba.g + lvl*mixinRgba.g),
                b: Math.floor((1 - lvl)*colorRgba.b + lvl*mixinRgba.b),
                a: colorRgba.a
            };
            if (result.a == 1) {
                color = 'rgb(' + result.r + ',' + result.g + ',' + result.b + ')';
            } else {
                color = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + result.a + ')';
            }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        i = 0;
        l = xData.length;
        dots = 0;
        prev = null;
        while (i < l) {
            if (yData[i] === null) {
                if (dots > 0) {
                    ctx.stroke();
                }
                ++i;
                dots = 0;
                prev = null;
                continue;
            }

            x = (xf(xData[i]) + 0.5);
            y = height - (yf(yData[i] + (shiftData[i] || 0)) + 0.5);
            if (prev === null) {
                ctx.beginPath();
                ctx.moveTo((x | 0) + 0.5, (y | 0) + 0.5);
            } else {
                ctx.lineTo((x | 0) + 0.5, (y | 0) + 0.5);
            }

            ++dots;
            if (mozilla && dots == 2000) {
                // restart line every 2000 points
                // it gives a bit different result, but much faster on Linux
                ctx.stroke();
                ctx.beginPath();

                dots = 0;
                prev = null;
                continue;
            }

            prev = yData[i];
            ++i;
        }
        if (dots > 0) {
            ctx.stroke();
        }

        //console.timeEnd('render ' + itemNo);
    }
};

})(jQuery, Vis);
