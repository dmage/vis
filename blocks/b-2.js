(function(Vis) {
"use strict";

Vis.blocks['b-2'] = Vis.extend(Vis.blocks['b-1'], {
    doGetMessage: function() {
        return "b-2";
    }
});

})(window.Vis);
