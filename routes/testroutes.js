module.exports = function(app) {

	app.get('/test', function (req, res) {
		res.send('Hello World!');
	});

	app.get('/json', function(req, res) {
		res.json({
			"str": "abc",
			"num": 123,
			"bool": true
		});
	});

}
