jQuery(document).ready(function () {
	//Code to close button when close button clicked
	$("#closeCalc").click(function(e) {
		e.preventDefault();
		$("#calcDrawer").hide();
		$("#calcBtn").html("Calculadora");
		$("#resultsDrawer").show(800);
		$("#searchDrawer").show(800);
	});

    jQuery("#show_schedule").change(function () {
        if (this.checked) {
            jQuery("#schedule_div").show();
            display_results();
        }
        else {
            jQuery("#schedule_div").hide();
        }
    });
	
    var selectYearsInitVal = 30;
    jQuery("#term").val(selectYearsInitVal);
    var selectYears = jQuery("#term");
    var trow = jQuery("#term");
    var sliderYears = jQuery("<div id='sliderYears'></div>").insertAfter("#termInput").slider({
        min:10,
        max:40,
        range:"min",
        value:selectYearsInitVal,
        slide:function (event, ui) {
            selectYears.val(ui.value);
        },
        change:function (event, ui) {
            //console.log('slide');
            display_results();
        }
    });
    jQuery("#term").change(function () {
       // console.log('change');
        sliderYears.slider("value", parseInt(this.value, 10));

    });

	var takenPrincipal = $("#principle").val();
	
	if(takenPrincipal == "")
    	var selectPrincipalInitVal = 200000;
    else {
    	takenPrincipal = Number(takenPrincipal.replace(/[^0-9\.]+/g,""));
    	var selectPrincipalInitVal = takenPrincipal;
	}
	
    jQuery("#principle").val(accounting.formatNumber(selectPrincipalInitVal));
    var selectPrinciple = jQuery("#principle");
    var prow = jQuery("#principle");
    var sliderPrinciple = jQuery("<div id='sliderPrinciple'></div>").insertAfter("#principleInput").slider({
        min:50000,
        max:10000000,
        step:100,
        range:"min",
        value:selectPrincipalInitVal + 1,
        slide:function (event, ui) {
            selectPrinciple.val( accounting.formatNumber( ui.value ) );
        },
        change:function (event, ui) {
           // console.log('slide');
            display_results();
        }
    });
    jQuery("#principle").change(function () {

        sliderPrinciple.slider("value", parseInt(this.value, 10));
        jQuery(this).val( accounting.formatNumber( this.value ) );
    });

	var takenInterest = $("#interest").val();
	
	if(takenInterest == "")
    	var selectInterestInitVal = 400;
    else {
		takenInterest = Number(takenInterest.replace(/[^0-9\.]+/g,""));
		takenInterest = takenInterest*100
    	var selectInterestInitVal = takenInterest;
    }
    
    jQuery("#interest").val(selectInterestInitVal / 100);
    var selectInterest = jQuery("#interest");
    var irow = jQuery("#interest");
    var sliderInterest = jQuery("<div id='sliderInterest'></div>").insertAfter("#interestInput").slider({
        min:0,
        max:1000,
        range:"min",
        step:5,
        value:selectInterestInitVal,
        slide:function (event, ui) {
            selectInterest.val(ui.value / 100.00);
        },
        change:function (event, ui) {
           // console.log('slide');
            //alert(ui.value);
            //console.log(ui.value);
            display_results();
        }
    });
    jQuery("#interest").change(function () {
        sliderInterest.slider("value", parseFloat(this.value, 10) * 100.00);

    });
});

var validate_input = function () {
    var input = document.input;
    this.principle = accounting.unformat(input.principle.value);
    this.term = input.term.value;
    this.interest = input.interest.value;

    this.principle = parseInt(this.principle);
    if (isNaN(this.principle) || this.principle <= 0) {
        alert("You must enter a positive number for the loan amount.");
        input.principle.focus();
        return false;
    }

    this.term = parseInt(this.term);
    if (isNaN(this.term) || this.term <= 0 || this.term >= 100) {
        alert("You must enter a number between 1 and 99 for the repayment term.");
        input.term.focus();
        return false;
    }

    this.interest = parseFloat(this.interest);
    if (isNaN(this.interest) || this.interest <= 0) {
        alert("You must enter a positive number for the interest rate.");
        input.interest.focus();
        return false;
    }
    return true;
}