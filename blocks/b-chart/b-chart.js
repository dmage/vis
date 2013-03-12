(function(Vis) {

Vis.blocks['b-chart'] = Vis.extend(Vis.blocks['i-chart'], {
    init: function(params) {
        params = params || {};

        this.$object = params.$object;

        this.__base.init(params);

        this.initObject();
    },

    initObject: function() {
        var _this = this,
            content = _this.content,
            yAxes = content.yAxes;
        var i, l, yAxis;

        this.$object.empty();

        var ml = '';
        for (i = 0, l = yAxes.length; i < l; ++i) {
            yAxis = yAxes[l - i - 1];
            if (yAxis.pos !== 'left') {
                continue;
            }

            ml += Vis.render({ cls: 'b-box', attrs: { style: 'display: inline-block' }, content: "axis #" + (l - i - 1) });
        }

        var mr = '';
        for (i = 0, l = yAxes.length; i < l; ++i) {
            yAxis = yAxes[i];
            if (yAxis.pos !== 'right') {
                continue;
            }

            mr += Vis.render({ cls: 'b-box', attrs: { style: 'display: inline-block' }, content: "axis #" + i });
        }

        var c = '';
        c += Vis.render({
            cls: 'b-chart__header',
            content: 'Header'
        });
        c += Vis.render({
            tag: 'table',
            cls: 'b-9',
            content: [
                {
                    tag: 'tr',
                    content: [
                        { tag: 'td', cls: 'b-9__tl', content: 'tl' },
                        { tag: 'td', cls: 'b-9__tc', content: 'tc' },
                        { tag: 'td', cls: 'b-9__tr', content: 'tr' }
                    ]
                },
                {
                    tag: 'tr',
                    content: [
                        { tag: 'td', cls: 'b-9__ml', attrs: { style: 'white-space: nowrap' }, content: ml },
                        { tag: 'td', cls: 'b-9__mc', content: 'mc' },
                        { tag: 'td', cls: 'b-9__mr', attrs: { style: 'white-space: nowrap' }, content: mr }
                    ]
                },
                {
                    tag: 'tr',
                    content: [
                        { tag: 'td', cls: 'b-9__bl', content: 'bl' },
                        { tag: 'td', cls: 'b-9__bc', content: 'bc' },
                        { tag: 'td', cls: 'b-9__br', content: 'br' }
                    ]
                }
            ]
        });

        this.$object.html(c);
    }
});

})(Vis);
