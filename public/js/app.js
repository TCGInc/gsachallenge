var app = angular.module('gsaChallenge', []);

app.service('testService', ['$http', function($http) {
	return {
		test: function() {
			return $http.get('/json');
		}
	}
}]);

app.controller('testController', ['$scope', 'testService', function($scope, testService) {
	testService.test().success(function(result) {
		$scope.testModel = result.str;
	});
}]);

