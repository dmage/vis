(function($, Vis) {

Vis.blocks['b-chart'] = Vis.extend(Vis.blocks['i-chart'], {
    init: function(params) {
        var _this = this;
        params = params || {};

        this.uniqId = Vis.uniqId();
        this.delay = 200;
        this.longDelay = 2000;
        this.debug = 0;

        this.$object = params.$object;
        this.skipRender = 0;

        this.__base.init.apply(this, arguments);

        this.renderObjects();
        this.initOverlays();
        this.initLayers();
        this.updateDimensions();

        $(window).bind('resize', function() {
            TaskScheduler.run(TaskScheduler.PRIO_SYSTEM, [function(sched) {
                var b = _this.debug && Vis.benchmark();
                _this.updateDimensions();
                Vis.benchmark(b, 'resize');
                sched.next();
            }], {
                id: _this.uniqId + ".resize"
            });
        });
    },

    renderXAxis: function(xAxisNo, ticks) {
        var _this = this,
            content = _this.content,
            xAxes = content.xAxes,
            items = content.items,
            layers = content.layers,
            xAxis = xAxes[xAxisNo],
            i, l;

        if (xAxis.visObject) {
            xAxis.visObject.update(xAxis.pos, ticks);
        }

        var scaleMin = xAxis.scale.inputMin,
            scaleMax = xAxis.scale.inputMax;
        for (i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            if (layer.xAxisNo != xAxisNo || !layer.xAxisRange) {
                continue;
            }

            var layerMin = layer.xAxisRange.min,
                layerMax = layer.xAxisRange.max;
            var width = 100*(layerMax - layerMin)/(scaleMax - scaleMin),
                left = 100*(layerMin - scaleMin)/(scaleMax - scaleMin);
            layer.canvas.css('width', width + '%');
            layer.canvas.css('left', left + '%');
        }

        if (_this.skipRender) {
            return;
        }
        for (i = 0, l = items.length; i < l; ++i) {
            if (items[i].xAxisNo == xAxisNo) {
                _this.renderItem(i, false);
            }
        }
    },

    renderYAxis: function(yAxisNo, ticks) {
        var _this = this,
            content = _this.content,
            yAxes = content.yAxes,
            items = content.items,
            layers = content.layers,
            yAxis = yAxes[yAxisNo],
            i, l;

        if (yAxis.visObject) {
            yAxis.visObject.update(yAxis.pos, ticks);
        }

        var scaleMin = yAxis.scale.inputMin,
            scaleMax = yAxis.scale.inputMax;
        for (i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            if (layer.yAxisNo != yAxisNo || !layer.yAxisRange) {
                continue;
            }

            var layerMin = layer.yAxisRange.min,
                layerMax = layer.yAxisRange.max;
            var height = _this.dimensions.height*(layerMax - layerMin)/(scaleMax - scaleMin),
                top = 100*(layerMin - scaleMin)/(scaleMax - scaleMin);
            layer.canvas.css('height', height + 'px');
            layer.canvas.css('top', top + '%');
        }

        if (_this.skipRender) {
            return;
        }
        for (i = 0, l = items.length; i < l; ++i) {
            if (items[i].yAxisNo == yAxisNo) {
                _this.renderItem(i, false);
            }
        }
    },

    initOverlays: function() {
        var _this = this,
            overlays = _this.content.overlays;

        for (var i = 0, l = overlays.length; i < l; ++i) {
            if (typeof overlays[i].bind !== 'undefined') {
                overlays[i].bind();
            }
        }
    },

    initLayersForOverlay: function(overlayNo) {
        var _this = this,
            overlays = _this.content.overlays,
            layers = _this.content.layers,
            overlay = overlays[overlayNo];
            request = overlay.layersRequest();

        var localLayers = [];
        for (var i = 0, l = request.length; i < l; ++i) {
            var layer = request[i];

            var $canvas = $(Vis.render({
                tag: 'canvas',
                cls: 'b-chart__canvas'
            }));
            _this.content.$clippedViewport.append($canvas);

            layer.canvas = $canvas;
            layer.ctx = layer.canvas.get(0).getContext('2d');

            localLayers.push(layer);
            layers.push(layer);
        }

        _this.renderTasks.push(function(sched) {
            var b = _this.debug && Vis.benchmark();
            var wrappedSched = {
                next: function(f) {
                    if (f) {
                        _this.debug && Vis.subbenchmark(b);
                        sched.next(function() {
                            var args = Array.prototype.slice.call(arguments, 1);
                            args.unshift(wrappedSched);
                            f.apply(this, args);
                        });
                    } else {
                        _this.debug && Vis.benchmark(b, 'renderTasks (overlay #' + overlayNo + ')');
                        sched.next();
                    }
                }
            };
            overlay.draw(wrappedSched, localLayers);
        });
    },

    initLayers: function() {
        var _this = this,
            overlays = _this.content.overlays;

        _this.renderTasks = [];
        _this.renderTasks.push(function(sched) {
            var b = _this.debug && Vis.benchmark();
            _this._beforeRender();
            _this.debug && Vis.benchmark(b, '_beforeRender');
            sched.next();
        });
        for (var i = 0, l = overlays.length; i < l; ++i) {
            _this.initLayersForOverlay(i);
        }
        _this.renderTasks.push(function(sched) {
            var b = _this.debug && Vis.benchmark();
            _this._afterRender();
            _this.debug && Vis.benchmark(b, '_afterRender');
            sched.next();
        });
    },

    renderXAxes: function(pos, layout, method) {
        var _this = this,
            content = _this.content,
            xAxes = content.xAxes;

        layout.empty();
        for (var i = 0, l = xAxes.length; i < l; ++i) {
            var xAxis = xAxes[i];
            if (xAxis.pos !== pos) {
                continue;
            }

            var c = Vis.render({
                tag: 'tr',
                content: {
                    tag: 'td',
                    cls: 'b-layout__cell',
                    content: {
                        attrs: { style: 'height: 30px' },
                        cls: 'b-axis'
                    }
                }
            });
            var $c = $(c);
            layout[method]($c);

            xAxis.$object = $('.b-axis', $c);
            xAxis.visObject = Vis.create(xAxis.$object, 'b-axis');
        }
    },

    renderYAxes: function(pos, layout, method) {
        var _this = this,
            content = _this.content,
            yAxes = content.yAxes;

        var $tr = $('<tr>');
        for (var i = 0, l = yAxes.length; i < l; ++i) {
            var yAxis = yAxes[i];
            if (yAxis.pos !== pos) {
                continue;
            }

            var c = Vis.render({
                tag: 'td',
                cls: 'b-layout__cell',
                content: {
                    attrs: { style: 'width: 60px; height: 200px' },
                    cls: 'b-axis'
                }
            });
            var $c = $(c);
            $tr[method]($c);

            yAxis.$object = $('.b-axis', $c);
            yAxis.visObject = Vis(yAxis.$object, 'b-axis');
        }
        layout.empty().append($tr);
    },

    readyMask : function() {
        var _this = this,
            items = _this.content.items,
            mask = new Array(items.length);
        for (var i = 0, l = items.length; i < l; ++i) {
            mask[i] = (items[i].ready === items[i].dataProvider.ready);
        }
        return mask;
    },

    render: function() {
        if (!this.renderTasks) {
            return;
        }

        TaskScheduler.run(TaskScheduler.PRIO_DATA, this.renderTasks, {
            id: this.uniqId + ".draw",
            delay: this.delay,
            mask: this.readyMask()
        });
    },

    renderItem: function(itemNo, newData) {
        if (!this.renderTasks) {
            return;
        }

        TaskScheduler.update(TaskScheduler.PRIO_DATA, this.renderTasks, {
            id: this.uniqId + ".draw",
            delay: newData ? this.delay : this.longDelay,
            mask: this.readyMask()
        }, itemNo);
    },

    renderObjects: function() {
        var $object = this.$object;

        $object.html(Vis.render([
            {
                cls: 'b-chart__header',
                content: this.title
            },
            {
                tag: 'table',
                cls: 'b-9',
                content: [
                    {
                        tag: 'tr',
                        content: [
                            { tag: 'td', cls: 'b-9__tl', content: '' },
                            {
                                tag: 'td',
                                cls: 'b-9__tc',
                                content: { tag: 'table', cls: 'b-layout' }
                            },
                            { tag: 'td', cls: 'b-9__tr', content: '' }
                        ]
                    },
                    {
                        tag: 'tr',
                        content: [
                            {
                                tag: 'td',
                                cls: 'b-9__ml',
                                content: { tag: 'table', cls: 'b-layout' }
                            },
                            {
                                tag: 'td',
                                cls: 'b-9__mc',
                                content: {
                                    content: {
                                        cls: 'b-chart__viewport',
                                        content: {
                                            cls: 'b-chart__clipped-viewport'
                                        }
                                    }
                                }
                            },
                            {
                                tag: 'td',
                                cls: 'b-9__mr',
                                content: { tag: 'table', cls: 'b-layout' }
                            }
                        ]
                    },
                    {
                        tag: 'tr',
                        content: [
                            { tag: 'td', cls: 'b-9__bl', content: '' },
                            {
                                tag: 'td',
                                cls: 'b-9__bc',
                                content: { tag: 'table', cls: 'b-layout' }
                            },
                            { tag: 'td', cls: 'b-9__br', content: '' }
                        ]
                    }
                ]
            }
        ]));

        this.renderYAxes('left', $('.b-9__ml .b-layout', $object), 'prepend');
        this.renderYAxes('right', $('.b-9__mr .b-layout', $object), 'append');
        this.renderXAxes('top', $('.b-9__tc .b-layout', $object), 'prepend');
        this.renderXAxes('bottom', $('.b-9__bc .b-layout', $object), 'append');

        this.content.$viewport = $('.b-chart__viewport', $object);
        this.content.$clippedViewport = $('.b-chart__clipped-viewport', $object);
    },

    updateDimensions: function() {
        var _this = this,
            dim = _this.dimensions;

        dim.height = 200;
        dim.width = this.content.$viewport.width();

        this._applySize();

        var xAxes = this.content.xAxes,
            yAxes = this.content.yAxes,
            i, l;

        this.skipRender = 1;
        for (i = 0, l = xAxes.length; i < l; ++i) {
            this._renderXAxis(i);
        }
        for (i = 0, l = yAxes.length; i < l; ++i) {
            this._renderYAxis(i);
        }
        this.skipRender = 0;
        this.render();
    },

    applySize: function() {
        var _this = this,
            dim = _this.dimensions,
            layers = _this.content.layers;

        this.content.$viewport.css('height', dim.height + 'px');
        for (var i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            // FIXME: change canvas size only when we ready to render new data
            layer.canvas.attr('width', dim.width);
            layer.canvas.attr('height', dim.height);
            layer.canvas.css('height', dim.height + 'px');
        }
    }
});

})(jQuery, Vis);
