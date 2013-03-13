(function(Vis) {
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
        _this.content = {
            tAxes: params.tAxes || [],
            xAxes: params.xAxes || [],
            yAxes: params.yAxes || [],
            items: params.items || [],
            overlays: params.overlays || [],
            layers: []
        };
        _this._initContent();

        var colorScheme = params.colorScheme || {};
        _this.colorScheme = Vis.create(
            colorScheme,
            colorScheme.name || 'i-tango-color-scheme'
        );

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

    initXAxis: function(xAxisNo) { /* override me */ },
    _initXAxis: function(xAxisNo) {
        var _this = this,
            xAxis = _this.content.xAxes[xAxisNo],
            tAxes = _this.content.tAxes;

        var scale = xAxis.scale || {};
        xAxis.scale = Vis.create(
            scale,
            scale.name || 'i-scale-linear'
        );
        xAxis.scale.output(0, 600);  // FIXME

        if (typeof xAxis.units === 'undefined') {
            xAxis.units = "";
        }

        if (xAxis.pos !== 'top' && xAxis.pos !== 'bottom') {
            xAxis.pos = 'bottom';
        }

        xAxis.tAxis = tAxes[xAxis.tAxisNo || 0] || Vis.error("No t-axis for x-axis #" + xAxisNo);

        if (typeof xAxis.rangeProvider.tAxis === 'undefined') {
            xAxis.rangeProvider.timeRangeProvider = xAxis.tAxis.rangeProvider;
        }
        xAxis.rangeProvider = Vis.create(
            xAxis.rangeProvider,
            xAxis.rangeProvider.name || 'undefined-x-range-provider'
        );

        if (typeof xAxis.processors === 'undefined') {
            xAxis.processors = [];
        }
        for (var i = 0, l = xAxis.processors.length; i < l; ++i) {
            var processor = xAxis.processors[i];
            processor.dimensions = _this.dimensions;
            processor.content = _this.content;
            xAxis.processors[i] = Vis.create(processor, processor.name);
        }

        _this.initXAxis(xAxisNo);

        xAxis.rangeProvider.on('update', function() {
            _this._updateXAxisRange(xAxisNo);
        });
        _this._updateXAxisRange(xAxisNo);
    },

    _updateXAxisRange: function(xAxisNo) {
        var _this = this,
            xAxis = _this.content.xAxes[xAxisNo],
            xRange = xAxis.rangeProvider.get();

        xAxis.scale.input(xRange.min, xRange.max);
    },

    renderXAxis: function(xAxisNo, ticks) { /* override me */ },
    _renderXAxis: function(xAxisNo) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        _this.dimensions.width = 600;
        xAxis.ticks = xAxis.scale.ticks(Math.floor(_this.dimensions.width / 65), xAxis.units);

        var ticks = Units.formatTicks(xAxis.ticks, xAxis.units, xAxis.scale);
        for (var i = 0, l = ticks.length; i < l; ++i) {
            var tick = ticks[i];
            tick.offset = Math.round(xAxis.scale.f(tick.tickValue));
        }

        this.renderXAxis(xAxisNo, ticks);
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
        var _this = this,
            yAxis = _this.content.yAxes[yAxisNo];

        var scale = yAxis.scale || {};
        yAxis.scale = Vis.create(
            scale,
            scale.name || 'i-scale-linear'
        );

        if (typeof yAxis.units === 'undefined') {
            yAxis.units = "";
        }

        if (yAxis.pos !== 'left' && yAxis.pos !== 'right') {
            yAxis.pos = 'right';
        }

        yAxis.rangeProvider = Vis.create(
            yAxis.rangeProvider,
            yAxis.rangeProvider.name || 'undefined-y-range-provider'
        );

        if (typeof yAxis.processors === 'undefined') {
            yAxis.processors = [];
        }
        for (var i = 0, l = yAxis.processors.length; i < l; ++i) {
            var processor = yAxis.processors[i];
            processor.dimensions = _this.dimensions;
            processor.content = _this.content;
            yAxis.processors[i] = Vis.create(processor, processor.name);
        }

        _this.initXAxis(yAxisNo);
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

    _initOverlays: function() {
        var _this = this,
            overlays = _this.content.overlays;

        for (var i = 0, l = overlays.length; i < l; ++i) {
            var overlay = overlays[i];
            overlay.dimensions = _this.dimensions;
            overlay.content = _this.content;
            overlays[i] = Vis.create(
                overlay,
                overlay.name || 'undefined-overlay'
            );
        }
    },

    initLayers: function() { /* override me */ },

    initContent: function () { /* override me */ },
    _initContent: function () {
        this._initTAxes();
        this._initXAxes();
        this._initYAxes();
        this._initOverlays();
        this.initLayers();

        this.initContent();
    },

    initResize: function() {
        // override me
    },

    _updateYAxisRange: function(yAxisNo, range) {
        var _this = this,
            yAxis = _this.content.yAxes[yAxisNo],
            scale = yAxis.scale;

        if (range.min == scale.inputMin && range.max == scale.inputMax) {
            return;
        }

        scale.input(range.min, range.max);

        _this._renderYAxis(yAxisNo);
    },

    setYAxes: function(yAxes) {
        var _this = this;

        _this._destroyYAxes();
        _this.content.yAxes = yAxes;

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            _this._initYAxis(yAxisNo);
        }
        _this._initYAxes();

        _this._initState.yAxes = true;
        _this._updateInit();
    },

    setXAxes: function(xAxes) {
        var _this = this;

        _this._destroyXAxes();
        _this.content.xAxes = xAxes;

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            _this._initXAxis(xAxisNo);
        }
        _this._initXAxes();

        _this._initState.xAxes = true;
        _this._updateInit();
    },

    _initItem: function(itemNo) {
        var _this = this,
            item = _this.content.items[itemNo];

        item.dataProvider = Vis(
            item.dataProvider,
            item.dataProvider.name
        );
        item.dataProvider.on('update', function(e) {
            _this._updateItem(itemNo);
        });

        item.filters || (item.filters = []);
        for (var i = 0, l = item.filters.length; i < l; ++i) {
            item.filters[i] = Vis(
                item.filters[i],
                item.filters[i].name
            );
        }

        typeof item.color !== 'undefined' || (item.color = _this.colorScheme.get(itemNo));
        typeof item.units !== 'undefined' || (item.units = "");

        item.renderData = {};

        if (_this.content.xAxes) {
            _this._updateItemData(item);
            _this._requestItemData(item);
        }
    },

    _updateItem: function(itemNo) {
        var _this = this,
            item = _this.content.items[itemNo];

        _this._updateItemData(item);
        item.ready = true;
        _this.renderItem(itemNo);
    },

    _updateItemData: function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0],
            filters = item.filters;

        item.rawData = item.dataProvider.get(xAxis.scale.inputMin, xAxis.scale.inputMax);

        var data = {};
        $.each(item.rawData, function(name, arr) {
            data[name] = arr.slice();
        });
        for (var i = 0, l = filters.length; i < l; ++i) {
            data = filters[i].run(item, data);
        }
        item.data = data;

        // override me
    },

    _requestItemData: function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0];

        item.ready = false;
        item.dataProvider.range(xAxis.scale.inputMin, xAxis.scale.inputMax);
    },

    setItems: function(items) {
        var _this = this;

        _this.content.items = items;
        for (var i = 0, l = _this.content.items.length; i < l; ++i) {
            _this._initItem(i);
        }

        if (this._initState.layers) {
            this._initLayers();
        }

        _this._initState.items = true;
        _this._updateInit();
    },

    _renderYAxis: function(yAxisNo) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

        yAxis.ticks = yAxis.scale.ticks(Math.floor(_this.dimensions.height / 40), yAxis.units);

        var ticks = Units.formatTicks(yAxis.ticks, "", yAxis.scale);
        for (var i = 0, l = ticks.length; i < l; ++i) {
            var tick = ticks[i];
            tick.offset = _this.dimensions.height - Math.round(yAxis.scale.f(tick.tickValue)) - 1;
        }
        return ticks;
        // override me
    },

    applySize: function(force) {
        // override me
    },

    _runProcessors: function() {
        var _this = this,
            yAxes = _this.content.yAxes,
            items = _this.content.items;

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo];

            var axisItems = [];
            for (var i = 0, m = items.length; i < m; ++i) {
                var item = items[i];
                if (item.yAxis != yAxisNo) continue;

                item.renderData = item.data;
                axisItems.push(item);
            }

            for (var i = 0, m = yAxis.processors.length; i < m; ++i) {
                yAxis.processors[i].run(axisItems);
            }

            var range = yAxis.rangeProvider.get(axisItems);
            _this._updateYAxisRange(yAxisNo, range);
        }
    },

    beforeRender: function() {
        this._runProcessors();

        // override me
    },

    afterRender: function() {
        // override me
    },

    render: function() {
        if (this._init != -1) {
            return;
        }

        // override me
    },

    renderItem: function(itemNo) {
        if (this._init != -1) {
            return;
        }

        this.render();
    }
};

})(Vis);
