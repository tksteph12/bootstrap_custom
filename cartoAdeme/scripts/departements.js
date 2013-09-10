  (function($) {
    var departs = {}

    $.fn.drawMap = function(sourcefile, idElement) {

      var legendArray = [];
      var container = $(this);

      //----------------------------------------------------
      var url = mapParameters.url; // find the way to build a proper url once the app is running on a server
      $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(data) {
          processData(data, idElement);
        }
      });



      function processData(allText, idElement) {

        //var height = 600;
        width = $(this).width();
        width = $('#' + idElement).width();
        var height = 4 * width / 5;
        var dpts = {}; //contiendra les départements et les tonnages collectés
        //----------------------------

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

        for (i in lines) {
          var line = lines[i];
          var annee = line["Campagne"];
          if (annee.indexOf(mapParameters.year) != -1) { // si l'année est bien celle choisie 
            // ou alors la phrase réupérer contient cette année là

            var dpt = line["Departement"];
            var flux = line["Flux"];
            if (flux === undefined) {
              flux = line["Type_pile"]
            }
            var tonnage = Number(line["Tonnage"]);

            var id = dpt; //+ "-" + flux;

            var list = mapParameters.types;

            if (dpts[id]) {
              if (annee.indexOf(mapParameters.year) != -1) { // si l'année est bien celle choisie 
                // ou alors la phrase réupérer contient cette année là
                if (list.indexOf(flux) != -1) {
                  tonnage += Number(dpts[id]);
                }
              }
            }
            dpts[id] = (list.length === 0) ? undefined : tonnage;
          }
        }
        departs = dpts;

        //  construction de la légende
        var sum = 0;
        var count = 0;
        var max = 0;
        for (i in dpts) {
          sum = sum + dpts[i];
          count++;
          if (max < dpts[i]) {
            max = dpts[i];
          }
        }
        var space = max / 4;
        space = Math.round(space);

        var val = "<" + space
        legendArray.push({
          value: val,
          color: ""
        });
        //legendArray[0].value =space;
        legendArray.push({
          value: space + "-" + 2 * space,
          color: ""
        });
        legendArray.push({
          value: 2 * space + "-" + 3 * space,
          color: ""
        });
        legendArray.push({
          value: ">" + 3 * space
        });
        legendArray.push({
          value: "No data"
        });

        var avg = sum / count;


        var colors = function(idpt) {
          var dpt = idpt;
          if (dpt === "2a") dpt = "2A";
          if (dpt === "2b") dpt = "2B";
          if (dpt === "01") dpt = "1";
          if (dpt === "02") dpt = "2";
          if (dpt === "03") dpt = "3";
          if (dpt === "04") dpt = "4";
          if (dpt === "05") dpt = "5";
          if (dpt === "06") dpt = "6";
          if (dpt === "07") dpt = "7";
          if (dpt === "08") dpt = "8";
          if (dpt === "09") dpt = "9";

          if (dpts[dpt] > 3 * space)
            if (dpts[dpt] > 3 * space) {
              legendArray[3].color = "#A91101";
              return "#A91101";
            } //rouge foncé
          if (dpts[dpt] > 2 * space) {
            legendArray[2].color = "#DB1702";
            return "#DB1702";
          } //rouge
          if (dpts[dpt] > space) {
            legendArray[1].color = "#f80";
            return "#f80";
          } //oranger foncéé
          if (dpts[dpt] < space) {
            legendArray[0].color = "#F9C181";
            return "#F9C181";
          } //oranger
          legendArray[4].color = "#ccc";
          return "#ccc"; //gris pas de données
        }


        if (!($('#' + idElement).length)) {
          var idElement = $(this).attr('id');
        }


        var svg = d3.select('#' + idElement).append("svg:svg")
          .attr("viewBox", "0 0 " + width + " " + height) //adapter le composant à la fenêtre
        .attr("preserveAspectRatio", "xMidYMid meet");
        //.append("g") // incompatible firefox
        /*.attr("width", width)
          .attr("height", height)
          .attr("viewBox", "0 0 100 100")
          ;*/

        for (var i in geodatas) {
          var rgn = geodatas[i];
          //On construit une unité (set) de regroupement de tous les départements de la région
          for (j in rgn['dpts']) {
            var dpt = rgn['dpts'][j];
            svg.append("svg:path")
              .style("fill", 'white')
              .transition()
              .attr("d", dpt['path'])
              .duration(2000).delay(j * 200)
              .attr("class", "departement")
              .attr("id", dpt['code'])
              .attr("code", dpt['code']) //On ajoute un attribut code pour pouvoir récupérer le code du département plustard
            .attr("dept", dpt['dept']) //on ajoute aussi le nom du département : pas certain que ce soit optimal
            .style("fill", colors(dpt['code']))
              .style("opacity", 1)
              .select("title").text(dpt['code']);

          } //for j
        }

        var auxcolor = "";
        svg.selectAll("path")
          .on("mouseover", function(d, i) {
              toolTip.transition().duration(200).style("opacity", 1);
              auxcolor = d3.select(this)[0][0].style.fill;
              d3.select(this).style("fill", "grey");
              var codeDept = d3.select(this)[0][0].attributes['code'].value;
              var departement = d3.select(this)[0][0].attributes['dept'].value;
              var title = departement + ' ( ' + codeDept + ')';
              var title = departement + ' ( ' + codeDept + ')';
              var text = "Types d'équipement collectés:" + mapParameters.types.toString();
              var data = {
                title: title,
                text: text
              }
              $('#infobox').html(Handlebars.templates.infobox(data));
              var coll = getTonneCollectedValue(codeDept,departs);
              var val = getTonneProducedValue(codeDept,departs) - coll;
              var donnee = {
                unit: "tonnes",
                data: [{
                    "itemLabel": "Collecté",
                    "itemValue": coll,
                    "color": "#9FDAEE"
                  }, {
                    "itemLabel": "Reste",
                    "itemValue": val,
                    "color": "#e6550d"
                  }
                ]
              };
              drawPieChart(donnee, "idPiechart");

              var donnee_hist = {};
              donnee_hist.types = mapParameters.types;
              donnee_hist.filiere = mapParameters.filiere;
              donnee_hist.codeDept = codeDept;
              donnee_hist.departement = departement;
              donnee_hist.sourcefile = mapParameters.url;
              title += " Evolution des collectes";
              data = {
                title: title,
                text: text
              }

              $('#histogram').html(Handlebars.templates.histogramme(data));
              plotHistory(donnee_hist,"idHistogram");


        })
          .on("mousemove", function(d) {
          var codeDept = d3.select(this)[0][0].attributes['code'].value;
          var departement = d3.select(this)[0][0].attributes['dept'].value;
          toolTip.text(function() {
            var numb = Number(getTonneCollectedValue(codeDept,departs)).toFixed(2);
            if (numb === 'NaN') {
              return departement + " ( " + codeDept + " ): Pas de collecte en " + mapParameters.year;
            } else {
              return departement + " ( " + codeDept + " ): " + +numb + " Tonnes de déchets collectés en " + mapParameters.year;
            }
          })
            .style("left", (d3.event.pageX - 34) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
        })
          .on("mouseout", function(d, i) {
          toolTip.transition().duration(200).style("opacity", 1e-6);
          var data = {
            title: "Departements France Métropolitaine + DOM TOM"
          }
          $('#infobox').html(Handlebars.templates.infobox(data));
          $("#idPiechart").html("");
          $("#infobox").html("");
          var codeDept = d3.select(this)[0][0].attributes['code'].value;
          // d3.select(this).style("fill", colors(codeDept))auxcolor
          d3.select(this).style("fill", auxcolor)
        })
          .on("click", function(d, i) {

            //gBrowser.selectedTab = gBrowser.addTab("http://www.google.com/");
            

          var path = {};
          var data = d3.select(this)[0][0];
          //path.style = data.attributes['style'].value;
          path.style = 'red';
          path.code = data.attributes['code'].value;
          path.class = data.attributes['class'].value;
          path.id = data.attributes['id'].value;
          path.d = data.attributes['d'].value;

          var win = window.open("depart.html", '_blank');
          //win.document.body("<script>jQuery('#idDpt').html(Handlebars.templates.departement("+path+")); </script>");
          var graph = Handlebars.templates.departement(path);
          /*win.document.write(graph);
          win.focus();*/
          
          var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("depart.html"));
            newTabBrowser.addEventListener("load", function () {
              newTabBrowser.contentDocument.body.innerHTML = "<div>"+graph+"/div>";
              $('#body').html(Handlebars.templates.departement(path));
            }, true);

         // $('#body').html(Handlebars.templates.departement(path));
        });
        //.call(d3.helper.tooltip(function(d, i){return tooltipText(d);}));



        //Représentation du trait pour la Corse
        svg.append("svg:path")
          .style("stroke", 'white')
          .transition()
          .duration(2000)
          .attr("d", 'M 432,545.25 L 432,475 L 496.25,433')
          .style("fill", 'none')
          .style("stroke", '#86aae0')
          .style("stroke-width", '1.5')
          .style("stroke-opacity", '1');

        //Représentation du carré un zoom sur paris et les 3 departements. 
        /*   svg.append("svg:path")
        .attr("d",'M 432,545.25 L 432,475 L 496.25,433')
        .style("fill",'none')
        .style("stroke",'#86aae0')
        .style("stroke-width",'1.5')
        .style("stroke-opacity",'1');

        layer.push(RR.rect(7.2526245, 280.14719, 82.539658, 82.53965)
            .attr({x: '7.2526245',y: '280.14719',fill: 'none',stroke: '#86aae0',"stroke-width": '1.46',"stroke-miterlimit": '4',"stroke-opacity": '1',"stroke-dasharray": 'none'}));*/

        //Représentation de la séparation des doms
        svg.append("svg:path")
          .style("stroke", 'white')
          .transition()
          .duration(2000)
          .attr("d", 'M 4.9513254,493.17701 L 245.37144,493.17701 L 275.37144,520 L 275.37144,546.92063')
          .style("fill", 'none')
          .style("stroke", '#86aae0')
          .style("stroke-width", '1.5')
          .style("stroke-opacity", '1');

        //idPiechart
        //===================================Legend==============================
        var legend = svg.append("g")
          .attr("class", "legend")
        //.attr("x", w - 65)
        //.attr("y", 50)
        .attr("viewBox", "0 0 100 100") //adapter le composant à la fenêtre
        .attr("preserveAspectRatio", "xMidYMid meet")
          .attr('transform', 'translate(-20,50)')
          .attr("id", "dptLegend")

        legend.selectAll('rect')
          .data(legendArray)
          .enter()
          .append("rect")
          .attr("x", width - 200)
          .attr("y", function(d, i) {
          return i * 20;
        })
          .attr("width", 10)
          .attr("height", 10)
          .attr("id", function(d, i) {
          return "dptLegend" + i;
        })
          .style("fill", function(d) {
          var color = d.color;
          return color;
        })

        legend.selectAll('text')
          .data(legendArray)
          .enter()
          .append("text")
          .attr("x", width - 187)
          .attr("y", function(d, i) {
          return i * 20 + 9;
        })

        .text(function(d) {
          var text = d.value;
          return text;
        });

        var toolTip = d3.select("#" + idElement).append("div")
          .attr("class", "tooltip")
          .style("opacity", 1e-6);


      }
    };
//cette fonction retourne le tonnage collecté pour le département passé en paramètres

    function getTonneCollectedValue(dpt,departs) {
      try {

        if (dpt === "2a") dpt = "2A";
        if (dpt === "2b") dpt = "2B";
        if (dpt === "01") dpt = "1";
        if (dpt === "02") dpt = "2";
        if (dpt === "03") dpt = "3";
        if (dpt === "04") dpt = "4";
        if (dpt === "05") dpt = "5";
        if (dpt === "06") dpt = "6";
        if (dpt === "07") dpt = "7";
        if (dpt === "08") dpt = "8";
        if (dpt === "09") dpt = "9";

        //return dpts[dpt];
        //return Number(departs[dpt]).toFixed(2);
        return departs[dpt];

      } catch (e) {
        return undefined
      }
    }

    //cette fonction retourne le tonnage produits pour le département passé en paramètres
    //ne disposant pas de cette valeur pour le nous nous contenterons de retourner la valeur max de toutes les données récoltées

    function getTonneProducedValue(dpt,departs) {
      if (dpt === "2a") dpt = "2A";
      if (dpt === "2b") dpt = "2B";
      if (dpt === "01") dpt = "1";
      if (dpt === "02") dpt = "2";
      if (dpt === "03") dpt = "3";
      if (dpt === "04") dpt = "4";
      if (dpt === "05") dpt = "5";
      if (dpt === "06") dpt = "6";
      if (dpt === "07") dpt = "7";
      if (dpt === "08") dpt = "8";
      if (dpt === "09") dpt = "9";
      //return Number(d3.max(d3.values(departs))).toFixed(2);
      return d3.max(d3.values(departs));
    }

    //retourne le nom du département passé en paramètres

    function getDepartement(dpt) {

      if (dpt === "2a") dpt = "2A";
      if (dpt === "2b") dpt = "2B";
      if (dpt === "01") dpt = "1";
      if (dpt === "02") dpt = "2";
      if (dpt === "03") dpt = "3";
      if (dpt === "04") dpt = "4";
      if (dpt === "05") dpt = "5";
      if (dpt === "06") dpt = "6";
      if (dpt === "07") dpt = "7";
      if (dpt === "08") dpt = "8";
      if (dpt === "09") dpt = "9";

      return "Departement " + dpt;
    }

    function upperTransform(dept){

    }

     function lowerTransform(dept){
      
    }

    function getAllDepartments() {
      var departements = [];
      for (var i = 0; i < geodatas.length; i++) {
        if (geodatas[i].hasOwnProperty('dpts')) {
          var region = geodatas[i].dpts;
          for (var j = 0; j < region.length; j++) {
            if (region[j].hasOwnProperty('code')) {
              departements.push(region[j].code);
            }
          }
        }
      }
      return departements;

    }

    $.fn.updateColors = function(datas, idElement) {

      var legendArray = [];
      var container = $(this);
      var url = mapParameters.url;
      //----------------------------------------------------

      $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(data) {
          processupdatedData(data, idElement);
        }
      });



      function processupdatedData(allText, idElement) {

        width = $(this).width();
        width = $('#' + idElement).width();
        var height = 4 * width / 5;


        var dpts = {}; //contiendra les départements et les tonnages collectés
        //----------------------------

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
        for (i in lines) {
          var line = lines[i];
          var annee = line["Campagne"];
          if (annee.indexOf(mapParameters.year) != -1) { // si l'année est bien celle choisie 
            // ou alors la phrase réupérer contient cette année là
            var dpt = line["Departement"];
            var flux = line["Flux"];
            if (flux === undefined) {
              flux = line["Type_pile"];
            }
            var tonnage = Number(line["Tonnage"]);
            //var annee = Number(line["annee"]);
            //var annee = Number(line["Campagne"]);

            var id = dpt; //+ "-" + flux;

            var list = mapParameters.types;

            if (dpts[id]) {
              if (annee.indexOf(mapParameters.year) != -1) { // si l'année est bien celle choisie 
                // ou alors la phrase réupérer contient cette année là
                if (list.indexOf(flux) != -1) {
                  tonnage += Number(dpts[id]);
                }
              }
            }
            dpts[id] = (list.length === 0) ? undefined : tonnage;
          }
        }

        departs = dpts;
        if (jQuery.isEmptyObject(departs)) {
          departs = undefined;
          dpts = undefined;
        }
        //  construction de la légende
        var sum = 0;
        var count = 0;
        var max = 0;
        for (i in dpts) {
          sum = sum + dpts[i];
          count++;
          if (max < dpts[i]) {
            max = dpts[i];
          }
        }
        var space = max / 4;
        space = Math.round(space);

        var val = "<" + space
        legendArray.push({
          value: val,
          color: ""
        });
        //legendArray[0].value =space;
        legendArray.push({
          value: space + "-" + 2 * space,
          color: ""
        });
        legendArray.push({
          value: 2 * space + "-" + 3 * space,
          color: ""
        });
        legendArray.push({
          value: ">" + 3 * space
        });
        legendArray.push({
          value: "No data"
        });

        var avg = sum / count;

        var fillColor = function(id, color) {
          if (id === undefined) {
            throw "space to recolor not specified";
          }
          var entity = document.getElementById(id);
          if (entity) {

            entity.style.fill = color;
            entity.setAttribute("class", "animate")

          }
        };
        var updateColor = function(idpt, dpts) {
          /** saving 

            if (getTonneCollectedValue(idpt) === undefined) {

            return "#ccc";
          }

          var dpt = idpt;
          if (dpt === "2a") dpt = "2A";
          if (dpt === "2b") dpt = "2B";
          if (dpt === "01") dpt = "1";
          if (dpt === "02") dpt = "2";
          if (dpt === "03") dpt = "3";
          if (dpt === "04") dpt = "4";
          if (dpt === "05") dpt = "5";
          if (dpt === "06") dpt = "6";
          if (dpt === "07") dpt = "7";
          if (dpt === "08") dpt = "8";
          if (dpt === "09") dpt = "9";

          if (dpts[dpt] > 3 * space)
            if (dpts[dpt] > 3 * space) {
              legendArray[3].color = "#A91101";
              return "#A91101";
            } //rouge foncé
          if (dpts[dpt] > 2 * space) {
            legendArray[2].color = "#DB1702";
            return "#DB1702";
          } //rouge
          if (dpts[dpt] > space) {
            legendArray[1].color = "#f80";
            return "#f80";
          } //oranger foncéé
          if (dpts[dpt] < space) {
            legendArray[0].color = "#F9C181";
            return "#F9C181";
          } //oranger
          legendArray[4].color = "#ccc";
          return "#ccc"; //gris pas de données


          *****end saving **/

          if (getTonneCollectedValue(idpt,departs) === undefined) {

            return "#ccc";
          }

          var dpt = idpt;
          if (dpt === "2a") dpt = "2A";
          if (dpt === "2b") dpt = "2B";
          if (dpt === "01") dpt = "1";
          if (dpt === "02") dpt = "2";
          if (dpt === "03") dpt = "3";
          if (dpt === "04") dpt = "4";
          if (dpt === "05") dpt = "5";
          if (dpt === "06") dpt = "6";
          if (dpt === "07") dpt = "7";
          if (dpt === "08") dpt = "8";
          if (dpt === "09") dpt = "9";

          if (dpts[dpt] > 3 * space)
            if (dpts[dpt] > 3 * space) {
              legendArray[3].color = "#A91101";
              return "#A91101";
            } //rouge foncé
          if (dpts[dpt] > 2 * space) {
            legendArray[2].color = "#DB1702";
            return "#DB1702";
          } //rouge
          if (dpts[dpt] > space) {
            legendArray[1].color = "#f80";
            return "#f80";
          } //oranger foncéé
          if (dpts[dpt] < space) {
            legendArray[0].color = "#F9C181";
            return "#F9C181";
          } //oranger
          legendArray[4].color = "#ccc";
          return "#ccc"; //gris pas de données
        }

        if (!($('#' + idElement).length)) {
          var idElement = $(this).attr('id');
        }

        var svg = d3.select('#' + idElement).select("svg")
          .attr("viewBox", "0 0 " + width + " " + height) //adapter le composant à la fenêtre
        .attr("preserveAspectRatio", "xMidYMid meet");

        if (jQuery.isEmptyObject(dpts)) {


        } else {
          var dptsarr = [];
          for (var r in dpts) {
            if (dpts.hasOwnProperty(r)) {
              if (r === "2A") r = "2a";
              if (r === "2B") r = "2b";
              if (r === "1") r = "01";
              if (r === "2") r = "02";
              if (r === "3") r = "03";
              if (r === "4") r = "04";
              if (r === "5") r = "05";
              if (r === "6") r = "06";
              if (r === "7") r = "07";
              if (r === "8") r = "08";
              if (r === "9") r = "09";

              dptsarr.push(r);
            }
          };
          var alldpts = getAllDepartments();

          for (var i = 0; i < alldpts.length; i++) {
            var r = alldpts[i];
            if (dptsarr.indexOf(r) == -1) {
              fillColor(alldpts[i], "#ccc");
            } else {

              fillColor(r, updateColor(r, dpts));

            }

          }



          //chercher , si r 

        }

        //idPiechart
        //===================================updating the Legend==============================
        $("#dptLegend").remove();

        var legend = d3.select("svg").append("g")
          .attr("class", "legend")
        //.attr("x", w - 65)
        //.attr("y", 50)
        //.attr("viewBox", "0 0 100 100") //adapter le composant à la fenêtre
        //.attr("preserveAspectRatio", "xMidYMid meet")
        .attr('transform', 'translate(-20,50)')
          .attr("id", "dptLegend")

        legend.selectAll('rect')
          .data(legendArray)
          .enter()
          .append("rect")
          .attr("x", width - 200)
          .attr("y", function(d, i) {
          return i * 20;
        })
          .attr("width", 10)
          .attr("height", 10)
          .attr("id", function(d, i) {
          return "dptLegend" + i;
        })
          .style("fill", function(d) {
          var color = d.color;
          return color;
        })

        legend.selectAll('text')
          .data(legendArray)
          .enter()
          .append("text")
          .attr("x", width - 187)
          .attr("y", function(d, i) {
          return i * 20 + 9;
        })

        .text(function(d) {
          var text = d.value;
          return text;
        });

      }

    }

      }(jQuery));

   var geodatas = [{
        'rgn': '42',
        'dpts': [{
            'dept': "Bas-Rhin",
            'code': '67',
            'path': 'M 480.71875,112.28125 L 477,113.3125 L 475.28125,116.3125 L 475.28125,119.25 L 473.71875,120.625 L 472.34375,120.625 L 469.8125,118.84375 L 467.84375,120.21875 L 465.5,120.21875 L 463.5625,118.28125 L 459.84375,117.6875 L 457.6875,116.71875 L 456.90625,113.78125 L 455.15625,115.71875 L 454.1875,120.21875 L 451.625,121 L 451.625,123.53125 L 454.1875,124.71875 L 456.125,126.09375 L 455.34375,127.84375 L 457.125,129 L 460.25,126.65625 L 465.6875,129.78125 L 463.375,134.09375 L 463.5625,135.46875 L 465.125,137.03125 L 463.9375,141.125 L 460.03125,145.03125 L 457.875,144.84375 L 459.25,146.1875 L 458.46875,149.71875 L 459.25,155 L 462.96875,155.96875 L 462.65625,156.6875 L 465.59375,156.53125 L 467.3125,158.625 L 468.84375,160.53125 L 472.6875,160.34375 L 474.40625,165.3125 L 477.40625,166.625 L 477.375,166 L 482.46875,156.03125 L 481.875,150.375 L 484.21875,142.75 L 484.8125,136.09375 L 489.875,132.40625 L 489.875,130.0625 L 491.84375,127.5 L 493.40625,127.5 L 495.15625,125.75 L 494.78125,122.4375 L 496.53125,117.75 L 499.25,117.15625 L 496.53125,115 L 491.65625,114.4375 L 487.34375,112.28125 L 484.40625,114.03125 L 482.84375,112.28125 L 480.71875,112.28125 z '
          }, {
            'dept': "Haut-Rhin",
            'code': '68',
            'path': 'M 465.59375,156.53125 L 462.65625,156.6875 L 460.8125,160.84375 L 458.46875,165.53125 L 459.0625,168.46875 L 457.125,172.96875 L 453.78125,175.875 L 453.59375,183.5 L 451.15625,185.59375 L 451.25,185.65625 L 452.03125,187.21875 L 455.15625,187.40625 L 458.6875,190.15625 L 459.25,191.5 L 459.0625,193.84375 L 458.09375,195.625 L 458.46875,197.96875 L 461.21875,197.5625 L 461.8125,199.71875 L 462.78125,203.875 L 465.09375,203.5 L 464.6875,205.625 L 466.0625,206.8125 L 473.28125,206.625 L 477,203.6875 L 477.1875,199.375 L 479.15625,196.84375 L 476.59375,193.90625 L 475.25,190.78125 L 476.8125,188.65625 L 476.8125,183.75 L 477.78125,181.40625 L 477.78125,177.5 L 479.53125,174.96875 L 477.59375,172.25 L 477.40625,166.625 L 474.40625,165.3125 L 472.6875,160.34375 L 468.84375,160.53125 L 467.3125,158.625 L 465.59375,156.53125 z '
          }
        ]
      }, {
        'rgn': '72',
        'dpts': [{
            'dept': "Pyrénées-Atlantiques",
            'code': '64',
            'path': 'M 172.15625,428.875 L 169.34375,430.46875 L 163.6875,430.28125 L 163.15625,429.40625 L 159.4375,430.65625 L 156.59375,431.53125 L 154.46875,429.9375 L 152.1875,430.65625 L 151.46875,429.75 L 148.65625,429.75 L 146.875,430.65625 L 142.28125,430.46875 L 139.8125,432.40625 L 135.375,432.0625 L 134.5,433.3125 L 133.4375,432.9375 L 134.84375,431.53125 L 132.375,429.59375 L 129.375,432.25 L 124.25,432.59375 L 118.625,429.78125 L 117.8125,431.21875 L 113.3125,436.6875 L 109.8125,438.0625 L 107.28125,438.4375 L 107.28125,440.59375 L 109.625,442.75 L 113.125,442.9375 L 113.3125,445.46875 L 116.0625,445.6875 L 116.84375,443.90625 L 120.5625,445.46875 L 122.90625,446.0625 L 123.46875,448.40625 L 122.125,449.59375 L 122.125,453.28125 L 119.375,454.65625 L 119.1875,456.40625 L 120.9375,458.375 L 124.0625,459.34375 L 124.65625,456.40625 L 126.40625,454.46875 L 126.21875,457 L 127.59375,458.96875 L 131.09375,458.96875 L 132.65625,461.09375 L 137.34375,461.875 L 141.84375,464.625 L 149.25,464.625 L 149.65625,468.71875 L 154.71875,472.625 L 156.6875,474.96875 L 158.84375,473.8125 L 160.78125,473.40625 L 161.75,474.375 L 163.53125,473.40625 L 166.9375,471.53125 L 167.25,467.5 L 168.8125,466.3125 L 169.625,459.875 L 172.53125,460.46875 L 173.71875,459.6875 L 172.34375,456.9375 L 177.625,452.4375 L 180.75,445.40625 L 182.6875,442.875 L 180.34375,439.375 L 178.78125,437.03125 L 180.9375,435.0625 L 177.625,429.59375 L 172.34375,429.21875 L 172.15625,428.875 z '
          }, {
            'dept': "Landes",
            'code': '40',
            'path': 'M 139.8125,374.4375 L 133.625,377.625 L 132.03125,377.6875 L 128.5625,396.25 L 124.0625,413.4375 L 122.6875,420.09375 L 121.53125,424.78125 L 118.625,429.78125 L 124.25,432.59375 L 129.375,432.25 L 132.375,429.59375 L 134.84375,431.53125 L 133.4375,432.9375 L 134.5,433.3125 L 135.375,432.0625 L 139.8125,432.40625 L 142.28125,430.46875 L 146.875,430.65625 L 148.65625,429.75 L 151.46875,429.75 L 152.1875,430.65625 L 154.46875,429.9375 L 156.59375,431.53125 L 159.4375,430.65625 L 163.15625,429.40625 L 163.6875,430.28125 L 169.34375,430.46875 L 172.15625,428.875 L 170.78125,426.46875 L 172.15625,422.75 L 174.09375,420.21875 L 173.5,416.90625 L 175.0625,415.34375 L 172.75,411.4375 L 174.6875,409.09375 L 176.84375,408.6875 L 178.78125,409.46875 L 181.53125,407.125 L 182.5,410.0625 L 183.46875,411.4375 L 185.625,410.84375 L 185.4375,408.3125 L 186.0625,406.9375 L 185.59375,405.71875 L 186.125,401.84375 L 188.25,399.71875 L 187.1875,398.46875 L 184.875,398.28125 L 182.21875,397.25 L 178.34375,397.59375 L 177.625,393.34375 L 175.15625,390.34375 L 174.09375,390 L 174.46875,393.53125 L 174.46875,394.59375 L 171.09375,394.75 L 167.5625,393.53125 L 166.84375,389.09375 L 164.375,386.4375 L 162.625,386.28125 L 162.4375,384.6875 L 160.5,383.4375 L 157.3125,382.5625 L 158.1875,381.5 L 158.1875,380.4375 L 157.125,379.5625 L 155.90625,378.5 L 152.34375,379.03125 L 150.25,380.78125 L 148.8125,380.96875 L 146.53125,379.375 L 143.15625,380.78125 L 141.5625,379.71875 L 143,377.96875 L 143.15625,375.65625 L 139.8125,374.4375 z '
          }, {
            'dept': "Gironde",
            'code': '33',
            'path': 'M 141.25,315.21875 L 138.125,319.90625 L 137.15625,336.3125 L 134.625,352.90625 L 132.84375,365.78125 L 132.65625,369.125 L 134.03125,364.625 L 136.75,361.09375 L 140.65625,364.625 L 141.0625,365.78125 L 142.21875,367.34375 L 137.34375,367.5625 L 136.5625,366.375 L 134.625,367.15625 L 134.21875,370.09375 L 132.0625,373.03125 L 132.0625,377.5 L 132.03125,377.6875 L 133.625,377.625 L 139.8125,374.4375 L 143.15625,375.65625 L 143,377.96875 L 141.5625,379.71875 L 143.15625,380.78125 L 146.53125,379.375 L 148.8125,380.96875 L 150.25,380.78125 L 152.34375,379.03125 L 155.90625,378.5 L 157.125,379.5625 L 158.1875,380.4375 L 158.1875,381.5 L 157.3125,382.5625 L 160.5,383.4375 L 162.4375,384.6875 L 162.625,386.28125 L 164.375,386.4375 L 166.84375,389.09375 L 167.5625,393.53125 L 171.09375,394.75 L 174.46875,394.59375 L 174.46875,393.53125 L 174.09375,390 L 175.15625,390.34375 L 177.15625,392.78125 L 180.28125,392.28125 L 181.71875,390.875 L 181.53125,388.9375 L 180.28125,387.875 L 180.65625,385.90625 L 182.59375,385.90625 L 184.53125,384.6875 L 183.65625,382.90625 L 183.125,380.25 L 184.53125,377.78125 L 187.53125,373.1875 L 189.3125,371.0625 L 190.90625,370.53125 L 191.25,368.78125 L 189.125,368.59375 L 188.25,366.65625 L 188.9375,364.71875 L 191.4375,364.1875 L 193.1875,363.65625 L 195.25,363.375 L 195.125,363.28125 L 194.96875,359.40625 L 196.90625,358 L 194.4375,356.40625 L 191.96875,359.40625 L 185.9375,359.59375 L 185.40625,358.15625 L 183.65625,357.28125 L 185.0625,355.5 L 185.0625,353.5625 L 184.34375,352.5 L 184.34375,351.4375 L 186.125,350.375 L 186.65625,347.21875 L 187.71875,344.375 L 186.65625,342.78125 L 184.71875,342.78125 L 183.6875,341.5625 L 182.6875,343.65625 L 180.75,342.28125 L 178,343.65625 L 175.65625,343.28125 L 171.1875,338.78125 L 168.4375,338.59375 L 167.65625,332.34375 L 162.5625,331.75 L 162.375,328.8125 L 161.40625,329.78125 L 155.625,329.78125 L 155.90625,331.03125 L 157.28125,336.6875 L 157.65625,342.34375 L 156.6875,343.90625 L 155.71875,339.21875 L 152.96875,328.5 L 143,319.5 L 143.21875,315.40625 L 141.25,315.21875 z '
          }, {
            'dept': "Dordogne",
            'code': '24',
            'path': 'M 209.84375,310.46875 L 208.09375,313.59375 L 205.34375,313.96875 L 205.15625,318.65625 L 195.96875,324.90625 L 195.78125,331.75 L 192.25,335.25 L 190.3125,337.03125 L 186.40625,336.625 L 184.25,340.34375 L 183.6875,341.5625 L 184.71875,342.78125 L 186.65625,342.78125 L 187.71875,344.375 L 186.65625,347.21875 L 186.125,350.375 L 184.34375,351.4375 L 184.34375,352.5 L 185.0625,353.5625 L 185.0625,355.5 L 183.65625,357.28125 L 185.40625,358.15625 L 185.9375,359.59375 L 191.96875,359.40625 L 194.4375,356.40625 L 196.90625,358 L 194.96875,359.40625 L 195.125,363.28125 L 197.96875,365.25 L 198.3125,368.9375 L 201.3125,370 L 203.09375,368.40625 L 206.96875,368.40625 L 209.09375,366.65625 L 210.34375,366.84375 L 210.6875,368.25 L 214.59375,368.25 L 215.46875,367.1875 L 216.875,367.375 L 218.46875,369.125 L 218.46875,370.375 L 217.0625,371.25 L 217.59375,372.5 L 219.53125,372.65625 L 222,370.375 L 224.125,370.375 L 225.53125,371.96875 L 228.59375,373.25 L 228.78125,372.75 L 230.5625,371 L 230.75,368.0625 L 235.03125,367.6875 L 237.78125,363.78125 L 236.59375,363.375 L 236.40625,361.25 L 239.71875,360.84375 L 239.9375,358.90625 L 241.5,357.90625 L 243.25,354.78125 L 241.5,352.84375 L 241.5,350.6875 L 242.84375,349.53125 L 241.09375,346.78125 L 241.28125,342.5 L 237,342.6875 L 235.25,341.5 L 236.8125,339.5625 L 234.65625,337.8125 L 236.21875,335.84375 L 234.65625,335.0625 L 234.65625,332.34375 L 238.5625,328.8125 L 236.40625,327.0625 L 235.25,324.125 L 231.125,323.53125 L 229.75,322.5625 L 232.6875,321.1875 L 231.71875,319.84375 L 227.4375,319.25 L 226.4375,315.34375 L 220.1875,314.75 L 218.8125,316.71875 L 217.46875,317.09375 L 215.6875,314.75 L 216.5,312.59375 L 215.5,310.65625 L 209.84375,310.46875 z '
          }, {
            'dept': "Lot-et-Garonne",
            'code': '47',
            'path': 'M 195.25,363.375 L 193.1875,363.65625 L 191.4375,364.1875 L 188.9375,364.71875 L 188.25,366.65625 L 189.125,368.59375 L 191.25,368.78125 L 190.90625,370.53125 L 189.3125,371.0625 L 187.53125,373.1875 L 184.53125,377.78125 L 183.125,380.25 L 183.65625,382.90625 L 184.53125,384.6875 L 182.59375,385.90625 L 180.65625,385.90625 L 180.28125,387.875 L 181.53125,388.9375 L 181.71875,390.875 L 180.28125,392.28125 L 177.15625,392.78125 L 177.625,393.34375 L 178.34375,397.59375 L 182.21875,397.25 L 184.875,398.28125 L 187.1875,398.46875 L 188.25,399.71875 L 186.125,401.84375 L 185.59375,405.71875 L 186.0625,406.9375 L 186.8125,405.375 L 189.125,407.34375 L 192.25,404.21875 L 193.625,406.15625 L 196.9375,405.5625 L 200.46875,405.1875 L 202.03125,402.4375 L 207.875,401.875 L 210.8125,404.78125 L 211.8125,403.8125 L 213.75,403.21875 L 212.96875,400.5 L 215.90625,399.71875 L 219.625,398.9375 L 218.8125,396.59375 L 220,395.21875 L 220.96875,391.5 L 218.8125,389.15625 L 220.1875,384.6875 L 223.125,386.4375 L 227.4375,385.65625 L 225.46875,381.34375 L 223.90625,375.5 L 227.8125,375.3125 L 228.59375,373.25 L 225.53125,371.96875 L 224.125,370.375 L 222,370.375 L 219.53125,372.65625 L 217.59375,372.5 L 217.0625,371.25 L 218.46875,370.375 L 218.46875,369.125 L 216.875,367.375 L 215.46875,367.1875 L 214.59375,368.25 L 210.6875,368.25 L 210.34375,366.84375 L 209.09375,366.65625 L 206.96875,368.40625 L 203.09375,368.40625 L 201.3125,370 L 198.3125,368.9375 L 197.96875,365.25 L 195.25,363.375 z '
          }
        ]
      }, {
        'rgn': '83',
        'dpts': [{
            'dept': "Allier",
            'code': '03',
            'path': 'M 301.625,247.96875 L 298.90625,251.46875 L 297.34375,251.65625 L 295.59375,253.4375 L 293.625,251.28125 L 288.375,256.5625 L 288.375,259.6875 L 289.34375,260.46875 L 289.53125,262.03125 L 286.8125,264.15625 L 284.25,263.375 L 279.375,264.375 L 276.84375,267.28125 L 275.90625,269.28125 L 276.0625,269.25 L 278.40625,272.5625 L 278.40625,274.90625 L 279.75,276.65625 L 281.125,274.90625 L 282.6875,277.65625 L 284.84375,278.4375 L 287,283.5 L 287.09375,284.96875 L 290.0625,287.28125 L 291.65625,286.5625 L 292.90625,283.5625 L 294.125,283.21875 L 294.125,281.625 L 296.25,281.4375 L 296.4375,282.5 L 299.09375,279.5 L 302.09375,279.5 L 302.625,280.5625 L 301.21875,282.5 L 303.3125,284.8125 L 303.6875,286.21875 L 308.625,289.0625 L 314.625,289.9375 L 316.40625,289.75 L 319.0625,290.28125 L 321.34375,288.875 L 323.125,289.75 L 323.46875,292.21875 L 325.78125,292.75 L 328.78125,292.59375 L 329.65625,294.71875 L 332.40625,295.8125 L 332.5,294.84375 L 337.1875,294.625 L 336.8125,283.5 L 335.4375,280.78125 L 336,278.625 L 339.25,278.0625 L 339.34375,277.84375 L 343.4375,274.71875 L 343.625,267.09375 L 342.25,265.15625 L 339.125,265.15625 L 337.96875,263.59375 L 334.65625,263.59375 L 333.6875,262.40625 L 333.6875,259.46875 L 329.75,252.0625 L 327.8125,250.6875 L 324.09375,255.78125 L 322.53125,256.15625 L 321.9375,253.625 L 320.1875,252.84375 L 319.40625,254.40625 L 316.5,254.40625 L 316.09375,252.65625 L 314.125,253.8125 L 312,255 L 309.65625,252.4375 L 306.3125,250.875 L 306.125,248.34375 L 301.625,247.96875 z '
          }, {
            'dept': "Cantal",
            'code': '15',
            'path': 'M 285.84375,323.71875 L 285.25,325.875 L 286.21875,328.21875 L 285.03125,329.59375 L 283.09375,329.59375 L 281.125,327.4375 L 279.375,326.46875 L 279.1875,331.9375 L 275.65625,334.09375 L 273.125,337.59375 L 273.71875,341.125 L 272.9375,342.6875 L 271.9375,345.8125 L 270.375,345.8125 L 268.8125,347.75 L 270,348.9375 L 270.78125,350.875 L 268.25,352.65625 L 269.28125,359.1875 L 272.59375,361.65625 L 270.09375,367.46875 L 272.59375,368.5625 L 271.5,371.875 L 273.6875,372.15625 L 275.34375,369.40625 L 278.125,369.40625 L 278.65625,370.21875 L 284.75,370.21875 L 285.84375,367.75 L 287.21875,367.1875 L 287.78125,362.78125 L 289.15625,362.78125 L 289.15625,358.09375 L 294.6875,353.375 L 295.25,354.21875 L 295.78125,357.8125 L 299.65625,357.25 L 300.5,362.78125 L 302.40625,362.78125 L 302.96875,368.3125 L 304.6875,370.4375 L 307.5,363.96875 L 310.25,355.375 L 313.75,357.71875 L 315.3125,354.21875 L 320.3125,352.40625 L 320.3125,350.75 L 319.25,349.15625 L 317.125,347.90625 L 318.1875,346.3125 L 317.28125,345.4375 L 318.34375,345.09375 L 319.59375,344.03125 L 317.46875,343.84375 L 316.40625,342.4375 L 316.0625,338.71875 L 314.8125,337.46875 L 313.9375,334.3125 L 309.5,334.3125 L 308.625,331.8125 L 307.21875,331.65625 L 306.5,333.0625 L 303.6875,332.875 L 301.03125,328.8125 L 299.96875,328.65625 L 297.84375,327.59375 L 296.59375,328.8125 L 293.4375,328.8125 L 291.84375,325.46875 L 285.84375,323.71875 z '
          }, {
            'dept': "Haute-Loire",
            'code': '43',
            'path': 'M 317.8125,326.34375 L 316.40625,327.0625 L 316.40625,328.28125 L 314.28125,328.46875 L 312.34375,330.0625 L 308.8125,330.59375 L 308,331.75 L 308.625,331.8125 L 309.5,334.3125 L 313.9375,334.3125 L 314.8125,337.46875 L 316.0625,338.71875 L 316.40625,342.4375 L 317.46875,343.84375 L 319.59375,344.03125 L 318.34375,345.09375 L 317.28125,345.4375 L 318.1875,346.3125 L 317.125,347.90625 L 319.25,349.15625 L 320.3125,350.75 L 320.3125,352.40625 L 320.78125,352.25 L 324.3125,361.25 L 329.375,359.6875 L 329.75,357.34375 L 331.71875,357.34375 L 332.5,360.0625 L 336.125,359.1875 L 340.625,364.9375 L 343.4375,360.46875 L 348.5,356.75 L 353.1875,356.75 L 354.75,351.875 L 357.875,351.65625 L 358.09375,347.96875 L 361,347.96875 L 360.4375,346.59375 L 359.65625,344.0625 L 360.8125,342.09375 L 363.5625,340.9375 L 364.71875,336.25 L 362.1875,333.3125 L 359.0625,333.5 L 359.4375,329.78125 L 353.1875,327.0625 L 351.0625,327.25 L 346.75,330.78125 L 342.8125,329.5 L 342.03125,330.25 L 339.5625,329.53125 L 337.8125,327.75 L 336.75,329.875 L 333.71875,329.71875 L 332.3125,328.46875 L 331.25,330.9375 L 329.3125,330.0625 L 328.0625,327.75 L 326.46875,327.75 L 325.0625,326.53125 L 322.9375,327.40625 L 320.46875,327.59375 L 319.0625,326.6875 L 318.1875,327.21875 L 317.8125,326.34375 z '
          }, {
            'dept': "Puy-de-Dôme",
            'code': '63',
            'path': 'M 299.09375,279.5 L 296.4375,282.5 L 296.25,281.4375 L 294.125,281.625 L 294.125,283.21875 L 292.90625,283.5625 L 291.65625,286.5625 L 290.0625,287.28125 L 287.09375,284.96875 L 287.375,289.5625 L 288.9375,291.5 L 289.71875,295.21875 L 287.375,296.96875 L 286.8125,299.71875 L 284.65625,300.875 L 280.9375,303.03125 L 281.3125,304.78125 L 285.8125,309.28125 L 286.21875,312.03125 L 284.4375,314.9375 L 284.4375,317.6875 L 285.625,319.0625 L 286.21875,322.375 L 285.84375,323.71875 L 291.84375,325.46875 L 293.4375,328.8125 L 296.59375,328.8125 L 297.84375,327.59375 L 299.96875,328.65625 L 301.03125,328.8125 L 303.6875,332.875 L 306.5,333.0625 L 307.21875,331.65625 L 308,331.75 L 308.8125,330.59375 L 312.34375,330.0625 L 314.28125,328.46875 L 316.40625,328.28125 L 316.40625,327.0625 L 317.8125,326.34375 L 318.1875,327.21875 L 319.0625,326.6875 L 320.46875,327.59375 L 322.9375,327.40625 L 325.0625,326.53125 L 326.46875,327.75 L 328.0625,327.75 L 329.3125,330.0625 L 331.25,330.9375 L 332.3125,328.46875 L 333.71875,329.71875 L 336.75,329.875 L 337.8125,327.75 L 339.5625,329.53125 L 342.03125,330.25 L 342.8125,329.5 L 341.28125,329 L 340.6875,326.65625 L 344.40625,323.15625 L 342.65625,316.71875 L 337.5625,313.375 L 335.4375,308.3125 L 333.09375,305.1875 L 333.6875,300.875 L 335.4375,299.125 L 332.3125,296.59375 L 332.40625,295.8125 L 329.65625,294.71875 L 328.78125,292.59375 L 325.78125,292.75 L 323.46875,292.21875 L 323.125,289.75 L 321.34375,288.875 L 319.0625,290.28125 L 316.40625,289.75 L 314.625,289.9375 L 308.625,289.0625 L 303.6875,286.21875 L 303.3125,284.8125 L 301.21875,282.5 L 302.625,280.5625 L 302.09375,279.5 L 299.09375,279.5 z '
          }
        ]
      }, {
        'rgn': '25',
        'dpts': [{
            'dept': "Manche",
            'code': '50',
            'path': 'M 119.5625,77.5 L 118.78125,79.46875 L 122.90625,82.78125 L 122.90625,87.09375 L 121.34375,89.03125 L 122.3125,90 L 122.90625,90.40625 L 122.5,94.125 L 123.875,97.25 L 128.375,102.3125 L 129.34375,106.8125 L 130.3125,108.1875 L 130.3125,115.21875 L 132.65625,119.90625 L 132.65625,125.375 L 130.125,130.4375 L 132.84375,137.46875 L 137.15625,138.4375 L 137.53125,140.40625 L 135.40625,141.375 L 131.71875,141.375 L 132.3125,143.84375 L 133.46875,147.5625 L 136.8125,150.5 L 138.375,150.875 L 139.9375,148.75 L 141.6875,148.53125 L 143.8125,146 L 145.78125,147.5625 L 148.125,147.5625 L 149.6875,148.34375 L 149.6875,148.71875 L 153,149.125 L 154.96875,147.5625 L 157.875,148.75 L 157.9375,148.875 L 161.28125,146.03125 L 162.40625,142.3125 L 162.09375,140.6875 L 162.5625,138.78125 L 160.625,136.84375 L 155.625,133.59375 L 151.9375,133.28125 L 148.21875,128.59375 L 151.28125,127.46875 L 152.5625,125.0625 L 150.96875,123.59375 L 152.40625,122.3125 L 153.84375,123.4375 L 156.4375,121.84375 L 158.0625,119.25 L 158.6875,116.6875 L 157.5625,114.40625 L 158.21875,113.59375 L 156.75,111.1875 L 158.375,109.09375 L 157.09375,107.46875 L 155.46875,109.5625 L 153.21875,108.28125 L 149.5,104.5625 L 149.34375,102.96875 L 150.46875,101.84375 L 150.125,99.6875 L 148.28125,100.15625 L 148.09375,95.46875 L 143,89.4375 L 144.5625,85.53125 L 146.71875,85.53125 L 144.78125,80.25 L 136.375,79.84375 L 131.875,82.96875 L 126.8125,79.65625 L 119.5625,77.5 z '
          }, {
            'dept': "Calvados",
            'code': '14',
            'path': 'M 202.65625,97.78125 L 198.09375,98.59375 L 190.65625,102.90625 L 182.28125,106.21875 L 175.625,102.5 L 159.625,100.15625 L 155.90625,98.21875 L 150.125,99.6875 L 150.46875,101.84375 L 149.34375,102.96875 L 149.5,104.5625 L 153.21875,108.28125 L 155.46875,109.5625 L 157.09375,107.46875 L 158.375,109.09375 L 156.75,111.1875 L 158.21875,113.59375 L 157.5625,114.40625 L 158.6875,116.6875 L 158.0625,119.25 L 156.4375,121.84375 L 153.84375,123.4375 L 152.40625,122.3125 L 150.96875,123.59375 L 152.5625,125.0625 L 151.28125,127.46875 L 148.21875,128.59375 L 151.9375,133.28125 L 155.625,133.59375 L 158.46875,135.4375 L 162.40625,134.25 L 165.3125,130.875 L 169.34375,132 L 172.875,129.5625 L 175,128.78125 L 177.25,131.03125 L 180.96875,130.375 L 184.1875,132.15625 L 188.21875,130.875 L 191.90625,128.125 L 194.34375,125.375 L 195.96875,125.0625 L 196.4375,127.15625 L 197.71875,126.84375 L 197.875,125.375 L 201.59375,124.75 L 202.875,125.53125 L 206.84375,124.65625 L 207.5,122.75 L 207.3125,121 L 205.34375,120.21875 L 205.15625,118.84375 L 206.90625,117.6875 L 207.125,115.71875 L 205.9375,111.03125 L 203.59375,107.71875 L 205.5625,106.5625 L 205.5625,105.78125 L 203.59375,105.1875 L 202.65625,97.78125 z '
          }, {
            'dept': "Orne",
            'code': '61',
            'path': 'M 206.84375,124.65625 L 202.875,125.53125 L 201.59375,124.75 L 197.875,125.375 L 197.71875,126.84375 L 196.4375,127.15625 L 195.96875,125.0625 L 194.34375,125.375 L 191.90625,128.125 L 188.21875,130.875 L 184.1875,132.15625 L 180.96875,130.375 L 177.25,131.03125 L 175,128.78125 L 172.875,129.5625 L 169.34375,132 L 165.3125,130.875 L 162.40625,134.25 L 158.46875,135.4375 L 160.625,136.84375 L 162.5625,138.78125 L 162.09375,140.6875 L 162.40625,142.3125 L 161.28125,146.03125 L 157.9375,148.875 L 159.25,151.09375 L 161.40625,152.65625 L 164.34375,150.6875 L 166.28125,152.0625 L 171.5625,148.9375 L 176.84375,149.71875 L 179.75,148.53125 L 180.5625,146.59375 L 182.5,146.40625 L 184.25,147.96875 L 185.03125,152.25 L 187.5625,153.21875 L 188.5625,156.75 L 191.875,156.9375 L 197.15625,152.0625 L 202.4375,151.875 L 204,154 L 204.96875,161.03125 L 208.28125,162.21875 L 210.25,165.15625 L 214.34375,165.15625 L 214.53125,166.5 L 214.71875,164.5625 L 215.5,164.5625 L 218.25,168.65625 L 220.375,169 L 220.375,164.375 L 219.03125,162.59375 L 218.625,161.03125 L 221.5625,159.28125 L 224.5,158.6875 L 226.4375,156.34375 L 226.0625,149.125 L 221.9375,145.625 L 221.75,142.28125 L 218.25,139.9375 L 219.625,138 L 218.8125,135.0625 L 216.09375,134.09375 L 214.125,132.125 L 212.96875,129.40625 L 207.5,129.21875 L 205.9375,127.25 L 206.84375,124.65625 z '
          },
        ]
      }, {
        'rgn': '26',
        'dpts': [{
            'dept': "Côte-d'Or",
            'code': '21',
            'path': 'M 363.375,177.25 L 362.96875,179.78125 L 360.4375,181.15625 L 354,181.34375 L 354.28125,182.75 L 354.4375,184.15625 L 352.46875,185.5625 L 352.46875,187.9375 L 352.875,188.375 L 354.4375,188.375 L 355.40625,190.03125 L 354.84375,192.84375 L 352.59375,194.53125 L 352.59375,196.21875 L 353.3125,196.78125 L 353.15625,197.1875 L 351.75,197.75 L 351.34375,199.84375 L 349.09375,204.625 L 347.5625,206.875 L 347.5625,209.125 L 348.125,210.09375 L 347.28125,211.21875 L 345.3125,212.1875 L 345.4375,214.15625 L 347.28125,215.28125 L 347.96875,216.8125 L 347.6875,218.9375 L 347.28125,220.46875 L 348.25,222.15625 L 351.0625,222.71875 L 352.3125,224.6875 L 352.3125,225.53125 L 351.46875,225.8125 L 351.46875,227.84375 L 351.625,227.90625 L 355.40625,231.8125 L 359.34375,231.6875 L 362.84375,234.34375 L 365.375,236.1875 L 365.5,238.5625 L 368.15625,239.125 L 370.40625,240.9375 L 376.3125,238.84375 L 380.375,237.5625 L 382.1875,237.28125 L 382.75,236.46875 L 384.71875,236.59375 L 386.25,237.5625 L 388.5,237 L 390.75,235.46875 L 392.4375,235.65625 L 392.46875,235.46875 L 393.8125,234.6875 L 393.625,233.6875 L 393.25,232.53125 L 394.21875,230.96875 L 397.53125,229.40625 L 397.53125,227.84375 L 398.71875,226.28125 L 399.875,224.71875 L 399.5,223.34375 L 400.0625,221.1875 L 400.46875,218.0625 L 401.25,218.0625 L 401.0625,216.90625 L 400.28125,216.125 L 400.0625,212.21875 L 398.3125,212.03125 L 397.9375,208.90625 L 395.78125,207.90625 L 396.5625,206.9375 L 397.75,206.5625 L 400.28125,203.625 L 400.0625,202.0625 L 398.5,198.9375 L 396.1875,198.53125 L 395.375,200.5 L 391.09375,201.46875 L 390.6875,200.5 L 387.5625,196.59375 L 385.8125,197.5625 L 383.46875,197.375 L 382.6875,195.8125 L 379.5625,196 L 379.375,192.6875 L 377.625,191.5 L 380.15625,188.78125 L 375.65625,182.71875 L 372.15625,179 L 369.03125,177.25 L 363.375,177.25 z '
          }, {
            'dept': "Nièvre",
            'code': '58',
            'path': 'M 306.75,203.78125 L 305.78125,205.3125 L 303.9375,205.3125 L 301.46875,204.75 L 298.71875,205.5625 L 298.90625,207.53125 L 301.25,210.25 L 301.25,213.96875 L 299.5,216.5 L 300.0625,218.84375 L 303.59375,221.59375 L 303.78125,224.3125 L 305.75,228.4375 L 305.34375,233.125 L 307.5,235.25 L 306.90625,240.34375 L 306.71875,242.875 L 307.6875,244.625 L 306.1875,249.40625 L 306.3125,250.875 L 309.65625,252.4375 L 312,255 L 314.125,253.8125 L 316.09375,252.65625 L 316.5,254.40625 L 319.40625,254.40625 L 320.1875,252.84375 L 321.9375,253.625 L 322.53125,256.15625 L 324.09375,255.78125 L 327.8125,250.6875 L 329.75,252.0625 L 330.0625,252.65625 L 333.125,250.75 L 334.375,250.90625 L 335.34375,253.28125 L 337.1875,253 L 338.59375,251.59375 L 340.40625,251.59375 L 341.8125,249.78125 L 343.21875,249.5 L 343.5,248.5 L 346.5625,248.65625 L 346.71875,247.9375 L 345.3125,246.6875 L 345.3125,245.4375 L 347.28125,244.3125 L 347.28125,243.46875 L 345.4375,242.34375 L 345.15625,240.25 L 345.3125,238.28125 L 344.0625,237.4375 L 345.15625,235.90625 L 346.15625,235.34375 L 346.84375,233.65625 L 345.875,233.09375 L 344.75,231.40625 L 346.15625,229.4375 L 348.53125,228.03125 L 351.46875,228.03125 L 351.46875,225.8125 L 352.3125,225.53125 L 352.3125,224.6875 L 351.0625,222.71875 L 348.25,222.15625 L 347.28125,220.46875 L 347.6875,218.9375 L 347.96875,216.8125 L 347.46875,215.6875 L 344.34375,217.8125 L 343.0625,218.375 L 341.375,217.25 L 341.53125,214.4375 L 339.6875,214.4375 L 338.15625,215.4375 L 337.75,214.15625 L 338.59375,212.75 L 337.59375,211.5 L 336.46875,213.1875 L 336.625,214.4375 L 333.96875,214.3125 L 329.75,210.375 L 326.53125,210.25 L 326.53125,208.125 L 324.28125,206.71875 L 323.84375,204.90625 L 323.15625,204.78125 L 323.15625,208.28125 L 321.90625,208.5625 L 320.0625,208 L 318.125,209.25 L 317,209.53125 L 315.875,208.5625 L 314.75,209.125 L 312.21875,207.4375 L 310.40625,207.4375 L 309.125,206.59375 L 309.40625,205.03125 L 308,203.78125 L 306.75,203.78125 z '
          }, {
            'dept': "Saône-et-Loire",
            'code': '71',
            'path': 'M 351.46875,227.84375 L 351.46875,228.03125 L 348.53125,228.03125 L 346.15625,229.4375 L 344.75,231.40625 L 345.875,233.09375 L 346.84375,233.65625 L 346.15625,235.34375 L 345.15625,235.90625 L 344.0625,237.4375 L 345.3125,238.28125 L 345.15625,240.25 L 345.4375,242.34375 L 347.28125,243.46875 L 347.28125,244.3125 L 345.3125,245.4375 L 345.3125,246.6875 L 346.71875,247.9375 L 346.5625,248.65625 L 343.5,248.5 L 343.21875,249.5 L 341.8125,249.78125 L 340.40625,251.59375 L 338.59375,251.59375 L 337.1875,253 L 335.34375,253.28125 L 334.375,250.90625 L 333.125,250.75 L 330.0625,252.65625 L 333.6875,259.46875 L 333.6875,262.40625 L 334.65625,263.59375 L 337.96875,263.59375 L 339.125,265.15625 L 342.25,265.15625 L 343.625,267.09375 L 343.4375,274.71875 L 339.34375,277.84375 L 339.25,278.0625 L 339.53125,278.03125 L 340.125,278.21875 L 340.3125,281.34375 L 343.25,281.9375 L 343.625,283.3125 L 345.1875,283.3125 L 347.53125,281.9375 L 353.78125,282.90625 L 354.96875,284.09375 L 356.53125,282.53125 L 358.6875,282.53125 L 359.84375,276.28125 L 360.625,275.6875 L 362.5625,275.6875 L 364.9375,277.25 L 366.6875,275.6875 L 367.84375,277.25 L 369.625,275.5 L 371.75,275.3125 L 372.75,278.4375 L 373.5,282.34375 L 374.875,282.53125 L 376.0625,279.78125 L 379.75,265.34375 L 381.125,262.8125 L 383.28125,262.59375 L 385.4375,264.375 L 387,263.96875 L 388.9375,262.59375 L 390.90625,263 L 392.0625,265.53125 L 393.1875,265.96875 L 398.3125,265.34375 L 400.28125,263.78125 L 399.5,262.59375 L 397.15625,261.8125 L 396.9375,259.09375 L 398.90625,257.71875 L 399.6875,254.40625 L 397.9375,251.28125 L 396.75,249.71875 L 397.34375,249.125 L 397.34375,247.1875 L 395.78125,246.1875 L 395.375,244.625 L 399.875,244.0625 L 400.28125,242.5 L 398.90625,242.5 L 397.75,241.125 L 395.59375,241.125 L 393.8125,238.1875 L 392.25,238 L 392.4375,235.65625 L 390.75,235.46875 L 388.5,237 L 386.25,237.5625 L 384.71875,236.59375 L 382.75,236.46875 L 382.1875,237.28125 L 380.375,237.5625 L 376.3125,238.84375 L 370.40625,240.9375 L 368.15625,239.125 L 365.5,238.5625 L 365.375,236.1875 L 362.84375,234.34375 L 359.34375,231.6875 L 355.40625,231.8125 L 351.625,227.90625 L 351.46875,227.84375 z '
          }, {
            'dept': "Yonne",
            'code': '89',
            'path': 'M 318.4375,157.34375 L 316.6875,158.6875 L 309.0625,158.3125 L 305.5625,160.0625 L 304.1875,163 L 305.75,164.75 L 303.40625,167.5 L 301.625,169.625 L 305.15625,172.96875 L 306.125,176.09375 L 308.6875,178.8125 L 308.6875,182.34375 L 303.59375,186.625 L 305.34375,188.59375 L 304.96875,191.5 L 302.21875,193.46875 L 298.3125,193.46875 L 298.90625,195.625 L 301.4375,199.125 L 302.03125,202.25 L 302.625,204.40625 L 301.46875,204.75 L 303.9375,205.3125 L 305.78125,205.3125 L 306.75,203.78125 L 308,203.78125 L 309.40625,205.03125 L 309.125,206.59375 L 310.40625,207.4375 L 312.21875,207.4375 L 314.75,209.125 L 315.875,208.5625 L 317,209.53125 L 318.125,209.25 L 320.0625,208 L 321.90625,208.5625 L 323.15625,208.28125 L 323.15625,204.78125 L 323.84375,204.90625 L 324.28125,206.71875 L 326.53125,208.125 L 326.53125,210.25 L 329.75,210.375 L 333.96875,214.3125 L 336.625,214.4375 L 336.46875,213.1875 L 337.59375,211.5 L 338.59375,212.75 L 337.75,214.15625 L 338.15625,215.4375 L 339.6875,214.4375 L 341.53125,214.4375 L 341.375,217.25 L 343.0625,218.375 L 344.34375,217.8125 L 347.46875,215.6875 L 347.28125,215.28125 L 345.4375,214.15625 L 345.3125,212.1875 L 347.28125,211.21875 L 348.125,210.09375 L 347.5625,209.125 L 347.5625,206.875 L 349.09375,204.625 L 351.34375,199.84375 L 351.75,197.75 L 353.15625,197.1875 L 353.3125,196.78125 L 352.59375,196.21875 L 352.59375,194.53125 L 354.84375,192.84375 L 355.40625,190.03125 L 354.4375,188.375 L 352.875,188.375 L 352.46875,187.9375 L 352.46875,185.5625 L 354.4375,184.15625 L 354.28125,182.75 L 354,181.34375 L 353,183.5 L 351.625,183.3125 L 350.46875,181.15625 L 346.5625,183.125 L 338.75,182.71875 L 337.78125,180.5625 L 335.625,177.65625 L 335.25,174.125 L 332.125,170.40625 L 330.15625,171.78125 L 326.625,169.0625 L 327.21875,163.78125 L 322.15625,158.5 L 319.8125,158.5 L 318.4375,157.34375 z '
          }
        ]
      }, {
        'rgn': '53',
        'dpts': [{
            'dept': "Côtes d'Armor",
            'code': '22',
            'path': 'M 69.78125,123.21875 L 68,124.59375 L 63.53125,125.15625 L 62.53125,126.53125 L 59.40625,124.1875 L 55.3125,126.9375 L 56.875,129.0625 L 54.15625,132.78125 L 54.03125,132.71875 L 52.90625,137.96875 L 55.3125,138.125 L 55.15625,140.21875 L 56.9375,141.34375 L 55.3125,142.96875 L 54.1875,143.78125 L 54.34375,145.6875 L 56.78125,146.5 L 54.5,147.15625 L 54.5,149.5625 L 55.96875,151.5 L 56.28125,157.15625 L 55.3125,158.125 L 56.125,161.03125 L 59.1875,161.84375 L 59.5,163.4375 L 61.4375,163.59375 L 63.0625,162.46875 L 64.03125,163.4375 L 67.75,165.0625 L 70.8125,163.4375 L 71.59375,161.84375 L 74.1875,161.65625 L 77.09375,164.25 L 79.84375,163.59375 L 82.25,166.03125 L 83.375,166.03125 L 84.5,167.46875 L 86.78125,167.46875 L 87.5625,166.34375 L 88.53125,168.4375 L 90.96875,169.40625 L 94.03125,167.46875 L 94.03125,165.375 L 96.28125,164.5625 L 97.71875,164.5625 L 99.5,167.8125 L 103.375,168.125 L 105.3125,165.6875 L 107.40625,161.1875 L 110.15625,160.21875 L 111.59375,158.125 L 113.0625,159.5625 L 116.125,158.9375 L 117.09375,150.0625 L 118.0625,146.5 L 117.09375,144.5625 L 115.46875,143.9375 L 114.375,138.03125 L 113.125,139.4375 L 109.40625,139.03125 L 109.03125,141.1875 L 106.6875,141.375 L 106.5,138.65625 L 104.53125,138.0625 L 103.15625,139.625 L 103.15625,135.71875 L 100.8125,137.46875 L 97.3125,136.875 L 96.125,139.21875 L 88.90625,143.125 L 88.90625,145.09375 L 87.34375,145.09375 L 87.34375,141.5625 L 83.25,139.625 L 83.625,136.09375 L 79.9375,133.375 L 79.9375,130.0625 L 77.1875,129.46875 L 77.375,126.34375 L 75.25,126.15625 L 75.4375,124 L 71.53125,124 L 70.9375,125.9375 L 69.78125,123.21875 z '
          }, {
            'dept': "Finistère",
            'code': '29',
            'path': 'M 40.65625,129.0625 L 38.53125,131.40625 L 36.1875,130.4375 L 31.875,130.84375 L 31.09375,132.78125 L 28.5625,133.375 L 28.15625,131.21875 L 23.6875,131.8125 L 23.6875,133.1875 L 20.5625,133.375 L 19.1875,132.40625 L 17.625,133.1875 L 17.21875,135.53125 L 11.96875,135.71875 L 9.21875,139.03125 L 11.5625,140.78125 L 8.4375,143.34375 L 9.40625,145.09375 L 8.625,149.375 L 11.75,149.78125 L 12.9375,148.59375 L 13.53125,149.375 L 20.9375,148.40625 L 25.8125,144.90625 L 21.53125,149 L 21.90625,150.9375 L 25.8125,149.1875 L 25.03125,151.9375 L 29.34375,152.125 L 29.15625,153.28125 L 24.46875,153.09375 L 20.75,152.125 L 16.25,149.96875 L 13.53125,153.09375 L 17.03125,154.28125 L 16.84375,159.53125 L 17.8125,158.75 L 19.96875,155.4375 L 24.0625,157.78125 L 26.03125,158.1875 L 26.8125,161.3125 L 25.625,163.4375 L 23.09375,163.25 L 20.75,163.25 L 16.84375,163.84375 L 10.1875,164.21875 L 8.84375,166 L 10.78125,167.15625 L 12.9375,166.96875 L 14.6875,168.53125 L 17.21875,168.34375 L 21.34375,173.03125 L 22.3125,178.09375 L 20.9375,180.84375 L 25.03125,181.625 L 29.53125,181.40625 L 30.5,179.65625 L 28.75,177.3125 L 30.5,178.09375 L 32.28125,177.90625 L 35.40625,179.65625 L 37.34375,179.28125 L 37.34375,175.9375 L 38.125,179.28125 L 40.65625,183.375 L 46.125,183.75 L 46.34375,182.59375 L 47.6875,184.53125 L 51.03125,185.125 L 53.5625,185.125 L 53.71875,185.34375 L 54.65625,181.5 L 56.9375,181.5 L 58.0625,179.71875 L 59.5,179.71875 L 59.65625,176.84375 L 60.46875,175.875 L 58.875,173.75 L 57.90625,174.90625 L 55.46875,172.96875 L 50.46875,172.15625 L 49.65625,169.25 L 48.21875,165.53125 L 48.0625,164.09375 L 50.46875,162.15625 L 52.75,162.15625 L 56,160.59375 L 55.3125,158.125 L 56.28125,157.15625 L 55.96875,151.5 L 54.5,149.5625 L 54.5,147.15625 L 56.78125,146.5 L 54.34375,145.6875 L 54.1875,143.78125 L 55.3125,142.96875 L 56.9375,141.34375 L 55.15625,140.21875 L 55.3125,138.125 L 52.90625,137.96875 L 54.03125,132.71875 L 50.8125,130.84375 L 45.34375,131.03125 L 45.34375,134.9375 L 43.78125,134.9375 L 43.40625,133.1875 L 41.0625,133.5625 L 40.65625,129.0625 z '
          }, {
            'dept': "Ille-et-Vilaine",
            'code': '35',
            'path': 'M 116.25,135.90625 L 114.375,138.03125 L 115.46875,143.9375 L 117.09375,144.5625 L 118.0625,146.5 L 117.09375,150.0625 L 116.125,158.9375 L 113.0625,159.5625 L 111.59375,158.125 L 110.15625,160.21875 L 107.40625,161.1875 L 105.3125,165.6875 L 104.03125,167.3125 L 104.5,169.40625 L 103.6875,172.625 L 102.25,173.9375 L 102.25,175.21875 L 103.21875,175.53125 L 105.96875,175.53125 L 108.375,177 L 110,179.90625 L 108.53125,181.84375 L 109.03125,183.75 L 111.125,183.75 L 111.28125,185.6875 L 109.65625,187.625 L 107.90625,188.4375 L 109.03125,189.09375 L 109.34375,190.0625 L 107.5625,191.5 L 109.625,195.375 L 113.5625,193.28125 L 125.65625,192.6875 L 126.4375,190.53125 L 128.40625,188.59375 L 132.6875,188 L 132.875,185.84375 L 135.8125,186.25 L 137.5625,188.59375 L 141.5,189.5625 L 142.25,188 L 143.25,184.46875 L 145.78125,178.21875 L 147.15625,177.4375 L 150.46875,177.84375 L 150.46875,172.5625 L 149.09375,171.1875 L 149.09375,165.53125 L 148.5,163.59375 L 148.5,160.46875 L 150.46875,158.5 L 150.46875,154.59375 L 149.5,153.8125 L 149.6875,148.34375 L 148.125,147.5625 L 145.78125,147.5625 L 143.8125,146 L 141.6875,148.53125 L 139.9375,148.75 L 138.375,150.875 L 136.8125,150.5 L 133.46875,147.5625 L 132.3125,143.84375 L 131.71875,141.375 L 122.125,141.375 L 118.59375,139.21875 L 120.9375,136.09375 L 116.25,135.90625 z '
          }, {
            'dept': "Morbihan",
            'code': '56',
            'path': 'M 56,160.59375 L 52.75,162.15625 L 50.46875,162.15625 L 48.0625,164.09375 L 48.21875,165.53125 L 49.65625,169.25 L 50.46875,172.15625 L 55.46875,172.96875 L 57.90625,174.90625 L 58.875,173.75 L 60.46875,175.875 L 59.65625,176.84375 L 59.5,179.71875 L 58.0625,179.71875 L 56.9375,181.5 L 54.65625,181.5 L 53.71875,185.34375 L 55.90625,188.84375 L 59.03125,189.625 L 60.1875,187.875 L 59.625,190 L 62.34375,191.1875 L 65.875,194.6875 L 67.03125,196.84375 L 66.65625,199.375 L 66.25,201.9375 L 68.59375,203.6875 L 69.78125,202.3125 L 68.59375,200.75 L 68.59375,197.25 L 70.9375,197.8125 L 71.71875,195.46875 L 72.3125,196.84375 L 74.84375,199 L 76.03125,197.03125 L 74.84375,194.3125 L 77,197.25 L 79.71875,196.84375 L 79.15625,195.46875 L 81.6875,196.0625 L 83.625,198.40625 L 82.65625,199.96875 L 80.125,199.1875 L 77.1875,197.8125 L 75.625,199.78125 L 77.96875,200.5625 L 79.71875,203.28125 L 90.28125,202.3125 L 93,202.90625 L 91.65625,204.0625 L 91.84375,205.84375 L 92.21875,206.125 L 93.0625,205.96875 L 94.8125,204.21875 L 95.96875,205.5625 L 99.09375,205.5625 L 102.8125,203.625 L 108.28125,201.46875 L 108.46875,196 L 109.625,195.375 L 107.5625,191.5 L 109.34375,190.0625 L 109.03125,189.09375 L 107.90625,188.4375 L 109.65625,187.625 L 111.28125,185.6875 L 111.125,183.75 L 109.03125,183.75 L 108.53125,181.84375 L 110,179.90625 L 108.375,177 L 105.96875,175.53125 L 103.21875,175.53125 L 102.25,175.21875 L 102.25,173.9375 L 103.6875,172.625 L 104.5,169.40625 L 104.03125,167.3125 L 103.375,168.125 L 99.5,167.8125 L 97.71875,164.5625 L 96.28125,164.5625 L 94.03125,165.375 L 94.03125,167.46875 L 90.96875,169.40625 L 88.53125,168.4375 L 87.5625,166.34375 L 86.78125,167.46875 L 84.5,167.46875 L 83.375,166.03125 L 82.25,166.03125 L 79.84375,163.59375 L 77.09375,164.25 L 74.1875,161.65625 L 71.59375,161.84375 L 70.8125,163.4375 L 67.75,165.0625 L 64.03125,163.4375 L 63.0625,162.46875 L 61.4375,163.59375 L 59.5,163.4375 L 59.1875,161.84375 L 56.125,161.03125 L 56,160.59375 z '
          },
        ]
      }, {
        'rgn': '24',
        'dpts': [{
            'dept': "Cher",
            'code': '18',
            'path': 'M 275.53125,200.84375 L 272.6875,202.25 L 270.15625,204.34375 L 270.28125,205.1875 L 272.8125,205.875 L 273.8125,208 L 275.34375,208.5625 L 274.78125,209.8125 L 274.78125,211.90625 L 272.40625,212.90625 L 270.5625,216.25 L 270.4375,218.09375 L 271.125,218.9375 L 271.40625,219.90625 L 268.90625,221.3125 L 264.96875,221.71875 L 264,220.625 L 262.875,220.75 L 261.75,222 L 261.875,224.53125 L 259.375,224.6875 L 259.21875,226.90625 L 256.96875,228.75 L 257.25,229.59375 L 258.65625,230.71875 L 261.46875,231.125 L 263.5625,230.28125 L 266.21875,230.15625 L 267.5,231.125 L 267.0625,233.78125 L 269.3125,236.75 L 269.3125,238 L 268.34375,239.6875 L 268.34375,240.375 L 269.46875,241.65625 L 271.28125,241.65625 L 271.40625,242.46875 L 269.1875,244.3125 L 269.3125,245.5625 L 267.90625,246.28125 L 268.46875,247.25 L 270.28125,248.78125 L 270.28125,249.90625 L 268.34375,251.03125 L 268.34375,252.71875 L 271,254.125 L 271.5625,256.09375 L 273.25,257.625 L 273.09375,258.1875 L 272.40625,259.03125 L 272.25,261.5625 L 271.84375,262.40625 L 272.96875,264.625 L 273.375,266.3125 L 271.40625,268.28125 L 271.3125,269.84375 L 275.90625,269.28125 L 276.84375,267.28125 L 279.375,264.375 L 284.25,263.375 L 286.8125,264.15625 L 289.53125,262.03125 L 289.34375,260.46875 L 288.375,259.6875 L 288.375,256.5625 L 293.625,251.28125 L 295.59375,253.4375 L 297.34375,251.65625 L 298.90625,251.46875 L 301.625,247.96875 L 306.125,248.34375 L 306.1875,249.40625 L 307.6875,244.625 L 306.71875,242.875 L 306.90625,240.34375 L 307.5,235.25 L 305.34375,233.125 L 305.75,228.4375 L 303.78125,224.3125 L 303.59375,221.59375 L 300.0625,218.84375 L 299.5,216.5 L 301.25,213.96875 L 301.25,210.25 L 299.21875,207.875 L 297.21875,208.6875 L 296.25,208.28125 L 294.84375,206.4375 L 294,206.3125 L 293.4375,206.59375 L 293.28125,209.40625 L 292.03125,209.53125 L 291.0625,208.6875 L 288.8125,205.59375 L 287.96875,204.5 L 284.75,204.34375 L 283.1875,202.375 L 281.9375,202.375 L 281.375,203.09375 L 279.28125,203.375 L 277.59375,201.8125 L 275.625,200.96875 L 275.53125,200.84375 z '
          }, {
            'dept': "Eure-et-Loir",
            'code': '28',
            'path': 'M 247.15625,126.09375 L 245.96875,127.0625 L 245.96875,130.1875 L 242.0625,132.125 L 242.0625,135.0625 L 240.90625,136.4375 L 236,136.4375 L 233.6875,135.46875 L 226.625,139.15625 L 223.90625,139.15625 L 221.09375,141.84375 L 221.75,142.28125 L 221.9375,145.625 L 226.0625,149.125 L 226.4375,156.34375 L 224.5,158.6875 L 221.5625,159.28125 L 218.625,161.03125 L 219.03125,162.59375 L 220.375,164.375 L 220.375,169 L 220.78125,169.0625 L 223.5,171 L 222.5,172.25 L 224.4375,173.21875 L 227.53125,172.65625 L 229.34375,172.65625 L 229.21875,173.5 L 227.53125,174.46875 L 228.65625,175.3125 L 231.46875,175.3125 L 232.4375,177.5625 L 234.125,178.53125 L 235.375,181.34375 L 239.71875,182.46875 L 242.40625,182.1875 L 244.78125,179.9375 L 246.90625,180.53125 L 247.4375,179.375 L 247.3125,178.125 L 248.4375,177.28125 L 250.25,178.40625 L 251.375,177.5625 L 251.375,176.03125 L 252.90625,175.03125 L 254.3125,175.59375 L 255.5625,177 L 257.8125,175.75 L 260.1875,175.75 L 261.875,173.90625 L 262.875,170.28125 L 264.40625,170 L 264,166.34375 L 265.8125,164.8125 L 265.25,163.6875 L 265.46875,163.3125 L 264.9375,163.375 L 264.53125,158.125 L 264.125,157.53125 L 263.75,155 L 259.65625,154.21875 L 257.875,152.0625 L 257.3125,147.75 L 254.96875,147.375 L 254.5625,145.21875 L 251.84375,143.28125 L 250.46875,139.9375 L 251.84375,137.59375 L 250.46875,136.03125 L 250.46875,134.09375 L 251.25,131.9375 L 249.6875,130.375 L 249.09375,128.03125 L 247.15625,126.09375 z '
          }, {
            'dept': "Indre",
            'code': '36',
            'path': 'M 254.71875,221.4375 L 253.46875,221.875 L 250.9375,221.71875 L 248,222.71875 L 247.3125,224.25 L 247.03125,223.6875 L 243.65625,223.84375 L 241.96875,225.25 L 240,225.53125 L 239.71875,226.5 L 241.28125,228.59375 L 240.84375,230.4375 L 239.03125,230.5625 L 239.03125,232.09375 L 237.625,233.375 L 236.09375,235.90625 L 234.6875,234.625 L 232.59375,234.21875 L 229.5,235.34375 L 228.78125,238.84375 L 227.8125,241.65625 L 226.28125,249.625 L 224.15625,251.59375 L 222.4375,251.75 L 222.9375,252.25 L 222.9375,255.96875 L 222.15625,258.3125 L 225.875,261.25 L 227.8125,263.1875 L 230.9375,263.59375 L 232.125,267.6875 L 234.25,268.84375 L 233.875,271.78125 L 232.3125,272.0625 L 232.875,272.1875 L 237.78125,272.5625 L 239.53125,270.8125 L 242.65625,273.9375 L 246.5625,269.4375 L 248.3125,270.625 L 250.65625,270.40625 L 251.4375,270.8125 L 254.96875,271 L 256.125,267.875 L 265.90625,269.0625 L 269.625,270.03125 L 271.3125,269.84375 L 271.40625,268.28125 L 273.375,266.3125 L 272.96875,264.625 L 271.84375,262.40625 L 272.25,261.5625 L 272.40625,259.03125 L 273.09375,258.1875 L 273.25,257.625 L 271.5625,256.09375 L 271,254.125 L 268.34375,252.71875 L 268.34375,251.03125 L 270.28125,249.90625 L 270.28125,248.78125 L 268.46875,247.25 L 267.90625,246.28125 L 269.3125,245.5625 L 269.1875,244.3125 L 271.40625,242.46875 L 271.28125,241.65625 L 269.46875,241.65625 L 268.34375,240.375 L 268.34375,239.6875 L 269.3125,238 L 269.3125,236.75 L 267.0625,233.78125 L 267.5,231.125 L 266.21875,230.15625 L 263.5625,230.28125 L 261.46875,231.125 L 258.65625,230.71875 L 257.25,229.59375 L 256.96875,228.75 L 259.21875,226.90625 L 259.375,224.6875 L 256.40625,223 L 254.71875,221.4375 z '
          }, {
            'dept': "Indre-et-Loire",
            'code': '37',
            'path': 'M 212.1875,196.875 L 212.5625,197.75 L 206.90625,199.3125 L 205.5625,201.28125 L 203.1875,199.71875 L 204.375,203.625 L 202.21875,203.625 L 198.3125,200.875 L 196.375,204.78125 L 197.34375,205.96875 L 197.34375,207.125 L 195.375,209.6875 L 195.59375,213.96875 L 192.46875,217.6875 L 190.25,225.6875 L 190.5,225.6875 L 191.28125,228.8125 L 195,229.59375 L 195,231.9375 L 199.6875,233.3125 L 199.6875,237.03125 L 199.5,239.375 L 205.34375,239.375 L 210.4375,238.1875 L 210.03125,236.03125 L 211.59375,235.0625 L 213.15625,237.21875 L 214.53125,237.8125 L 215.6875,242.5 L 219.03125,246 L 219.40625,248.75 L 222.4375,251.75 L 224.15625,251.59375 L 226.28125,249.625 L 227.8125,241.65625 L 228.78125,238.84375 L 229.5,235.34375 L 232.59375,234.21875 L 234.6875,234.625 L 236.09375,235.90625 L 237.625,233.375 L 239.03125,232.09375 L 239.03125,230.5625 L 240.84375,230.4375 L 241.28125,228.59375 L 239.71875,226.5 L 239.96875,225.625 L 238.875,224.6875 L 235.9375,220.34375 L 232.15625,220.34375 L 231.03125,218.65625 L 231.03125,211.625 L 229.5,207.5625 L 229.21875,202.53125 L 227.25,202.375 L 225,200.6875 L 224.4375,200.6875 L 222.46875,202.09375 L 221.21875,201.25 L 220.9375,199.3125 L 222.34375,198.59375 L 222.46875,197.90625 L 221.65625,197.1875 L 212.1875,196.875 z '
          }, {
            'dept': "Loir-et-Cher",
            'code': '41',
            'path': 'M 222.5,172.25 L 221.1875,173.9375 L 219.625,176.65625 L 221.5625,178.4375 L 221.375,182.53125 L 220.59375,185.25 L 218.625,185.25 L 218.625,188.96875 L 215.90625,192.5 L 212.96875,193.65625 L 211.59375,195.40625 L 212.1875,196.875 L 221.65625,197.1875 L 222.46875,197.90625 L 222.34375,198.59375 L 220.9375,199.3125 L 221.21875,201.25 L 222.46875,202.09375 L 224.4375,200.6875 L 225,200.6875 L 227.25,202.375 L 229.21875,202.53125 L 229.5,207.5625 L 231.03125,211.625 L 231.03125,218.65625 L 232.15625,220.34375 L 235.9375,220.34375 L 238.875,224.6875 L 239.96875,225.625 L 240,225.53125 L 241.96875,225.25 L 243.65625,223.84375 L 247.03125,223.6875 L 247.3125,224.25 L 248,222.71875 L 250.9375,221.71875 L 253.46875,221.875 L 254.71875,221.4375 L 256.40625,223 L 259.375,224.6875 L 261.875,224.53125 L 261.75,222 L 262.875,220.75 L 264,220.625 L 264.96875,221.71875 L 268.90625,221.3125 L 271.40625,219.90625 L 271.125,218.9375 L 270.4375,218.09375 L 270.5625,216.25 L 272.40625,212.90625 L 274.78125,211.90625 L 274.78125,209.8125 L 275.34375,208.5625 L 273.8125,208 L 272.8125,205.875 L 270.28125,205.1875 L 270.15625,204.34375 L 272.6875,202.25 L 275.53125,200.84375 L 273.9375,198.46875 L 266.78125,198.1875 L 265.8125,199.3125 L 263.84375,199.3125 L 263.15625,198.59375 L 260.0625,198.1875 L 259.21875,200 L 257.25,200.5625 L 255.4375,198.46875 L 255,196.0625 L 253.34375,194.65625 L 250.8125,194.375 L 248.96875,193.125 L 248.96875,191.875 L 247.875,189.1875 L 250.09375,186.96875 L 249.8125,185.84375 L 248.84375,184.71875 L 247.71875,184.71875 L 247.71875,183.71875 L 248.84375,181.78125 L 248.96875,180.65625 L 247.3125,180.65625 L 244.78125,179.9375 L 242.40625,182.1875 L 239.71875,182.46875 L 235.375,181.34375 L 234.125,178.53125 L 232.4375,177.5625 L 231.46875,175.3125 L 228.65625,175.3125 L 227.53125,174.46875 L 229.21875,173.5 L 229.34375,172.65625 L 227.53125,172.65625 L 224.4375,173.21875 L 222.5,172.25 z '
          }, {
            'dept': "Loiret",
            'code': '45',
            'path': 'M 273.71875,160.46875 L 271.1875,162.8125 L 265.46875,163.3125 L 265.25,163.6875 L 265.8125,164.8125 L 264,166.34375 L 264.40625,170 L 262.875,170.28125 L 261.875,173.90625 L 260.1875,175.75 L 257.8125,175.75 L 255.5625,177 L 254.3125,175.59375 L 252.90625,175.03125 L 251.375,176.03125 L 251.375,177.5625 L 250.25,178.40625 L 248.4375,177.28125 L 247.3125,178.125 L 247.4375,179.375 L 246.90625,180.53125 L 247.3125,180.65625 L 248.96875,180.65625 L 248.84375,181.78125 L 247.71875,183.71875 L 247.71875,184.71875 L 248.84375,184.71875 L 249.8125,185.84375 L 250.09375,186.96875 L 247.875,189.1875 L 248.96875,191.875 L 248.96875,193.125 L 250.8125,194.375 L 253.34375,194.65625 L 255,196.0625 L 255.4375,198.46875 L 257.25,200.5625 L 259.21875,200 L 260.0625,198.1875 L 263.15625,198.59375 L 263.84375,199.3125 L 265.8125,199.3125 L 266.78125,198.1875 L 273.9375,198.46875 L 275.625,200.96875 L 277.59375,201.8125 L 279.28125,203.375 L 281.375,203.09375 L 281.9375,202.375 L 283.1875,202.375 L 284.75,204.34375 L 287.96875,204.5 L 288.8125,205.59375 L 291.0625,208.6875 L 292.03125,209.53125 L 293.28125,209.40625 L 293.4375,206.59375 L 294,206.3125 L 294.84375,206.4375 L 296.25,208.28125 L 297.21875,208.6875 L 299.21875,207.875 L 298.90625,207.53125 L 298.71875,205.5625 L 302.625,204.40625 L 302.03125,202.25 L 301.4375,199.125 L 298.90625,195.625 L 298.3125,193.46875 L 302.21875,193.46875 L 304.96875,191.5 L 305.34375,188.59375 L 303.59375,186.625 L 308.6875,182.34375 L 308.6875,178.8125 L 306.125,176.09375 L 305.15625,172.96875 L 301.625,169.625 L 296.75,172.375 L 296.375,170.8125 L 294.21875,170.625 L 293.625,172.1875 L 291.6875,172.5625 L 286.40625,172.375 L 284.25,173.75 L 282.5,172.1875 L 285.625,170.03125 L 285.4375,166.71875 L 283.09375,165.53125 L 281.125,162.59375 L 275.875,162.21875 L 273.71875,160.46875 z '
          }
        ]
      }, {
        'rgn': '21',
        'dpts': [{
            'dept': "Ardennes",
            'code': '08',
            'path': 'M 367.625,55.84375 L 365.65625,58.75 L 363.90625,60.53125 L 363.90625,62.28125 L 363.90625,64.625 L 361.5625,66.1875 L 357.28125,67.5625 L 354.9375,68.53125 L 352.1875,66.375 L 348.46875,66.375 L 347.9375,69.84375 L 349.6875,73.15625 L 347.9375,74.71875 L 347.75,77.65625 L 348.71875,79.21875 L 347.9375,81.5625 L 345,83.125 L 345,85.65625 L 341.28125,86.4375 L 340.6875,88 L 343.25,89.375 L 342.46875,92.09375 L 341.875,94.4375 L 342,99.3125 L 346.75,99.4375 L 350.90625,102.03125 L 351.6875,103.21875 L 353.875,103.8125 L 357.0625,106.1875 L 359.625,106.375 L 360.21875,105.78125 L 362.8125,105.78125 L 364,108.375 L 365.375,108.375 L 366.1875,107.1875 L 370.9375,107.375 L 371.71875,108.375 L 372.3125,108.375 L 374.3125,106.375 L 376.09375,107.96875 C 376.09375,107.96875 376.33461,107.94351 376.375,107.9375 L 376.25,107.125 L 378.59375,105.96875 L 379.75,104.78125 L 379,102.84375 L 378.78125,101.46875 L 380.9375,99.71875 L 381.71875,95.8125 L 379.375,92.875 L 380.15625,91.5 L 382.125,87.8125 L 382.6875,88.59375 L 385.625,88.59375 L 387,89.9375 L 388.75,88.78125 L 390.125,86.53125 L 388.71875,86.3125 L 387.9375,82.40625 L 386.375,81.21875 L 380.90625,80.625 L 379.9375,78.09375 L 378.15625,76.9375 L 371.90625,76.15625 L 371.53125,71.65625 L 372.3125,70.875 L 372.3125,69.125 L 369.1875,67.15625 L 369.78125,65 L 370.5625,63.0625 L 369.1875,61.875 L 371.34375,59.9375 L 371.34375,56.40625 L 370.5625,55.84375 L 367.625,55.84375 z '
          }, {
            'dept': "Aube",
            'code': '10',
            'path': 'm 349.3125,138.6875 -3.96875,2.1875 -3.375,2.375 -3.34375,0 -5.5625,3.78125 -4.75,0.78125 -3.375,-3.5625 -0.84375,0.1875 0,0.59375 -2.71875,1.15625 -0.1875,2.34375 -1.375,1.78125 -0.78125,3.90625 -0.4375,3.28125 1.21875,1 2.34375,0 5.0625,5.28125 -0.59375,5.28125 3.53125,2.71875 1.96875,-1.375 3.125,3.71875 0.375,3.53125 2.15625,2.90625 0.96875,2.15625 7.8125,0.40625 3.90625,-1.96875 1.15625,2.15625 1.375,0.1875 1,-2.15625 6.4375,-0.1875 2.53125,-1.375 0.40625,-2.53125 5.65625,0 0.78125,0.4375 -0.65625,-2.5 -1.59375,-1 2.1875,-1.96875 3.375,-0.21875 1.1875,-1.78125 -0.21875,-7.125 -0.78125,-4.15625 -3.375,-1.1875 -3.5625,-4.96875 0.1875,-2.96875 1.03125,-2.15625 -1.8125,-0.625 -5.5625,1.1875 -3.96875,0 -3.5625,-5.34375 -0.40625,-3.96875 -2.96875,-0.21875 z '
          }, {
            'dept': "Marne",
            'code': '51',
            'path': 'M 337.375,99.3125 L 335.03125,100.3125 L 335.4375,102.25 L 331.3125,102.25 L 327.625,105 L 327.625,110.25 L 330.34375,112.03125 L 331.125,113.78125 L 326.625,114.15625 L 326.0625,115.9375 L 327.8125,117.09375 L 327.03125,118.28125 L 325.28125,119.0625 L 325.65625,120.40625 L 328.1875,120.40625 L 329.1875,121.78125 L 327.4375,122.96875 L 325.875,127.0625 L 322.9375,128.4375 L 321.9375,130.5625 L 320.96875,131.75 L 321.1875,132.90625 L 319.625,133.90625 L 319.21875,136.625 L 320.78125,137.59375 L 321.5625,140.53125 L 320.59375,142.28125 L 321.1875,143.65625 L 324.09375,143.46875 L 324.09375,144.4375 L 324.9375,144.25 L 328.3125,147.8125 L 333.0625,147.03125 L 338.625,143.25 L 341.96875,143.25 L 345.34375,140.875 L 349.3125,138.6875 L 352.28125,138.90625 L 352.6875,142.875 L 356.25,148.21875 L 360.21875,148.21875 L 365.78125,147.03125 L 369.75,148.40625 L 373.90625,145.4375 L 374.5,140.5 L 379.09375,139.71875 L 379,136.625 L 375.28125,133.6875 L 374.875,132.125 L 376.25,129.78125 L 375.0625,128.8125 L 376.25,125.875 L 378.40625,124.90625 L 379.96875,120.03125 L 376.84375,120.21875 L 378.59375,118.28125 L 377.21875,113.96875 L 375.875,111.03125 L 377.625,109.46875 L 376.625,109.28125 L 376.375,107.9375 C 376.33461,107.94351 376.09375,107.96875 376.09375,107.96875 L 374.3125,106.375 L 372.3125,108.375 L 371.71875,108.375 L 370.9375,107.375 L 366.1875,107.1875 L 365.375,108.375 L 364,108.375 L 362.8125,105.78125 L 360.21875,105.78125 L 359.625,106.375 L 357.0625,106.1875 L 353.875,103.8125 L 351.6875,103.21875 L 350.90625,102.03125 L 346.75,99.4375 L 342,99.3125 L 342.0625,101.09375 L 340.6875,101.46875 L 337.375,99.3125 z '
          }, {
            'dept': "Haute-Marne",
            'code': '52',
            'path': 'M 379.09375,139.71875 L 374.5,140.5 L 373.90625,145.4375 L 369.75,148.40625 L 367.59375,147.65625 L 366.5625,149.8125 L 366.375,152.78125 L 369.9375,157.75 L 373.3125,158.9375 L 374.09375,163.09375 L 374.3125,170.21875 L 373.125,172 L 369.75,172.21875 L 367.5625,174.1875 L 369.15625,175.1875 L 369.8125,177.6875 L 372.15625,179 L 375.65625,182.71875 L 380.15625,188.78125 L 377.625,191.5 L 379.375,192.6875 L 379.5625,196 L 382.6875,195.8125 L 383.46875,197.375 L 385.8125,197.5625 L 387.5625,196.59375 L 390.6875,200.5 L 391.09375,201.46875 L 395.375,200.5 L 396.1875,198.53125 L 396.375,198.5625 L 396.375,196.59375 L 399.09375,195.40625 L 402.21875,196.59375 L 405.15625,195.40625 L 406.90625,195.40625 L 407.5,191.5 L 408.46875,190.34375 L 406.71875,190.15625 L 406.53125,187.8125 L 409.25,187.21875 L 409.4375,185.65625 L 412.1875,185.65625 L 412.1875,183.125 L 414.34375,182.34375 L 413.75,180.78125 L 414.34375,180.40625 L 412.5625,179 L 410.4375,179.78125 L 410.4375,175.6875 L 404.96875,172.96875 L 406.125,167.6875 L 407.875,166.5 L 407.3125,164.75 L 404.75,164.375 L 404.1875,161.8125 L 401.84375,161.8125 L 399.09375,158.125 L 395.96875,157.90625 L 394.625,155.96875 L 396.375,154.21875 L 392.25,149.71875 L 390.5,149.125 L 385.8125,146.78125 L 383.28125,144.0625 L 379.1875,143.46875 L 379.09375,139.71875 z '
          }
        ]
      }, {
        'rgn': '94',
        'dpts': [{
            'dept': "Corse-du-Sud",
            'code': '2a',
            'path': 'M 445.33847,488.9562 L 445.33847,491.11245 L 447.30722,492.48745 L 450.61972,494.42495 L 450.83847,495.98745 L 448.86972,496.5812 L 445.74472,497.17495 L 445.74472,498.5187 L 446.90097,499.7062 L 447.11972,503.61245 L 451.40097,504.98745 L 452.96347,505.36245 L 454.33847,507.5187 L 453.36972,508.8937 L 451.80722,509.4562 L 450.61972,511.61245 L 449.46347,512.98745 L 450.02597,516.48745 L 452.96347,516.29995 L 453.74472,516.8937 L 456.49472,515.5187 L 457.27597,516.29995 L 455.90097,519.23745 L 457.27597,520.61245 L 454.93222,522.36245 L 453.36972,525.86245 L 457.65097,526.86245 L 463.71347,527.42495 L 461.18222,530.36245 C 461.18222,530.36245 459.99289,529.90364 459.46347,530.1437 C 459.44782,530.15141 459.41536,530.16589 459.40097,530.17495 C 459.39647,530.17828 459.37406,530.20271 459.36972,530.2062 C 459.36553,530.20986 459.34249,530.23363 459.33847,530.23745 C 459.33478,530.24161 459.31073,530.26437 459.30722,530.2687 C 459.30054,530.27771 459.28192,530.29022 459.27597,530.29995 C 459.27319,530.30499 459.27856,530.32597 459.27597,530.3312 C 459.27118,530.34203 459.24871,530.38211 459.24472,530.3937 C 459.24293,530.39969 459.2463,530.41876 459.24472,530.42495 C 459.24199,530.43772 459.21532,530.47387 459.21347,530.48745 C 459.21207,530.50144 459.21394,530.53512 459.21347,530.54995 C 459.21348,531.52651 457.86972,533.8937 457.86972,533.8937 L 459.80722,536.0187 L 463.33847,538.17495 L 469.96347,539.92495 L 471.90097,540.7062 L 473.68222,541.48745 L 472.49472,543.6437 L 475.61972,543.4562 L 476.21347,544.8312 L 479.33847,544.8312 L 480.11972,541.11245 L 478.15097,540.7062 L 480.90097,537.79995 L 479.93222,536.79995 L 480.11972,535.04995 L 483.65097,533.11245 L 483.83847,530.9562 L 481.49472,530.7687 L 479.93222,532.11245 L 479.93222,530.17495 L 483.05722,529.98745 L 484.02597,527.6437 L 484.80722,520.79995 L 484.21347,517.86245 L 484.15097,515.04995 L 480.74472,517.29995 L 476.68222,517.4562 L 476.33847,514.6437 L 476.86972,513.92495 L 475.61972,513.04995 L 475.27597,508.2687 L 474.74472,507.3937 L 472.61972,507.3937 L 471.55722,506.5187 L 471.55722,503.1437 L 470.15097,502.2687 L 469.08847,501.73745 L 466.96347,499.0812 L 467.11972,497.48745 L 464.49472,497.48745 L 463.58847,494.8312 L 459.86972,494.8312 L 457.93222,492.17495 L 458.46347,491.29995 L 457.24472,490.5812 L 454.40097,491.11245 L 453.33847,490.42495 L 449.46347,490.42495 L 449.08847,489.36245 L 446.90097,488.9562 L 445.33847,488.9562 z '
          }, {
            'dept': "Haute-Corse",
            'code': '2b',
            'path': 'M 477.96347,449.8937 L 475.02597,451.86245 L 475.43222,453.79995 L 476.99472,455.7687 L 475.24472,457.11245 L 476.02597,458.67495 L 474.83847,460.04995 L 474.83847,461.79995 L 476.80722,463.5812 L 476.80722,466.29995 L 475.61972,468.8312 L 474.27597,469.42495 L 472.71347,467.2687 L 469.96347,467.48745 L 469.36972,467.0812 L 467.02597,467.0812 L 464.90097,469.04995 L 464.08847,472.36245 L 459.02597,473.3312 L 455.11972,476.6437 L 454.33847,478.79995 L 452.40097,478.61245 L 451.40097,477.42495 L 450.83847,480.7687 L 449.46347,481.3312 L 449.05722,484.4562 L 449.65097,485.8312 L 447.49472,487.3937 L 446.90097,488.9562 L 449.08847,489.36245 L 449.46347,490.42495 L 453.33847,490.42495 L 454.40097,491.11245 L 457.24472,490.5812 L 458.46347,491.29995 L 457.93222,492.17495 L 459.86972,494.8312 L 463.58847,494.8312 L 464.49472,497.48745 L 467.11972,497.48745 L 466.96347,499.0812 L 469.08847,501.73745 L 470.15097,502.2687 L 471.55722,503.1437 L 471.55722,506.5187 L 472.61972,507.3937 L 474.74472,507.3937 L 475.27597,508.2687 L 475.61972,513.04995 L 476.86972,513.92495 L 476.33847,514.6437 L 476.68222,517.4562 L 480.74472,517.29995 L 484.15097,515.04995 L 484.02597,509.2687 L 488.71347,502.6437 L 488.71347,491.7062 L 486.77597,487.98745 L 486.18222,476.2687 L 484.80722,474.11245 L 482.27597,472.17495 L 481.86972,464.92495 L 483.05722,461.61245 L 481.49472,456.3312 L 480.52597,452.04995 L 479.71347,450.86245 L 477.96347,449.8937 z '
          }
        ]
      }, {
        'rgn': '43',
        'dpts': [{
            'dept': "Doubs",
            'code': '25',
            'path': 'M 447.40625,199.71875 L 447.21875,199.9375 L 444.96875,199.9375 L 443.8125,201.53125 L 442.34375,202.375 L 442.34375,204.34375 L 438.6875,204.78125 L 436.71875,203.375 L 434.0625,203.78125 L 431.53125,205.75 L 429.71875,208.84375 L 427.90625,209.40625 L 427.0625,211.5 L 424.8125,211.90625 L 421.71875,214.4375 L 417.65625,214.3125 L 416.40625,215.28125 L 415.28125,215.28125 L 411.34375,218.5 L 409.5625,218.4375 L 409.53125,219.625 L 409.8125,221.71875 L 412.34375,223.40625 L 413.75,225.25 L 413.3125,227.1875 L 412.0625,230.15625 L 411.21875,232.09375 L 416.6875,233.9375 L 420.1875,233.65625 L 420.46875,236.59375 L 420.46875,240.53125 L 424.8125,241.9375 L 426.78125,242.46875 L 429.59375,245.15625 L 429.3125,247.40625 L 428.03125,249.21875 L 424.53125,250.34375 L 425.375,252.3125 L 425.78125,253.84375 L 424.25,255.375 L 424.40625,256.78125 L 426.78125,257 L 426.8125,256.8125 L 438.90625,245.46875 L 438.53125,236.09375 L 442.8125,233.96875 L 445.75,232.59375 L 448.46875,230.0625 L 448.6875,226.34375 L 451.40625,224.96875 L 457.65625,217.75 L 456.6875,215.40625 L 458.84375,214.4375 L 461.375,211.3125 L 460,209.9375 L 455.3125,210.90625 L 455.125,210.125 L 459.4375,205.15625 L 447.40625,199.71875 z '
          }, {
            'dept': "Jura",
            'code': '39',
            'path': 'M 401.15625,217.53125 L 401.25,218.0625 L 400.46875,218.0625 L 400.0625,221.1875 L 399.5,223.34375 L 399.875,224.71875 L 398.71875,226.28125 L 397.53125,227.84375 L 397.53125,229.40625 L 394.21875,230.96875 L 393.25,232.53125 L 393.625,233.6875 L 393.8125,234.6875 L 392.46875,235.46875 L 392.25,238 L 393.8125,238.1875 L 395.59375,241.125 L 397.75,241.125 L 398.90625,242.5 L 400.28125,242.5 L 399.875,244.0625 L 395.375,244.625 L 395.78125,246.1875 L 397.34375,247.1875 L 397.34375,249.125 L 396.75,249.71875 L 397.9375,251.28125 L 399.6875,254.40625 L 398.90625,257.71875 L 396.9375,259.09375 L 397.15625,261.8125 L 399.5,262.59375 L 400.28125,263.78125 L 398.3125,265.34375 L 393.1875,265.96875 L 395.59375,266.90625 L 399.5,272.375 L 402.03125,273.53125 L 402.03125,276.28125 L 404.96875,275.875 L 408.6875,271.78125 L 411.8125,273.34375 L 411.8125,275.6875 L 417.46875,275.6875 L 425.59375,266.75 L 425.25,266.5625 L 425.625,262.46875 L 428.5625,258.96875 L 426.59375,258.1875 L 426.78125,257 L 424.40625,256.78125 L 424.25,255.375 L 425.78125,253.84375 L 425.375,252.3125 L 424.53125,250.34375 L 428.03125,249.21875 L 429.3125,247.40625 L 429.59375,245.15625 L 426.78125,242.46875 L 424.8125,241.9375 L 420.46875,240.53125 L 420.46875,236.59375 L 420.1875,233.65625 L 416.6875,233.9375 L 411.21875,232.09375 L 412.0625,230.15625 L 413.3125,227.1875 L 413.75,225.25 L 412.34375,223.40625 L 409.8125,221.71875 L 409.53125,219.625 L 409.5625,218.4375 L 407.84375,218.375 L 406.875,219.34375 L 404.34375,219.34375 L 402.65625,217.9375 L 401.15625,217.53125 z '
          }, {
            'dept': "Haute-Saône",
            'code': '70',
            'path': 'M 423.5,175.5 L 419.8125,176.09375 L 419.21875,178.03125 L 417.25,179.40625 L 415.90625,177.84375 L 414.9375,178.4375 L 415.6875,179.59375 L 413.75,180.78125 L 414.34375,182.34375 L 412.1875,183.125 L 412.1875,185.65625 L 409.4375,185.65625 L 409.25,187.21875 L 406.53125,187.8125 L 406.71875,190.15625 L 408.46875,190.34375 L 407.5,191.5 L 406.90625,195.40625 L 405.15625,195.40625 L 402.21875,196.59375 L 399.09375,195.40625 L 396.375,196.59375 L 396.375,198.5625 L 398.5,198.9375 L 400.0625,202.0625 L 400.28125,203.625 L 397.75,206.5625 L 396.5625,206.9375 L 395.78125,207.90625 L 397.9375,208.90625 L 398.3125,212.03125 L 400.0625,212.21875 L 400.28125,216.125 L 401.0625,216.90625 L 401.15625,217.53125 L 402.65625,217.9375 L 404.34375,219.34375 L 406.875,219.34375 L 407.84375,218.375 L 409.5625,218.4375 L 411.34375,218.5 L 415.28125,215.28125 L 416.40625,215.28125 L 417.65625,214.3125 L 421.71875,214.4375 L 424.8125,211.90625 L 427.0625,211.5 L 427.90625,209.40625 L 429.71875,208.84375 L 431.53125,205.75 L 434.0625,203.78125 L 436.71875,203.375 L 438.6875,204.78125 L 442.34375,204.34375 L 442.34375,202.375 L 443.8125,201.53125 L 444.96875,199.9375 L 447.21875,199.9375 L 448.46875,198.625 L 448.9375,195.5 L 448.9375,193.5625 L 448.09375,190.59375 L 448.09375,188.09375 L 449.625,186.96875 L 451.4375,186.03125 L 451.25,185.65625 L 445,182.34375 L 443.25,180.375 L 441.5,179.21875 L 439.9375,180 L 439.71875,181.15625 L 438.15625,182.125 L 437.1875,182.125 L 434.25,178.8125 L 430.15625,178.8125 L 428.40625,180.1875 L 426.84375,180.375 L 424.3125,178.4375 L 424.5,176.28125 L 423.5,175.5 z '
          }, {
            'dept': "Territoire-de-Belfort",
            'code': '90',
            'path': 'M 451.4375,186.03125 L 449.625,186.96875 L 448.09375,188.09375 L 448.09375,190.59375 L 448.9375,193.5625 L 448.9375,195.5 L 448.46875,198.625 L 447.40625,199.71875 L 459.4375,205.15625 L 460.1875,204.28125 L 462.78125,203.875 L 461.8125,199.71875 L 461.21875,197.5625 L 458.46875,197.96875 L 458.09375,195.625 L 459.0625,193.84375 L 459.25,191.5 L 458.6875,190.15625 L 455.15625,187.40625 L 452.03125,187.21875 L 451.4375,186.03125 z '
          }
        ]
      }, {
        'rgn': '23',
        'dpts': [{
            'dept': "Eure",
            'code': '27',
            'path': 'M 211,94.5625 L 209.3125,94.96875 L 207.0625,97.375 L 202.6875,97.9375 L 203.59375,105.1875 L 205.5625,105.78125 L 205.5625,106.5625 L 203.59375,107.71875 L 205.9375,111.03125 L 207.125,115.71875 L 206.90625,117.6875 L 205.15625,118.84375 L 205.34375,120.21875 L 207.3125,121 L 207.5,122.75 L 205.9375,127.25 L 207.5,129.21875 L 212.96875,129.40625 L 214.125,132.125 L 216.09375,134.09375 L 218.8125,135.0625 L 219.625,138 L 218.25,139.9375 L 221.09375,141.84375 L 223.90625,139.15625 L 226.625,139.15625 L 233.6875,135.46875 L 236,136.4375 L 240.90625,136.4375 L 242.0625,135.0625 L 242.0625,132.125 L 245.96875,130.1875 L 245.96875,127.0625 L 247.03125,126.1875 L 246.9375,125.3125 L 247.9375,124.3125 L 246.1875,123.9375 L 246.1875,122.375 L 245.1875,120.8125 L 245.96875,119.84375 L 251.4375,118.28125 L 252.8125,115.9375 L 254,111.625 L 255.4375,109.84375 L 255.75,107.53125 L 257.5,108.5 L 258.875,108.125 L 257.875,106.5625 L 257.3125,102.0625 L 255.5625,100.5 L 255.59375,100.375 L 252.5,100.03125 L 247.3125,97.375 L 242.8125,97.5 L 240.4375,99.59375 L 239.15625,103.25 L 234.125,103.8125 L 229.34375,105.21875 L 231.03125,106.34375 L 230.34375,108.03125 L 228.09375,108.03125 L 226.84375,105.34375 L 225.4375,105.34375 L 223.1875,103.65625 L 226.28125,102.6875 L 221.5,99.3125 L 216.75,99.59375 L 215.625,97.65625 L 212.9375,97.9375 L 211,94.5625 z '
          }, {
            'dept': "Seine-Maritime",
            'code': '76',
            'path': 'M 241.9375,61.5 L 240.65625,63.0625 L 232.28125,69.5 L 217.4375,73.21875 L 207.65625,76.71875 L 199.65625,81.03125 L 194.96875,88.0625 L 194,93.53125 L 197.90625,96.46875 L 203.5625,97.625 L 202.65625,97.78125 L 202.6875,97.9375 L 207.0625,97.375 L 209.3125,94.96875 L 211,94.5625 L 212.9375,97.9375 L 215.625,97.65625 L 216.75,99.59375 L 221.5,99.3125 L 226.28125,102.6875 L 223.1875,103.65625 L 225.4375,105.34375 L 226.84375,105.34375 L 228.09375,108.03125 L 230.34375,108.03125 L 231.03125,106.34375 L 229.34375,105.21875 L 234.125,103.8125 L 239.15625,103.25 L 240.4375,99.59375 L 242.8125,97.5 L 247.3125,97.375 L 252.5,100.03125 L 255.59375,100.375 L 256.125,98.75 L 257.5,96.1875 L 258.28125,94.84375 L 256.3125,94.84375 L 256.3125,91.5 L 255.15625,89.5625 L 255.9375,85.65625 L 256.71875,83.6875 L 255.15625,83.6875 L 255.9375,81.75 L 257.875,79.40625 L 255.9375,75.875 L 255.34375,72.375 L 246.75,63.96875 L 245.78125,62.03125 L 243.625,62.21875 L 241.9375,61.5 z '
          }
        ]
      }, {
        'rgn': '11',
        'dpts': [
          /*75*/
          {
            'dept': "",
            'code': '',
            'path': 'M 280.28125,129.0625 L 277.75,129.09375 L 276.625,129.59375 L 276.15625,130.21875 L 275.125,130.28125 L 274.1875,131.34375 L 274.21875,131.9375 L 274.4375,132.625 L 276,133.0625 L 277.90625,134.03125 L 279.125,134.09375 L 279.9375,133.875 L 280.78125,133.28125 L 281.0625,133.53125 L 282.875,133.78125 L 283.1875,133.125 L 283.1875,132.46875 L 282.875,132.34375 L 281.625,132.40625 L 281.71875,132.71875 L 281.5,132.90625 L 281.09375,132.90625 L 281.25,132.5 L 281.3125,132.0625 L 281.25,132.0625 L 281.09375,130.3125 L 280.28125,129.0625 z '
          }, {
            'dept': "Seine-et-Marne",
            'code': '77',
            'path': 'M 307.5,116.5 L 306.3125,117.09375 L 304.375,118.65625 L 302.4375,118.0625 L 299.09375,119.4375 L 296.375,117.875 L 295.1875,119.4375 L 293.4375,119.625 L 292.25,118.65625 L 290.3125,117.5 L 287.96875,119.0625 L 287.875,118.96875 L 287.03125,124.375 L 288.1875,131.25 L 288.1875,135.84375 L 286.65625,139.6875 L 287.03125,142.34375 L 285.3125,143.6875 L 286.25,148.875 L 285.5,150 L 284.9375,155.1875 L 286.25,156.90625 L 281.875,159.78125 L 281.875,163.71875 L 283.09375,165.53125 L 285.4375,166.71875 L 285.625,170.03125 L 282.5,172.1875 L 284.25,173.75 L 286.40625,172.375 L 291.6875,172.5625 L 293.625,172.1875 L 294.21875,170.625 L 296.375,170.8125 L 296.75,172.375 L 301.625,169.625 L 303.40625,167.5 L 305.75,164.75 L 304.1875,163 L 305.5625,160.0625 L 309.0625,158.3125 L 316.6875,158.6875 L 318.4375,157.34375 L 318.59375,157.5 L 319.03125,154.21875 L 319.8125,150.3125 L 321.1875,148.53125 L 321.375,146.1875 L 324.09375,145.03125 L 324.09375,143.46875 L 321.1875,143.65625 L 320.59375,142.28125 L 321.5625,140.53125 L 320.78125,137.59375 L 319.21875,136.625 L 319.625,133.90625 L 321.1875,132.90625 L 320.96875,131.75 L 321.53125,131.0625 L 318.25,130.375 L 317.25,128.03125 L 315.5,127.4375 L 310.25,122.375 L 309.65625,118.0625 L 307.5,116.5 z '
          }, {
            'dept': "Yvelines",
            'code': '78',
            'path': 'M 251.5,118.15625 L 251.4375,118.28125 L 245.96875,119.84375 L 245.1875,120.8125 L 246.1875,122.375 L 246.1875,123.9375 L 247.9375,124.3125 L 246.9375,125.3125 L 247.03125,126.1875 L 247.15625,126.09375 L 249.09375,128.03125 L 249.6875,130.375 L 251.25,131.9375 L 250.46875,134.09375 L 250.46875,136.03125 L 251.84375,137.59375 L 250.46875,139.9375 L 251.84375,143.28125 L 254.5625,145.21875 L 254.96875,147.375 L 257.3125,147.75 L 257.875,152.0625 L 259.65625,154.21875 L 262.8125,154.8125 L 263.28125,151.71875 L 264.625,150.1875 L 263.5,148.46875 L 266.34375,148.46875 L 268.28125,145.8125 L 266.9375,143.5 L 267.3125,141.40625 L 270.1875,140.0625 L 270.5625,137.9375 L 272.46875,137.1875 L 274.21875,136.40625 L 274.5625,136.625 L 274.5625,136.40625 L 272.8125,134.4375 L 271.71875,131.46875 L 273.46875,127.65625 L 272.59375,124.78125 L 269.1875,122.71875 L 264.375,122.5 L 259.875,119.625 L 256.25,120.28125 L 251.5,118.15625 z '
          }, {
            'dept': "Essonne",
            'code': '91',
            'path': 'M 274.21875,136.40625 L 272.46875,137.1875 L 270.5625,137.9375 L 270.1875,140.0625 L 267.3125,141.40625 L 266.9375,143.5 L 268.28125,145.8125 L 266.34375,148.46875 L 263.5,148.46875 L 264.625,150.1875 L 263.28125,151.71875 L 262.8125,154.8125 L 263.75,155 L 264.125,157.53125 L 264.53125,158.125 L 264.9375,163.375 L 271.1875,162.8125 L 273.71875,160.46875 L 275.875,162.21875 L 281.125,162.59375 L 281.875,163.71875 L 281.875,159.78125 L 286.25,156.90625 L 284.9375,155.1875 L 285.5,150 L 286.25,148.875 L 285.3125,143.6875 L 287.03125,142.34375 L 286.6875,139.90625 L 284.53125,138.90625 L 280.90625,138.90625 L 278.8125,137.75 L 277.28125,138.53125 L 274.21875,136.40625 z '
          },
          /*92*/
          {
            'dept': "",
            'code': '',
            'path': 'M 277.3125,125.78125 L 273.8125,127.65625 L 273.4375,127.71875 L 271.71875,131.46875 L 272.8125,134.4375 L 274.5625,136.40625 L 274.5625,136.625 L 277.28125,138.53125 L 277.9375,138.1875 L 277.4375,137.25 L 277.9375,135.78125 L 277.625,135.25 L 277.96875,134.03125 L 277.90625,134.03125 L 276,133.0625 L 274.4375,132.625 L 274.21875,131.9375 L 274.1875,131.34375 L 275.125,130.28125 L 276.15625,130.21875 L 276.625,129.59375 L 277.75,129.09375 L 277.375,128.1875 L 277.90625,128.09375 L 278.3125,127.21875 L 277.90625,126.59375 L 277.46875,126.5 L 277.3125,125.78125 z '
          },
          /*93*/
          {
            'dept': "",
            'code': '',
            'path': 'M 287.28125,122.8125 L 285.4375,124.125 L 282.5625,125.4375 L 277.3125,125.78125 L 277.46875,126.5 L 277.90625,126.59375 L 278.3125,127.21875 L 277.90625,128.09375 L 277.375,128.1875 L 277.75,129.09375 L 280.28125,129.0625 L 281.09375,130.3125 L 281.25,132.0625 L 282.125,131.9375 L 282.9375,131.28125 L 284.15625,131.34375 L 285.6875,132.21875 L 286.5625,133.1875 L 286.96875,133.375 L 287.21875,133.84375 L 288.1875,134.09375 L 288.1875,131.25 L 287.03125,124.375 L 287.28125,122.8125 z '
          },
          /*94*/
          {
            'dept': "",
            'code': '',
            'path': 'M 282.9375,131.28125 L 282.125,131.9375 L 281.3125,132.0625 L 281.25,132.5 L 281.09375,132.90625 L 281.5,132.90625 L 281.71875,132.71875 L 281.625,132.40625 L 282.875,132.34375 L 283.1875,132.46875 L 283.1875,133.125 L 282.875,133.78125 L 281.0625,133.53125 L 280.78125,133.28125 L 279.9375,133.875 L 279.125,134.09375 L 277.96875,134.03125 L 277.625,135.25 L 277.9375,135.78125 L 277.4375,137.25 L 277.9375,138.1875 L 278.8125,137.75 L 280.90625,138.90625 L 284.53125,138.90625 L 286.6875,139.90625 L 286.65625,139.6875 L 288.1875,135.84375 L 288.1875,134.09375 L 287.21875,133.84375 L 286.96875,133.375 L 286.5625,133.1875 L 285.6875,132.21875 L 284.15625,131.34375 L 282.9375,131.28125 z '
          }, {
            'dept': "Val-d'Oise",
            'code': '95',
            'path': 'M 255.5625,109.6875 L 254,111.625 L 252.8125,115.9375 L 251.5,118.15625 L 256.25,120.28125 L 259.875,119.625 L 264.375,122.5 L 269.1875,122.71875 L 272.59375,124.78125 L 273.46875,127.65625 L 273.4375,127.71875 L 273.8125,127.65625 L 277.3125,125.78125 L 282.5625,125.4375 L 285.4375,124.125 L 287.28125,122.8125 L 287.875,118.96875 L 286.59375,117.6875 L 282.3125,115.15625 L 278.1875,113 L 276.0625,113.96875 L 273.71875,114.5625 L 272.15625,113.375 L 269.03125,111.4375 L 266.5,113.375 L 262.78125,113.78125 L 257.5,113.375 L 256.3125,111.4375 L 255.5625,109.6875 z '
          }, {
            'dept': "Paris",
            'code': '75',
            'path': 'm 48.129752,310.84062 -10.125069,0.12466 -4.50003,1.99991 -1.875015,2.49989 -4.125027,0.25014 -3.750027,4.2498 0.1248,2.37493 0.875009,2.74984 6.250041,1.74993 7.625055,3.8748 4.875032,0.25015 3.250022,-0.87496 3.375022,-2.37486 1.125008,0.99993 7.250052,0.99995 1.250008,-2.62486 0,-2.62486 -1.250008,-0.49998 -5.000036,0.25014 0.374804,1.24996 -0.875006,0.74995 -1.625012,0 0.625004,-1.62491 0.250002,-1.74993 -0.250002,0 -0.625004,-6.99968 -3.250022,-4.99975 z '
          }, {
            'dept': "Hauts-de-Seine",
            'code': '92',
            'path': 'm 36.283507,296.9065 -13.977275,7.78769 -1.497566,0.25973 -6.863841,15.57534 4.367899,12.33053 6.988638,8.17707 0,0.90855 10.857348,7.91747 2.620739,-1.42774 -1.996753,-3.89383 1.996753,-6.10035 -1.247971,-2.20653 1.372769,-5.06198 -0.249594,0 -7.612624,-4.02364 -6.239856,-1.81712 -0.873579,-2.85549 -0.124597,-2.46613 3.743913,-4.41301 4.118305,-0.25972 1.871955,-2.5959 4.492697,-2.07671 -1.497565,-3.76405 2.12155,-0.38916 1.622363,-3.63427 -1.622363,-2.5959 -1.747159,-0.38915 -0.623986,-2.98527 z'
          }, {
            'dept': "Seine-Saint-Denis",
            'code': '93',
            'path': 'm 76.388054,285.64207 -7.375004,5.2499 -11.500008,5.24983 -21.000014,1.37501 0.625001,2.87492 1.750001,0.37495 1.625,2.49995 -1.625,3.4999 -2.125001,0.375 1.499999,3.62492 10.125008,-0.12472 3.250003,4.99988 0.624999,6.99984 3.500004,-0.5 3.25,-2.62495 4.875008,0.24985 6.125,3.49993 3.5,3.87488 1.625004,0.74998 1,1.87497 3.87501,0.99999 0,-11.37477 -4.62501,-27.49933 1,-6.24987 z'
          }, {
            'dept': "Val-de-Marne",
            'code': '94',
            'path': 'm 58.780772,319.52983 -3.249986,2.62502 -3.249987,0.49996 -0.249998,1.74998 -0.624997,1.62501 1.624993,0 0.874996,-0.75001 -0.374798,-1.24998 4.999978,-0.24987 1.249995,0.5 0,2.62498 -1.249995,2.62497 -7.249968,-0.99997 -1.124996,-1.00001 -3.374986,2.37497 -3.249985,0.87499 -4.624981,-0.24987 -1.374993,4.87496 1.249994,2.12501 -1.999992,5.87494 1.999992,3.74998 3.499985,-1.74999 8.374964,4.62497 14.499937,0 8.62496,3.99997 -0.12479,-0.87499 6.12497,-15.37491 0,-6.99994 -3.87499,-0.99997 -0.99999,-1.87501 -1.62499,-0.74997 -3.499989,-3.87499 -6.124974,-3.49997 -4.874979,-0.24988 z'
          }
        ]
      }, {
        'rgn': '91',
        'dpts': [{
            'dept': "Aude",
            'code': '11',
            'path': 'M 274.25,438.46875 L 273.96875,442.0625 L 270.375,440.9375 L 266.5,440.9375 L 266.78125,439.5625 L 264.84375,439.84375 L 260.71875,441.21875 L 259.34375,438.71875 L 256.5625,441.21875 L 257.40625,443.15625 L 254.34375,444.53125 L 253.8125,447.5625 L 251.3125,448.6875 L 253.53125,451.15625 L 252.96875,452.8125 L 262.65625,457.5 L 263.46875,464.15625 L 263.46875,467.75 L 264.03125,472.4375 L 259.0625,472.4375 L 257.6875,474.375 L 264.03125,479.625 L 267.625,477.6875 L 272.03125,482.9375 L 271.375,483 L 272.21875,483.5 L 280.15625,479.625 L 278.21875,476.78125 L 278.0625,473.4375 L 296.59375,473.4375 L 296.25,470.9375 L 300.5,468.65625 L 305.4375,472.53125 L 308,473.71875 L 307.84375,468.125 L 308.0625,461.6875 L 305.71875,461.875 L 303.75,458.96875 L 305.3125,456.40625 L 308.625,459.53125 L 311.5625,457.1875 L 313.53125,455.25 L 313.78125,453.1875 L 311.28125,453.09375 L 310.40625,450.28125 L 307.9375,450.09375 L 305.625,446.71875 L 303.84375,446.90625 L 301.75,445.65625 L 301.375,442.65625 L 300.3125,443.1875 L 300.84375,445.3125 L 298.375,445.3125 L 298.1875,448.84375 L 294.5,450.09375 L 292.71875,446.375 L 290.25,447.96875 L 288.125,446.375 L 287.0625,443.90625 L 288.84375,441.78125 L 288,439.5 L 287.78125,439.5625 L 281.96875,439.5625 L 275.90625,438.46875 L 274.25,438.46875 z '
          }, {
            'dept': "Gard",
            'code': '30',
            'path': 'M 346.1875,381.03125 L 345.21875,382.90625 L 344,383.96875 L 341.6875,384.34375 L 344.5,387.34375 L 344.5,391.40625 L 345.75,391.75 L 344.34375,393.34375 L 344.34375,396.34375 L 342.03125,399.875 L 336.90625,399.34375 L 333.90625,396.53125 L 331.78125,397.0625 L 332.5,398.8125 L 331.625,400.0625 L 326.46875,401.125 L 320.4375,397.09375 L 319.28125,398.125 L 319.28125,400.90625 L 317.0625,401.4375 L 317.625,403.65625 L 320.375,404.21875 L 323.40625,404.21875 L 324.25,408.0625 L 320.65625,409.71875 L 320.65625,411.46875 L 323.46875,412.4375 L 323.46875,414.03125 L 324.71875,414.75 L 325.78125,413.84375 L 327.1875,413.84375 L 327.90625,415.4375 L 330.03125,415.4375 L 331.09375,411.71875 L 332.84375,411.71875 L 335.5,408.375 L 338.6875,408.71875 L 339.21875,413.3125 L 340.4375,414.75 L 342.40625,413.6875 L 345.75,415.4375 L 347,417.5625 L 352.8125,421.09375 L 354.9375,426.0625 L 354.9375,428.6875 L 351.21875,430.8125 L 348.8125,432.96875 L 351.8125,433.1875 L 351.8125,437.09375 L 356.28125,436.875 L 358.6875,437 L 360.4375,432.9375 L 366.78125,429.0625 L 365.40625,427.125 L 367.0625,422.71875 L 372.84375,423.53125 L 374.25,413.03125 L 381.96875,408.625 L 381.96875,406.125 L 376.15625,400.34375 L 376.15625,395.90625 L 372.84375,390.40625 L 365.9375,386.53125 L 365.40625,389.5625 L 362.625,389.84375 L 361.8125,386.8125 L 359.03125,387.34375 L 358.5,391.21875 L 356.28125,390.40625 L 351.59375,387.34375 L 349.375,388.46875 L 349.375,382.9375 L 346.1875,381.03125 z '
          }, {
            'dept': "Hérault",
            'code': '34',
            'path': 'M 335.5,408.375 L 332.84375,411.71875 L 331.09375,411.71875 L 330.03125,415.4375 L 327.90625,415.4375 L 327.1875,413.84375 L 325.78125,413.84375 L 324.71875,414.75 L 323.46875,414.03125 L 323.46875,412.4375 L 320.65625,411.46875 L 320.65625,412.5 L 317.34375,413.03125 L 315.6875,414.4375 L 316.21875,417.75 L 313.1875,417.75 L 310.15625,416.09375 L 308.5,416.09375 L 308.5,418.03125 L 308.78125,423.8125 L 305.46875,423.8125 L 303.8125,423.8125 L 302.6875,426.03125 L 295.5,428.5 L 292.75,426.59375 L 291.09375,429.0625 L 290.28125,431.8125 L 293.3125,434.59375 L 292.1875,438.1875 L 288,439.5 L 288.84375,441.78125 L 287.0625,443.90625 L 288.125,446.375 L 290.25,447.96875 L 292.71875,446.375 L 294.5,450.09375 L 298.1875,448.84375 L 298.375,445.3125 L 300.84375,445.3125 L 300.3125,443.1875 L 301.375,442.65625 L 301.75,445.65625 L 303.84375,446.90625 L 305.625,446.71875 L 307.9375,450.09375 L 310.40625,450.28125 L 311.28125,453.09375 L 313.78125,453.1875 L 313.90625,452.125 L 320.9375,449.96875 L 321.71875,448.21875 L 327.1875,448.03125 L 328.9375,445.875 L 339.5,437.46875 L 346.125,432.78125 L 348.8125,432.96875 L 351.21875,430.8125 L 354.9375,428.6875 L 354.9375,426.0625 L 352.8125,421.09375 L 347,417.5625 L 345.75,415.4375 L 342.40625,413.6875 L 340.4375,414.75 L 339.21875,413.3125 L 338.6875,408.71875 L 335.5,408.375 z '
          }, {
            'dept': "Lozère",
            'code': '48',
            'path': 'M 320.78125,352.25 L 315.3125,354.21875 L 313.75,357.71875 L 310.25,355.375 L 307.5,363.96875 L 304.6875,370.4375 L 308.78125,375.46875 L 308.5,379.34375 L 311.25,381.28125 L 311.25,385.96875 L 312.09375,392.59375 L 315.40625,394 L 315.125,396.1875 L 319.8125,395.375 L 321.46875,396.1875 L 320.4375,397.09375 L 326.46875,401.125 L 331.625,400.0625 L 332.5,398.8125 L 331.78125,397.0625 L 333.90625,396.53125 L 336.90625,399.34375 L 342.03125,399.875 L 344.34375,396.34375 L 344.34375,393.34375 L 345.75,391.75 L 344.5,391.40625 L 344.5,387.34375 L 341.6875,384.34375 L 344,383.96875 L 345.21875,382.90625 L 346.1875,381.03125 L 345.21875,380.4375 L 345.78125,376.3125 L 342.46875,372.71875 L 341.09375,365.53125 L 336.125,359.1875 L 332.5,360.0625 L 331.71875,357.34375 L 329.75,357.34375 L 329.375,359.6875 L 324.3125,361.25 L 320.78125,352.25 z '
          }, {
            'dept': "Pyrénées-Orientales",
            'code': '66',
            'path': 'M 300.5,468.65625 L 296.25,470.9375 L 296.59375,473.4375 L 278.0625,473.4375 L 278.21875,476.78125 L 280.15625,479.625 L 272.21875,483.5 L 271.375,483 L 264.84375,483.46875 L 264.03125,485.125 L 260.71875,485.96875 L 258.5,487.90625 L 252.4375,489.3125 L 252.78125,491.375 L 255.71875,494.125 L 261.5625,495.6875 L 261.75,499.1875 L 264.875,501.9375 L 267.21875,501.53125 L 270.5625,497.4375 L 274.65625,496.65625 L 281.09375,498.8125 L 286.5625,503.5 L 288.125,501.53125 L 289.5,501.53125 L 290.875,502.5 L 292.03125,501.9375 L 292.21875,499.1875 L 298.09375,497.8125 L 300.03125,495.28125 L 302.96875,494.3125 L 307.0625,494.3125 L 309.625,497.03125 L 312.75,497.25 L 312.75,494.125 L 311.1875,491.96875 L 308.4375,490.78125 L 308,473.71875 L 305.4375,472.53125 L 300.5,468.65625 z '
          }
        ]
      }, {
        'rgn': '74',
        'dpts': [{
            'dept': "Corrèze",
            'code': '19',
            'path': 'M 265.75,307.625 L 264.90625,309.75 L 261.71875,310.375 L 260.46875,312.5 L 258.96875,312.5 L 256.84375,311.875 L 255.34375,314.40625 L 253.03125,314.625 L 251.53125,317.375 L 249.625,317.375 L 248.125,318.875 L 244.3125,318.4375 L 243.03125,320.5625 L 241.5625,320.375 L 239,323.5625 L 236.65625,322.6875 L 235.5625,324.90625 L 236.40625,327.0625 L 238.5625,328.8125 L 234.65625,332.34375 L 234.65625,335.0625 L 236.21875,335.84375 L 234.65625,337.8125 L 236.8125,339.5625 L 235.25,341.5 L 237,342.6875 L 241.28125,342.5 L 241.09375,346.78125 L 242.71875,349.34375 L 243.3125,349.25 L 247.46875,347.3125 L 252.4375,349.53125 L 256.28125,355.03125 L 258.5,354.75 L 261.8125,351.4375 L 262.90625,353.375 L 265.125,351.1875 L 268.15625,352 L 268.25,352.65625 L 270.78125,350.875 L 270,348.9375 L 268.8125,347.75 L 270.375,345.8125 L 271.9375,345.8125 L 272.9375,342.6875 L 273.71875,341.125 L 273.125,337.59375 L 275.65625,334.09375 L 279.1875,331.9375 L 279.375,326.46875 L 281.125,327.4375 L 283.09375,329.59375 L 285.03125,329.59375 L 286.21875,328.21875 L 285.25,325.875 L 286.21875,322.375 L 285.625,319.0625 L 284.4375,317.6875 L 284.4375,314.9375 L 286.21875,312.03125 L 285.8125,309.28125 L 285.375,308.84375 L 283.40625,310.375 L 279.5625,310.375 L 278.3125,312.28125 L 275.96875,312.28125 L 274.0625,310.375 L 273.1875,309.09375 L 268.3125,309.09375 L 267.25,307.625 L 265.75,307.625 z '
          }, {
            'dept': "Creuse",
            'code': '23',
            'path': 'M 256.125,267.875 L 254.96875,271 L 251.4375,270.8125 L 250.65625,270.40625 L 248.3125,270.625 L 246.5625,269.4375 L 243.1875,273.3125 L 243.25,276.1875 L 240.90625,280.84375 L 241.34375,283.1875 L 243.875,283.8125 L 245.59375,288.0625 L 247.28125,289.78125 L 246.65625,297.84375 L 250.25,296.78125 L 251.75,298.6875 L 249.40625,300.59375 L 249.40625,302.53125 L 251.3125,302.71875 L 254.71875,302.53125 L 255.78125,301.03125 L 256.625,301.03125 L 256.21875,303.59375 L 258.96875,304.84375 L 261.53125,306.5625 L 261.53125,307.625 L 260.03125,307.625 L 260.46875,310.15625 L 261.46875,310.78125 L 261.71875,310.375 L 264.90625,309.75 L 265.75,307.625 L 267.25,307.625 L 268.3125,309.09375 L 273.1875,309.09375 L 274.0625,310.375 L 275.96875,312.28125 L 278.3125,312.28125 L 279.5625,310.375 L 283.40625,310.375 L 285.375,308.84375 L 281.3125,304.78125 L 280.9375,303.03125 L 284.65625,300.875 L 286.8125,299.71875 L 287.375,296.96875 L 289.71875,295.21875 L 288.9375,291.5 L 287.375,289.5625 L 287,283.5 L 284.84375,278.4375 L 282.6875,277.65625 L 281.125,274.90625 L 279.75,276.65625 L 278.40625,274.90625 L 278.40625,272.5625 L 276.0625,269.25 L 269.625,270.03125 L 265.90625,269.0625 L 256.125,267.875 z '
          }, {
            'dept': "Haute-Vienne",
            'code': '87',
            'path': 'M 239.53125,270.8125 L 237.78125,272.5625 L 232.875,272.1875 L 232.3125,272.0625 L 228.59375,272.75 L 226.4375,274.53125 L 226.4375,276.875 L 222.15625,277.0625 L 219.625,280 L 218.0625,281.15625 L 219.40625,282.71875 L 219.21875,288 L 218.25,289.75 L 219.8125,291.5 L 222.53125,291.71875 L 223.125,294.4375 L 223.3125,296.1875 L 219.8125,296.96875 L 218.0625,297.5625 L 218.4375,302.4375 L 216.09375,304 L 214.125,304.59375 L 213.15625,307.34375 L 211.59375,307.53125 L 210.9375,310.5 L 215.5,310.65625 L 216.5,312.59375 L 215.6875,314.75 L 217.46875,317.09375 L 218.8125,316.71875 L 220.1875,314.75 L 226.4375,315.34375 L 227.4375,319.25 L 231.71875,319.84375 L 232.6875,321.1875 L 229.75,322.5625 L 231.125,323.53125 L 235.25,324.125 L 235.5625,324.90625 L 236.65625,322.6875 L 239,323.5625 L 241.5625,320.375 L 243.03125,320.5625 L 244.3125,318.4375 L 248.125,318.875 L 249.625,317.375 L 251.53125,317.375 L 253.03125,314.625 L 255.34375,314.40625 L 256.84375,311.875 L 258.96875,312.5 L 260.46875,312.5 L 261.46875,310.78125 L 260.46875,310.15625 L 260.03125,307.625 L 261.53125,307.625 L 261.53125,306.5625 L 258.96875,304.84375 L 256.21875,303.59375 L 256.625,301.03125 L 255.78125,301.03125 L 254.71875,302.53125 L 251.3125,302.71875 L 249.40625,302.53125 L 249.40625,300.59375 L 251.75,298.6875 L 250.25,296.78125 L 246.65625,297.84375 L 247.28125,289.78125 L 245.59375,288.0625 L 243.875,283.8125 L 241.34375,283.1875 L 240.90625,280.84375 L 243.25,276.1875 L 243.1875,273.3125 L 242.65625,273.9375 L 239.53125,270.8125 z '
          }
        ]
      }, {
        'rgn': '41',
        'dpts': [{
            'dept': "Meurthe-et-Moselle",
            'code': '54',
            'path': 'M 401.59375,88.4375 L 399.25,90.59375 L 395.9375,90.78125 L 394.78125,91.96875 L 394.53125,91.96875 L 394.40625,94.3125 L 395.5625,96.21875 L 395.15625,97.375 L 394.78125,98.71875 L 394.96875,99.46875 L 395.9375,98.71875 L 396.875,97 L 398.8125,96.8125 L 402.0625,95.84375 L 403.78125,97.1875 L 404.53125,98.71875 L 405.125,100.4375 L 405.125,102.15625 L 406.0625,102.9375 L 406.0625,104.25 L 405.125,105.40625 L 404.9375,107.90625 L 405.6875,109.0625 L 405.875,110.59375 L 406.0625,113.0625 L 407.21875,114.03125 L 408.9375,114.78125 L 408.1875,116.3125 L 410.28125,118.25 L 408.375,120.34375 L 408.75,121.6875 L 410.65625,122.625 L 410.65625,123.59375 L 408.375,123.59375 L 407.40625,124.9375 L 407.59375,125.90625 L 409.125,127.4375 L 407.8125,131.0625 L 406.28125,134.5 L 407.03125,136.625 L 407.03125,140.0625 L 407.8125,141.78125 L 408.9375,141.78125 L 409.53125,142.75 L 407.8125,142.75 L 406.28125,143.5 L 406.28125,144.65625 L 408.1875,146.375 L 408.1875,149.0625 L 410.09375,148.46875 L 412.96875,148.65625 L 413.15625,151.71875 L 414.3125,152.125 L 412.96875,153.0625 L 412.78125,154.03125 L 414.875,154.40625 L 416.21875,156.125 L 422.53125,155.75 L 423.875,153.25 L 426.75,153.25 L 427.90625,152.3125 L 429.8125,153.46875 L 431.53125,152.875 L 434.03125,153.0625 L 436.125,152.3125 L 438.21875,150.78125 L 439.375,151.9375 L 439.5625,149.25 L 441.09375,148.65625 L 441.875,151.15625 L 444.15625,151.34375 L 446.46875,151.9375 L 447.40625,152.125 L 450.6875,150.59375 L 452.40625,149.4375 L 453.9375,147.53125 L 457,146.375 L 459,145.9375 L 457.875,144.84375 L 460.03125,145.03125 L 460.4375,144.625 L 458.125,143.875 L 454.875,141.59375 L 452,139.46875 L 448.5625,139.46875 L 444.9375,137.375 L 442.0625,137.1875 L 442.0625,136.40625 L 437.65625,133.75 L 432.6875,131.625 L 430.1875,131.625 L 429.25,128.96875 L 425.40625,124.15625 L 421.59375,124.15625 L 420.0625,122.0625 L 417,122.0625 L 417.1875,119 L 413.15625,116.5 L 413.34375,114.03125 L 415.46875,114.03125 L 415.46875,111.90625 L 416.21875,110.375 L 414.5,108.65625 L 416.03125,106 L 414.875,102.9375 L 413.9375,102.15625 L 411.4375,96.8125 L 412.40625,95.28125 C 412.40625,95.28125 412.32712,94.02401 412.25,92.34375 L 409.625,92.34375 L 406.09375,88.4375 L 401.59375,88.4375 z '
          }, {
            'dept': "Meuse",
            'code': '55',
            'path': 'M 390.125,86.53125 L 388.75,88.78125 L 387,89.9375 L 385.625,88.59375 L 382.6875,88.59375 L 382.125,87.8125 L 380.15625,91.5 L 379.375,92.875 L 381.71875,95.8125 L 380.9375,99.71875 L 378.78125,101.46875 L 379,102.84375 L 379.75,104.78125 L 378.59375,105.96875 L 376.25,107.125 L 376.625,109.28125 L 377.625,109.46875 L 375.875,111.03125 L 377.21875,113.96875 L 378.59375,118.28125 L 376.84375,120.21875 L 379.96875,120.03125 L 378.40625,124.90625 L 376.25,125.875 L 375.0625,128.8125 L 376.25,129.78125 L 374.875,132.125 L 375.28125,133.6875 L 379,136.625 L 379.1875,143.46875 L 383.28125,144.0625 L 385.8125,146.78125 L 390.5,149.125 L 392.25,149.71875 L 396.375,154.21875 L 395.9375,154.65625 L 399.375,154.21875 L 399.375,152.5 L 403.21875,151.71875 L 403.21875,150.40625 L 404.15625,150.40625 L 404.15625,151.53125 L 407.21875,150.59375 L 408.40625,149 L 408.1875,149.0625 L 408.1875,146.375 L 406.28125,144.65625 L 406.28125,143.5 L 407.8125,142.75 L 409.53125,142.75 L 408.9375,141.78125 L 407.8125,141.78125 L 407.03125,140.0625 L 407.03125,136.625 L 406.28125,134.5 L 407.8125,131.0625 L 409.125,127.4375 L 407.59375,125.90625 L 407.40625,124.9375 L 408.375,123.59375 L 410.65625,123.59375 L 410.65625,122.625 L 408.75,121.6875 L 408.375,120.34375 L 410.28125,118.25 L 408.1875,116.3125 L 408.9375,114.78125 L 407.21875,114.03125 L 406.0625,113.0625 L 405.875,110.59375 L 405.6875,109.0625 L 404.9375,107.90625 L 405.125,105.40625 L 406.0625,104.25 L 406.0625,102.9375 L 405.125,102.15625 L 405.125,100.4375 L 404.53125,98.71875 L 403.78125,97.1875 L 402.0625,95.84375 L 398.8125,96.8125 L 396.875,97 L 395.9375,98.71875 L 394.96875,99.46875 L 394.78125,98.71875 L 395.15625,97.375 L 395.5625,96.21875 L 394.40625,94.3125 L 394.53125,91.96875 L 393.59375,91.96875 L 392.8125,88.25 L 391.25,86.6875 L 390.125,86.53125 z '
          }, {
            'dept': "Moselle",
            'code': '57',
            'path': 'M 423.09375,90.40625 L 420.15625,90.59375 L 417.8125,92.5625 L 417.21875,93.53125 L 413.90625,93.53125 L 412.75,92.34375 L 412.25,92.34375 C 412.32712,94.02401 412.40625,95.28125 412.40625,95.28125 L 411.4375,96.8125 L 413.9375,102.15625 L 414.875,102.9375 L 416.03125,106 L 414.5,108.65625 L 416.21875,110.375 L 415.46875,111.90625 L 415.46875,114.03125 L 413.34375,114.03125 L 413.15625,116.5 L 417.1875,119 L 417,122.0625 L 420.0625,122.0625 L 421.59375,124.15625 L 425.40625,124.15625 L 429.25,128.96875 L 430.1875,131.625 L 432.6875,131.625 L 437.65625,133.75 L 442.0625,136.40625 L 442.0625,137.1875 L 444.9375,137.375 L 448.5625,139.46875 L 452,139.46875 L 454.875,141.59375 L 458.125,143.875 L 460.4375,144.625 L 463.9375,141.125 L 465.125,137.03125 L 463.5625,135.46875 L 463.375,134.09375 L 465.6875,129.78125 L 460.25,126.65625 L 457.125,129 L 455.34375,127.84375 L 456.125,126.09375 L 454.1875,124.71875 L 451.625,123.53125 L 451.625,121 L 454.1875,120.21875 L 455.15625,115.71875 L 456.90625,113.78125 L 457.6875,116.71875 L 459.84375,117.6875 L 463.5625,118.28125 L 465.5,120.21875 L 467.84375,120.21875 L 469.8125,118.84375 L 472.34375,120.625 L 473.71875,120.625 L 475.28125,119.25 L 475.28125,116.3125 L 477,113.3125 L 476.59375,113.4375 L 475.25,111.5 L 471.34375,109.15625 L 469.96875,107 L 465.28125,107.40625 L 462.53125,109.9375 L 455.90625,110.125 L 453.9375,108.75 C 453.80551,108.51057 452.84437,106.81438 452,106.34375 C 451.96729,106.32639 451.91355,106.29802 451.875,106.28125 C 451.84646,106.26959 451.80512,106.25698 451.78125,106.25 C 451.77058,106.24458 451.73002,106.22452 451.71875,106.21875 C 451.71591,106.21876 451.69093,106.21861 451.6875,106.21875 C 451.66248,106.21745 451.61378,106.21875 451.59375,106.21875 C 450.67823,106.21876 448.90565,105.19125 448.6875,105.0625 L 445.9375,106.21875 L 445.75,108.5625 L 442.4375,108.96875 L 440.46875,105.25 L 439.3125,104.84375 L 439.3125,102.125 L 436.5625,100.9375 L 436.375,96.25 L 434.40625,94.3125 L 430.3125,92.34375 L 428.375,92.34375 L 427.78125,92.75 L 425.8125,92.75 L 423.09375,90.40625 z '
          }, {
            'dept': "Vosges",
            'code': '88',
            'path': 'M 459,145.9375 L 457,146.375 L 453.9375,147.53125 L 452.40625,149.4375 L 450.6875,150.59375 L 447.40625,152.125 L 446.46875,151.9375 L 444.15625,151.34375 L 441.875,151.15625 L 441.09375,148.65625 L 439.5625,149.25 L 439.375,151.9375 L 438.21875,150.78125 L 436.125,152.3125 L 434.03125,153.0625 L 431.53125,152.875 L 429.8125,153.46875 L 427.90625,152.3125 L 426.75,153.25 L 423.875,153.25 L 422.53125,155.75 L 416.21875,156.125 L 414.875,154.40625 L 412.78125,154.03125 L 412.96875,153.0625 L 414.3125,152.125 L 413.15625,151.71875 L 412.96875,148.65625 L 410.09375,148.46875 L 408.40625,149 L 407.21875,150.59375 L 404.15625,151.53125 L 404.15625,150.40625 L 403.21875,150.40625 L 403.21875,151.71875 L 399.375,152.5 L 399.375,154.21875 L 395.9375,154.65625 L 394.625,155.96875 L 395.96875,157.90625 L 399.09375,158.125 L 401.84375,161.8125 L 404.1875,161.8125 L 404.75,164.375 L 407.3125,164.75 L 407.875,166.5 L 406.125,167.6875 L 404.96875,172.96875 L 410.4375,175.6875 L 410.4375,179.78125 L 412.5625,179 L 414.34375,180.40625 L 415.6875,179.59375 L 414.9375,178.4375 L 415.90625,177.84375 L 417.25,179.40625 L 419.21875,178.03125 L 419.8125,176.09375 L 423.5,175.5 L 424.5,176.28125 L 424.3125,178.4375 L 426.84375,180.375 L 428.40625,180.1875 L 430.15625,178.8125 L 434.25,178.8125 L 437.1875,182.125 L 438.15625,182.125 L 439.71875,181.15625 L 439.9375,180 L 441.5,179.21875 L 443.25,180.375 L 445,182.34375 L 451.15625,185.59375 L 453.59375,183.5 L 453.78125,175.875 L 457.125,172.96875 L 459.0625,168.46875 L 458.46875,165.53125 L 460.8125,160.84375 L 462.96875,155.96875 L 459.25,155 L 458.46875,149.71875 L 459.25,146.1875 L 459,145.9375 z '
          }
        ]
      }, {
        'rgn': '73',
        'dpts': [{
            'dept': "Ariège",
            'code': '09',
            'path': 'M 237.21875,446.375 L 235.96875,447.25 L 235.4375,448.3125 L 237.90625,450.09375 L 238.625,451.34375 L 238.09375,452.375 L 233.84375,452.75 L 232.625,454.5 L 232.78125,455.03125 L 234.375,455.5625 L 235.28125,456.8125 L 234.21875,458.5625 L 232.96875,458.40625 L 231.03125,456.625 L 228.71875,455.9375 L 226.4375,456.09375 L 222.375,458.5625 L 222.53125,461.9375 L 223.59375,462.65625 L 222.90625,465.28125 L 218.28125,466.53125 L 216.53125,468.65625 L 216.53125,472.1875 L 217.25,473.25 L 215.59375,474.78125 L 216.65625,475.375 L 222.6875,476.53125 L 225.25,476.53125 L 228.5625,480.84375 L 236.96875,480.4375 L 240.28125,485.71875 L 243.21875,484.53125 L 251.8125,485.71875 L 252.4375,489.3125 L 258.5,487.90625 L 260.71875,485.96875 L 264.03125,485.125 L 264.84375,483.46875 L 272.03125,482.9375 L 267.625,477.6875 L 264.03125,479.625 L 257.6875,474.375 L 259.0625,472.4375 L 264.03125,472.4375 L 263.46875,467.75 L 263.46875,464.15625 L 262.65625,457.5 L 252.96875,452.8125 L 253.53125,451.15625 L 251.6875,449.09375 L 250.125,449.75 L 248,450.09375 L 244.09375,448.3125 L 243.03125,447.96875 L 244.625,449.90625 L 243.9375,451.5 L 240.5625,451.15625 L 240.40625,449.375 L 238.4375,446.71875 L 237.21875,446.375 z '
          }, {
            'dept': "Aveyron",
            'code': '12',
            'path': 'M 294.6875,353.375 L 289.15625,358.09375 L 289.15625,362.78125 L 287.78125,362.78125 L 287.21875,367.1875 L 285.84375,367.75 L 284.75,370.21875 L 278.65625,370.21875 L 278.125,369.40625 L 275.34375,369.40625 L 273.6875,372.15625 L 273.09375,372.09375 L 272.75,373.1875 L 271.5,374.59375 L 267.96875,374.59375 L 267.25,375.5 L 265.5,375.3125 L 262.3125,378.84375 L 261.25,378.5 L 258.96875,380.4375 L 259.65625,383.96875 L 261.4375,386.625 L 260.0625,388.0625 L 260.375,392.09375 L 263.1875,392.28125 L 261.59375,395.46875 L 262.84375,398.65625 L 264.4375,397.75 L 265.15625,399.34375 L 267.4375,397.0625 L 270.8125,396.875 L 274.15625,399.34375 L 280,400.40625 L 282.125,404.125 L 285.125,405.53125 L 286.71875,409.59375 L 286.53125,411.1875 L 288.46875,414.75 L 288.46875,416.6875 L 292,421.28125 L 295.375,423.03125 L 297.5,422.5 L 298.5625,421.09375 L 300.15625,421.46875 L 303.8125,423.8125 L 303.84375,423.8125 L 305.46875,423.8125 L 308.78125,423.8125 L 308.5,418.03125 L 308.5,416.09375 L 310.15625,416.09375 L 313.1875,417.75 L 316.21875,417.75 L 315.6875,414.4375 L 317.34375,413.03125 L 320.65625,412.5 L 320.65625,409.71875 L 324.25,408.0625 L 323.40625,404.21875 L 320.375,404.21875 L 317.625,403.65625 L 317.0625,401.4375 L 319.28125,400.90625 L 319.28125,398.125 L 321.46875,396.1875 L 319.8125,395.375 L 315.125,396.1875 L 315.40625,394 L 312.09375,392.59375 L 311.25,385.96875 L 311.25,381.28125 L 308.5,379.34375 L 308.78125,375.46875 L 302.96875,368.3125 L 302.40625,362.78125 L 300.5,362.78125 L 299.65625,357.25 L 295.78125,357.8125 L 295.25,354.21875 L 294.6875,353.375 z '
          }, {
            'dept': "Haute-Garonne",
            'code': '31',
            'path': 'M 245,412.4375 L 242.15625,413.5 L 241.28125,414.90625 L 240.21875,413.6875 L 238.28125,413.5 L 237.90625,415.28125 L 236.6875,415.78125 L 238.4375,416.6875 L 237.21875,418.625 L 232.78125,419.875 L 230.84375,417.5625 L 229.09375,417.5625 L 227.65625,418.4375 L 222.53125,418.4375 L 222,418.65625 L 222.53125,420.5625 L 225.53125,423.5625 L 225.375,425.15625 L 227.65625,427.46875 L 229.09375,427.46875 L 229.78125,429.21875 L 231.5625,429.40625 L 232.09375,431 L 230.3125,431.71875 L 226.59375,433.3125 L 224.84375,437.375 L 223.4375,441.59375 L 222.53125,442.84375 L 219.71875,440.90625 L 213.15625,440.375 L 209.625,444.96875 L 207.6875,446.03125 L 206.4375,447.78125 L 205.03125,449.90625 L 205.03125,451.15625 L 202.75,452.03125 L 200.96875,455.03125 L 200.78125,456.625 L 203.96875,458.9375 L 204.5,461.21875 L 203.4375,463 L 205.5625,462.28125 L 206.625,463.1875 L 207.5,466.875 L 205.03125,468.3125 L 205.21875,470.25 L 203.96875,471.46875 L 202.21875,470.59375 L 200.25,470.59375 L 200.5,481.09375 L 208.4375,481.625 L 208.84375,472.03125 L 211.5625,472.4375 L 215.59375,474.78125 L 217.25,473.25 L 216.53125,472.1875 L 216.53125,468.65625 L 218.28125,466.53125 L 222.90625,465.28125 L 223.59375,462.65625 L 222.53125,461.9375 L 222.375,458.5625 L 226.4375,456.09375 L 228.71875,455.9375 L 231.03125,456.625 L 232.96875,458.40625 L 234.21875,458.5625 L 235.28125,456.8125 L 234.375,455.5625 L 232.78125,455.03125 L 232.625,454.5 L 233.84375,452.75 L 238.09375,452.375 L 238.625,451.34375 L 237.90625,450.09375 L 235.4375,448.3125 L 235.96875,447.25 L 237.21875,446.375 L 238.4375,446.71875 L 240.40625,449.375 L 240.5625,451.15625 L 243.9375,451.5 L 244.625,449.90625 L 243.03125,447.96875 L 244.09375,448.3125 L 248,450.09375 L 250.125,449.75 L 251.6875,449.09375 L 251.3125,448.6875 L 253.8125,447.5625 L 254.34375,444.53125 L 257.40625,443.15625 L 256.5625,441.21875 L 259.34375,438.71875 L 260.71875,441.21875 L 264.84375,439.84375 L 265.625,439.71875 L 265.6875,438.4375 L 265.6875,435.9375 L 263.5625,436.3125 L 260.90625,435.59375 L 258.59375,432.78125 L 257.71875,431.53125 L 253.125,429.59375 L 252.0625,428 L 253.46875,427.46875 L 253.46875,425.53125 L 252.0625,423.9375 L 250.28125,421.09375 L 250.125,418.625 L 249.59375,418.28125 L 247.46875,415.78125 L 246.59375,413.15625 L 245,412.4375 z '
          }, {
            'dept': "Gers",
            'code': '32',
            'path': 'M 207.875,401.875 L 202.03125,402.4375 L 200.46875,405.1875 L 196.9375,405.5625 L 193.625,406.15625 L 192.25,404.21875 L 189.125,407.34375 L 186.8125,405.375 L 185.4375,408.3125 L 185.625,410.84375 L 183.46875,411.4375 L 182.5,410.0625 L 181.53125,407.125 L 178.78125,409.46875 L 176.84375,408.6875 L 174.6875,409.09375 L 172.75,411.4375 L 175.0625,415.34375 L 173.5,416.90625 L 174.09375,420.21875 L 172.15625,422.75 L 170.78125,426.46875 L 172.34375,429.21875 L 177.28125,429.5625 L 179.21875,428.53125 L 182.21875,428.53125 L 182.0625,431.875 L 184.34375,433.125 L 186.65625,433.46875 L 187.71875,436.3125 L 188.25,436.84375 L 187.90625,438.59375 L 187.1875,439.3125 L 189.3125,440.71875 L 189.46875,442.3125 L 192.125,442.3125 L 192.84375,441.59375 L 195.125,441.59375 L 195.84375,443.1875 L 198.3125,443.1875 L 199.03125,444.625 L 203.8125,444.625 L 207.375,446.46875 L 207.6875,446.03125 L 209.625,444.96875 L 213.15625,440.375 L 219.71875,440.90625 L 222.53125,442.84375 L 223.4375,441.59375 L 224.84375,437.375 L 226.59375,433.3125 L 230.3125,431.71875 L 232.09375,431 L 231.5625,429.40625 L 229.78125,429.21875 L 229.09375,427.46875 L 227.65625,427.46875 L 225.375,425.15625 L 225.53125,423.5625 L 222.53125,420.5625 L 222,418.65625 L 220.0625,419.5 L 219.53125,418.4375 L 220.78125,416.5 L 219.34375,415.09375 L 219.34375,412.625 L 218.125,411.375 L 214.21875,411.1875 L 214.21875,408.90625 L 216.34375,407.3125 L 216.34375,405.53125 L 218.65625,404.46875 L 217.40625,403.78125 L 216,404.46875 L 213.15625,404.46875 L 212.28125,403.65625 L 211.8125,403.8125 L 210.8125,404.78125 L 207.875,401.875 z '
          }, {
            'dept': "Lot",
            'code': '46',
            'path': 'M 247.46875,347.3125 L 243.3125,349.25 L 242.71875,349.34375 L 242.84375,349.53125 L 241.5,350.6875 L 241.5,352.84375 L 243.25,354.78125 L 241.5,357.90625 L 239.9375,358.90625 L 239.71875,360.84375 L 236.40625,361.25 L 236.59375,363.375 L 237.78125,363.78125 L 235.03125,367.6875 L 230.75,368.0625 L 230.5625,371 L 228.78125,372.75 L 227.8125,375.3125 L 223.90625,375.5 L 225.46875,381.34375 L 227.125,384.96875 L 229.625,384.875 L 229.78125,385.90625 L 228.375,387.5 L 229.4375,389.625 L 231.03125,389.625 L 232.78125,391.5625 L 234.375,391.5625 L 235.625,390.15625 L 235.96875,390.53125 L 235.96875,392.28125 L 236.5,394.59375 L 240.21875,394.75 L 243.21875,391.5625 L 244.8125,391.40625 L 245.34375,392.28125 L 246.21875,394.21875 L 247.65625,394.21875 L 248.1875,390.6875 L 251.1875,391.0625 L 252.9375,388.9375 L 255.78125,389.625 L 260.03125,387.6875 L 260.0625,388.0625 L 261.4375,386.625 L 259.65625,383.96875 L 258.96875,380.4375 L 261.25,378.5 L 262.3125,378.84375 L 265.5,375.3125 L 267.25,375.5 L 267.96875,374.59375 L 271.5,374.59375 L 272.75,373.1875 L 273.09375,372.09375 L 271.5,371.875 L 272.59375,368.5625 L 270.09375,367.46875 L 272.59375,361.65625 L 269.28125,359.1875 L 268.15625,352 L 265.125,351.1875 L 262.90625,353.375 L 261.8125,351.4375 L 258.5,354.75 L 256.28125,355.03125 L 252.4375,349.53125 L 247.46875,347.3125 z '
          }, {
            'dept': "Hautes-Pyrénées",
            'code': '65',
            'path': 'M 179.21875,428.53125 L 177.28125,429.5625 L 177.625,429.59375 L 180.9375,435.0625 L 178.78125,437.03125 L 180.34375,439.375 L 182.6875,442.875 L 180.75,445.40625 L 177.625,452.4375 L 172.34375,456.9375 L 173.71875,459.6875 L 172.53125,460.46875 L 169.625,459.875 L 168.8125,466.3125 L 167.25,467.5 L 166.9375,471.53125 L 167.4375,471.25 L 170.75,473.21875 L 174.65625,476.15625 L 175.03125,478.5 L 178.15625,481.03125 L 180.71875,481.03125 L 187.15625,478.28125 L 189.875,481.40625 L 193.59375,482.40625 L 194.96875,480.0625 L 196.71875,480.84375 L 200.5,481.09375 L 200.25,470.59375 L 202.21875,470.59375 L 203.96875,471.46875 L 205.21875,470.25 L 205.03125,468.3125 L 207.5,466.875 L 206.625,463.1875 L 205.5625,462.28125 L 203.4375,463 L 204.5,461.21875 L 203.96875,458.9375 L 200.78125,456.625 L 200.96875,455.03125 L 202.75,452.03125 L 205.03125,451.15625 L 205.03125,449.90625 L 206.4375,447.78125 L 207.375,446.46875 L 203.8125,444.625 L 199.03125,444.625 L 198.3125,443.1875 L 195.84375,443.1875 L 195.125,441.59375 L 192.84375,441.59375 L 192.125,442.3125 L 189.46875,442.3125 L 189.3125,440.71875 L 187.1875,439.3125 L 187.90625,438.59375 L 188.25,436.84375 L 187.71875,436.3125 L 186.65625,433.46875 L 184.34375,433.125 L 182.0625,431.875 L 182.21875,428.53125 L 179.21875,428.53125 z '
          }, {
            'dept': "Tarn-et-Garonne",
            'code': '82',
            'path': 'M 220.1875,384.6875 L 218.8125,389.15625 L 220.96875,391.5 L 220,395.21875 L 218.8125,396.59375 L 219.625,398.9375 L 215.90625,399.71875 L 212.96875,400.5 L 213.75,403.21875 L 212.28125,403.65625 L 213.15625,404.46875 L 216,404.46875 L 217.40625,403.78125 L 218.65625,404.46875 L 216.34375,405.53125 L 216.34375,407.3125 L 214.21875,408.90625 L 214.21875,411.1875 L 218.125,411.375 L 219.34375,412.625 L 219.34375,415.09375 L 220.78125,416.5 L 219.53125,418.4375 L 220.0625,419.5 L 222.53125,418.4375 L 227.65625,418.4375 L 229.09375,417.5625 L 230.84375,417.5625 L 232.78125,419.875 L 237.21875,418.625 L 238.4375,416.6875 L 236.6875,415.78125 L 237.90625,415.28125 L 238.28125,413.5 L 240.21875,413.6875 L 241.28125,414.90625 L 242.15625,413.5 L 245,412.4375 L 246.28125,413.03125 L 247.28125,411.375 L 245.53125,409.4375 L 248.875,409.4375 L 249.9375,407.5 L 252.25,405.375 L 249.9375,405.375 L 250.65625,402.375 L 256.65625,401.65625 L 258.96875,400.25 L 261.78125,399.1875 L 262.6875,398.28125 L 261.59375,395.46875 L 263.1875,392.28125 L 260.375,392.09375 L 260.03125,387.6875 L 255.78125,389.625 L 252.9375,388.9375 L 251.1875,391.0625 L 248.1875,390.6875 L 247.65625,394.21875 L 246.21875,394.21875 L 245.34375,392.28125 L 244.8125,391.40625 L 243.21875,391.5625 L 240.21875,394.75 L 236.5,394.59375 L 235.96875,392.28125 L 235.96875,390.53125 L 235.625,390.15625 L 234.375,391.5625 L 232.78125,391.5625 L 231.03125,389.625 L 229.4375,389.625 L 228.375,387.5 L 229.78125,385.90625 L 229.625,384.875 L 227.125,384.96875 L 227.4375,385.65625 L 223.125,386.4375 L 220.1875,384.6875 z '
          }, {
            'dept': "Tarn",
            'code': '81',
            'path': 'M 270.8125,396.875 L 267.4375,397.0625 L 265.15625,399.34375 L 264.4375,397.75 L 262.84375,398.65625 L 262.6875,398.28125 L 261.78125,399.1875 L 258.96875,400.25 L 256.65625,401.65625 L 250.65625,402.375 L 249.9375,405.375 L 252.25,405.375 L 249.9375,407.5 L 248.875,409.4375 L 245.53125,409.4375 L 247.28125,411.375 L 246.28125,413.03125 L 246.59375,413.15625 L 247.46875,415.78125 L 249.59375,418.28125 L 250.125,418.625 L 250.28125,421.09375 L 252.0625,423.9375 L 253.46875,425.53125 L 253.46875,427.46875 L 252.0625,428 L 253.125,429.59375 L 257.71875,431.53125 L 258.59375,432.78125 L 260.90625,435.59375 L 263.5625,436.3125 L 265.6875,435.9375 L 265.6875,438.4375 L 265.625,439.71875 L 266.78125,439.5625 L 266.5,440.9375 L 270.375,440.9375 L 273.96875,442.0625 L 274.25,438.46875 L 275.90625,438.46875 L 281.96875,439.5625 L 287.78125,439.5625 L 292.1875,438.1875 L 293.3125,434.59375 L 290.28125,431.8125 L 291.09375,429.0625 L 292.75,426.59375 L 295.5,428.5 L 302.6875,426.03125 L 303.8125,423.8125 L 300.15625,421.46875 L 298.5625,421.09375 L 297.5,422.5 L 295.375,423.03125 L 292,421.28125 L 288.46875,416.6875 L 288.46875,414.75 L 286.53125,411.1875 L 286.71875,409.59375 L 285.125,405.53125 L 282.125,404.125 L 280,400.40625 L 274.15625,399.34375 L 270.8125,396.875 z '
          }
        ]
      }, {
        'rgn': '31',
        'dpts': [{
            'dept': "Pas-de-Calais",
            'code': '62',
            'path': 'M 269.25,8.65625 L 258.4375,10.71875 L 249.84375,17.34375 L 249.84375,43.71875 L 249.78125,44.5 L 252.8125,45.21875 L 253.78125,47.375 L 256.125,46.78125 L 257.5,45.03125 L 259.25,45.625 L 262.96875,48.53125 L 264.34375,47.96875 L 265.3125,50.3125 L 268.8125,51.875 L 268.8125,53.8125 L 271.375,54.78125 L 273.90625,53.8125 L 278.78125,53.21875 L 279.96875,54.21875 L 282.3125,53.21875 L 283.46875,55.1875 L 280.5625,57.125 L 280.5625,59.875 L 281.53125,60.84375 L 282.3125,60.65625 L 282.875,59.09375 L 284.65625,57.90625 L 286.40625,59.28125 L 290.5,60.65625 L 292.25,60.65625 L 292.25,58.6875 L 294.8125,60.46875 L 295,62.03125 L 293.8125,63.78125 L 295.96875,62.59375 L 297.75,61.8125 L 298.5,63.1875 L 298.5,64.5625 L 301.4375,63 L 306.125,63 L 306.3125,63.1875 L 307.46875,60.96875 L 306.875,59.96875 L 305.09375,59.59375 L 303.125,59.59375 L 301.9375,59.1875 L 303.90625,58 L 305.6875,58.1875 L 307.46875,58 L 307.6875,54.8125 L 308.875,54.03125 L 309.0625,52.25 L 306.875,50.84375 L 304.3125,50.65625 L 303.71875,50.25 L 305.3125,49.0625 L 305.6875,47.875 L 304.3125,46.90625 L 302.3125,44.5 L 302.53125,43.3125 L 305.09375,42.125 L 305.5,40.75 L 303.71875,39.9375 L 302.71875,37.375 L 299.15625,36.96875 L 295.59375,36 L 295.1875,32.03125 L 297.75,30.4375 L 296.78125,28.4375 L 294.78125,28.4375 L 293.40625,30.625 L 287.25,30.25 L 282.28125,29.03125 L 279.53125,26.0625 L 279.53125,23.6875 L 281.6875,22.6875 L 279.90625,21.3125 L 275.5625,21.125 L 272.96875,14.5625 L 269.25,8.65625 z '
          }, {
            'dept': "Nord",
            'code': '59',
            'path': 'M 285.78125,4.0625 L 279.53125,7 L 269.78125,8.5625 L 269.25,8.65625 L 272.96875,14.5625 L 275.5625,21.125 L 279.90625,21.3125 L 281.6875,22.6875 L 279.53125,23.6875 L 279.53125,26.0625 L 282.28125,29.03125 L 287.25,30.25 L 293.40625,30.625 L 294.78125,28.4375 L 296.78125,28.4375 L 297.75,30.4375 L 295.1875,32.03125 L 295.59375,36 L 299.15625,36.96875 L 302.71875,37.375 L 303.71875,39.9375 L 305.5,40.75 L 305.09375,42.125 L 302.53125,43.3125 L 302.3125,44.5 L 304.3125,46.90625 L 305.6875,47.875 L 305.3125,49.0625 L 303.71875,50.25 L 304.3125,50.65625 L 306.875,50.84375 L 309.0625,52.25 L 308.875,54.03125 L 307.6875,54.8125 L 307.46875,58 L 305.6875,58.1875 L 303.90625,58 L 301.9375,59.1875 L 303.125,59.59375 L 305.09375,59.59375 L 306.875,59.96875 L 307.46875,60.96875 L 306.3125,63.1875 L 307.875,64.75 L 309.4375,65.15625 L 311,64.15625 L 313.15625,64.15625 L 313.75,65.34375 L 314.53125,65.15625 L 316.875,63.78125 L 319.21875,65.15625 L 322.34375,63 L 323.71875,63 L 325.28125,64.375 L 328.40625,62.21875 L 329.75,62.40625 L 330.9375,63.375 L 335.25,63.78125 L 335.625,65.53125 L 337.78125,63.59375 L 338.9375,63.59375 L 339.71875,66.125 L 343.4375,67.09375 L 344.5,66.375 L 344.1875,66.375 L 344,64.4375 L 347.90625,62.09375 L 347.3125,58.375 L 343.59375,57.40625 L 344.5625,56.40625 L 344.5625,53.6875 L 347.5,51.53125 L 346.71875,49.96875 L 340.46875,45.09375 L 329.53125,45.6875 L 328.375,47.625 L 327,47.625 L 327.1875,40.78125 L 324.0625,37.09375 L 321.71875,37.46875 L 320.34375,35.90625 L 316.4375,37.65625 L 315.09375,36.3125 L 312.34375,35.90625 L 311.5625,33.375 L 311.375,25.5625 L 309.625,24.78125 L 309.40625,23.59375 L 308.25,23.59375 L 307.84375,21.25 L 305.3125,21.46875 L 300.4375,23.03125 L 298.09375,25.9375 L 295.75,25.9375 L 294.1875,24 L 293.59375,21.84375 L 291.65625,19.6875 L 288.90625,19.6875 L 287.75,17.5625 L 287.75,14.21875 L 289.09375,12.09375 L 288.3125,9.15625 L 285.78125,4.0625 z '
          }
        ]
      }, {
        'rgn': '52',
        'dpts': [{
            'dept': "Loire-Atlantique",
            'code': '44',
            'path': 'M 132.875,185.84375 L 132.6875,188 L 128.40625,188.59375 L 126.4375,190.53125 L 125.65625,192.6875 L 113.5625,193.28125 L 108.46875,196 L 108.28125,201.46875 L 102.8125,203.625 L 99.09375,205.5625 L 95.96875,205.5625 L 94.8125,204.21875 L 93.0625,205.96875 L 92.21875,206.125 L 93.21875,206.8125 L 89.5,210.125 L 90.28125,210.90625 L 91.0625,212.46875 L 89.09375,215.21875 L 91.25,216.375 L 94.96875,217.15625 L 95.34375,215.59375 L 97.5,218.34375 L 101.03125,218.34375 L 103.5625,215.59375 L 106.875,215.59375 L 103.375,217.34375 L 103.5625,219.3125 L 104.34375,221.0625 L 102.1875,223.21875 L 99.84375,223.21875 L 100.25,226.15625 L 104.53125,225.375 L 109.625,230.0625 L 109.375,230.375 L 113.0625,232.78125 L 113.875,234.71875 L 117.25,236.1875 L 119.84375,236.5 L 120.96875,239.5625 L 125,240.53125 L 127.71875,241.03125 L 129.1875,239.40625 L 127.71875,237.3125 L 127.09375,232.78125 L 128.375,231.34375 L 130.15625,231.34375 L 130.96875,233.125 L 130.46875,236.34375 L 131.59375,237.15625 L 134.5,236.1875 L 135.46875,232.96875 L 134.1875,231.65625 L 137.40625,231.65625 L 138.53125,229.5625 L 139.65625,229.71875 L 142.25,232.15625 L 144.125,232.40625 L 144.1875,230.375 L 142.5625,228.28125 L 141.125,228.28125 L 140.625,228.4375 L 139.65625,227.96875 L 140.46875,227.15625 L 140.46875,225.6875 L 142.09375,225.21875 L 143.0625,222.96875 L 142.25,222.15625 L 142.09375,219.40625 L 140,219.40625 L 137.90625,216.8125 L 137.90625,214.90625 L 140.15625,213.75 L 144.1875,212.96875 L 150.46875,213.125 L 152.40625,211.8125 L 151.75,207.78125 L 148.84375,205.0625 L 145.3125,205.53125 L 144.34375,204.71875 L 144.1875,201.84375 L 146.75,199.5625 L 144.8125,197.15625 L 143.53125,193.75 L 141.4375,192.46875 L 141.4375,190.21875 L 141.21875,189.5 L 137.5625,188.59375 L 135.8125,186.25 L 132.875,185.84375 z '
          }, {
            'dept': "Maine-et-Loire",
            'code': '49',
            'path': 'M 141.9375,188.6875 L 141.5,189.5625 L 141.21875,189.5 L 141.4375,190.21875 L 141.4375,192.46875 L 143.53125,193.75 L 144.8125,197.15625 L 146.75,199.5625 L 144.1875,201.84375 L 144.34375,204.71875 L 145.3125,205.53125 L 148.84375,205.0625 L 151.75,207.78125 L 152.40625,211.8125 L 150.46875,213.125 L 144.1875,212.96875 L 140.15625,213.75 L 137.90625,214.90625 L 137.90625,216.8125 L 140,219.40625 L 142.09375,219.40625 L 142.25,222.15625 L 143.0625,222.96875 L 142.09375,225.21875 L 140.46875,225.6875 L 140.46875,227.15625 L 139.65625,227.96875 L 140.625,228.4375 L 141.125,228.28125 L 142.5625,228.28125 L 144.1875,230.375 L 144.125,232.40625 L 144.5,232.46875 L 146.125,233.4375 L 151.125,233.4375 L 153.78125,235.6875 L 157.5,234.09375 L 163.5625,235.46875 L 166.28125,233.6875 L 166.28125,230.96875 L 171.5625,230.5625 L 176.4375,229.59375 L 181.71875,229.40625 L 182.3125,230.78125 L 183.6875,231.9375 L 185.03125,229.59375 L 188.75,225.6875 L 190.25,225.6875 L 192.46875,217.6875 L 195.59375,213.96875 L 195.375,209.6875 L 197.34375,207.125 L 197.34375,205.96875 L 196.375,204.78125 L 197,203.5 L 194.34375,202.46875 L 186.125,197.46875 L 178.53125,195.21875 L 175.625,195.0625 L 175.625,193.125 L 173.84375,191.65625 L 171.9375,191.65625 L 168.375,190.53125 L 166.125,192.78125 L 160.96875,192.96875 L 158.6875,191.65625 L 152.90625,189.90625 L 151.59375,191.5 L 148.375,189.40625 L 145.46875,189.40625 L 141.9375,188.6875 z '
          }, {
            'dept': "Mayenne",
            'code': '53',
            'path': 'M 182.5,146.40625 L 180.5625,146.59375 L 179.75,148.53125 L 176.84375,149.71875 L 171.5625,148.9375 L 166.28125,152.0625 L 164.34375,150.6875 L 161.40625,152.65625 L 159.25,151.09375 L 157.875,148.75 L 154.96875,147.5625 L 153,149.125 L 149.6875,148.71875 L 149.5,153.8125 L 150.46875,154.59375 L 150.46875,158.5 L 148.5,160.46875 L 148.5,163.59375 L 149.09375,165.53125 L 149.09375,171.1875 L 150.46875,172.5625 L 150.46875,177.84375 L 147.15625,177.4375 L 145.78125,178.21875 L 143.25,184.46875 L 142.25,188 L 141.9375,188.6875 L 145.46875,189.40625 L 148.375,189.40625 L 151.59375,191.5 L 152.90625,189.90625 L 158.6875,191.65625 L 160.96875,192.96875 L 166.125,192.78125 L 168.375,190.53125 L 171.9375,191.65625 L 173.84375,191.65625 L 173.875,191.6875 L 174.5,190.21875 L 174.5,184.40625 L 173.84375,183.4375 L 174.1875,182.46875 L 176.9375,182.3125 L 178.21875,181.1875 L 178.375,180.21875 L 176.9375,176.65625 L 177.40625,175.21875 L 180.625,174.90625 L 180.3125,174.09375 L 181.125,172.15625 L 180.46875,170.6875 L 181.28125,169.09375 L 184.1875,166.65625 L 183.84375,164.09375 L 184.34375,159.90625 L 185.46875,157.96875 L 189.125,156.78125 L 188.5625,156.75 L 187.5625,153.21875 L 185.03125,152.25 L 184.25,147.96875 L 182.5,146.40625 z '
          }, {
            'dept': "Sarthe",
            'code': '72',
            'path': 'M 202.4375,151.875 L 197.15625,152.0625 L 191.875,156.9375 L 189.125,156.78125 L 185.46875,157.96875 L 184.34375,159.90625 L 183.84375,164.09375 L 184.1875,166.65625 L 181.28125,169.09375 L 180.46875,170.6875 L 181.125,172.15625 L 180.3125,174.09375 L 180.625,174.90625 L 177.40625,175.21875 L 176.9375,176.65625 L 178.375,180.21875 L 178.21875,181.1875 L 176.9375,182.3125 L 174.1875,182.46875 L 173.84375,183.4375 L 174.5,184.40625 L 174.5,190.21875 L 173.875,191.6875 L 175.625,193.125 L 175.625,195.0625 L 178.53125,195.21875 L 186.125,197.46875 L 194.34375,202.46875 L 197,203.5 L 198.3125,200.875 L 202.21875,203.625 L 204.375,203.625 L 203.1875,199.71875 L 205.5625,201.28125 L 206.90625,199.3125 L 212.5625,197.75 L 211.59375,195.40625 L 212.96875,193.65625 L 215.90625,192.5 L 218.625,188.96875 L 218.625,185.25 L 220.59375,185.25 L 221.375,182.53125 L 221.5625,178.4375 L 219.625,176.65625 L 221.1875,173.9375 L 223.5,171 L 220.78125,169.0625 L 218.25,168.65625 L 215.5,164.5625 L 214.71875,164.5625 L 214.53125,166.5 L 214.34375,165.15625 L 210.25,165.15625 L 208.28125,162.21875 L 204.96875,161.03125 L 204,154 L 202.4375,151.875 z '
          }, {
            'dept': "Vendée",
            'code': '85',
            'path': 'M 138.53125,229.5625 L 137.40625,231.65625 L 134.1875,231.65625 L 135.46875,232.96875 L 134.5,236.1875 L 131.59375,237.15625 L 130.46875,236.34375 L 130.96875,233.125 L 130.15625,231.34375 L 128.375,231.34375 L 127.09375,232.78125 L 127.71875,237.3125 L 129.1875,239.40625 L 127.71875,241.03125 L 125,240.53125 L 120.96875,239.5625 L 119.84375,236.5 L 117.25,236.1875 L 113.875,234.71875 L 113.0625,232.78125 L 109.375,230.375 L 103.5625,237.875 L 103.375,242.5625 L 109.40625,248.40625 L 109.21875,250.15625 L 110.96875,250.15625 L 114.6875,261.3125 L 118.59375,263.25 L 122.5,267.15625 L 127,267.15625 L 128.75,271.0625 L 133.0625,271.0625 L 135,274 L 139.3125,276.15625 L 139.5,273.40625 L 140.59375,274.4375 L 146.5625,270.8125 L 149.3125,270.625 L 150.46875,273.75 L 154.1875,272.1875 L 157.3125,274.53125 L 159.84375,273.34375 L 162,272.75 L 162.96875,271.59375 L 165.6875,269.84375 L 163.75,267.875 L 162.1875,269.0625 L 162,267.5 L 163.375,264.9375 L 162,262.59375 L 163.15625,261.03125 L 162.5625,255.5625 L 160.625,252.65625 L 162,250.875 L 158.875,247.375 L 160.03125,244.84375 L 155.34375,240.9375 L 155.34375,238.59375 L 153.40625,235.84375 L 153.78125,235.6875 L 151.125,233.4375 L 146.125,233.4375 L 144.5,232.46875 L 142.25,232.15625 L 139.65625,229.71875 L 138.53125,229.5625 z '
          }
        ]
      }, {
        'rgn': '22',
        'dpts': [{
            'dept': "Aisne",
            'code': '02',
            'path': 'M 328.40625,62.21875 L 325.28125,64.375 L 323.71875,63 L 322.34375,63 L 319.21875,65.15625 L 316.875,63.78125 L 314.53125,65.15625 L 313.75,65.34375 L 313.15625,64.15625 L 311,64.15625 L 309.4375,65.15625 L 309.375,65.15625 L 309.84375,67.90625 L 307.28125,70.6875 L 307.28125,73.25 L 305.5,75.25 L 305.90625,77.625 L 306.875,81.59375 L 308.0625,88.34375 L 307.6875,94.28125 L 306.875,96.0625 L 309.25,97.84375 L 307.46875,98.65625 L 306.28125,103.40625 L 302.90625,104.1875 L 301.71875,106.1875 L 304.09375,106.59375 L 304.5,109.34375 L 302.71875,109.75 L 302.90625,112.71875 L 303.5,112.53125 L 304.5,110.9375 L 306.875,112.53125 L 308.28125,114.125 L 307.875,116.78125 L 309.65625,118.0625 L 310.25,122.375 L 315.5,127.4375 L 317.25,128.03125 L 318.25,130.375 L 321.53125,131.0625 L 321.9375,130.5625 L 322.9375,128.4375 L 325.875,127.0625 L 327.4375,122.96875 L 329.1875,121.78125 L 328.1875,120.40625 L 325.65625,120.40625 L 325.28125,119.0625 L 327.03125,118.28125 L 327.8125,117.09375 L 326.0625,115.9375 L 326.625,114.15625 L 331.125,113.78125 L 330.34375,112.03125 L 327.625,110.25 L 327.625,105 L 331.3125,102.25 L 335.4375,102.25 L 335.03125,100.3125 L 337.375,99.3125 L 340.6875,101.46875 L 342.0625,101.09375 L 341.875,94.4375 L 342.46875,92.09375 L 343.25,89.375 L 340.6875,88 L 341.28125,86.4375 L 345,85.65625 L 345,83.125 L 347.9375,81.5625 L 348.71875,79.21875 L 347.75,77.65625 L 347.9375,74.71875 L 349.6875,73.15625 L 347.9375,69.84375 L 348.46875,66.375 L 344.5,66.375 L 343.4375,67.09375 L 339.71875,66.125 L 338.9375,63.59375 L 337.78125,63.59375 L 335.625,65.53125 L 335.25,63.78125 L 330.9375,63.375 L 329.75,62.40625 L 328.40625,62.21875 z '
          }, {
            'dept': "Somme",
            'code': '80',
            'path': 'M 249.78125,44.5 L 249.25,50.9375 L 253.5625,54.84375 L 253.5625,56.8125 L 248.28125,53.6875 L 241.9375,61.5 L 243.625,62.21875 L 245.78125,62.03125 L 246.75,63.96875 L 255.34375,72.375 L 255.9375,75.875 L 257.875,79.40625 L 257.21875,80.21875 L 259.6875,80.21875 L 260.09375,80.8125 L 260.09375,82.96875 L 261.28125,83.78125 L 263.84375,82.78125 L 267.4375,82.78125 L 269.21875,84.15625 L 275.9375,83.5625 L 280.90625,84.96875 L 283.6875,87.75 L 287.25,88.125 L 290.8125,89.3125 L 295.1875,85.15625 L 300.34375,83.78125 L 303.125,84.15625 L 307.25,83.75 L 306.875,81.59375 L 305.90625,77.625 L 305.5,75.25 L 307.28125,73.25 L 307.28125,70.6875 L 309.84375,67.90625 L 309.375,65.15625 L 307.875,64.75 L 306.125,63 L 301.4375,63 L 298.5,64.5625 L 298.5,63.1875 L 297.75,61.8125 L 295.96875,62.59375 L 293.8125,63.78125 L 295,62.03125 L 294.8125,60.46875 L 292.25,58.6875 L 292.25,60.65625 L 290.5,60.65625 L 286.40625,59.28125 L 284.65625,57.90625 L 282.875,59.09375 L 282.3125,60.65625 L 281.53125,60.84375 L 280.5625,59.875 L 280.5625,57.125 L 283.46875,55.1875 L 282.3125,53.21875 L 279.96875,54.21875 L 278.78125,53.21875 L 273.90625,53.8125 L 271.375,54.78125 L 268.8125,53.8125 L 268.8125,51.875 L 265.3125,50.3125 L 264.34375,47.96875 L 262.96875,48.53125 L 259.25,45.625 L 257.5,45.03125 L 256.125,46.78125 L 253.78125,47.375 L 252.8125,45.21875 L 249.78125,44.5 z '
          }, {
            'dept': "Oise",
            'code': '60',
            'path': 'M 257.21875,80.21875 L 255.9375,81.75 L 255.15625,83.6875 L 256.71875,83.6875 L 255.9375,85.65625 L 255.15625,89.5625 L 256.3125,91.5 L 256.3125,94.84375 L 258.28125,94.84375 L 257.5,96.1875 L 256.125,98.75 L 255.5625,100.5 L 257.3125,102.0625 L 257.875,106.5625 L 258.875,108.125 L 257.5,108.5 L 255.75,107.53125 L 255.4375,109.84375 L 255.5625,109.6875 L 256.3125,111.4375 L 257.5,113.375 L 262.78125,113.78125 L 266.5,113.375 L 269.03125,111.4375 L 272.15625,113.375 L 273.71875,114.5625 L 276.0625,113.96875 L 278.1875,113 L 282.3125,115.15625 L 286.59375,117.6875 L 287.96875,119.0625 L 290.3125,117.5 L 292.25,118.65625 L 293.4375,119.625 L 295.1875,119.4375 L 296.375,117.875 L 299.09375,119.4375 L 302.4375,118.0625 L 304.375,118.65625 L 306.3125,117.09375 L 307.5,116.5 L 307.875,116.78125 L 308.28125,114.125 L 306.875,112.53125 L 304.5,110.9375 L 303.5,112.53125 L 302.90625,112.71875 L 302.71875,109.75 L 304.5,109.34375 L 304.09375,106.59375 L 301.71875,106.1875 L 302.90625,104.1875 L 306.28125,103.40625 L 307.46875,98.65625 L 309.25,97.84375 L 306.875,96.0625 L 307.6875,94.28125 L 308.0625,88.34375 L 307.25,83.75 L 303.125,84.15625 L 300.34375,83.78125 L 295.1875,85.15625 L 290.8125,89.3125 L 287.25,88.125 L 283.6875,87.75 L 280.90625,84.96875 L 275.9375,83.5625 L 269.21875,84.15625 L 267.4375,82.78125 L 263.84375,82.78125 L 261.28125,83.78125 L 260.09375,82.96875 L 260.09375,80.8125 L 259.6875,80.21875 L 257.21875,80.21875 z '
          }
        ]
      }, {
        'rgn': '54',
        'dpts': [{
            'dept': "Charente",
            'code': '16',
            'path': 'M 206.28125,284.875 L 204.59375,286.15625 L 204.8125,288.9375 L 203.75,289.78125 L 200.75,288.0625 L 197.78125,289.125 L 194.375,289.34375 L 191.8125,286.21875 L 191,286.375 L 187.59375,288.0625 L 185.03125,288.71875 L 185.03125,290.1875 L 183.5625,291.90625 L 183.96875,292.96875 L 182.0625,294.03125 L 180.375,300.1875 L 179.9375,304.21875 L 178.46875,304.84375 L 176.34375,304.65625 L 175.90625,303.59375 L 173.5625,303.59375 L 172.3125,304.65625 L 169.53125,304.65625 L 167.1875,305.90625 L 168.90625,306.5625 L 169.125,311.03125 L 169.96875,311.21875 L 168.46875,312.9375 L 170.1875,314 L 172.5,316.125 L 173.78125,318.25 L 175.28125,319.71875 L 174.84375,321.84375 L 174,322.6875 L 175.28125,323.96875 L 175.28125,325.46875 L 172.71875,327.59375 L 173.78125,328.4375 L 175.28125,328.875 L 175.28125,329.28125 L 173.15625,330.125 L 173.34375,331.1875 L 174.625,331.84375 L 178.65625,331.1875 L 180.375,333.09375 L 181.65625,334.8125 L 185.8125,337.625 L 186.40625,336.625 L 190.3125,337.03125 L 192.25,335.25 L 195.78125,331.75 L 195.96875,324.90625 L 205.15625,318.65625 L 205.34375,313.96875 L 208.09375,313.59375 L 209.84375,310.46875 L 210.9375,310.5 L 211.59375,307.53125 L 213.15625,307.34375 L 214.125,304.59375 L 216.09375,304 L 218.4375,302.4375 L 218.0625,297.5625 L 219.8125,296.96875 L 223.3125,296.1875 L 223.125,294.4375 L 222.53125,291.71875 L 219.8125,291.5 L 218.25,289.75 L 219.21875,288 L 219.28125,286.40625 L 217.53125,285.53125 L 214.15625,285.53125 L 212.65625,287.21875 L 209.03125,288.71875 L 207.78125,287.4375 L 206.28125,284.875 z '
          }, {
            'dept': "Charente-Maritime",
            'code': '17',
            'path': 'M 149.3125,270.625 L 146.5625,270.8125 L 140.59375,274.4375 L 142.03125,275.75 L 138.90625,278.28125 L 138.53125,280.25 L 135.59375,280.625 L 134.03125,278.875 L 130.125,278.5 L 129.71875,276.53125 L 127.375,274.96875 L 124.0625,276.15625 L 126.21875,279.28125 L 128.9375,279.28125 L 131.6875,281.03125 L 133.84375,282.78125 L 137.9375,282.59375 L 138.71875,284.34375 L 141.4375,284.9375 L 142.4375,287.65625 L 144.1875,288.4375 L 144,290.59375 L 141.65625,290.21875 L 140.875,291.375 L 142.625,293.90625 L 141.65625,298.21875 L 139.3125,298.03125 L 139.5,300.75 L 140.09375,301.71875 L 137.34375,301.71875 L 136.96875,300.15625 L 138.71875,297.8125 L 138.125,296.46875 L 137.15625,295.6875 L 136.75,291 L 133.4375,290.59375 L 130.71875,287.28125 L 130.3125,294.125 L 134.8125,297.4375 L 135.1875,301.15625 L 135.96875,305.4375 L 136.375,309.75 L 138.71875,309.53125 L 142.8125,312.875 L 145.5625,314.4375 L 145.75,316.375 L 147.90625,316.78125 L 154.15625,323.03125 L 155.625,329.78125 L 161.40625,329.78125 L 162.375,328.8125 L 162.5625,331.75 L 167.65625,332.34375 L 168.4375,338.59375 L 171.1875,338.78125 L 175.65625,343.28125 L 178,343.65625 L 180.75,342.28125 L 182.6875,343.65625 L 184.25,340.34375 L 185.8125,337.625 L 181.65625,334.8125 L 180.375,333.09375 L 178.65625,331.1875 L 174.625,331.84375 L 173.34375,331.1875 L 173.15625,330.125 L 175.28125,329.28125 L 175.28125,328.875 L 173.78125,328.4375 L 172.71875,327.59375 L 175.28125,325.46875 L 175.28125,323.96875 L 174,322.6875 L 174.84375,321.84375 L 175.28125,319.71875 L 173.78125,318.25 L 172.5,316.125 L 170.1875,314 L 168.46875,312.9375 L 169.96875,311.21875 L 169.125,311.03125 L 168.90625,306.5625 L 167.1875,305.90625 L 169.53125,304.65625 L 172.3125,304.65625 L 173.5625,303.59375 L 175.90625,303.59375 L 176.34375,304.65625 L 178.46875,304.84375 L 179.9375,304.21875 L 180.375,300.1875 L 182.0625,294.03125 L 182.125,294 L 180.59375,292.53125 L 180.15625,290.40625 L 177.40625,289.125 L 173.78125,286.59375 L 169.3125,287 L 166.5625,283.40625 L 162.53125,283.1875 L 159.34375,280.84375 L 159.34375,279.5625 L 157.21875,277.25 L 157.125,274.375 L 154.1875,272.1875 L 150.46875,273.75 L 149.3125,270.625 z '
          }, {
            'dept': "Deux-Sèvres",
            'code': '79',
            'path': 'M 181.71875,229.40625 L 176.4375,229.59375 L 171.5625,230.5625 L 166.28125,230.96875 L 166.28125,233.6875 L 163.5625,235.46875 L 157.5,234.09375 L 153.40625,235.84375 L 155.34375,238.59375 L 155.34375,240.9375 L 160.03125,244.84375 L 158.875,247.375 L 162,250.875 L 160.625,252.65625 L 162.5625,255.5625 L 163.15625,261.03125 L 162,262.59375 L 163.375,264.9375 L 162,267.5 L 162.1875,269.0625 L 163.75,267.875 L 165.6875,269.84375 L 162.96875,271.59375 L 162,272.75 L 159.84375,273.34375 L 157.3125,274.53125 L 157.125,274.375 L 157.21875,277.25 L 159.34375,279.5625 L 159.34375,280.84375 L 162.53125,283.1875 L 166.5625,283.40625 L 169.3125,287 L 173.78125,286.59375 L 177.40625,289.125 L 180.15625,290.40625 L 180.59375,292.53125 L 182.125,294 L 183.96875,292.96875 L 183.5625,291.90625 L 185.03125,290.1875 L 185.03125,288.71875 L 187.59375,288.0625 L 191,286.375 L 194.59375,285.75 L 195.25,283.8125 L 192.25,282.96875 L 190.78125,280.625 L 191.84375,278.09375 L 193.125,276.59375 L 193.125,273.40625 L 191.84375,272.5625 L 190.15625,273.40625 L 190.15625,274.46875 L 189.28125,275.75 L 187.59375,273.84375 L 187.375,272.5625 L 188.03125,271.09375 L 186.53125,270.03125 L 186.53125,265.5625 L 185.6875,265.34375 L 185.6875,263.84375 L 186.96875,261.71875 L 187.15625,260.65625 L 188.03125,258.34375 L 187.375,256.84375 L 185.25,256 L 187.375,252.8125 L 188.03125,251.125 L 188.03125,250.0625 L 186.53125,248.34375 L 186.53125,247.71875 L 187.375,246.21875 L 186.75,245.15625 L 188.03125,243.6875 L 186.96875,241.34375 L 186.3125,237.9375 L 186.09375,235.8125 L 184.40625,236.03125 L 184.09375,231.21875 L 183.6875,231.9375 L 182.3125,230.78125 L 181.71875,229.40625 z '
          }, {
            'dept': "Vienne",
            'code': '86',
            'path': 'M 188.75,225.6875 L 185.03125,229.59375 L 184.09375,231.21875 L 184.40625,236.03125 L 186.09375,235.8125 L 186.3125,237.9375 L 186.96875,241.34375 L 188.03125,243.6875 L 186.75,245.15625 L 187.375,246.21875 L 186.53125,247.71875 L 186.53125,248.34375 L 188.03125,250.0625 L 188.03125,251.125 L 187.375,252.8125 L 185.25,256 L 187.375,256.84375 L 188.03125,258.34375 L 187.15625,260.65625 L 186.96875,261.71875 L 185.6875,263.84375 L 185.6875,265.34375 L 186.53125,265.5625 L 186.53125,270.03125 L 188.03125,271.09375 L 187.375,272.5625 L 187.59375,273.84375 L 189.28125,275.75 L 190.15625,274.46875 L 190.15625,273.40625 L 191.84375,272.5625 L 193.125,273.40625 L 193.125,276.59375 L 191.84375,278.09375 L 190.78125,280.625 L 192.25,282.96875 L 195.25,283.8125 L 194.59375,285.75 L 191.8125,286.21875 L 194.375,289.34375 L 197.78125,289.125 L 200.75,288.0625 L 203.75,289.78125 L 204.8125,288.9375 L 204.59375,286.15625 L 206.28125,284.875 L 207.78125,287.4375 L 209.03125,288.71875 L 212.65625,287.21875 L 214.15625,285.53125 L 217.53125,285.53125 L 219.28125,286.40625 L 219.40625,282.71875 L 218.0625,281.15625 L 219.625,280 L 222.15625,277.0625 L 226.4375,276.875 L 226.4375,274.53125 L 228.59375,272.75 L 233.875,271.78125 L 234.25,268.84375 L 232.125,267.6875 L 230.9375,263.59375 L 227.8125,263.1875 L 225.875,261.25 L 222.15625,258.3125 L 222.9375,255.96875 L 222.9375,252.25 L 219.40625,248.75 L 219.03125,246 L 215.6875,242.5 L 214.53125,237.8125 L 213.15625,237.21875 L 211.59375,235.0625 L 210.03125,236.03125 L 210.4375,238.1875 L 205.34375,239.375 L 199.5,239.375 L 199.6875,237.03125 L 199.6875,233.3125 L 195,231.9375 L 195,229.59375 L 191.28125,228.8125 L 190.5,225.6875 L 188.75,225.6875 z '
          }
        ]
      }, {
        'rgn': '93',
        'dpts': [{
            'dept': "Alpes de Hautes-Provence",
            'code': '04',
            'path': 'M 463.84375,364.34375 L 461.71875,367.53125 L 458.71875,369.3125 L 457.65625,371.4375 L 455,371.59375 L 455,373.53125 L 454.28125,374.59375 L 453.21875,377.25 L 446.875,377.09375 L 443.875,375.5 L 441.90625,376.90625 L 438.21875,376.71875 L 437.3125,377.96875 L 438.21875,377.96875 L 438.75,381.3125 L 437.84375,381.6875 L 434.5,379.5625 L 434.5,378.3125 L 432.5625,376.71875 L 431.5,376.71875 L 431.5,378.5 L 429.90625,378.84375 L 426.53125,380.78125 L 424.40625,384.34375 L 423.875,386.09375 L 425.125,386.4375 L 425.3125,389.28125 L 424.0625,389.28125 L 422.125,387.5 L 421.0625,387.6875 L 421.59375,389.28125 L 424.59375,392.625 L 422.65625,393.34375 L 421.25,392.46875 L 417.6875,392.46875 L 414.6875,395.28125 L 414.65625,395.25 L 414.53125,396.40625 L 413.375,395.03125 L 411.8125,393.65625 L 410.8125,396.59375 L 409.0625,398.15625 L 408.3125,398.09375 L 408.34375,398.28125 L 408.5,400.9375 L 410.625,401.3125 L 410.625,403.78125 L 408.6875,404.65625 L 409.03125,407.5 L 412.5625,409.25 L 412.5625,411.1875 L 410.96875,412.96875 L 410.96875,414.5625 L 415.40625,414.5625 L 419.46875,419.15625 L 419.4375,419.25 L 424.59375,417.5625 L 430.96875,421.8125 L 434.5,419.15625 L 435.375,417.375 L 440.34375,415.78125 L 443.5,417.90625 L 448.09375,414.5625 L 453.40625,414.75 L 454.8125,413.3125 L 457.78125,413.1875 L 457.84375,413.15625 L 457.125,411.375 L 458,410.3125 L 457.65625,408.90625 L 460.46875,408.90625 L 461.1875,408.03125 L 463.84375,406.59375 L 465.96875,408.03125 L 467.375,407.125 L 464.03125,404.125 L 460.46875,400.78125 L 459.25,400.40625 L 459.0625,397.75 L 456.9375,394.59375 L 457.65625,390 L 458.71875,387.5 L 460.65625,385.90625 L 460.84375,383.4375 L 463.5,382.03125 L 463.90625,381.875 L 463.90625,378.09375 L 466.65625,377.71875 L 465.09375,376.34375 L 463.125,375.75 L 462.15625,373.21875 L 462.9375,371.46875 L 466.4375,367.75 L 465.875,365 L 466.375,364.46875 L 463.84375,364.34375 z '
          }, {
            'dept': "Hautes-Alpes",
            'code': '05',
            'path': 'M 447.34375,339.15625 L 445.59375,339.9375 L 445.1875,342.875 L 441.6875,343.28125 L 441.09375,340.53125 L 439.9375,339.375 L 436.40625,339.75 L 435.03125,340.9375 L 434.25,345.03125 L 434.84375,346 L 438.9375,346.40625 L 439.71875,348.9375 L 441.28125,349.71875 L 441.28125,354 L 437.5625,353.8125 L 436,355.5625 L 431.53125,354.78125 L 429,356.9375 L 427.21875,356.15625 L 424.6875,358.125 L 425.65625,359.875 L 424.09375,361.4375 L 419.21875,361.4375 L 419.21875,363.78125 L 420.78125,364.5625 L 420.1875,365.9375 L 416.875,367.28125 L 412.78125,367.6875 L 411.59375,371.40625 L 411.40625,373.75 L 413.5625,375.5 L 411.40625,378.03125 L 408.6875,376.65625 L 405.5625,376.46875 L 405.15625,378.21875 L 407.125,379.59375 L 404.75,381.15625 L 405.5625,384.46875 L 412.1875,386.25 L 413.375,388.78125 L 415.3125,389.15625 L 414.65625,395.25 L 414.6875,395.28125 L 417.6875,392.46875 L 421.25,392.46875 L 422.65625,393.34375 L 424.59375,392.625 L 421.59375,389.28125 L 421.0625,387.6875 L 422.125,387.5 L 424.0625,389.28125 L 425.3125,389.28125 L 425.125,386.4375 L 423.875,386.09375 L 424.40625,384.34375 L 426.53125,380.78125 L 429.90625,378.84375 L 431.5,378.5 L 431.5,376.71875 L 432.5625,376.71875 L 434.5,378.3125 L 434.5,379.5625 L 437.84375,381.6875 L 438.75,381.3125 L 438.21875,377.96875 L 437.3125,377.96875 L 438.21875,376.71875 L 441.90625,376.90625 L 443.875,375.5 L 446.875,377.09375 L 453.21875,377.25 L 454.28125,374.59375 L 455,373.53125 L 455,371.59375 L 457.65625,371.4375 L 458.71875,369.3125 L 461.71875,367.53125 L 463.84375,364.34375 L 466.375,364.46875 L 468.21875,362.46875 L 470.34375,362.65625 L 470.34375,360.90625 L 467.625,359.53125 L 467.03125,353.875 L 464.875,353.09375 L 462.15625,353.5 L 457.0625,350.9375 L 456.28125,345.09375 L 453.375,344.125 L 452.375,342.15625 L 451.09375,339.34375 L 447.34375,339.15625 z '
          }, {
            'dept': "Alpes-Maritimes",
            'code': '06',
            'path': 'M 463.90625,381.875 L 463.5,382.03125 L 460.84375,383.4375 L 460.65625,385.90625 L 458.71875,387.5 L 457.65625,390 L 456.9375,394.59375 L 459.0625,397.75 L 459.25,400.40625 L 460.46875,400.78125 L 464.03125,404.125 L 467.375,407.125 L 465.96875,408.03125 L 463.84375,406.59375 L 461.1875,408.03125 L 460.46875,408.90625 L 457.65625,408.90625 L 458,410.3125 L 457.125,411.375 L 457.84375,413.15625 L 455.53125,414.5625 L 456.40625,416.6875 L 458.71875,416.84375 L 461,417.90625 L 461.375,421.625 L 463.5,423.75 L 464.71875,423.75 L 467.03125,424.625 L 467.375,426.59375 L 465.96875,427.8125 L 467.03125,428.875 L 467.03125,430.125 L 469.21875,432.375 L 469.375,432.1875 L 469.5625,427.71875 L 473.46875,428.5 L 474.84375,426.71875 L 476.8125,427.125 L 477,421.0625 L 481.5,420.6875 L 485.40625,417.15625 L 488.90625,417.15625 L 489.09375,415 L 492.625,412.875 L 490.65625,408.375 L 493.59375,405.84375 L 493,402.90625 L 497.3125,401.53125 L 498.46875,397.25 L 497.90625,394.3125 L 496.90625,392.5625 L 496.125,390 L 493.21875,390.21875 L 484.03125,393.53125 L 481.09375,393.53125 L 476.03125,389.4375 L 470.9375,388.0625 L 468,388.0625 L 468,384.53125 L 463.90625,382 L 463.90625,381.875 z '
          }, {
            'dept': "Bouches-du-Rhône",
            'code': '13',
            'path': 'M 379.71875,409.90625 L 374.25,413.03125 L 372.84375,423.53125 L 367.0625,422.71875 L 365.40625,427.125 L 366.78125,429.0625 L 360.4375,432.9375 L 358.6875,437 L 364.875,437.28125 L 373.09375,437.875 L 374.65625,439.4375 L 371.71875,439.4375 L 369.78125,442.75 L 378.15625,444.5 L 384.8125,443.34375 L 381.28125,440 L 383.625,438.0625 L 387.34375,439.625 L 389.09375,443.34375 L 400.25,443.53125 L 403.15625,442.34375 L 403.75,444.125 L 400.625,446.84375 L 404.9375,447.03125 L 404.15625,449 L 402.96875,450.375 L 412.53125,450.375 L 417.21875,451.9375 L 417.6875,452.5625 L 417.875,448.6875 L 419.28125,447.09375 L 421.0625,446.03125 L 420.875,444.96875 L 419.46875,443.5625 L 418.0625,443.5625 L 417.15625,442.5 L 418.75,441.0625 L 418.75,440.53125 L 417,439.65625 L 417,438.25 L 420.875,438.4375 L 421.78125,437.71875 L 418.40625,434.53125 L 418.59375,430.8125 L 416.46875,429.0625 L 418.21875,425.53125 L 422.46875,422.6875 L 419.28125,420.5625 L 417,422.34375 L 411.6875,423.5625 L 407.4375,423.03125 L 399.84375,419.875 L 395.25,420.03125 L 391.375,418.28125 L 389.9375,416.3125 L 386.9375,412.96875 L 379.875,409.96875 L 379.71875,409.90625 z '
          }, {
            'dept': "Vaucluse",
            'code': '84',
            'path': 'M 387,381.34375 L 384.25,381.5625 L 382.125,384.875 L 382.6875,388.375 L 386,388.78125 L 385.4375,390.34375 L 382.875,390.53125 L 379.96875,393.46875 L 379.1875,392.5 L 379.75,388.59375 L 378.59375,387.21875 L 373.3125,388 L 372.28125,390.09375 L 372.84375,390.40625 L 376.15625,395.90625 L 376.15625,400.34375 L 381.96875,406.125 L 381.96875,408.625 L 379.71875,409.90625 L 379.875,409.96875 L 386.9375,412.96875 L 389.9375,416.3125 L 391.375,418.28125 L 395.25,420.03125 L 399.84375,419.875 L 407.4375,423.03125 L 411.6875,423.5625 L 417,422.34375 L 419.1875,420.625 L 419.46875,419.15625 L 415.40625,414.5625 L 410.96875,414.5625 L 410.96875,412.96875 L 412.5625,411.1875 L 412.5625,409.25 L 409.03125,407.5 L 408.6875,404.65625 L 410.625,403.78125 L 410.625,401.3125 L 408.5,400.9375 L 408.34375,398.28125 L 408.3125,398.09375 L 406.53125,397.96875 L 403.59375,395.8125 L 402.8125,393.28125 L 397.34375,392.875 L 393.25,392.5 L 392.84375,390.15625 L 394.21875,387.21875 L 391.6875,389.375 L 387.78125,388.96875 L 387,387.59375 L 389.71875,383.90625 L 387,381.34375 z '
          }, {
            'dept': "Var",
            'code': '83',
            'path': 'M 457.78125,413.1875 L 454.8125,413.3125 L 453.40625,414.75 L 448.09375,414.5625 L 443.5,417.90625 L 440.34375,415.78125 L 435.375,417.375 L 434.5,419.15625 L 430.96875,421.8125 L 424.59375,417.5625 L 419.4375,419.25 L 419.1875,420.625 L 419.28125,420.5625 L 422.46875,422.6875 L 418.21875,425.53125 L 416.46875,429.0625 L 418.59375,430.8125 L 418.40625,434.53125 L 421.78125,437.71875 L 420.875,438.4375 L 417,438.25 L 417,439.65625 L 418.75,440.53125 L 418.75,441.0625 L 417.15625,442.5 L 418.0625,443.5625 L 419.46875,443.5625 L 420.875,444.96875 L 421.0625,446.03125 L 419.28125,447.09375 L 417.875,448.6875 L 417.6875,452.5625 L 418.21875,453.28125 L 421.71875,454.84375 L 422.6875,458.75 L 424.84375,459.15625 L 426.8125,457.78125 L 430.3125,455.625 L 436.375,456.21875 L 436.1875,457.78125 L 434.21875,458.75 L 438.90625,458.96875 L 437.75,457.78125 L 437.34375,455.25 L 439.875,453.5 L 442.8125,454.46875 L 444,454.84375 L 444.96875,456.03125 L 446.34375,455.0625 L 446.71875,452.5 L 448.28125,451.15625 L 452.375,451.15625 L 453.5625,449.375 L 456.28125,450.15625 L 459.40625,448.8125 L 459.40625,443.71875 L 455.3125,443.90625 L 458.4375,441.96875 L 460,439.8125 L 460.40625,436.6875 L 466.0625,435.90625 L 469.21875,432.375 L 467.03125,430.125 L 467.03125,428.875 L 465.96875,427.8125 L 467.375,426.59375 L 467.03125,424.625 L 464.71875,423.75 L 463.5,423.75 L 461.375,421.625 L 461,417.90625 L 458.71875,416.84375 L 456.40625,416.6875 L 455.53125,414.5625 L 457.78125,413.1875 z '
          }
        ]
      }, {
        'rgn': '82',
        'dpts': [{
            'dept': "Ain",
            'code': '01',
            'path': 'M 383.28125,262.59375 L 381.125,262.8125 L 379.75,265.34375 L 376.0625,279.78125 L 375.53125,280.96875 L 375.15625,285.53125 L 374.09375,287 L 374.09375,293.59375 L 373.46875,295.09375 L 377.28125,297.40625 L 378.78125,297.625 L 381.125,299.75 L 381.53125,303.15625 L 384.09375,302.3125 L 388.0625,303.46875 L 388.125,302.71875 L 390.03125,302.71875 L 392.78125,305.28125 L 395.34375,304 L 396.625,300.1875 L 397.90625,298.6875 L 399.59375,298.90625 L 401.28125,300.40625 L 402.15625,303.15625 L 410,312.71875 L 412.34375,311.03125 L 412.75,307.40625 L 415.3125,306.96875 L 415.3125,300.59375 L 416.59375,299.53125 L 417,293.8125 L 417.5,294.21875 L 417.4375,292.125 L 416.375,290.1875 L 416.8125,284.6875 L 418.71875,285.75 L 419.78125,283.8125 L 421.6875,283.1875 L 423.65625,281.625 L 421.53125,281.625 L 421.53125,277.90625 L 423.875,276.53125 L 427.375,276.15625 L 427.59375,274.1875 L 426.40625,273.40625 L 429.34375,269.6875 L 428.9375,268.53125 L 425.59375,266.75 L 417.46875,275.6875 L 411.8125,275.6875 L 411.8125,273.34375 L 408.6875,271.78125 L 404.96875,275.875 L 402.03125,276.28125 L 402.03125,273.53125 L 399.5,272.375 L 395.59375,266.90625 L 392.0625,265.53125 L 390.90625,263 L 388.9375,262.59375 L 387,263.96875 L 385.4375,264.375 L 383.28125,262.59375 z '
          }, {
            'dept': "Ardèche",
            'code': '07',
            'path': 'M 375.25,328.5 L 370.71875,331.1875 L 369.84375,335.03125 L 366.46875,335.65625 L 364.65625,336.15625 L 364.71875,336.25 L 363.5625,340.9375 L 360.8125,342.09375 L 359.65625,344.0625 L 360.4375,346.59375 L 361,347.96875 L 358.09375,347.96875 L 357.875,351.65625 L 354.75,351.875 L 353.1875,356.75 L 348.5,356.75 L 343.4375,360.46875 L 340.625,364.9375 L 341.09375,365.53125 L 342.46875,372.71875 L 345.78125,376.3125 L 345.21875,380.4375 L 349.375,382.9375 L 349.375,388.46875 L 351.59375,387.34375 L 356.28125,390.40625 L 358.5,391.21875 L 359.03125,387.34375 L 361.8125,386.8125 L 362.625,389.84375 L 365.40625,389.5625 L 365.9375,386.53125 L 372.28125,390.09375 L 373.3125,388 L 376,387.59375 L 376.21875,383.46875 L 375.59375,382.59375 L 374.75,382.40625 L 374.75,380.90625 L 375.375,379.40625 L 374.3125,377.71875 L 374.9375,373.90625 L 377.5,370.90625 L 377.5,366.6875 L 376.4375,361.78125 L 378.34375,361.375 L 378.78125,359.25 L 380.6875,355.625 L 381.75,352.875 L 380.0625,348.625 L 379,345.21875 L 377.5,339.28125 L 377.5,331.3125 L 376.4375,330.96875 L 375.25,328.5 z '
          }, {
            'dept': "Drôme",
            'code': '26',
            'path': 'M 384.9375,329.28125 L 382.1875,331.1875 L 379.84375,332.03125 L 377.5,331.3125 L 377.5,339.28125 L 379,345.21875 L 380.0625,348.625 L 381.75,352.875 L 380.6875,355.625 L 378.78125,359.25 L 378.34375,361.375 L 376.4375,361.78125 L 377.5,366.6875 L 377.5,370.90625 L 374.9375,373.90625 L 374.3125,377.71875 L 375.375,379.40625 L 374.75,380.90625 L 374.75,382.40625 L 375.59375,382.59375 L 376.21875,383.46875 L 376,387.59375 L 378.59375,387.21875 L 379.75,388.59375 L 379.1875,392.5 L 379.96875,393.46875 L 382.875,390.53125 L 385.4375,390.34375 L 386,388.78125 L 382.6875,388.375 L 382.125,384.875 L 384.25,381.5625 L 387,381.34375 L 389.71875,383.90625 L 387,387.59375 L 387.78125,388.96875 L 391.6875,389.375 L 394.21875,387.21875 L 392.84375,390.15625 L 393.25,392.5 L 397.34375,392.875 L 402.8125,393.28125 L 403.59375,395.8125 L 406.53125,397.96875 L 409.0625,398.15625 L 410.8125,396.59375 L 411.8125,393.65625 L 413.375,395.03125 L 414.53125,396.40625 L 415.3125,389.15625 L 413.375,388.78125 L 412.1875,386.25 L 405.5625,384.46875 L 404.75,381.15625 L 407.125,379.59375 L 405.15625,378.21875 L 405.5625,376.46875 L 408.6875,376.65625 L 411.40625,378.03125 L 413.5625,375.5 L 411.40625,373.75 L 411.59375,371.40625 L 412.78125,367.6875 L 416.875,367.28125 L 420.1875,365.9375 L 420.53125,365.15625 L 417,364.75 L 415.75,363.6875 L 413.8125,363.5 L 411.90625,362 L 409.375,360.5 L 406.59375,360.5 L 405.53125,359.4375 L 405.34375,343.53125 L 404.6875,343.53125 L 403.84375,345 L 401.9375,346.28125 L 397.46875,345 L 394.0625,343.9375 L 392.59375,344.375 L 392.15625,343.3125 L 393.21875,340.34375 L 392.78125,337.34375 L 393.65625,335.21875 L 391.53125,332.25 L 388.5625,332.25 L 384.9375,329.28125 z '
          }, {
            'dept': "Isère",
            'code': '38',
            'path': 'M 397.90625,298.6875 L 396.625,300.1875 L 395.34375,304 L 392.78125,305.28125 L 390.03125,302.71875 L 388.125,302.71875 L 387.90625,305.5 L 390.6875,307.84375 L 386.4375,313.34375 L 380.90625,314.625 L 376.65625,316.125 L 379.40625,318.875 L 380.0625,320.15625 L 375.8125,322.28125 L 375.375,328.4375 L 375.25,328.5 L 376.4375,330.96875 L 379.84375,332.03125 L 382.1875,331.1875 L 384.9375,329.28125 L 388.5625,332.25 L 391.53125,332.25 L 393.65625,335.21875 L 392.78125,337.34375 L 393.21875,340.34375 L 392.15625,343.3125 L 392.59375,344.375 L 394.0625,343.9375 L 397.46875,345 L 401.9375,346.28125 L 403.84375,345 L 404.6875,343.53125 L 405.34375,343.53125 L 405.53125,359.4375 L 406.59375,360.5 L 409.375,360.5 L 411.90625,362 L 413.8125,363.5 L 415.75,363.6875 L 417,364.75 L 420.53125,365.15625 L 420.78125,364.5625 L 419.21875,363.78125 L 419.21875,361.4375 L 424.09375,361.4375 L 425.65625,359.875 L 424.6875,358.125 L 427.21875,356.15625 L 429,356.9375 L 431.53125,354.78125 L 436,355.5625 L 437.5625,353.8125 L 441.28125,354 L 441.28125,349.71875 L 439.71875,348.9375 L 438.9375,346.40625 L 434.84375,346 L 434.25,345.03125 L 435.03125,340.9375 L 436.40625,339.75 L 435.28125,338.21875 L 433.15625,336.9375 L 431.875,338.21875 L 432.3125,336.5 L 432.3125,334.8125 L 430.59375,333.09375 L 431.46875,329.0625 L 433.375,328 L 433.15625,325.25 L 429.125,321.21875 L 427.625,321.21875 L 426.5625,322.6875 L 424.03125,319.3125 L 422.53125,319.5 L 421.25,322.28125 L 422.125,323.96875 L 421.46875,324.625 L 419.78125,323.34375 L 414.875,322.28125 L 412.5625,318.03125 L 412.5625,316.3125 L 410.21875,313.78125 L 409.96875,312.6875 L 402.15625,303.15625 L 401.28125,300.40625 L 399.59375,298.90625 L 397.90625,298.6875 z '
          }, {
            'dept': "Loire",
            'code': '42',
            'path': 'M 339.53125,278.03125 L 336,278.625 L 335.4375,280.78125 L 336.8125,283.5 L 337.1875,294.625 L 332.5,294.84375 L 332.3125,296.59375 L 335.4375,299.125 L 333.6875,300.875 L 333.09375,305.1875 L 335.4375,308.3125 L 337.5625,313.375 L 342.65625,316.71875 L 344.40625,323.15625 L 340.6875,326.65625 L 341.28125,329 L 346.75,330.78125 L 351.0625,327.25 L 353.1875,327.0625 L 359.4375,329.78125 L 359.0625,333.5 L 362.1875,333.3125 L 364.65625,336.15625 L 366.46875,335.65625 L 369.84375,335.03125 L 370.71875,331.1875 L 375.375,328.4375 L 375.8125,322.28125 L 375.96875,322.1875 L 373.6875,321.84375 L 371.5625,322.6875 L 369.84375,321.625 L 371.96875,319.09375 L 371.34375,317.1875 L 364.75,316.125 L 359.21875,311.03125 L 359.21875,309.3125 L 360.5,308.25 L 360.5,306.78125 L 359.03125,305.90625 L 360.28125,304 L 360.28125,301.25 L 357.75,298.90625 L 357.75,296.5625 L 356.03125,294.875 L 356.03125,292.96875 L 355.1875,289.78125 L 356.46875,288.5 L 356.6875,284.6875 L 360.71875,284.6875 L 361.78125,283.40625 L 360.5,281.28125 L 360.5,279.375 L 359.4375,278.53125 L 358.6875,282.53125 L 356.53125,282.53125 L 354.96875,284.09375 L 353.78125,282.90625 L 347.53125,281.9375 L 345.1875,283.3125 L 343.625,283.3125 L 343.25,281.9375 L 340.3125,281.34375 L 340.125,278.21875 L 339.53125,278.03125 z '
          }, {
            'dept': "Rhône",
            'code': '69',
            'path': 'M 371.75,275.3125 L 369.625,275.5 L 367.84375,277.25 L 366.6875,275.6875 L 364.9375,277.25 L 362.5625,275.6875 L 360.625,275.6875 L 359.84375,276.28125 L 359.4375,278.53125 L 360.5,279.375 L 360.5,281.28125 L 361.78125,283.40625 L 360.71875,284.6875 L 356.6875,284.6875 L 356.46875,288.5 L 355.1875,289.78125 L 356.03125,292.96875 L 356.03125,294.875 L 357.75,296.5625 L 357.75,298.90625 L 360.28125,301.25 L 360.28125,304 L 359.03125,305.90625 L 360.5,306.78125 L 360.5,308.25 L 359.21875,309.3125 L 359.21875,311.03125 L 364.75,316.125 L 371.34375,317.1875 L 371.96875,319.09375 L 369.84375,321.625 L 371.5625,322.6875 L 373.6875,321.84375 L 375.96875,322.1875 L 380.0625,320.15625 L 379.40625,318.875 L 376.65625,316.125 L 380.90625,314.625 L 386.4375,313.34375 L 390.6875,307.84375 L 387.90625,305.5 L 388.0625,303.46875 L 384.09375,302.3125 L 381.53125,303.15625 L 381.125,299.75 L 378.78125,297.625 L 377.28125,297.40625 L 373.46875,295.09375 L 374.09375,293.59375 L 374.09375,287 L 375.15625,285.53125 L 375.53125,280.96875 L 374.875,282.53125 L 373.5,282.34375 L 372.75,278.4375 L 371.75,275.3125 z '
          }, {
            'dept': "Savoie",
            'code': '73',
            'path': 'M 417,293.8125 L 416.59375,299.53125 L 415.3125,300.59375 L 415.3125,306.96875 L 412.75,307.40625 L 412.34375,311.03125 L 410,312.71875 L 409.96875,312.6875 L 410.21875,313.78125 L 412.5625,316.3125 L 412.5625,318.03125 L 414.875,322.28125 L 419.78125,323.34375 L 421.46875,324.625 L 422.125,323.96875 L 421.25,322.28125 L 422.53125,319.5 L 424.03125,319.3125 L 426.5625,322.6875 L 427.625,321.21875 L 429.125,321.21875 L 433.15625,325.25 L 433.375,328 L 431.46875,329.0625 L 430.59375,333.09375 L 432.3125,334.8125 L 432.3125,336.5 L 431.875,338.21875 L 433.15625,336.9375 L 435.28125,338.21875 L 436.40625,339.75 L 439.9375,339.375 L 441.09375,340.53125 L 441.6875,343.28125 L 445.1875,342.875 L 445.59375,339.9375 L 447.34375,339.15625 L 451.09375,339.34375 L 451.03125,339.21875 L 456.875,336.875 L 459.03125,338.25 L 461.1875,338.25 L 461.375,335.90625 L 463.90625,334.53125 L 464.875,333.375 L 469.96875,331.40625 L 470.5625,328.09375 L 469.5625,326.53125 L 472.3125,321.84375 L 469.78125,320.875 L 469,318.125 L 463.71875,315 C 463.71875,315 464.03377,309.01275 463.53125,307.9375 C 463.51544,307.91055 463.48155,307.86019 463.46875,307.84375 C 463.46374,307.8383 463.44264,307.81713 463.4375,307.8125 C 463.43393,307.81272 463.4091,307.81243 463.40625,307.8125 C 463.4062,307.80552 463.40608,307.78312 463.40625,307.78125 C 463.40269,307.78137 463.37784,307.78121 463.375,307.78125 C 463.37209,307.7811 463.3467,307.78118 463.34375,307.78125 C 463.34022,307.78117 463.31534,307.78126 463.3125,307.78125 C 462.53125,307.97657 459.625,308.1875 459.625,308.1875 L 456.6875,304.84375 L 456.78125,301.625 L 455.46875,301.46875 L 453.96875,303.15625 L 452.0625,304.4375 L 452.5,303.375 L 450.5625,300.1875 L 447.375,300.1875 L 445.46875,297.84375 L 446.53125,296.5625 L 446.125,295.28125 L 444.625,294.875 L 442.71875,296.15625 L 441.21875,300.59375 L 439.3125,302.09375 L 438.46875,305.5 L 437.625,307.1875 L 434.21875,307.84375 L 433.15625,306.78125 L 430.1875,303.59375 L 428.46875,303.59375 L 427.84375,304.84375 L 424.4375,304.4375 L 422.96875,301.65625 L 419.125,301.03125 L 419.125,295.5 L 417,293.8125 z '
          }, {
            'dept': "Haute-Savoie",
            'code': '74',
            'path': 'M 446.125,266.1875 L 441.65625,266.96875 L 437.34375,270.46875 L 436.1875,268.71875 L 434.03125,268.90625 L 432.0625,273.21875 L 432.28125,274.96875 L 434.40625,276.71875 L 430.5,279.28125 L 427.96875,281.625 L 423.65625,281.625 L 421.6875,283.1875 L 419.78125,283.8125 L 418.71875,285.75 L 416.8125,284.6875 L 416.375,290.1875 L 417.4375,292.125 L 417.5,294.21875 L 419.125,295.5 L 419.125,301.03125 L 422.96875,301.65625 L 424.4375,304.4375 L 427.84375,304.84375 L 428.46875,303.59375 L 430.1875,303.59375 L 433.15625,306.78125 L 434.21875,307.84375 L 437.625,307.1875 L 438.46875,305.5 L 439.3125,302.09375 L 441.21875,300.59375 L 442.71875,296.15625 L 444.625,294.875 L 446.125,295.28125 L 446.53125,296.5625 L 445.46875,297.84375 L 447.375,300.1875 L 450.5625,300.1875 L 452.5,303.375 L 452.0625,304.4375 L 453.96875,303.15625 L 455.46875,301.46875 L 456.78125,301.625 L 456.875,298.21875 L 463.53125,295.46875 L 464.3125,293.53125 L 463.90625,289.21875 L 459.625,284.75 L 458.25,285.53125 L 458.25,283.75 L 458.25,280.84375 L 454.53125,279.0625 L 454.34375,277.5 L 456.5,275.15625 L 456.5,272.4375 L 452.96875,268.71875 L 452.78125,266.1875 L 446.125,266.1875 z '
          }
        ]
      }, {
        'rgn': '971',
        'dpts': [{
            'dept': "Guadeloupe",
            'code': '971',
            'path': 'M 36.266401,501.65044 L 34.766711,502.0068 L 33.385815,503.22437 L 33.445212,505.95647 L 34.514286,506.13465 L 34.573683,507.82737 L 33.519446,508.64403 L 33.326418,509.98039 L 33.326418,510.21795 L 32.390975,511.19796 L 32.331578,511.37614 L 30.267652,511.25734 L 30.015227,510.2625 L 28.515537,509.40129 L 25.842827,508.00555 L 22.902844,508.00555 L 21.536797,510.09917 L 21.596194,513.1134 L 21.967401,514.34582 L 22.026798,514.56854 L 22.219826,516.89973 L 23.095872,521.20578 L 23.97193,523.47758 C 23.971941,523.47758 24.589525,524.06265 24.714356,524.35363 C 24.839187,524.64462 25.531017,525.5712 25.531017,525.5712 L 26.897064,525.74938 L 27.283121,525.03665 L 27.342518,525.1109 L 28.708565,525.1109 L 30.772491,523.35879 L 32.079153,521.56213 L 32.019756,517.37489 L 31.262492,515.16248 L 31.514917,513.35097 L 32.940361,513.06885 L 32.95521,513.06885 L 33.385815,513.58854 L 34.573683,513.87067 L 35.509137,514.22702 L 35.598221,514.18248 L 35.702166,514.524 L 37.513666,514.62793 L 40.631829,514.04884 L 42.383944,512.77188 L 45.44271,512.6531 L 48.056022,511.77704 L 46.43755,510.85644 L 46.244522,509.98039 L 44.180596,508.64403 L 40.260622,508.58463 L 39.072754,506.55041 L 39.072754,504.2786 L 38.256081,502.52649 L 36.266401,501.65044 z'
          }
        ]
      }, {
        'rgn': '972',
        'dpts': [{
            'dept': "Martinique",
            'code': '972',
            'path': 'M 81.074386,499.50485 C 81.074386,499.50485 77.462124,499.59268 77.02078,499.75727 C 76.579425,499.92185 74.808374,501.15302 74.808362,501.15302 L 74.541099,501.22726 L 73.486863,502.80119 L 73.843221,504.85026 L 76.931685,507.89419 L 76.397148,508.7257 L 76.397148,510.37387 L 77.718647,512.18537 L 81.965293,515.97172 L 85.751636,515.97172 L 86.107994,515.97172 L 87.162231,515.88262 L 87.34041,515.88262 L 87.162231,516.62505 L 87.162231,517.20413 L 88.409496,517.53079 L 88.929184,517.85746 C 88.929184,517.85746 88.755091,519.26 89.196458,519.3423 L 87.874947,519.41654 L 86.018898,518.8523 L 84.786483,518.59988 L 83.197709,519.25321 L 82.306802,520.3223 L 81.876197,521.55471 L 82.217718,522.80198 L 83.108613,524.03439 L 84.251945,524.68772 C 84.251945,524.68772 85.399376,524.36227 85.840719,524.19772 C 86.282074,524.03308 86.642543,523.29197 86.642531,523.29198 C 86.642531,523.29198 87.95494,523.21094 88.572825,523.12864 C 89.190711,523.04634 89.82009,523.87105 89.82009,523.87106 L 92.730376,524.27197 L 94.051887,525.01438 L 94.838849,524.94015 L 94.838849,524.10864 L 95.551577,523.70773 L 96.264298,524.10864 L 95.90794,525.10348 L 95.106124,525.84589 L 95.462482,527.31588 L 96.516723,527.89497 L 97.763988,527.82073 L 98.996404,526.82589 L 99.352762,525.51923 L 100.58518,524.19772 L 99.783366,522.54955 L 99.263678,521.06471 L 98.640046,519.08988 L 98.016413,517.69412 C 98.016413,517.69412 96.516711,516.2118 96.516723,515.88262 C 96.516723,515.55344 95.106124,514.81355 95.106124,514.81354 L 94.927944,513.49204 C 94.927944,513.49204 95.288378,513.09244 95.729761,512.92779 C 96.171069,512.7632 95.462482,512.02203 95.462482,512.02204 L 94.586424,512.18537 L 93.250075,512.51203 L 92.908555,512.09628 L 92.374017,511.51719 L 92.463101,510.77478 L 93.428254,510.95296 L 94.230066,510.0472 L 93.086734,509.14146 L 92.195838,508.88903 L 91.928564,508.39903 L 91.928564,508.39903 L 91.928564,507.81995 L 92.908555,507.40419 L 93.606433,507.98328 L 94.838849,508.47328 L 95.462482,507.73085 L 95.462482,506.91419 L 95.997024,506.26086 L 95.551577,505.75602 L 94.586424,505.35511 L 93.962791,505.91935 L 91.49796,506.17178 L 90.696148,506.75086 L 89.641911,506.4242 L 88.409496,504.44936 L 85.573457,501.64302 L 83.984671,500.98969 L 81.074386,499.50485 z'
          }
        ]
      }, {
        'rgn': '973',
        'dpts': [{
            'dept': "Guyane",
            'code': '973',
            'path': 'M 131.69165,498.79176 C 131.6152,498.79678 131.55755,498.82055 131.53104,498.8453 L 130.04994,500.71897 L 128.76512,502.20008 L 127.28402,503.68119 L 127.49816,507.6427 L 127.39108,511.30086 L 128.6759,513.08533 L 129.94286,515.35158 L 130.6745,516.74346 L 129.94286,517.6357 L 129.08634,520.00904 L 129.19339,523.27461 L 128.14055,525.14829 L 126.44532,526.54018 L 126.96281,527.12904 L 128.24763,527.91421 L 129.40753,528.61015 L 131.10278,528.11049 L 132.90508,527.02199 L 136.61676,526.93275 L 138.00865,527.91421 L 139.48976,528.02129 L 140.97086,528.32464 L 143.09438,526.6294 L 145.53909,522.38237 L 147.3414,518.72422 L 149.1437,516.04753 L 151.05309,513.58497 L 152.10592,511.69344 L 151.26722,510.01604 L 150.62481,507.6427 L 149.25078,507.14304 L 147.68045,506.07238 L 146.37778,504.87678 L 144.68255,503.78826 L 143.52265,503.39567 L 140.13215,501.02234 L 137.90158,500.21933 L 135.77807,499.93381 C 135.77807,499.93381 134.82734,499.54274 134.29697,499.34494 C 133.83284,499.17192 132.2268,498.75662 131.69165,498.79176 z'
          }
        ]
      }, {
        'rgn': '974',
        'dpts': [{
            'dept': "La Réunion",
            'code': '974',
            'path': 'M 188.55297,500.95998 L 186.22178,501.00453 L 185.37542,501.42029 L 184.41027,502.1627 L 184.23209,502.32604 L 183.56391,502.32604 L 182.15332,502.86058 L 181.54453,503.39513 L 179.59939,503.67724 L 179.42121,504.70178 L 178.88667,506.83995 C 178.88667,506.83995 178.14218,507.33673 177.92153,507.41904 C 177.70083,507.50133 176.46639,508.16146 176.46639,508.16146 L 176.24366,510.43326 L 176.7782,511.78446 L 178.23334,513.50688 L 178.93122,514.29384 L 179.49546,514.17506 L 179.15395,514.33839 L 179.19848,517.42685 L 180.65363,519.23835 L 182.15332,520.63411 L 184.79633,522.19319 L 184.97452,522.08925 L 184.76664,522.23774 L 187.89965,524.12348 L 190.31994,524.99954 L 192.9184,525.44498 L 194.99718,526.18741 L 196.31869,526.43983 C 196.31869,526.43983 198.35539,526.02408 198.62019,526.02408 C 198.88498,526.02408 200.99594,525.60832 200.99594,525.60832 L 203.16379,524.91044 L 204.61894,523.58893 L 204.48531,521.2429 L 204.75257,519.7729 L 205.33167,518.94139 L 206.29682,517.66443 L 206.78682,516.06081 L 206.65318,514.50172 L 205.62863,513.92263 L 204.30713,513.31385 L 203.69834,513.2693 L 202.71834,511.87356 C 202.49768,511.70902 201.30693,510.38658 201.21865,510.18084 C 201.13038,509.9751 200.34261,508.206 200.34261,508.206 L 200.07533,505.4442 L 198.57564,504.00391 L 196.80869,503.02391 C 196.80869,503.02392 195.39562,502.2039 195.13082,502.1627 C 194.86602,502.12161 192.53068,501.62816 192.35416,501.62816 C 192.17761,501.62816 190.45316,501.75039 190.40902,501.79149 L 190.18631,501.70241 L 188.55297,500.95998 z'
          }
        ]
      }, {
        'rgn': '976',
        'dpts': [{
            'dept': "Mayotte",
            'code': '976',
            'path': 'M 253.92011,511.36202 C 253.89179,511.42416 253.77248,511.4047 253.71685,511.42195 C 253.56251,511.46959 253.4232,511.48489 253.31228,511.61366 C 253.26611,511.66728 253.25262,511.72506 253.23095,511.7876 C 253.1935,511.89563 253.13921,511.99569 253.09284,512.09742 C 253.03594,512.2221 253.08224,512.39885 252.96146,512.49307 C 252.90421,512.53789 252.84114,512.53561 252.76813,512.54333 C 252.65653,512.55527 252.64949,512.56796 252.57654,512.48253 C 252.51709,512.41274 252.48615,512.3904 252.47971,512.29538 C 252.47374,512.20848 252.47958,512.11882 252.47971,512.03159 C 252.47978,511.94791 252.48944,511.90107 252.42381,511.84396 C 252.36208,511.79021 252.28732,511.75291 252.22102,511.70204 C 252.16123,511.65601 252.08245,511.60467 252.03736,511.54407 C 251.98495,511.47355 251.96797,511.37658 251.92717,511.30076 C 251.82692,511.11461 251.78149,510.9557 251.58642,510.87571 C 251.50213,510.84109 251.44416,510.77432 251.36423,510.73305 C 251.25519,510.67682 251.15413,510.64407 251.05844,510.56509 C 250.89329,510.42927 250.72546,510.28667 250.75861,510.04677 C 250.92872,509.96491 250.99207,510.11213 251.12487,510.17977 C 251.25076,510.24379 251.37094,510.30969 251.48542,510.38813 C 251.6301,510.48718 251.76652,510.51188 251.79028,510.30754 C 251.79967,510.22655 251.77659,510.15977 251.76954,510.08381 C 251.76599,510.04577 251.78021,509.99745 251.77062,509.96108 C 251.76109,509.92545 251.72868,509.90646 251.71324,509.87646 C 251.68781,509.82727 251.66117,509.73239 251.66768,509.67804 C 251.67862,509.5865 251.78652,509.58181 251.85161,509.53101 C 251.91415,509.48209 251.94952,509.40881 251.99783,509.35345 C 252.05178,509.29138 252.12728,509.23897 252.19686,509.19562 C 252.2692,509.15073 252.35181,509.14509 252.41831,509.0902 C 252.49085,509.03014 252.53829,508.9837 252.6064,508.90546 C 252.64875,508.85708 252.70592,508.82044 252.74846,508.76991 C 252.81147,508.69529 252.84235,508.60752 252.89099,508.52719 C 252.93643,508.45217 253.01527,508.33104 253.09291,508.2826 C 253.22296,508.2014 253.28013,508.32172 253.33637,508.41519 C 253.36395,508.46096 253.40206,508.50149 253.42823,508.54545 C 253.48695,508.64416 253.49715,508.68562 253.61586,508.68381 C 253.76302,508.68167 253.8367,508.75441 253.86381,508.88667 C 253.89038,509.01665 253.88461,509.14073 253.89944,509.27272 C 253.90602,509.3307 253.93406,509.37848 253.96581,509.43062 C 254.01419,509.50994 254.00996,509.54805 254.02057,509.63844 C 254.03351,509.74809 254.05694,509.87525 254.118,509.96612 C 254.15833,510.02604 254.21846,510.03436 254.25992,510.08891 C 254.29844,510.13965 254.29039,510.21883 254.28227,510.28372 C 254.06331,510.27687 253.9601,510.50147 253.96071,510.69245 C 253.96145,510.9196 254.05298,511.12018 254.01801,511.3584 C 253.98225,511.37564 253.94198,511.39195 253.89978,511.38229, M 246.2712,526.59904 C 246.01634,526.59877 245.81851,526.62078 245.69538,526.87243 C 245.54574,527.17815 245.26524,526.85585 245.09184,526.80156 C 244.75766,526.69708 244.50998,526.86209 244.37416,527.17231 C 244.31913,527.29813 244.35067,527.40926 244.31457,527.53488 C 244.26538,527.70599 244.08856,527.66842 244.08064,527.50784 C 244.05259,526.93805 244.11654,526.33948 243.4561,526.17521 C 242.76707,526.00376 242.48644,526.3276 242.62313,526.98012 C 242.64655,527.09186 242.66823,527.20862 242.6538,527.3233 C 242.56146,527.32189 242.46349,527.34142 242.40497,527.41979 C 242.30593,527.5528 242.34022,527.7421 242.22977,527.87087 C 242.1173,528.00199 241.78466,528.16976 241.61187,528.18076 C 241.29513,528.20123 241.31178,527.67922 241.17958,527.48945 C 241.05101,527.30511 240.71669,527.18741 240.51732,527.3396 C 240.40016,527.42899 240.44532,527.68687 240.23227,527.60641 C 240.12443,527.38255 240.14966,527.0467 240.07282,526.79686 C 239.99445,526.5416 239.62296,526.43665 239.37621,526.43665 C 239.10692,526.43665 238.91654,527.14675 238.59512,527.32411 C 238.51218,527.37913 238.4244,526.82485 238.55049,526.70976 C 238.79817,526.48402 238.66678,526.33351 238.68853,525.97759 C 238.71047,525.61723 239.06558,524.56316 238.28852,524.77642 C 238.07385,524.8354 238.0362,525.06698 237.82738,525.13194 C 237.59627,525.2038 237.2794,525.29251 237.04379,525.19481 C 236.84617,525.11288 236.91818,524.86788 236.60802,524.91129 C 236.26766,524.9588 236.2633,524.78896 236.53669,524.63067 C 236.75719,524.50303 236.97515,524.38768 237.22451,524.32675 C 237.52534,524.25314 237.60345,524.01458 237.81764,523.82078 C 238.14928,523.52082 238.26697,522.80938 238.10981,522.3938 C 238.04157,522.21336 237.99366,521.96192 237.7647,521.93367 C 237.60244,521.91353 237.02527,522.52096 237.02527,521.99715 C 237.02527,521.65693 236.95119,521.69504 236.70613,521.51574 C 236.48012,521.35006 236.40959,521.04581 236.32839,520.79302 C 236.25934,520.57816 236.28712,520.228 236.08339,520.09145 C 235.92234,519.98341 235.58783,519.98005 235.64594,519.707 C 235.99039,519.66318 236.37497,519.60158 236.72176,519.60843 C 236.86033,519.61118 236.98004,519.6907 237.11855,519.70009 C 237.26598,519.71002 237.38005,519.64681 237.51863,519.61849 C 237.65599,519.59031 237.98561,519.81967 238.04399,519.93422 C 238.11525,520.0744 238.0615,520.24277 238.07465,520.39067 C 238.09405,520.60882 238.14652,520.81329 238.15739,521.03413 C 238.17162,521.32322 238.39414,521.45669 238.54499,521.67632 C 238.72604,521.94004 239.00747,521.90146 239.26737,522.02587 C 239.53606,522.15437 239.77018,522.26509 240.05833,522.34824 C 240.38338,522.44218 240.611,522.71765 240.96075,522.74114 C 241.15475,522.75422 241.49041,522.68691 241.63528,522.54063 C 241.7711,522.40353 242.09522,522.09056 242.09166,521.93803 C 242.08844,521.80107 242.103,521.6582 242.08784,521.52198 C 242.13428,521.41891 242.23896,521.51588 242.21211,521.34415 C 242.16172,521.02205 241.8317,520.83852 241.73574,520.5438 C 241.70387,520.44623 241.76567,520.33919 241.64448,520.27699 C 241.53926,520.22317 241.42927,520.2372 241.40337,520.08608 C 241.3464,519.75532 241.41156,519.7378 241.1416,519.54186 C 240.93217,519.38994 240.99692,519.10172 240.84915,518.91121 C 240.77366,518.81398 240.65912,518.83632 240.56457,518.77304 C 240.40056,518.66319 240.27649,518.50785 240.12228,518.38618 C 239.68892,518.04456 239.07324,517.806 238.96345,517.19166 C 238.92219,516.96075 238.90964,516.72475 238.60183,516.72374 C 238.30885,516.72267 237.96454,516.52518 237.7951,516.2877 C 237.70175,516.15684 237.403,516.03934 237.48527,515.82454 C 237.5246,515.7214 237.68894,515.73911 237.76705,515.68925 C 237.88388,515.61484 237.88253,515.5321 237.92709,515.41534 C 238.10384,514.95185 239.22724,515.15087 239.2671,514.89226 C 239.30387,514.65377 239.09404,514.63645 238.91702,514.60418 C 238.67235,514.55948 238.48963,514.39984 238.22148,514.37314 C 237.92716,514.34374 238.07928,514.01332 238.1839,513.85972 C 238.37803,513.57473 238.37891,513.21417 238.37891,512.88368 C 238.37891,512.3857 237.64773,512.07662 237.96172,511.46925 C 238.10304,511.19587 238.43017,511.41812 238.58297,511.2158 C 238.89615,510.80069 238.10962,510.96879 237.97319,510.95618 C 237.71652,510.93249 237.62498,510.59099 237.64901,510.38062 C 237.67726,510.13475 237.89314,510.03798 238.0097,509.8364 C 238.08767,509.70206 238.27664,509.265 238.21913,509.11751 C 238.10935,508.83587 237.99144,508.69126 237.72517,508.90271 C 237.20652,509.31352 236.88228,508.38292 236.40529,508.63784 C 236.15996,508.7691 235.911,508.71817 235.78089,508.44479 C 235.71325,508.30259 235.60662,508.32776 235.49737,508.24267 C 235.39813,508.16516 235.30357,508.02639 235.21439,507.93378 C 235.05166,507.76482 234.88169,507.60591 234.63709,507.5833 C 234.43323,507.56451 234.13253,507.86004 233.95269,507.76878 C 233.84573,507.71429 233.81848,507.56028 233.73789,507.48036 C 233.63019,507.3736 233.49336,507.36957 233.36392,507.31179 C 233.02618,507.16081 233.51738,506.76899 233.60891,506.66175 C 233.88753,506.33515 234.30023,505.99789 234.44738,505.62485 C 234.70889,504.96153 233.51007,505.26699 233.2593,505.11627 C 233.03812,504.98333 233.8374,504.36584 233.88431,504.16258 C 233.93914,503.9247 233.80922,503.66057 233.92639,503.43383 C 234.06838,503.1591 234.18581,503.30082 234.41806,503.35229 C 234.65763,503.40557 235.00382,503.42604 235.12991,503.17876 C 235.19849,503.04408 235.39081,502.6999 235.51428,502.61314 C 235.66392,502.50818 235.88973,502.22809 235.69969,502.03798 C 235.40564,501.74373 235.55381,501.79742 235.92791,501.74709 C 236.09527,501.72461 236.47562,501.76265 236.50199,501.53342 C 236.52407,501.34204 236.5022,500.88077 236.66707,500.75119 C 236.84711,500.60973 236.97984,500.44398 237.15968,500.30702 C 237.24209,500.24408 237.36576,500.19053 237.42139,500.09752 C 237.50474,499.95821 237.35294,499.74422 237.59573,499.71711 C 237.85415,499.68805 237.86972,499.80045 238.06687,499.54827 C 238.14041,499.45433 238.58975,498.98949 238.57284,499.35924 C 238.56445,499.5415 238.11377,499.68973 238.35844,499.87279 C 238.62451,500.07202 238.30489,500.10557 238.15632,500.14262 C 237.73202,500.24864 236.74095,500.62194 237.49809,501.03779 C 237.73397,501.16737 237.98185,501.22495 238.23738,501.27769 C 238.65585,501.36472 237.92769,501.62637 238.40333,501.71783 C 238.55432,501.74675 238.59948,501.70998 238.68215,501.83506 C 238.72275,501.89639 238.7814,502.03617 238.84461,502.07509 C 239.08558,502.22333 238.99137,502.42994 239.11236,502.65454 C 239.22073,502.85572 239.53055,503.00697 239.72294,503.11944 C 239.87057,503.20573 240.02881,503.28687 240.20495,503.28687 C 240.35426,503.287 240.56987,503.23513 240.6567,503.40309 C 240.74414,503.57179 239.89171,503.84893 240.16348,504.27565 C 240.30494,504.49777 240.58658,504.61077 240.69273,504.87006 C 240.78118,505.08641 240.63436,505.5403 240.95558,505.49897 C 241.07577,505.48353 241.2285,505.41455 241.34298,505.49527 C 241.43538,505.56057 241.44867,505.62056 241.58113,505.62593 C 241.8919,505.63861 241.89042,505.42857 242.15568,505.71021 C 242.74794,506.33898 243.06421,505.37865 243.51428,505.20471 C 243.80504,505.09238 243.83444,505.14754 244.02011,505.35597 C 244.12956,505.4789 244.2986,505.79906 244.51273,505.70571 C 244.79698,505.58171 245.01024,505.74853 245.26416,505.69874 C 245.55996,505.64082 245.67216,505.67901 245.92219,505.83925 C 246.10659,505.95716 246.43507,505.80074 246.65276,505.903 C 246.74308,505.94528 246.89433,505.94179 246.95862,506.03043 C 247.00083,506.08848 246.94902,506.17122 247.07525,506.17021 C 247.23167,506.16901 247.26697,505.95293 247.35118,506.21638 C 247.38071,506.30872 247.44674,506.32858 247.38587,506.40796 C 247.30159,506.51808 247.55525,506.7002 247.60705,506.76939 C 247.77562,506.99432 248.07,506.98063 248.33017,507.00426 C 248.53464,507.02278 248.73575,507.31763 248.82788,507.47909 C 248.90552,507.61531 249.01973,507.60866 249.10691,507.71496 C 249.22816,507.86245 249.41545,508.06826 249.4796,508.24965 C 249.64595,508.71891 248.62328,509.20367 249.01598,509.77882 C 249.15844,509.98853 249.33707,510.07153 249.36217,510.36243 C 249.39841,510.78211 248.98706,510.42598 248.82419,510.52268 C 248.46787,510.73392 247.74388,510.98879 247.66584,511.45543 C 247.589,511.91382 247.36668,511.87933 247.07793,512.14822 C 246.9097,512.30464 246.4954,512.49273 246.49909,512.77625 C 246.50345,513.11781 246.48553,513.19552 246.19577,513.39643 C 245.95232,513.56506 245.7702,513.55151 245.6525,513.84818 C 245.60814,513.96004 245.68981,514.02272 245.75725,514.0921 C 245.89186,514.23067 245.75436,514.24369 245.719,514.38038 C 245.6482,514.65135 245.51594,514.91615 245.69799,515.18349 C 245.77879,515.30227 245.79523,515.39319 245.84086,515.52565 C 245.87454,515.62443 245.79509,515.72133 245.86669,515.8036 C 245.94064,515.88889 246.01668,516.00297 246.10351,516.07464 C 246.18692,516.14322 246.38548,516.11611 246.43561,516.21703 C 246.58411,516.51605 246.43789,516.64281 246.84266,516.7028 C 246.98506,516.72394 247.50304,516.93592 247.12652,516.98498 C 247.03921,517.26856 247.24254,517.63079 247.54947,517.63126 C 247.64221,517.6314 247.74421,517.58348 247.83608,517.6167 C 247.97492,517.66689 247.70569,517.83539 247.6912,517.87572 C 247.5843,518.17387 247.68691,518.53777 247.43365,518.77029 C 247.20684,518.97859 246.87595,519.11783 246.60793,519.27364 C 246.39971,519.39457 246.13451,519.63258 246.00882,519.8437 C 245.87649,520.06588 246.02996,520.68713 246.0513,520.94844 C 246.06136,521.07238 246.53466,521.61781 245.98279,521.39133 C 245.51372,521.19887 245.29074,521.36147 245.09285,521.74926 C 244.96904,521.99117 244.64405,521.9485 244.42945,522.12471 C 244.24068,522.27966 244.3396,522.79073 244.43589,522.97929 C 244.6158,523.33179 244.50441,523.38648 244.11869,523.36534 C 243.74612,523.34487 243.64889,523.90848 243.75539,524.17758 C 243.88121,524.49518 244.22378,524.57175 244.24894,524.948 C 244.27156,525.28695 244.60392,525.4235 244.88234,525.55053 C 245.06352,525.63314 245.23672,525.68615 245.39864,525.80875 C 245.50406,525.88894 245.5917,526.02576 245.73,526.04476 C 245.89065,526.06663 246.07331,525.99597 246.21389,526.10227 C 246.44843,526.27969 246.2763,526.3527 246.3116,526.57877'
          }
        ]
      }
    ];