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

	Handlebars.registerHelper('update', function(value, options) {
		if (this[value] === undefined) {
			throw " year picker  error:" + value + " value is not defined in your JSON.";
		}
		
		for (var text in this[value].years) {
		    var val = years[text];
		    $('<option/>').val(val).text(text).appendTo($('#yearselector'))
		};
		
	});
});
