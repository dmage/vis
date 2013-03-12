(function(Vis) {

Vis.blocks['b-chart'] = Vis.extend(Vis.blocks['i-chart'], {
    init: function(params) {
        params = params || {};

        this.$object = params.$object;
        this.$object.html('b-chart');

        this.__base.init(params);
    }
});

})(Vis);
