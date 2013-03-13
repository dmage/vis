(function(Vis) {

Vis.blocks['i-current-time-range-provider'] = {
    init: function(params) {
        this.period = params.period || 3600;
        this.delay = params.delay || 1000;

        this._notify();
    },

    get: function() {
        var now = +new Date()/1000;
        return {
            min: now - this.period,
            max: now
        };
    },

    on: function(action, callback) {
        $(this).on(action + '.vis', callback);
    },

    _notify: function() {
        var _this = this;
        setTimeout(function() {
            $(_this).trigger('update.vis');
            _this._notify();
        }, _this.delay);
    }
};

})(Vis);
