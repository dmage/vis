(function(Vis) {

Vis.blocks['i-tango-color-scheme'] = {
    colors: [
        '#73d216', // Chameleon
        '#edd400', // Butter
        '#3465a4', // Sky Blue
        '#cc0000', // Scarlet Red
        '#75507b', // Plum
        '#f57900', // Orange
        '#babdb6', // Aluminium
        '#c17d11'  // Chocolate
    ],

    get : function(i) {
        return this.colors[i % this.colors.length];
    }
};

})(Vis);
