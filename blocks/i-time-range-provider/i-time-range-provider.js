(function(Vis) {

Vis.blocks['i-time-range-provider'] = {
    init: function(params) {
        var _this = this,
            timeRangeProvider = _this.timeRangeProvider = params.timeRangeProvider;

        timeRangeProvider.on('update.vis', function() {
            _this.range = timeRangeProvider.get();
            $(_this).trigger('update.vis');
        });
        _this.range = timeRangeProvider.get();
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    get: function() {
        return this.range;
    }
};

})(Vis);
