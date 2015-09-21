/*
    Handle Posts made to the server
*/
var Help = require('../helper/help.js')
    , async = require('async')
    , emailjs = require('emailjs')
    , hash = require('../pass').hash
    , fs = require('fs')
    , OAuth = require('oauth')
    , AWS = require('aws-sdk');

//AWS Credentials and AWS Region
AWS.config.update({accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET});
AWS.config.update({region: 'us-east-1'});

module.exports = function(app, db, passport){
	
	// '/signnew' - Handle New Account Registration
	app.post("/signnew", Help.userExist, function (req, res) {
		var customerId = null;
		
		Help.createUser(req, res, customerId, sendErrorEmail, function(savedUser) {

			if(savedUser) {
				console.log("User Was Saved: "+ JSON.stringify(savedUser)); 
				req.session.messages = "";
				return res.redirect('/');
			}
			
		});
				
	});
	
	// '/checkuser' - Check if users exists
	app.post('/checkuser', function(req, res) {
	    db.Users.count({where: {username: req.body.username}}).then(function (count) {
			if (count === 0) {
				console.log("Username Available");
				res.send("Available");
			} else {
				console.log("Username NOT Available");
				res.send("Not Available");
			}
		});
	});
	
	// '/signup' - Handle Email Sign-ups
	app.post('/signup', function(req, res) {
		var email=[];
		email.push(req.body.signupEmail);
	
		console.log("email received: %s", email[0]);
	
		//Function to store email Async to the database.
		async.forEach(email, Help.storeEmail, function(err) {
			if (err) {
				console.log(err);
				response.send("error storing emails");
			} else {
				// email added successfully
				//response.redirect("/orders");
				console.log("Email added successfuly to database");
			}
		});
	});
	
	// '/login' - Handle Login Reguest
	app.post('/login', function(req, res, next) {
	    passport.authenticate('local', function(err, user, info) {
			if (err) { return next(err) }
			if (!user) {
			    req.session.messages =  [info.message];
			    return res.redirect('/');
			}
			req.logIn(user, function(err) {
			    if (err) { return next(err); }
			    req.session.messages = "";
			    return res.redirect('/');
			});
	  	})(req, res, next);
	});
	
	// '/userdata' - Render Details View from results
	app.post('/userdata', function(req, res) {
	
		//Get User if Logged, else Return with error
		var loggedUser;
		try {
			loggedUser = req.user.username;

			//Get User Data
			var userData;
			var classified_json = [];
			var counter = 0;
			db.Users.find({where: { username: loggedUser }}).then(function(resultUser) {
				console.log("Resultado Data Usuario: "+JSON.stringify(resultUser));
				if(!resultUser)
					res.send("Not Logged");
				else
					userData = resultUser;
		
				//Get User Classifieds
				db.Classified.findAll({where: { userId: userData.id }}).then(function(resultClassified) {
					console.log("Resultado Clasificados de Usuario: "+JSON.stringify(resultClassified));

					if(resultClassified) {
						resultClassified.forEach(function(classified) {
							classified.price = Help.formatDollar(Number(classified.price));
							classified.fees = Help.formatDollar(Number(classified.fees));
							classified_json.push(classified);
							counter++;
						});
					}
				
					res.render("myaccount", {layout:false, dataRows:classified_json, numberRows:counter, userData:userData, width:req.body.screenSize});

				}).error(function(error) {
					res.send("Database Error, No Data Found! - "+error);
				});
		
			}).error(function(error) {
				console.log("Error Getting User Data: "+error);
				res.send("Database Error, No Data Found! - "+error);
			});
	
		} 
		catch (error) {
			console.log(error + "...Setting User as GUEST");
			res.send("Not Logged");
		}

	});
	
	// '/administ' - Render Details View from results
	app.post('/administ', function(req, res) {
	
		//Get User if Logged, else Return with error
		var loggedUser;
		try {
			loggedUser = req.user.username;

			//Get User Data
			var userData;
			var classified_json = [];
			var counter = 0;
			db.Users.find({where: { username: loggedUser }}).then(function(resultUser) {
				console.log("Resultado Data Usuario: "+JSON.stringify(resultUser));
				if(!resultUser)
					res.send("Not Logged");
				else {
					if(resultUser.category == "administrator"){
						userData = resultUser;
					}
					else {
						res.send("Do Not Have Permission to Access This Section!!");
						return;
					}
				}
		
				//Get User Classifieds
				db.Classified.count().then(function(total) {
					console.log("Total Clasificados: "+JSON.stringify(total));
				
					res.render("administ", {layout:false, total:total, userData:userData, width:req.body.screenSize});

				}).error(function(error) {
					res.send("Database Error, No Data Found! - "+error);
				});
		
			}).error(function(error) {
				console.log("Error Getting User Data: "+error);
				res.send("Database Error, No Data Found! - "+error);
			});
	
		} 
		catch (error) {
			console.log(error + "...Setting User as GUEST");
			res.send("Not Logged");
		}

	});
	
	// '/changeuseremail' - Render Details View from results
	app.post('/changeuseremail', function(req, res) {
		console.log("Received from Change User or Email View: "+req.body.username+"Email: "+req.body.email);

		db.Users.find(req.body.id).then(function(currentUser) {
		    if (currentUser) { 
				currentUser.updateAttributes({
			    	username: req.body.username,
			    	displayName: req.body.username,
			    	email: req.body.email
				}).then(function() {
					res.send("done");
				}).error(function(error) {
					res.send(error);
				});
		    }
		    else {
		    	res.send("Error Actualizando el Usuario");
		    }
		}).error(function(error) {
			res.send("Error Actualizando el Usuario");
		});

	});
	
	// '/changepassword' - Render Details View from results
	app.post('/changepassword', function(req, res) {
		console.log("Received from Change User Password: "+req.body.password);

		db.Users.find(req.body.id).then(function(currentUser) {
		    if (currentUser) { 
		    	hash(req.body.password, function (err, salt, hash) {
					if (err) throw err;
					
					currentUser.updateAttributes({
						password: hash,
						salt: salt,
						hash: hash
					}).then(function() {
						res.send("done");
					}).error(function(error) {
						res.send(error);
					});
				});
		    }
		    else {
		    	res.send("Error Actualizando el Usuario");
		    }
		}).error(function(error) {
			res.send("Error Actualizando el Usuario");
		});

	});

    // '/gettoken' - Render Details View from results
    app.post('/gettoken', function (req, res) {
        var OAuth2 = OAuth.OAuth2;

        var oauth2 = new OAuth2(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            'https://api.twitter.com/',
            null,
            'oauth2/token',
            null
        );

        oauth2.getOAuthAccessToken('',
            {'grant_type': 'client_credentials'}, function (error, access_token, refresh_token, results) {
                if (error) {
                    console.log("Error getting token: " + error);
                    res.send("error");
                }

                // Here is the Token
                console.log('bearer: ', access_token);

                // Send Token to FrontEnd
                res.send(access_token);

            });
    });

    // '/gettoken' - Render Details View from results
    app.post('/tweetStatus', function (req, res) {
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.post(
            'https://api.twitter.com/1.1/statuses/update.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            {"status":req.body.status},
            function (e, data) {
                if (e) console.error(e);
                console.log(require('util').inspect(data));
                res.send(data);
            });
    });


    // SEND Error Email - Something Went Wrong!
	var sendErrorEmail = function(error, data) {
		
		//Prepare Server variables
		var server  = emailjs.server.connect({
			user:    process.env.E_USER, 
			password:process.env.E_PASS, 
			host:    "e350.websitewelcome.com", 
			ssl:     true,
			port: 465
		});
 
		// send the message and get a callback with an error or details of the message that was sent
		var message = {
		   text:    "Hubo un error creando el siguiente clasificado. Favor investigar con urgencia!:"
					+"Error:"+JSON.stringify(error)+" Data: "+ JSON.stringify(data), 
		   from:    "ToolSpin <info@clasinuevos.com>", 
		   to:      "Admin <admin@dactylmobile.com",
		   subject: "Error al Crear Clasificado - Urgente!"
		};
	
		// send the message and get a callback with an error or details of the message that was sent
		server.send(message, function(err, message) { console.log(err || message); }); 
	}
}