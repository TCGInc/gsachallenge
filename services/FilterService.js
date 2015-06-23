'use strict';

var models = require('../models');
var logger = require('../util/logger')();
var AppError = require('../util/AppError');


function FilterService() {

	//var serviceSelf = this;

	this.isUniqueName = function(name, callback) {
		models.filter.find({name: name}).then(function(filter) {
			if(filter) {
				callback(null, false);
			}
			else {
				callback(null, true);
			}
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	this.addFilter = function(props, callback) {
		// Turn empty strings in the map into nulls
		for(var p in props) {
			if(typeof props[p] == 'string' && props[p].trim() == '') {
				props[p] = null;
			}
		}

		var instance = models.filter.build(props);

		instance.save().then(function() {
			callback(null, props);
		}, function(error) {
			logger.error(error);
			if(error.name === 'SequelizeUniqueConstraintError') {
				error = new AppError('Filter name must be unique');
			}
			callback(error, null);
		});
	};

	this.getFilterByName = function(name, callback) {
		models.filter.find({where: {name: name}}).then(function(filter) {
			callback(null, filter);
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	this.searchFilters = function(query, callback) {
		models.filter.findAll({where: models.Sequelize.or({name: {$ilike: '%' + query + '%'}}, {description: {$ilike: '%' + query + '%'}}), limit: 50}).then(function(filters) {
			callback(null, filters);
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

}

module.exports = function () {
	return new FilterService();
};
