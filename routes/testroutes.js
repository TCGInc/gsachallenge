module.exports = function(app) {

	app.get('/test', function (req, res) {
		res.send('Hello World!');
	});

	app.get('/json', function(req, res) {

		var pg = require('pg');
		var conString = "postgres://gsac:gsac123@localhost/gsac";

		pg.connect(conString, function(err, client, done) {

			if (err) {
				return console.error('error fetching client from pool', err);
			}

			client.query('SELECT display FROM test WHERE id = $1', ['1'], function(err, result) {

				done();

				if(err) {
					return console.error('error running query', err);
				}

				res.json({
					"str": "from db2: " + result.rows[0].display,
					"num": 123,
					"bool": true
				});

				client.end();
			});
		});
		
	});

}
