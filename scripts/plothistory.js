/*
	fonction pour representer l'histogramme d'évolution des collectes/productions au fil des années
	elle prend en entrée les types d'équipements collectés, la filière, le département ainsi que l'id du composant du DOM dans lequel dessiner

*/
var plotHistory = function(datas, id) {
	try{
		var types = datas.types; // list of portions of bars per year
		var filiere = datas.filiere;
		var codeDept = datas.codeDept;
		var departement = datas.departement; //name of departement
		var url = datas.sourcefile;

		if (codeDept === "2a") codeDept = "2A";
	    if (codeDept === "2b") codeDept = "2B";
	    if (codeDept === "01") codeDept = "1";
	    if (codeDept === "02") codeDept = "2";
	    if (codeDept === "03") codeDept = "3";
	    if (codeDept === "04") codeDept = "4";
	    if (codeDept === "05") codeDept = "5";
	    if (codeDept === "06") codeDept = "6";
	    if (codeDept === "07") codeDept = "7";
	    if (codeDept === "08") codeDept = "8";
	    if (codeDept === "09") codeDept = "9";
		  
		$.ajax({
			type: "GET",
			url: url,
			dataType: "text",
			success: function(data) {
				processForHistory(data, id);
			}
		});
	}
	catch(e){

	}
	


	function processForHistory(allText, id) {
		if(allText===undefined){
			throw "Undefined Sourcefile"
		}
		if((document.getElementById(id)===undefined)){
			throw "No existing DOM area to draw"
		}
		var jsonYears = {}
		var histogramArray = [];

		var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(';');
        var lines = [];
		for (var i = 1; i < allTextLines.length; i++) {
			var data = allTextLines[i].split(';');
			if (data.length == headers.length) {

				var line = {};
				for (var j = 0; j < headers.length; j++) {
					line[headers[j]] = data[j];
				}
				lines.push(line);
			}
		}

		var years = [];
		for (i in lines) {
			var line = lines[i];
			var annee = line["Campagne"];
			annee = annee.replace(/^.*?(\d+).*?$/, '$1');
			if (years.indexOf(annee) == -1) {
				years.push(annee);
			}
		}

		for (v in years) {
			var obj = {};
			annee = years[v];
			obj['annee'] = annee;
			var valeurCollectee = 0;
			jsonYears[annee] = {};
			for (var r in types) {
				jsonYears[annee][types[r]] = 0;
				obj[types[r]] = 0;
			}

			for (i in lines) {
				var line = lines[i];
				var year = line["Campagne"];
				var dpt = line["Departement"];

				if ((year.indexOf(annee) != -1) && (dpt === codeDept)) {
					var flux = line["Flux"];
					if (flux === undefined) {
						flux = line["Type_pile"]
					}
					var tonnage = Number(line["Tonnage"]);
					valeurCollectee += tonnage;
					//ajouter aussi au type correspondant
					for (var r in types) {
						var fl = types[r];
						if (flux === fl) {
							jsonYears[annee][fl] += tonnage;
							obj[fl]+=tonnage;
						}
					}
				} else {}

			}
			histogramArray.push(obj);
		}

		//console.log(histogramArray)
		//representer le graphe
		try{
			histogramArray = histogramArray.sort(sort_by('annee', true, parseInt));
			drawAggregatedBarChart(histogramArray,id);
		}
		catch(e){
			throw e
		}
	}

//sorting function : sorts a json array according to parameters :
//field is the field to sort,
//reverse is a boolean: true= reverse sorting, false=...
//primer = type of values to be sorted it could be for example; parseFloat/parseInt/parseDouble...
var sort_by = function(field, reverse, primer) {

	var key = function(x) {
		return primer ? primer(x[field]) : x[field]
	};

	return function(a, b) {
		var A = key(a),
			B = key(b);
		return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1, 1][+ !! reverse];
	}
};



	/*function drawAggregatedBarChart(data,id){
		
		
	}*/

}