'use strict';

var Promise = require('bluebird');
var request = require('request');
var _ = require('lodash');


function FdaService() {

	var serviceSelf = this;

	function addToStateCount(map, state, count) {
		if (map[state] === undefined) {
			map[state] = count;
		} else {
			map[state] += count;
		}
	}

	// Normalizes the FDA term counts by combining the full state name counts with the abbreviation counts
	// Also increments each state count by the number of 'nationwide' occurances
	function normalizeStates(counts) {
		var stateCounts = {};
		var nationwideCount = 0;

		counts.forEach(function (term) {
			if (serviceSelf.statesAbbr.indexOf(term.term) > -1) {
				addToStateCount(stateCounts, term.term, term.count);
			} else if (serviceSelf.statesMap[term.term]) {
				addToStateCount(stateCounts, serviceSelf.statesMap[term.term], term.count);
			} else if (term.term === 'nationwide') {
				nationwideCount = term.count;
			}
		});

		serviceSelf.statesAbbr.forEach(function (abbr) {
			addToStateCount(stateCounts, abbr, nationwideCount);
		});

		return stateCounts;
	}

	// Returns a map of recalls associated to that noun broken down by state (key = state, value = count)
	// {
	// 	'state abbreviation': count,
	// 	...
	// }
	function getStateRecallCountsByNoun(noun, callback) {
		var options = {
			url: 'https://api.fda.gov/' + noun + '/enforcement.json?count=distribution_pattern&limit=1000',
			json: true
		};

		request(options, function (err, res, body) {

			if (!err && res.statusCode === 200) {

				var stateCounts = normalizeStates(body.results);

				callback(null, stateCounts);
			} else {
				//err.message = 'The request to the FDA API failed';
				callback(err, null);
			}
		});
	}

	// Returns recalls counts associated to a list of nouns in aggregate and broken down by noun
	// {
	// 	aggregate: {
	// 		'state abbreviation': count,
	// 		...
	// 	},
	// 	byNoun: {
	// 		noun1: {
	// 			'state abbreviation': count,
	// 			...
	// 		},
	// 		noun2: {
	// 			'state abbreviation': count,
	// 			...
	// 		},
	// 		...
	// 	}
	// }
	function getStateRecallCounts(nouns, callback) {
		var promises = [];

		nouns.forEach(function (noun) {
			promises.push(serviceSelf.getStateRecallCountsByNoun(noun));
		});

		Promise.all(promises).then(function (counts) {

			var result = {
				aggregate: {},
				byNoun: {}
			};

			nouns.forEach(function (noun, idx) {
				result.byNoun[noun] = counts[idx];

				// add the individual noun counts into the aggregate
				_.merge(result.aggregate, counts[idx], function (a, b) {
					return (a || 0) + (b || 0);
				});
			});

			callback(null, result);

		}, function (error) {
			callback(error, null);
		});
	}

	this.getStateRecallCounts = Promise.promisify(getStateRecallCounts);

	this.getStateRecallCountsByNoun = Promise.promisify(getStateRecallCountsByNoun);

	this.statesAbbr = [
		'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
		'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
		'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
		'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
		'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy',
		'dc'
	];

	this.statesMap = {
		'alabama': 'al',
		'alaska': 'ak',
		'arizona': 'az',
		'arkansas': 'ar',
		'california': 'ca',
		'colorado': 'co',
		'connecticut': 'ct',
		'delaware': 'de',
		'florida': 'fl',
		'georgia': 'ga',
		'hawaii': 'hi',
		'idaho': 'id',
		'illinois': 'il',
		'indiana': 'in',
		'iowa': 'ia',
		'kansas': 'ks',
		'kentucky': 'ky',
		'louisiana': 'la',
		'maine': 'me',
		'maryland': 'md',
		'massachusetts': 'ma',
		'michigan': 'mi',
		'minnesota': 'mn',
		'mississippi': 'ms',
		'missouri': 'mo',
		'montana': 'mt',
		'nebraska': 'ne',
		'nevada': 'nv',
		'new hampshire': 'nh',
		'new jersey': 'nj',
		'new mexico': 'nm',
		'new york': 'ny',
		'north carolina': 'nc',
		'north dakota': 'nd',
		'ohio': 'oh',
		'oklahoma': 'ok',
		'oregon': 'or',
		'pennsylvania': 'pa',
		'rhode island': 'ri',
		'south carolina': 'sc',
		'south dakota': 'sd',
		'tennessee': 'tn',
		'texas': 'tx',
		'utah': 'ut',
		'vermont': 'vt',
		'virginia': 'va',
		'washington': 'wa',
		'west virginia': 'wv',
		'wisconsin': 'wi',
		'wyoming': 'wy',
		'district of columbia': 'dc',
		'washington, dc': 'dc'
	};

}

module.exports = function () {
	return new FdaService();
};
