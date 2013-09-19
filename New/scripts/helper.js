//Paramètres globaux

function setGlobalParameters() {
    var parameters = {};
    var defaultTypes = ["ND"];

    parameters.filieres = [{
            sector: "PA",
            label: "Piles et Accumulateurs",
            sourcefile: ""
        }, {
            sector: "DEE",
            label: "Dechets Équipements électriques et electroniques",
            sourcefile: ""
        }
    ];

    mapParameters = {
        year: 2010,
        typeOfdata: "collecte",
        filiere: undefined,
        types: defaultTypes, // types d'équipements ou types d' piles/Accumulateurs
        url: undefined
    }
}

//fonction d'impression de l'image svg à appeller comme action sur un bouton.
//Une fois appelée, elle ouvre un nouvel onglet avec l'image.


function printImg() {
    pwin = window.open();
    pwin.document.write("<div class = &quot;page-header&quot; > <h1>Cartographie des collectes de déchets dans les départements de france</h1></div>");
    pwin.document.write($("#map").html());
    pwin.document.write("<div class = &quot;page-header&quot; > <h1> Filière " + mapParameters.filiere + "</h1></div>");
    pwin.document.write("<div class = &quot;page-header&quot; > <h1> Type d'équipements :" + mapParameters.types.toString() + " </h1></div>");
    pwin.focus();
    pwin.document.close();

    pwin.onload = function() {
        window.print();
    }
}

function enable_search_ahead() {
    var source = getDepartments();

    $("#nav-search-input").typeahead({
        source: source,
        updater: function(a) {
            $("#nav-search-input").focus();
            console.log(a)
            set_map_focus_on(a);
            return a
        }

    })
}

//set focus on dept on the map

function set_map_focus_on(dept) {
    var map = $('#map');
    if (map.html === "") {
        throw "Empty map"
    }

    $('div[id*="map"]').each(function(i) {
        $('svg').each(function(i) {
            $(this).find('path[dept="' + dept + '"]').each(function(index) {
                //this.setAttribute('class','ademe-search');
                var path = d3.select(this);
                var style = path.style('fill');
                //path.style("fill", 'black');

                var codeDept = this.getAttribute('code');
                var title = dept + ' ( ' + codeDept + ' )  Evolution des collectes';
                var text = "Types d'équipement collectés:" + mapParameters.types.toString();
                var data = {
                    title: title,
                    text: text
                }
                $('#bar-info').html(Handlebars.templates.tabInfo(data));

                var donnee_hist = {};
                donnee_hist.types = mapParameters.types;
                donnee_hist.filiere = mapParameters.filiere;
                donnee_hist.codeDept = codeDept;
                donnee_hist.departement = dept;
                donnee_hist.sourcefile = mapParameters.url;
                title += " Evolution des collectes";
                data = {
                    title: title,
                    text: text
                }
                plotHistory(donnee_hist, "id-Piechart");
                // path.style("fill", style);
            });

        });
    });

}


function general_things() {
    var PLAY_PAUSE = 1;

    
    $('.filterPanel').mouseover(function() {
        $('.unselectable-removed').toggleClass("closed");
        $('.extendedFilters').toggleClass("closed");
    });

    $('.filterPanel').mouseout(function() {

        $('.extendedFilters').toggleClass("closed");
        $('.unselectable-removed').toggleClass("closed");

    });

    $('#button-collecte').on("click", function() {

        var myClass = $(this).attr("class");
        if (myClass.indexOf("choosed") != -1) {

        } else {
            $(this).toggleClass("choosed");
            $('#button-production').removeClass("choosed");
            mapParameters.typeOfdata = "collecte";

            if((mapParameters.filiere!=undefined)&&(mapParameters.filiere!=="Filières")){
                console.debug(mapParameters.filiere + "sfsdfsdf")
                updateMap();
            }
        }

    });

    $('#button-production').on("click", function() {


        var myClass = $(this).attr("class");
        if (myClass.indexOf("choosed") != -1) {

        } else {
            $(this).toggleClass("choosed");
            $('#button-collecte').removeClass("choosed");
            mapParameters.typeOfdata = "production";
            if(mapParameters.filiere!=="Filières"){
            updateMap(); }
        }

    });


    $("#select-filiere").change(function(event) {
        var prodClass = $("#button-production").attr("class");
        var colClass = $("#button-collecte").attr("class");

        if ((prodClass.indexOf("choosed") == -1) && (colClass.indexOf("choosed") == -1)) {
            alert("Choisir le type de données à afficher");
            //revenir ici à type filière
            jQuery('#select-filiere').val(parameters.filieres[0].sector);
            return
        }


        var filiere = $('#select-filiere option:selected').text();
        if (filiere === "Filières") {
            $("#choix-materiels").hide();
        } else {
            $("#choix-materiels").show();
            mapParameters.filiere = filiere;
            mapParameters.url = getSourceFile(filiere);
            fetchCheckboxOptions(filiere);
            updateMap();
        }
    });

    var change;
    playing = function() {
        change = window.setInterval(function() {
            mapParameters.year = mapParameters.year + 1;
            if (mapParameters.year == 2013) {
                mapParameters.year = 2006;
            }
            $("#id-slider").slider('value', mapParameters.year);
            console.debug(mapParameters.year);
            $('#map').updateColors({}, 'map');
        }, 4000);
    }

    $("#play-button").click(function() {
        var myClass = $("#innerPlay-button").attr("class");
        if(myClass==='paused'){
            $("#innerPlay-button").removeClass("paused");
            $("#innerPlay-button").addClass("playing");
        }else if(myClass=='playing'){
            $("#innerPlay-button").removeClass("playing");
            $("#innerPlay-button").addClass("paused");
        }

        if (PLAY_PAUSE == 1) {
            //$(this).removeClass("icon-play").addClass("icon-pause");
            PLAY_PAUSE = 0;
            playing();
        } else if (PLAY_PAUSE == 0) {
            //$(this).removeClass("icon-pause").addClass("icon-play");
            PLAY_PAUSE = 1;
            clearInterval(change);
        }
    });


    //event on clik after editing the checkboxes elements update the map after this
    $(document).mouseup(function(e) {
        
        var container = $(".dropdown-checkbox");
        var thisClass = container.attr("class");
        if (thisClass) {
            if (thisClass.indexOf("open") != -1) {
                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    var checkedList = [];
                    $('#choix-materiels input:checked').each(function() {
                        checkedList.push(this.nextSibling.innerHTML);
                    });
                    if (checkedList.length !== 0) {
                        delete mapParameters.types;
                    }
                    mapParameters.types = checkedList;
                    //
                    $('#map').updateColors({}, 'map');

                    console.debug(mapParameters.types);
                }
            }
        };
    });

    // choix du type de données à afficher : collecte ou production

    var initialValue = 2010,
        minValue = 2006,
        maxValue = 2013,
        step = 1;
    //initializing the select boxes
    $("#id-slider").slider({
        //orientation: "vertical",
        range: "min",
        value: initialValue,
        min: minValue,
        max: maxValue,
        step: step,

        slide: function(event, ui) {
            /*handle = handle || $(".ui-slider-handle", this);
            valueDisplay.text(ui.value || initialValue)
              .css(handle.position());*/
            //$("#id-slider").find(".ui-slider-handle").text(ui.value);
            mapParameters.year = ui.value;
            $('#map').updateColors({}, 'map');
            $(this).find('.ui-slider-handle').html('<div class="center-hand"> </div>');
            $(this).find('.ui-slider-handle').html('<div class="value-label"> <div class="value-text">' + ui.value + '</div></div>');
            //$(".slider-wrapper").html('<div class="min-value-label"> <div class="value-text">'+ui.value+'</div></div>'); 
            //$(".slider-wrapper").html('<div class="max-value-label"> <div class="value-text">'+ui.value+'</div></div>'); 

        },
        create: function(event, ui) {
            var $slider = $(event.target);
            var max = $slider.slider("option", "max");
            var min = $slider.slider("option", "min");
            console.debug(min);
            var spacing = 100 / (max - min);
            spacing = 100;

            $slider.find('.ui-slider-tick-mark').remove();
            for (var i = 0; i < 2; i++) {
                $('<span class="ui-slider-tick-mark">' + (min + i * (max - min)) + '</span>').css('left', (spacing * i) + '%').appendTo($slider);
            }
        }
    });
}

// récupère les types de la filière passée en paramètre
//faire une requête ajax qui renvoie les valeurs des types dans un tableau

function fetchCheckboxOptions(filiere) {

    sourcefile = mapParameters.url;
    $.ajax({
        type: "GET",
        url: sourcefile,
        dataType: "text",
        success: function(data, filiere) {
            loadcheckboxOptions(data, filiere);
        }
    });
}


function loadcheckboxOptions(data, filiere) {

    var tab = [];
    var aux = [];
    var allTextLines = data.split(/\r\n|\n/);
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

    var i = 0;
    for (l in lines) {
        var line = lines[l];
        var flux = line["Flux"];
        if (flux === undefined) {
            flux = line["Type_pile"]
        }
        var pos = aux.indexOf(flux);
        if (pos === -1) {
            i++
            aux.push(flux);
            tab.push({
                id: i,
                label: flux,
                isChecked: true
            });
        }
    }
    mapParameters.types = aux;
    delete aux;

    if ($('#choix-materiels').html() == "") {
        $('#choix-materiels').dropdownCheckbox({
            data: tab,
            autosearch: false,
            title: "My Dropdown Checkbox",
            hideHeader: true,
            templateButton: '<div class="dropdown-checkbox-toggle center" data-toggle="dropdown">Type de matériel</div>'
        });
    } else {
        var IDs = [];

        $("#choix-materiels").find("input").each(function(i) {
            IDs.push(++i);
        });
        $("#choix-materiels").dropdownCheckbox("remove", IDs);
        $("#choix-materiels").dropdownCheckbox("append", tab);

    }
    return tab;
}


//remplir le menu de selection du choix de filières

function fillSectorSelections() {
    var select = jQuery('#select-filiere')[0];
    if (typeof select === undefined) {
        select = document.getElementById("select-filiere");
    }

    select.options.length = 0;

    for (index in parameters.filieres) {
        select.options[select.options.length] = new Option(parameters.filieres[index].sector, index);
    }
}

function updateMap() { // produced or collected data

    if ($('#map')) {
        $("#map").html("");
    }
    if (mapParameters.typeOfdata === "production") {
        alert("Données non disponible");
        return
    }
    console.log(parameters.filieres[0].sourcefile);
    $('#map').drawMap(parameters.filieres[0].sourcefile, 'map');
}

function add_browser_detection(c) {
    if (!c.browser) {
        var a, b;
        c.uaMatch = function(e) {
            e = e.toLowerCase();
            var d = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
            return {
                browser: d[1] || "",
                version: d[2] || "0"
            }
        };
        a = c.uaMatch(navigator.userAgent);
        b = {};
        if (a.browser) {
            b[a.browser] = true;
            b.version = a.version
        }
        if (b.chrome) {
            b.webkit = true
        } else {
            if (b.webkit) {
                b.safari = true
            }
        }
        c.browser = b
    }
};

function getSourceFile(sector) {
    for (var i = 0; i < parameters.filieres.length; i++) {
        if (parameters.filieres[i].sector === sector) {
            return parameters.filieres[i].sourcefile;
        }
    }
    throw new Error("Unknown Filiere");
}

function getDepartments() {
    var departements = [];
    if (typeof geodatas === 'undefined') {
        return departements;
    }
    for (var i = 0; i < geodatas.length; i++) {
        if (geodatas[i].hasOwnProperty('dpts')) {
            var region = geodatas[i].dpts;
            for (var j = 0; j < region.length; j++) {
                if (region[j].hasOwnProperty('dept')) {
                    departements.push(region[j].dept);
                }
            }
        }
    }
    return departements;
}

//************************Variables globales************************************************

var parameters = {};

parameters.filieres = [{
        sector: "Filières",
        label: "Choix des filières",
        sourcefile: "deee.csv"
    }, {
        sector: "PA",
        label: "Piles et Accumulateurs",
        sourcefile: "dec_pa_collecte.csv"
    }, {
        sector: "DEE",
        label: "Dechets Équipements électriques et electroniques",
        sourcefile: "dec_deee_collecte_men.csv"
    }
];

var mapParameters = {
    year: undefined,
    typeOfdata: "collecte", //default
    filiere: undefined, //default
    types: [], // types d'équipements ou types d' piles/Accumulateurs
    url: "dec_pa_collecte.csv"
}