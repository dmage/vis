(function(Vis) {

Vis.blocks['i-static-data-provider'] = {
    init: function(params) {
        this.params = params;
    },

    on: function(action, callback) {
    },

    get: function() {
        return {
            x: this.params.x,
            y: this.params.y
        };
    }
};

})(Vis);
