app.service("utilityService", [function() {
	"use strict";

	return {
		stateNames: {
			"Alabama": "al",
			"Alaska": "ak",
			"Arizona": "az",
			"Arkansas": "ar",
			"California": "ca",
			"Colorado": "co",
			"Connecticut": "ct",
			"Delaware": "de",
			"District of Columbia": "dc",
			"Florida": "fl",
			"Georgia": "ga",
			"Hawaii": "hi",
			"Idaho": "id",
			"Illinois": "il",
			"Indiana": "in",
			"Iowa": "ia",
			"Kansas": "ks",
			"Kentucky": "ky",
			"Louisiana": "la",
			"Maine": "me",
			"Maryland": "md",
			"Massachusetts": "ma",
			"Michigan": "mi",
			"Minnesota": "mn",
			"Mississippi": "ms",
			"Missouri": "mo",
			"Montana": "mt",
			"Nebraska": "ne",
			"Nevada": "nv",
			"New Hampshire": "nh",
			"New Jersey": "nj",
			"New Mexico": "nm",
			"New York": "ny",
			"North Carolina": "nc",
			"North Dakota": "nd",
			"Ohio": "oh",
			"Oklahoma": "ok",
			"Oregon": "or",
			"Pennsylvania": "pa",
			"Rhode Island": "ri",
			"South Carolina": "sc",
			"South Dakota": "sd",
			"Tennessee": "tn",
			"Texas": "tx",
			"Utah": "ut",
			"Vermont": "vt",
			"Virginia": "va",
			"Washington": "wa",
			"West Virginia": "wv",
			"Wisconsin": "wi",
			"Wyoming": "wy"
		},

		toCamel: function(str) {
			return str.replace(/(_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
		},

		parseDateString: function(rawDate) {
			return rawDate ? new Date(rawDate).toISOString().substring(0, 10) : "";
		},

		addAlert: function(scope, type, message) {
			if (!scope.hasOwnProperty("alerts")) {
				scope.alerts = [];
			}

			// type choices: "danger" (red), "success" (green), "info" (blue), "warning" (yellow)
			scope.alerts.push({
				type: type,
				msg: message}
			);
		},

		closeAlert: function(scope, index) {
			scope.alerts.splice(index, 1);
		},

		closeAllAlerts: function(scope) {
			scope.alerts = [];
		},

		addModalAlert: function(scope, type, message) {
			if (!scope.hasOwnProperty("modalAlerts")) {
				scope.modalAlerts = [];
			}

			// type choices: "danger" (red), "success" (green), "info" (blue), "warning" (yellow)
			scope.modalAlerts.push({
				type: type,
				msg: message}
			);
		},

		closeModalAlert: function(scope, index) {
			scope.modalAlerts.splice(index, 1);
		},

		closeAllModalAlerts: function(scope) {
			scope.modalAlerts = [];
		}

	};
}]);