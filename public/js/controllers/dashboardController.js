app.controller("dashboardController", ["$scope", "$resource", "utilityService", function($scope, $resource, utilityService) {
	"use strict";

	// Query API and update map counts.
	function updateHeatmap(searchParams) {

		// Build the last term of the query endpoint based on the eventTypes selected.
		var eventTypes = [];
		angular.forEach(searchParams.eventTypes, function(isChecked, eventType) {
			if (isChecked) {
				eventTypes.push(eventType);
			}
		});

		if (eventTypes.length == 0) return; // TODO: validation check in form.

		var StateCounts = $resource("/fda/counts/" + eventTypes.join(","));

		var counts = StateCounts.get(function() {
			if (counts.status.error) {
				// TODO: log error message.
				// expect(scope.counter).toEqual(0);
			}
			else {
				$scope.stateCounts = counts.result.aggregate;
			}
		});
	}

	// Initialize $scope.
	$scope.searchParams = {
		eventTypes: {
			food: true,
			drug: true,
			device: true
		},
		dateFrom: "",
		dateTo: "",
		foodName: ""
	};
	$scope.submit = function(searchParams) {
		updateHeatmap(searchParams);
	}
	$scope.stateCounts = {};

	// Initialize heatmap values.
	updateHeatmap($scope.searchParams);

}]);