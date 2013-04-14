(function($, Vis) {

Vis.blocks['b-render-overlay'] = {
    init: function(params) {
        var _this = this;

        _this.params = params;

        _this.render = Vis.create(
            _this.params,
            _this.params.renderName || 'b-line-render'
        );
    },

    layersRequest: function() {
        var content = this.params.content,
            items = content.items,
            request = [];

        for (var i = 0, l = items.length; i < l; ++i) {
            request.push({
                xAxisNo: items[i].xAxisNo,
                yAxisNo: items[i].yAxisNo,
                item: i
            });
        }

        return request;
    },

   _run: function(sched, layers, itemNo) {
        var _this = this,
            content = this.params.content,
            items = content.items;

        if (itemNo >= items.length) {
            return sched.next();
        } else if (items[itemNo]._rendered) {
            _this._run(sched, layers, itemNo + 1);
        } else {
            sched.next(function(sched) {
                _this.drawItem(sched, layers, itemNo);
            });
        }
    },

    draw: function(sched, layers) {
        this._run(sched, layers, 0);
    },

    drawItem: function(sched, layers, itemNo) {
        var dim = this.params.dimensions,
            content = this.params.content,
            layer = layers[itemNo],
            xAxis = content.xAxes[layer.xAxisNo] || Vis.error("No x-axis for layer #" + itemNo),
            yAxis = content.yAxes[layer.yAxisNo] || Vis.error("No y-axis for layer #" + itemNo),
            canvas = layers[itemNo].canvas,
            ctx = layers[itemNo].ctx;
        if (canvas) {
            ctx.clearRect(0, 0, dim.width, dim.height);
            canvas.css('left', '0');
            canvas.css('top', '0');
            canvas.css('width', '100%');
            canvas.css('height', dim.height + 'px');
        }
        layer.xAxisRange = {
            min: xAxis.scale.inputMin,
            max: xAxis.scale.inputMax
        };
        layer.yAxisRange = {
            min: yAxis.scale.inputMin,
            max: yAxis.scale.inputMax
        };
        this.render.drawItem(sched, layers, itemNo);

        this._run(sched, layers, itemNo + 1);
    }
};

})(jQuery, Vis);
