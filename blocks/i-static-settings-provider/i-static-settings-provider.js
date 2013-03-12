(function(Vis) {

Vis.blocks['i-static-settings-provider'] = {
    init: function(params) {
        this.params = params;
    },

    get: function(callback) {
        callback.title(this.params.title || "");
        callback.yAxes(this.params.yAxes || []);
        callback.xAxes(this.params.xAxes || []);
        callback.items(this.params.items || []);
        callback.overlays(this.params.overlays || []);
    }
};

})(Vis);
