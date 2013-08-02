var departements = function departements() {

  var width = 1200;
  var height = 800;

  /* 
   * On créait un nouvel objet path qui permet
   * de manipuler les données géographiques.
   */
  var path = d3.geo.path();

  // On définit les propriétés de la projection à utiliser
  var projection = d3.geo.conicConformal() // Lambert-93
  .center([2.454071, 47.279229]) // On centre la carte sur la France
  .scale(4500)
    .translate([width / 2, height / 2]);

  path.projection(projection); // On assigne la projection au path

  /*
   * On crée un nouvel élément svg à la racine de notre div #map,
   * définie plus haut dans le HTML
   */
  var svg = d3.select('#map').append("svg")
    .attr("width", width)
    .attr("height", height);

  /*
   * On créait un groupe SVG qui va accueillir
   * tous nos départements
   */
  var deps = svg
    .append("g")
    .attr("id", "departements");

  /*
   * On charge les données GeoJSON
   */
  d3.json('departements.json', function(req, geojson) {

    /*
     * On "bind" un élément SVG path pour chaque entrée
     * du tableau features de notre objet geojson
     */
    var features = deps
      .selectAll("path")
      .data(geojson.features);
    /*
     * On créait un ColorScale, qui va nous
     * permettre d'assigner plus tard une
     * couleur de fond à chacun de nos
     * départements
     */
    var colorScale = d3.scale.category20c();
    /*
     * Pour chaque entrée du tableau feature, on
     * créait un élément SVG path, avec les
     * propriétés suivantes
     */
    features.enter()
      .append("path")
      .attr('class', 'departement')
      .attr('fill', function(d) {
      //return colorScale(+d.properties.CODE_DEPT); 
      return colors(d.properties.CODE_DEPT);
    })
      .attr("d", path)
      .text(function(d) {
      return d.properties.CODE_DEPT;
    });
    //            .on('click', countyClickHandler);


    svg.selectAll(".subunit-label")
      .data(geojson.features)
      .enter().append("text")
      .attr("class", function(d) {
      return "subunit-label " + d.id;
    })
      .attr("transform", function(d) {
      return "translate(" + path.centroid(d) + ")";
    })
      .attr("dy", ".35em")
      .text(function(d) {
      return d.properties.CODE_DEPT;
    });

  });
}