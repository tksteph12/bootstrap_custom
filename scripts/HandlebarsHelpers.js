$(document).ready(function() {
	Handlebars.registerHelper('yearPicker', function(value, options) {
		if (this[value] === undefined) {
			throw " year picker  error:" + value + " value is not defined in your JSON.";
		}
		
		for (var text in this[value].years) {
		    var val = years[text];
		    $('<option/>').val(val).text(text).appendTo($('#yearselector'))
		};		
	});

	//Helper pour mise à jour des filières
	Handlebars.registerHelper('updateSectorSelector', function(value, options) {
				
		
		
	});
	

});
