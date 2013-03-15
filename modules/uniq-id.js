(function(Vis) {

var _prefix = "Vis-" + +new Date() + "-";
var _id = 0;

Vis.uniqId = function() {
	_id += 1;
	return _prefix + _id;
};

})(window.Vis);
