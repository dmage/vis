(function(Vis) {

Vis.blocks['b-grid-overlay'] = {
    init: function(params) {
        this.params = params;
    },

    layersRequest: function() {
        return [{
            xAxisNo: 0,
            yAxisNo: 0
        }];
    },

    draw: function(sched, layers) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            xAxis = content.xAxes[0],
            yAxis = content.yAxes[0],
            canvas = layers[0].canvas,
            ctx = layers[0].ctx,
            f, ticks;

        if (canvas) {
            ctx.clearRect(0, 0, dim.width, dim.height);
            canvas.css('left', '0');
            canvas.css('top', '0');
            canvas.css('width', '100%');
            canvas.css('height', dim.height + 'px');
        }

        if (typeof ctx.mozDash !== 'undefined') {
            ctx.mozDash = [2, 4];
        }

        if (xAxis) {
            layers[0].xAxisRange = {
                min: xAxis.scale.inputMin,
                max: xAxis.scale.inputMax
            };

            f = xAxis.scale.f;
            ticks = xAxis.ticks;
            ctx.strokeStyle = "rgb(235,235,235)";
            ctx.lineWidth = 1;
            for (var l = ticks.length, i = 0; i < l; ++i) {
                var x = (Math.round(f(ticks[i])) + 0.5);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        if (yAxis) {
            layers[0].yAxisRange = {
                min: yAxis.scale.inputMin,
                max: yAxis.scale.inputMax
            };

            f = yAxis.scale.f;
            ticks = yAxis.ticks;
            ctx.strokeStyle = "rgb(220,220,220)";
            ctx.lineWidth = 1;
            for (var l = yAxis.ticks.length, i = 0; i < l; ++i) {
                var y = height - (Math.round(f(ticks[i])) + 0.5);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }

        if (typeof ctx.mozDash !== 'undefined') {
            ctx.mozDash = null;
        }

        sched.next();
    }
};

})(Vis);
