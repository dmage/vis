(function(Vis) {

Vis.blocks['b-chart'] = Vis.extend(Vis.blocks['i-chart'], {
    init: function(params) {
        params = params || {};

        this.$object = params.$object;

        this.__base.init.apply(this, arguments);

        this.renderObjects();
        this.initLayers();
        this.updateDimensions();

        var xAxes = this.content.xAxes,
            yAxes = this.content.yAxes,
            i, l;
        for (i = 0, l = xAxes.length; i < l; ++i) {
            this._renderXAxis(i);
        }
        for (i = 0, l = yAxes.length; i < l; ++i) {
            this._renderYAxis(i);
        }
        // this._renderLayers();

        this.render();
    },

    updateXAxisRange: function(xAxisNo) {
        var _this = this,
            xAxes = _this.content.xAxes,
            xAxis = xAxes[xAxisNo];

        /* adjust canvas position */
    },

    renderXAxis: function(xAxisNo, ticks) {
        var _this = this,
            content = _this.content,
            xAxes = content.xAxes,
            xAxis = xAxes[xAxisNo];

        if (xAxis.visObject) {
            xAxis.visObject.update(xAxis.pos, ticks);
        }
    },

    renderYAxis: function(yAxisNo, ticks) {
        var _this = this,
            content = _this.content,
            yAxes = content.yAxes,
            yAxis = yAxes[yAxisNo];

        if (yAxis.visObject) {
            yAxis.visObject.update(yAxis.pos, ticks);
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
            _this.$clippedViewport.append($canvas);

            layer.canvas = $canvas;
            layer.ctx = layer.canvas.get(0).getContext('2d');

            localLayers.push(layer);
            layers.push(layer);
        }

        _this.renderTasks.push(function(sched) {
            overlay.draw(sched, localLayers);
        });
    },

    initLayers: function() {
        var _this = this,
            overlays = _this.content.overlays;

        _this.renderTasks = [];
        for (var i = 0, l = overlays.length; i < l; ++i) {
            _this.initLayersForOverlay(i);
        }
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

    render: function() {
        if (!this.renderTasks) {
            return;
        }

        TaskScheduler.run(TaskScheduler.PRIO_DATA, this.renderTasks);
    },

    renderObjects: function() {
        var $object = this.$object;

        $object.html(Vis.render([
            {
                cls: 'b-chart__header',
                content: 'Header'
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

        this.$viewport = $('.b-chart__viewport', $object);
        this.$clippedViewport = $('.b-chart__clipped-viewport', $object);
    },

    updateDimensions: function() {
        var _this = this,
            dim = _this.dimensions;

        dim.height = 200;
        dim.width = this.$viewport.width();

        this._applySize();
    },

    applySize: function() {
        var _this = this,
            dim = _this.dimensions,
            layers = _this.content.layers;

        this.$viewport.css('height', dim.height + 'px');
        for (var i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            layer.canvas.attr('width', dim.width);
            layer.canvas.attr('height', dim.height);
        }
    }
});

})(Vis);
