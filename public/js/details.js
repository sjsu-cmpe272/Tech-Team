/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){

	// Calc ToolTip
	$(".tooltip-calc").tooltip();
	
	$(".mortgageDetailsDetails").click(function(e) {
		e.preventDefault();
		var price = $(this).attr("href");
		var rate = $(this).attr("name");
		if($("#calcDrawer").is(":visible")) {
			$("#calcDrawer").hide();
			$("#calcBtn").html("Calculadora");
			$("#resultsDrawer").show(800);
			$("#searchDrawer").show(800);
		}
		else {
			$("#calcBtn").html("<i class='icon-refresh icon-spin icon-large'></i>");
			$(this).after("<font color='red'><i class='icon-refresh icon-spin icon-large'></i></font>");
			$(this).addClass("hidden");
			$.post('/calc', {price:price, rate:rate}, function(data) {
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
					$(".mortgageDetailsDetails").removeClass("hidden");
					$(".mortgageDetailsDetails").next("font").remove();
					
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
	});
	
	//Submit Email to Seller
	$("#submitMessageContact").click(function(e) {
		e.preventDefault();
		
		//Verify validation of last Step before presenting Checkout Modal
        var stepFields = new Array("#messageName","#messageEmail","#messageInfo");
        var validationOk = true;
        
        for (var i = 0; i < stepFields.length; i++)
        if ($(stepFields[i]).validationEngine('validate')) {
            validationOk = false;
            console.log("Step "+i+" Validation: "+validationOk);
        }
        
        //If validation is OK, then present Modal Checkout
        if(validationOk){
        
			$.post($("#messageContactForm").attr("action"), $("#messageContactForm").serialize(), function(data) { 
				if(data != "error") {
					$('#contactSeller').modal('hide');
					console.log("Form Sent Ok");
				}
				else {
					$('#contactSeller').modal('hide');
					$('#formProcessingModal').modal('hide');
					$('#formErrorModal').modal('show');
					console.log("Problem sending form");
				}
			}); 
		}
	});

	/* Initialization of Carousel
	-------------------------------------------- */
	
	//Adjust Photos Size
	$(".slides").width("100%");
	$(".slide").width("100%");
	blueimp.Gallery(
		document.getElementById('links').getElementsByTagName('a'),
		{
			container: '#blueimp-gallery-carousel',
			carousel: true
		}
	);
	
	document.getElementById('links').onclick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement,
			link = target.src ? target.parentNode : target,
			options = {index: link, event: event},
			links = this.getElementsByTagName('a');
		blueimp.Gallery(links, options);
	};
	
	/* Actions in the DOM
	-------------------------------------------- */	
	// Atras Button pressed
	$("#atrasBtn").click(function(e) {
		e.preventDefault();
		$("#detailsDrawer").hide( "slide",{ direction: "right" }, 400, function(){
			$("#detailsData").empty();
		});
		if(resultsLoaded) {
			$("#resultsDrawer").delay(400).show( "slide",{ direction: "left" }, 800, function(){
				refreshTab();
			});
		}
		else {
			console.log("Re-loading Results...");
			initialResults();
			$("#resultsData").html("<div class='text-center largemargintop'><h1>Cargando... <i class='icon-refresh icon-spin'></i></h1></div>");
			$("#resultsDrawer").delay(400).show( "slide",{ direction: "left" }, 800, function(){
				console.log("Finish Loading Results and Opening Drawer");
			});
		}
	});
});
