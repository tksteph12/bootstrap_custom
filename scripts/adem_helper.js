var initializeApplication = function initializeApplication() {
	//Sample to initialize your app.
};


/*
	fonction devant initialiser les composants de la page web:
	-- récupérer du fichier source de données toutes les filières, toutes les sous-catégories des filières
	etc...
*/
var loadAllParameters = function loadAllParameters(){
	$.ajax({
		type: "GET",
		url: "", //generates the url used to call the web service
		dataType: 'json',
		success: function(response, text) {
			console.log('response', response, 'text', text);
			
		},
		error: function(request, status, error) {
			console.error("request", request.responseText, "status", status, "error", error);
		}
	});
}



//Container pour la page web.
var KLEE = {
	Adem: {
		initialize: function initialize() {
			throw "You have to override Klee.Adem.initialize function in order to have your html cartgraphy page initialized.";
		},
		loadAllParameters: loadAllParameters,
	}
};

//A chager utiliser un pattern module ou require js.
window.KLEE = KLEE;