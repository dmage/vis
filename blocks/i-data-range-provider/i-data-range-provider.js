(function(Vis) {

Vis.blocks['i-data-range-provider'] = {
    init: function(params) {
        var _this = this;
        this.params = params;
        this.items = params.items;

        console.log(this);
        for (var i = 0, l = this.items.length; i < l; ++i) {
            this.items[i].on('renderData', function() {
                _this.calculate();
            });
        }
        this.calculate();
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    calculate: function() {
        var minSliceName = this.params.minSliceName,
            maxSliceName = this.params.maxSliceName,
            shiftSliceName = this.params.shiftSliceName,
            min = Number.POSITIVE_INFINITY,
            max = Number.NEGATIVE_INFINITY;

        typeof minSliceName !== 'undefined' || (minSliceName = "y");
        typeof maxSliceName !== 'undefined' || (maxSliceName = "y");
        typeof shiftSliceName !== 'undefined' || (shiftSliceName = "shift");

        for (var i = 0, l = this.items.length; i < l; ++i) {
            var item = this.items[i],
                minData = item.renderData[minSliceName] || [],
                maxData = item.renderData[maxSliceName] || [],
                shiftData = item.renderData[shiftSliceName] || [];

            var m = Math.max(minData.length, maxData.length);
            for (var j = 0; j < m; ++j) {
                var s = shiftData[j] || 0,
                    ymin = minData[j],
                    ymax = maxData[j];

                typeof ymin !== 'undefined' || (ymin = 0);
                typeof ymax !== 'undefined' || (ymax = 0);

                if (ymin !== null && min > ymin + s) {
                    min = ymin + s;
                }
                if (ymax !== null && max < ymax + s) {
                    max = ymax + s;
                }
            }
        }

        if (min == Number.POSITIVE_INFINITY) {
            min = 0;
        }
        if (min > max) {
            max = min + 1;
        }

        this.range = {
            min: min,
            max: max
        };

        $(this).trigger('update.vis');
    },

    get: function() {
        return this.range;
    }
};

})(Vis);
