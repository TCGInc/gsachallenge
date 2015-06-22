'use strict';

var moment = require('moment');
var models = require('../models');
var logger = require('../util/logger')();

module.exports = function (app) {

	var FdaService = require('../services/FdaService')();

	function processFilteringRequestParams(req) {
		var searchParams = {
			nouns: []
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

		if(req.query.classification && req.query.classification.trim().length) {
			searchParams.classification = req.query.classification;
		}

		return {
			searchParams: searchParams,
			errors: errors
		};
	}


	app.get('/fda/recalls/counts', function (req, res) {

		var preproc = processFilteringRequestParams(req);

		if(!preproc.errors.length) {
			FdaService.getStateRecallCountsLocal(preproc.searchParams, function getStateRecallCountsCallback(err, result) {
				if(err) {
					console.error(err);
					console.error(err.stack);
					res.json({
						result: null,
						status: {
							error: true,
							message: err.message
						}
					});
				}
				else {
					res.json({
						result: result,
						status: {
							error: false
						}
					});
				}
			});
		}
		else {
			res.json({
				result: null,
				status: {
					error: true,
					message: preproc.errors.join("; ")
				}
			});
		}
	});


	app.get('/fda/autocomplete', function(req, res) {
		var field = req.query.field;
		var query = req.query.query;

		var searchParams = {
			nouns: []
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

		// Verify field was provided and it's a recall field
		if(field == null || !field.trim().length || models.enforcements.attributes[field] == null) {
			errors.push('Invalid field.');
		}
		else {
			searchParams.field = field;
		}

		// Verify query was provided
		if(query == null || !query.trim().length) {
			errors.push('Invalid query.');
		}
		else {
			searchParams.query = query;
		}


		if(!errors.length) {
			FdaService.getAutocompleteStrings(searchParams, function(err, result) {
				if(err) {
					logger.error(err);
					res.json({
						result: null,
						status: {
							error: true,
							message: err.message
						}
					});
				}
				else {
					res.json({
						result: result,
						status: {
							error: false
						}
					});
				}
			});
		}
		else {
			res.json({
				result: null,
				status: {
					error: true,
					message: errors.join("; ")
				}
			});
		}
	});

	app.get('/fda/recalls', function(req, res) {

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
		if(!req.query.orderDir || (req.query.orderDir != 'asc' && req.query.orderDir != 'desc')) {
			preproc.errors.push('Invalid orderDir.');
		}
		else {
			preproc.searchParams.orderDir = req.query.orderDir;
		}

		if(!preproc.errors.length) {
			FdaService.getRecallEvents(preproc.searchParams, function getRecallEventsCallback(err, result) {
				if(err) {
					console.error(err);
					console.error(err.stack);
					res.json({
						result: null,
						status: {
							error: true,
							message: err.message
						}
					});
				}
				else {
					res.json({
						result: result,
						status: {
							error: false
						}
					});
				}
			});
		}
		else {
			res.json({
				result: null,
				status: {
					error: true,
					message: preproc.errors.join("; ")
				}
			});
		}
	});
};
