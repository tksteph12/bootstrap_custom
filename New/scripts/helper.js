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


//ecouteurs sur la liste déroulante de choix des filières
function enableSelectBoxes() {
    jQuery('div.selectBox').each(function() {
        jQuery(this).children('span.selected').html(jQuery(this).children('ul.selectOptions').children('li.selectOption:first').html());
        jQuery('input.price_values').attr('value', jQuery(this).children('ul.selectOptions').children('li.selectOption:first').attr('data-value'));

        jQuery(this).children('span.selected,span.selectArrow').click(function() {

            var prodClass = jQuery("#button-production").attr("class");
            var colClass = jQuery("#button-collecte").attr("class");

            if ((prodClass.indexOf("choosed") == -1) && (colClass.indexOf("choosed") == -1)) {
                alert("Choisir le type de données à afficher");
                //revenir ici à type filière
                jQuery('#select-filiere').val(parameters.filieres[0].sector);
                return
            }
            jQuery('span.selected').toggleClass("highlighted");
            if (jQuery(this).parent().children('ul.selectOptions').css('display') == 'none') {
                jQuery(this).parent().children('ul.selectOptions').css('display', 'block');
            } else {
                jQuery(this).parent().children('ul.selectOptions').css('display', 'none');
            }

        });

        jQuery(this).find('li.selectOption').click(function() {
            jQuery('span.selected').toggleClass("highlighted");
            var filiere = jQuery(this).html();
            var myClass = jQuery(this).attr("class");
            jQuery(this).parent().css('display', 'none');
            jQuery('input.price_values').attr('value', jQuery(this).attr('data-value'));
            jQuery(this).parent().siblings('span.selected').html(filiere);
            mapParameters.filiere = filiere;

            if ((filiere === parameters.filieres[0].sector)||(myClass.indexOf('selected')!==-1)) {
                jQuery("#choix-materiels").hide();
            } else {
                jQuery("#choix-materiels").show();

                mapParameters.url = getSourceFile(filiere);
                fetchCheckboxOptions(filiere);
                updateMap();
                jQuery(this).siblings().removeClass("selected");
                jQuery(this).addClass("selected");
            }
        });
    });
}


// Ecouteurs globaux sur toute la page
function general_things() {
    var PLAY_PAUSE = 1;


    jQuery('.filterPanel').mouseover(function() {
        jQuery('.unselectable-removed').removeClass("closed");
        jQuery('.extendedFilters').removeClass("closed");
    });

    /*jQuery('.filterPanel').mouseout(function() {

        jQuery('.extendedFilters').toggleClass("closed");
        jQuery('.unselectable-removed').toggleClass("closed");

    });*/

    jQuery('#button-collecte').on("click", function() {
        var myClass = jQuery(this).attr("class");
        if (myClass.indexOf("choosed") != -1) {

        } else {
            jQuery(this).toggleClass("choosed");
            jQuery('#button-production').removeClass("choosed");
            mapParameters.typeOfdata = "collecte";

            if ((mapParameters.filiere != undefined) && (mapParameters.filiere !== parameters.filieres[0].sector)) {
                updateMap();
            }
        }
    });

    jQuery('#button-production').on("click", function() {
        var myClass = jQuery(this).attr("class");
        if (myClass.indexOf("choosed") != -1) {

        } else {
            jQuery(this).toggleClass("choosed");
            jQuery('#button-collecte').removeClass("choosed");
            mapParameters.typeOfdata = "production";
            if (mapParameters.filiere !== parameters.filieres[0].sector) {
                updateMap();
            }
        }
    });

    var change;
    playing = function() {
        change = window.setInterval(function() {
            mapParameters.year = mapParameters.year + 1;
            if (mapParameters.year == 2013) {
                mapParameters.year = 2006;
            }
            jQuery("#id-slider").slider('value', mapParameters.year);
            jQuery("#id-slider").find('.ui-slider-handle').html('<div class="value-label"> <div class="value-text">' + mapParameters.year + '</div></div>');
            jQuery('#map').updateColors('map');
        }, 4000);
    }


    jQuery("#play-button").click(function() {
        var filiere = jQuery('.selectBox.selected').html();
        if ((mapParameters.filiere === undefined) || (mapParameters.filiere == parameters.filieres[0].sector)) {
            alert("Choisir une filiere pour continuer");
            return
        }
        var myClass = jQuery("#innerPlay-button").attr("class");
        if (myClass === 'paused') {
            jQuery("#innerPlay-button").removeClass("paused");
            jQuery("#innerPlay-button").addClass("playing");
        } else if (myClass == 'playing') {
            jQuery("#innerPlay-button").removeClass("playing");
            jQuery("#innerPlay-button").addClass("paused");
        }

        if (PLAY_PAUSE == 1) {
            PLAY_PAUSE = 0;
            playing();
        } else if (PLAY_PAUSE == 0) {
            PLAY_PAUSE = 1;
            clearInterval(change);
        }
    });

    
    //evenement de mise à jour de la carte après choix des types de matériels sur les cases à cocher
    jQuery(document).mouseup(function(e) {

        var container = jQuery(".dropdown-checkbox");
        var thisClass = container.attr("class");
        if (thisClass) {
            if (thisClass.indexOf("open") != -1) {
                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    var checkedList = [];
                    jQuery('#choix-materiels input:checked').each(function() {
                        checkedList.push(this.nextSibling.innerHTML);
                    });
                    if (checkedList.length !== 0) {
                        delete mapParameters.types;
                    }
                    mapParameters.types = checkedList;
                    //
                    jQuery('#map').updateColors('map');

                    console.debug(mapParameters.types);
                }
            }
        };
    });


    /*
        Slider pour naviguer entre les années : départ 2006 et fin:2010
    */
    var initialValue = 2010,
        minValue = 2006,
        maxValue = 2013,
        step = 1;
    //initializing the select boxes
    jQuery("#id-slider").slider({
        //orientation: "vertical",
        range: "min",
        value: initialValue,
        min: minValue,
        max: maxValue,
        step: step,

        slide: function(event, ui) {
            mapParameters.year = ui.value;
            jQuery('#map').updateColors('map');
            jQuery(this).find('.ui-slider-handle').html('<div class="center-hand"> </div>');
            jQuery(this).find('.ui-slider-handle').html('<div class="value-label"> <div class="value-text">' + ui.value + '</div></div>');
        },
        create: function(event, ui) {
            var $slider = jQuery(event.target);
            var max = $slider.slider("option", "max");
            var min = $slider.slider("option", "min");
            console.debug(min);
            var spacing = 100 / (max - min);
            spacing = 100;

            $slider.find('.ui-slider-tick-mark').remove();
            for (var i = 0; i < 2; i++) {
                jQuery('<span class="ui-slider-tick-mark">' + (min + i * (max - min)) + '</span>').css('left', (spacing * i) + '%').appendTo($slider);
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

// charge les types de matériels dans les cases à cocher
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

    if (jQuery('#choix-materiels').html() == "") {
        jQuery('#choix-materiels').dropdownCheckbox({
            data: tab,
            autosearch: false,
            title: "My Dropdown Checkbox",
            hideHeader: true,
            templateButton: '<div class="dropdown-checkbox-toggle center" data-toggle="dropdown"><span>Type de matériel</span></div>'
        });
    } else {
        var IDs = [];

        jQuery("#choix-materiels").find("input").each(function(i) {
            IDs.push(++i);
        });
        jQuery("#choix-materiels").dropdownCheckbox("remove", IDs);
        jQuery("#choix-materiels").dropdownCheckbox("append", tab);

    }
    return tab;
}


//remplir le menu de selection du choix de filières
function fillSectorSelections() {

    var select = jQuery('.selectOptions');

    select.empty();
    for (index in parameters.filieres) {
        select.append('<li class="selectOption" data-value=' + parameters.filieres[index].label + '>' + parameters.filieres[index].sector + '</li>');
    }
}

/*
*/
function updateMap() { 

    if (jQuery('#map')) {
        jQuery("#map").html("");
    }
    if (mapParameters.typeOfdata === "production") {
        //mettre le gif ici pour chargement en cours

        var img_url = "img/loading-gif-animation.gif"
        jQuery('#map').html(Handlebars.templates.loader({img:img_url}));
        /*alert("Données non disponible");*/
        return
    }

    jQuery('#map').drawMap('map');
}

/*
    Detection du  navigateur : non utilisé pour l'instant
*/
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


/*
    @param : sector, la filière
    @return: l'url de la filière correspondante
*/
function getSourceFile(sector) {
    for (var i = 0; i < parameters.filieres.length; i++) {
        if (parameters.filieres[i].sector === sector) {
            return parameters.filieres[i].sourcefile;
        }
    }
    throw new Error("Unknown Filiere");
}

/*
    @return: Liste des départements
    @param: geodatas : variable contenant les départements
*/
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
function getJson() {
    jQuery.ajax({
        url: 'map.json',
        dataType: 'json',
        success: function(data) {
            jQuery.each(data, function(key, val) {
                geodatas.push(val);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('ERROR', textStatus, errorThrown);
        }
    });
    console.log(geodatas);
}