/* GLOBAL VARIABLES 
------------------------------------------------ */
// Variables for Typing Timer in userName fields
var typingTimer;     //Timer to detect if user finish typing
var doneTypingInterval = 500;  //time in ms, 0.5 second for example
var currentUsernameField;		//current userName field
var usernameFieldState = true;	//true = OK, false = error on user name
var googleMapsLoaded = false;  //Flag if google map scrip was loaded.
var calcLoaded = false;  //Flag if Mortgage Calculator is Loaded.
var myaccountLoaded = false; //Flag if myAccount is loaded.

/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){

    // Change Logo Hight
    changeLogo();

	/* Show Background image
	-------------------------------------------- */
	$("#myCarousel").css("visibility", "visible");
	
	/* Initialization get Twitter credentials from server
	--------------------------------------------*/
    $.post('/gettoken2', { id: null }, function(data) {
        if(data == "error") {
            $('#tokenMessage').html("<p>"+data+"</p>");
            console.log('error');
            $('#twitterBox').removeClass("hidden");
        }
        else {
            $('#tokenMessage').html("<p>Token: "+data+"</p>");
            $('#twitterBox').removeClass("hidden");
        }
        $('#tokenMessage').show(200);
    });
    
	/* Initial State for DOM Items
	-------------------------------------------- */
	//Form Validation Sign-Up
    $("#signnewForm").validationEngine('attach', {promptPosition : "topLeft"});

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

/*
var API_ORDER_ROUTE = '/api/orders';
function OrdersCtrl($http, $scope) {
    $http.get(API_ORDER_ROUTE).success(function(data, status, headers, config) {
        if (data.error) {
            $scope.error = data.error;
        } else {
            $scope.num_orders = data.num_orders;
            $scope.total_funded = data.total_funded.toFixed(2);
            $scope.unit_symbol = data.unit_symbol;
            $scope.target = data.target;
            $scope.days_left = data.days_left ? data.days_left : 0;
            $scope.percentage_funded = Math.min($scope.total_funded / $scope.target * 100.0, 100);
        }
    }).error(function(data, status, headers, config) {
        $scope.error = "Error fetching order statistics.";
    });
}

$.post('/busqueda',$("#search").serialize(), function(data) {
    if(data != "error") {
        $('#resultsData').empty();
        $('#resultsData').html(data.html);
        resultsCoords = data.raw;
        $('#searchBtn').html("<i class='icon-search'></i>  Buscar");

        //Adjust Side Columns Height
        methodToFixSideColumnsHeight();
    }
    else {
        $('#searchBtn').html("<i class='icon-search'></i>  Buscar");
        $('#formProcessingModal').modal('hide');
        $('#formErrorModal').modal('hide');
    }
    $("#offset").remove();
    $("#screenSize").remove();
});

var id = $(caller).attr('name');
$.post('/details', { id: id }, function(data) {
    if(data != "error") {
        $('#detailsData').html(data);
    }
    else {
        $('#formProcessingModal').modal('hide');
        $('#formErrorModal').modal('show');
    }
});
*/