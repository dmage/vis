(function(exports, undefined) {
"use strict";

var Vis = function(obj, block) {
    return Vis.fn.init(obj, block);
}

Vis.fn = Vis.prototype = {
    version: 0.1,

    constructor: Vis,
    init: function(obj, block) {
        if (typeof Vis.blocks[block] === 'undefined') {
            this.error("Non-existent block " + block);
        }

        var v = Object.create(Vis.blocks[block]);
        v.init(obj, block);
        return v;
    },

    error: function(msg) {
        throw new Error(msg);
    }
};

Vis.blocks = {};

exports.Vis = Vis;

})(window);
