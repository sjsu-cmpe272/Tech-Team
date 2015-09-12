/*
 *  PekeUpload 1.0.6 - jQuery plugin
 *  written by Pedro Molina
 *  http://www.pekebyte.com/
 *
 *  Copyright (c) 2013 Pedro Molina (http://pekebyte.com)
 *  Dual licensed under the MIT (MIT-LICENSE.txt)
 *  and GPL (GPL-LICENSE.txt) licenses.
 *
 *  Built for jQuery library
 *  http://jquery.com
 *
 */
(function($) {

  $.fn.pekeUpload = function(options){

    // default configuration properties
    var defaults = {
      onSubmit:       false,
      btnText:        "Buscar Imagen...",
      url:        "/uploadpekefile",
      theme:        "bootstrap",
      field:        "file",
      data:         null,
      multi:        true,
      showFilename:       true,
      showPercent:        true,
      showErrorAlerts:    true,
      allowedExtensions:  "jpg|png|bmp|jpeg|tiff|gif",
      invalidExtError:    "Tipo de Imagen Inválido",
      maxSize:      5,
      sizeError:      "El tamaño de la imagen es mayor al permitido",
      onFileError:        function(file,error){},
      onFileSuccess:      function(file,data){}
    };

    var options = $.extend(defaults, options);

    //Main function
    var obj;
    var file = new Object();
    var fileinput = this;
    this.each(function() {
        obj = $(this);
      
        //HTML code depends of theme
        if (options.theme == "bootstrap"){
        	var html = '<a href="javascript:void(0)" id="btn-peke" class="btn btn-primary btn-upload"> <div class="white-text"> '+options.btnText+'</div></a></div><div class="pekecontainer"></div>';
    	}
		if (options.theme == "custom"){
			var html = '<a href="javascript:void(0)" class="btn-pekeupload">'+options.btnText+'</a><div class="pekecontainer"></div>';
		}
        obj.after(html);
        obj.hide();
        
        //Event when clicked the newly created link
        obj.next('a').click(function(){
        	obj.click();
        });
      
        //Event when user select a file
        obj.change(function(){
        	file.name = obj.val().split('\\').pop();
        	file.size = (obj[0].files[0].size/1024)/1024;
        	if (validateresult()==true){
          		if (options.onSubmit==false){
          			if(imageNames.length >= totalImages){
						alert('Ha llegado a la cantidad máxima de fotos permitidas!');
					}	
					else{
						UploadFile();
					}
          		}
				else{
					obj.next('a').next('div').prepend('<br /><span class="filename">'+file.name+'</span>');
					obj.parent('form').bind('submit',function(){
				  		obj.next('a').next('div').html('');
				  		UploadFile();
				  	});
				}
        	}
        });
    });
    
    //Function that uploads a file
    function UploadFile(){
        var error = true;
        if (options.theme=="bootstrap"){
        	var htmlprogress = '<div class="file"><div class="inline-elements"><span class="filename"></span></div><br><div class="progress progress-striped" style="height:20px;"><div id="progress-peke" class="progress-bar progress-bar-success bar pekeup-progress-bar" style="width:0%;height:20px;"><span class="badge badge-info"></span></div></div></div>';
        }
        if (options.theme=="custom"){
        	var htmlprogress = '<div class="file"><div class="filename"></div><div class="progress-pekeupload"><div class="bar-pekeupload pekeup-progress-bar" style="width: 0%;height: 15px;"><span></span></div></div></div>';
        }
        obj.next('a').next('div').prepend(htmlprogress);
        var formData = new FormData();
        formData.append(options.field, obj[0].files[0]);
        formData.append('data', options.data);
      
        $.ajax({
            url: options.url,
            type: 'POST',
            data: formData,
            dataType: 'text',
            success: function(data){
            	console.log("Respuesta del Servidor al subir foto: "+data);
                var percent = 100;
                obj.next('a').next('div').find('.pekeup-progress-bar:first').width(percent+'%');
                obj.next('a').next('div').find('.pekeup-progress-bar:first').text(percent+"%");
                if (data != 'Invalid file type.'){
                    if (options.multi == false){
                        obj.attr('disabled','disabled');
                    }		
                  				
                    //Add File to variable names array
                    console.log("File Name returned: "+data);
                    imageNames.push(data);
				    $("#photoUploads").text(imageNames.length);
					$(".pekecontainer > .file:first").attr('id', data);
				  
					//Add "Close" Button to file name
					var closeIcon = '<a class="deleteFile" href="#" onclick="deleteFiles(this); return false;"> <i class="icon-remove-sign icon-large"></i></a>';
					obj.next('a').next('div').find('.filename:first').after(closeIcon);
				  
                	options.onFileSuccess(file,data);
                }
                else{  
                	options.onFileError(file,data);
                	obj.next('a').next('div').find('.file:first').remove();
                	if((options.theme == "bootstrap")&&(options.showErrorAlerts==true)){
						obj.next('a').next('div').prepend('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button> '+data+'</div>');
						bootstrapclosenotification();
                	}
                	if((options.theme == "custom")&&(options.showErrorAlerts==true)){
						obj.next('a').next('div').prepend('<div class="alert-pekeupload"><button type="button" class="close" data-dismiss="alert">&times;</button> '+data+'</div>');
						customclosenotification();
                  	}
                	error = false;
                }
            },
            xhr: function() {  // custom xhr
                    myXhr = $.ajaxSettings.xhr();
                    if(myXhr.upload){ // check if upload property exists
                    	myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
                	}
                return myXhr;
              	},
            cache: false,
        	contentType: false,
            processData: false
        });
        return error;
	}
    
    //Function that updates bars progress
    function progressHandlingFunction(e){
        if(e.lengthComputable){
          var total = e.total;
          var loaded = e.loaded;
          if (options.showFilename==true){
          obj.next('a').next('div').find('.file').first().find('.filename:first').text(file.name);
          }
          if (options.showPercent==true){
          var percent = Number(((e.loaded * 100)/e.total).toFixed(2));
            obj.next('a').next('div').find('.file').first().find('.pekeup-progress-bar:first').width(percent+'%');
            }
            obj.next('a').next('div').find('.file').first().find('.pekeup-progress-bar:first').html('<center>'+percent+"%</center>");
        }
    }
    
    //Validate master
    function validateresult(){
      var canUpload = true;
      if (options.allowedExtensions!=""){
        var validationresult = validateExtension();
        if (validationresult == false){
          canUpload = false;
          if((options.theme == "bootstrap")&&(options.showErrorAlerts==true)){
            obj.next('a').next('div').prepend('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button> '+options.invalidExtError+'</div>');
            bootstrapclosenotification();
          }
          if((options.theme == "custom")&&(options.showErrorAlerts==true)){
            obj.next('a').next('div').prepend('<div class="alert-pekeupload"><button type="button" class="close">&times;</button> '+options.invalidExtError+'</div>');
            customclosenotification();
          }
          options.onFileError(file,options.invalidExtError);
        }
        else{
          canUpload = true;
        }
      }
      if (options.maxSize>0){
        var validationresult = validateSize();
        if (validationresult == false){
          canUpload = false;
          if((options.theme == "bootstrap")&&(options.showErrorAlerts==true)){
            obj.next('a').next('div').prepend('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button> '+options.sizeError+'</div>');
            bootstrapclosenotification();
          }
          if((options.theme == "custom")&&(options.showErrorAlerts==true)){
            obj.next('a').next('div').prepend('<div class="alert-pekeupload"><button type="button" class="close" data-dismiss="alert">&times;</button> '+options.sizeError+'</div>');
            customclosenotification();
          }
          options.onFileError(file,options.sizeError);
        }
        else{
          canUpload = true;
        }
      }
      return canUpload
    }
    
    //Validate extension of file
    function validateExtension(){
      var ext = obj.val().split('.').pop().toLowerCase();
      var allowed = options.allowedExtensions.split("|");
      if($.inArray(ext, allowed) == -1) {
          return false;
      }
      else{
        return true;
      }
    }
    
    //Validate Size of the file
    function validateSize(){
      if (file.size > options.maxSize){
        return false;
      }
      else{
        return true;
      }
    }
    
    //Function that allows close alerts of bootstap
    function bootstrapclosenotification(){
      obj.next('a').next('div').find('.alert-error').click(function(){
        $(this).remove();
      });
    }
    
    //Function that allows close alerts of bootstap
    function customclosenotification(){
      obj.next('a').next('div').find('.alert-pekeupload').click(function(){
        $(this).remove();
      });
    }
  };

})(jQuery);