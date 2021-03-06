(function($, Vis) {
"use strict";

var busyDelay = 2500;

Vis.blocks['i-chart'] = {
    init: function(params) {
        var _this = this;

        _this.dimensions = {
            width: 0,
            height: 0
        };

        params = params || {};

        _this.title = params.title || "";

        var colorScheme = params.colorScheme || {};
        _this.colorScheme = Vis.create(
            colorScheme,
            colorScheme.name || 'i-tango-color-scheme'
        );

        _this.content = {
            tAxes: params.tAxes || [],
            xAxes: params.xAxes || [],
            yAxes: params.yAxes || [],
            items: params.items || [],
            overlays: params.overlays || [],
            layers: []
        };
        _this._initContent();

        // _this.applySize();
        // _this.initResize();
    },

    initTAxis: function(tAxisNo) { /* override me */ },
    _initTAxis: function(tAxisNo) {
        var _this = this,
            tAxis = _this.content.tAxes[tAxisNo];

        tAxis.rangeProvider = Vis.create(
            tAxis.rangeProvider,
            tAxis.rangeProvider.name || 'undefined-t-range-provider'
        );

        _this.initTAxis(tAxisNo);

        tAxis.rangeProvider.on('update', function() {
            _this._updateTAxisRange(tAxisNo);
        });
        _this._updateTAxisRange(tAxisNo);
    },

    updateTAxisRange: function(tAxisNo) { /* override me */ },
    _updateTAxisRange: function(tAxisNo) {
        var _this = this,
            tAxis = _this.content.tAxes[tAxisNo],
            range = tAxis.rangeProvider.get(),
            scale = tAxis.scale || {},
            items = _this.content.items;

        _this.updateTAxisRange(tAxisNo);

        if (range.min == scale.inputMin && range.max == scale.inputMax) {
            return;
        }

        tAxis.scale = {
            inputMin: range.min,
            inputMax: range.max
        };

        _this.updateTAxisRange(tAxisNo);
    },

    initTAxes: function() { /* override me */ },
    _initTAxes: function() {
        var _this = this,
            tAxes = _this.content.tAxes;

        for (var tAxisNo = 0, l = tAxes.length; tAxisNo < l; ++tAxisNo) {
            _this._initTAxis(tAxisNo);
        }

        _this.initTAxes();
    },

    _initItem: function(itemNo) {
        var _this = this,
            tAxes = _this.content.tAxes,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes,
            item = _this.content.items[itemNo];

        if (tAxes.length > 0) {
            item.tAxis = tAxes[item.tAxisNo || 0] || Vis.error("No t-axis for item #" + itemNo);
        }

        if (typeof item.xAxisNo === 'undefined') {
            item.xAxisNo = 0;
        }
        item.xAxis = xAxes[item.xAxisNo] || Vis.error("No x-axis for item #" + itemNo);

        if (typeof item.yAxisNo === 'undefined') {
            item.yAxisNo = 0;
        }
        item.yAxis = yAxes[item.yAxisNo] || Vis.error("No y-axis for item #" + itemNo);

        if (typeof item.color === 'undefined') {
            item.color = _this.colorScheme.get(itemNo);
        }

        if (typeof item.units === 'undefined') {
            item.units = "";
        }

        if (!item.filters) {
            item.filters = [];
        }
        for (var i = 0, l = item.filters.length; i < l; ++i) {
            item.filters[i] = Vis.create(
                item.filters[i],
                item.filters[i].name
            );
        }

        item.on = function(action, callback) {
            $(item).on(action + '.vis', callback);
        };
        item.trigger = function(action) {
            $(item).trigger(action + '.vis');
        };

        item.renderData = {};

        if (typeof item.dataProvider.timeRangeProvider === 'undefined' && item.tAxis) {
            item.dataProvider.timeRangeProvider = item.tAxis.rangeProvider;
        }
        item.dataProvider = Vis.create(
            item.dataProvider,
            item.dataProvider.name || 'undefined-item-data-provider'
        );
        if (typeof item.dataProvider.on !== 'undefined') {
            item.dataProvider.on('update', function(e) {
                // if it was initiated by timeRangeProvider, then we
                // shouldn't have updated 'ready' field while updating axis
                setTimeout(function() {
                    _this._updateItemData(itemNo);
                }, 0);
            });
        }
        _this._updateItemData(itemNo);
    },

    _updateItemData: function(itemNo) {
        var _this = this,
            item = _this.content.items[itemNo],
            filters = item.filters;

        item.rawData = item.dataProvider.get();

        var data = {};
        $.each(item.rawData, function(name, arr) {
            data[name] = arr.slice();
        });
        for (var i = 0, l = filters.length; i < l; ++i) {
            data = filters[i].run(item, data);
        }
        item.data = data;

        item.trigger('data');

        item.ready = item.dataProvider.ready;
        _this.renderItem(itemNo, true);
    },

    _initItems: function() {
        var _this = this,
            items = _this.content.items;

        for (var itemNo = 0, l = items.length; itemNo < l; ++itemNo) {
            _this._initItem(itemNo);
        }
    },

    _initXYAxis: function(xy, XY, pos, no) {
        var _this = this,
            tAxes = _this.content.tAxes,
            items = _this.content.items,
            axis = _this.content[xy + 'Axes'][no],
            i, l;

        var scale = axis.scale || {};
        axis.scale = Vis.create(
            scale,
            scale.name || 'i-scale-linear'
        );

        if (typeof axis.units === 'undefined') {
            axis.units = "";
        }

        var validPos = false;
        for (i = 0, l = pos.length; i < l; ++i) {
            if (axis.pos === pos[i]) {
                validPos = true;
                break;
            }
        }
        if (!validPos) {
            axis.pos = pos[0];
        }

        var axisItems = [];
        for (i = 0, l = items.length; i < l; ++i) {
            var item = items[i];
            if (item[xy + 'AxisNo'] != no) continue;

            axisItems.push(item);
        }
        axis.items = axisItems;

        if (tAxes.length > 0) {
            axis.tAxis = tAxes[axis.tAxisNo || 0] || Vis.error("No t-axis for " + xy + "-axis #" + no);
        }

        if (typeof axis.rangeProvider.timeRangeProvider === 'undefined' && axis.tAxis) {
            axis.rangeProvider.timeRangeProvider = axis.tAxis.rangeProvider;
        }

        if (typeof axis.rangeProvider.xy === 'undefined') {
            axis.rangeProvider.xy = xy;
        }

        if (typeof axis.rangeProvider.items === 'undefined') {
            axis.rangeProvider.items = axisItems;
        }

        axis.rangeProvider = Vis.create(
            axis.rangeProvider,
            axis.rangeProvider.name || 'undefined-y-range-provider'
        );

        if (typeof axis.processors === 'undefined') {
            axis.processors = [];
        }
        for (i = 0, l = axis.processors.length; i < l; ++i) {
            var processor = axis.processors[i];
            processor.dimensions = _this.dimensions;
            processor.content = _this.content;
            axis.processors[i] = Vis.create(processor, processor.name);
        }

        _this['init' + XY + 'Axis'](no);

        axis.rangeProvider.on('update', function() {
            _this['_update' + XY + 'AxisRange'](no);
        });
        _this['_update' + XY + 'AxisRange'](no);
    },

    _updateXYAxisRange: function(xy, XY, no) {
        var _this = this,
            axis = _this.content[xy + 'Axes'][no],
            range = axis.rangeProvider.get(),
            scale = axis.scale;

        if (range.min == scale.inputMin && range.max == scale.inputMax) {
            return;
        }

        scale.input(range.min, range.max);

        _this['update' + XY + 'AxisRange'](no);

        _this['_render' + XY + 'Axis'](no);
    },

    _renderXYAxis: function(xy, XY, no, n, a, b) {
        var _this = this,
            axis = this.content[xy + 'Axes'][no];

        axis.ticks = axis.scale.ticks(n, axis.units);

        var ticks = Units.formatTicks(axis.ticks, axis.units, axis.scale);
        for (var i = 0, l = ticks.length; i < l; ++i) {
            var tick = ticks[i];
            tick.offset = b + a*Math.round(axis.scale.f(tick.tickValue));
        }

        _this['render' + XY + 'Axis'](no, ticks);
    },

    initXAxis: function(xAxisNo) { /* override me */ },
    _initXAxis: function(xAxisNo) {
        this._initXYAxis('x', 'X', ['bottom', 'top'], xAxisNo);
    },

    updateXAxisRange: function(xAxisNo) { /* override me */ },
    _updateXAxisRange: function(xAxisNo) {
        this._updateXYAxisRange('x', 'X', xAxisNo);
    },

    renderXAxis: function(xAxisNo, ticks) { /* override me */ },
    _renderXAxis: function(xAxisNo) {
        this._renderXYAxis('x', 'X', xAxisNo, Math.floor(this.dimensions.width / 65), 1, 0);
    },

    initXAxes: function() { /* override me */ },
    _initXAxes: function() {
        var _this = this,
            xAxes = _this.content.xAxes;

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            _this._initXAxis(xAxisNo);
        }

        _this.initXAxes();
    },

    initYAxis: function(yAxisNo) { /* override me */ },
    _initYAxis: function(yAxisNo) {
        this._initXYAxis('y', 'Y', ['right', 'left'], yAxisNo);
    },

    updateYAxisRange: function(yAxisNo) { /* override me */ },
    _updateYAxisRange: function(yAxisNo) {
        this._updateXYAxisRange('y', 'Y', yAxisNo);
    },

    renderYAxis: function(yAxisNo, ticks) { /* override me */ },
    _renderYAxis: function(yAxisNo) {
        this._renderXYAxis('y', 'Y', yAxisNo, Math.floor(this.dimensions.height / 40), -1, this.dimensions.height - 1);
    },

    initYAxes: function() { /* override me */ },
    _initYAxes: function() {
        var _this = this,
            yAxes = _this.content.yAxes;

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            _this._initYAxis(yAxisNo);
        }

        _this.initYAxes();
    },

    initOverlay: function(overlayNo) { /* override me */ },
    _initOverlay: function(overlayNo) {
        var _this = this,
            overlays = _this.content.overlays,
            overlay = overlays[overlayNo];

        overlay.dimensions = _this.dimensions;
        overlay.content = _this.content;
        overlays[overlayNo] = Vis.create(
            overlay,
            overlay.name || 'undefined-overlay'
        );

        _this.initOverlay(overlayNo);
    },

    _initOverlays: function() {
        var _this = this,
            overlays = _this.content.overlays;

        for (var i = 0, l = overlays.length; i < l; ++i) {
            _this._initOverlay(i);
        }
    },

    initContent: function () { /* override me */ },
    _initContent: function () {
        this._initTAxes();
        this._initItems();
        this._initXAxes();
        this._initYAxes();
        this._initOverlays();

        this.initContent();
    },

    applySize: function () { /* override me */ },
    _applySize: function() {
        var _this = this,
            dim = _this.dimensions,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes,
            i, l;

        for (i = 0, l = xAxes.length; i < l; ++i) {
            xAxes[i].scale.output(0, dim.width - 1);
        }

        for (i = 0, l = yAxes.length; i < l; ++i) {
            yAxes[i].scale.output(0, dim.height - 1);
        }

        _this.applySize();
    },

    _runProcessors: function() {
        var _this = this,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes,
            items = _this.content.items;

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            var xAxis = xAxes[xAxisNo];

            for (var i = 0; i < xAxis.items.length; ++i) {
                xAxis.items[i].renderData = xAxis.items[i].data;
            }

            for (var j = 0, m = xAxis.processors.length; j < m; ++j) {
                xAxis.processors[j].run(xAxis.items);
            }
        }

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo];

            for (var j = 0, m = yAxis.processors.length; j < m; ++j) {
                yAxis.processors[j].run(yAxis.items);
            }

            for (var k = 0; k < yAxis.items.length; ++k) {
                yAxis.items[k].trigger('renderData');
            }
        }
    },

    _beforeRender: function() {
        this._runProcessors();
    },

    _afterRender: function() {
    }
};

})(jQuery, Vis);
