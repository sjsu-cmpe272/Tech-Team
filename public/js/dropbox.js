$(function(){
	var dropbox = $('#dropbox');
	var message = $('.message', dropbox);
	
	dropbox.filedrop({
		// The name of the $_FILES entry:
		paramname:'pic',
		
		maxfiles: 5,
    	maxfilesize: 5,
    	queuefiles:0,
		url: '/uploaddropfile',
		
		uploadFinished:function(i,file,response){
			$.data(file).addClass('done');
			// response is the JSON object that post_file.php returns
		},
		
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage("Su Navegador ('Browser') no acepta esta acción.  Intente presionando 'Buscar Imagen...'");
					break;
				case 'TooManyFiles':
					alert('Ha excedido el número de Fotos Permitidas. Seleccione un máximo de 5.');
					break;
				case 'FileTooLarge':
					alert(file.name+' es muy grande! No debe exceder los 5MB por foto.');
					break;
				default:
					break;
			}
		},
		// Called before each upload is started
		beforeEach: function(file){
			if(!file.type.match(/^image\//)){
				alert('Solo se permiten imágenes');
				
				// Returning false will cause the
				// file to be rejected
				return false;
			}
			if(imageNames.length >= totalImages){
				alert('Ha llegado a la cantidad máxima de fotos permitidas!');
				return false;
			}	
			else{
				return true;
			}
		},
		
		uploadStarted:function(i, file, len){
			createImage(file);
			$.data(file).after("<a class='deleteFile' href='#' onclick='deleteFiles(this); return false;'><i class='icon-remove-sign icon-2x'></i></a>");
		},
		
		progressUpdated: function(i, file, progress) {
			$.data(file).find('.progress').width(progress);
		}
    	 
	});
	
	var template = '<div class="preview">'+
						'<span class="imageHolder">'+
							'<img />'+
							'<span class="uploaded"></span>'+
						'</span>'+
						'<a class="deleteFile" href="#" onclick="deleteFiles(this); return false;"><i class="icon-remove-sign icon-2x"></i></a>'+
						'<div class="progressHolder">'+
							'<div id="progress-dropbox" class="progress progress-success"></div>'+
						'</div>'+
					'</div>';
	

	function createImage(file){

		var preview = $(template), 
			image = $('img', preview);
			
			image = $(image).attr('id', imageNames[imageNames.length -1]);
		var reader = new FileReader();
		
		image.width = 100;
		image.height = 100;
		
		reader.onload = function(e){
			
			// e.target.result holds the DataURL which
			// can be used as a source of the image:
			
			image.attr('src',e.target.result);
		};
		
		// Reading the file as a DataURL. When finished,
		// this will trigger the onload function above:
		reader.readAsDataURL(file);
		
		message.hide();
		preview.appendTo(dropbox);
		
		// Associating a preview container
		// with the file, using jQuery's $.data():
		
		$.data(file,preview);
	}

	function showMessage(msg){
		message.html(msg);
	}

});