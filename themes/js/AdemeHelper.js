jQuery(function() {
    setGlobalParameters(); // initialisatio des paramètres par défaut
    handle_side_menu();
    fillSectorSelections();
    enable_search_ahead();
    add_browser_detection(jQuery);
    general_things();
    updateMap("");

    $(document).off("click.dropdown-menu")
});

//Paramètres globaux

function setGlobalParameters(){
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
        filiere: "PA",
        types: defaultTypes, // types d'équipements ou types d' piles/Accumulateurs
        url: undefined
    }
}

function handle_side_menu() {
    $("#menu-toggler").on("click", function() {
        $("#sidebar").toggleClass("display");
        $(this).toggleClass("display");
        return false
    });
    var a = false;

    $(".nav-list").on("click", function(d) {
        if (a) {
            return
        }
        var c = $(d.target).closest(".dropdown-toggle");
        if (c && c.length > 0) {
            var b = c.next().get(0);
            if (!$(b).is(":visible")) {
                $(".open > .submenu").each(function() {
                    if (this != b && !$(this.parentNode).hasClass("active")) {
                        $(this).slideUp(200).parent().removeClass("open")
                    }
                })
            }
            $(b).slideToggle(200).parent().toggleClass("open");
            return false
        }
    })

}
//fonction d'impression de l'image svg à appeller comme action sur un bouton.
//Une fois appelée, elle ouvre un nouvel onglet avec l'image.


function printImg() {
    pwin = window.open();
    pwin.document.write("<div class = &quot;page-header&quot; > <h1>Cartographie des collectes de déchets dans les départements de france</h1></div>");
    pwin.document.write($("#mapcontainer").html());
    pwin.document.write("<div class = &quot;page-header&quot; > <h1> Filière "+mapParameters.filiere+"</h1></div>");
    pwin.document.write("<div class = &quot;page-header&quot; > <h1> Type d'équipements :" +mapParameters.types.toString() + " </h1></div>");
    pwin.focus();
    pwin.document.close();
    
    pwin.onload = function() {
        window.print();
    }
}

function enable_search_ahead() {
    $("#nav-search-input").typeahead({
        source: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Dakota", "North Carolina", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
        updater: function(a) {
            $("#nav-search-input").focus();
            return a
        }
    })
}



function general_things() {
    var PLAY_PAUSE = 1;

    $("#sliderbar").hide();
    $('.ace-nav [class*="icon-animated-"]').closest("a").on("click", function() {
        var b = $(this).find('[class*="icon-animated-"]').eq(0);
        var a = b.attr("class").match(/icon\-animated\-([\d\w]+)/);
        b.removeClass(a[0]);
        $(this).off("click")
    });
    $("#ace-settings-btn").on("click", function() {
        $(this).toggleClass("open");
        $("#ace-settings-box").toggleClass("open")
    });
    $("#ace-settings-procuced").removeAttr("checked").on("click", function() {
        if (this.checked) {
            $("#ace-settings-collect").removeAttr("checked");
            mapParameters.typeOfdata = "production";
            updateMap("produced");
        }
    });
    $("#ace-settings-collect").removeAttr("checked").on("click", function() {
        if (this.checked) {
            $("#ace-settings-procuced").removeAttr("checked");
            mapParameters.typeOfdata = "collecte";
            updateMap("collected");
        }
    });
    $("#btn-scroll-up").on("click", function() {
        var a = Math.max(100, parseInt($("html").scrollTop() / 3));
        $("html,body").animate({
            scrollTop: 0
        }, a);
        return false
    });

    $("#sectorSelector").change(function(event) {

        var filiere = $('#sectorSelector option:selected').text();
        if (filiere === "Filières") {
            $("#changingCheckboxes").empty();
            //mapParameters.url = getSourceFile("DEE");
            $("#sliderbar").hide();
        } else {
            mapParameters.filiere = filiere;
            mapParameters.url = getSourceFile(filiere);
            fetchCheckboxOptions(filiere);
            updateMap();
            $("#sliderbar").show();
        }
    });

    var change;
    playing = function() {
        change = window.setInterval(function() {
            mapParameters.year = mapParameters.year + 1;
            if (mapParameters.year == 2013) {
                mapParameters.year = 2006;
            }
            $("#yearSlider").slider("value", mapParameters.year);
            $("#yearSlider").find(".ui-slider-handle").text(mapParameters.year);
            $('#mapcontainer').updateColors({}, 'mapcontainer');
        }, 4000);
    }

    $("#play").click(function() {
        if (PLAY_PAUSE == 1) {
            $(this).removeClass("icon-play").addClass("icon-pause");
            PLAY_PAUSE = 0;
            playing();
        } else if (PLAY_PAUSE == 0) {
            $(this).removeClass("icon-pause").addClass("icon-play");
            PLAY_PAUSE = 1;
            clearInterval(change);
        }
    });

    //Retirer le boutton test

    $('#test').click(function() {
        var checkedList = [];
        $('#changingCheckboxes input:checked').each(function() {
            checkedList.push(this.nextSibling.innerHTML);
        });
        if (checkedList.length !== 0) {
            delete mapParameters.types;
        }
        mapParameters.types = checkedList;
        //
        $('#mapcontainer').updateColors({}, 'mapcontainer');

    });

    // choix du type de données à afficher : collecte ou production


    //initializing the select boxes
    $("#yearSlider").slider({
        //orientation: "vertical",
        value: 2010,
        min: 2006,
        max: 2012,
        step: 1,

        slide: function(event, ui) {
            $("#amount").val("$" + ui.value);
            $("#yearSlider").find(".ui-slider-handle").text(ui.value);
            mapParameters.year = ui.value;
            $('#mapcontainer').updateColors({}, 'mapcontainer');
            //updateMap();
        }
        //        
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

    //$('#changingCheckboxes').html("");
    if ($('#changingCheckboxes').html() == "") {
        $('#changingCheckboxes').dropdownCheckbox({
            data: tab,
            autosearch: true,
            title: "My Dropdown Checkbox",
            hideHeader: true,
            templateButton: '<a class="dropdown-checkbox-toggle" data-toggle="dropdown" href="#">Type de matériel<i class="caret"></i></a>'
        });
    } else {
        var IDs = [];

        $("#changingCheckboxes").find("input").each(function(i) {
            IDs.push(++i);
        });
        $("#changingCheckboxes").dropdownCheckbox("remove", IDs);
        $("#changingCheckboxes").dropdownCheckbox("append", tab);

    }
    return tab;
}


//remplir le menu de selection du choix de filières

function fillSectorSelections() {
    var select = document.getElementById("sectorSelector");
    select.options.length = 0;

    for (index in parameters.filieres) {
        select.options[select.options.length] = new Option(parameters.filieres[index].sector, index);
    }
}

function updateMap() { // produced or collected data

    if ($('mapcontainer')) {
        $("#mapcontainer").html("");
    }
    if (mapParameters.typeOfdata === "production") {
        alert("Données non disponible");
        return
    }
    console.log(parameters.filieres[0].sourcefile);
    $('#mapcontainer').drawMap(parameters.filieres[0].sourcefile, 'mapcontainer');
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