app.service("utilityService", [function() {
	"use strict";

	return {
		stateNames: {
			AL: "Alabama",
			AK: "Alaska",
			AZ: "Arizona",
			AR: "Arkansas",
			CA: "California",
			CO: "Colorado",
			CT: "Connecticut",
			DE: "Delaware",
			FL: "Florida",
			GA: "Georgia",
			HI: "Hawaii",
			ID: "Idaho",
			IL: "Illinois",
			IN: "Indiana",
			IA: "Iowa",
			KS: "Kansas",
			KY: "Kentuky",
			LA: "Louisiana",
			ME: "Maine",
			MD: "Maryland",
			MA: "Massachusetts",
			MI: "Michigan",
			MN: "Minnesota",
			MS: "Mississippi",
			MO: "Missouri",
			MT: "Montana",
			NE: "Nebraska",
			NV: "Nevada",
			NH: "New Hampshire",
			NJ: "New Jersey",
			NM: "New Mexico",
			NY: "New York",
			NC: "North Carolina",
			ND: "North Dakota",
			OH: "Ohio",
			OK: "Oklahoma",
			OR: "Oregon",
			PA: "Pennsylvania",
			RI: "Rhode Island",
			SC: "South Carolina",
			SD: "South Dakota",
			TN: "Tennessee",
			TX: "Texas",
			UT: "Utah",
			VT: "Vermont",
			VA: "Virginia",
			WA: "Washington",
			WV: "West Virginia",
			WI: "Wisconsin",
			WY: "Wyoming"
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
		}

	};
}]);