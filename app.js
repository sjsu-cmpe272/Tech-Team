/*
    Main file to start NodeJS server and distribute routes and posts.
 */
var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , async   = require('async')
  , db      = require('./models')
  , ROUTES  = require('./routes')
  , passport = require('passport')
  , Help = require('./helper/help.js');

var app = express();

// Register ejs as .html. - For templating of web pages.
app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('port', process.env.PORT || 8080);

// Middlewares:
app.configure(function(){
	//  ***** Remove comments for production *****
	/*
	app.use(function(req, res, next) {
		if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
			res.redirect('https://' + req.get('Host') + req.url);
		}
		else
			next();
	});
	*/
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
	app.use(express.cookieParser());
	app.use(express.bodyParser({  limit: '5mb' }));
	app.use(express.session({secret:process.env.SECRET}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

// Path to authentication files and routes
require('./authentication/passport')(passport, global.db)

// Get Routes
for(var ii in ROUTES) {
    app.get(ROUTES[ii].path, ROUTES[ii].fn);
}

// Handle POST
require('./posts/posts')(app, global.db, passport)

// Code to Erase Tables
/*
db.Users.drop(); console.log("USER Tables DROPPED!!!!");
db.Classified.drop(); console.log("Classified Tables DROPPED!!!!");

db.Classified.find(8).success(function(classifiedToDelete) {
	if(classifiedToDelete) {
		classifiedToDelete.destroy().success(function() {
			console.log("Classified GOne...");
		});
	}
});
*/

/*
    Try to connect to database first.  If possible, the start server
    and other async functions as needed.
 */
global.db.sequelize.sync().complete(function(err) {
	if (err) {
		throw err;
	} else {
		var DB_REFRESH_INTERVAL_SECONDS = 86400;
		async.parallel([
			function() {
				// Begin listening for HTTP requests to Express app
				http.createServer(app).listen(app.get('port'), function() {
					console.log("Listening on " + app.get('port'));
				});
			},
			function() {
				// Mirror the orders before booting up the server
				console.log("Initial Call for Rates at " + new Date());
				global.db.Rates.getRates();
				
				setInterval(function() {
					console.log("Get Current Rates from Zillow on: " + new Date());
					global.db.Rates.getRates();
				}, (DB_REFRESH_INTERVAL_SECONDS+300)*1000);
			},
			function() {
				// Flag Classified of more that 30 days
				console.log("Initial Flaggin of 30Days Classifieds: " + new Date());
				Help.flagDue(function(result){
					console.log("Check Dates: "+result);
				});
				
				setInterval(function() {
					console.log("Daily Flagging of 30Days Classifieds: " + new Date());
					Help.flagDue(function(result){
						console.log("Check Dates: "+result);
					});
				}, DB_REFRESH_INTERVAL_SECONDS*1000);
			}
		]);
	}
});