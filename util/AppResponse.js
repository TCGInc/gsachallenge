'use strict';

module.exports = function AppResponse(result, error, statusMessage) {
	this.result = result;
	this.status = {
		error: error != null ? error : false
	};

	if(statusMessage != null) {
		this.status.message = statusMessage;
	}
};