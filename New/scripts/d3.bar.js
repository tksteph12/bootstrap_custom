var drawAggregatedBarChart = function(data, id) {

  /*
    Variables globales : marges, dimensions, couleurs des barres
  */
  var margin = {
    top: 30,
    right: 30,
    bottom: 70,
    left: 50
  },
    height = 280 - margin.top - margin.bottom,

  container = jQuery("#" + id); 
  width = 350;
  if (container) {
    width = container.width();
  }
  width = width - margin.left - margin.right;


//Définition d'echelle pour les axes
  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .rangeRound([height, 0]);


  var color = d3.scale.ordinal()
    .range(["#00a7ba", "#0b6f7e", "#5d76ec", "#265e8d", "#9b7fc9", "#b93082", "#ff8c00"]);

  //Axes : vertical et horizontal
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));


  //Construction des barres
  var svg = d3.select("#" + id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  color.domain(d3.keys(data[0]).filter(function(key) {
    return key !== "annee";
  }));

  /*
    filtre des données en rajoutant un paramètre types 
  */
  console.log(data);
  data.forEach(function(d) {
    var y0 = 0;
    d.types = color.domain().map(function(name) {
      return {
        name: name,
        y0: y0,
        y1: y0 += +d[name]
      };
    });
    d.total = d.types[d.types.length - 1].y1;
  });
  console.log(data);

  x.domain(data.map(function(d) {
    return d.annee;
  }));
  y.domain([0, d3.max(data, function(d) {
      return d.total;
    })]);

    
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", .6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
  ;

  var annee = svg.selectAll(".annee")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) {
    return "translate(" + x(d.annee) + ",0)";
  });

  annee.selectAll("rect")
    .data(function(d) {
    return d.types;
  })
    .enter().append("rect")
    .transition().delay(function (d,i){ return i * 90;})
    .duration(100)
    .attr("width", x.rangeBand())
    .attr("y", function(d) {
    return y(d.y1);
  })
    .attr("height", function(d) {
    return y(d.y0) - y(d.y1);
  })
    .style("fill", function(d) {
    return color(d.name);
  });

//Construction de la legende
  var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
    return "translate(0" + i * 70 + ",30)";
  });


  legend.append("text")
    .attr("x", 17)
    .attr("y", height + 15)
    .attr("dy", ".50em")
    .style("text-anchor", "start")
    .text(function(d) {
    return d;
  });

  legend.append("rect")
    .attr("x", 0)
    .attr("y", height + 10)
    .attr("width", 15)
    .attr("height", 15)
    .attr("rx", 2)
    .attr("ry", 2)
    .style("fill", color);
}