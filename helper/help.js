var db = require('../models')
  , hash = require('../pass').hash
  , fs = require('fs')
  , https = require('https');

//Verify if user Exists
exports.userExist = function(request, response, next) {
    db.Users.count({where: {username: request.body.username}}).then(function (count) {
        if (count === 0) {
            next();
        } else {
            request.session.error = "User Exist! Try a different name."
            response.redirect("/");
        }
    });
}

//Create New User
exports.createUser = function(req, resp, customerId, sendErrorEmail, callback) {
	var Users = db.Users;

	//Set Full Name based on Selection of Owner or Realtor 
	var fullName;
	if(req.body.ownerOrRealtor == "Dueno")
		fullName = req.body.fullNameOwner;
	else
		fullName = req.body.fullNameRealtor;
		
	hash(req.body.password, function (err, salt, hash) {
		if (err) throw err;
		
		//category: 'administrator',  -  To use for creation of administrators
		//Everyone is "user", "realtor" must be verified and everybody else.
		
		var newUser = Users.build({   
			username: req.body.username,
			password: hash,
			category: "user",
			provider: "local",
			customerId: customerId,
			displayName: req.body.username,
			email: req.body.email,
			name: fullName,
			photos: "default.png",
			salt: salt,
			hash: hash
		});

		newUser.save().then(function (savedUser) {
			console.log("New Credential Stored!!! ");
			req.login(savedUser, function(err) {
				if (err) {
					sendErrorEmail(err, newUser);
					return next(err); 
				}
				callback(savedUser);
			});
		});
	});
}