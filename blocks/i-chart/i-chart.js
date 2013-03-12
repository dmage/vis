(function(Vis) {
"use strict";

var busyDelay = 2500;

Vis.blocks['i-chart'] = {
    init: function(params) {
        params = params || {};
        params.settingsProvider = params.settingsProvider || {};

        var _this = this;

        _this._initState = {
            title: false,
            xAxes: false,
            yAxes: false,
            items: false,
            overlays: false
        };
        _this._init = 0;

        _this.dimensions = {
            width: 0,
            height: 0
        };

        _this.content = {
            xAxes: [],
            yAxes: [],
            items: [],
            overlays: [],
            layers: []
        };
        _this.initContent();

        _this.colorScheme = Vis.create(
            params.colorScheme || {},
            (params.colorScheme && params.colorScheme.name) || 'i-tango-color-scheme'
        );

        _this.applySize();
        _this.initResize();

        var initCallbacks = {
            title: function(title) {
                _this.setTitle(title);
            },
            xAxes: function(xAxes) {
                _this.setXAxes(xAxes);
            },
            yAxes: function(yAxes) {
                _this.setYAxes(yAxes);
            },
            items: function(items) {
                _this.setItems(items);
            },
            overlays: function(overlays) {
                _this.setOverlays(overlays);
            },
            ping: function() {
                _this.ping();
            }
        };

        var settingsProvider = Vis.create(
            params.settingsProvider,
            params.settingsProvider.name || 'undefined-settings-provider'
        );

        this.ping();
        settingsProvider.get(initCallbacks);
    },

    _updateInit: function() {
        if (this._init === -1)
            return;

        var initState = this._initState;
        if (this._init === 0 && initState.title)
            this._init = 1;
        if (this._init === 1 && initState.xAxes)
            this._init = 2;
        if (this._init === 2 && initState.yAxes)
            this._init = 3;
        if (this._init === 3 && initState.items)
            this._init = 4;
        if (this._init === 4 && initState.overlays)
            this._init = -1; // -1 = finished.

        if (this._init === -1) {
            this.ping(false); // send last ping and disable busy timer
            this.applySize(true);
        }
    },

    busy: function() {
        this._busy = true;

        // override me
    },

    stopBusy: function() {
        // override me

        this._busy = false;
    },

    ping: function(keep) {
        var _this = this;

        clearTimeout(_this.busyTimeout);
        delete _this.busyTimeout;

        if (_this._busy) {
            _this.stopBusy();
        }

        if (typeof keep === 'undefined' || keep) {
            _this.busyTimeout = setTimeout(function() {
                _this.busy();
            }, busyDelay);
        }
    },

    initContent: function () {
        // override me
    },

    initResize: function() {
        // override me
    },

    _initLayers: function() {
        // override me
    },

    setOverlays: function(overlays) {
        var _this = this;

        _this.content.overlays = overlays;

        for (var i = 0, l = _this.content.overlays.length; i < l; ++i) {
            var overlay = _this.content.overlays[i];
            overlay.dimensions = _this.dimensions;
            overlay.content = _this.content;
            _this.content.overlays[i] = Vis(
                overlay,
                overlay.name
            );
        }

        if (this._initState.items) {
            this._initLayers();
        }

        this._initState.overlays = true;
        this._updateInit();
    },

    setTitle: function(title) {
        // override me

        this._initState.title = true;
        this._updateInit();
    },

    _initYAxis: function(yAxisNo) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

        // override me

        yAxis.scale = Vis({}, 'b-scale__linear');

        yAxis.rangeProvider = Vis(
            yAxis.rangeProvider,
            yAxis.rangeProvider.name
        );

        typeof yAxis.processors !== 'undefined' || (yAxis.processors = []);
        for (var i = 0, l = yAxis.processors.length; i < l; ++i) {
            var processor = yAxis.processors[i];
            processor.dimensions = _this.dimensions;
            processor.content = _this.content;
            yAxis.processors[i] = Vis(processor, processor.name);
        }
    },

    _initYAxes: function() {
        // override me
    },

    _destroyYAxes: function() {
        var _this = this;

        // override me

        delete _this.content.yAxes;
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

    _initXAxis: function(xAxisNo) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        // override me

        xAxis.scale = Vis({}, 'b-scale__linear');

        xAxis.rangeProvider = Vis(
            xAxis.rangeProvider,
            xAxis.rangeProvider.name
        );

        typeof xAxis.units !== 'undefined' || (xAxis.units = "");

        _this._updateXAxisRange(xAxisNo);

        // override me
    },

    _initXAxes: function() {
        // override me
    },

    _destroyXAxes: function() {
        var _this = this;

        // override me

        delete _this.content.xAxes;
    },

    _updateXAxisRange: function(xAxisNo) {
        var _this = this,
            xAxis = _this.content.xAxes[xAxisNo],
            scale = xAxis.scale,
            items = _this.content.items,
            layers = _this.content.layers,
            range = xAxis.rangeProvider.get();

        // override me

        xAxis.scale.input(range.min, range.max);

        _this._renderXAxis(xAxisNo);

        // override me
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

    _renderXAxis: function(xAxisNo) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        xAxis.ticks = xAxis.scale.ticks(Math.floor(_this.dimensions.width / 60), xAxis.units);

        var ticks = Units.formatTicks(xAxis.ticks, xAxis.units, xAxis.scale);
        for (var i = 0, l = ticks.length; i < l; ++i) {
            var tick = ticks[i];
            tick.offset = Math.round(xAxis.scale.f(tick.tickValue));
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
