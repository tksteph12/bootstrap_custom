jQuery(window).load(function() {
	loadTemplates();
	handleEvents();
	fillSectorSelections();
	enableSelectBoxes();
	setGlobalParameters();
	enable_search_ahead();
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

function handleEvents() {

	$("#select-filiere").change(function() {
		$("option", $(this)).each(function(index) {
			if ($(this).is(":selected")) {
				$(this).css("backgroundColor", "#21d1a0");
			} else {
				$(this).css("backgroundColor", "white");
			}
		});
	});
}

