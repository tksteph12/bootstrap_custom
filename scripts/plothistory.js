var plotHistory = function(datas, id) {

	var types = datas.types; // list of portions of bars per year
	var filiere = datas.filiere;
	var codeDept = datas.codeDept;
	var departement = datas.departement; //name of departement
	var url = datas.sourcefile;

	$.ajax({
		type: "GET",
		url: url,
		dataType: "text",
		success: function(data) {
			processForHistory(data, id);
		}
	});


	function processForHistory(allText, id) {

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
		drawAggregatedBarChart(histogramArray,"idHistogram");
	}



	/*function drawAggregatedBarChart(data,id){
		
		
	}*/

}