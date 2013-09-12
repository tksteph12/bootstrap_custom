(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['header'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<header>\r\n				<div class=\"content-center\">\r\n					<!--<div class=\"clearfix\"><div class=\"header-title\"><div><span>ADEME</span><span> DECHETS</span></div><div>Carte interactive dans les départements français</div></div></div>-->\r\n					<div id='nav-search'>\r\n						<form class=\"form-search\">\r\n							<span class=\"input-icon\">\r\n								<input type=\"text\" placeholder=\"Search ...\" class=\"input-small search-query\" id=\"nav-search-input\" autocomplete=\"off\" />\r\n								<i class=\"icon-search\" id=\"nav-search-icon\"></i>\r\n							</span>\r\n						</form></div>\r\n				</div>\r\n			</header>";
  });
templates['filterPanel'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class = \"container\">\r\n					<div class='basicFilters'>\r\n						<div class=\"clearfix\">\r\n							\r\n							<div class=\"collectFilter filterTabs\">\r\n								<div class=\" filterTabs-cirle one\" ><!--\r\n									<div class=\"circle\"><img alt=\"1\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n\r\n								<div id='button-production' class=\"filterTabs first production\"></div>\r\n								<div class=\"separator\"></div>\r\n								<div id='button-collecte' class=\"filterTabs first collecte\"></div>\r\n							</div>\r\n							<div class=\"separator\"></div>\r\n\r\n							<div class=\"filterTabs\">\r\n								<div class=\" filterTabs-cirle two\" >\r\n									<!--<div class=\"circle\"><img alt=\"2\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								<div class=\"filterTabs second\">\r\n									<div class=\"choix-filieres\">\r\n									<select id = \"select-filiere\">\r\n										<option>Option 1</option>\r\n										<option>Option2</option>\r\n						            </select>																	\r\n						            </div>\r\n								</div>\r\n							</div>\r\n							<div class=\"separator\"></div>\r\n							<div class=\"filterTabs\">\r\n								<div class=\" filterTabs-cirle three\" ><!--\r\n									<div class=\"circle\"><img alt=\"3\" src=\"\">\r\n										</img>\r\n									</div>-->\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								<div class=\"filterTabs second\">Second select box</div>\r\n							</div>\r\n						</div>\r\n					</div>\r\n				</div>\r\n				<div class='extendedFilters closed'> <!--  add class \"extendedFilters closed\" to close the pane-->\r\n						<div>\r\n							<div class=\"filterTabs\">\r\n								<div class=\" filterTabs-cirle\" >\r\n									<div class=\"circle\"><img alt=\"4\" src=\"\">\r\n										</img>\r\n									</div>\r\n								</div>\r\n								<div class=\"separator\"></div>\r\n								<div class=\"filterTabs second\">Faites Défiler ou jouez</div>\r\n							</div>\r\n							\r\n							<div class=\"separator\"></div>\r\n\r\n							<div class=\"filterTabs third\">\r\n								<div>HERE SLIDER</div>\r\n							</div>\r\n						</div>\r\n				</div>\r\n\r\n				<div class=\"\">\r\n				<div class=\"filterBtn closed\"></div>\r\n			</div>";
  });
templates['container'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"left\">\r\n	<div id='map' class=\"map-container\"></div>\r\n</div>\r\n<div class=\"right\">\r\n	<div id='pie-info' class=\"pie-container\"></div>\r\n	<div id='bar-info' class=\"pie-container\"></div>\r\n</div>";
  });
templates['footer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<footer  class=\"clearfix\">\r\n			<div class=\"\"></div>\r\n		</footer>";
  });
})();