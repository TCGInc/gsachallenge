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

	$scope.modalAlerts = [];
	$scope.closeModalAlert = function(index) {
		utilityService.closeAlert($scope.modalAlerts, index);
	}

	$scope.ok = function () {

		$scope.modalAlerts = [];

		if (!$scope.saveSearchName) {
			utilityService.addAlert($scope.modalAlerts, "danger", "Please enter a name before saving.");
			return;
		}

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
			includeClass3: $scope.searchParams.classificationClass3
		};

		try {
			$http.post("/filters", postData).
				success(function(data, status, headers, config) {
					if (data.status.error) {
						throw data.status.message;
					}
					$modalInstance.close();
					$location.path(data.result.id);
				}).
				error(function(data, status, headers, config) {
					throw JSON.stringify(data) + JSON.stringify(status);
				})
		}
		catch(errorMessage) {
			$log.error(errorMessage);
			utilityService.addAlert($scope.modalAlerts, "danger", "There is a system problem and your search was not saved.");
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

});