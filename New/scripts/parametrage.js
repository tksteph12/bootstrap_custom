//************************Variables globales************************************************
/*
    Paramétrage de l'appllication:
    Rajouter chaque filière constituée ainsi;

        {
            Sector: Represente l'acronyme de la filière
            label: Le nom de la filière;
            sourcefile: Le fichier de collecte (doit avoir la même structure que ceux de dee et pa)            
        }

*/
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
        sector: "DEEE",
        label: "Dechets Équipements électriques et electroniques",
        sourcefile: "dec_deee_collecte_men.csv"
    }
];

var mapParameters = {
    year: undefined,
    typeOfdata: "collecte", //default
    filiere: undefined, //default
    types: [], // types d'équipements ou types d' piles/Accumulateurs
    url: ".csv"
}