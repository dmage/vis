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

        var mlc = [];
        var ml = { tag: 'table', cls: 'b-layout', content: { tag: 'tr', content: mlc } };
        for (i = 0, l = yAxes.length; i < l; ++i) {
            yAxis = yAxes[i];
            if (yAxis.pos !== 'left') {
                continue;
            }

            mlc.unshift({
                tag: 'td',
                cls: 'b-layout__cell',
                content: { cls: 'b-box', content: "axis #" + i }
            });
        }
        ml = Vis.render(ml);

        var mrc = [];
        var mr = { tag: 'table', cls: 'b-layout', content: { tag: 'tr', content: mrc } };
        for (i = 0, l = yAxes.length; i < l; ++i) {
            yAxis = yAxes[i];
            if (yAxis.pos !== 'right') {
                continue;
            }

            mrc.push({
                tag: 'td',
                cls: 'b-layout__cell',
                content: { cls: 'b-box', content: "axis #" + i }
            });
        }
        mr = Vis.render(mr);

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
                        { tag: 'td', cls: 'b-9__ml', content: ml },
                        { tag: 'td', cls: 'b-9__mc', content: 'mc' },
                        { tag: 'td', cls: 'b-9__mr', content: mr }
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
