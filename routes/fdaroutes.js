'use strict';

module.exports = function (app) {

	var FdaService = require('../services/FdaService')();


	app.get('/fda/counts/:nouns', function (req, res) {

		var nouns = req.params.nouns.split(',');

		FdaService.getStateRecallCounts(nouns, function getStateRecallCountsCallback(err, result) {
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
	});

};
