'use strict';

module.exports = function (app) {

	var FdaService = require('../services/FdaService')();


	app.get('/fda/counts/:nouns', function (req, res) {

		var errors = [];

		var nouns = req.params.nouns.split(',');

		nouns.forEach(function(noun) {
			if(!FdaService.isValidNoun(noun)) {
				errors.push("'"+noun+"' is not a valid noun.");
			}
		});

		if(errors.length === 0) {
			FdaService.getStateRecallCountsLocal(nouns, function getStateRecallCountsCallback(err, result) {
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
					message: errors.join("; ")
				}
			});
		}
	});

};
