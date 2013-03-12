(function(Vis) {
"use strict";

Vis.blocks['b-1'] = {
    init: function($object) {
        this.$object = $object;
    },

    doGetMessage: function() {
        return "b-1";
    },

    update: function() {
        var msg = this.doGetMessage();
        this.$object.text("hello from " + msg);
    }
};

})(window.Vis);
