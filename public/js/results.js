/* Google MAPS
------------------------------------------------ */
var map,infowindow,trafficLayer,bikeLayer,weatherLayer,cloudLayer;
var initialLocation;
var sanjuan;
var browserSupportFlag =  new Boolean();

function appendBootstrap() {
	if(!googleMapsLoaded){
		console.log("Addind google map script");
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCtkn29Z1Pulf0jlET41kX9yO7yiaLFq-I&sensor=true&libraries=places,weather&callback=getLocation";
		document.body.appendChild(script);
	}
	else {
		//GetLocation
		getLocation();
	} 
}

function getLocation() {
  //Show spinner during maps load
  $(".loadMapSpinner").html("<i class='icon-refresh icon-spin icon-2x'></i>");
  
  //Set Flag to signal that Google Map script was loaded
  googleMapsLoaded = true;
  
  //Get Initial Location Automatic or setting it at San Juan
  sanjuan = new google.maps.LatLng(18.4500, 66.0667);

  // Enable the visual refresh
  google.maps.visualRefresh = true;
  
  var myOptions = {
    zoom: 15,
    center:sanjuan,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  
  // Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
      console.log("Found Location automatically");
      initialize();
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  }
  else {    // Browser doesn't support Geolocation
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
  
  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      initialLocation = sanjuan;
	  console.log("No Location Found, setting to San Juan");
    } else {
      initialLocation = siberia;
	  console.log("No Location Found, setting to San Juan");
    }
    map.setCenter(initialLocation);
    initialize();
  }
  
    //Set Tabs Actions on Click
	$("#tabs").click(function(){
		var active = $(this).tabs( "option", "active" );
		var width = $(window).width();
		if(width > 749) {
			if(active == 2){
				console.log("Detecting Browser...");
				detectBrowser();
				console.log("Refreshing Tabs...");
				refreshTab();
			}
		}
		else {
			if(active == 1){
				console.log("Detecting Browser...");
				detectBrowser();
				console.log("Refreshing Tabs...");
				refreshTab();
			}
		}
	});
}

function refreshTab(){
	x = map.getZoom();
	c = map.getCenter();
	google.maps.event.trigger(map, 'resize');
	map.setZoom(x);
	map.setCenter(c);
}
  
function initialize() {
  console.log("Initializing Google Maps...");

  var request = {
    location: initialLocation,
    radius: '5000',
    types: ['airport','hospital','police','school']
  };
  
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, serviceCallback);
  
  //Set Traffic, Bike and Weather Layer
  trafficLayer = new google.maps.TrafficLayer();  
  bikeLayer = new google.maps.BicyclingLayer();
  weatherLayer = new google.maps.weather.WeatherLayer({
      temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
  });
  cloudLayer = new google.maps.weather.CloudLayer();
  
  for(var a=0; a < resultsCoords.length; a++){
  	setClassifiedMarks(resultsCoords[a]);
  }
  $(".loadMapSpinner").html("");

}

function serviceCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;

  var iconUrl;
    switch (place.types[0]) {
    case 'school':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal3/icon22.png";
        break;
    case 'church':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon11.png";
        break;
    case 'park':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon12.png";
        break;
    case 'university':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal3/icon22.png";
        break;
    case 'bank':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon50.png";
        break;
    case 'airport':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon48.png";
        break;
    case 'bus_station':
        iconUrl = "https://google.com/mapfiles/ms/micons/bus.png";
        break;
    case 'hospital':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal4/icon55.png";
        break;
    case 'pharmacy':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon1.png";
        break;
    case 'police':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon0.png";
        break;
    case 'post_office':
        iconUrl = "https://google.com/mapfiles/ms/micons/postoffice-us.png";
        break;
    case 'restaurant':
        iconUrl = "https://maps.google.com/mapfiles/kml/pal2/icon38.png";
        break;
    default:
        iconUrl = "https://maps.google.com/mapfiles/kml/pal4/icon26.png";
    }

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon:iconUrl
    });
    
    console.log("Location: "+place.geometry.location);
  	google.maps.event.addListener(marker, 'mouseover', function() {
		infowindow.setContent(place.name + '<br/>' + place.vicinity + '<br/><img src="' + place.icon + '">');
		infowindow.open(map, this);
    });
}

function setClassifiedMarks(placeData) {
	var iconUrl;
	var location = new google.maps.LatLng(placeData.latitude, placeData.longitud);
	var featured = placeData.highlight;
	var vecindario = placeData.neighborhood;
	var direccion = placeData.address;
	var foto = placeData.photo1;
	var fotoUrl = "https://s3.amazonaws.com/clasinuevos/uploads/"+placeData.photo1;
	var precio = placeData.price;
	var clasiImg = new Image();
	var banos = placeData.bathrooms;
	var cuartos = placeData.bedrooms;
	var classifiedId = placeData.id;
	console.log("ClassifiedId: "+classifiedId);
	clasiImg.src = fotoUrl;
	
	var x = clasiImg.width;
	var y = clasiImg.height;
	var ratio = x/y;

	iconUrl = new google.maps.MarkerImage(
		fotoUrl,
		null, 
		null, 
		null, 
		new google.maps.Size(40*ratio, 40)
	); 
	clasiImg.src = fotoUrl;
	
	var homeMarker = new google.maps.Marker({
		map: map,
		position: location,
		icon: iconUrl
	});

	//<a href="/buscar" class="detailsBtn" name="'+classifiedId+'"></a>
	google.maps.event.addListener(homeMarker, 'mouseover', function() {
		infowindow.setContent('<div class="text-center center-fields"><strong>'+vecindario+', '+direccion+'<br>'+precio+', '+cuartos+' cuartos, '+banos+' baños</strong><br/><a href="#" onclick="getDetails(this);" name="'+classifiedId+'"><img class="largethumb" src="'+fotoUrl+'"></a></div>');
		infowindow.open(map, this);
	});
}

function toggleTraffic(){
    trafficLayer.setMap(trafficLayer.getMap() ? null : map);
}

function toggleBicycle(){
    bikeLayer.setMap(bikeLayer.getMap() ? null : map);
}

function toggleWeather(){
    if(weatherLayer.getMap()){
        map.setZoom(16);  //Zoom in
        weatherLayer.setMap(null); //Remove Layer
    }
    else{
        map.setZoom(12);  //Zoom out
        weatherLayer.setMap(map);  //add layer
    }
    
    cloudLayer.setMap(cloudLayer.getMap() ? null : map);
}

function detectBrowser() {
  console.log("Detecting Browser...");
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("map-canvas");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '300px';
    console.log("small screen detected...");
  } else {
    mapdiv.style.width = 'auto';
    mapdiv.style.height = '650px';
	console.log("large screen detected...");
  }
}

function getDetails(caller) {
	$("#detailsDrawer").removeClass('hidden');
	$("#resultsDrawer").hide();
	$("#detailsData").empty();
	$("#detailsData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
	$("#detailsDrawer").show();

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
}

/* Execute When Document is Ready 
------------------------------------------------ */
$(document).ready(function(){
	/* initialization of Elements
	____________________________________________ */
	//Load Google Map Script
	appendBootstrap();
	
	// Calc ToolTip
	$(".tooltip-calc").tooltip();
	
	$(".mortgageDetails").click(function(e) {
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
					$(".mortgageDetails").removeClass("hidden");
					$(".mortgageDetails").next("font").remove();
					
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
	
	$("#spinnerModalCalc").modal({
	  keyboard: false,
	  show: false
	});
	
	//Tabs
	$("#tabs").tabs();
	
	/* Actions in DOM
	____________________________________________ */
	
	//Get to map section and center on map for each classified
	$(".verMapa").click(function(e) {
		e.preventDefault();
		var longitud = $(this).children(".longitud").val();
		var latitude = $(this).children(".latitude").val();
		var width = $(window).width();
		console.log("Width: "+width);
		
		if(width > 749) {
			var setTab = 2;
			console.log("Calling Tab: "+setTab);
		}
		else {
			var setTab = 1;
			console.log("Calling Tab: "+setTab);
		}
		
		$("#tabs").tabs("option", "active", setTab);
		//detectBrowser();

		if(longitud && latitude) {
			console.log("Coodinates found");
			map.setZoom(17);
			google.maps.event.trigger(map, 'resize');
			map.setCenter(new google.maps.LatLng(latitude, longitud));
		}
		else {
			console.log("NOO Coodinates found");
			map.setZoom(10);
			refreshTab();
			
		}
	});
	
	//Change in pages in "Results"
	$(".destacados").click(function(event5){
		event5.preventDefault();
		console.log("page link click detected!");
		
		var currentSortVal;
		var selectedTab = $("#tabs").tabs( "option", "active" );
		if(selectedTab == 1)
			currentSortVal = $("#ordenar2").val();
		else
			currentSortVal = $("#ordenar1").val();
			
		$("#sort").val(currentSortVal);
		
		//Call Function to execute paging
		serverDestacado(this,"click");
		
	});
	
	$(".destacados").change(function(event6){
		event6.preventDefault();
		console.log("sort change detected!");
		
		// Get Current Sort Value from Sort Form
		var currentSortVal = $(this).val();
		console.log("current Sort Val: "+currentSortVal);
		$("#sort").val(currentSortVal);
		
		serverDestacado($("#currentPageHolder"), "sort");
	});
	
	//Call Server for Data: '.destacados'
	function serverDestacado(clicked,type) {
		console.log("Executing Function to Post To ServerDestacado...");
		
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
		console.log("Current Tab Selected Value: "+selectedTab);

		//Get Current Sort Value
		var currentSortVal = $("#sort").val();
		var currentSort = currentSortVal;
			
		console.log("Current Sort Selected Value: "+currentSortVal);
		//Activate Spinner during wait for server response
		$(".ordenarSpinner").empty();
		$(".ordenarSpinner").html("<i class='nopaddingall nomarginall icon-refresh icon-spin icon-2x'></i>");
		
		//Send data to change page from Destacados
		$.post('/destacados',{order: currentSort, offset:((page-1)*10), screenSize:$(window).width()}, function(data) {
			if(data != "error") {
				$('#resultsData').empty();
				$('#resultsData').html(data.html);
				$("#ordenar1, #ordenar2").val(currentSortVal);
				$("#tabs").tabs("option", "active", selectedTab);
				resultsCoords = data.raw;
				refreshTab();
				$(".ordenarSpinner").html("");
				
				//Adjust Side Columns Height
				methodToFixSideColumnsHeight();
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
				$(".ordenarSpinner").html("");
			}
		}); 
		
	}
	
	/* PAGING CHANGE IN BUSQUEDA
	--------------------------------------------------------*/
	//Change in pages in "Results"
	$(".busqueda").click(function(event2){
		event2.preventDefault();
		console.log("page link click detected!");
		
		var currentSortVal;
		var selectedTab = $("#tabs").tabs( "option", "active" );
		if(selectedTab == 1)
			currentSortVal = $("#ordenar2").val();
		else
			currentSortVal = $("#ordenar1").val();
			
		$("#sort").val(currentSortVal);
		
		//Call function to execute Search
		serverBusquedaInResults(this,"click");
	});
	
	$(".busqueda").change(function(event3){
		event3.preventDefault();
		console.log("sort change detected!");
		
		// Get Current Sort Value from Sort Form
		var currentSortVal = $(this).val();
		console.log("current Sort Val: "+currentSortVal);
		$("#sort").val(currentSortVal);
		
		serverBusquedaInResults($("#currentPageHolder"), "sort");
	});
	
	//Call Server for Data: '.destacados'
	function serverBusquedaInResults(clicked,type) {
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
		console.log("Current Tab Selected Value: "+selectedTab);

		//Get Current Sort Value
		var currentSortVal = $("#sort").val();
		var currentSort = currentSortVal;
			
		console.log("Current Sort Value: "+currentSortVal);
		
		//Add Offset to form
		$("#search").append($('<input>').attr({id:"offset", type: 'hidden', name: 'offset', value: ((page-1)*10)}));
		$("#search").append($('<input>').attr({id:"screenSize", type: 'hidden', name: 'screenSize', value: $(window).width() }) );
		
		//Activate Spinner during wait for server response
		$(".ordenarSpinner").empty();
		$(".ordenarSpinner").html("<i class='nopaddingall nomarginall icon-refresh icon-spin icon-2x'></i>");
		
		//Send data to change page from Destacados
		$.post('/busqueda',$("#search").serialize(), function(data) {
			if(data != "error") {
				$('#resultsData').empty();
				$('#resultsData').html(data.html);
				console.log("Setting Dropdown......");
				$("#ordenar1, #ordenar2").val(currentSortVal);
				$("#tabs").tabs("option", "active", selectedTab);
				resultsCoords = data.raw;
				refreshTab();
				$(".ordenarSpinner").html("");
				
				//Adjust Side Columns Height
				methodToFixSideColumnsHeight();
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
				$(".ordenarSpinner").html("");
			}
			$("#offset").remove();
			$("#screenSize").remove();
		}); 
		$("#offset").remove();
	}
	
	//To Handle Paging Arrows when disabled
	$(".notWorking").click(function(event4){
		event4.preventDefault();
	});
	
	$(".detailsBtn").click(function(e) {
		e.preventDefault();
		$("#detailsDrawer").removeClass('hidden');
		$("#resultsDrawer").hide();
		$("#detailsData").empty();
		$("#detailsData").html("<div class='text-center largemargintop'><h1>Cargando...<i class='icon-refresh icon-spin'></i></h1></div>");
		$("#detailsDrawer").show();

		var id = $(this).attr('name');
		$.post('/details', { id: id }, function(data) {
			if(data != "error") {
				$('#detailsData').html(data);
				
				//Adjust Side Columns Height
				methodToFixSideColumnsHeight();
			}
			else {
				$('#formProcessingModal').modal('hide');
				$('#formErrorModal').modal('show');
			}
		}); 
	});
	
});