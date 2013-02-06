(function(Vis) {
"use strict";

Vis.blocks['b-axis'] = {
    init: function($object) {
        this.$object = $object;
    },

    update: function(position, ticks) {
        var offsets = {
            left: 'top', right: 'top',
            top: 'left', bottom: 'left'
        };

        var content = '';
        var offset = offsets[position] || 'top';
        for (var i = 0; i < ticks.length; ++i) {
            var tick = ticks[i];
            content += Vis.render({
                cls: 'b-axis__value',
                attrs: { style: offset + ':' + tick.offset + 'px' },
                content: [
                    { cls: 'b-axis__label', content: tick.label + (tick.extraLabel ? '<br>' + tick.extraLabel : '') },
                    { cls: 'b-axis__tick' }
                ]
            });
        }
        this.$object.attr('class', 'b-axis b-axis_pos_' + position);
        this.$object.html(content);
    }
};

})(window.Vis);
