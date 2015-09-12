/*
    Handle Posts made to the server
*/
var Help = require('../helper/help.js')
  , async = require('async')
  , emailjs = require('emailjs')
  , hash = require('../pass').hash
  , fs = require('fs')
  , stripe = require('stripe')(process.env.STRIPE_API_KEY)
  , AWS = require('aws-sdk')
  , im = require('imagemagick');

//AWS Credentials
AWS.config.update({accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET});

//Set Region.
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
	    db.Users.count({where: {username: req.body.username}}).success(function (count) {
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
	
	// '/contact' - Send Email from Contact From
	app.post('/contact', function(req, res) {
		var email=[];    
		var checkSignup = req.body.signupCheck;
		var name = req.body.name;
		var info = req.body.info;
    
    	email.push(req.body.email);

		console.log("email received: %s", email[0]);
		console.log("Sign Up Check: %s", checkSignup);

		//Store Email if User requested by checking the checkbox
		if(checkSignup) {
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
		}
    	console.log("E_User: "+process.env.E_USER);
     
		//Send Email
		var server  = emailjs.server.connect({
			user:    process.env.E_USER, 
			password:process.env.E_PASS, 
			host:    "smtpout.secureserver.net", 
			ssl:     true
		});
 
		// send the message and get a callback with an error or details of the message that was sent
		var message = {
		   text:    "Thanks for contacting us! We have receive your message and we will contact you as soon as possible.  We received the following information:"
					+"Name: "+ name + ", Email: "+ email[0] + ", Information Requested: "+ info, 
		   from:    "ToolSpin <info@toolspin.com>", 
		   to:      name + " <"+email+">",
		   cc:      "ToolSpin <info@toolspin.com>",
		   subject: "Information Request Confirmation",
		   attachment: 
		   [
			  {data:"<html>Thanks for contacting us! We have receive your message and we will contact you as soon as possible.<br>"
			  +"We received the following information:<br><br>"
			  +"<strong>Name: </strong>"+name+"<br>"
			  +"<strong>Email: </strong>"+email+"<br>"
			  +"<strong>Information Requested: </strong>"+info+"<br></html>", alternative:true}
		   ]
		};
	
		// send the message and get a callback with an error or details of the message that was sent
		server.send(message, function(err, message) { console.log(err || message); }); 
	});
	
	// '/uploadpekefile' - Upload File from PEKE script
	app.post('/uploadpekefile', function(req, res) {
		console.log("Received from FILE: "+JSON.stringify(req.files));
		
		//Create Time Stamp
		var currentDate = new Date().getTime() / 1000;
		var timeStamp = Math.round(currentDate);
		console.log("Time stamp "+timeStamp);
		
		//Constructs a service interface object with Bucket clasinuevos
		var s3 = new AWS.S3({ params: {Bucket: 'clasinuevos'} });

		fs.readFile(req.files.file.path, function (error, data) {
			if(error) {
				console.log("Error: "+err); // an error occurred
				res.send("error"); 
			}
			else {
				//Thumb resize
				im.resize({
					srcData: data,
					height:   155
				}, function(err, stdout, stderr){
					if (err) throw err
					fs.writeFile(__dirname+'/temp/thumb'+timeStamp+req.files.file.name, stdout,'binary', function (err) {
					  if (err) throw err;
					  console.log('Thumb saved! and resized');
					  
						fs.readFile(__dirname+'/temp/thumb'+timeStamp+req.files.file.name, function (error, data) {
							if(error) {
								console.log("Error: "+error); // an error occurred
							}
							else {
								s3.putObject({Key:'uploads/thumb'+timeStamp+req.files.file.name, Body:data, ContentType:req.files.file.type}, function (err, data) {
									if (err) {
										console.log("Error on S3: "+err); // an error occurred
									} 
									else {
										// successful response
										console.log('successfully Upload thumb file :'+data);
										
										fs.unlink(__dirname+'/temp/thumb'+timeStamp+req.files.file.name, function (err) {
										  if (err) throw err;
										  console.log('successfully deleted thumb temp file');
										});
									}
								});
							}
						});
					});
				});
				
				//Main Image Size Reduccion
				im.resize({
					srcData: data,
					height:   800
				}, function(err, stdout, stderr){
					if (err) throw err
					fs.writeFile(__dirname+'/temp/'+timeStamp+req.files.file.name, stdout,'binary', function (err) {
					  if (err) throw err;
					  console.log('It\'s saved! and resized');
					  
						fs.readFile(__dirname+'/temp/'+timeStamp+req.files.file.name, function (error, data) {
							if(error) {
								console.log("Error: "+error); // an error occurred
								res.send("error"); 
							}
							else {
								s3.putObject({Key:'uploads/'+timeStamp+req.files.file.name, Body:data, ContentType:req.files.file.type}, function (err, data) {
									if (err) {
										console.log("Error on S3: "+err); // an error occurred
										res.send("error"); 
									} 
									else {
										// successful response
										console.log('successfully Upload file :'+data);
										
										fs.unlink(__dirname+'/temp/'+timeStamp+req.files.file.name, function (err) {
										  if (err) throw err;
										  console.log('successfully deleted temp file');
										});
										
									    res.send(timeStamp+req.files.file.name); 
									}
								});
							}
						});
					});
				});
			}	
							
		});		

	});
	
	// '/uploaddropfile' - Upload File from Drop script
	app.post('/uploaddropfile', function(req, res) {
		console.log("Received from FILE: "+JSON.stringify(req.files));
		
		//Constructs a service interface object with Bucket clasinuevos
		var s3 = new AWS.S3({ params: {Bucket: 'clasinuevos'} });
		
		fs.readFile(req.files.pic.path, function (error, data) {
			if(error) {
				console.log("Error: "+err); // an error occurred
				res.send("error"); 
			}
			else {
				//Thumb resize
				im.resize({
					srcData: data,
					height:   155
				}, function(err, stdout, stderr){
					if (err) throw err
					fs.writeFile(__dirname+'/temp/thumb'+req.files.pic.name, stdout,'binary', function (err) {
					  if (err) throw err;
					  console.log('Thumbs saved! and resized');
					  
						fs.readFile(__dirname+'/temp/thumb'+req.files.pic.name, function (error, data) {
							if(error) {
								console.log("Error: "+error); // an error occurred
							}
							else {
								s3.putObject({Key:'uploads/thumb'+req.files.pic.name, Body:data, ContentType:req.files.pic.type}, function (err, data) {
									if (err) {
										console.log("Error: "+err); // an error occurred
									} 
									else {
										// successful response
										console.log('successfully Upload thumb file :'+data);
										
										fs.unlink(__dirname+'/temp/thumb'+req.files.pic.name, function (err) {
										  if (err) throw err;
										  console.log('successfully deleted thumb temp file');
										});
									}
								});
							}
						});
					});
				});
				
				//Main Image Size Reduccion
				im.resize({
					srcData: data,
					height:   800
				}, function(err, stdout, stderr){
					if (err) throw err
					fs.writeFile(__dirname+'/temp/'+req.files.pic.name, stdout,'binary', function (err) {
					  if (err) throw err;
					  console.log('It\'s saved! and resized');
					  
						fs.readFile(__dirname+'/temp/'+req.files.pic.name, function (error, data) {
							if(error) {
								console.log("Error: "+error); // an error occurred
								res.send("error"); 
							}
							else {
								s3.putObject({Key:'uploads/'+req.files.pic.name, Body:data, ContentType:req.files.pic.type}, function (err, data) {
									if (err) {
										console.log("Error: "+err); // an error occurred
										res.send("error"); 
									} 
									else {
										// successful response
										console.log('successfully Upload file :'+data);
										
										fs.unlink(__dirname+'/temp/'+req.files.pic.name, function (err) {
										  if (err) throw err;
										  console.log('successfully deleted temp file');
										});
										
										res.send(req.files.pic); 
									}
								});
							}
						});
					});
				});
			}
		}); 
	});
	
	// '/deletefiles' - Delete Pictures files from Server
	app.post('/deletefiles', function(req, res) {
		console.log("FILE Name to Delete: "+req.body.fileName);
	
		//Constructs a service interface object with Bucket clasinuevos
		var s3 = new AWS.S3({ params: {Bucket: 'clasinuevos'} });
		
		s3.deleteObject({Key:'uploads/'+req.body.fileName}, function (err, data) {
			if (err) {
				console.log("Error: "+err); // an error occurred
				res.send("error"); 
			} 
			else {
				// successful response
				console.log('successfully deleted file :'+data);
				res.send("deleted"); 
			}
		});

	});
	
	// '/record' - Store Publish Form data in Database
	app.post('/record', function(req, res) {
    	console.log("Request: "+ JSON.stringify(req.body));
    	
    	//Construct Description Message
		if(req.body.extras == "5") {
			var message = "Cargo en Clasinuevos.com por clasificado con fotos Extras.";
			if(req.body.highlight == "1" ) {
				var message = "Cargo en Clasinuevos.com por clasificado con fotos Extras y Destacado en página principal.";
			}
		}				
		else {
			var message = "Cargo en Clasinuevos.com por clasificado Destacado en página principal.";
		}
		console.log("Descripcion de Cargo: ", message);
		
    	//var to store the returned Stripe customer Id
    	var customerId = null;
    	//var to store the returned Stripe charge Id
    	var chargeId = null;
    	//var to store the returned username for new Accounts
    	var userName = null;
    	//var to store the returned New User Id
    	var userId;
    	try {
    		userId = req.user.id;
    		console.log("Found User!! : "+userId);
    	}
		catch (error) {
    		userId = null;
    		console.log("NO USER FOUND!!!!");
    	}
    	//var to store the response message to client side
    	var responseMsg = "ok";
    	
    	//Collateral Functions to Create account
		var createAccount = function(customerId) {
    		console.log("User Wants to create account");
			
			Help.createUser(req, res, customerId, sendErrorEmail, function(savedUser) {
				console.log("User Id Saved: "+ savedUser.id); 
				
				Help.storeData(req,savedUser.id,chargeId, function(savedData, error) {
					if(!error) {

						//Render Index Again to complete the Login and update the corresponding menu
						res.send('redirect');
					}
					else {
						//Send Error by email to Administration
						sendErrorEmail(error,req.body);
						
						//Send error response back to client
						res.send(savedData);
					}
				});
				
			});
		}
    	
    	//Verify if Token available. If Yes: Create Stripe Account and Charge Card
    	if(req.body.stripeToken){
			console.log("User Paid with Stripe...lets create Stripe Account");
			
			//STRIPE CREATE USER
			stripe.customers.create({
					email: req.body.emailOwner2,
					card: req.body.stripeToken,
					description: req.body.userNamePublish
				},
				function(err, customer) {
					if (err) {
						console.log(err.message);
						customerId = "error";
						res.send("Error Creating Customer");
						responseMsg = "error";
						
						//Send Error by email to Administration
						sendErrorEmail(err, req.body.stripeToken);
						
						return;
					}
					console.log("Customer id", customer.id);
					
					//STRIPE CHARGE CARD
					stripe.charges.create({
							amount: req.body.totalSale*100,
							currency: "usd",
							customer: customer.id,
							description: message
						},
						function(err, charge) {
							if (err) {
								console.log(err.message);
								chargeId = "Error";
								res.send("Error CHARGING Customer");
								responseMsg = "error";
								
								//Send Error by email to Administration
								sendErrorEmail(err, customer.id);
								return;
							}
							chargeId = charge.id;
							console.log("Charge id: ", chargeId);
							
							if(req.body.createAccount == 1) {
								createAccount(customer.id);
							}
							else {
								Help.storeData(req,userId,chargeId, function(savedData, error) {
									if(!error) {
										db.sequelize.query('SELECT "thirtyYear" FROM "Rates" WHERE "id"=(SELECT MAX("id") FROM "Rates")').success(function(rates){
											if(rates) {
												savedData.terms = Help.monthlyPayment(savedData.price,Number(rates[0].thirtyYear)/100,30);
												console.log("Monthly Payment: "+savedData.terms+" Rate: "+rates[0].thirtyYear);
												if(savedData.sqft == 0)
													savedData.sqft = "";
												if(savedData.sqft != "")
													savedData.sqft = Help.formatNumber(Number(savedData.sqft));
												savedData.price = Help.formatDollar(Number(savedData.price));
												savedData.fees = Help.formatDollar(Number(savedData.fees));
												console.log("Rendering Details with Highlights...");
												res.render("details", {layout:false, data: savedData, rate: rates[0].thirtyYears}, function(err, html){
													if(!err) {
														res.send(html);
													}
													else {
														console.log("Error Occurred: "+err);
														res.send("error");
													}
												});
											}
											else {
												console.log("Error Getting Rates");
											}
										});
									}
									else {
										//Send Error by email to Administration
										sendErrorEmail(error,req.body);
										
										//Send error response back to client
										res.send(savedData);
									}
								});
							}
						}
					);
				}
			);
		}
		else {
			if(req.body.createAccount == 1) {
				console.log("will procede to create account...");
				createAccount(null);
			}
			else {
				console.log("Going to call 'storeData' with Null...");
				
				Help.storeData(req,userId,chargeId, function(savedData, error) {
					if(!error){
						console.log("Starting render of 'Details'...layout:false...");
						db.sequelize.query('SELECT "thirtyYear" FROM "Rates" WHERE "id"=(SELECT MAX("id") FROM "Rates")').success(function(rates){
							if(rates) {
								savedData.terms = Help.monthlyPayment(savedData.price,Number(rates[0].thirtyYear)/100,30);
								console.log("Monthly Payment: "+savedData.terms+" Rate: "+rates[0].thirtyYear);
								if(savedData.sqft == 0)
									savedData.sqft = "";
								if(savedData.sqft != "")
									savedData.sqft = Help.formatNumber(Number(savedData.sqft));
								savedData.price = Help.formatDollar(Number(savedData.price));
								savedData.fees = Help.formatDollar(Number(savedData.fees));
								console.log("Rendering Details with Highlights...");
								res.render("details", {layout:false, data: savedData, rate: rates[0].thirtyYears}, function(err, html){
									if(!err)
										res.send(html);
									else
										res.send("error");
								});
							}
							else {
								console.log("Error Getting Rates");
							}
						});
					}
					else {
						//Send Error by email to Administration
						sendErrorEmail(error,req.body);
						
						//Send error response back to client
						res.send(savedData);
					}
				});
				
			}
		}
	});
	
	// '/details' - Render Details View from results
	app.post('/details', function(req, res) {
		console.log("Received from Results View: "+req.body.id);
		
		db.Classified.find(req.body.id).success(function(result) {		
			var classified_json = [];

			if(result) {
				db.sequelize.query('SELECT "thirtyYear" FROM "Rates" WHERE "id"=(SELECT MAX("id") FROM "Rates")').success(function(rates){
					if(rates) {
						result.terms = Help.monthlyPayment(result.price,Number(rates[0].thirtyYear)/100,30);
						console.log("Monthly Payment: "+result.terms+" Rate: "+rates[0].thirtyYear);
						if(result.sqft == 0)
							result.sqft = "";
						if(result.sqft != "")
							result.sqft = Help.formatNumber(Number(result.sqft));
						result.price = Help.formatDollar(Number(result.price));
						result.fees = Help.formatDollar(Number(result.fees));
						console.log("Rendering Details with Highlights...");
						res.render("details", {layout:false, data: result, rate: rates[0].thirtyYear});
					}
					else {
						console.log("Error Getting Rates");
					}
				});
			}
			else {
				res.send("<div class='text-center largemargintop'><h1>Hubo Problemas Recopilando la Información del Clasificado... <br>Trate Nuevamente!</h1></div>");
			}
		});

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
			db.Users.find({where: { username: loggedUser }}).success(function(resultUser) {		
				console.log("Resultado Data Usuario: "+JSON.stringify(resultUser));
				if(!resultUser)
					res.send("Not Logged");
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
			db.Users.find({where: { username: loggedUser }}).success(function(resultUser) {		
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
				db.Classified.count().success(function(total) {		
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

		db.Users.find(req.body.id).success(function(currentUser) {
		    if (currentUser) { 
				currentUser.updateAttributes({
			    	username: req.body.username,
			    	displayName: req.body.username,
			    	email: req.body.email
				}).success(function() {
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

		db.Users.find(req.body.id).success(function(currentUser) {
		    if (currentUser) { 
		    	hash(req.body.password, function (err, salt, hash) {
					if (err) throw err;
					
					currentUser.updateAttributes({
						password: hash,
						salt: salt,
						hash: hash
					}).success(function() {
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
	
	// '/changeuserpic' - Render Details View from results
	app.post('/changeuserpic', function(req, res) {
		console.log("Received Picture Name: "+req.body.pic);

		db.Users.find(req.body.id).success(function(currentUser) {
		    if (currentUser) { 
		    
				currentUser.updateAttributes({
					photos: req.body.pic
				}).success(function() {
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
	
	// '/geteditdata' - Render Details View from results
	app.post('/geteditdata', function(req, res) {
		console.log("Received from Results View: "+req.body.id);
		
		db.Classified.find(req.body.id).success(function(result) {		
			var classified_json = [];

			if(result) {
				result.price = Help.formatDollar(Number(result.price));
				result.fees = Help.formatDollar(Number(result.fees));
				console.log("Rendering Edit with Highlights...");
				res.render("edit", {layout:false, data: result});
			}
			else {
				res.send("<div class='text-center largemargintop'><h1>Hubo Problemas Recopilando la Información del Clasificado... <br>Trate Nuevamente!</h1></div>");
			}
		});
	});
	
	// '/updatedeletephoto' - Render Details View from results
	app.post('/updatedeletephoto', function(req, res) {
		console.log("Received id: "+req.body.id+"PicName: "+req.body.photoName);
		
		db.Classified.find(req.body.id).success(function(currentClassified) {
		    if (currentClassified) { 
		    
		    	var updateAttr;
		    	if(currentClassified.photo1 == req.body.photoName) {
					updateAttr = {
						photo1: null
					};
				}
				if(currentClassified.photo2 == req.body.photoName) {
					updateAttr = {
						photo2: null
					};
				}
				if(currentClassified.photo3 == req.body.photoName) {
					updateAttr = {
						photo3: null
					};
				}
				if(currentClassified.photo4 == req.body.photoName) {
					updateAttr = {
						photo4: null
					};
				}
				if(currentClassified.photo5 == req.body.photoName) {
					updateAttr = {
						photo5: null
					};
				}
					
		    
				currentClassified.updateAttributes(updateAttr).success(function() {
					console.log("Photo Deleted and UPDATED as Null");
					res.send("done");
				}).error(function(error) {
					res.send(error);
				});
				
		    }
		    else {
		    	res.send("Error Borrando la Foto");
		    }
		}).error(function(error) {
			res.send("Error Borrando la Foto");
		});

	});
	
	// '/updateNewPhotos' - Render Details View from results
	app.post('/updateNewPhotos', function(req, res) {
		console.log("Received id: "+req.body.id+" PicName: "+req.body.photosArray[0]);
		
		db.Classified.find(req.body.id).success(function(currentClassified) {
		    if (currentClassified) { 
		    
				var	updateAttr = {
						photo1: req.body.photosArray[0],
						photo2: req.body.photosArray[1],
						photo3: req.body.photosArray[2],
						photo4: req.body.photosArray[3],
						photo5: req.body.photosArray[4]
					};

				currentClassified.updateAttributes(updateAttr).success(function() {
					console.log("Photo Changed and UPDATED");
					res.send("done");
				}).error(function(error) {
					res.send(error);
				});
		    }
		    else {
		    	res.send("Error Actualizando la Foto");
		    }
		}).error(function(error) {
			res.send("Error Actualizando la Foto");
		});
	});
	
	// '/deleteclassified' - Render Details View from results
	app.post('/deleteclassified', function(req, res) {
		console.log("Received from Delete Command View - Id: "+req.body.id);
		
		db.Classified.find(req.body.id).success(function(classifiedToDelete) {		

			if(classifiedToDelete) {
				console.log("Found Classified to Delete...");
				classifiedToDelete.destroy().success(function() {
					console.log("Classified GOne...");
					res.send("done");
				}).error(function(error) {
					res.send("Error Retrieving Data to Delete");
				});
			}
			else {
				res.send("Error Retrieving Data to Delete");
			}
		}).error(function(error) {
			res.send("Error Retrieving Data to Delete");
		});

	});
	
	// '/updateRecord' - Store Publish Form data in Database
	app.post('/updateRecord', function(req, res) {
    	console.log("Request to UPDATE: "+ JSON.stringify(req.body));
    	
    	//Construct Description Message
		if(req.body.extras == "5") {
			var message = "Cargo en Clasinuevos.com por clasificado con fotos Extras.";
			if(req.body.highlight == "1" ) {
				var message = "Cargo en Clasinuevos.com por clasificado con fotos Extras y Destacado en página principal.";
			}
		}				
		else {
			var message = "Cargo en Clasinuevos.com por clasificado Destacado en página principal.";
		}
		console.log("Descripcion de Cargo: ", message);
		
    	//var to store the returned Stripe customer Id
    	var customerId = null;
    	//var to store the returned Stripe charge Id
    	var chargeId = null;
    	//var to store the returned username for new Accounts
    	var userName = null;
    	//var to store the returned New User Id
    	var userId;
    	try {
    		userId = req.user.id;
    		console.log("Found User!! : "+userId);
    	}
		catch (error) {
    		userId = null;
    		console.log("NO USER FOUND!!!!");
    	}
    	
    	//var to store the response message to client side
    	var responseMsg = "ok";
    	
    	//Verify if Token available. If Yes: Create Stripe Account and Charge Card
    	if(req.body.stripeToken){
			console.log("User Paid with Stripe...lets create Stripe Account");
			
			if(userId){
				db.Users.find(userId).success(function(person) {
					if(person.customerId) {
						
						//STRIPE CHARGE CARD
						stripe.charges.create({
							amount: req.body.totalSale*100,
							currency: "usd",
							customer: person.customerId,
							description: message
						},
						function(err, charge) {
							if (err) {
								console.log(err.message);
								chargeId = "Error";
								res.send("Error CHARGING Customer");
								responseMsg = "error";
								
								//Send Error by email to Administration
								sendErrorEmail(err, customer.id);
								return;
							}
							chargeId = charge.id;
							console.log("Charge id: ", chargeId);
							
							Help.updateData(req,userId,chargeId, function(savedData, error) {
								if(!error)
									res.send(savedData);
								else {
									//Send Error by email to Administration
									sendErrorEmail(error,req.body);
									
									//Send error response back to client
									res.send(error);
								}
							});
						});
					}
					else {
					
						//STRIPE CREATE USER
						stripe.customers.create({
								email: req.body.emailOwner2,
								card: req.body.stripeToken,
								description: req.body.userNamePublish
							},
							function(err, customer) {
								if (err) {
									console.log(err.message);
									customerId = "error";
									res.send("Error Creating Customer");
									responseMsg = "error";
						
									//Send Error by email to Administration
									sendErrorEmail(err, req.body.stripeToken);
						
									return;
								}
								console.log("Customer id", customer.id);
								
								//STRIPE CHARGE CARD
								stripe.charges.create({
									amount: req.body.totalSale*100,
									currency: "usd",
									customer: customer.id,
									description: message
								},
								function(err, charge) {
									if (err) {
										console.log(err.message);
										chargeId = "Error";
										res.send("Error CHARGING Customer");
										responseMsg = "error";
								
										//Send Error by email to Administration
										sendErrorEmail(err, customer.id);
										return;
									}
									chargeId = charge.id;
									console.log("Charge id: ", chargeId);

									Help.updateData(req,userId,chargeId, function(savedData, error) {
										if(!error)
											res.send(savedData);
										else {
											//Send Error by email to Administration
											sendErrorEmail(error,req.body);
									
											//Send error response back to client
											res.send(error);
										}
									});
								});
							}
						);
					}
				});
			}
		}
		else {

			console.log("Going to call 'storeData' with Null...");
		
			Help.updateData(req,userId,chargeId, function(savedData, error) {
				if(!error){
					res.send(savedData);
				}
				else {
					//Send Error by email to Administration
					sendErrorEmail(error,req.body);
				
					//Send error response back to client
					res.send(error);
				}
			});
		
		}
	});
	
	// '/extent' - Store Publish Form data in Database
	app.post('/extent', function(req, res) {
		console.log("Received id: "+req.body.id);
		
		//Calculate Current Date + 30 days
		var endDate = new Date();
		endDate.setDate(endDate.getDate() + 30);
		
		db.Classified.find(req.body.id).success(function(currentClassified) {
		    if (currentClassified) { 
		    
				var	updateAttr = {
						endDate: endDate,
						visible: 1
					};

				currentClassified.updateAttributes(updateAttr).success(function() {
					console.log("Classified Date Extended");
					res.send("done");
				}).error(function(error) {
					res.send(error);
				});
		    }
		    else {
		    	res.send("Error Extendiento el Clasificado");
		    }
		}).error(function(error) {
			res.send("Error Extendiento el Clasificado");
		});
		
	});
	
	// '/busqueda' - Render Details View from results
	app.post('/busqueda', function(req, res) {
		console.log("Received from Results Search: "+JSON.stringify(req.body));
		console.log("Was Sort Only? : " +req.body.sortOnly); 
		
		//Variable to set the 'Where' Clause in the query
		var query, highlightVal;
		
		//Prepare Sortin option:'Ordenar'
		var formattedSort;
		switch (req.body.sort) {
			case "destacados":
				formattedSort = 'highlight ASC, "createdAt" DESC';
				break;
			case "precioMinMax":
				formattedSort = "price ASC";
				break;
			case "precioMaxMin":
				formattedSort = "price DESC";
				break;
			case "fecha":
				formattedSort = "createdAt DESC";
				break;
			case "direccion":
				formattedSort = "address DESC";
				break;
			case "cuartos":
				formattedSort = "bedrooms DESC";
				break;      
			case "banos":
				formattedSort = "bathrooms DESC";
				break;   
			default:
				formattedSort = "highlight ASC";
				break;
		}
		
		if(req.body.sortOnly) {
			highlightVal = "1";
			query = "(highlight = '1')";
		}
		else {
			//Prepare numeric values for search:
			// Cuartos
			var cuartosMin, cuartosMax;
			if(req.body.cuartos == "" || req.body.cuartos == "all") {
				cuartosMin=0;
				cuartosMax=100;  //Very big to be sure to cover all possibilities !!!! - Hack!!??!!
			}
			else{
				cuartosMin = (req.body.cuartos <= 1) ? 0 : (parseInt(req.body.cuartos) - 1);
				cuartosMax = (req.body.cuartos <= 0) ? 1 : (parseInt(req.body.cuartos) + 1);
			}
		
			// Banos
			var banosMin, banosMax;
			if(req.body.banos == "" || req.body.banos == "all") {
				banosMin=0;
				banosMax=100;  //Very big to be sure to cover all possibilities !!!! - Hack!!??!!
			}
			else{
				banosMin = (req.body.banos <= 1) ? 0 : (parseInt(req.body.banos) - 1);
				banosMax = (req.body.banos <= 0) ? 1 : (parseInt(req.body.banos) + 1);
			}
		
			// Area
			var areaMin, areaMax;
			if(req.body.area == "" || req.body.area == "all") {
				areaMin=0;
				areaMax=1000000;  //Very big to be sure to cover all possibilities !!!! - Hack!!??!!
			}
			else{
				areaMin = (req.body.area <= 250) ? 0 : (parseInt(req.body.area) - 250);
				areaMax = (req.body.area <= 0) ? 250 : (parseInt(req.body.area) + 250);
			}
		
			// Precio Min
			var precioMin;
			if(req.body.min == "" ) {
				precioMin=0;
			}
			else{
				precioMin = (req.body.min <= 0) ? 0 : req.body.min;
			}
		
			// Precio Max
			var precioMax;
			if(req.body.max == "" ) {
				precioMax=100000000;
			}
			else{
				precioMax = (req.body.max <= 0) ? 0 : req.body.max;
			}
			
			// Propiedad
			var propiedad = req.body.propiedad;
			if(req.body.propiedad == "" || req.body.propiedad == "all")
				propiedad = "";
				
			// Town
			var town = req.body.town;
			if(req.body.town == "" || req.body.town == "all")
				town = "";
			
			// Select Query to call
			if (req.body.address == "" && town != ""  && propiedad != "") {
				// Do Query with - No Address		
				console.log("Call to Query with No Address");
				query = ['("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("town" = ?) AND ("property" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),town,propiedad,req.body.switch];
			} else if (req.body.address == "" && propiedad == "" && town != "") {
				// Do Query with - No Address and No Property
				console.log("Call to Query with No Address and No Property");
				query = ['("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("town" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),town,req.body.switch];
			} else if (req.body.address == "" && propiedad == "" && town == "") {
				// Do Query with - No Address and No Property and No Town
				console.log("Call to Query with No Address and No Property and No Town");
				query = ['("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),req.body.switch];
			} else if (req.body.address != "" && town != "" && propiedad == "") {
				// Do Query with - No Property
				console.log("Call to Query with No Property");
				var wcAddress = "%"+req.body.address+"%";
				query = ['(UPPER("address") LIKE UPPER(?) OR UPPER("neighborhood") LIKE UPPER(?)) AND ("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("town" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',wcAddress,wcAddress,String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),town,req.body.switch];
			} else if (req.body.address != "" && propiedad != "" && town == "") {
				// Do Query with - No Town
				console.log("Call to Query with No Town");
				var wcAddress = "%"+req.body.address+"%";
				query = ['(UPPER("address") LIKE UPPER(?) OR UPPER("neighborhood") LIKE UPPER(?)) AND ("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("property" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',wcAddress,wcAddress,String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),propiedad,req.body.switch];
			} else if (req.body.address != "" && propiedad == "" && town == "") {
				// Do Query with - No Town No Property
				console.log("Call to Query with No Town & No Property");
				var wcAddress = "%"+req.body.address+"%";
				query = ['(UPPER("address") LIKE UPPER(?) OR UPPER("neighborhood") LIKE UPPER(?)) AND ("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',wcAddress,wcAddress,String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),req.body.switch];
			} else if (req.body.address == "" && propiedad != "" && town == "") {
				// Do Query with - No Town No Address
				console.log("Call to Query with No Town & No Address");
				query = ['("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("property" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),propiedad,req.body.switch];
			}
			else {
				// Do search with all fields populated.
				console.log("Call to Query All");
				var wcAddress = "%"+req.body.address+"%";
				query = ['(UPPER("address") LIKE UPPER(?) OR UPPER("neighborhood") LIKE UPPER(?)) AND ("bedrooms" BETWEEN ? AND ?) AND ("bathrooms" BETWEEN ? AND ?) AND ("price" BETWEEN ? AND ?) AND ("sqft" BETWEEN ? AND ?) AND ("town" = ?) AND ("property" = ?) AND ("sellOrRent" = ?) AND ("visible" > 0)',wcAddress,wcAddress,String(cuartosMin),String(cuartosMax),String(banosMin),String(banosMax),String(precioMin),String(precioMax),String(areaMin),String(areaMax),town,propiedad,req.body.switch];
			}
		}
		db.Classified.findAll({where: query, order:formattedSort, offset: req.body.offset}).success(function(result) {		
			var classified_json = [];		
			var counter = 0;
			
			if(result) {
				db.sequelize.query('SELECT "thirtyYear" FROM "Rates" WHERE "id"=(SELECT MAX("id") FROM "Rates")').success(function(rates){
					if(rates) {
						result.forEach(function(classified) {
							if(counter < 10) {
								classified.terms = Help.monthlyPayment(classified.price,Number(rates[0].thirtyYear)/100,30);
								console.log("Monthly Payment: "+classified.terms+"Rate: "+rates[0].thirtyYear);
								if(classified.sqft == 0)
									classified.sqft = "";
								if(classified.sqft != "")
									classified.sqft = Help.formatNumber(Number(classified.sqft));
								classified.price = Help.formatDollar(Number(classified.price));
								classified.fees = Help.formatDollar(Number(classified.fees));
								classified_json.push(classified);
							}
							counter++;
						});				
	
						console.log("Count: "+counter);
						console.log("Array Length: "+classified_json.length);
	
						console.log("Rendering Results with Highlights...");
						res.render("results", {layout:false, dataRows:classified_json, numberRows:counter+parseInt(req.body.offset), offset: req.body.offset, resultclass: "busqueda", width:req.body.screenSize, rate:rates[0].thirtyYear}, function(err, html){
							if(!err){
								var returnData = {
									html:html,
									raw:classified_json
								}
								res.send(returnData);
							}
							else {
								var returnData = {
									html:"error",
									raw:classified_json
								}
								res.send(returnData);
							}
						});
					}
					else {
						console.log("Error Getting Rate");
					}
				});
			}
			else {
				var returnData = {
					html:"<div class='text-center largemargintop'><h1>No Hay Clasificados...</h1></div>",
					raw:null
				}
				res.send(returnData);			
			}
			
		}).error(function(error) {
		  console.log("Database Error: "+error);
		});
		
	});
	
	// '/destacados' - Render Details View from results
	app.post('/destacados', function(req, res) {
		
		//Prepare Sortin option:'Ordenar'
		var formattedOrder;
				console.log("This is the Sort Sent: "+req.body.order);

		switch (req.body.order) {
			case "destacados":
				formattedOrder = 'highlight ASC, "createdAt" DESC';
				break;
			case "precioMinMax":
				formattedOrder = "price ASC";
				break;
			case "precioMaxMin":
				formattedOrder = "price DESC";
				break;
			case "fecha":
				formattedOrder = "createdAt DESC";
				break;
			case "direccion":
				formattedOrder = "address DESC";
				break;
			case "cuartos":
				formattedOrder = "bedrooms DESC";
				break;      
			case "banos":
				formattedOrder = "bathrooms DESC";
				break;   
			default:
				formattedOrder = "highlight ASC";
				break;
		}
		
		console.log("This is the Sort Changed: "+formattedOrder);
		db.Classified.findAndCountAll({where: { highlight: '1', visible: {gt:0} }, order: formattedOrder, offset: req.body.offset, limit: 10}).success(function(result) {		
			var classified_json = [];

			if(result.count > 0) {
				db.sequelize.query('SELECT "thirtyYear" FROM "Rates" WHERE "id"=(SELECT MAX("id") FROM "Rates")').success(function(rates){
					if(rates) {
						console.log("Found Rate: "+rates[0].thirtyYear);
						result.rows.forEach(function(classified) {
							classified.terms = Help.monthlyPayment(classified.price,Number(rates[0].thirtyYear)/100,30);
							console.log("Monthly Payment: "+classified.terms+"Rate: "+rates[0].thirtyYear);
							if(classified.sqft == 0)
								classified.sqft = "";
							if(classified.sqft != "")
								classified.sqft = Help.formatNumber(Number(classified.sqft));
							classified.price = Help.formatDollar(Number(classified.price));
							classified.fees = Help.formatDollar(Number(classified.fees));
							classified_json.push(classified);				
						});
				
						//res.send(classified_json);
						console.log("Rendering Results with Highlights...");
						res.render("results", {layout:false, dataRows:classified_json, numberRows:result.count, offset: req.body.offset, resultclass: "destacados", width:req.body.screenSize, rate:rates[0].thirtyYear}, function(err, html){
							if(!err){
								var returnData = {
									html:html,
									raw:classified_json
								}
								res.send(returnData);
							}
							else {
								var returnData = {
									html:"error",
									raw:classified_json
								}
								res.send(returnData);
							}
						});
					}
					else {
						console.log("Error getting Rates");
					}
				});
			}
			else {
				var returnData = {
					html:"<div class='text-center largemargintop'><h1>No Hay Clasificados...</h1></div>",
					raw:null
				}
				res.send(returnData);
			}
		});
		
	});
	
	// '/adcontact' - Send Email from Contact From
	app.post('/adcontact', function(req, res) {
		var name = req.body.name;
		var email = req.body.email;   
		console.log("Email: "+email); 
		var info = req.body.info;
		var callMe = req.body.callMe;
		var tel = req.body.telephone;
 
		//Send Email
		var server  = emailjs.server.connect({
			user:    process.env.E_USER, 
			password:process.env.E_PASS, 
			host:    "e350.websitewelcome.com", 
			ssl:     true
		});

		// send the message and get a callback with an error or details of the message that was sent
		var message = {
		   text:    "Gracias por contactarnos! Estamos procesando su pedido y nos comunicaremos con usted lo antes posible.  Recibimos la siguiente información:"
					+"Nombre: "+ name + ", Email: "+ email + ", Información Solicitada: "+ info + "Telefono: "+ tel, 
		   from:    "ClasiNuevos <info@clasinuevos.com>", 
		   to:      name + " <"+email+">",
		   cc:      "ClasiNuevos <info@clasinuevos.com>",
		   subject: "Confirmación de Solicitud de Información",
		   attachment: 
		   [
			  {data:"<html>Gracias por contactarnos! Estamos procesando su pedido y nos comunicaremos con usted lo antes posible.<br>"
			  +"Recibimos la siguiente información:<br><br>"
			  +"<strong>Nombre: </strong>"+name+"<br>"
			  +"<strong>Email: </strong>"+email+"<br>"
			  +"<strong>Información Solicitada: </strong>"+info+"<br>"
			  +"<strong>Teléfono: </strong>"+tel+"<br></html>", alternative:true}
		   ]
		};

		// send the message and get a callback with an error or details of the message that was sent
		server.send(message, function(err, message) { console.log(err || message); }); 
		
		res.send("done");
	});
	
	// '/contactSeller' - Send Email from Contact From
	app.post('/contactSeller', function(req, res) {
	
		var sellerName, sellerEmail, address;
		var name = req.body.name;
		var email = req.body.email;    
		var info = req.body.info;
		
		console.log("Name: "+name);
		console.log("Email: "+email);
		console.log("info: "+info);
		
		db.Classified.find(req.body.id).success(function(currentClassified) {
		    if (currentClassified) { 
		    	if(currentClassified.ownerOrRealtor == "Realtor") {
		    		sellerName = currentClassified.fullNameRealtor;
		    		sellerEmail = currentClassified.emailRealtor;
		    	}
		    	else {
		    		sellerName = currentClassified.fullNameOwner;
		    		sellerEmail = currentClassified.emailOwner;
		    	}
		    	
		    	address = currentClassified.neighborhood + ", " + currentClassified.address;
		    	console.log("Seller Email: "+sellerEmail);
		    	console.log("Seller Address: "+address);
				
				//Send Email
				var server  = emailjs.server.connect({
					user:    process.env.E_USER, 
					password:process.env.E_PASS, 
					host:    "e350.websitewelcome.com", 
					ssl:     true,
					port: 465
				});
				

				// send the message and get a callback with an error or details of the message that was sent
				var message = {
				   text:    "Mi Nombre es: "+ name + "Le Escribo Relacionado a la Propiedad: "+ address + "Mensaje: " + info, 
				   from:    name+" <"+email+">", 
				   to:      sellerName+" <"+sellerEmail+">",
				   subject: "Solicitud de Información de Clasificado",
				   attachment: 
				   [
					  {data:"<html>Mi Nombre es: "+ name +".<br>"
					  +"Le Escribo Relacionado a la Propiedad: "+ address +"<br>"
					  +"Mensaje: "+ info+"<br></html>", alternative:true}
				   ]
				};
				console.log("message: "+JSON.stringify(message));
		
				// send the message and get a callback with an error or details of the message that was sent
				server.send(message, function(err, message) { console.log(err || message); }); 
		
				res.send("done");
		    }
		    else {
		    	res.send("Error encontrando Clasificado");
		    }
		}).error(function(error) {
			res.send("Error encontrando el Clasificado");
		});
 
		
	});
	
	// '/calc' - Render Details View from results
	app.post('/calc', function(req, res) {
		console.log("Rendering Calculator...");
		res.render("calc", {layout:false, price:req.body.price, rate:req.body.rate});
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