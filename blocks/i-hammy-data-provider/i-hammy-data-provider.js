(function($, Vis) {

Vis.blocks['i-hammy-data-provider'] = {
    init: function(params) {
        var _this = this,
            timeRangeProvider = _this.timeRangeProvider = params.timeRangeProvider;

        _this.url = params.url;
        _this.host = params.host;
        _this.key = params.key;

        timeRangeProvider.on('update.vis', function() {
            _this.range = timeRangeProvider.get();
            _this.fetchData();
        });
        _this.range = timeRangeProvider.get();
        _this.fetchData();
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    fetchData: function() {
        var _this = this,
            tBegin = _this.range.min,
            tEnd = _this.range.max;
        $.ajax(_this.url, {
            data: {
                host: _this.host,
                key: _this.key,
                from: tBegin,
                to: tEnd
            },
            dataType: "json",
            success: function(data) {
                _this.xData = data.X,
                _this.yData = data.Y;
                $(_this).trigger('update.vis');
            }
        });
    },

    get: function() {
        var tBegin = this.range.min,
            tEnd = this.range.max,
            xData = this.xData || [],
            yData = this.yData || [];

        var x = [],
            y = [];
        for (var i = 0; i < xData.length; ++i) {
            if (tBegin <= xData[i] && xData[i] <= tEnd) {
                x.push(xData[i]);
                y.push(yData[i]);
            }
        }
        return { x: x, y: y };
    }
};

})(jQuery, Vis);
