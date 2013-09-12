jQuery(window).load(function() {
	loadTemplates();
	handleEvents();

	//
	setGlobalParameters();
	fillSectorSelections();
	enable_search_ahead();
	general_things();
});

function loadTemplates() {
	$('#id-header').html(Handlebars.templates.header());
	$('#id-filterPanel').html(Handlebars.templates.filterPanel());
	$('#container').html(Handlebars.templates.container());
	$('#id-footer').html(Handlebars.templates.footer());
}

function handleEvents() {

	$("#select-filiere").change(function() {
		$("option", $(this)).each(function(index) {
			if ($(this).is(":selected")) {
				$(this).css("backgroundColor", "yellow");
			} else {
				$(this).css("backgroundColor", "white");
			}
		});
	});
}