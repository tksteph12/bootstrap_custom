jQuery(window).load(function() {
	//getJson();
	loadTemplates();
	fillSectorSelections();
	enableSelectBoxes();
	setGlobalParameters();
	general_things();
});

function loadTemplates() {
	jQuery('#id-header').html(Handlebars.templates.header());
	jQuery('#id-filterPanel').html(Handlebars.templates.filterPanel());
	jQuery('#container').html(Handlebars.templates.container());
	jQuery('#id-footer').html(Handlebars.templates.footer({
		text: "© 2013 ADEME"
	}));
}


