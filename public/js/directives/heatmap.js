app.directive("heatmap", function(utilityService) {

	// Configuration settings for heatmap color bands.
	// See available options in public/js/external/colorbrewer.js
	var colorbrewerConfig = {
		palette: "YlOrRd",
		numberOfBands: 9 // Allowable number of color bands are 3-9.
	};

	// Generate map fills based on number of bands.
	var fillKeys = [];
	var fills = {};
	for (var i = 0; i < colorbrewerConfig.numberOfBands; i++) {
		fillKeys.push("band " + i);
		fills["band " + i] = colorbrewer[colorbrewerConfig.palette][colorbrewerConfig.numberOfBands][i];
	}

	// Intitialize default fill values for each state.
	var stateFillData = {};
	angular.forEach(utilityService.stateNames, function(name, abbreviation) {
		stateFillData[abbreviation] = {
			fillKey: "",
			numberOfEvents: 0
		};
	});

	return {
		restrict: "E",
		template: '<div></div>',
		link: function(scope, element, attrs) {

			// Initialize heatmap.
			var map = new Datamap({
				element: element.children("div")[0],
				scope: 'usa',
        		responsive: true,
				fills: fills,
			    geographyConfig: {
			        popupTemplate: function(geo, data) {
			            return ['<div class="hoverinfo"><strong>',
			                    'Number of events in ' + geo.properties.name,
			                    ': ' + data.numberOfEvents,
			                    '</strong></div>'].join('');			            }
		        },
		        data: stateFillData
			});
			map.legend();

			// Resize heatmap when window size changes.
      		window.addEventListener('resize', function(event){
        		map.resize();
      		});

      		// Refresh the heatmap colors based on the new state counts.
      		function updateMap(stateCounts, stateFillData, map) {

				// Calculate the domain of the state counts.
				var counts = d3.values(stateCounts);
				var countDomain = [d3.min(counts), d3.max(counts)];

				// Create lookup function used to calculate what heatmap band a state should be assigned to.
				var getFillKey = d3.scale.quantize().domain(countDomain).range(fillKeys);

				angular.forEach(stateCounts, function(count, state) {
					stateFillData[state.toUpperCase()] = {
						fillKey: getFillKey(count),
						numberOfEvents: count
					};
				});
				map.updateChoropleth(stateFillData);
			}

			// Update map after state-count attribute value is changed.
			scope.$watch(attrs.stateCounts, function(stateCounts) {
				if (Object.keys(stateCounts).length > 0) {
					updateMap(stateCounts, stateFillData, map);
				}
			});
		}
    }
});