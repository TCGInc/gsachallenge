'use strict';

var moment = require('moment');
var AppResponse = require('../util/AppResponse');

module.exports = function (app) {

	var FilterService = require('../services/FilterService')();

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

	app.get('/filters/search', function (req, res) {
		var query = req.query.q;
		var name = req.query.name;

		if(query) {
			FilterService.searchFilters(query, getSendResponseCallback(res));
		}
		else if(name) {
			FilterService.getFilterByName(name, getSendResponseCallback(res));
		}
		else {
			res.json(new AppResponse(null, false, null));
		}
	});

	app.get('/filters/:id', function(req, res) {
		FilterService.getFilterById(req.params.id, getSendResponseCallback(res));
	});

	app.post('/filters', function(req, res) {
		// Validate parameters
		var errors = [];

		if(req.body.fromDate == null || !/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.fromDate)) {
			errors.push('Invalid fromDate.');
		}
		else if(req.body.toDate == null || !/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.toDate)) {
			errors.push('Invalid toDate.');
		}
		else {
			var m1 = moment(req.body.fromDate, 'YYYY-MM-DD');
			var m2 = moment(req.body.toDate, 'YYYY-MM-DD');

			if(m2.isBefore(m1)) {
				errors.push('fromDate is before toDate.');
			}
		}

		if(!req.body.includeFood && !req.body.includeDrugs && !req.body.includeDevices) {
			errors.push('At least one of includeFood, includeDrugs, or includeDevices must be true.');
		}

		// Return validation errors
		if(errors.length) {
			return res.json(new AppResponse(null, true, errors.join('; ')));
		}

		// Perform insert
		FilterService.addFilter(req.body, getSendResponseCallback(res));
	});

};
