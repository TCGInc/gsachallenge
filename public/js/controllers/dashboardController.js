app.controller("dashboardController", ["$location", "$scope", "$http", "$resource", "$log", "utilityService", "DTOptionsBuilder", "DTColumnBuilder", function($location, $scope, $http, $resource, $log, utilityService, DTOptionsBuilder, DTColumnBuilder) {
	"use strict";

	// Initialize $scope.
	$scope.searchParams = {
		eventTypeFood: true,
		eventTypeDrug: true,
		eventTypeDevice: true,
		dateFrom: "",
		dateTo: "",
		productDescription: "",
		recallReason: "",
		classificationClass1: true,
		classificationClass2: true,
		classificationClass3: true,
		recallingFirm: "",
		stateName: ""
	};
	$scope.savedSearch = {
		id: 0,
		name: "",
		description: ""
	}
	$scope.alerts = [];
	$scope.stateCounts = {};
	$scope.closeAlert = function(index) {
		utilityService.closeAlert($scope.alerts, index);
	}

	// Discover from URL if a saved search should be quried and displayed.
	var searchResult = $location.absUrl().match(/search=(\d+)/);
	if (searchResult && searchResult.length > 1) {
		try {
			$http.get("/filters/" + searchResult[1]).
				success(function(data, status, headers, config) {
					if (data.status.error) {
						throw data.status.message;
					}

					var getDate = d3.time.format("%Y-%m-%d");

					$scope.searchParams = {
						eventTypeFood: data.result.includeFood,
						eventTypeDrug: data.result.includeDrugs,
						eventTypeDevice: data.result.includeDevices,
						dateFrom: data.result.fromDate == "1900-01-01" ? "" : getDate.parse(data.result.fromDate),
						dateTo: data.result.toDate == "1900-01-01" ? "" : getDate.parse(data.result.toDate),
						productDescription: data.result.productDescription,
						recallReason: data.result.reasonForRecall,
						classificationClass1:data.result.includeClass1,
						classificationClass2: data.result.includeClass2,
						classificationClass3: data.result.includeClass3,
						recallingFirm: data.result.recallingFirm,
						stateName: ""
					};
					$scope.savedSearch = {
						id: data.result.id,
						name: data.result.name,
						description: data.result.description
					}
				}).
				error(function(data, status, headers, config) {
					throw JSON.stringify(data) + JSON.stringify(status);
				})
		}
		catch(errorMessage) {
			$log.error(errorMessage);
			utilityService.addAlert($scope.alerts, "warning", "No saved search was found for this search ID.");
		}
	}

	// Build query parameter string.
	function buildQueryString(searchParams) {

		var queryParams = [];

		if (searchParams.eventTypeFood) queryParams.push("includeFood=true");
		if (searchParams.eventTypeDrug) queryParams.push("includeDrugs=true");
		if (searchParams.eventTypeDevice) queryParams.push("includeDevices=true");
		if (searchParams.dateFrom) queryParams.push("fromDate=" + utilityService.parseDateString(searchParams.dateFrom));
		if (searchParams.dateTo) queryParams.push("toDate=" + utilityService.parseDateString(searchParams.dateTo));
		if (searchParams.productDescription) queryParams.push("productDescription=" + searchParams.productDescription);
		if (searchParams.recallReason) queryParams.push("reasonForRecall=" + searchParams.recallReason);
		if (searchParams.classificationClass1) queryParams.push("includeClass1=true");
		if (searchParams.classificationClass2) queryParams.push("includeClass2=true");
		if (searchParams.classificationClass3) queryParams.push("includeClass3=true");
		if (searchParams.recallingFirm) queryParams.push("recallingFirm=" + searchParams.recallingFirm);

		return queryParams.join("&");
	}

	// Query API and update map counts.
	function updateHeatmap(searchParams) {

		var queryString = buildQueryString(searchParams);

		// No change in the heatmap if all form elements are blank.
		if (!queryString) {
			utilityService.addAlert($scope.alerts, "warning", "Please make entries into the search form to run a search.");
			return;
		}

		var StateCounts = $resource("/fda/recalls/counts?" + queryString);

		var counts = StateCounts.get(function() {
			if (counts.status.error) {
				if (counts.status.message != "Invalid fromDate." && counts.status.message != "Invalid toDate.") {
					utilityService.addAlert($scope.alerts, "danger", "There was a problem with your search.");
				}
    			$log.error(JSON.stringify(counts.status));
			}
			else {
				$scope.alerts = [];
				$scope.stateCounts = counts.result.aggregate;
			}
		});
	}

	// Refresh the heatmap when the user changes a search parameter.
	$scope.$watchCollection("searchParams", function(searchParams) {
		updateHeatmap(searchParams);
	});

	// Query the server for lists to send to the autocomplete search form elements.
	$scope.autocomplete = function(field, value) {

		var queryString = "/fda/autocomplete?field=" + field + "&query=" + value;
		if ($scope.searchParams.eventTypeFood) queryString += "&includeFood=true";
		if ($scope.searchParams.eventTypeDrug) queryString += "&includeDrugs=true";
		if ($scope.searchParams.eventTypeDevice) queryString += "&includeDevices=true";

		return $http.get(queryString).then(function(response) {
			$scope.alerts = [];
			var trimmedResult = response.data.result.map(function(result) {
				// Trim long result records to better fit into the autocomplete dropdown.
				if (result.length > 50) {
					var padding = parseInt((50 - value.length) / 2);
					var re = new RegExp(".{0," + padding + "}" + value + ".{0," + padding + "}", "i");
					var matches = result.match(re);
					return matches[0];
				}
				return result;
			});
      		return trimmedResult;
    	},
    	function(error) {
    		utilityService.addAlert($scope.alerts, "danger", "There was a problem with your lookup.");
    		$log.error(JSON.stringify(error));
    	});
	}

	// Configure datatable.
	$scope.tableOptions = DTOptionsBuilder.fromSource("")
		.withDataProp("result.recalls")
		.withPaginationType('full_numbers')
	    .withOption('responsive', true)
	    .withOption('bFilter', false)
	    .withOption('dom', '<"top"il>rt<"bottom"p><"clear">')
	    .withOption('rowCallback', function(nRow, aData, iDisplayIndex) {
	    	$('td', nRow).bind('click', function() {
	    		$scope.$apply(function() {
					$(nRow).toggleClass('open-row');
				});
	    	});
			$('.table-wrapper').show();
			return nRow;
	    })
		.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    		var queryEndpoint = "/fda/recalls?" + buildQueryString($scope.searchParams);
    		queryEndpoint += "&offset=0&limit=100&orderBy=recallInitiationDate&orderDir=asc";
    		queryEndpoint +=  "&stateAbbr=" + utilityService.stateNames[$scope.searchParams.stateName].toLowerCase();
			oSettings.jqXHR = $.ajax({
				'dataType': 'json',
				'type': 'GET',
				'url': queryEndpoint,
				'success': fnCallback
			});
		});
	$scope.tableColumns = [
        DTColumnBuilder.newColumn('productType').withTitle('Type'),
        DTColumnBuilder.newColumn('recallingFirm').withTitle('Recalling Firm'),
        DTColumnBuilder.newColumn('reasonForRecall').withTitle('Reason for Recall'),
        DTColumnBuilder.newColumn('productDescription').withTitle('Description'),
        DTColumnBuilder.newColumn('recallInitiationDate').withTitle('Recall Date'),
    ];
    $scope.tableInstance = {};

	// Handler for heatmap directive when a state is clicked.
	$scope.clickMap = function(stateName) {
    	$scope.searchParams.stateName = stateName;
		$scope.tableInstance.changeData("");
    }

}]);