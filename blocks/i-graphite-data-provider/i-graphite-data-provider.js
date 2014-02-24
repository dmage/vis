(function($, Vis) {

Vis.blocks['i-graphite-data-provider'] = {
    init: function(params) {
        var _this = this,
            timeRangeProvider = _this.timeRangeProvider = params.timeRangeProvider;

        _this.url = params.url;
        _this.target = params.target;
        _this.ready = 0;

        timeRangeProvider.on('update.vis', function() {
            _this.range = timeRangeProvider.get();
            _this.ready += 1;
            _this.fetchData();
        });
        setTimeout(function() {
            _this.ready += 1;
            _this.fetchData();
        }, 0);
        _this.range = timeRangeProvider.get();
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    fetchData: function() {
        var _this = this,
            tBegin = _this.range.min,
            tEnd = _this.range.max;

function formatTime(timestamp) {
    var date = new Date(timestamp * 1000);
    var d = date.getDate();
    var n = date.getMonth() + 1;
    var y = date.getFullYear();
    var h = date.getHours();
    var m = date.getMinutes();
    return '' + (h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + '_' +
        y + (n <= 9 ? '0' + n : n) + (d <= 9 ? '0' + d : d);
}

        $.ajax(_this.url, {
            data: {
                target: _this.target,
                from: formatTime(tBegin),
                until: formatTime(tEnd),
                format: "json"
            },
            dataType: "json",
            success: function(data) {
                if (data.length == 0) { return; }
                var datapoints = data[0].datapoints;
                _this.xData = [],
                _this.yData = [];
                for (var i = 0; i < datapoints.length; ++i) {
                    _this.xData[i] = datapoints[i][1];
                    _this.yData[i] = datapoints[i][0];
                }
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
