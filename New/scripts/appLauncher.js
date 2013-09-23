jQuery(window).load(function() {
	loadTemplates();
	fillSectorSelections();
	enableSelectBoxes();
	setGlobalParameters();
	general_things();
});

function loadTemplates() {
	$('#id-header').html(Handlebars.templates.header());
	$('#id-filterPanel').html(Handlebars.templates.filterPanel());
	$('#container').html(Handlebars.templates.container());
	$('#id-footer').html(Handlebars.templates.footer({
		text: "© 2013 ADEME"
	}));
}


