app.service("queryService", ["$resource", function($resource) {
	"use strict";

	var baseUrl = "http://gsachallenge.tcg.com";

	return $resource("/json")
}]);