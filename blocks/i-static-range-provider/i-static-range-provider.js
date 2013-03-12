(function(Vis) {

Vis.blocks['i-static-range-provider'] = {
    init: function(params) {
        this.params = params;
    },

    get: function() {
        return {
            min: this.params.min || 0,
            max: this.params.max || 1
        };
    }
};

})(Vis);
