'use strict';

var moment = require('moment');

module.exports = function (app) {

	var FilterService = require('../services/FilterService')();

	app.get('/filters/search', function (req, res) {
		var query = req.query.q;
		var name = req.query.name;

		if(query) {
			FilterService.searchFilters(query, function(err, filters) {
				if(err) {
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
						result: filters,
						status: {
							error: false
						}
					});
				}
			});
		}
		else if(name) {
			FilterService.getFilterByName(name, function(err, filter) {
				if(err) {
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
						result: filter,
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
					error: false
				}
			});
		}
	});

	app.post('/filters', function(req, res) {
		// Validate parameters
		var errors = [];

		if(req.body.fromDate == null) {
			errors.push('Invalid fromDate.');
		}
		else if(req.body.toDate == null) {
			errors.push('Invalid toDate.');
		}
		else {
			var m1 = moment(req.body.fromDate);
			var m2 = moment(req.body.toDate);

			if(m2.isBefore(m1)) {
				errors.push('fromDate is before toDate.');
			}
		}

		if(!req.body.includeFood && !req.body.includeDrugs && !req.body.includeDevices) {
			errors.push('At least one of includeFood, includeDrugs, or includeDevices must be true.');
		}

		// Return validation errors
		if(errors.length) {
			return res.json({
				result: null,
				status: {
					error: true,
					message: errors.join('; ')
				}
			});
		}

		// Perform insert
		FilterService.addFilter(req.body, function(err) {
			if(err) {
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
					result: req.body,
					status: {
						error: false
					}
				});
			}
		});
	});

};
