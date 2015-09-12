var db = require('../models')
  , hash = require('../pass').hash
  , fs = require('fs')
  , https = require('https');

//Format numbers to two decimals with commas
var formatDollar = function(num) {
    var p = num.toFixed().split(".");
    var chars = p[0].split("").reverse();
    var newstr = '';
    var count = 0;
    for (x in chars) {
        count++;
        if(count%3 == 1 && count != 1) {
            newstr = chars[x] + ',' + newstr;
        } else {
            newstr = chars[x] + newstr;
        }
    }
    return "$"+newstr;
}

//Format numbers to two decimals with commas
exports.formatDollar = function(num) {
    var p = num.toFixed().split(".");
    var chars = p[0].split("").reverse();
    var newstr = '';
    var count = 0;
    for (x in chars) {
        count++;
        if(count%3 == 1 && count != 1) {
            newstr = chars[x] + ',' + newstr;
        } else {
            newstr = chars[x] + newstr;
        }
    }
    return "$"+newstr;
}

//Format numbers to two decimals with commas
exports.formatNumber = function(num) {
    var p = num.toFixed().split(".");
    var chars = p[0].split("").reverse();
    var newstr = '';
    var count = 0;
    for (x in chars) {
        count++;
        if(count%3 == 1 && count != 1) {
            newstr = chars[x] + ',' + newstr;
        } else {
            newstr = chars[x] + newstr;
        }
    }
    return newstr;
}

//SET FLAG DUE when Classified date is over
exports.flagDue = function(callback) {
	var currentDate = new Date();
    db.Classified.update({visible: 0}, {endDate: {lt:currentDate}}).success(function(result) {
    	console.log("Found Records and completed update: "+result);
    	callback("Done");
    }).error(function(error) {
    	console.log("Error: "+error);
		callback(error);
	});
}

//Store Classified Data
exports.storeData = function(req,savedUserId,chargeId, callback) {
	console.log("Storing the DATA FUnction with user ID: "+savedUserId);
	
	//Calculate Current Date + 30 days
	var endDate = new Date();
	endDate.setDate(endDate.getDate() + 30);
	
	var error=null;
	
	var newClassified = db.Classified.build({   
		userId: savedUserId,
		chargeId: chargeId,
		ownerOrRealtor: req.body.ownerOrRealtor,
		fullNameOwner: req.body.fullNameOwner,
		emailOwner: req.body.emailOwner,
		phoneOwner: req.body.phoneOwner,
		fullNameRealtor: req.body.fullNameRealtor,
		emailRealtor: req.body.emailRealtor,
		phoneRealtor: req.body.phoneRealtor,
		createAccount: req.body.createAccount,
		neighborhood: req.body.neighborhood,
		address: req.body.address,
		town: req.body.town,
		stateOwner: req.body.stateOwner,
		zipcode: req.body.zipcode,
		longitud: req.body.longitud,
		latitude: req.body.latitude,
		sellOrRent: req.body.sellOrRent,
		property: req.body.property,
		year: req.body.year,
		bedrooms: req.body.bedrooms,
		bathrooms: req.body.bathrooms,
		sqft: req.body.sqft,
		storie: req.body.storie,
		parking: req.body.parking,
		price: req.body.price,
		fees: req.body.fees,
		accessories: req.body.accessories,
		description: req.body.description,
		extras: req.body.extras,
		photo1: req.body.photo1,
		photo2: req.body.photo2,
		photo3: req.body.photo3,
		photo4: req.body.photo4,
		photo5: req.body.photo5,
		highlight: req.body.highlight,
		terms: req.body.terms,
		totalSale: req.body.totalSale,
		stripeToken: req.body.stripeToken,
		endDate: endDate,
		visible: 1
	});
	console.log("Finish Classified.build");
	
	newClassified.save().success(function (savedData) {
		console.log("New Classified Stored!!! :" + JSON.stringify(savedData));
		callback(savedData,error);
		
	}).error(function(error) {
		console.log("Error Storing Classified Info. Msg: "+error);
		responseMsg = "error";
		
		callback(error,error);
	});
}

//Verify if user Exists
exports.userExist = function(request, response, next) {
    db.Users.count({where: {username: request.body.username}}).success(function (count) {
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

		newUser.save().success(function (savedUser) {
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
    
//Update Existing Record
exports.updateData = function(req,savedUserId,chargeId, callback) {
	console.log("Updating the DATA FUnction with user ID: "+savedUserId);
	var error=null;
	
	db.Classified.find(req.body.id).success(function(classifiedToUpdate) {		

		if(classifiedToUpdate) {
			console.log("Found Classified to Update...: "+JSON.stringify(classifiedToUpdate));
			
			if(req.body.sqft == "")
				req.body.sqft = 0;
			
			var	updateAttr = {
				userId: savedUserId,
				chargeId: chargeId,
				ownerOrRealtor: req.body.ownerOrRealtor,
				fullNameOwner: req.body.fullNameOwner,
				emailOwner: req.body.emailOwner,
				phoneOwner: req.body.phoneOwner,
				fullNameRealtor: req.body.fullNameRealtor,
				emailRealtor: req.body.emailRealtor,
				phoneRealtor: req.body.phoneRealtor,
				neighborhood: req.body.neighborhood,
				address: req.body.address,
				town: req.body.town,
				stateOwner: req.body.stateOwner,
				zipcode: req.body.zipcode,
				longitud: req.body.longitud,
				latitude: req.body.latitude,
				sellOrRent: req.body.sellOrRent,
				property: req.body.property,
				year: req.body.year,
				bedrooms: req.body.bedrooms,
				bathrooms: req.body.bathrooms,
				sqft: req.body.sqft,
				storie: req.body.storie,
				parking: req.body.parking,
				price: req.body.price,
				fees: req.body.fees,
				accessories: req.body.accessories,
				description: req.body.description,
				photo1: req.body.photo1,
				photo2: req.body.photo2,
				photo3: req.body.photo3,
				photo4: req.body.photo4,
				photo5: req.body.photo5,
				totalSale: req.body.totalSale,
				stripeToken: req.body.stripeToken,
				endDate: req.body.endDate,
				visible: req.body.visible
			};
			
			console.log("Extras: "+req.body.extras);
			if(req.body.extras) {
				updateAttr['extras'] = req.body.extras;
			}

			console.log("Highlight: "+req.body.highlight);
			if(req.body.highlight) {
				updateAttr['highlight'] = req.body.highlight;
			}

			classifiedToUpdate.updateAttributes(updateAttr).success(function() {
				console.log("Classified Changed and UPDATED");
				callback("done",null);
			}).error(function(error) {
				console.log("Error Updating: "+error);
				callback(null,error);
			});
		}
		else {
			callback(null,"Error Retrieving Data to Delete");
		}
	}).error(function(error) {
		callback(null,"Error Retrieving Data to Delete");
	});
}