app.controller("dashboardController", ["$location", "$scope", "$http", "$log", "utilityService", "DTOptionsBuilder", "DTColumnBuilder", function($location, $scope, $http, $log, utilityService, DTOptionsBuilder, DTColumnBuilder) {
	"use strict";

	function initializeSearchParameters() {
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
			recallingFirm: ""
		};
	}

	// Initialize $scope.
	$scope.highlightedStates = [];
	$scope.stateCounts = {};
	$scope.alerts = [];
	$scope.savedSearch = {
		id: 0,
		name: "",
		description: ""
	};
	$scope.shareThisUrl = $location.absUrl();
	$scope.stateOptions = utilityService.stateNames;
	$scope.selectState = function() {
		// Refresh detail table after the user selects or deselects a state using the form multiselect.
		refreshDetailsTable();
	}
	$scope.openDate = function($event, id) {
		// Open one of the dropdown calendars on a date form element.
		$event.preventDefault();
		$event.stopPropagation();
		$scope.dateOpen[id] = true;
	};
	$scope.dateOpen = {
		'from': false,
		'to': false
	}

	var initCheck = 0;

	// Remove an alert from being displayed at the top of the page.
	$scope.closeAlert = function(index) {
		utilityService.closeAlert($scope, index);
	}

	// Page callback to set search parameters to their default values.
	$scope.clearFilters = function() {

		// Determine if search parameters and heatmap are not in their initial state.
		var p = $scope.searchParams;
		var searchIsDirty = !p.eventTypeFood || !p.eventTypeDrug || !p.eventTypeDevice || p.dateFrom ||
			p.dateTo || p.productDescription || p.recallReason || p.recallingFirm ||
			!p.classificationClass1 || !p.classificationClass2 || !p.classificationClass3;
		var mapIsDirty = $scope.highlightedStates.length > 0;

		if (searchIsDirty) {
			// Refresh both states and counts on the heatmap.
			$scope.highlightedStates = [];
			initializeSearchParameters();
		}

		if (!searchIsDirty && mapIsDirty) {
			// Refresh just the states on the heatmap.
			refreshHighlightedStates();
		}

		if (searchIsDirty || mapIsDirty) {
			// Refresh the details table.
			refreshDetailsTable();
		}
	};

	// Page callback to remove a state highlight from the map and details table.
	$scope.removeHighlightedState = function(state) {
		refreshHighlightedStates(utilityService.stateNames[state]);
		refreshDetailsTable();
	}


	// Page setup at page load.
	$scope.$watch(function () {
	    return location.hash
	}, function (value) {
	    // At page load or hash change, discover from URL if a saved search should be queried and displayed.
		var searchResult = $location.path();
		if (searchResult && searchResult.length > 1) {
			$scope.shareThisUrl = $location.absUrl();

			searchResult = searchResult.substring(1);
			searchResult = searchResult.replace(/^(\d+).*$/, "$1");
			$http.get("/filters/" + searchResult).
				success(function(data, status, headers, config) {
					if (data.status.error) {
						$log.error(data.status.message);
						initializeSearchParameters();
					}
					else {
						var getDate = d3.time.format("%Y-%m-%d");

						// Load highlighted states.
						if(data.result.stateAbbr) {
							$scope.highlightedStates = data.result.stateAbbr;
							$scope.highlightedStates.forEach(function(state, idx, arr) {
								arr[idx] = state.toLowerCase();
							});
						}

						// Load form search paramters.
						$scope.searchParams = {
							eventTypeFood: data.result.includeFood,
							eventTypeDrug: data.result.includeDrugs,
							eventTypeDevice: data.result.includeDevices,
							dateFrom: data.result.fromDate ? getDate.parse(data.result.fromDate) : "",
							dateTo: data.result.toDate ? getDate.parse(data.result.toDate) : "",
							productDescription: data.result.productDescription,
							recallReason: data.result.reasonForRecall,
							classificationClass1:data.result.includeClass1,
							classificationClass2: data.result.includeClass2,
							classificationClass3: data.result.includeClass3,
							recallingFirm: data.result.recallingFirm
						};

						// Load saved search info for display on page.
						$scope.savedSearch = {
							id: data.result.id,
							name: data.result.name,
							description: data.result.description
						}
					}
				}).
				error(function(data, status, headers, config) {
					$log.error(JSON.stringify(data) + JSON.stringify(status));
					initializeSearchParameters();
				});
		}
		else {
			initializeSearchParameters();
		}
	});

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

	// Refresh the $scope.stateCounts variable which will, in turn, refresh the heatmap.
	function refreshStateCounts(searchParams) {

		var queryString = buildQueryString(searchParams);

		// No change in the heatmap if all form elements are blank.
		if (!queryString) {
			return;
		}

		$http.get("/fda/recalls/counts?" + queryString).
			success(function(data, status, headers, config) {
				if (data.status.error) {
					$log.error(data.status.message);
					utilityService.addAlert($scope, "danger", "There was a system problem while performing the search. Check the console for details.");
				}
				else {
					utilityService.closeAllAlerts($scope);
					$scope.stateCounts = data.result.aggregate;
				}
			}).
			error(function(data, status, headers, config) {
				$log.error(JSON.stringify(data) + JSON.stringify(status));
				utilityService.addAlert($scope, "danger", "There was a system problem while performing the search. Check the console for details.");
			});
	}

	// Refresh the stateCounts (which will then refresh the heatmap) when the user changes a search parameter.
	$scope.$watchCollection("searchParams", function(searchParams) {
		function validParameters(searchParams) {
			var isValid = true;
			utilityService.closeAllAlerts($scope);

			if (searchParams.dateFrom) {
				var dateFrom = utilityService.parseDateString(searchParams.dateFrom);
				if (!dateFrom || !/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(dateFrom)) {
					utilityService.addAlert($scope, "danger", "Invalid Start Date in the search form. Please correct.");
					isValid = false;
				}
			}

			if (searchParams.dateTo) {
				var dateTo = utilityService.parseDateString(searchParams.dateTo);
				if (!dateTo || !/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(dateTo)) {
					utilityService.addAlert($scope, "danger", "Invalid End Date in the search form. Please correct.");
					isValid = false;
				}
			}

			return isValid;
		}

		if (searchParams && validParameters(searchParams)) {
			refreshStateCounts(searchParams);
			refreshDetailsTable();
		}
	});

	// Refresh the list of highlighted states, which will then refresh the heatmap.
	function refreshHighlightedStates(stateAbbr, withApply) {

		function refresh() {
			if (!stateAbbr) {
				// Clear all highlights from states if no stateAbbr given.
				$scope.highlightedStates = [];
			}
			else {
				var index = $.inArray(stateAbbr, $scope.highlightedStates);
				if (index == -1) {
					$scope.highlightedStates.push(stateAbbr);
				}
				else {
					$scope.highlightedStates.splice(index, 1);
				}
			}
		}

		if (!withApply) {
			refresh();
		}
		else {
			$scope.$apply(refresh);
		}
	}

	// Handler for heatmap directive when a state is clicked.
	$scope.mapClicked = function(stateAbbr) {
		refreshHighlightedStates(stateAbbr, true);
		refreshDetailsTable();
		var stateName = convert_state(stateAbbr,'name');
  	ga('send', 'event', 'State (Map)', 'Filter', stateName);
    }

	// Configure state details table.
	$scope.tableOptions = DTOptionsBuilder.newOptions()
		.withDataProp("data")
		.withPaginationType('full_numbers')
		.withOption('processing', true)
		.withOption('serverSide', true)
	    .withOption('bFilter', false)
	    .withOption('dom', '<"top"il>rt<"bottom"p><"clear">')
	    .withOption('createdRow', function() {
				$('body').tooltip({
				  selector: '.prod-type'
				});
	    })
	    .withOption('rowCallback', function(nRow, aData, iDisplayIndex) {
			if (aData.recall_initiation_date) {
				var parts = aData.recall_initiation_date.substring(0,10).split("-");
				$('td:eq(4)', nRow).text(parts[1] + "/" + parts[2] + "/" + parts[0]);
			}
	    	$('td', nRow).bind('click', function() {
  			ga('send', 'event', 'Recall Detail', 'Click', aData.event_id);
				$("recall-detail span")
					.data("event_id", aData.event_id)
					.data("product_type", aData.product_type.toLowerCase())
					.click();
	    	});
    	  $('[data-toggle="tooltip"]').tooltip();
			return nRow;
	    })
		.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {

			// Pass through an empty results set when table initialized.
			if (!$scope.hasOwnProperty("searchParams")) {
				fnCallback({
    				draw: aoData.draw,
    				recordsTotal: 0,
    				recordsFiltered: 0,
    				data: []
    			});
    			return;
			}

			// Re-orient params so they're easier to use
			var ajaxParams = {};
			angular.forEach(aoData, function(elem, idx) {
				ajaxParams[elem.name] = elem.value;
			});

			var queryEndpoint = "/fda/recalls?" + buildQueryString($scope.searchParams);
			queryEndpoint += "&offset="+ajaxParams.start;
			queryEndpoint += "&limit="+ajaxParams.length;
			queryEndpoint += "&orderBy="+utilityService.toCamel(ajaxParams.columns[ajaxParams.order[0].column].data);
			queryEndpoint += "&orderDir="+ajaxParams.order[0].dir;
    		queryEndpoint += "&stateAbbr=" + $scope.highlightedStates.join(",");

    		// Get recalls
    		$http.get(queryEndpoint).success(function(data, status, headers, config) {

    			if (data.status.error) {
					$log.error(data.status.message);
					return;
				}

    			// Structure recalls in DataTables format
    			var res = {
    				draw: aoData.draw,
    				recordsTotal: data.result.total,
    				recordsFiltered: data.result.total,
    				data: data.result.recalls
    			};

    			angular.forEach(data.result.recalls, function(recall) {
    				if(recall.states.length == 51) {
    					recall.states = 'Nationwide';
    				}
    				else {
    					recall.states.sort();
    					recall.states = recall.states.join(", ");
    				}
    			});

    			fnCallback(res);
    		});
		});
	$scope.tableColumns = [
        DTColumnBuilder.newColumn('product_type').withTitle('Type').withClass('col-type').withOption('tv1', 'testestest')
        	.renderWith(function(data, type, full, meta) {
        		var lc_data = data.toLowerCase();
        		return '<span class="prod-type type-' + lc_data + '" data-toggle="tooltip" data-placement="right" title="' + data + '">' + data + '</span';
        	}),
        DTColumnBuilder.newColumn('recalling_firm').withTitle('Recalling Firm').withClass('col-firm'),
        DTColumnBuilder.newColumn('reason_for_recall').withTitle('Reason for Recall').withClass('col-reason'),
        DTColumnBuilder.newColumn('product_description').withTitle('Product Description').withClass('col-desc'),
        DTColumnBuilder.newColumn('recall_initiation_date').withTitle('Recall Date').withClass('col-date'),
        DTColumnBuilder.newColumn('states').withTitle('States').withClass('col-state').notSortable()
    ];
    $scope.tableInstance = {};

	// Refresh the datatable.
	function refreshDetailsTable() {
		if ($scope.tableInstance.hasOwnProperty("DataTable")) {
			$scope.tableInstance.DataTable.ajax.reload();
		}
		else {
			// Wait for datatable to initialize before loading the query results.
			var checkTableInitialized = setInterval(function() {
				if ($scope.tableInstance.hasOwnProperty("DataTable")) {
					$scope.tableInstance.DataTable.ajax.reload();
					clearInterval(checkTableInitialized);
				}
			}, 500);
		}
		if ( initCheck != 0 ) {
			$scope.savedSearch = {
				id: 0,
				name: "",
				description: ""
			};
		}
		initCheck = $scope.savedSearch.id;
	}

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
    		utilityService.addAlert($scope, "danger", "The system had a problem looking up the recalling firm.");
    		$log.error(JSON.stringify(error));
    	});
	}

}]);