var drawAggregatedBarChart = function(data, id) {
  var margin = {
    top: 10,
    right: 20,
    bottom: 70,
    left: 40
  },
    width = 350 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .rangeRound([height, 0]);

  var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

  var svg = d3.select("#"+id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  color.domain(d3.keys(data[0]).filter(function(key) {
    return key !== "annee";
  }));

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
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    //.text("Collecte")
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

  var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
    //return "translate(0," + i * 20 + ")";
    return "translate(0"+i * 50 +",0)";
  });

  legend.append("rect")
    .attr("x", 2)
    .attr("y", height+20)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", color);

  legend.append("text")
    .attr("x", 0)
    .attr("y", height+25)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
    return d;
  });
}