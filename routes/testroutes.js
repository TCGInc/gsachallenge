'use strict';

module.exports = function (app) {

	app.get('/test', function (req, res) {
		res.send('Hello World!');
	});

	app.get('/json', function (req, res) {

		var pg = require('pg');
		var conString = "postgres://gsac:gsac123@localhost/gsac";

		var client = new pg.Client(conString);
		client.connect(function (err) {

			if (err) {
				return console.error('error fetching client from pool', err);
			}

			client.query('SELECT display FROM test WHERE id = $1', ['1'], function (err2, result) {

				if (err2) {
					console.log(JSON.stringify(err2));
					client.end();
					return console.error('error running query', err2);
				}

				res.json({
					"str": result.rows[0].display,
					"num": 123,
					"bool": true
				});

				client.end();
			});
		});
	});

};
