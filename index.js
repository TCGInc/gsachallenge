'use strict';

var path = require('path');
var express = require('express');
var winston = require('winston');
//var expressWinston = require('express-winston');
var bodyParser = require('body-parser');

// Logger
var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({
			filename: 'app.log'
		})
	]
});


var app = exports.app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	'extended': 'true'
}));

// application/json
app.use(bodyParser.json());

// Use express-winston for access logs
//app.use(expressWinston.logger({transports: [logger]}));

require('./routes/testroutes.js')(app);

var server = exports.server = app.listen(process.env.PORT || 80, function () {

  var host = server.address().address;
	var port = server.address().port;

	logger.info('Example app listening at http://%s:%s', host, port);

});

logger.info('Malone added simple log message');

logger.info('Maone another liune');



