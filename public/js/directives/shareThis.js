app.directive("shareThis", function($modal) {
	return {
		restrict: "E",
		link: function(scope, element, attrs) {
		
		},
		controller: function($scope, $element, $attrs) {
			$scope.$watch($attrs.url, function(newValue, oldValue) {
				if(newValue != null) {
					angular.element("#share-"+$attrs.service).remove();

					$element.append('<span id="share-'+$attrs.service+'"></span>');

					stWidget.addEntry({
						"service": $attrs.service,
						"element": document.getElementById('share-'+$attrs.service),
						"url": newValue,
						"type": 'large',
						"title": 'FDA Recall Enforcement Events'
					});
				}
			});			
		}
    }
});