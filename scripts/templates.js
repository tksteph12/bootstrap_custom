(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['maincontent'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n				<div id=\"breadcrumbs\">\r\n					<ul class=\"breadcrumb\">\r\n						<li>\r\n							<i class=\"icon-home\"></i>\r\n							<a href=\"#\">Home</a>\r\n\r\n							<span class=\"divider\">\r\n								<i class=\"icon-angle-right\"></i>\r\n							</span>\r\n						</li>\r\n						<li class=\"active\">Dashboard</li>\r\n					</ul><!--.breadcrumb-->\r\n\r\n					<div id=\"nav-search\">\r\n						<form class=\"form-search\">\r\n							<span class=\"input-icon\">\r\n								<input type=\"text\" placeholder=\"Search ...\" class=\"input-small search-query\" id=\"nav-search-input\" autocomplete=\"off\" />\r\n								<i class=\"icon-search\" id=\"nav-search-icon\"></i>\r\n							</span>\r\n						</form>\r\n					</div><!--#nav-search-->\r\n				</div>\r\n\r\n				<div id=\"page-content\" class=\"clearfix\">\r\n					<div class=\"page-header position-relative\">\r\n						<h1>\r\n							Cartographie des collectes de déchets dans les départements de france\r\n						</h1>\r\n					</div><!--/.page-header-->\r\n\r\n					<div class=\"row-fluid\">\r\n						<!--PAGE CONTENT BEGINS HERE-->\r\n\r\n						\r\n						<div class=\"space-6\"></div>\r\n\r\n						<div class=\"row-fluid\">\r\n							<!-- Main container for the map-->\r\n							<div  class=\"span8 \">\r\n								<div id=\"ace-settings-container\">\r\n									<div class=\"btn btn-app btn-mini btn-warning\" id=\"ace-settings-btn\">\r\n										<i class=\"icon-cog\"></i>\r\n									</div>\r\n\r\n									<div id=\"ace-settings-box\">\r\n										<span>&nbsp; Affichage</span>\r\n										<div>\r\n											<input type=\"radio\" name = \"affichage\" class=\"ace-checkbox-2\" id=\"ace-settings-procuced\" />\r\n											<label class=\"lbl\" for=\"ace-settings-procuced\"> Production</label>\r\n										</div>\r\n\r\n										<div>\r\n											<input type=\"radio\" name = \"affichage\" class=\"ace-checkbox-2\" id=\"ace-settings-collect\" />\r\n											<label class=\"lbl\" for=\"ace-settings-collect\" > Collecte</label>\r\n										</div>\r\n									</div>							\r\n\r\n								</div><!--/#ace-settings-container-->\r\n								<div style=\"float: right;\">\r\n								<button class=\"btn btn-small btn-info\" onclick=\"printImg()\">\r\n								<i class=\"icon-pencil\">Print</i>\r\n								</button>\r\n								</div>\r\n								<div id=\"mapcontainer\">\r\n								</div>\r\n							\r\n							</div>\r\n\r\n							<div class=\"vspw8\"></div>\r\n\r\n							<div class=\"span4\">\r\n								<div id=\"infobox\"></div>\r\n							</div><!--/span-->\r\n						</div><!--/row-->\r\n\r\n						<div class=\"hr hr32 hr-dotted\"></div>\r\n						<div class=\"row-fluid\">\r\n							<div>\r\n								<select class=\"selectpicker\">\r\n									<option>Mustard</option>\r\n								    <option>Ketchup</option>\r\n								    <option>Relish</option>\r\n								 </select>\r\n							</div>\r\n							HERE THE SLIDER\r\n						</div>\r\n\r\n						<div class=\"hr hr32 hr-dotted\"></div>\r\n\r\n						<!-- for configurations-->\r\n						<div class=\"row-fluid\">\r\n							<div id = \"test\" class=\"span5\">\r\n								\r\n							</div>\r\n\r\n							<div class=\"span7\">\r\n								\r\n							</div>\r\n						</div>\r\n\r\n													\r\n\r\n						<!--PAGE CONTENT ENDS HERE-->\r\n					</div><!--/row-->\r\n				</div><!--/#page-content-->\r\n\r\n				";
  });
templates['navbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n			<div class=\"navbar-inner\">\r\n				<div class=\"container-fluid\">\r\n					<a href=\"#\" class=\"brand\">\r\n						<small>\r\n							<i class=\"icon-unlock-alt\"></i>\r\n							ADEME: COLLECTE DE DÉCHETS D’ÉQUIPEMENTS\r\n						</small>\r\n					</a><!--/.brand-->\r\n\r\n					<ul class=\"nav ace-nav pull-right\">\r\n						<li class=\"grey\">\r\n							<a data-toggle=\"dropdown\" class=\"dropdown-toggle\" href=\"#\">\r\n								<i class=\"icon-tasks\"></i>\r\n								<span class=\"badge badge-grey\">4</span>\r\n							</a>\r\n\r\n							<ul class=\"pull-right dropdown-navbar dropdown-menu dropdown-caret dropdown-closer\">\r\n								<li class=\"nav-header\">\r\n									<i class=\"icon-ok\"></i>\r\n									4 Tasks to complete\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Software Update</span>\r\n											<span class=\"pull-right\">65%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini \">\r\n											<div style=\"width:65%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n									\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Hardware Upgrade</span>\r\n											<span class=\"pull-right\">35%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-danger\">\r\n											<div style=\"width:35%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Unit Testing</span>\r\n											<span class=\"pull-right\">15%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-warning\">\r\n											<div style=\"width:15%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										<div class=\"clearfix\">\r\n											<span class=\"pull-left\">Bug Fixes</span>\r\n											<span class=\"pull-right\">90%</span>\r\n										</div>\r\n\r\n										<div class=\"progress progress-mini progress-success progress-striped active\">\r\n											<div style=\"width:90%\" class=\"bar\"></div>\r\n										</div>\r\n									</a>\r\n								</li>\r\n\r\n								<li>\r\n									<a href=\"#\">\r\n										See tasks with details\r\n										<i class=\"icon-arrow-right\"></i>\r\n									</a>\r\n								</li>\r\n							</ul>\r\n						</li>\r\n\r\n						\r\n\r\n						\r\n\r\n					</ul><!--/.w8-nav-->\r\n				</div><!--/.container-fluid-->\r\n			</div><!--/.navbar-inner-->";
  });
templates['sidebar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "	\r\n				<ul class=\"nav nav-list\">\r\n					<li class=\"active\">\r\n						<a href=\"index.html\">\r\n							<i class=\"icon-dashboard\"></i>\r\n							<span>Dashboard</span>\r\n						</a>\r\n					</li>\r\n				\r\n					<li>\r\n						<a href=\"#\" class=\"dropdown-toggle\">\r\n							<i class=\"icon-desktop\"></i>\r\n							<span>Filières</span>\r\n\r\n							<b class=\"arrow icon-angle-down\"></b>\r\n						</a>\r\n					</li>\r\n					<li>\r\n						<select id = \"sectorSelector\" class=\"selectorClass\">\r\n			                <option value=\" \" name=\"filiereSelector\">\r\n			                    PA\r\n			                </option>\r\n			                <option>DEE</option>\r\n			            </select>\r\n					</li>\r\n					<li>\r\n						<div id = \"changingCheckboxes\" class=\"\">\r\n        				</div>\r\n					</li>							\r\n				</ul><!--/.nav-list-->\r\n\r\n				<div id=\"sidebar-collapse\">\r\n					<i class=\"icon-double-angle-left\"></i>\r\n				</div>\r\n\r\n				\r\n				\r\n\r\n";
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
    + "\r\n										</h5>\r\n										<!--\r\n										<div class=\"widget-toolbar no-border\">\r\n											<button class=\"btn btn-minier btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\r\n												This Week\r\n												<i class=\"icon-angle-down icon-on-right\"></i>\r\n											</button>\r\n\r\n											<ul class=\"dropdown-menu dropdown-info pull-right dropdown-caret\">\r\n												<li class=\"active\">\r\n													<a href=\"#\">This Week</a>\r\n												</li>\r\n\r\n												<li>\r\n													<a href=\"#\">Last Week</a>\r\n												</li>\r\n\r\n												<li>\r\n													<a href=\"#\">This Month</a>\r\n												</li>\r\n\r\n												<li>\r\n													<a href=\"#\">Last Month</a>\r\n												</li>\r\n											</ul>\r\n										</div>\r\n										-->\r\n									</div>\r\n\r\n									<div class=\"widget-body\">\r\n										<div class=\"widget-main\">\r\n											<div id=\"idPiechart\"></div>\r\n\r\n											<div class=\"hr hr8 hr-double\"></div>\r\n\r\n											<div class=\"clearfix\">\r\n												<div class=\"grid3\">\r\n													<span class=\"grey\">\r\n														<i class=\"icon-fw8book-sign icon-2x blue\"></i>\r\n														&nbsp; likes\r\n													</span>\r\n													<h4 class=\"bigger pull-right\">1,255</h4>\r\n												</div>\r\n\r\n												<div class=\"grid3\">\r\n													<span class=\"grey\">\r\n														<i class=\"icon-twitter-sign icon-2x purple\"></i>\r\n														&nbsp; tweets\r\n													</span>\r\n													<h4 class=\"bigger pull-right\">941</h4>\r\n												</div>\r\n\r\n												<div class=\"grid3\">\r\n													<span class=\"grey\">\r\n														<i class=\"icon-pinterest-sign icon-2x red\"></i>\r\n														&nbsp; pins\r\n													</span>\r\n													<h4 class=\"bigger pull-right\">1,050</h4>\r\n												</div>\r\n											</div>\r\n										</div><!--/widget-main-->\r\n									</div><!--/widget-body-->\r\n								</div><!--/widget-box-->";
  return buffer;
  });
})();