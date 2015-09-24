/* GLOBAL VARIABLES 
------------------------------------------------ */
// NONE

/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){

    // Function to Change Bkg Height and Bottom to Fit the Project Without changing CSS File
    changeBackgroundHeight();

	/* Show Background image - Not Visible by Default
	-------------------------------------------- */
	$("#myCarousel").css("visibility", "visible");

    /* Code to interact between UI and Server for Implementation of Twitter APIs
     ===========================================================================*/

    /* -- Twitter API: "POST statuses/update"  -  By Carlos Martinez
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#tweetBtn").click(function (e) {
        // Prevent the default action of submitting the form to the server
        e.preventDefault();

        // Erase message to get it ready for next tweet.
        $("#tweetMessage").html("");

        // Capture the value of the text field - "message"
        var message = $("#status").val();

        // Execute Posting only if the validation of the Form was successful
        if($("#tweetForm").validationEngine('validate')) {
            // http POST communication with the NODEJS Server - Sending Captured Text
            $.post('/tweetStatus', {status: message}, function (data) {

                // Make the result area visible
                $('#twitterBox').removeClass("hidden");

                // Verify if the returned data contains the message "error"
                if (data == "error") {
                    // Insert Error Message in Division
                    $('#tweetMessage').html("<p>Tweet was NOT possible! Try Again</p>");
                }
                else {
                    // parse JSON data to variable
                    var tweetedMessage = JSON.parse(data);

                    // Insert Result Message in Division
                    $('#tweetMessage').html("<p>The following message was Tweeted: <br><strong>" + tweetedMessage.text + "</strong></p>");
                    // Erase Text Field to get it ready for next tweet.
                    $("#status").val("");
                }
            });
        }
    });

    /* -- Twitter API: "GET Friend/list"  -  By Carlos Martinez
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getFriendListBtn").click(function() {

        // Variable to get friend list from twitter
        var friendList;

        // http POST communication with the NODEJS Server
        $.post('/friendList', function(data) {

            // Make the result area visible
            $('#friendListBox').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if(data == "error") {
                // Insert Error Message in Division
                $('#friendListMessage').html("<p>Could Not Get Friend List! Try Again</p>");
            }
            else {
                // parse JSON data to variable
                friendList = JSON.parse(data);

                // Clear message area (Division) from previous messages
                $('#friendListMessage').html("");

                // Variable to count users and add it as the List id
                var a = 1;

                // Go through each object (user) in the array to get the "name"
                $.each(friendList.users, function() {
                    // Get each friend name and add it to the message area as item on list
                    $('#friendListMessage').append(
                        "<li id='" + a + "'>" + this.name + "</li>"
                    );
                    // Increment variable by 1
                    a++;
                });
            }
        });
    });

    /* -- Twitter API: "GET Search/Tweets"  -  By Snehal Golhar
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#searchBtn").click(function (e) {
        // Prevent the default action of submitting the form to the server
        e.preventDefault();

        // Variable to get search results from twitter
        var searchResults;

        // Capture the value of the text field - "search text"
        var searchword = $("#searchkey").val();

        // Execute Posting only if the validation of the Form was successful
        if($("#searchtweetForm").validationEngine('validate')) {
            // http POST communication with the NODEJS Server - Sending Captured Text
            $.post('/searchTweet', {searchWord: searchword}, function (searchTweetResponse) {

                // Make the result area visible
                $('#searchBox').removeClass("hidden");

                // Verify if the returned data contains the message "error"
                if (searchTweetResponse == "error") {
                    // Insert Error Message in Division
                    $('#searchResultsMessage').html("<p>No Result for your search </p>");
                }
                else {
                    // parse JSON data to variable
                    searchResults = JSON.parse(searchTweetResponse);
                    console.log(searchResults);
                    // Clear message area (Division) from previous messages
                    $('#searchResultsMessage').html("");

                    // Variable to count users and add it as the List id
                    var a = 1;

                    // Go through each object (statuses) in the array to get the "user name" and "text"
                    $.each(searchResults.statuses, function () {
                        // Get Who Tweeted name and the message tweeted; then add (append) to list as HTML
                        $('#searchResultsMessage').append(
                            "<li id='" + a + "'><strong>" + this.user.name + ' said:</strong><br>' + this.text + "</li><br>"
                        );
                        // Increment variable by 1
                        a++;
                    });
                    if(a==1){
                        // If we still at a = 1, then ge did not get results -Append message that no result were found
                        $('#searchResultsMessage').append(
                            "<p>Your search did not return any result! Try Again!</p>"
                        );
                    }
                }
            });
        }
    });

    /* -- Twitter API: "GET Followers/List"  -  By Snehal Golhar
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getfollowersBtn").click(function() {
        // Variable to get followers results from twitter
        var followerslist;

        $.post('/getfollowers',function(resultfollowersResponse) {

            // Make the result area visible
            $('#divfollowerslist').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if(resultfollowersResponse == "error") {
                // Insert Error Message in Division
                $('#followerslist').html("<p>No followers to display </p>");
            }
            else {
                // parse JSON data to variable
                followerslist=JSON.parse(resultfollowersResponse);

                // Clear message area (Division) from previous messages
                $('#followerslist').html("");

                // Variable to count users and add it as the List id
                var a = 1;

                // Go through each object (user) in the array to get the "name"
                $.each(followerslist.users, function() {
                    // Get each friend name and add it to the message area as item on list
                    $('#followerslist').append(
                        "<li id='" + a + "'>" + this.name + "</li>"
                    );
                    // Increment variable by 1
                    a++;
                });
            }
        });
    });

    /* -- Twitter API: "GET Friends/Ids"  -  By Shalini Negi
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getFriendIdBtn").click(function() {

        // Variable to get friend ids from twitter
        var friendId;

        // http POST communication with the NODEJS Server
        $.post('/friendsIds', function(data) {

            // Make the result area visible
            $('#getFriendIdDiv').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if(data == "error") {
                // Insert Error Message in Division
                $('#getFriendIdMessage').html("<p>Could Not Get Friend Ids! Try Again</p>");
            }
            else {
                // parse JSON data to variable
                friendId = JSON.parse(data);

                // Clear message area (Division) from previous messages
                $('#getFriendIdMessage').html("");

                // Variable to count friend ids and add it to the List
                var countFriendIds = 1;

                // Go through each object (friend ids) in the array
                $.each(friendId.ids, function() {
                    // Get each friend ids and add it to the message area as item on list
                    $('#getFriendIdMessage').append(
                        "<li id='" + countFriendIds + "'>" + this + "</li>"
                    );
                    // Increment variable by 1
                    countFriendIds++;
                });
            }
        });
    });

    /* -- Twitter API: "GET Followers/Ids"  -  By Shalini Negi
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getFollowerIdBtn").click(function() {

        // Variable to get followers ids from twitter
        var followersIds;

        // http POST communication with the NODEJS Server
        $.post('/followersIds', function(data) {

            // Make the result area visible
            $('#getFollowerIdDiv').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if(data == "error") {
                // Insert Error Message in Division
                $('#getFollowerIdMessage').html("<p>Could Not Get Followers Ids! Try Again</p>");
            }
            else {
                // parse JSON data to variable
                followersList = JSON.parse(data);

                // Clear message area (Division) from previous messages
                $('#getFollowerIdMessage').html("");

                // Variable to count followers ids and add it to List
                var followerVariable = 1;

                // Go through each object (followers ids) in the array to get the "followers ids"
                $.each(followersList.ids, function() {
                    // Get each followers ids and add it to the message area as item on list
                    $('#getFollowerIdMessage').append(
                        "<li id='" + followerVariable + "'>" + this + "</li>"
                    );
                    // Increment variable by 1
                    followerVariable++;
                });
            }
        });
    });

    /* -- Twitter API: "GET Statuses/User_timeline"  -  By Monisha Dash
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getRecentStatusBtn").click(function (e) {
        // Prevent the default action of submitting the form to the server
        e.preventDefault();

        // Variable to get timeline results from twitter
        var recentStatus;

        // Capture the value of the text field - "screen name"
        var timeline_user = $("#screenName").val();


        // http POST communication with the NODEJS Server - Sending Captured Text
        $.post('/recentStatus', {timeline_newuser: timeline_user}, function (data) {

            // Make the result area visible
            $('#statusBox').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if (data == "error") {
                // Insert Error Message in Division
                $('#recentStatusList').html("<p>Could Not Get Recent Status! Try Again</p>");
            }
            else {
                // parse JSON data to variable
                recentStatus = JSON.parse(data);
                // Clear message area (Division) from previous messages
                $('#recentStatusList').html("");

                // Variable to count users and add it as the List id
                var a = 1;

                // Go through each object (statuses) in the array to get the "screen name" and "timeline"
                $.each(recentStatus, function () {
                    // Append the User Screen Name only on first iteration
                    if (a == 1) {
                        $('#recentStatusList').append(
                            "<h4><strong>Timeline for User: </strong>" + this.user.name + "</h4>"
                        );
                    }
                    // Append the timeline of messages tweeted; then add (append) to list as HTML
                    $('#recentStatusList').append(
                        "<li id='" + a + "'>" + this.text + "</li>"
                    );
                    // Increment variable by 1
                    a++;
                });
            }
        });
    });

    /* -- Twitter API: "POST Friendships/Create"  -  By Monisha Dash
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getNewFollowersBtn").click(function (e) {
        // Prevent the default action of submitting the form to the server
        e.preventDefault();

        // Variable to get Screen Name of user to follow in twitter
        var screenName;

        // Capture the value of the text field - "screen name"
        var newFriend = $("#screen_name").val();

        // Execute Posting only if the validation of the Form was successful
        if($("#createFollowerForm").validationEngine('validate')) {

            // http POST communication with the NODEJS Server - Sending Captured Text
            $.post('/createNewFollower', {nameToRemove:newFriend}, function(data) {

                // Make the result area visible
                $('#createFriendshipBox').removeClass("hidden");

                // Verify if the returned data contains the message "error"
                if (data == "error") {
                    // Insert Error Message in Division
                    $('#newFriendshipList').html("<p>No such user name</p>");
                }
                else {

                    // parse JSON data to variable
                    screenName = JSON.parse(data);
                    console.log("On FrontEnd Resp: " + data);
                    console.log("On FrontEnd Resp: " + screenName);

                    // Clear message area (Division) from previous messages
                    $('#newFriendshipList').html("");

                    // Append the name of the new Friend
                    $('#newFriendshipList').append("<p><strong>Now You Are Following: </strong>" + screenName.name + "</p>");

                    // Erase Text Field to get it ready for next tweet.
                    $("#screen_name").val("");

                }
            });
        }
    });

    /* -- Twitter API: "POST friendships/Destory"  -  By Khine Oo(Clara)
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#removeFriendBtn").click(function(e){
        // Prevent the default action of submitting the form to the server
        e.preventDefault();

        //Variable to remove a friend from friends on Twitter
        var removeFriend;

        // Capture the value of the text field - "friend name" to remove
        var friendname =$("#removingFriend").val();

        // Execute Posting only if the validation of the Form was successful
        if($("#removefriendForm").validationEngine('validate')) {
            // http POST communication with the NODEJS Server - Sending Captured Text
            $.post('/removeFriend', {friendName: friendname}, function (data) {

                // Make the result area visible
                $('#removeFriendBox').removeClass("hidden");

                if (data == "error") {
                    // Insert Error Message in Division
                    $('#removeFriendMessage').html("<p>Failed to remove this friend.</p>");
                }
                else {
                    // parse JSON data to variable
                    removeFriend = JSON.parse(data);
                    console.log("Result Console Front: " + data);
                    $('#removeFriendMessage').html("<p>The Screen Name <strong>" + removeFriend.name + " </strong>was removed from your Twitter friend.</p>");

                    // Erase Text Field to get it ready for next tweet.
                    $("#removingFriend").val("");
                }
            });
        }
    });

    /* -- Twitter API: "GET Users/Suggestions"  -  By Khine Oo(Clara)
     ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    $("#getSuggestionListBtn").click(function (e){
        e.preventDefault();

        //Variable to get Suggestion list from twitter
        var suggestionList;

        // http POST communication with the NODEJS Server
        $.post('/suggestionList',function(data){

            // Make the result area visible
            $('#divsuggestionList').removeClass("hidden");

            // Verify if the returned data contains the message "error"
            if(data=="error"){
                // Insert Error Message in Division
                $('#suggestionListMessage').html("<p>Sorry! Could not provide the Suggestion List in the mean time! </p>");
            }
            else{
                // parse JSON data to variable
                suggestionList =JSON.parse(data);

                // Clear message area (Division) from previous messages
                $('#suggestionList').html("");

                // Variable to count Suggestions ids and add it to List
                var a =1;

                // Go through each object (followers ids) in the array to get the "followers ids"
                $.each(suggestionList, function(){
                    // Get each user ids and add it to the message area as item on list
                    $('#suggestionList').append(
                        "<li id='" +a+"'>"+this.name+"</li>"
                    );

                    // Increment variable by 1
                    a++;
                });
            }
        });
    });


    /* Validation Attachment Area
    -------------------------------------------- */
	//Form Validation For Search API
    $("#searchtweetForm").validationEngine('attach', {promptPosition : "topLeft"});

    //Form Validation Tweet form
    $("#tweetForm").validationEngine('attach', {promptPosition : "topLeft"});

    //Form Validationfor Create Follower
    $("#createFollowerForm").validationEngine('attach', {promptPosition : "topLeft"});

    //Form Validation Remove Followers
    $("#removefriendForm").validationEngine('attach', {promptPosition : "topLeft"});
});
 
/* Individual Functions
------------------------------------------------ */
function changeBackgroundHeight() {
      // Verify window width to adjust
	  var width = $(window).width();

      //Adjust Height and bottom accordingly
	  if (width < 750) {
		$(".carousel .item").height(25);
		$(".carousel-caption").css("bottom","0");
	  } else {
		$(".carousel .item").height(50);
		$(".carousel-caption").css("bottom","-20");
	  }
}