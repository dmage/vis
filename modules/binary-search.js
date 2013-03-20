(function(Vis) {

Vis.binarySearch = function binarySearch(value, arr) {
    var low = 0, high = arr.length - 1, mid, midValue;

    if (low > high) {
        return -1;
    }

    while (low <= high) {
        mid = (low + high) >> 1;
        midValue = arr[mid];
        if (value < midValue) {
            high = mid - 1;
        } else if (value > midValue) {
            low = mid + 1;
        } else {
            return mid;
        }
    }

    return -low - 1;
};

})(Vis);
