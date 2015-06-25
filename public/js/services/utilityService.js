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
			"Florida": "fl",
			"Georgia": "ga",
			"Hawaii": "hi",
			"Idaho": "id",
			"Illinois": "il",
			"Indiana": "in",
			"Iowa": "ia",
			"Kansas": "ks",
			"Kentuky": "ky",
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

		parseDateString: function(rawDate) {
			return rawDate ? new Date(rawDate).toISOString().substring(0, 10) : "";
		},

		addAlert: function(alerts, type, message) {
			// type choices: "danger" (red), "success" (green), "info" (blue), "warning" (yellow)
			alerts.push({
				type: type,
				msg: message}
			);
		},

		closeAlert: function(alerts, index) {
			alerts.splice(index, 1);
		},

		closeAllAlerts: function(alerts) {
			alerts = [];
		}

	};
}]);