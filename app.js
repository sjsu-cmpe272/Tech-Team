/*
    Main file to start NodeJS server and distribute routes and posts.
 */
var express = require('express')
    , favicon = require('serve-favicon')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , session = require('express-session')
    , serveStatic = require('serve-static')
    , util = require('util')
    , http = require('http')
    , path = require('path')
    , db = require('./models')
    , async = require('async')
    , ROUTES = require('./routes')
    , passport = require('passport')
    , Help = require('./helper/help.js');

var app = express();

// Register ejs as .html. - For templating of web pages.
app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('port', process.env.PORT || 8080);

/*
//  ***** Remove comments for production for us of https *****

 app.use(function(req, res, next) {
    if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
    }
    else
        next();
 });
*/

// Middlewares:
app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(require('express-session')({ secret:process.env.SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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
*/

global.db.sequelize.sync().then(function(err) {
    async.parallel([
        function () {
            // Begin listening for HTTP requests to Express app
            console.log("Will Listen on Port...");
            http.createServer(app).listen(app.get('port'), function () {
                console.log("Listening on " + app.get('port'));
            });
        }
    ]);
});
