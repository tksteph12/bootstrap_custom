(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['maincontent'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n				<div id=\"breadcrumbs\">\r\n					<ul class=\"breadcrumb\">\r\n						<li>\r\n							<i class=\"icon-home\"></i>\r\n							<a href=\"#\">Home</a>\r\n\r\n							<span class=\"divider\">\r\n								<i class=\"icon-angle-right\"></i>\r\n							</span>\r\n						</li>\r\n						<li class=\"active\">Dashboard</li>\r\n					</ul><!--.breadcrumb-->\r\n\r\n					<div id=\"nav-search\">\r\n						<form class=\"form-search\">\r\n							<span class=\"input-icon\">\r\n								<input type=\"text\" placeholder=\"Search ...\" class=\"input-small search-query\" id=\"nav-search-input\" autocomplete=\"off\" />\r\n								<i class=\"icon-search\" id=\"nav-search-icon\"></i>\r\n							</span>\r\n						</form>\r\n					</div><!--#nav-search-->\r\n				</div>\r\n\r\n				<div id=\"page-content\" class=\"clearfix\">\r\n					<div class=\"page-header position-relative\">\r\n						<h1>\r\n							Cartographie des collectes de déchets dans les départements de france\r\n						</h1>\r\n					</div><!--/.page-header-->\r\n\r\n					<div class=\"row-fluid\">\r\n						<!--PAGE CONTENT BEGINS HERE-->\r\n\r\n						\r\n						<div class=\"space-6\"></div>\r\n\r\n						<div class=\"row-fluid\">\r\n							<!-- Main container for the map-->\r\n							<div  class=\"span8 \">\r\n								<div class = \"top-setting-bar\">\r\n									<div class = \"settingscheckbox\">\r\n										<div>\r\n										\r\n											<div>\r\n												<input type=\"radio\" name = \"affichage\" class=\"ace-checkbox-2\" id=\"ace-settings-procuced\" />\r\n												<label class=\"lbl\" for=\"ace-settings-procuced\"> Production</label>\r\n											</div>\r\n											<div>\r\n												<input type=\"radio\" name = \"affichage\" class=\"ace-checkbox-2\" id=\"ace-settings-collect\" />\r\n												<label class=\"lbl\" for=\"ace-settings-collect\" > Collecte</label>\r\n											</div>\r\n										</div>							\r\n									</div><!--/#ace-settings-container-->\r\n									<div class = \"yearselect\">\r\n										\r\n											<select id = \"sectorSelector\" class=\"selectorClass\">\r\n								            </select>\r\n																					\r\n									</div>	\r\n									<div class=\"selectChecboxes\" >\r\n											<div id = \"changingCheckboxes\"></div>\r\n										</div>\r\n									\r\n									<div class = \"print-setting\">\r\n										<button class=\"btn btn-small btn-info\" onclick=\"printImg()\">\r\n										<i class=\"icon-pencil\">Print</i>\r\n										</button>\r\n									</div>\r\n\r\n								</div>\r\n\r\n								<div id=\"mapcontainer\">\r\n								</div>\r\n								<div>\r\n									<div class = \"sliderwraper\">\r\n										<div id =\"yearSlider\">\r\n										</div>\r\n										 <input type=\"button\" id=\"play\" value=\"PLAY\" />\r\n									</div>\r\n\r\n								</div>\r\n							\r\n							</div>\r\n\r\n							<div class=\"vspw8\"></div>\r\n\r\n							<div class=\"span4\">\r\n								<div id=\"infobox\"></div>\r\n							</div><!--/span-->\r\n						</div><!--/row-->\r\n\r\n						<div class=\"hr hr32 hr-dotted\"></div>\r\n						\r\n						<!-- for configurations-->\r\n						<div class=\"row-fluid\">\r\n							<div id = \"test1\" class=\"span5\">\r\n								\r\n							</div>\r\n\r\n							<div class=\"span7\">\r\n								\r\n							</div>\r\n						</div>\r\n\r\n													\r\n\r\n						<!--PAGE CONTENT ENDS HERE-->\r\n					</div><!--/row-->\r\n				</div><!--/#page-content-->\r\n\r\n				";
  });
templates['navbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n			<div class=\"navbar-inner\">\r\n				<div class=\"container-fluid\">\r\n					<a href=\"#\" class=\"brand\">\r\n						<small>\r\n							<i class=\"icon-unlock-alt\"></i>\r\n							ADEME: COLLECTE DE DÉCHETS D’ÉQUIPEMENTS\r\n						</small>\r\n					</a><!--/.brand-->\r\n\r\n					<ul class=\"nav ace-nav pull-right\">\r\n						<li class=\"grey\">\r\n							<a data-toggle=\"dropdown\" class=\"dropdown-toggle\" href=\"#\">\r\n								<i class=\"icon-tasks\"></i>\r\n								<span class=\"badge badge-grey\">4</span>\r\n							</a>\r\n\r\n							<ul class=\"pull-right dropdown-navbar dropdown-menu dropdown-caret dropdown-closer\">\r\n								<li class=\"nav-header\">\r\n									<i class=\"icon-ok\"></i>\r\n									4 Tasks to complete\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Software Update</span>\r\n											<span class=\"pull-right\">65%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini \">\r\n											<div style=\"width:65%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n									\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Hardware Upgrade</span>\r\n											<span class=\"pull-right\">35%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-danger\">\r\n											<div style=\"width:35%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Unit Testing</span>\r\n											<span class=\"pull-right\">15%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-warning\">\r\n											<div style=\"width:15%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Bug Fixes</span>\r\n											<span class=\"pull-right\">90%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-success progress-striped active\">\r\n											<div style=\"width:90%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										See tasks with details\r\n										<i class=\"icon-arrow-right\"></i>\r\n									</a>\r\n								</li>\r\n							</ul>\r\n						</li>\r\n\r\n						\r\n\r\n						\r\n\r\n					</ul><!--/.w8-nav-->\r\n				</div><!--/.container-fluid-->\r\n			</div><!--/.navbar-inner-->";
  });
templates['sidebar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "	\r\n				<ul class=\"nav nav-list\">\r\n					<li class=\"active\">\r\n						<a href=\"index.html\">\r\n							<i class=\"icon-dashboard\"></i>\r\n							<span>Dashboard</span>\r\n						</a>\r\n					</li>\r\n				\r\n					<li>\r\n						<a href=\"#\" class=\"dropdown-toggle\">\r\n							<i class=\"icon-desktop\"></i>\r\n							<span>Filières</span>\r\n\r\n							<b class=\"arrow icon-angle-down\"></b>\r\n						</a>\r\n					</li>\r\n				<!--\r\n					<li>\r\n						<select id = \"sectorSelector\" class=\"selectorClass\">\r\n			                \r\n			            </select>\r\n					</li>\r\n					<li>\r\n						<div id = \"changingCheckboxes\" class=\"\">\r\n        				</div>\r\n					</li>			\r\n\r\n				-->				\r\n				</ul><!--/.nav-list-->\r\n\r\n				<div id=\"sidebar-collapse\">\r\n					<i class=\"icon-double-angle-left\"></i>\r\n				</div>\r\n\r\n				";
  });
templates['departements'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"departements\"></div>";
  });
templates['yearPicker'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  buffer += "<form><select id=\"yearselector\" name=\"selector\" class=\"selectpicker\"></select></form>\r\n\r\n"
    + "\r\n\r\n<script type=\"text/javascript\">\r\n";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.yearPicker || depth0.yearPicker),stack1 ? stack1.call(depth0, depth0.data, options) : helperMissing.call(depth0, "yearPicker", depth0.data, options)))
    + "\r\n</script>\r\n\r\n"
    + "\r\n"
    + "\r\n";
  return buffer;
  });
templates['infobox'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "								<div class=\"widget-box\">\r\n									<div class=\"widget-header widget-header-flat widget-header-small\">\r\n										<h5>\r\n											<i class=\"icon-signal\"></i>\r\n											";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n										</h5>\r\n										\r\n									</div>\r\n\r\n									<div class=\"widget-body\">\r\n										<div class=\"widget-main\">\r\n											<div id=\"idPiechart\"></div>\r\n\r\n											<div class=\"hr hr8 hr-double\"></div>\r\n\r\n											<div class=\"clearfix\">\r\n												";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n											</div>\r\n										</div><!--/widget-main-->\r\n									</div><!--/widget-body-->\r\n								</div><!--/widget-box-->\r\n\r\n								<script type=\"text/javascript\">\r\n\r\n								</script>";
  return buffer;
  });
templates['departement'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "\r\n\r\n<div >\r\n	<svg >\r\n		<g id='zomtest'>\r\n	<path style = \"";
  if (stack1 = helpers.style) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.style; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" code = \"";
  if (stack1 = helpers.code) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.code; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" id = \"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class = \"";
  if (stack1 = helpers['class']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0['class']; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" d = \"";
  if (stack1 = helpers['d']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0['d']; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></path>\r\n</g>\r\n</svg>\r\n</div>\r\n<script type=\"text/javascript\">\r\n\r\nvar features = d3.select('#zomtest');\r\n\r\nvar zoom = d3.behavior.zoom()\r\n      .translate([0, 0])\r\n      .scale(1)\r\n      .scaleExtent([1, 8])\r\n      .on(\"zoom\", zoomed);\r\n\r\nfunction zoomed() {\r\n    features.attr(\"transform\", \"translate(\" + d3.event.translate + \")scale(\" + d3.event.scale + \")\");\r\n    features.select(\".state-border\").style(\"stroke-width\", 1.5 / d3.event.scale + \"px\");\r\n    features.select(\".county-border\").style(\"stroke-width\", .5 / d3.event.scale + \"px\");\r\n  }\r\n    features.call(zoom);\r\n\r\n\r\n</script>";
  return buffer;
  });
})();