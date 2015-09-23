var uu = require('underscore')
  , http    = require('http');

var indexfn = function(request, response) {
	// Render index.html
	response.render("index");
	console.log("Finishing Index render");
};

var define_routes = function(dict) {
    var toroute = function(item) {
		return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    '/': indexfn
});

module.exports = ROUTES;
