app.directive("heatmap", function(utilityService) {

	function heatmap_palette(high, low, bands) {
		var hot = [255, 0, 0];
    	var cold = [0, 0, 255];
    	var bands = 50;
    	var delta = []; // Difference between color in each channel

		// Compute difference between each color
		for (var i = 0; i < 4; i++){
  			delta[i] = (hot[i] - cold[i]) / (bands + 1);
		}

		// Use that difference to create your bands
		for (i = 0; i <= bands + 1; i++){
			var r = Math.round(hot[0] - delta[0] * i);
			var g = Math.round(hot[1] - delta[1] * i);
			var b = Math.round(hot[2] - delta[2] * i);
			console.log("<div style='background-color: #" + dec2hex(r) + dec2hex(g) + dec2hex(b) + "'>Band " + i + "</div>");
		}	

		// A helper function for formatting
		function dec2hex(i) {
			return (i+0x100).toString(16).substr(-2).toUpperCase();
		}
	}

	// Intitialize default values for each state.
	var data = {};
	angular.forEach(utilityService.stateNames, function(name, abbreviation) {
		data[abbreviation] = {
			fillKey: "",
			numberOfEvents: 0
		};
	});

	return {
		restrict: "E",
		template: '<div></div>',
		link: function(scope, element, attrs) {

			function updateMap(stateCounts, map, data) {
				console.log(JSON.stringify(data));
				data = {
					AK: {
						fillKey: "LOW",
						numberOfEvents: 100
					}
				};
				map.updateChoropleth(data);
			}

			var map = new Datamap({
				element: element.children("div")[0],
				scope: 'usa',
        responsive: true,
				fills: {
			        LOW: 'blue',
			        MEDIUM: 'yellow',
			        HIGH: 'red',
			        defaultFill: 'green'
			    },
			    geographyConfig: {
			        popupTemplate: function(geo, data) {
			            return ['<div class="hoverinfo"><strong>',
			                    'Number of events in ' + geo.properties.name,
			                    ': ' + data.numberOfEvents,
			                    '</strong></div>'].join('');			            }
		        },
		        data: data
			});
			map.legend();

      window.addEventListener('resize', function(event){
        map.resize();
      });

			scope.$watch(attrs.stateCounts, function(stateCounts) {
				updateMap(stateCounts, map, data);
			});
		}
    }
});