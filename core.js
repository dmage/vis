(function(exports, undefined) {
"use strict";

var _voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'
];

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
        if (typeof v.init !== 'undefined') {
            v.init(obj, block);
        }
        return v;
    },

    error: function(msg) {
        throw new Error(msg);
    },
};

Vis.blocks = {};

Vis.render = function(data) {
    if (data instanceof Array) {
        var html = '';
        for (var i = 0; i < data.length; ++i) {
            html += Vis.render(data[i]);
        }
        return html;
    } else if (data instanceof Object) {
        var tag = data.tag || 'div';
        var attrs = data.attrs || {};
        var html = "<" + tag;
        if (data.cls || attrs['class']) {
            var v = [];
            data.cls && v.push(data.cls);
            attrs['class'] && v.push(attrs['class']);
            html += ' class="' + v.join(' ') + '"';
        }
        for (var attr in attrs) {
            if (attr === 'class') {
                continue;
            }
            if (attrs.hasOwnProperty(attr)) {
                html += ' ' + attr + '="' + attrs[attr] + '"';
            }
        }
        html += '>';
        if (data.content || _voidElements.indexOf(tag) == -1) {
            html += Vis.render(data.content || '');
            html += '</' + tag + '>';
        }
        return html;
    } else {
        return data;
    }
}

Vis.extend = function(base, mix) {
    var result = Object.create(base);
    for (var i in mix) {
        if (mix.hasOwnProperty(i)) {
            result[i] = mix[i];
        }
    }
    return result;
}

exports.Vis = Vis;

})(window);
