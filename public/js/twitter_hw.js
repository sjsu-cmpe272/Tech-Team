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
                    // Insert Result Message in Division
                    $('#tweetMessage').html("<p>The following message was Tweeted: <br><strong>" + message + "</strong></p>");
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
            $.post('/searchTweet', {searchWord: searchword}, function (data) {

                // Make the result area visible
                $('#searchBox').removeClass("hidden");

                // Verify if the returned data contains the message "error"
                if (data == "error") {
                    // Insert Error Message in Division
                    $('#searchResultsMessage').html("<p>No Result for your search </p>");
                    console.log("Error");
                }
                else {
                    // parse JSON data to variable
                    searchResults = JSON.parse(data);
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


    /* Validation Attachment Area
    -------------------------------------------- */
	//Form Validation For Search API
    $("#searchtweetForm").validationEngine('attach', {promptPosition : "topLeft"});

    //Form Validation Tweet form
    $("#tweetForm").validationEngine('attach', {promptPosition : "topLeft"});

});
 
/* Individual Functions
------------------------------------------------ */
function changeBackgroundHeight() {
      // Verify window width to adjust
	  var width = $(window).width();

      //Adjust Height and bottom accordingly
	  if (width < 750) {
		$(".carousel .item").height(90);
		$(".carousel-caption").css("bottom","0");
	  } else {
		$(".carousel .item").height(90);
		$(".carousel-caption").css("bottom","-20");
	  }
}