describe("testController", function() {

	beforeEach(module("gsaChallenge"));

	describe("testModule scope", function() {

		it("should be set correctly", inject(function($controller, $httpBackend) {

			var scope = {};

			// Set up the mock REST endpoint.
			$httpBackend.when("GET", "/json").respond({
				"str": "abc database",
				"num": 123,
				"bool": true
			});

			var testController = $controller("testController", { $scope: scope });

			$httpBackend.flush();

			scope.testModel.should.equal("abc database");

		}));
	});
});


