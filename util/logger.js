var winston = require('winston');

var logger;

function initLogger() {

	if(!logger) {
		logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)(),
				new (winston.transports.File)({
					filename: 'app.log'
				})
			]
		});
	}

	return logger;
}


module.exports = initLogger;