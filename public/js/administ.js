/* GLOBAL VARIABLES 
------------------------------------------------ */

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
    $("#administAccordion").accordion({
    	icons: icons,
    	heightStyle: "content",
    	active:0
    });

    /* ACTIONS ON THE DOM
	------------------------------------------------ */	
	$("#submitClasi").click(function(e) {
		e.preventDefault();
		$("#classifiedChangeDrawer").removeClass('hidden');
		$("#classifiedChangeData").empty();
		$("#classifiedChangeData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
		$("#administAccordion").accordion( "option", "active", 1 );
		$("#classifiedChangeDrawer").show(800);
		$("#publishData").empty();
		var id = $("#ClasiNum").val();
		$.post('/geteditdata', { id: id }, function(data) {
			if(data != "error") {
				console.log("no hubo error");
				$('#classifiedChangeData').html(data);
			}
			else {
				console.log("Error...!!!");
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
	
	$("#classifiedEndedChangeCloseBtn").click(function(e){
		e.preventDefault();
		$("#classifiedEndedChangeDrawer").hide();
		$("#classifiedEndedSummaryData").show(800);
	});
	
});