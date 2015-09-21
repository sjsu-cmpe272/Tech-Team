var uu = require('underscore')
  , db = require('./models')
  , async = require('async')
  , http    = require('http')
  , hash = require('./pass').hash
  , Help = require('./helper/help.js');

var build_errfn = function(errmsg, response) {
    return function errfn(err) {
		console.log(err);
		response.send(errmsg);
    };
};

var indexfn = function(request, response) {
	//GLOBAL VARIABLES
	var loggedUser, category;
	var hidden = 'hidden';

	//Verify if there were errors during Log-In and set messages and Hidden Class
	if(request.session.messages){
		hidden = '';
		console.log("login Message: "+ request.session.messages);
	}
	else {
		console.log("login Empty  Flash Message: "+ request.session.messages);
	} 

	//Verify if there were errors during Sign-Up (User Exists!) and set message
	if(request.session.error){
		hidden = '';
		console.log("Signup Flash Message: "+ request.session.error);
	}
	else {
		console.log("Signup Empty  Flash Message: "+ request.session.error);
	} 

	//Set User if Logged, else = "Guest" 
	try {
		loggedUser = request.user.username;
		console.log("User ID: "+request.user.id);
		category = request.user.category;
	} 
	catch (error) {
		console.log(error + "...Setting User as GUEST");
		loggedUser = "Guest";
		category = "user";
	} 
	//use "index" in production
	response.render("index", {userName:loggedUser, hidden:hidden, errorLogin:request.session.messages, errorSignup:request.session.error, category:category});
	console.log("Finishing Index render"); 

};

var logoutfn = function(request, response) {
    request.logout();
	response.redirect('/');
};

var tempPassfn = function(request, response) {
	console.log("sending password back...");
	response.send("clasi122");
};

var define_routes = function(dict) {
    var toroute = function(item) {
		return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    '/': indexfn,
    '/logout': logoutfn,
    '/tempPass': tempPassfn
});

module.exports = ROUTES;
