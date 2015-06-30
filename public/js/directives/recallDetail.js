app.directive("recallDetail", function($modal, $http, $log, utilityService) {
	return {
		restrict: "E",
		templateUrl: "templates/recallDetail.html",
		link: function(scope, element, attrs) {

			scope.openRecallDetailModal = function() {

				// Open data table processing spinner.
				$("#DataTables_Table_0_processing").show();

				// Retrive query variables from the HTML element.
				var eventId = $("span", element).data("event_id");
				var productType = $("span", element).data("product_type");

				// Reformat product type to meet endpoint specs.
				if (productType == "devices") productType = "device";
				if (productType == "drugs") productType = "drug";

				try {
					$http.get("/fda/recalls/" + productType + "/" + eventId).
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

							scope.details = data.result;

						    $modal.open({
								animation: true,
								templateUrl: "recallDetail.html",
								controller: "recallDetailModalInstanceController",
								size: "lg",
								scope: scope
						    });

							// Close data table processing spinner.
							$("#DataTables_Table_0_processing").hide();
						}).
						error(function(data, status, headers, config) {
							throw JSON.stringify(data) + JSON.stringify(status);
						});
				}
				catch(errorMessage) {
					$log.error(errorMessage);
					utilityService.addAlert($scope.modalAlerts, "danger", "There is a system problem when retrieving the detail.");
				}

			};
		}
    }
});

app.controller("recallDetailModalInstanceController", function ($scope, $modalInstance) {

	$scope.close = function () {
		$modalInstance.dismiss("cancel");
	};

});