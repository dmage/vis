module Vis {

var _prefix = "Vis-" + +new Date() + "-";
var _id = 0;

export function uniqId() {
    _id += 1;
    return _prefix + _id;
}

}
