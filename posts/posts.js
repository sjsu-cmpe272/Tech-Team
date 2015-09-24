/*
    Handle Posts made to the server
*/
var OAuth = require('oauth');

module.exports = function(app) {

    // '/tweetStatus' - Post to Twitter - By Carlos Martinez
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
            {"status": req.body.status},
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/friendList' - Get from Twitter - By Carlos Martinez
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
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/searchTweets  Get (Search) on Twitter - Snehal Golhar
    app.post('/searchTweet', function (req, res) {
        var encodedText = encodeURIComponent(req.body.searchWord);
        console.log("Search Text: " + encodedText);
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
            'https://api.twitter.com/1.1/search/tweets.json?q=' + encodedText,
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/getfollowers  Get (Search) on Twitter - Snehal Golhar
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
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(resultfollowersResponse));
                    res.send(resultfollowersResponse);
                }
            });
    });

    // '/friendsIds' - Get from Twitter - By Shalini Negi
    app.post('/friendsIds', function (req, res) {
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
            'https://api.twitter.com/1.1/friends/ids.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/followersIds' - Post to Twitter - By Shalini Negi
    app.post('/followersIds', function (req, res) {
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
            'https://api.twitter.com/1.1/followers/ids.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/recentStatus' - Post to Twitter - By Monisha Dash
    app.post('/recentStatus', function (req, res) {
        var user_name1 = encodeURIComponent(req.body.timeline_newuser);
        console.log("New User" + user_name1);

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
            'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + user_name1,
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/createNewFollower' - Post to Twitter - By Monisha Dash
    app.post('/createNewFollower', function (req, res) {
        var screen_name = encodeURIComponent(req.body.nameToRemove);

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
            'https://api.twitter.com/1.1/friendships/create.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            {"screen_name":req.body.nameToRemove},
            function (e, data) {
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/removeFriend' - Post to Twitter - By Khine Oo (Clara)
    app.post('/removeFriend', function(req,res){
        //get screen_name user entered
        var encoded_friendname=encodeURIComponent(req.body.friendName);

        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.post('https://api.twitter.com/1.1/friendships/destroy.json?',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            {"screen_name":req.body.friendName},
            function(e, data){
                if (e) {
                    res.send("error");
                } else {
                    console.log(require('util').inspect(data));
                    res.send(data);
                }
            });
    });

    // '/suggestionList' - Post to Twitter - By Khine Oo (Clara)
    app.post('/suggestionList', function(req,res){
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.get('https://api.twitter.com/1.1/users/suggestions.json',
            process.env.TWITTER_USER_TOKEN, //test user token
            process.env.TWITTER_USER_SECRET, //test user secret
            function (e, data) {
                if (e) console.error(e);
                console.log(require('util').inspect(data));
                res.send(data);
            });
    });
};