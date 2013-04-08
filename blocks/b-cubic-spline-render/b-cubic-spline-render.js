(function($, Vis) {

function ApplyMatrix(A, b) {
    var n = b.length,
        x = Array(n),
        i = 0, j = 0, v;
    for (i = 0; i < n; ++i) {
        v = 0;
        for (j = 0; j < n; ++j) {
            v += A[i*n + j]*b[j];
        }
        x[i] = v;
    }
    return x;
}

function Solve(A, b, w, maxIters) {
    w = w || 1.5;
    maxIters = maxIters || 100;

    var n = b.length,
        x = Array(n),
        k = 0, i, j;
    for (i = 0; i < n; ++i) {
        x[i] = Math.random();
    }

    while (k < maxIters) {
        var r = ApplyMatrix(A, x);
        var done = 1;
        for (i = 0; i < n; ++i) {
            if (Math.abs(r[i] - b[i]) > 0.0001) {
                done = 0;
                break;
            }
        }
        if (done) {
            return x;
        }

        k += 1;
        for (i = 0; i < n; ++i) {
            var s = 0;
            for (j = 0; j < n; ++j) {
                if (j != i) {
                    s += A[i*n + j]*x[j];
                    if (s != s) { Vis.error('NaN at ' + k + ' iteration (A[' + i + ',' + j + '])'); }
                }
            }
            if (s != s) { Vis.error('NaN at ' + k + ' iteration (s)'); }
            x[i] = (1 - w)*x[i] + w*(b[i] - s)/A[i*n + i];
            if (x[i] != x[i]) { Vis.error('NaN at ' + k + ' iteration (x[i])'); }
        }
    }

    console.log('Solve', 'no solution after ' + maxIters + ' iterations');
    Vis.error('no solution after ' + maxIters + ' iterations');
    return (void 0);
}

function Spline(X, Y) {
    var n = X.length,
        i;

    var Xd = [], Yd = [], xprev = null;
    for (i = 0; i < n; ++i) {
        var x = X[i], y = Y[i];
        if (x != xprev) { Xd.push(x); Yd.push(y); }
        xprev = x;
    }
    X = Xd; Y = Yd;
    n = X.length;

    var A = Array(n*n);
    var b = Array(n);
    for (i = 0; i < n*n; ++i) {
        A[i] = 0;
    }

    console.log(X[1], X[0]);
    A[0] = 2.0/(X[1] - X[0]);
    A[1] = 1.0/(X[1] - X[0]);
    A[n] = A[1];
    b[0] = 3.0*(Y[1] - Y[0])/((X[1] - X[0])*(X[1] - X[0]));
    for (i = 1; i < n - 1; ++i) {
        A[i*n + i] = 2.0/(X[i] - X[i - 1]) + 2.0/(X[i + 1] - X[i]);
        A[i*n + i + 1] = 1.0/(X[i + 1] - X[i]);
        A[(i + 1)*n + i] = A[i*n + i + 1];
        b[i] = 3.0*(Y[i] - Y[i - 1])/((X[i] - X[i - 1])*(X[i] - X[i - 1])) +
            3.0*(Y[i + 1] - Y[i])/((X[i + 1] - X[i])*(X[i + 1] - X[i]));
    }
    A[(n - 1)*n + (n - 1)] = 2.0/(X[n - 1] - X[n - 2]);
    b[n - 1] = 3.0*(Y[n - 1] - Y[n - 2])/((X[n - 1] - X[n - 2])*(X[n - 1] - X[n - 2]));

    var k = Solve(A, b);
    //console.log('k', k);
    var result = Array(n - 1);
    for (i = 0; i < n - 1; ++i) {
        var xs = X[i],
            x1 = 0, x2 = X[i + 1] - xs,
            y1 = Y[i], y2 = Y[i + 1],
            p1 = k[i], p2 = k[i + 1];
        var p_sum = (p1 + p2);
        var x_sum = (x1 + x2);
        var x_dlt = (x2 - x1);
        var y_dlt = (y2 - y1);
        var x_dlt_3 = x_dlt*x_dlt*x_dlt;
        var x1_2x2 = x1 + 2*x2;
        var px = x1*p2 + x2*p1;
        var a = (p_sum*x_dlt - 2*y_dlt)/x_dlt_3;
        var b = (p2*(2*x1*x1 - x1*x2 - x2*x2) + 3*x_sum*y_dlt -p1*x_dlt*x1_2x2)/x_dlt_3;
        var c = (p2*x1*x_dlt*x1_2x2 + x2*(p1*(-2*x1*x1 + x1*x2 + x2*x2) - 6*x1*y_dlt))/x_dlt_3;
        var d = (x1*x1*(3*x2 - x1)*y2 - x2*(x1*x_dlt*px - x2*(-3*x1 + x2)*y1))/x_dlt_3;
        var x0 = -b/(3*a);
        var h = -(b*x0 + c)/(3*a);
        var y0 = a*x0*x0*x0 + b*x0*x0 + c*x0 + d;
        result[i] = {
            xs: xs,
            x1: x1, x2: x2,
            y1: y1, y2: y2,
            p1: p1, p2: p2,
            a: a, b: b, c: c, d: d,
            x0: x0, h: h, y0: y0
        };
    }
    return result;
}

Vis.blocks['b-cubic-spline-render'] = {
    init: function(params) {
        this.params = params;
    },

    drawItem: function(sched, layers, itemNo) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            item = content.items[itemNo],
            xAxis = content.xAxes[item.xAxisNo || 0] || Vis.error("No x-axis for item #" + itemNo),
            yAxis = content.yAxes[item.yAxisNo || 0] || Vis.error("No y-axis for item #" + itemNo),
            canvas = layers[itemNo].canvas,
            ctx = layers[itemNo].ctx,
            xData = item.renderData.x,
            yData = item.renderData.y,
            shiftData = item.renderData.shift || [],
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y, prev,
            i, l, dots,
            colorMixin = this.params.colorMixin,
            colorMixinLevel = this.params.colorMixinLevel || 0.5,
            mozilla = (navigator.oscpu || "").indexOf('Linux') > 0 &&
                navigator.userAgent.indexOf('Firefox') > 0;

        //console.time('render ' + itemNo);

        if (canvas) {
            ctx.clearRect(0, 0, dim.width, dim.height);
            canvas.css('left', '0');
            canvas.css('width', '100%');
        }

        var color = item.color || "rgb(0,0,0)";
        if (typeof colorMixin !== 'undefined') {
            var colorRgba = $.colorToRgba(color),
                mixinRgba = $.colorToRgba(colorMixin),
                lvl = colorMixinLevel;

            var result = {
                r: Math.floor((1 - lvl)*colorRgba.r + lvl*mixinRgba.r),
                g: Math.floor((1 - lvl)*colorRgba.g + lvl*mixinRgba.g),
                b: Math.floor((1 - lvl)*colorRgba.b + lvl*mixinRgba.b),
                a: colorRgba.a
            };
            if (result.a == 1) {
                color = 'rgb(' + result.r + ',' + result.g + ',' + result.b + ')';
            } else {
                color = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + result.a + ')';
            }
        }
        ctx.strokeStyle = '#c00';
        ctx.lineWidth = 1;

        if (xData.length == 0) {
            return;
        }
        var ss = Spline(xData, yData);
        //console.log(ss);
        for (i = 0; i < ss.length; ++i) {
            var s = ss[i];
            if (i == 0) {
                ctx.moveTo(xf(s.x1 + s.xs), height - yf(s.y1));
                ctx.beginPath();
            }
            //console.log(s.y1, s.a*(s.x1 - s.x0)*(s.x1 - s.x0)*(s.x2 - s.x0) - s.a*s.h*(2*(s.x1 - s.x0) + (s.x2 - s.x0)), s.y0);
            ctx.bezierCurveTo(
                xf((2*s.x1 + s.x2)/3.0 + s.xs),
                height - yf(s.a*(s.x1 - s.x0)*(s.x1 - s.x0)*(s.x2 - s.x0) - s.a*s.h*(2*(s.x1 - s.x0) + (s.x2 - s.x0)) + s.y0),
                xf((s.x1 + 2*s.x2)/3.0 + s.xs),
                height - yf(s.a*(s.x1 - s.x0)*(s.x2 - s.x0)*(s.x2 - s.x0) - s.a*s.h*((s.x1 - s.x0) + 2*(s.x2 - s.x0)) + s.y0),
                xf(s.x2 + s.xs),
                height - yf(s.y2)
            );
        }
        ctx.stroke();

        //console.timeEnd('render ' + itemNo);
    }
};

})(jQuery, Vis);
