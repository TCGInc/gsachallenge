
var app = angular.module('gsaChallenge', ['angulartics', 'angulartics.google.analytics']);

app.service('testService', ['$http', function($http) {
	'use strict';

	return {
		test: function() {
			return $http.get('/json');
		}
	};
}]);

app.controller('testController', ['$scope', 'testService', function($scope, testService) {
	'use strict';

	testService.test().success(function(result) {
		$scope.testModel = result.str;
	});

	$scope.rerun = function() {
		$scope.testModel = 'Pulling again...';
		testService.test().success(function(result) {
			$scope.testModel = result.str;
		});
	};
}]);

