var plotHistory = function(datas,id){

    var types = datas.types;// list of portions of bars per year
    var filiere = datas.filiere;
    var codeDept = datas.codeDept;
    var departement = datas.departement;//name of departement
    var url = datas.sourcefile;

     $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(data) {
          processForHistory(data, id);
        }
      });


    function processForHistory(allText, id){
    	
    }	

}