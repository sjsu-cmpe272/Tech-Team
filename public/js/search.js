/* Initialization of SwitchButton
-------------------------------------------- */
options = {
		checked: false,       // State of the switch

		show_labels: true,        // Should we show the on and off labels?
		labels_placement: "both",  // Position of the labels: "both", "left" or "right"
		on_label: "Alquiler",           // Text to be displayed when checked
		off_label: "Venta",        // Text to be displayed when unchecked

		width: 60,            // Width of the button in pixels
		height: 20,           // Height of the button in pixels
		button_width: 30         // Width of the sliding part in pixels
	};    
	
$("#sellRentSwitch").switchButton(options);
	
/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){
	
	//Change in pages in "Results"
	$("#searchBtn").click(function(event1){
		event1.preventDefault();
		console.log("Search Button click detected!");
		serverBusqueda($("#currentPageHolder"),"sort");
	});
	
	//Call Server for Data: '.destacados'
	function serverBusqueda(clicked,type) {
		console.log("Executing Function to Post To ServerBusqueda...");

		//Calculate current page and Offset
		var currentPage = parseInt($(clicked).attr("href"));
		
		//Total Pages of last Results
		var page = $(clicked).html();
		
		console.log("CurrentPage: "+currentPage+" Want To Get Page: "+page);
		
		//Handle arrows from paging system
		if(page == String.fromCharCode(171)) {
			page = currentPage-1;
			if(type == "sort")
				page = currentPage;
		}
		if(page == String.fromCharCode(187)) {
			page = currentPage+1;
		}
		else
			page = parseInt(page);
		
		// Get Current Selected Tab
    	var selectedTab = $("#tabs").tabs( "option", "active" );
		console.log("Current Tab Selected Value: "+currentSortVal);

		//Get Current Sort Value
		var currentSortVal = $("#sort").val();
		var currentSort = currentSortVal;
		if(currentSort == "highlight") 
			currentSort = "createdAt DESC";
			
		console.log("Current Sort Value: "+currentSortVal);
		
		//Add Offset to form
		$("#search").append($('<input>').attr({id:"offset", type: 'hidden', name: 'offset', value:0}));
		$("#search").append($('<input>').attr({id:"screenSize", type: 'hidden', name: 'screenSize', value: $(window).width() }) );
		
		//Send data to change page from Destacados
		//Activate Modal Spinner
		$('#searchBtn').html("<i class='icon-refresh icon-spin icon-large'></i>");
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
		$("#offset").remove();
	}
    
    //LOAD TOWNS IN DROPDOWN
    var towns = {'Pueblo': '', 'Adjuntas': 'Adjuntas', 'Aguada': 'Aguada', 'Aguadilla': 'Aguadilla', 'Aguas Buenas': 'Aguas Buenas', 'Aibonito': 'Aibonito', 'Añasco': 'Añasco', 'Arecibo': 'Arecibo',
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
        $('<option/>').val(val).text(text).appendTo($('#townSearch'));
    };
});