/* Google MAPS
------------------------------------------------ */
var map;

function appendBootstrap() {
	if(!googleMapsLoaded){
		console.log("Addind google map script");
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCtkn29Z1Pulf0jlET41kX9yO7yiaLFq-I&sensor=true&libraries=places,weather&callback=getCoordinates";
		document.body.appendChild(script);
	}
	else {
		//GetLocation
		getCoordinates();
	} 
}

//Get Coordinates from Google Maps
function getCoordinates(){
	var neighborhood = $("#neighborhood").val();
	var address = $("#address").val();
	var town = $("#town").val();
	var stateOwner = $("#stateOwner").val();
	var zipcode = $("#zipcode").val();
	
	// Address Format:  House Number, Street Direction, Street Name, Street Suffix, City, Zip, Country
	if(zipcode != "")
		var formattedAddress = address+","+neighborhood+","+town+","+zipcode+","+stateOwner;
	else
		var formattedAddress = address+","+neighborhood+","+town+","+stateOwner;
		
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+escape(formattedAddress)+"&region=pr&sensor=false";
	console.log("1st Formatted url: "+url);
	
	var myAddress = new Array();
	var sentence;
	
	$.get(url, function(georesults) {
		console.log("1st Response Status: "+georesults.status);
		if(georesults.status == "OK") {
			console.log("1st Got Result from Google Map GeoCode...!");
		
			for (i = 0; i < georesults.results.length; i++) {
			  myAddress[i] = georesults.results[i].geometry.location;
			  sentence = georesults.results[i].formatted_address;
			}
			var longitud = myAddress[0].lng;
			var latitude = myAddress[0].lat;
			console.log("Direccion encontrada: "+sentence);
			console.log("Las Coordenadas Encontradas Son Longitud: "+longitud+" Latitud: "+latitude);
			$("#longitud").val(longitud);
			$("#latitude").val(latitude);
			
			initialize(latitude,longitud);
			
		}
		else {
			if(zipcode)
				formattedAddress = zipcode+","+stateOwner;
			else
				formattedAddress = town+","+stateOwner;
				
			url = "https://maps.googleapis.com/maps/api/geocode/json?address="+escape(formattedAddress)+"&region=pr&sensor=false";
			console.log("2nd Formatted url: "+url);
			
			$.get(url, function(georesults) {
				console.log("2nd Response Status: "+georesults.status);
				if(georesults.status == "OK") {
					console.log("2nd Got Result from Google Map GeoCode...!");
		
					for (i = 0; i < georesults.results.length; i++) {
					  myAddress[i] = georesults.results[i].geometry.location;
					  sentence = georesults.results[i].formatted_address;
					}
					
					var longitud = myAddress[0].lng;
					var latitude = myAddress[0].lat;
					console.log("2nda Direccion encontrada: "+sentence);
					console.log("Las 2das Coordenadas Encontradas Son Longitud: "+longitud+" Latitud: "+latitude);
					$("#longitud").val(longitud);
					$("#latitude").val(latitude);
			
					initialize(latitude,longitud);
			
				}
				else {
					$("#longitud").val("");
					$("#latitude").val("");
					$("#mapDraw").html("<h3 class='text-center'>No se pudo encontrar la dirección en el mapa.  Puede cambiar la dirección y tratar nuevamente"+
					" o continuar con el resto de los pasos</h3>");
				}
			});
		}
	});
}

function initialize(lat,lng) {
	//Set Flag to signal that Google Map script was loaded
	googleMapsLoaded = true;
	
	detectBrowserPublish();
	var myPlace = new google.maps.LatLng(lat,lng);

	// Enable the visual refresh
	google.maps.visualRefresh = true;
  
	map = new google.maps.Map(document.getElementById('mapDraw'), {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: myPlace,
		zoom: 15
	});
  
	var marker = new google.maps.Marker({
		draggable: true,
		position: myPlace, 
		map: map
	});
	
	google.maps.event.addListener(marker, 'dragend', function (event) {
		document.getElementById("latitude").value = this.getPosition().lat();
		document.getElementById("longitud").value = this.getPosition().lng();
	});
}

function detectBrowserPublish() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("mapDraw");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '300px';
  } else {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '650px';
  }
}

/* GLOBAL VARIABLES 
------------------------------------------------ */
// Variables for Typing Timer in userName fields
var typingTimer;                //timer identifier
var doneTypingInterval = 500;  //time in ms, 1 second for example
var currentUsernameField;		//current userName field
var usernameFieldState = true;	//true = OK, false = error on user name

var imageNames = new Array();
var totalImages = 1;
var imageCost = 0;
var highlightCost = 0;
var totalCost = 0;

//Function used for the Validation method to calculate current Year
function currentYear(field, rules, i, options){
  var actualYear = new Date().getFullYear();
  if (field.val() > actualYear) {
     return options.allrules.validate2fields.alertText;
  }
}

//Function to Format Money
Number.prototype.formatMoney = function(c, d, t) {
    var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c,
		d = d == undefined ? "." : d,
		t = t == undefined ? "," : t,
		s = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

//Funciton to delete Uploades Files and HTML components
function deleteFiles(e){
    $("#dialog-confirm").dialog({
        modal: true,
        autoOpen:false,
        buttons: {
            "Borrar": function() {
                $(this).dialog("close");
                
                var fileName;
                var detachedNode;
                
                //Try to get parent element from a Drop action...
                var fileIdDrop = $(e).parent(".preview").find("img").attr("id");

                if(fileIdDrop){
                    $(e).parent(".preview").hide('slow', function () {
                        //Detach element
                        if($(this).detach())
                            detachedNode = $(this);
                        
                        //Assign ID attribute to var fileName
                        fileName = fileIdDrop;

                        //Remove file name from array
                        var index = imageNames.indexOf(fileIdDrop);
                        imageNames.splice(index, 1);
                        $("#photoUploads").text(imageNames.length);

                        //Dissable radio button first option if more than 1 photo.
                        if(imageNames.length <= 1)
                                $("#image_ThreeGroup").find("input:first-child").attr('disabled',false);
                            
                        //Delete file from server
                        $.ajax({
                            url: "/deletefiles",
                            type: "POST",
                            data: { "fileName" : fileName },
                            success: function(data){
                                if(!data){
                                        alert("Hubo Problemas Borrando el Archivo.  Trate Nuevamente!");
                                        $(e).closest("#dropbox > .message").after(detachedNode);
                                    }
                                }
                        });
                    });
                }
                
                //Try to get parent element from Browse File action...
                var fileIdBrowse = $(e).closest(".file").attr("id");
                
                if(fileIdBrowse){
                    $(e).closest(".file").hide('slow', function () {
                        //Detach element
                        if($(this).detach())
                            detachedNode = $(this);
                        
                        //Assign ID attribute to var fileName
                        fileName = fileIdBrowse;

                        //Remove file name from array
                        var index = imageNames.indexOf(fileIdBrowse);
                        imageNames.splice(index, 1);
                        $("#photoUploads").text(imageNames.length);

                        //Dissable radio button first option if more than 1 photo.
                        if(imageNames.length <= 1)
                                $("#image_ThreeGroup").find("input:first-child").attr('disabled',false);
                        
                        //Delete file from server
                        $.ajax({
                            url: "/deletefiles",
                            type: "POST",
                            data: { "fileName" : fileName },
                            success: function(data){
                                if(data == 'error'){
                                        alert("Hubo Problemas Borrando el Archivo.  Trate Nuevamente!");
                                        $(e).closest(".pekecontainer").after(detachedNode);
                                    }
                                }
                        });
                    });
                }
            },
            "Cancelar": function() {
                $(this).dialog( "close" );
            }
        }
    });
    
    //Dialog to confirm deletion of Photo
    $("#dialog-confirm").dialog("open");
}

function updateTotalSale(){
    totalCost = imageCost + highlightCost;
    if(!totalCost){
        $("#submitPayGroup").hide(200);
        $("#submitPublishGroup").show(500);
        $(".costSummary").html("Gratis!");
    }
    else{
        $("#submitPayGroup").show(500);
        $("#submitPublishGroup").hide(200);
        $(".costSummary").html("$"+( (totalCost).formatMoney(2)) );
    }
    $("#totalSale").val(totalCost);
}

function hideStripeCheckoutSpinner() {
	//Hide Spinner to feedback user
	$("#submitPaySpinner").addClass("hidden");
}

// FORM MANIPULATION jQUERY -->
$(document).ready(function() {
	//Show Highlight example MODAL
	$("#highlightExampleLink").click(function(e) {
		e.preventDefault();
		$('#highlightExampleModal').modal('show');
	});
	
	//Trigger GeoLocation Lookup on Address Change
	$("#lookupCoords").click(function(e){
		e.preventDefault();
		if (!$("#town").validationEngine('validate')) {
			if($("#neighborhood").val() && $("#address").val() && $("#town").val() && $("#stateOwner").val()) {
				$("#mapDrawGroup").removeClass('hidden');
				$("#mapDrawGroup").show(400);
				$("#mapError").html("");
				appendBootstrap();
			}
			else {
				$("#mapError").html("<h2 class='text-center'>Por Favor, complete todos los espacios...!</h2>");
			}
		}
		else {
			$("#mapError").html("<h2 class='text-center'>Por Favor, seleccione el pueblo donde se encuentra su propiedad...</h2>");
		}
	});
	
	// Smart Wizard 	
  	$('#MyWizard').smartWizard({
		labelNext:'Próximo', // label for Next button
		labelPrevious:'Anterior', // label for Previous button
		labelFinish:'Finalizar',  // label for Finish button
		includeFinishButton : false,   // Add the finish button
		onLeaveStep:leaveAStepCallback
  	});
    
    //Adjust the form for Rent or Sell
    $("#sellOrRentGroup").click(function(){
        if($('#sellOrRent2').is(":checked")){
            $("#sellOrRentLabel").text("Renta ");
            $("#price").attr("placeholder","Renta Mensual");
        }
        else{
            $("#sellOrRentLabel").text("Precio ");
            $("#price").attr("placeholder","Precio de Venta");
        }
    });
    
    //Dialog for telling the user to wait until the classified is completed
    $("#processingDialog").dialog({
        autoOpen: false,
        show: {
            effect: "fade",
            duration: 1000
        },
        hide: {
            effect: "fade",
            duration: 1000
        },
        modal: true,
        height: "auto",
        width: "auto"
    });
    
    //Form Validation
    $("#mainForm").validationEngine('attach', {promptPosition : "topLeft"});
    
    //Update Photos Variables in step 4 of Wizard
    $.fn.updatePhotos = function() {
    	console.log("Updating Photos to input elements...:"+imageNames);
        if(imageNames[0]) {
            $('#photo1').val(imageNames[0]);
        }
        else {
        	$("#photo1").val();
        }
        if(imageNames[1]) {
            $('#photo2').val(imageNames[1]);
        }
        else {
        	$("#photo2").val();
        }
        if(imageNames[2]) {
            $('#photo3').val(imageNames[2]);
        }
        else {
        	$("#photo3").val();
        }
        if(imageNames[3]) {
            $('#photo4').val(imageNames[3]);
        }
        else {
        	$("#photo4").val();
        }
        if(imageNames[4]) {
            $('#photo5').val(imageNames[4]);
		}
		else {
        	$("#photo5").val();
        }
    };
    
	//Validate each Step of the form before changing to next step
    function leaveAStepCallback(obj, context){
    	//allow going back without validation
        if(context.fromStep > context.toStep) {
        	errorVal=false;
        }
        else {
			var step1ValFields = new Array("#fullNameOwner","#emailOwner","#phoneOwner","#fullNameRealtor","#emailRealtor","#phoneRealtor","#userNamePublish","#emailOwner2","#passwordPublish","#passwordConfirmation");
			var step2ValFields = new Array("#neighborhood","#address","#town");
			var step3ValFields = new Array("#property","#year","#bedrooms","#bathrooms","#sqft","#price","#fees","#description");
			var step4ValFields = new Array("#photo1");
			var errorVal = false;

			var currentStep = context.fromStep;
			switch (currentStep) {
				case 1:
					$(".buttonNext").prop("disabled",true);
					validateStep(step1ValFields);
					break;
				case 2:
					console.log("Finish step 2!!");
					validateStep(step2ValFields);
					break;
				case 3:
					validateStep(step3ValFields);
				
					//Change Price and Fee and Strip any character ('$', ',');
					if(!errorVal){
				
						var sqft = $("#sqft").val();
						var newSqft = Number(sqft.replace(/[^0-9\.]+/g,""));
						$("#sqft").val(newSqft);
					
						var price = $("#price").val();
						var newPrice = Number(price.replace(/[^0-9\.]+/g,""));
						$("#price").val(newPrice);
					
						var fees = $("#fees").val();
						var newFees = Number(fees.replace(/[^0-9\.]+/g,""));
						$("#fees").val(newFees);
					}
					break;
				case 4:
					$.fn.updatePhotos();
					validateStep(step4ValFields);
					if(imageNames.length == 0) {
						console.log("1 Foto es requerida");
						$('#image_One').validationEngine('showPrompt', 'Se requiere al menos 1 foto!', 'red', 'topRight',true);
						errorVal = true;
					}
					break;
			}
		
			function validateStep(fields) {
				for (var i = 0; i < fields.length; i++) {
					if ($(fields[i]).validationEngine('validate')) {
						errorVal = true;
					}
				}
				if($(".userNameOk").attr('disabled')) {
					console.log("User Name Taken!! - PuBLISH");
					errorVal = true;
				}
				else 
					console.log("User Name Available - Publish");
			}
        }
        
        if(errorVal)
			return false; // return false to stay on step and true to continue navigation 
		else
			return true;
    }
            
    //Auto Populate Name and Email account fields from previous data if Create account is selected
    $("#createAccountGroup").click(function(){
        if($("#createAccount").is(":checked")){
            //Copy values already entered
            $("#userNamePublish").val($("#fullNameOwner").val());
            $("#emailOwner2").val($("#emailOwner").val());
            
            //Show hidden fields
            $("#userNamePublishGroup,#emailOwner2Group,#passwordPublishGroup,#passwordConfirmationGroup").show(500);
            
        }
        else{
            $("#userNamePublishGroup,#emailOwner2Group,#passwordPublishGroup,#passwordConfirmationGroup").hide(500);
        }
    });
    
    //Code to enable the file Browse Upload
    $("#file").pekeUpload();
    
    //Initial State for Payment Button
    $("#submitPayGroup").hide();
    
    //Initial State for SummaryHigilight
    $("#summaryHighlight").hide();
    
    //Highlight Checkmark - Update Cost
    $("#highlight").click(function(){
        if ($(this).is(':checked')) {
            highlightCost = 10;
            $("#summaryHighlight").show(500);
        }
        else{
            highlightCost = 0;
            $("#summaryHighlight").hide(500);
        }
        updateTotalSale();
    });

    //Initial State for Summary Photos
    $("#summaryFivePhotos").hide();
    $("#summaryOnePhoto").show(); 
    
    //Image Checkmarks - Update Qty and Costs
    $("#image_One").click(function() {
        if ($(this).is(':checked')) {
            $("#photoTotal").text("1");
            totalImages = 1;
            imageCost = 0;
            $("#summaryFivePhotos").hide(500);
            $("#summaryOnePhoto").show(500);
        }
        else {
            $("#photoTotal").text("5");
            totalImages = 5;
            
            // Remove when offer ends
            //imageCost = 5;
            
            imageCost = 0;
            $("#summaryFivePhotos").show(500);
            $("#summaryOnePhoto").hide(500);
        }
        
        updateTotalSale();
    });
    $("#image_Three").click(function() {
        if ($(this).is(':checked')) {
            $("#photoTotal").text("5");
            totalImages = 5;
            
            // Remove when offer ends
            //imageCost = 5;
            
            imageCost = 0;
            $("#summaryFivePhotos").show(500);
            $("#summaryOnePhoto").hide(500);
        }
        else {
            $("#photoTotal").text("1");
            totalImages = 1;
            imageCost = 0;
            $("#summaryFivePhotos").hide(500);
            $("#summaryOnePhoto").show(500);
        }
        
        updateTotalSale();
    });

    //Hide Photo Delete confirmation Dialog
    $("#dialog-confirm").hide(1);

    //Code to Submit Get Pay Token, and Submit for for processing and Charge Credit Card.
    $('#submitPay').on('click', function(event) {
        event.preventDefault();
        
        //Verify validation of last Step before presenting Checkout Modal
        var step5ValFields = new Array("#terms");
        var validationOk = true;
        
        for (var i = 0; i < step5ValFields.length; i++)
        if ($(step5ValFields[i]).validationEngine('validate')) {
            validationOk = false;
        }
        
        //If validation is OK, then present Modal Checkout
        if(validationOk){
            
            //Get Button and Form
            var $button = $(this);
            var $form = $button.parents('form');

            //Change Value of button Amount
            var total = $("#totalSale").val()*100;
            $button.data("amount",total);

            //Change Descriptio of Modal Dialog
            var description;
            if(imageCost > 0){
                description = "Clasificado con Fotos Extras (hasta 5 fotos)";

                if(highlightCost > 0)
                    description = "Clasificado Destacado con Fotos Extras (hasta 5 fotos)";
            }
            else{
                description = "Clasificado Destacado";
            }
            //Modify button data
            $button.data("description", description);

			//Update Photos Names in Input Variables
			$.fn.updatePhotos();
			
			//Show Spinner to feedback user
			$("#submitPaySpinner").removeClass("hidden");
			setTimeout(hideStripeCheckoutSpinner, 10000);
			
            var opts = $.extend({}, $button.data(), {            	
                token: function(result) {
                    $form.append($('<input>').attr({type: 'hidden', name: 'stripeToken', value: result.id}));
                    
                    $.post($form.attr("action"), $form.serialize(), function(data) { 
						/** code to handle response **/ 
						if(data != "error") {
						
							if(data == "redirect") {
								window.location.replace("/");
								$('#detailsDrawer').show(400);
								$('#detailsData').html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
							}
							
							$('#formProcessingModal').modal('hide');
							$('#mainForm')[0].reset();
							$('#publishDrawer').hide(800);
							$('#searchDrawer').show(800);
							
							$('#detailsDrawer').removeClass('hidden');
							$('#detailsDrawer').show(800, function() {
								//Placed after animation to ensure correct initialization of gallery
								$('#detailsData').html(data);
							});
							
							$("#submitPaySpinner").addClass("hidden");
							myaccountLoaded = false;
							
							//Reset Buttons
							$("#publishBtn0").html("Publicar");
							$("#publishBtn1").html("Publicar");
							$("#publishBtn2").html("Publicar");
						}
						else {
							$('#formProcessingModal').modal('hide');
							$('#formErrorModal').modal('show');
						}
                    }); 
                    $('#formProcessingModal').modal('show');
                    
                    //Hide Spinner to feedback user
					$("#submitPaySpinner").addClass("hidden");
                }
                
            });

            //Call Open the Chechout Modal
            StripeCheckout.open(opts);
        }
    });
    
    //Code to Submit Get Pay Token, and Submit for for processing and Charge Credit Card.
    $('#submitFree').on('click', function(event) {
        event.preventDefault();
        
        //Verify validation of last Step before presenting Checkout Modal
        var step5ValFields = new Array("#terms");
        var validationOk = true;
        
        for (var i = 0; i < step5ValFields.length; i++)
        if ($(step5ValFields[i]).validationEngine('validate')) {
            validationOk = false;
        }
        
        //If validation is OK, then present Modal Checkout
        if(validationOk){
            
            //Update Photos Names in Input Variables
			$.fn.updatePhotos();
            
            //Get Form
            var $form = $(this).parents('form');

			$.post($form.attr("action"), $form.serialize(), function(data) { 
				//Modal Window to Show Processing Icon
				$('#formProcessingModal').modal('hide');
				if(data != "error") {
					if(data == "redirect") {
						window.location.replace("/");
						$('#detailsDrawer').show(400);
						$('#detailsData').html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
					}
					$('#mainForm')[0].reset();
					$('#publishDrawer').hide(800);
					$('#searchDrawer').show(800);
					
					$('#detailsDrawer').show(800, function() {
						//Placed after animation to ensure correct initialization of gallery
						$('#detailsData').html(data);
					});
					
					myaccountLoaded = false;
					
					//Reset Buttons
					$("#publishBtn0").html("Publicar");
					$("#publishBtn1").html("Publicar");
					$("#publishBtn2").html("Publicar");
				}
				else {
					console.log("Error Found: "+data);
					$('#formProcessingModal').modal('hide');
					$('#formErrorModal').modal('show');
				}
			}); 
			$('#formProcessingModal').modal('show');
        }
    });
    
    //On 'username' keyup, start timer countdown
	$('.userName').keyup(function(){
		currentUsernameField = $(this);
		clearTimeout(typingTimer);
		if ($(this).val()) {
			typingTimer = setTimeout(doneTyping, doneTypingInterval);
		}
	});
	
    //Code to HIDE or SHOW Fields for Realtor or Owner
    $("#fullNameRealtorGroup,#emailRealtorGroup,#phoneRealtorGroup").hide(1);
    $("#userNamePublishGroup,#emailOwner2Group,#passwordPublishGroup,#passwordConfirmationGroup").hide(1);
    
    $("#ownerOrRealtor1").click(function () {
      $("#fullNameOwnerGroup,#emailOwnerGroup,#phoneOwnerGroup").show(500);
      $("#fullNameRealtorGroup,#emailRealtorGroup,#phoneRealtorGroup").hide(500);
    });
    
    $("#ownerOrRealtor2").click(function () {
      $("#fullNameRealtorGroup,#emailRealtorGroup,#phoneRealtorGroup").show(500);
      $("#fullNameOwnerGroup,#emailOwnerGroup,#phoneOwnerGroup").hide(500);
    });
	
    /********** CODE TO POPULATE DROPDOWNS ************/
    //LOAD STATES IN DROPDOWN
    var states = {
        'PUERTO RICO': 'PR', 'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'DISTRICT OF COLUMBIA': 'DC',
        'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
        'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
        'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PALAU': 'PW', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI',
        'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT', 'VIRGIN ISLANDS': 'VI', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
        'WISCONSIN': 'WI', 'WYOMING': 'WY'};
    for (var text in states) {
        var val = states[text];
        $('<option/>').val(val).text(text).appendTo($('#stateOwner'));
    };

    //LOAD TOWNS IN DROPDOWN
    var towns = {'Seleccione': '', 'Adjuntas': 'Adjuntas', 'Aguada': 'Aguada', 'Aguadilla': 'Aguadilla', 'Aguas Buenas': 'Aguas Buenas', 'Aibonito': 'Aibonito', 'Añasco': 'Añasco', 'Arecibo': 'Arecibo',
        'Arroyo': 'Arroyo', 'Barceloneta': 'Barceloneta', 'Barranquitas': 'Barranquitas', 'Bayamón': 'Bayamón', 'Cabo Rojo': 'Cabo Rojo', 'Caguas': 'Caguas', 'Camuy': 'Camuy', 'Canóvanas': 'Canóvanas',
        'Carolina': 'Carolina', 'Cataño': 'Cataño', 'Cayey': 'Cayey', 'Ceiba': 'Ceiba', 'Ciales': 'Ciales', 'Cidra': 'Cidra', 'Coamo': 'Coamo', 'Comerío': 'Comerío', 'Corozal': 'Corozal', 'Culebra': 'Culebra',
        'Dorado': 'Dorado', 'Fajardo': 'Fajardo', 'Florida': 'Florida', 'Guánica': 'Guánica', 'Guayama': 'Guayama', 'Guayanilla': 'Guayanilla', 'Guaynabo': 'Guaynabo', 'Gurabo': 'Gurabo', 'Hatillo': 'Hatillo',
        'Hormigueros': 'Hormigueros', 'Humacao': 'Humacao', 'Isabela': 'Isabela', 'Jayuya': 'Jayuya', 'Juana Díaz': 'Juana Díaz', 'Juncos': 'Juncos', 'Lajas': 'Lajas', 'Lares': 'Lares', 'Las Marías': 'Las Marías',
        'Las Piedras': 'Las Piedras', 'Loíza': 'Loíza', 'Luquillo': 'Luquillo', 'Manatí': 'Manatí', 'Maricao': 'Maricao', 'Maunabo': 'Maunabo', 'Mayagüez': 'Mayagüez', 'Moca': 'Moca', 'Morovis': 'Morovis',
        'Naguabo': 'Naguabo', 'Naranjito': 'Naranjito', 'Orocovis': 'Orocovis', 'Patillas': 'Patillas', 'Peñuelas': 'Peñuelas', 'Ponce': 'Ponce', 'Quebradillas': 'Quebradillas', 'Rincón': 'Rincón',
        'Río Grande': 'Río Grande', 'Sabana Grande': 'Sabana Grande', 'Salinas': 'Salinas', 'San Germán': 'San Germán', 'San Juan': 'San Juan', 'San Lorenzo': 'San Lorenzo', 'San Sebastián': 'San Sebastián',
        'Santa Isabel': 'Santa Isabel', 'Toa Alta': 'Toa Alta', 'Toa Baja': 'Toa Baja', 'Trujillo Alto': 'Trujillo Alto', 'Utuado': 'Utuado', 'Vega Alta': 'Vega Alta', 'Vega Baja': 'Vega Baja',
        'Vieques': 'Vieques', 'Villalba': 'Villalba', 'Yabucoa': 'Yabucoa', 'Yauco': 'Yauco'};
    for (var text in towns) {
        var val = towns[text];
        $('<option/>').val(val).text(text).appendTo($('#town'));
    };

    //LOAD PROPERTY TYPES IN DROPDOWN
    var properties = {'Seleccione': '', 'Casa': 'Casa', 'Casa Multifamiliar': 'Multifamiliar', 'Apartamento': 'Apartamento', 'Condominio': 'Condominio', 'Inversión': 'Inversión', 'Terreno': 'Terreno'};
    for (var text in properties) {
        var val = properties[text];
        $('<option/>').val(val).text(text).appendTo($('#property'));
    };
    
    //LOAD BEDROOMS IN DROPDOWN
    var bedrooms = [['Seleccione',''],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['10+','10'],['N/A','0']];
    for (var i=0;i<bedrooms.length;i++) {
        var text = bedrooms[i][0];
        var val = bedrooms[i][1];
        $('<option/>').val(val).text(text).appendTo($('#bedrooms'));
    };

    //LOAD BATHROOMS IN DROPDOWN
    var bathrooms = [['Seleccione',''],['1','1'],['1 y Medio','1.5'],['2','2'],['2 y Medio','2.5'],['3','3'],['3 y Medio','3.5'],['4','4'],['4 y Medio','4.5'],['5','5'],['5 y Medio','5.5'],['6+','6'],['N/A','0']];
    for (var i=0;i<bathrooms.length;i++) {
        var text = bathrooms[i][0];
        var val = bathrooms[i][1];
        $('<option/>').val(val).text(text).appendTo($('#bathrooms'));
    };

    //LOAD STORIES TYPES IN DROPDOWN
    var storie = {'Seleccione': '', 'Un (1) Piso': 'Un (1) Piso', 'Dos (2) Pisos': 'Dos (2) Pisos', 'Tres (3) Pisos': 'Tres (3) Pisos', 'Penthouse': 'Penthouse', 'Piso Alto': 'Piso Alto', 'Piso Medio': 'Piso Medio', 'Piso Bajo': 'Piso Bajo', 'Garden': 'Garden'};
    for (var text in storie) {
        var val = storie[text];
        $('<option/>').val(val).text(text).appendTo($('#storie'));
    };

    //LOAD PARKING IN DROPDOWN
    var parking = [['Seleccione',''],['1','1'],['2','2'],['3','3'],['4','4'],['5+','5+'],['N/A','N/A']];
    for (var i=0;i<parking.length;i++) {
        var text = parking[i][0];
        var val = parking[i][1];
        $('<option/>').val(val).text(text).appendTo($('#parking'));
    };
}); 