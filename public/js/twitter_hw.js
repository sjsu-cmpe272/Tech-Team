/* GLOBAL VARIABLES 
------------------------------------------------ */
// Variables for Typing Timer in userName fields
var typingTimer;     //Timer to detect if user finish typing
var doneTypingInterval = 500;  //time in ms, 0.5 second for example
var currentUsernameField;		//current userName field
var usernameFieldState = true;	//true = OK, false = error on user name

/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){

    // Change Logo Hight
    changeLogo();

	/* Show Background image
	-------------------------------------------- */
	$("#myCarousel").css("visibility", "visible");
	
	/* Tweet a Message using the server
	--------------------------------------------*/
    $("#tweetBtn").click(function (e) {
        e.preventDefault();
        var message = $("#status").val();
        $.post('/tweetStatus', { status: message}, function(data) {
            if(data == "error") {
                $('#tweetMessage').html("<p>Tweet was NOT possible! Try Again</p>");
                console.log('error');
                $('#twitterBox').removeClass("hidden");
            }
            else {
                $('#tweetMessage').html("<p>The following message was Tweeted: <br><strong>"+message+"</strong></p>");
                $('#twitterBox').removeClass("hidden");
                $("#status").val("");
            }
            $('#tokenMessage').show(200);
        });
    });

    /* Get Friend list from Twitter
     --------------------------------------------*/
    $("#getFriendListBtn").click(function (e) {
        e.preventDefault();

        // Variable to get friend list from twitter
        var friendList;

        $.post('/friendList', function(data) {
            if(data == "error") {
                $('#friendListMessage').html("<p>Could Not Get Friend List! Try Again</p>");
                console.log('error');
                $('#friendListBox').removeClass("hidden");
            }
            else {
                friendList = JSON.parse(data);
                $('#friendListMessage').html("");
                $.each(friendList.users, function() {
                    var a = 1;
                    $('#friendListMessage').append(
                        "<li id='" + a + "'>" + this.name + "</li>"
                    );
                    a++;
                });
                $('#friendListBox').removeClass("hidden");
            }
            $('#friendListMessage').show(200);
        });
    });

    /* GET Search/Tweets Api - by Snehal
     ---------------------------------------------------------------*/
    $("#searchBtn").click(function (e) {
        e.preventDefault();

        // Variable to get search results from twitter
        var searchResults;
        var searchword = $("#searchkey").val();
        $.post('/searchTweet', { searchWord: searchword}, function(data) {
            if(data == "error") {
                $('#searchTweets').html("<p>No Result for your search </p>");
                console.log('error');
                $('#searchbox').removeClass("hidden");
            }
            else {
                searchResults = JSON.parse(data);
                console.log(searchResults);
                $('#searchResultsMessage').html("");
                $.each(searchResults.statuses, function() {
                    var a = 1;
                    $('#searchResultsMessage').append(
                        "<li id='" + a + "'><strong>" + this.user.name+' said:</strong><br>'+this.text+ "</li><br>"
                    );
                    a++;
                });
                $('#searchBox').removeClass("hidden");
            }
            $('#searchResultsMessage').show(200);
        });
    });

    /* GET Followers/List Api - by Snehal
     ---------------------------------------------------------------*/
    $("#getfollowersBtn").click(function (e) {
        e.preventDefault();

        // Variable to get search results from twitter
        var followerslist;
        $.post('/getfollowers',function(resultfollowersResponse) {
            if(resultfollowersResponse == "error") {
                $('#followerslist').html("<p>No followers to display </p>");
                console.log('error');
                $('#divfollowerslist').removeClass("hidden");
            }
            else {
                followerslist=JSON.parse(resultfollowersResponse);
                console.log(followerslist);
                $('#followerslist').html("");
                $.each(followerslist.users, function() {
                    var a = 1;
                    $('#followerslist').append(
                        "<li id='" + a + "'>" + this.name + "</li>"
                    );
                    a++;
                });
                $('#divfollowerslist').removeClass("hidden");
            }
            $('#followerslist').show(200);
        });
    });


    /* Initial State for DOM Items
    -------------------------------------------- */
	//Form Validation Sign-Up
    $("#signnewForm").validationEngine('attach', {promptPosition : "topLeft"});

    //Form Validation tweet form
    $("#tweetForm").validationEngine('attach', {promptPosition : "topLeft"});

	/* Response to actions in DOM */
	$("#closeLogin").click(function(e) {
		e.preventDefault();
		$("#loginDrawer").hide(400);
	});
	
	$("#loginBtn").click(function() {
		if($("#loginDrawer").hasClass('hidden')){
			$("#loginDrawer").hide();
			$("#loginDrawer").removeClass("hidden");
			$("#loginDrawer").show(800);
		}
		else
			$("#loginDrawer").toggle(800);
	});

	// On 'username' keyup, start timer countdown
	$('.userName').keyup(function(){
		currentUsernameField = $(this);
		clearTimeout(typingTimer);
		if ($(this).val()) {
			typingTimer = setTimeout(doneTyping, doneTypingInterval);
		}
	});
});
 
/* Individual Functions
------------------------------------------------ */
// User "finished typing username," Verify if available in DB
function doneTyping () {
	var inputVal = $(currentUsernameField).val();
	var errorMsg = "<div id='usernameMsg' class='alert alert-danger nomarginbottom minipaddingall'>Nombre No Disponible!</div>";
	var successMsg = "<div id='usernameMsg' class='alert alert-success nomarginbottom minipaddingall'>Nombre Disponible!</div>";
    $.post("/checkuser", { username: inputVal }, function(data) { 
		console.log("User Name Available: "+data);
		if(data == "Available"){
			$("#usernameMsg").remove();
			$(currentUsernameField).parent('div').removeClass("has-error");
			$(currentUsernameField).parent('div').append(successMsg);
			$(currentUsernameField).parent('div').addClass("has-success");
			usernameFieldState = true;
			$(".userNameOk").attr('disabled' , false);
		}
		else {
			$("#usernameMsg").remove();
			$(currentUsernameField).parent('div').removeClass("has-success");
			$(currentUsernameField).parent('div').append(errorMsg);
			$(currentUsernameField).parent('div').addClass("has-error");
			usernameFieldState = false;
			$(".userNameOk").attr('disabled' , true);
		}
	}); 
}

function changeLogo() {
	  console.log("Detecting Browser...");
	  var width = $(window).width();
	  
	  if (width < 750) {
		$(".carousel .item").animate({ height: 90 }, 50);
		$(".carousel-caption").animate({ bottom: 0 }, 50);
	  } else {
		$(".carousel .item").animate({ height: 90 }, 50);
		$(".carousel-caption").animate({ bottom: -20 }, 50);
	  }
	$("#mainLogo").remove();
	$("#horizontalAd").removeClass("hidden");
}