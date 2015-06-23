'use strict';

var Promise = require('bluebird');
var request = require('request');
var _ = require('lodash');
var models = require('../models');
var logger = require('../util/logger')();


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

	// Mapping from FDA API noun to database product_type
	this.NOUN_DB_TO_FDA = {
		"Drugs": "drug",
		"Devices": "device",
		"Food": "food"
	};

	// Mapping from database product_type to FDA API noun
	this.NOUN_FDA_TO_DB = {
		"drug": "Drugs",
		"device": "Devices",
		"food": "Food"
	};

	this.convertFdaToDbNouns = function(nouns) {
		var dbNouns = [];
		nouns.forEach(function(noun) {
			dbNouns.push(serviceSelf.NOUN_FDA_TO_DB[noun]);
		});

		return dbNouns;
	};

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
	function getStateRecallCountsLocal(params, callback) {

		// Convert list of nouns to match the db product_type column
		var dbNouns = this.convertFdaToDbNouns(params.nouns);

		var findAll = {
			attributes: [[models.Sequelize.fn('COUNT', '*'), 'count'], ['product_type', 'productType'], [models.Sequelize.fn('LOWER', models.sequelize.col('state_abbr')), 'stateAbbr']],
			where: {
				productType: {
					in: dbNouns
				},
				recallInitiationDate: {
					$between: [params.fromDate, params.toDate]
				},
			},
			group: ['product_type', 'state_abbr'],
			order: [['state_abbr'], ['product_type']]
		};

		if(params.productDescription) {
			findAll.where.productDescription = {
				$ilike: '%' + params.productDescription + '%'
			};
		}
		if(params.reasonForRecall) {
			findAll.where.reasonForRecall = {
				$ilike: '%' + params.reasonForRecall + '%'
			};
		}
		if(params.recallingFirm) {
			findAll.where.recallingFirm = {
				$ilike: '%' + params.recallingFirm + '%'
			};
		}
		if(params.classifications.length) {
			findAll.where.classification = {
				in: params.classifications
			}
		}

		// Query
		models.enforcements.findAll(findAll).then(function(results) {

			// Init result object
			var result = {
				aggregate: {},
				byNoun: {}
			};

			// Init state counts in aggregate result object
			serviceSelf.statesAbbr.forEach(function (abbr) {
				addToStateCount(result.aggregate, abbr, 0);
			});

			// Add noun objects to result object and init state counts
			params.nouns.forEach(function(noun) {
				result.byNoun[noun] = {};

				serviceSelf.statesAbbr.forEach(function (abbr) {
					addToStateCount(result.byNoun[noun], abbr, 0);
				});
			});

			// Add each database result to the aggregate and noun result lists
			results.forEach(function(cnt) {
				addToStateCount(result.aggregate, cnt.stateAbbr, parseInt(cnt.dataValues.count));

				addToStateCount(result.byNoun[serviceSelf.NOUN_DB_TO_FDA[cnt.productType]], cnt.stateAbbr, parseInt(cnt.dataValues.count));
			});

			callback(null, result);
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	}

	this.getStateRecallCountsLocal = Promise.promisify(getStateRecallCountsLocal);

	this.isValidNoun = function(noun) {
		return this.NOUN_FDA_TO_DB[noun] !== undefined;
	};

	this.getAutocompleteStrings = function(params, callback) {

		// Get column name corresponding to field name
		var columnName = models.enforcements.attributes[params.field].field;

		// Convert list of nouns to match the db product_type column
		var dbNouns = this.convertFdaToDbNouns(params.nouns);

		// Query params
		var findAll = {
			attributes: [[columnName, params.field]],
			where: {
				productType: {
					in: dbNouns
				}
			},
			group: [columnName],
			order: models.Sequelize.fn('lower', models.Sequelize.col(columnName)),
			limit: 50
		};

		findAll.where[params.field] = {
			$ilike: '%' + params.query + '%'
		};

		// Query
		models.enforcements.findAll(findAll).then(function(products) {
			var result = [];

			// Make string array from results
			products.forEach(function(product) {
				result.push(product[params.field]);
			});

			callback(null, result);
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	// Prep recalls to be returned in an http response
	this.recallsToResponse = function(recalls) {
		recalls.forEach(function(recall) {
			delete recall.dataValues.id;
		});

		return recalls;
	}

	// Returns recalls for the given filter criteria
	// {
	// 	total: total records matching criteria,
	// 	recalls: [
	// 		{
	// 			recall 1
	// 		},
	// 		{
	// 			recall 2
	// 		},
	// 		...
	// 	] 
	// }
	this.getRecallEvents = function(params, callback) {

		// Convert list of nouns to match the db product_type column
		var dbNouns = this.convertFdaToDbNouns(params.nouns);

		var findAll = {
			where: {
				productType: {
					in: dbNouns
				},
				recallInitiationDate: {
					$between: [params.fromDate, params.toDate]
				},
				stateAbbr: models.Sequelize.fn('UPPER', params.stateAbbr)
			}
		};

		if(params.productDescription) {
			findAll.where.productDescription = {
				$ilike: '%' + params.productDescription + '%'
			};
		}
		if(params.reasonForRecall) {
			findAll.where.reasonForRecall = {
				$ilike: '%' + params.reasonForRecall + '%'
			};
		}
		if(params.recallingFirm) {
			findAll.where.recallingFirm = {
				$ilike: '%' + params.recallingFirm + '%'
			};
		}
		if(params.classifications.length) {
			findAll.where.classification = {
				in: params.classifications
			}
		}

		// Get count of recalls matching criteria
		models.enforcements.count(findAll).then(function(count) {

			// After getting total count, add order, limit, and offset parameters
			findAll.order = [[models.enforcements.attributes[params.orderBy].field, params.orderDir]];
			findAll.limit = params.limit;
			findAll.offset = params.offset;

			// Query
			models.enforcements.findAll(findAll).then(function(recalls) {

				var result = {
					total: count,
					recalls: serviceSelf.recallsToResponse(recalls)
				};

				callback(null, result);
			}, function(error) {
				logger.error(error);
				callback(error, null);
			});
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	this.getRecallEvent = function(noun, id, callback) {
		var options = {
			url: 'https://api.fda.gov/' + noun + '/enforcement.json?search=event_id:'+id,
			json: true
		};

		request(options, function (err, res, body) {

			if (!err && res.statusCode === 200) {
				if(body.results.length) {
					callback(null, body.results[0]);
				}
				else {
					callback(null, null);
				}
			} else {
				callback(err, null);
			}
		});
	};

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
