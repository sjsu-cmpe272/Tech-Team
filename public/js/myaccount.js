/* GLOBAL VARIABLES 
------------------------------------------------ */
var imageNames = new Array();
var totalImages = 1;

//Funciton to delete Uploades Files and HTML components
function deleteFiles(e){	
	var fileName;
	var detachedNode;
	
	//Try to get parent element from Browse File action...
	var fileIdBrowse = $(e).closest(".file").attr("id");
	console.log("File Encontrado: "+fileIdBrowse);
	
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
}

$(document).ready(function(){

	/* INITIALIZATION OF VARIABLES OR ELEMENTS
	------------------------------------------------ */
	
	$(".tooltip-edit, .tooltip-extent").tooltip();
	
	//Initialization of the Accordion Variables
    var icons = {
    	header: "ui-icon-circle-arrow-e",
    	activeHeader: "ui-icon-circle-arrow-s"
    };
    
    //Initialization of the Accordion	
    $("#myaccountAccordion").accordion({
    	icons: icons,
    	heightStyle: "content",
    	active:1
    });
    
    //Initial Hidding of the Password Change Drawer
    $("#passwordChangeDrawer").hide();
    
    //Disable Change Button (User Data & Password) on initial state
	$(".btnReady").attr('disabled' , true);
	$(".btnReadyPass").attr('disabled' , true);
	
	//Initialization of Validation on Forms
    $("#changeUserEmailForm").validationEngine('attach', {promptPosition : "topLeft"});
    $("#changePasswordForm").validationEngine('attach', {promptPosition : "topLeft"});
    $("#changeDataForm").validationEngine('attach', {promptPosition : "topLeft"});
    
	//Code to enable the file Browse Upload
    $("#myAccountFile").pekeUpload();
    
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
    
    /* ACTIONS ON THE DOM
	------------------------------------------------ */
    $("#myAccountCloseBtn").click(function() {
    
    	if(resultsLoaded) {
			$("#myaccountDrawer").hide();
			$("#searchDrawer").show(800);
			$("#resultsDrawer").show(800);
		}
		else {
			console.log("Re-loading Results...");
			initialResults();
			$("#resultsData").html("<div class='text-center largemargintop'><h1>Cargando... <i class='icon-refresh icon-spin'></i></h1></div>");
			$("#myaccountDrawer").hide();
			$("#searchDrawer").show(800);
			$("#resultsDrawer").show(800);
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

	//Detect when Users Fields Changed
	$(".changed").change(function() {
		if($(this).attr("id") == "changeEmail") {
			$(".btnReady").attr('disabled', false);
		}
		else {
			if(!$(".userNameOk").attr('disabled')) {
				$(".btnReady").attr('disabled', false);
			}
			else {
				$(".btnReady").attr('disabled', true);
			}
			
			$(".result").empty();
		}
	});
	
	//Trigger Post to server to Change User Data
	$("#changeUserEmailBtn").click(function(e) {
		e.preventDefault();
		var $form = $("#changeUserEmailForm");
		
		$.post($form.attr("action"), $form.serialize(), function(data) { 	
			if(data == "done") {
				$(".result").html("<font color='#78ca13'><h2 class='nomarginall'><span class='glyphicon glyphicon-saved'></span></h2></font>");
				$(".btnReady").attr('disabled' , true);
			}
			else {
				$(".result").html("<font color='red'><h2 class='nomarginall'><span class='glyphicon glyphicon-warning-sign'></span></h2></font>");
				$(".btnReady").attr('disabled' , true);
			}
		});
	});
	
	//User Clicked the Change Password Link
	$("#changePasswordBtn").click(function(e) {
		e.preventDefault();
		$("#passwordChangeDrawer").toggle("slow");
	});
	
	//Detect when Password Fields Changed
	$(".changedPass").change(function() {
		console.log("Vamos a Verificar si validan los Fields");
		if (!$("#changeConfirmPassword").validationEngine('validate')) {
			$(".btnReadyPass").attr('disabled', false);
		}
		else
			$(".btnReadyPass").attr('disabled', true);

		$(".resultPass").empty();
	});
	
	//Trigger Post to server to Change User Data
	$("#changePassBtn").click(function(e) {
		e.preventDefault();
		var $form = $("#changePasswordForm");
		
		$.post($form.attr("action"), $form.serialize(), function(data) { 	
			if(data == "done") {
				$(".resultPass").html("<font color='#78ca13'><h2 class='nomarginall'><span class='glyphicon glyphicon-saved'></span></h2></font>");
				$(".btnReadyPass").attr('disabled' , true);
			}
			else {
				$(".resultPass").html("<font color='red'><h2 class='nomarginall'><span class='glyphicon glyphicon-warning-sign'></span></h2></font>");
				$(".btnReadyPass").attr('disabled' , true);
			}
		});
	});
	
	$("#savePicBtn").click(function(e) {
		e.preventDefault();
		$.fn.updatePhotos();

		$.post('/changeuserpic', {id:$("#userId").val(), pic:$('#myAccountPhoto1').val()}, function(data) { 	
			if(data == "done") {
				$(".resultPic").html("<font color='#78ca13'><h2 class='nomarginall'><span class='glyphicon glyphicon-saved'></span></h2></font>");
				$("#userPic").attr('src', "https://s3.amazonaws.com/clasinuevos/uploads/"+$('#myAccountPhoto1').val() );
				$("#myAccountPhoto1").val("");
				imageNames.length = 0;
				$('#changePicModal').modal('hide');
			}
			else {
				$(".resultPic").html("<font color='red'><h2 class='nomarginall'><span class='glyphicon glyphicon-warning-sign'></span></h2></font>");
				$("#myAccountPhoto1").val("");
				imageNames.length = 0;
				$('#changePicModal').modal('hide');
			}
			$(".file").remove();
		});
		
	});
	
	$("#closePicBtn").click(function(e) {
		e.preventDefault();
		
		console.log("Cerrar Modal y Reset");
		var fileInput = $("#myAccountFile");
		deleteFiles($("#progress-peke"));

		//Delete file input elements
		$("#clear").on("click", function () {
			fileInput.replaceWith( fileInput = fileInput.clone( true ) );
		});
		
		$("#myAccountPhoto1").val("");
		imageNames.length = 0;
		$('#changePicModal').modal('hide')

	});
	
	$(".changeDetailsBtn").click(function(e) {
		e.preventDefault();
		$('#classifiedSummaryData').hide();
		$("#classifiedChangeDrawer").removeClass('hidden');
		$("#classifiedChangeData").empty();
		$("#classifiedChangeData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
		$("#classifiedChangeDrawer").show(800);
		$("#publishData").empty();
		var id = $(this).attr('name');
		$.post('/geteditdata', { id: id }, function(data) {
			if(data != "error") {
				$('#classifiedChangeData').html(data);
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
			}
		}); 
	});
	
	$("#classifiedChangeCloseBtn").click(function(e){
		e.preventDefault();
		$("#classifiedChangeDrawer").hide();
		$("#classifiedSummaryData").show(800);
	});
	
	$(".changeEndedDetailsBtn").click(function(e) {
		e.preventDefault();
		$('#classifiedEndedSummaryData').hide();
		$("#classifiedEndedChangeDrawer").removeClass('hidden');
		$("#classifiedEndedChangeData").empty();
		$("#classifiedEndedChangeData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
		$("#classifiedEndedChangeDrawer").show(800);
		$("#publishData").empty();
		var id = $(this).attr('name');
		$.post('/geteditdata', { id: id }, function(data) {
			if(data != "error") {
				$('#classifiedEndedChangeData').html(data);
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
			}
		}); 
	});
	
	$("#classifiedEndedChangeCloseBtn").click(function(e){
		e.preventDefault();
		$("#classifiedEndedChangeDrawer").hide();
		$("#classifiedEndedSummaryData").show(800);
	});
	
	$(".extendEndedBtn").click(function(e) {
		e.preventDefault();
		
		$.post('/extent', { id: id }, function(data) {
			if(data != "error") {
				$('#classifiedEndedChangeData').html(data);
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
			}
		}); 
		
	});
	
	/* FUNCTIONS
	------------------------------------------------ */

	//Update Photos Variables in step 4 of Wizard
    $.fn.updatePhotos = function() {
        if(imageNames[0]) {
            $('#myAccountPhoto1').val(imageNames[0]);
        }
        else {
			$('#myAccountPhoto1').val();
        }
    };
	
});