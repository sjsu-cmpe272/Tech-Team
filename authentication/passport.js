var LocalStrategy = require('passport-local').Strategy
  , hash = require('../pass').hash;

module.exports = function (passport, db) {
	
	// Serialize
	passport.serializeUser(function(user, done) {
		console.log("Serializing!");
		done(null, user);
	});
	
	// Deserialize 
	passport.deserializeUser(function(user, done) {
				console.log("Deserializing user: "+user);
				done(null, user);
	});

	// Local-Strategy
	passport.use(new LocalStrategy(function(username, password, done){
		console.log("I'm at Local Strategy Beginning");
		var Users = db.Users;
        console.log("Assigned variables to User...");

        Users.find({where: {username: username}}).then(function(user){
			console.log("Found User by username - in local strategy");
			if(!user){
				console.log("INCORRECT Username!");
				return done(null, false, { message: 'Incorrect username.' });
			}
			else {
				console.log("Username Correct!");
			} 

			hash( password, user.salt, function (err, hash) {
				if (err) { return done(err); }
				if (hash != user.hash) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				else {
					console.log("PassWord and UserName Correct");
					return done(null, user);
				}
			});
		}).error(function(err) {
					console.log(err + ":Error looking for Username. ");
					return done(err); 
		});
	}));
}