'use strict';

var moment = require('moment');
var models = require('../models');
var AppResponse = require('../util/AppResponse');

module.exports = function (app) {

	var FdaService = require('../services/FdaService')();

	// Callback which sends a the result object or error as json
	function getSendResponseCallback(res) {
		return function commonCallback(err, result) {
			if(err) {
				res.json(new AppResponse(null, true, err.message));
			}
			else {
				res.json(new AppResponse(result, false, null));
			}
		};
	}

	// Validates a request (via closure) and sends an error if the validation fails or calls an action closure on success
	function validateAndRespond(req, res, validations, action) {
		var preproc = validations(req);

		if(!preproc.errors.length) {
			action(preproc);
		}
		else {
			res.json(new AppResponse(null, true, preproc.errors.join("; ")));
		}
	}

	// Processes the common recall filtering criteria shared by the recalls and recall counts endpoints
	function processFilteringRequestParams(req) {
		var searchParams = {
			nouns: [],
			classifications: []
		};
		var errors = [];

		if(req.query.includeFood === 'true') {
			searchParams.nouns.push('food');
		}
		if(req.query.includeDrugs === 'true') {
			searchParams.nouns.push('drug');
		}
		if(req.query.includeDevices === 'true') {
			searchParams.nouns.push('device');
		}

		// Validate fromDate param
		if(req.query.fromDate) {
			// Ensure YYYY-MM-DD format
			// Regex from http://www.regular-expressions.info/dates.html
			if(!/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(req.query.fromDate)) {
				errors.push('Invalid fromDate.');
			}
			else {
				searchParams.fromDate = moment(req.query.fromDate, 'YYYY-MM-DD').toDate();
			}
		}
		else {
			// Default to far past date
			searchParams.fromDate = moment('1900-01-01', 'YYYY-MM-DD').toDate();
		}

		// Validate toDate param
		if(req.query.toDate) {
			// Ensure YYYY-MM-DD format
			if(!/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(req.query.toDate)) {
				errors.push('Invalid toDate.');
			}
			else {
				searchParams.toDate = moment(req.query.toDate, 'YYYY-MM-DD').toDate();
			}
		}
		else {
			// Default to far future date
			searchParams.toDate = moment('3000-01-01', 'YYYY-MM-DD').toDate();
		}

		if(req.query.productDescription && req.query.productDescription.trim().length) {
			searchParams.productDescription = req.query.productDescription;
		}

		if(req.query.reasonForRecall && req.query.reasonForRecall.trim().length) {
			searchParams.reasonForRecall = req.query.reasonForRecall;
		}

		if(req.query.recallingFirm && req.query.recallingFirm.trim().length) {
			searchParams.recallingFirm = req.query.recallingFirm;
		}

		if(req.query.includeClass1 === 'true') {
			searchParams.classifications.push('Class I');
		}
		if(req.query.includeClass2 === 'true') {
			searchParams.classifications.push('Class II');
		}
		if(req.query.includeClass3 === 'true') {
			searchParams.classifications.push('Class III');
		}

		return {
			searchParams: searchParams,
			errors: errors
		};
	}

	// Return counts of recalls on a state by state basis
	app.get('/fda/recalls/counts', function (req, res) {
		validateAndRespond(req, res, processFilteringRequestParams, function(preproc) {
			FdaService.getStateRecallCounts(preproc.searchParams, getSendResponseCallback(res));
		});
	});

	// Return autocomplete suggestions for a given field
	app.get('/fda/autocomplete', function(req, res) {
		validateAndRespond(req, res, function() {
			var preproc = {
				errors: [],
				searchParams: {
					nouns: []
				}
			};

			var field = req.query.field;
			var query = req.query.query;

			if(req.query.includeFood === 'true') {
				preproc.searchParams.nouns.push('food');
			}
			if(req.query.includeDrugs === 'true') {
				preproc.searchParams.nouns.push('drug');
			}
			if(req.query.includeDevices === 'true') {
				preproc.searchParams.nouns.push('device');
			}

			// Verify field was provided and it's a recall field
			if(field == null || !field.trim().length || models.enforcements.attributes[field] == null) {
				preproc.errors.push('Invalid field.');
			}
			else {
				preproc.searchParams.field = field;
			}

			// Verify query was provided
			if(query == null || !query.trim().length) {
				preproc.errors.push('Invalid query.');
			}
			else {
				preproc.searchParams.query = query;
			}

			return preproc;
		}, function(preproc) {
			FdaService.getAutocompleteStrings(preproc.searchParams, getSendResponseCallback(res));
		});
	});

	// Return paginated recalls matching a given criteria
	app.get('/fda/recalls', function(req, res) {
		validateAndRespond(req, res, function() {
			// Validate commmon parameters
			var preproc = processFilteringRequestParams(req);

			// Validate state
			if(!req.query.stateAbbr || FdaService.statesAbbr.indexOf(req.query.stateAbbr) === -1) {
				preproc.errors.push('Invalid stateAbbr.');
			}
			else {
				preproc.searchParams.stateAbbr = req.query.stateAbbr;
			}

			// Validate limit (records per page)
			if(!req.query.limit) {
				preproc.errors.push('Invalid limit (0 - 100).');
			}
			else {
				var limit = parseInt(req.query.limit);
				if(isNaN(limit) || limit > 100 || limit < 0) {
					preproc.errors.push('Invalid limit (0 - 100).');
				}
				else {
					preproc.searchParams.limit = limit;
				}
			}

			// Validate offset (skip n records)
			if(!req.query.offset) {
				preproc.errors.push('Invalid offset (> 0).');
			}
			else {
				var offset = parseInt(req.query.offset);
				if(isNaN(offset) || offset < 0) {
					preproc.errors.push('Invalid offset (> 0).');
				}
				else {
					preproc.searchParams.offset = offset;
				}
			}

			// Validate orderBy
			if(!req.query.orderBy || models.enforcements.attributes[req.query.orderBy] == null) {
				preproc.errors.push('Invalid orderBy.');
			}
			else {
				preproc.searchParams.orderBy = req.query.orderBy;
			}

			// Validate orderDir
			if(!req.query.orderDir || (req.query.orderDir !== 'asc' && req.query.orderDir !== 'desc')) {
				preproc.errors.push('Invalid orderDir.');
			}
			else {
				preproc.searchParams.orderDir = req.query.orderDir;
			}

			return preproc;
		}, function(preproc) {
			FdaService.getRecallEvents(preproc.searchParams, getSendResponseCallback(res));
		});

	});

	// Return a specific recall by noun and id
	app.get('/fda/recalls/:noun/:id', function(req, res) {
		validateAndRespond(req, res, function() {
			var preproc = {
				errors: []
			};

			if(!FdaService.isValidNoun(req.params.noun)) {
				preproc.errors.push("Invalid noun '" + req.params.noun + "'.");
			}

			return preproc;
		}, function() {
			FdaService.getRecallEvent(req.params.noun, req.params.id, getSendResponseCallback(res));
		});
	});
};
