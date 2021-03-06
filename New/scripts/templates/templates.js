(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['header'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<header>\r\n				<div class=\"content-center\">\r\n					<!--<div class=\"clearfix\"><div class=\"header-title\"><div><span>ADEME</span><span> DECHETS</span></div><div>Carte interactive dans les départements français</div></div></div>-->\r\n					<!--<div id='nav-search'>\r\n						<form class=\"form-search\">\r\n							<span class=\"input-icon\">\r\n								<input type=\"text\" placeholder=\"Search ...\" class=\"input-small search-query\" id=\"nav-search-input\" autocomplete=\"off\" />\r\n								<i class=\"icon-search\" id=\"nav-search-icon\"></i>\r\n							</span>\r\n						</form>\r\n					</div>-->\r\n				</div>\r\n			</header>";
  });
templates['filterPanel'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  buffer += "				<div class = \"container\">\r\n					<div class='basicFilters'>\r\n						<div class=\"clearfix\">\r\n							\r\n							<div class=\"collectFilter filterTabs\">\r\n								<div class=\" filterTabs-circle one\" ><!--\r\n									<div class=\"circle\"><img alt=\"1\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								\r\n								<div id='button-production' class=\"filterTabs first production\"></div>\r\n								<div class=\"separator\"></div>\r\n								<div id='button-collecte' class=\"filterTabs first collecte\"></div>\r\n							</div>\r\n							<div class=\"spseparator\"></div>\r\n\r\n							<div class=\"filterTabs options\">\r\n								<div class=\" filterTabs-circle two\" >\r\n									<!--<div class=\"circle\"><img alt=\"2\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								<div class=\"filterTabs second\">\r\n									<div class=\"choix-filieres\">\r\n										<!--<select id='select-filiere'></select>-->\r\n									<div class='selectBox'>\r\n							            <input type=\"hidden\" value=\"3\" class=\"price_values\"/>\r\n							                <span class='selected'></span>\r\n							                <span class='selectArrow'></span>\r\n							                <ul class=\"selectOptions\">Filieres\r\n							                    \r\n							                </ul>\r\n									</div>										\r\n						            </div>\r\n								</div>\r\n							</div>\r\n							<div class=\"spseparator\"></div>\r\n							<div class=\"filterTabs checkbox\">\r\n								<div class=\" filterTabs-circle three\" ><!--\r\n									<div class=\"circle\"><img alt=\"3\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								<div class=\"filterTabs second\">\r\n									<div class=\"choix-filieres\">\r\n										<div id='choix-materiels'></div>\r\n									</div>\r\n								</div>\r\n							</div>\r\n						</div>\r\n					</div>\r\n				</div>\r\n				"
    + "\r\n				<div class='unselectable-removed closed'>\r\n					<div class='extendedFilters closed'> <!--  add class \"extendedFilters closed\" to close the pane-->\r\n							<div>\r\n								<div class=\"filterTabs\">\r\n									\r\n								</div>\r\n								\r\n								<div class=\"separator\"></div>\r\n\r\n								<div class=\"filterTabs third\">\r\n									<div id='play-button'><div id='innerPlay-button' class=\"paused\"></div></div>\r\n									<div class=\"slider-wrapper\">\r\n										<div id='id-slider'>\r\n											<!-- <div id='id-handle' class=\"custom-slider-handle\"></div>-->\r\n										</div>\r\n									</div>\r\n									\r\n								</div>\r\n							</div>\r\n					</div>\r\n				</div>";
  return buffer;
  });
templates['container'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"left\">\r\n	<div id='map' class=\"map-container\"></div>\r\n</div>\r\n<div class=\"right\">\r\n	<div id='pie-info' class=\"pie-container\"></div>\r\n	<div id='bar-info' class=\"pie-container\"></div>\r\n</div>";
  });
templates['footer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<footer  class=\"clearfix\">\r\n	<div class=\"\">";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\r\n</footer>";
  return buffer;
  });
templates['pieInfo'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\r\n	<div class=\"info-title\">\r\n		<h>\r\n			 ";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n		</h>\r\n	</div>\r\n	<div id='id-piechart'>\r\n	</div>\r\n	<div class=\"info-footer\">";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\r\n</div>\r\n";
  return buffer;
  });
templates['barInfo'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\r\n	<div class=\"info-title\">\r\n		<h>\r\n			 ";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n		</h>\r\n	</div>\r\n	<div id='id-barchart'></div>\r\n	<!-- <div class=\"info-footer\">";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div> -->\r\n</div>\r\n";
  return buffer;
  });
templates['loader'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!--<img src=\"";
  if (stack1 = helpers.img) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.img; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"ajax-loader\"/>-->\r\n<div class=\"ajax-loader\"></div>";
  return buffer;
  });
})();