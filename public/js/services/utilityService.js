app.service("utilityService", [function() {
	"use strict";

	return {
		stateNames: {
			"Alabama": "AL",
			"Alaska": "AK",
			"Arizona": "AZ",
			"Arkansas": "AR",
			"California": "CA",
			"Colorado": "CO",
			"Connecticut": "CT",
			"Delaware": "DE",
			"Florida": "FL",
			"Georgia": "GA",
			"Hawaii": "HI",
			"Idaho": "ID",
			"Illinois": "IL",
			"Indiana": "IN",
			"Iowa": "IA",
			"Kansas": "KS",
			"Kentuky": "KY",
			"Louisiana": "LA",
			"Maine": "ME",
			"Maryland": "MD",
			"Massachusetts": "MA",
			"Michigan": "MI",
			"Minnesota": "MN",
			"Mississippi": "MS",
			"Missouri": "MO",
			"Montana": "MT",
			"Nebraska": "NE",
			"Nevada": "NV",
			"New Hampshire": "NH",
			"New Jersey": "NJ",
			"New Mexico": "NM",
			"New York": "NY",
			"North Carolina": "NC",
			"North Dakota": "ND",
			"Ohio": "OH",
			"Oklahoma": "OK",
			"Oregon": "OR",
			"Pennsylvania": "PA",
			"Rhode Island": "RI",
			"South Carolina": "SC",
			"South Dakota": "SD",
			"Tennessee": "TN",
			"Texas": "TX",
			"Utah": "UT",
			"Vermont": "VT",
			"Virginia": "VA",
			"Washington": "WA",
			"West Virginia": "WV",
			"Wisconsin": "WI",
			"Wyoming": "WY"
		},

		addAlert(scope, type, message) {
			// type choices: "danger" (red), "success" (green), "info" (blue), "warning" (yellow)

			if (!scope.hasOwnProperty("alerts")) {
				scope.alerts = [];
			}

			scope.alerts.push({
				type: type,
				msg: message}
			);
		},

		closeAlert(scope, index) {
			scope.alerts.splice(index, 1);
		},

		closeAllAlerts(scope) {
			scope.alerts = [];
		},

		addModalAlert(scope, type, message) {
			// type choices: "danger" (red), "success" (green), "info" (blue), "warning" (yellow)

			if (!scope.hasOwnProperty("alerts")) {
				scope.modalAlerts = [];
			}

			scope.modalAlerts.push({
				type: type,
				msg: message}
			);
		},

		closeModalAlert(scope, index) {
			scope.modalAlerts.splice(index, 1);
		},

		closeAllModalAlerts(scope) {
			scope.modalAlerts = [];
		}

	};
}]);