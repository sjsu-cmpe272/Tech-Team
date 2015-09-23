/*
    Handle Posts made to the server
*/
var Help = require('../helper/help.js')
    , async = require('async')
    , OAuth = require('oauth');

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

    // '/tweetStatus' - Post to Twitter - By Carlos
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

    // '/friendList' - Get from Twitter - By Carlos
    app.post('/friendList', function (req, res) {
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.get(
            'https://api.twitter.com/1.1/friends/list.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) console.error(e);
                console.log(require('util').inspect(data));
                res.send(data);
            });
    });

    // '/searchTweets  Get (Search) on Twitter - Snehal
    app.post('/searchTweet', function (req, res) {
        var encodedText = encodeURIComponent(req.body.searchWord);
        console.log("Search Text: "+encodedText);
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.get(
            'https://api.twitter.com/1.1/search/tweets.json?q='+encodedText,
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data, result) {
                console.log("In return function...Search");
                //if (e) console.error(e);
                console.log(require('util').inspect(data));
                res.send(data);
            });
    });

    // '/getfollowers  Get (Search) on Twitter - Snehal
    app.post('/getfollowers', function (req, res) {
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.get(
            'https://api.twitter.com/1.1/followers/list.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, resultfollowersResponse) {
                if (e) console.error(e);
                console.log(require('util').inspect(resultfollowersResponse));
                res.send(resultfollowersResponse);
            });
    });
}