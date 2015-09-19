var uu = require('underscore')
  , db = require('./models')
  , Constants = require('./constants')
  , emailjs = require('emailjs')
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
		loggedUser = "Visitante";
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

var publishfn = function(request, response) {
	console.log("I'm in the Publlish Route...");
	var loggedUser;
	
	//Set User if Logged, else = "Guest" 
	try {
		loggedUser = request.user.username;
	} 
	catch (error) {
		loggedUser = "Visitante";
	}
	response.render("publish", {layout:false, userName:loggedUser});
};

var searchfn = function(request, response) {
	console.log("Rendering Search Layout...");
	response.render("search", {layout:false});
};

var userdatafn = function(request, response) {
	
	//Get User if Logged, else Return with error
	var loggedUser;
	try {
		loggedUser = request.user.username;

		//Get User Data
		var userData;
		var classified_json = [];
		var counter = 0;
		db.Users.find({where: { username: loggedUser }}).success(function(resultUser) {		
			console.log("Resultado Data Usuario: "+JSON.stringify(resultUser));
			if(!resultUser)
				response.send("Not Logged");
			else
				userData = resultUser;
		
			//Get User Classifieds
			db.Classified.findAll({where: { userId: userData.id }}).success(function(resultClassified) {		
				console.log("Resultado Clasificados de Usuario: "+JSON.stringify(resultClassified));

				if(resultClassified) {
					resultClassified.forEach(function(classified) {
						classified.price = Help.formatDollar(Number(classified.price));
						classified.fees = Help.formatDollar(Number(classified.fees));
						classified_json.push(classified);
						counter++;
					});
				}
				
				response.render("myaccount", {layout:false, dataRows:classified_json, numberRows:counter, userData:userData});

			}).error(function(error) {
				response.send("Database Error, No Data Found! - "+error);
			});
		
		}).error(function(error) {
			console.log("Error Getting User Data: "+error);
			response.send("Database Error, No Data Found! - "+error);
		});
	
	} 
	catch (error) {
		console.log(error + "...Setting User as GUEST");
		response.send("Not Logged");
	}
	
};

var faqsfn = function(request, response) {
	console.log("Rendering FAQS...");
	response.render("faqs", {layout:false});
};

var aboutfn = function(request, response) {
	console.log("Rendering About...");
	response.render("about", {layout:false});
};

var tempPassfn = function(request, response) {
	console.log("sending password back...");
	response.send("clasi122");
};

/*
   Helper functions which create a ROUTES array for export and use by web.js

   Each element in the ROUTES array has two fields: path and fn,
   corresponding to the relative path (the resource asked for by the HTTP
   request) and the function executed when that resource is requested.

     [ { path: '/', fn: [Function] },
       { path: '/orders', fn: [Function] },
       { path: '/api/orders', fn: [Function] },
       { path: '/refresh_orders', fn: [Function] } ]

   It is certainly possible to implement define_routes with a simple for
   loop, but we use a few underscore methods (object, zip, map, pairs), just
   to familiarize you with the use of functional programming, which
   becomes more necessary when dealing with async programming.
*/
var define_routes = function(dict) {
    var toroute = function(item) {
		return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    '/': indexfn,
    '/logout': logoutfn,
    '/publish': publishfn,
    '/search': searchfn,
    '/faqs': faqsfn,
    '/about': aboutfn,
    '/tempPass': tempPassfn
});

module.exports = ROUTES;
