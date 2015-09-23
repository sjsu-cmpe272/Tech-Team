
(function($){
    $.fn.validationEngineLanguage = function(){
    };
    $.validationEngineLanguage = {
        newLang: function(){
            $.validationEngineLanguage.allRules = {
                "required": {
                    "alertText": "* Field Required"
                }
            };
        }
    };
    $.validationEngineLanguage.newLang();
})(jQuery);

