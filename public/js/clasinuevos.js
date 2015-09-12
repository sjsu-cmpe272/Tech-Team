/* GLOBAL VARIABLES 
------------------------------------------------ */
// Variables for Typing Timer in userName fields
var typingTimer,calcTimer,bannerTimer, logoTimer;     //s identifier
var doneTypingInterval = 500;  //time in ms, 0.5 second for example
var changeBannerInterval = 5000 //5 sec.
var changeLogoInterval = 10000 //10 sec.
var currentUsernameField;		//current userName field
var usernameFieldState = true;	//true = OK, false = error on user name
var resultsCoords = new Array();  //Store coordinates of all classified adds.
var googleMapsLoaded = false;  //Flag if google map scrip was loaded.
var calcLoaded = false;  //Flag if Mortgage Calculator is Loaded.
var faqsLoaded = false;  //Flag if FAQS is Loaded.
var aboutLoaded = false; //Flag if About is loaded.
var myaccountLoaded = false; //Flag if myAccount is loaded.
var resultsLoaded = false; //Flag if Results is loaded.
var administradorLoaded = false; //Flag if Administrator is loaded

/* Calculate Difference Between Actual Date and Project End Date */
function difference() {
	var firstDate = new Date(); // Todays date
	var secondDate = new Date("September 8, 2013 23:59:59"); //Project End Date
	var oneDay  = 24*60*60*1000;
	var diffDays = Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay);
	diffDays = 0;
	return diffDays;
}

var tipHover = {
		placement: "auto bottom" ,
		title: "Enter Your Email to be Notified when ToolSpin Launches"
	};
	
var tipError = {
		placement: "auto bottom" ,
		title: "Please, Enter a Valid Email Address!"
	};
	
var popSubmit = {
		placement: "auto top" ,
		html: true,
		trigger:"manual",
		content: "<strong>Thanks!</strong><br>We will notify you as soon as <strong>ToolSpin</strong> Launches!"
	};
	
/* Function for Initialization of results Drawers and ResultData
-------------------------------------------- */
function initialResults () {
	var width = $(window).width();
	console.log("Screen size: "+width);
	$.post('/destacados',{order: "destacados", offset:0, screenSize:width}, function(data) {
		if(data){
			$('#resultsDrawer').hide();
			$('#resultsData').empty();
			$('#resultsData').html(data.html);
			$('#resultsDrawer').show(800, function(){
				//Adjust Side Columns Height
				methodToFixSideColumnsHeight();
			});
			resultsCoords = data.raw;
		}
	});	
}

/* Function for changing side columns height
-------------------------------------------- */
function methodToFixSideColumnsHeight () {
	var winHeight = $("#mainContent").height();
    $(".columns").css('height',winHeight-20);
}

/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){
	// ***** REMOVE After Offer *****	
	
	$('#offerModal').modal({
	  backdrop: 'static',
	  show: true
	});
	
	
	//Set Timer for Ads Banners
	bannerTimer = setTimeout(changeBanners, changeBannerInterval);

	//Set Timer for Main Logo
	logoTimer = setTimeout(changeLogo, changeLogoInterval);
	
	//Migration Drawer
	$("#migracionBtn").click(function() {
		$("#migracionDrawer").show(800);
		$("#AD_PA1").show(800);
	
		//Reset Buttons
		$("#publishBtn0").html("Publicar");
		$("#publishBtn1").html("Publicar");
		$("#publishBtn2").html("Publicar");
		$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
	});
	
	$("#closeMigracion").click(function(e) {
		e.preventDefault();
		$("#migracionDrawer").hide(400);
		$("#AD_PA1").hide(400);
	});
	
	//Real Estate Drawer
	$("#bienesRaicesBtn").click(function() {
		$("#bienesRaicesDrawer").show(800);
		$("#AD_PA2").show(800);
	
		//Reset Buttons
		$("#publishBtn0").html("Publicar");
		$("#publishBtn1").html("Publicar");
		$("#publishBtn2").html("Publicar");
		$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
	});
	
	$("#closeBienesRaices").click(function(e) {
		e.preventDefault();
		$("#bienesRaicesDrawer").hide(400);
		$("#AD_PA2").hide(400);
	});
	
	//Finance Drawer
	$("#financiamientoBtn").click(function() {
		$("#financiamientoDrawer").show(800);
		$("#AD_PA3").show(800);
	
		//Reset Buttons
		$("#publishBtn0").html("Publicar");
		$("#publishBtn1").html("Publicar");
		$("#publishBtn2").html("Publicar");
		$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
	});
	
	$("#closeFinanciamiento").click(function(e) {
		e.preventDefault();
		$("#financiamientoDrawer").hide(400);
		$("#AD_PA3").hide(400);
	});		
	
	//Set Side Columns initial Height
	$(".columns").css('height',$("#mainContent").height());
	
	/* Show Background image
	-------------------------------------------- */
	$("#myCarousel").css("visibility", "visible");
	
	/* Initialization of Search Drawers and SearchData
	-------------------------------------------- */
	$.get('/search', function(data) {
		if(data){
			$('#searchDrawer').hide();
			$('#searchData').empty();
			$('#searchData').html(data);
			$('#searchDrawer').show(800);
		}
	});
	
	/* Initialization of results Drawers and ResultData
	-------------------------------------------- */
	initialResults();
    
	/* Initial State for DOM Items
	-------------------------------------------- */
	//Form Validation Sign-Up
    $("#signnewForm").validationEngine('attach', {promptPosition : "topLeft"});
    
	//Form Validation Sign-Up
    $("#adContactForm").validationEngine('attach', {promptPosition : "topLeft"});
    
    //Hide Calculator Summary
    $("#calcDrawer").hide();
    
    //Hide Publish Summary
	$("#publishDrawer").hide();
	
	//Hide Bitcoins Summary
	$("#btcDrawer").hide();
	
	//Hide Emails Summary
	$("#emailDrawer").hide();
	
	//Update the time left
	$("#daysLeft").text(Math.ceil(difference()));
	
	//Attach ToolTip jQuery to email input
	$("#signupEmail").tooltip(tipHover);
	
	//Attach Popover jQuery to signUp Button
	$("#signupBtn").popover(popSubmit);
	
	/* Response to actions in DOM
	-------------------------------------------- */
	//FAQS BTN REQUEST
	$("#faqsBtn").click(function(e) {
		e.preventDefault();
		if(!faqsLoaded) {
			$("#faqsDrawer").hide();
			$("#faqsDrawer").removeClass("hidden");
			$("#faqsDrawer").show(800);
		
			$.get("/faqs", function(data) { 
				//HIDE DRAWERS
				$("#resultsDrawer").hide();
				$("#detailsDrawer").hide();
				$("#publishDrawer").hide();
				$("#calcDrawer").hide();
				$("#sobreNosotrosDrawer").hide();
				$("#myaccountDrawer").hide();
				$("#searchDrawer").hide();
			
				//Reset Buttons
				$("#publishBtn0").html("Publicar");
				$("#publishBtn1").html("Publicar");
				$("#publishBtn2").html("Publicar");
				$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			
				$("#faqsData").html(data);
				faqsLoaded = true;
			});
		}
		else {
			//HIDE DRAWERS
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#sobreNosotrosDrawer").hide();
			$("#myaccountDrawer").hide();
			$("#searchDrawer").hide();
		
			//Reset Buttons
			$("#publishBtn0").html("Publicar");
			$("#publishBtn1").html("Publicar");
			$("#publishBtn2").html("Publicar");
			$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			$("#faqsDrawer").show(800);
		}
	});
	
	//SOBRE NOSOTROS BTN REQUEST
	$("#sobreNosotrosBtn").click(function(e) {
		e.preventDefault();
		if(!aboutLoaded) {
			$("#sobreNosotrosDrawer").hide();
			$("#sobreNosotrosDrawer").removeClass("hidden");
			$("#sobreNosotrosDrawer").show(800);
			
			$.get("/about", function(data) { 
				//HIDE DRAWERS
				$("#resultsDrawer").hide();
				$("#detailsDrawer").hide();
				$("#publishDrawer").hide();
				$("#calcDrawer").hide();
				$("#faqsDrawer").hide();
				$("#myaccountDrawer").hide();
				$("#searchDrawer").hide();
				
				//Reset Buttons
				$("#publishBtn0").html("Publicar");
				$("#publishBtn1").html("Publicar");
				$("#publishBtn2").html("Publicar");
				$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			
				$("#sobreNosotrosData").html(data);
				aboutLoaded = true;
			});
		}
		else {
			//HIDE DRAWERS
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#faqsDrawer").hide();
			$("#myaccountDrawer").hide();
			$("#searchDrawer").hide();
		
			//Reset Buttons
			$("#publishBtn0").html("Publicar");
			$("#publishBtn1").html("Publicar");
			$("#publishBtn2").html("Publicar");
			$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			$("#sobreNosotrosDrawer").show(800);
		}
	});
	
	//Submit AdContact
	$("#submitAdContact").click(function(e) {
		e.preventDefault();
		
		//Verify validation of last Step before presenting Checkout Modal
        var stepFields = new Array("#adName","#adEmail","#adInfo","#telephone");
        var validationOk = true;
        
        for (var i = 0; i < stepFields.length; i++)
        if ($(stepFields[i]).validationEngine('validate')) {
            validationOk = false;
            console.log("Step "+i+" Validation: "+validationOk);
        }
        
        //If validation is OK, then present Modal Checkout
        if(validationOk){
        
			$.post($("#adContactForm").attr("action"), $("#adContactForm").serialize(), function(data) { 
				if(data != "error") {
					$('#adContactModal').modal('hide');
					console.log("Form Sent Ok");
				}
				else {
					$('#adContactModal').modal('hide');
					$('#formProcessingModal').modal('hide');
					$('#formErrorModal').modal('show');
					console.log("Problem sending form");
				}
			}); 
		}
	});
	
	// Show Telephone field on AdContactForm
	$("#callMe").click(function() {
		if($(this).is(":checked")){
			$("#telGroup").show();
		}
		else 
			$("#telGroup").hide();
	});
	
	// CLICKED AD REQUEST INFO
	$("a.info-request").click(function(e) {
		e.preventDefault();
		$('#contactTitle').html("Solicitud de Información sobre Anuncio en ClasiNuevos.com");
		$('#adInfo').html("Deseo recibir información acerca de pautar un anuncio en ClasiNuevos.com.");
		$('#adContactModal').modal('show');
	});
	
	// CLICKED REQUEST INFO
	$("#contactBtn").click(function(e) {
		e.preventDefault();
		$('#contactTitle').html("Solicitud de Información");
		$('#adInfo').html("");
		$('#adInfo').attr("placeholder","Describa la información solicitada");
		$('#adContactModal').modal('show');
	});
	
	// BANNERS ACTIONS
	$(".ad1-placeholder, .ad2-placeholder, .horizontalAd1, .horizontalAd2, .horizontalTopAd1, .horizontalTopAd2, .horizontalBotAd1, .horizontalBotAd2").mouseenter(function(){
		clearTimeout(bannerTimer);
		$(".ad-information").show();
		$(".horizontalAd-information").show();
		$(".horizontalTopAd-information").show();
		$(".horizontalBotAd-information").show();
		
		$(".ad1-placeholder").hide();
		$(".ad2-placeholder").hide();
		$(".horizontalAd1").hide();
		$(".horizontalAd2").hide();
		$(".horizontalTopAd1").hide();
		$(".horizontalTopAd2").hide();
		$(".horizontalBotAd1").hide();
		$(".horizontalBotAd2").hide();
	});
	
	$(".ad-information, .horizontalAd-information, .horizontalTopAd-information, .horizontalBotAd-information").mouseleave(function(){
		$(".ad-information").hide();
		$(".horizontalAd-information").hide();
		$(".horizontalTopAd-information").hide();
		$(".horizontalBotAd-information").hide();
		
		$(".ad1-placeholder").show();
		$(".ad2-placeholder").hide();
		$(".horizontalAd1").show();
		$(".horizontalAd2").hide();
		$(".horizontalTopAd1").show();
		$(".horizontalTopAd2").hide();
		$(".horizontalBotAd1").show();
		$(".horizontalBotAd2").hide();
		bannerTimer = setTimeout(changeBanners, changeBannerInterval);
	});
	
	$("#signupBtn").mouseout(function(){
		$("#signupBtn").popover('hide');
	});
	
	$("#signupEmail").change(function() {
		$("#signupEmail").tooltip('destroy');
		$("#signupEmail").tooltip(tipHover);
	});
	
	$("#closeBTC").click(function(e) {
		e.preventDefault();
		$("#btcDrawer").hide(400);
	});
	
	$("#closeEmail").click(function(e) {
		e.preventDefault();
		$("#emailDrawer").hide(400);
	});
	
	$("#closeFaqs").click(function(e) {
		e.preventDefault();
		$("#faqsDrawer").hide();
		$("#resultsDrawer").show(800);
		$("#searchDrawer").show(800);
	});
	
	$("#closeSobreNosotros").click(function(e) {
		e.preventDefault();
		$("#sobreNosotrosDrawer").hide();
		$("#resultsDrawer").show(800);
		$("#searchDrawer").show(800);
	});
	
	$("#closeLogin").click(function(e) {
		e.preventDefault();
		$("#loginDrawer").hide(400);
	});
	
	$(".myaccountBtn").click(function() {
		if(!myaccountLoaded) {
			$("#myaccountDrawer").removeClass("hidden");
			$("#myaccountDrawer").show(800);
			$("#myaccountData").html("<div class='text-center largemargintop'><h1>Cargando... <i class='icon-refresh icon-spin'></i></h1></div>");

			//HIDE DRAWERS
			$("#searchDrawer").hide();
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#faqsDrawer").hide();
			$("#sobreNosotrosDrawer").hide();
				
			$.post("/userdata", {screenSize:$(window).width()}, function(data) { 
				
				$("#myaccountData").html(data);	
				myaccountLoaded = true;
			});
		}
		else {
			//HIDE DRAWERS
			$("#searchDrawer").hide();
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#faqsDrawer").hide();
			$("#sobreNosotrosDrawer").hide();
			
			//Reset Buttons
			$("#publishBtn0").html("Publicar");
			$("#publishBtn1").html("Publicar");
			$("#publishBtn2").html("Publicar");
			$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			$("#myaccountDrawer").show(800);
			
		}
	});
	
	$(".administradorBtn").click(function() {
		if(!administradorLoaded) {
			$("#administradorDrawer").removeClass("hidden");
			$("#administradorDrawer").show(800);
			$("#administradorData").html("<div class='text-center largemargintop'><h1>Cargando... <i class='icon-refresh icon-spin'></i></h1></div>");

			//HIDE DRAWERS
			$("#searchDrawer").hide();
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#faqsDrawer").hide();
			$("#sobreNosotrosDrawer").hide();
			$("#myaccountDrawer").hide();
				
			$.post("/administ", {screenSize:$(window).width()}, function(data) { 
				
				$("#administradorData").html(data);	
				administradorLoaded = true;
			});
		}
		else {
			//HIDE DRAWERS
			$("#searchDrawer").hide();
			$("#resultsDrawer").hide();
			$("#detailsDrawer").hide();
			$("#publishDrawer").hide();
			$("#calcDrawer").hide();
			$("#faqsDrawer").hide();
			$("#sobreNosotrosDrawer").hide();
			$("#myaccountDrawer").hide();
			
			//Reset Buttons
			$("#publishBtn0").html("Publicar");
			$("#publishBtn1").html("Publicar");
			$("#publishBtn2").html("Publicar");
			$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			$("#administradorDrawer").show(800);
			
		}
	});
	
	$(".publishBtns").click(function() {
		var buttonId = $(this).attr("id");
		if($("#publishDrawer").is(":visible")) {
			$("#publishDrawer").hide();
			$("#publishData").empty();
			$("#publishData").html("<div class='text-center largemargintop'><h1>Cargando... <i class='icon-refresh icon-spin'></i></h1></div>");
			$("#searchDrawer").show(800);
			$("#resultsDrawer").show(800);
			$("#detailsDrawer").show(800);
			$("#publishBtn0").html("Publicar");
			$("#publishBtn1").html("Publicar <i class='icon-chevron-right'></i>");
			$("#publishBtn2").html("Publicar Clasificado <i class='icon-chevron-right'></i>");
		}
		else {
			$(".publishBtns").html("<i class='icon-refresh icon-spin icon-large'></i>");
			$('#offerModal').modal('hide');
			
			$.get('/publish', function(data) {
				if(data){
					//HIDE DRAWERS
					$("#searchDrawer").hide();
					$("#resultsDrawer").hide();
					$("#detailsDrawer").hide();
					$("#myaccountDrawer").hide();
					$("#calcDrawer").hide();
					$("#faqsDrawer").hide();
					$("#sobreNosotrosDrawer").hide();
					
					//Reset Buttons
					$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
					
					$("#publishData").empty();
					$('#publishDrawer').hide();
					$("#publishDrawer").removeClass("hidden");
					$('#publishData').html(data);
					$("#publishDrawer").show(800);
					$("#publishBtn0").html("Comienzo");
					$("#publishBtn1").html("Comienzo <i class='icon-chevron-right'></i>");
					$("#publishBtn2").html("Comienzo ClasiNuevos <i class='icon-chevron-right'></i>");
				}
			}); 
		}
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
	
	$("#ordersBtn").click(function() {
		$("#btcDrawer").removeClass("hidden");
		$("#btcDrawer").toggle(800);
	});
	
	$("#signupsBtn").click(function() {
		if($("#emailDrawer").is(":visible")) {
			$("#emailDrawer").hide(800);
		}
		else {
			$("#emailDrawer").removeClass("hidden");
			$("#emailDrawer").show(800);
			$('#emailData').html("<h3>Loading Data...<i class='icon-refresh icon-spin icon-large'></i></h3>");
			$.get('/signups', function(data) {
				if(data){
					$('#emailData').html(data);
				}
			}); 
		}
	});
	
	$("#calcBtn").click(function() {
		if($("#calcDrawer").is(":visible")) {
			$("#calcDrawer").hide();
			$("#calcBtn").html("<div class='visible-sm'>Calc</div><div class='hidden-sm'>Calculadora</div>");
			$("#resultsDrawer").show(800);
			$("#searchDrawer").show(800);
		}
		else {
			if(!calcLoaded) {
				$("#calcBtn").html("<i class='icon-refresh icon-spin icon-large'></i>");
				$.post('/calc', {price:200000, rate:4.0}, function(data) {
					if(data){
						//HIDE DRAWERS
						$("#resultsDrawer").hide();
						$("#myaccountDrawer").hide();
						$("#detailsDrawer").hide();
						$("#publishDrawer").hide();
						$("#faqsDrawer").hide();
						$("#sobreNosotrosDrawer").hide();
						$("#searchDrawer").hide();
						
						//Reset Buttons
						$("#publishBtn0").html("Publicar");
						$("#publishBtn1").html("Publicar");
						$("#publishBtn2").html("Publicar");
					
						$("#calcDrawer").removeClass('hidden');
						$("#calcDrawer").hide();
						$("#calcData").empty();
						$("#calcData").html(data);
						$("#calcDrawer").show(800);
						$("#calcBtn").html("Comienzo");
						calcTimer = setTimeout(display_results,800);
						calcLoaded = true;
					}
				}); 
			}
			else {
				//HIDE DRAWERS
				$("#resultsDrawer").hide();
				$("#myaccountDrawer").hide();
				$("#detailsDrawer").hide();
				$("#publishDrawer").hide();
				$("#faqsDrawer").hide();
				$("#sobreNosotrosDrawer").hide();
				$("#searchDrawer").hide();
				
				$("#calcDrawer").show(800);
				$("#calcBtn").html("Comienzo");
				
				//Reset Buttons
				$("#publishBtn0").html("Publicar");
				$("#publishBtn1").html("Publicar");
				$("#publishBtn2").html("Publicar");
			}
		}
	});

	$("#refreshBTC").click(function(e) {
		e.preventDefault();
		$("#spinner").addClass("icon-refresh icon-spin icon-large");
		$.get('/refresh_orders', function(success) {
			if(success == "ok"){
				$.get('/orders', function(data) {
					$('#bitcoinsData').html(data);
					$("#spinner").removeClass("icon-refresh icon-spin icon-large");
				});
			}
		});
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
$("#signupForm").submit(function(e) {
	e.preventDefault(); // Prevents the page from refreshing
	
	var $this = $(this); // `this` refers to the current form element
	var email = $("#signupEmail").val();
	var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			
	if (email == "") {     
		$("#signupEmail").addClass("has-error");
		$("#signupEmail").focus();
    }
    else {
    	if(reg.test(email)) {
    	
    		//Post Data to Node Server
    		$.post(
				$this.attr("action"), // Gets the URL to sent the post to
				$this.serialize(), // Serializes form data in standard format
				function(data) { /** code to handle response **/ },
				"json" // The format the response should be in
			);
			
			//Notify User That the Email Was Sent to the Server & Thanks!
			$("#signupBtn").popover('show');
			$("#signupEmail").val("");
    	}
    	else {
    		//handle Invalid Email Format Error
    		$("#signupEmail").addClass("has-error");
			$("#signupEmail").focus();
			//Attach ToolTip jQuery to email input
			$("#signupEmail").tooltip('destroy');
			$("#signupEmail").tooltip(tipError);
			$("#signupEmail").tooltip('show');
    	}
    }
});

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

function changeBanners() {
	$(".ad1-placeholder, .horizontalAd1, .horizontalTopAd1, .horizontalBotAd1").toggle();
	$(".ad2-placeholder, .horizontalAd2, .horizontalTopAd2, .horizontalBotAd2").toggle();
	clearTimeout(bannerTimer);
	bannerTimer = setTimeout(changeBanners, changeBannerInterval);
}

function changeLogo() {
	  console.log("Detecting Browser...");
	  var width = $(window).width();
	  
	  if (width < 750) {
		$(".carousel .item").animate({ height: 90 }, 800);
		$(".carousel-caption").animate({ bottom: 0 }, 800);
	  } else {
		$(".carousel .item").animate({ height: 90 }, 800);
		$(".carousel-caption").animate({ bottom: -20 }, 800);
	  }
	$("#mainLogo").remove();
	$("#horizontalAd").removeClass("hidden");
	clearTimeout(logoTimer);
}