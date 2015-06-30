app.directive("recallDetail", function($modal) {
	return {
		restrict: "E",
		templateUrl: "templates/recallDetail.html",
		link: function(scope, element, attrs) {

			scope.openRecallDetailModal = function() {

				scope.eventId = $("span", element).data("event_id");
				scope.productType = $("span", element).data("product_type");

			    $modal.open({
					animation: true,
					templateUrl: "recallDetail.html",
					controller: "recallDetailModalInstanceController",
					size: "lg",
					scope: scope
			    });
			};
		}
    }
});

app.controller("recallDetailModalInstanceController", function ($scope, $http, $log, $modalInstance, utilityService) {

	// Reformat product type to meet endpoint specs.
	if ($scope.productType == "devices") $scope.productType = "device";
	if ($scope.productType == "drugs") $scope.productType = "drug";

	try {
		$http.get("/fda/recalls/" + $scope.productType + "/" + $scope.eventId).
			success(function(data, status, headers, config) {
				if (data.status.error) {
					throw data.status.message;
				}

				function reformatDate(rawDate) {
					var parts = rawDate.toString().match(/^(\d{4})(\d{2})(\d{2})$/);
					return parts[2] + "/" + parts[3] + "/" + parts[1];
				}

				data.result.recall_initiation_date = reformatDate(data.result.recall_initiation_date);
				data.result.report_date = reformatDate(data.result.report_date);

				$scope.details = data.result;
			}).
			error(function(data, status, headers, config) {
				throw JSON.stringify(data) + JSON.stringify(status);
			})
	}
	catch(errorMessage) {
		$log.error(errorMessage);
		utilityService.addAlert($scope.modalAlerts, "danger", "There is a system problem when retrie.");
	}

	$scope.close = function () {
		$modalInstance.dismiss("cancel");
	};

});