app.controller("dashboardController", ["$scope", "$http", "$resource", "$log", "utilityService", "DTOptionsBuilder", "DTColumnBuilder", function($scope, $http, $resource, $log, utilityService, DTOptionsBuilder, DTColumnBuilder) {
	"use strict";

	// Build query parameter string.
	function buildQueryString(searchParams) {

		var queryParams = [];

		function getDateString(rawDate) {
			return new Date(rawDate).toISOString().substring(0, 10);
		}

		if (searchParams.eventTypeFood) queryParams.push("includeFood=true");
		if (searchParams.eventTypeDrug) queryParams.push("includeDrugs=true");
		if (searchParams.eventTypeDevice) queryParams.push("includeDevices=true");
		if (searchParams.dateFrom) queryParams.push("fromDate=" + getDateString(searchParams.dateFrom));
		if (searchParams.dateTo) queryParams.push("toDate=" + getDateString(searchParams.dateTo));
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
			utilityService.addAlert($scope, "warning", "Please make entries into the search form to run a search.");
			return;
		}

		var StateCounts = $resource("/fda/recalls/counts?" + queryString);

		var counts = StateCounts.get(function() {
			if (counts.status.error) {
				utilityService.addAlert($scope, "danger", "There was a problem with your search.");
    			$log.error(JSON.stringify(counts.status));
			}
			else {
				utilityService.closeAllAlerts($scope);
				$scope.stateCounts = counts.result.aggregate;
			}
		});
	}

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
	$scope.stateCounts = {};
	$scope.closeAlert = function(index) {
		utilityService.closeAlert($scope, index);
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
			utilityService.closeAllAlerts($scope);
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
    		utilityService.addAlert($scope, "danger", "There was a problem with your search.");
    		$log.error(JSON.stringify(error));
    	});
	}

	$scope.tableOptions = DTOptionsBuilder.fromSource("")
		.withDataProp("result.recalls")
		.withPaginationType('full_numbers')
    .withOption('responsive', true)
    .withOption('bFilter', false)
    .withOption('dom', '<"top"il>rt<"bottom"p><"clear">')
    .withOption('rowCallback', function( nRow, aData, iDisplayIndex ) {
      $('td', nRow).bind('click', function() {
        $scope.$apply(function() {
          $(nRow).toggleClass('open-row');
        });
      });
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
    
    $scope.clickMap = function(stateName) {
    	$scope.searchParams.stateName = stateName;
		$scope.tableInstance.changeData("");
    }

}]);