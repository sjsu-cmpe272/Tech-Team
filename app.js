/*
    Main file to start NodeJS server and distribute routes and posts.
 */
var express = require('express')
    , favicon = require('serve-favicon')
    , http = require('http')
    , path = require('path')
    , async = require('async')
    , ROUTES = require('./routes');

var app = express();

// Register ejs as .html. - For templating of web pages.
app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('port', process.env.PORT || 8080);

// Middlewares:
app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Get Routes
for(var ii in ROUTES) {
    app.get(ROUTES[ii].path, ROUTES[ii].fn);
}

// Handle POST
require('./posts/posts')(app)

async.parallel([
    function () {
        // Begin listening for HTTP requests to Express app
        http.createServer(app).listen(app.get('port'), function () {
            console.log("Listening on " + app.get('port'));
        });
    }
]);
