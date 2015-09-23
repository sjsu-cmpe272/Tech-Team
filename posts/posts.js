/*
    Handle Posts made to the server
*/
var OAuth = require('oauth');

module.exports = function(app){

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