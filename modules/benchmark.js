(function(Vis) {

Vis.benchmark = function(b, name) {
    if (b) {
        var now = performance.now();
        var v;
        if (b.prev) {
            v = now - b.prev;
            v = Math.round(v*100)/100;
            b.sub.push(v);
        }
        v = now - b.start;
        v = Math.round(v*100)/100;
        if (b.sub) {
            console.log(new Date(), name + ':', v + ' ms', b.sub);
        } else {
            console.log(new Date(), name + ':', v + ' ms');
        }
    } else {
        return { start: performance.now() };
    }
};

Vis.subbenchmark = function(b) {
    var prev = b.prev || b.start;
    b.sub || (b.sub = []);
    var now = performance.now();
    var v = now - prev;
    v = Math.round(v*100)/100;
    b.sub.push(v);
    b.prev = now;
}

})(window.Vis);
