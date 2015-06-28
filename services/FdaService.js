'use strict';

var request = require('request');
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
	this.getStateRecallCounts = function(params, callback) {

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
				}
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
			};
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
	};

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
	};

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
		// Using raw queries here as the ORM doesn't appear to support the use of postgres' ANY()

		// Convert list of nouns to match the db product_type column
		var dbNouns = this.convertFdaToDbNouns(params.nouns);
		params.productType = dbNouns;

		var raw = 'FROM v_states_enforcements WHERE product_type = ANY(:productType) AND recall_initiation_date between :fromDate AND :toDate ';
		if(params.stateAbbr && params.stateAbbr.length) {
			raw += 'AND (';
			params.stateAbbr.forEach(function(state) {
				raw += "'" + state + "' = ANY(states) OR ";
			});
			raw = raw.slice(0, -3);
			raw += ') ';
		}

		if(params.productDescription) {
			params.productDescription = '%' + params.productDescription + '%';
			raw += 'AND product_description ilike :productDescription ';
		}
		if(params.reasonForRecall) {
			params.reasonForRecall = '%' + params.reasonForRecall + '%';
			raw += 'AND reason_for_recall ilike :reasonForRecall ';
		}
		if(params.recallingFirm) {
			params.recallingFirm = '%' + params.recallingFirm + '%';
			raw += 'AND recalling_firm ilike :recallingFirm ';
		}
		if(params.classifications.length) {
			raw += 'AND classification = ANY(:classifications) ';
		}

		// Get count of recalls matching criteria
		models.sequelize.query('SELECT COUNT(*) AS count ' + raw, {replacements: params, type: models.sequelize.QueryTypes.SELECT}).then(function(count) {
		
			raw += 'ORDER BY ' + models.enforcements.attributes[params.orderBy].field + ' ' + params.orderDir + ' LIMIT :limit OFFSET :offset';

			models.sequelize.query('SELECT * ' + raw, {replacements: params, model: models.enforcements}).then(function(recalls) {

				var result = {
					total: parseInt(count[0].count),
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
			url: 'https://api.fda.gov/' + noun + '/enforcement.json?search=event_id:' + id,
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
