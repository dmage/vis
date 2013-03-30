(function($, Vis) {

var units = Units;

Vis.blocks['b-tooltip-overlay'] = {
    init: function(params) {
        this.params = params;
    },

    bind: function() {
        var _this = this,
            viewport = _this.params.content.$viewport;

        var $tooltip = $('<div class="b-tooltip">');
        $tooltip.hide();

        var $dot = $('<div>');
        $dot.css('position', 'absolute');
        $dot.css('height', '0px');
        $dot.css('width', '0px');
        $dot.css('border', '2px solid #000');
        $dot.css('border-radius', '2px');
        $dot.css('box-shadow', '0 0 0 1px #fff');
        $dot.hide();

        _this.$tooltip = $tooltip;
        _this.$tooltip.appendTo(viewport);

        _this.$dot = $dot;
        _this.$dot.appendTo(viewport);

        viewport.mousemove($.proxy(this.handleMove, this));
        viewport.mouseleave($.proxy(this.handleLeave, this));
    },

    layersRequest: function() {
        return [];
    },

    draw: function(sched, layers) {
        sched.next();
    },

    handleMove: function(event) {
        var _this = this,
            dim = _this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = _this.params.content,
            items = content.items,
            xAxes = content.xAxes,
            yAxes = content.yAxes,
            viewport = _this.params.content.$viewport,
            $tooltip = _this.$tooltip,
            $dot = _this.$dot;

        var offset = viewport.offset();
        var px = (event.pageX - offset.left),
            py = height - (event.pageY - offset.top);

        var essential = 20,
            dist = essential*essential,
            nearest;
        var iters = 0;
        for (var i = 0, l = items.length; i < l; ++i) {
            var item = items[i],
                xAxis = xAxes[item.xAxis || 0] || xAxes[0],
                yAxis = yAxes[item.yAxis || 0] || yAxes[0],
                xData = item.renderData.x || [],
                yData = item.renderData.y || [],
                shiftData = item.renderData.shift || [],
                x = xAxis.scale,
                y = yAxis.scale;

            var xBegin = x.fInv(px - essential),
                xEnd = x.fInv(px + essential);

            var j = Vis.binarySearch(xBegin, xData),
                m = xData.length;
            if (j < 0) {
                j = -j - 1;
            }

            while (j < m) {
                var xVal = xData[j],
                    yVal = yData[j];
                    shiftVal = shiftData[j] || 0;
                if (xVal > xEnd) {
                    break;
                }
                if (yVal === null) {
                    ++j;
                    continue;
                }

                var dx = px - x.f(xVal),
                    dy = py - y.f(yVal + shiftVal),
                    dd = dx*dx + dy*dy;
                if (dd < dist) {
                    dist = dd;
                    nearest = { item: i, pos: j };
                }

                ++j;
                iters += 1;
            }
        }

        if (nearest) {
            var item = items[nearest.item],
                j = nearest.pos,
                xAxis = xAxes[item.xAxis || 0] || xAxes[0],
                yAxis = yAxes[item.yAxis || 0] || yAxes[0],
                xData = item.renderData.x || [],
                yData = item.renderData.y || [],
                shiftData = item.renderData.shift || [],
                xVal = xData[j],
                yVal = yData[j],
                shiftVal = shiftData[j] || 0,
                xLabel = units.format(xVal, xAxis.units, xAxis.scale);
                yLabel = units.format(yVal, yAxis.units, yAxis.scale);
                x = xAxis.scale,
                y = yAxis.scale;

            var result = $.colorToRgba(item.color),
                mixin = $.colorToRgba("#fff"),
                lvl = 0.9;
            result = {
                r: Math.floor((1 - lvl) * result.r + lvl * mixin.r),
                g: Math.floor((1 - lvl) * result.g + lvl * mixin.g),
                b: Math.floor((1 - lvl) * result.b + lvl * mixin.b)
            };
            var color = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',0.8)';

            result = $.colorToRgba(item.color);
            mixin = $.colorToRgba("#000");
            lvl = 0.2;
            result = {
                r: Math.floor((1 - lvl) * result.r + lvl * mixin.r),
                g: Math.floor((1 - lvl) * result.g + lvl * mixin.g),
                b: Math.floor((1 - lvl) * result.b + lvl * mixin.b)
            };
            var borderColor = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',0.8)';

            px = x.f(xVal);
            py = y.f(yVal + shiftVal);
            $tooltip.css('background-color', color);
            $tooltip.css('border-color', borderColor);
            if (px < 0.75*width) {
                $tooltip.css('left', px + 'px');
                $tooltip.css('right', 'auto');
            } else {
                $tooltip.css('right', (width - px) + 'px');
                $tooltip.css('left', 'auto');
            }
            $tooltip.css('bottom', py + 'px');
            $tooltip.text(xLabel + ", " + yLabel);
            $tooltip.show();
            $dot.css('border-color', item.color);
            $dot.css('left', (px - 2) + 'px');
            $dot.css('bottom', (py - 2) + 'px');
            $dot.show();
        } else {
            $tooltip.hide();
            $dot.hide();
        }
    },

    handleLeave: function(event) {
        this.$tooltip.hide();
        this.$dot.hide();
    }

};

})(jQuery, Vis);
