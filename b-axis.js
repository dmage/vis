(function(Vis) {

Vis.blocks['b-axis'] = {
    init: function($object) {
        this.$object = $object;
    },

    update: function() {
        this.$object.html('Hello, world!');
    }
};

})(window.Vis);
