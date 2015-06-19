app.controller("dashboardController", ["$scope", "$resource", "utilityService", function($scope, $resource, utilityService) {
	"use strict";

	// Query API and update map counts.
	function updateMapCounts(searchParams) {

		var eventTypes = [];
		if (searchParams.typeFood) eventTypes.push("food");
		if (searchParams.typeDrugs) eventTypes.push("drug");
		if (searchParams.typeDevices) eventTypes.push("device");

		if (eventTypes.length == 0) return; // TODO: validation check in form.

		var EventCounts = $resource("/fda/counts/" + eventTypes.join(","));

		var counts = EventCounts.get(function() {
			if (counts.status.error) {
				// TODO: log error message.
				// expect(scope.counter).toEqual(0);
			}
			else {
				searchParams.counts = counts.result.aggregate;
			}
		});
	}

	// Search parameters.
	$scope.search = {
		typeFood: true,
		typeDrugs: true,
		typeDevices: true,
		dateFrom: "",
		dateTo: "",
		foodName: "",

		submit: function(searchParams) {
			updateMapCounts(searchParams);
		},

		counts: {}
	};

	// Initialize heatmap values.
	updateMapCounts($scope.search);

}]);