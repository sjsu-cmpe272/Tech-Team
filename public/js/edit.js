/* Google MAPS
------------------------------------------------ */
var map;

function initialize(lat,lng) {
	detectBrowser();
	var myPlace = new google.maps.LatLng(lat,lng);

	// Enable the visual refresh
	google.maps.visualRefresh = true;
  
	map = new google.maps.Map(document.getElementById('editMapDraw'), {
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
		document.getElementById("editLatitude").value = this.getPosition().lat();
		document.getElementById("editLongitud").value = this.getPosition().lng();
		$("#editSubmitFree,#editSubmitPay").prop("disabled",false);
	});
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCtkn29Z1Pulf0jlET41kX9yO7yiaLFq-I&sensor=false';
  //script.src =  'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false';
  document.body.appendChild(script);
}

function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("editMapDraw");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '300px';
  } else {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '650px';
  }
}

window.onload = loadScript;

var loadedFlag = 0;

/* BlueImp Gallery 
------------------------------------------------ */
document.getElementById('editLinks').onclick = function (event) {
    event = event || window.event;
    var target = event.target || event.srcElement,
        link = target.src ? target.parentNode : target,
        options = {index: link, event: event},
        links = this.getElementsByTagName('a');
    blueimp.Gallery(links, options);
};

/* GLOBAL VARIABLES 
------------------------------------------------ */
var imageNames = new Array();
var oldImageNames = new Array();
var totalImages = 1;
var imageCost = 0;
var highlightCost = 0;
var totalCost = 0;
var classifiedIDtoDelete =-1;
//Photo Input Timer
var photoTimer;
var deleteCaller;  //Variable to establish the button pressed for the deletion of a photo

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

function delOldFiles() {
	var oldFiles;
	var fileName;
	var detachedNode;
	var index;
	
	//Dialog to confirm deletion of Photo
    $("#editDialog-confirm").dialog("close");
	
	//Try to get parent element from a current Photos...
	oldFiles = $(deleteCaller).parent("div").attr("id");
	console.log("OldFIle to delete #2: "+oldFiles);
	
	//Assign ID attribute to var fileName
	fileName = $(deleteCaller).parent("div").children("img").attr("alt");
	console.log("OldFIle Name #2: "+fileName);
	
	if(oldFiles){
		console.log("Old File Detected...");
		$(deleteCaller).parent("div").hide('slow', function () {
			//Detach element
			if($(this).detach())
				detachedNode = $(this);
			
			//Remove file name from array
			index = imageNames.indexOf(fileName);
			console.log("Pictures #: "+imageNames.length);
			console.log("Pictures #1: "+imageNames[0]);
			console.log("INDEX found: "+index);

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
							$(deleteCaller).closest("#dropbox > .message").after(detachedNode);
						}
						oldFiles = null;
						fileName = null;
						if($(detachedNode).remove())
							console.log("Success Removing Node");
						else
							console.log("Error Removeing Node...");
					}
			});
		});
	}
	
	//Try to get parent element from a Drop action...
	var fileIdDrop = $(deleteCaller).parent(".preview").find("img").attr("id");

	if(fileIdDrop){
		console.log("File Drop Detected...");
		$(deleteCaller).parent(".preview").hide('slow', function () {
			//Detach element
			if($(this).detach())
				detachedNode = $(this);
			
			//Assign ID attribute to var fileName
			fileName = fileIdDrop;

			//Remove file name from array
			index = imageNames.indexOf(fileIdDrop);
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
							$(deleteCaller).closest("#dropbox > .message").after(detachedNode);
						}
						
					}
			});
		});
	}
	
	//Try to get parent element from Browse File action...
	var fileIdBrowse = $(deleteCaller).closest(".file").attr("id");
	
	if(fileIdBrowse){
		console.log("File Browse Detected...");
		$(deleteCaller).closest(".file").hide('slow', function () {
			//Detach element
			if($(this).detach())
				detachedNode = $(this);
			
			//Assign ID attribute to var fileName
			fileName = fileIdBrowse;

			//Remove file name from array
			index = imageNames.indexOf(fileIdBrowse);
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
							$(deleteCaller).closest(".pekecontainer").after(detachedNode);
						}
					}
			});
		});
	}
}

//Funciton to delete Uploades Files and HTML components
function deleteClassified(classifiedIdTBD){
	//Set the Id to delete globally
	classifiedIDtoDelete = classifiedIdTBD;
	
	//Dialog to confirm deletion of Classified
    $("#editDelete-confirm").dialog("open");
} 
	
function updateTotalSale(){
    totalCost = imageCost + highlightCost;
    if(!totalCost){
        $("#editSubmitPayGroup").hide(200);
        $("#editSubmitPublishGroup").show(500);
        $(".costSummary").html("Gratis!");
    }
    else{
        $("#editSubmitPayGroup").show(500);
        $("#editSubmitPublishGroup").hide(200);
        $(".costSummary").html("$"+( (totalCost).formatMoney(2)) );
    }
    $("#editTotalSale").val(totalCost);
};

// FORM MANIPULATION jQUERY -->
$(document).ready(function() {
	//call DeleteFiles function
	$(".deleteFile").click(function(e) {
		e.preventDefault();
		
		deleteCaller = $(this);  //Set Caller

		//Dialog to confirm deletion of Photo
    	$("#editDialog-confirm").dialog("open");
	});
	
	$("#editDialog-confirm").dialog({
        modal: true,
        autoOpen:false,
        buttons: {
            "Borrar": function(){
            	delOldFiles();
            },
            "Cancelar": function() {
                $(this).dialog( "close" );
            }
        }
    });
    
	//Call Delete Classified Modal Dialog
	$("#editDelete-confirm").dialog({
		modal: true,
		autoOpen:false,
		buttons: {
			"Borrar": function() {
				$.post("/deleteclassified",{id:classifiedIDtoDelete}, function(data) {
					if(data == "done") {
						$("#class"+classifiedIDtoDelete).remove();
						$("#classifiedChangeData").hide(400);
						$("#classifiedChangeData").empty();
						$("#editDelete-confirm").dialog( "close" );
						$("#classifiedChangeDrawer").hide();
						$("#classifiedSummaryData").show(800);
						resultsLoaded = false;
						clearTimeout(photoTimer);

					}
				});
			},
			"Cancelar": function() {
				$(this).dialog( "close" );
			}
		}
	});
	
	//Show Highlight example MODAL
	$("#editHighlightExampleLink").click(function(e) {
		e.preventDefault();
		$('#editHighlightExampleModal').modal('show');
	});
	
	//Trigger GeoLocation Lookup on Address Change
	$("#editLookupCoords").click(function(e){
		e.preventDefault();
		if (!$("#editTown").validationEngine('validate')) {
			if($("#editNeighborhood").val() && $("#editAddress").val() && $("#editTown").val() && $("#editStateOwner").val()) {
				$("#editMapDrawGroup").removeClass('hidden');
				$("#editMapDrawGroup").show(400);
				$("#editMapError").html("");
				getCoordinates();
			}
			else {
				$("#editMapError").html("<h2 class='text-center'>Por Favor, complete todos los espacios...!</h2>");
			}
		}
		else {
			$("#editMapError").html("<h2 class='text-center'>Por Favor, seleccione el pueblo donde se encuentra su propiedad...</h2>");
		}
	});

	//Trigger GeoLocation Lookup on Address Change
	$(".addressChange").change(function(){
		//Update Coordinates Longitud and Latitude
		getCoordinates();
	});
	
	//Disable Submit Buttons until something is changed in the form
	$("#editSubmitFree").prop("disabled",true);
	$("#editSubmitPay").prop("disabled",true);
	
	//Set the classified total images based on template rendering
	totalImages = parseInt($("#photoTotal").html());

	//Create and Set Timer to update Photos Inputs on Small Time Interval
	photoTimer = setTimeout(editUpdatePhotos, 5000);
	
	$(":input").change(function(){
		$("#editSubmitFree").prop("disabled",false);
		$("#editSubmitPay").prop("disabled",false);
	});

	//Populate "imageNames" array
	var photosAvailable = $("#photoUploads").html();
	var photosTotal = $("#photoTotal").html();
	for(var a=1; a<=photosAvailable; a++){
		imageNames.push($("#photoImg"+a).attr("alt"));
    }
    
    //Adjust the form for Rent or Sell
    $("#editSellOrRentGroup").click(function(){
        if($('#editSellOrRent2').is(":checked")){
            $("#editSellOrRentLabel").text("Renta ");
            $("#editPrice").attr("placeholder","Renta Mensual");
        }
        else{
            $("#editSellOrRentLabel").text("Precio ");
            $("#editPrice").attr("placeholder","Precio de Venta");
        }
    });
    
    //Dialog for telling the user to wait until the classified is completed
    $("#editProcessingDialog").dialog({
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
    $("#editMainForm").validationEngine('attach', {promptPosition : "topLeft",scroll: true});
    
    //Update Photos Variables in step 4 of Wizard
    $.fn.editUpdatePhotos = function() {
    	var newPhotos = false;
    	
    	console.log("Updating Photos...");
    	
    	for(var c=0; c < imageNames.length; c++){
    		if(imageNames[c] != oldImageNames[c])
    			newPhotos = true;
    	}
    	
        if(imageNames[0]){
            $('#editPhoto1').val(imageNames[0]);
        }
        else {
        	$('#editPhoto1').removeAttr("value");
        }
        if(imageNames[1]) {
            $('#editPhoto2').val(imageNames[1]);
        }
        else {
        	$('#editPhoto2').removeAttr("value");
        }
        if(imageNames[2]) {
            $('#editPhoto3').val(imageNames[2]);
        }
        else {
        	$('#editPhoto3').removeAttr("value");
        }
        if(imageNames[3]) {
            $('#editPhoto4').val(imageNames[3]);
        }
        else {
        	$('#editPhoto4').removeAttr("value");
        }
        if(imageNames[4]) {
            $('#editPhoto5').val(imageNames[4]);
        }
        else {
        	$('#editPhoto5').removeAttr("value");
        }
        
        //Reset photos to History Variable
        oldImageNames = imageNames;
        
        //Execute Post is Photos has changed
        if(newPhotos) photosChanged();
    };
    
	//Validate each Step of the form before changing to next step
    function editLeaveAStepCallback(){
        var fields = new Array("#editFullNameOwner","#editEmailOwner","#editPhoneOwner","#editFullNameRealtor","#editEmailRealtor","#editPhoneRealtor","#editNeighborhood","#editAddress","#editTown","#editProperty","#editYear","#editBedrooms","#editBathrooms","#editSqft","#editPrice","#editFees","#editDescription");
        var errorVal = false;

		//Change Price and Fee and Strip any character ('$', ',');
		var price = $("#editPrice").val();
		var newPrice = Number(price.replace(/[^0-9\.]+/g,""));
		$("#editPrice").val(newPrice);
		
		var fees = $("#editFees").val();
		var newFees = Number(fees.replace(/[^0-9\.]+/g,""));
		$("#editFees").val(newFees);

		//Update Photos
		$.fn.editUpdatePhotos();
        
		
		for (var i = 0; i < fields.length; i++) {
			if ($(fields[i]).validationEngine('validate')) {
				errorVal = true;
			}
		}
		
		
		$(editMainForm).validationEngine('validate');
		
		//SQFT value converted after validation to avoid rejection from validation engine (cero value "0")
		var sqft = $("#editSqft").val();
		var newSqft = Number(sqft.replace(/[^0-9\.]+/g,""));
		$("#editSqft").val(newSqft);
		console.log("SQFT Value After Convertion to Number: "+newSqft);
			
        if(errorVal)
			return false; // return false to stay on step and true to continue navigation 
		else
			return true;
    }
    
    //Code to enable the file Browse Upload
    $("#editFile").pekeUpload();
    
    //Initial State for Payment Button
    $("#editSubmitPayGroup").hide();
    
    //Initial State for SummaryHigilight
    $("#editSummaryHighlight").hide();
    
    //Highlight Checkmark - Update Cost
    $("#editHighlight").click(function(){
        if ($(this).is(':checked')) {
            highlightCost = 10;
            $("#editSummaryHighlight").show(500);
        }
        else{
            highlightCost = 0;
            $("#editSummaryHighlight").hide(500);
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
            imageCost = 5;
            $("#summaryFivePhotos").show(500);
            $("#summaryOnePhoto").hide(500);
        }
        
        updateTotalSale();
    });
    
    $("#image_Three").click(function() {
        if ($(this).is(':checked')) {
            $("#photoTotal").text("5");
            totalImages = 5;
            imageCost = 5;
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

    //Hide Photo and Classified Delete confirmation Dialog
    $("#editDialog-confirm").hide();
    //$("#delete-confirm").hide();
    
    //Code to Submit Get Pay Token, and Submit for for processing and Charge Credit Card.
    $('#editSubmitPay').on('click', function(event) {
        event.preventDefault();
        
        //If validation is OK, then present Modal Checkout
        var huboError = editLeaveAStepCallback();
		console.log("Hubo Error: "+huboError);
		
        //If validation is OK, then present Modal Checkout
        if(huboError){
            
            //Get Button and Form
            var $button = $(this);
            var $form = $button.parents('form');

            //Change Value of button Amount
            var total = $("#editTotalSale").val()*100;
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
            
            //Modify date to add 30 additional days to actual date
            var endDate = new Date();
			endDate.setDate(endDate.getDate() + 30);
			$("#editEndDate").val(endDate);

			//Update Photos Names in Input Variables
			$.fn.editUpdatePhotos();
			
            var opts = $.extend({}, $button.data(), {
                token: function(result) {
                    $form.append($('<input>').attr({type: 'hidden', name: 'stripeToken', value: result.id}));
                    
                    $.post($form.attr("action"), $form.serialize(), function(data) { 
						/** code to handle response **/ 
						if(data != "error") {
							$('#editFormProcessingModal').modal('hide');
							$('#editMainForm')[0].reset();
							$('#classifiedChangeDrawer').hide();
							$("#classifiedSummaryData").show(800);
							$("#classifiedSummaryData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
							$('#editFormProcessingModal').on('hidden.bs.modal', function () {
								$.get("/userdata", function(data) { 
									if(data){
										$("#myaccountData").html(data);
										clearTimeout(photoTimer);

									}
									else
										$("#classifiedSummaryData").show(800);
								});
							});
						}
						else {
							$('#editFormProcessingModal').modal('hide');
							$('#editFormErrorModal').modal('show');
						}
                    });
                    
					$('#editFormProcessingModal').modal('show');
                }
            });

            //Call Open the Chechout Modal
            StripeCheckout.open(opts);
        }
    });
    
    //Code to Submit Get Pay Token, and Submit for for processing and Charge Credit Card.
    $('#editSubmitFree').on('click', function(event) {
        event.preventDefault();
        
        //If validation is OK, then present Modal Checkout
        var huboError = editLeaveAStepCallback();
		console.log("Hubo Error: "+huboError);

        if(huboError){
			$('#editFormProcessingModal').modal('show');
			
			//Format Date to store in DB
            var endDate = new Date($("#editEndDate").val());
            var formattedDate = endDate.toISOString() ;
			$("#editEndDate").val(formattedDate);
			
			//Update Photos Names in Input Variables
			$.fn.editUpdatePhotos();
			
            //Get Form
            var $form = $(this).parents('form');

			$.post($form.attr("action"), $form.serialize(), function(data) { 
				/** code to handle response **/ 
				if(data != "error") {
					$('#editFormProcessingModal').modal('hide');
					$('#editMainForm')[0].reset();
					$('#classifiedChangeDrawer').hide();
					$("#classifiedSummaryData").show(800);
					$("#classifiedSummaryData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
					$('#editFormProcessingModal').on('hidden.bs.modal', function () {
						$.post("/userdata", {screenSize:$(window).width()}, function(data) { 
							if(data){
								$("#myaccountData").html(data);
								clearTimeout(photoTimer);

							}
							else
								$("#classifiedSummaryData").show(800);
						});
					});
				}
				else {
					$('#editFormProcessingModal').modal('hide');
					$('#editFormErrorModal').modal('show');
				}
			}); 
        }
    });
	
	$("#editDeleteClassifiedBtn").click(function() {
		var classifiedId = $("#editMainForm").attr("name");
		deleteClassified(classifiedId);
	});
	
    //Code to HIDE or SHOW Fields for Realtor or Owner
    $("#editFullNameRealtorGroup,#editEmailRealtorGroup,#editPhoneRealtorGroup").hide();
    $("#editUserNamePublishGroup,#editEmailOwner2Group,#editPasswordPublishGroup,#editPasswordConfirmationGroup").hide();
    
    $("#editOwnerOrRealtor1").click(function () {
      $("#editFullNameOwnerGroup,#editEmailOwnerGroup,#editPhoneOwnerGroup").show(500);
      $("#editFullNameRealtorGroup,#editEmailRealtorGroup,#editPhoneRealtorGroup").hide(500);
    });
    
    $("#editOwnerOrRealtor2").click(function () {
      $("#editFullNameRealtorGroup,#editEmailRealtorGroup,#editPhoneRealtorGroup").show(500);
      $("#editFullNameOwnerGroup,#editEmailOwnerGroup,#editPhoneOwnerGroup").hide(500);
    });
    
    //Get Coordinates from Google Maps
	function getCoordinates(){
		var neighborhood = $("#editNeighborhood").val();
		var address = $("#editAddress").val();
		var town = $("#editTown").val();
		var stateOwner = $("#editStateOwner").val();
		var zipcode = $("#editZipcode").val();
	
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
				$("#editLongitud").val(longitud);
				$("#editLatitude").val(latitude);
			
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
						$("#editLongitud").val(longitud);
						$("#editLatitude").val(latitude);
			
						initialize(latitude,longitud);
			
					}
					else {
						$("#editLongitud").val("");
						$("#editLatitude").val("");
						$("#editMapDraw").html("<h3 class='text-center'>No se pudo encontrar la dirección en el mapa.  Puede cambiar la dirección y tratar nuevamente"+
						" o continuar con el resto de los pasos</h3>");
					}
				});
			}
		});
	}

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
        $('<option/>').val(val).text(text).appendTo($('#editStateOwner'));
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
        $('<option/>').val(val).text(text).appendTo($('#editTown'));
    };

    //LOAD PROPERTY TYPES IN DROPDOWN
    var properties = {'Seleccione': '', 'Casa': 'Casa', 'Casa Multifamiliar': 'Multifamiliar', 'Apartamento': 'Apartamento', 'Condominio': 'Condominio', 'Inversión': 'Inversión', 'Terreno': 'Terreno'};
    for (var text in properties) {
        var val = properties[text];
        $('<option/>').val(val).text(text).appendTo($('#editProperty'));
    };
    
    //LOAD BEDROOMS IN DROPDOWN
    var bedrooms = [['Seleccione',''],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['10+','10+'],['N/A','N/A']];
    for (var i=0;i<bedrooms.length;i++) {
        var text = bedrooms[i][0];
        var val = bedrooms[i][1];
        $('<option/>').val(val).text(text).appendTo($('#editBedrooms'));
    };

    //LOAD BATHROOMS IN DROPDOWN
    var bathrooms = [['Seleccione',''],['1','1'],['1 y Medio','1.5'],['2','2'],['2 y Medio','2.5'],['3','3'],['3 y Medio','3.5'],['4','4'],['4 y Medio','4.5'],['5','5'],['5 y Medio','5.5'],['6+','6+'],['N/A','N/A']];
    for (var i=0;i<bathrooms.length;i++) {
        var text = bathrooms[i][0];
        var val = bathrooms[i][1];
        $('<option/>').val(val).text(text).appendTo($('#editBathrooms'));
    };

    //LOAD STORIES TYPES IN DROPDOWN
    var storie = {'Seleccione': '', 'Un (1) Piso': 'Un (1) Piso', 'Dos (2) Pisos': 'Dos (2) Pisos', 'Tres (3) Pisos': 'Tres (3) Pisos', 'Penthouse': 'Penthouse', 'Piso Alto': 'Piso Alto', 'Piso Medio': 'Piso Medio', 'Piso Bajo': 'Piso Bajo', 'Garden': 'Garden'};
    for (var text in storie) {
        var val = storie[text];
        $('<option/>').val(val).text(text).appendTo($('#editStorie'));
    };

    //LOAD PARKING IN DROPDOWN
    var parking = [['Seleccione',''],['1','1'],['2','2'],['3','3'],['4','4'],['5+','5+'],['N/A','N/A']];
    for (var i=0;i<parking.length;i++) {
        var text = parking[i][0];
        var val = parking[i][1];
        $('<option/>').val(val).text(text).appendTo($('#editParking'));
    };
}); 

//FUNCTIONS
// Function to Update Photos in interval
function editUpdatePhotos() {
	//Update Photos
	$.fn.editUpdatePhotos();
	console.log("Photo Timer Called");
	clearTimeout(photoTimer);
	photoTimer = setTimeout(editUpdatePhotos, 5000);

}

function photosChanged(){
	var classifiedId = $("#editMainForm").attr("name");
	
	//Enable Buttons
	$("#editSubmitFree").prop("disabled",false);
	$("#editSubmitPay").prop("disabled",false);
	
	$.post("/updateNewPhotos",{id:classifiedId, photosArray:imageNames}, function(data) {
		if(data == "done") {
			console.log("Update of Photos Successful!");
			clearTimeout(photoTimer);
			photoTimer = setTimeout(editUpdatePhotos, 5000);
		}
	});
}