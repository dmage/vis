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
                xAxis: items[i].xAxis,
                yAxis: items[i].yAxis,
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
        this.render.drawItem(sched, layers, itemNo);
        this._run(sched, layers, itemNo + 1);
    }
};

})(jQuery, Vis);
