app.directive("saveSearch", function($modal) {
	return {
		restrict: "E",
		templateUrl: "templates/saveSearch.html",
		link: function(scope, element, attrs) {
			scope.openModal = function() {
			    $modal.open({
					animation: true,
					templateUrl: "saveSearch.html",
					controller: "saveSearchModalInstanceController",
					scope: scope
			    });
			};
		}
    }
});

app.controller("saveSearchModalInstanceController", function ($scope, $http, $log, $window, $modalInstance, $location, utilityService) {

	utilityService.closeAllModalAlerts($scope);

	$scope.closeModalAlert = function(index) {
		utilityService.closeModalAlert($scope, index);
	}

	$scope.ok = function () {

		if (!$scope.saveSearchName) {
			utilityService.addModalAlert($scope, "danger", "Please enter a name before saving.");
			return;
		}

		utilityService.closeAllModalAlerts($scope);

		var postData = {
			name: $scope.saveSearchName,
			description: $scope.saveSearchDescription,
			fromDate: utilityService.parseDateString($scope.searchParams.dateFrom),
			toDate: utilityService.parseDateString($scope.searchParams.dateTo),
			includeFood: $scope.searchParams.eventTypeFood,
			includeDrugs: $scope.searchParams.eventTypeDrug,
			includeDevices: $scope.searchParams.eventTypeDevice,
			productDescription: $scope.searchParams.productDescription,
			reasonForRecall: $scope.searchParams.recallReason,
			recallingFirm: $scope.searchParams.recallingFirm,
			includeClass1: $scope.searchParams.classificationClass1,
			includeClass2: $scope.searchParams.classificationClass2,
			includeClass3: $scope.searchParams.classificationClass3,
			stateAbbr: $scope.highlightedStates
		};

		$http.post("/filters", postData).
			success(function(data, status, headers, config) {
				if (data.status.error) {
					$log.error(data.status.message);
					utilityService.addModalAlert($scope, "danger", data.status.message);
				}
				else {
					$modalInstance.close();
					$location.path(data.result.id);
				}
			}).
			error(function(data, status, headers, config) {
				$log.error(JSON.stringify(data) + JSON.stringify(status));
				utilityService.addModalAlert($scope, "danger", "There is a system problem and your search was not saved.");
			});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

});