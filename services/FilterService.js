'use strict';

var moment = require('moment');
var models = require('../models');
var logger = require('../util/logger')();
var AppError = require('../util/AppError');


function FilterService() {

	var serviceSelf = this;

	// Formats a filter for being returned as JSON
	this.convertToResponse = function(filter) {
		if(!filter) {
			return filter;
		}

		var result = filter.dataValues;

		if(result.fromDate) {
			result.fromDate = moment(result.fromDate).format('YYYY-MM-DD');
		}

		if(result.toDate) {
			result.toDate = moment(result.toDate).format('YYYY-MM-DD');
		}

		return result;
	};

	// Saves a filter to the database
	this.addFilter = function(props, callback) {
		// Turn empty strings in the map into nulls
		for(var p in props) {
			if(typeof props[p] === 'string' && props[p].trim() === '') {
				props[p] = null;
			}
		}

		var instance = models.filter.build(props);

		instance.save().then(function(saved) {
			callback(null, serviceSelf.convertToResponse(saved));
		}, function(error) {
			logger.error(error);
			if(error.name === 'SequelizeUniqueConstraintError') {
				error = new AppError('Filter name must be unique');
			}
			callback(error, null);
		});
	};

	// Returns a filter with the given id
	this.getFilterById = function(id, callback) {
		models.filter.find({where: {id: id}}).then(function(filter) {
			callback(null, serviceSelf.convertToResponse(filter));
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	// Returns a filter with the given name
	this.getFilterByName = function(name, callback) {
		models.filter.find({where: {name: name}}).then(function(filter) {
			callback(null, serviceSelf.convertToResponse(filter));
		}, function(error) {
			logger.error(error);
			callback(error, null);
		});
	};

	// Returns filters with name or description matching 'query'
	// [
	// 	{
	// 		filter 1
	// 	},
	// 	{
	// 		filter 2
	// 	}
	// ]
	this.searchFilters = function(query, callback) {
		models.filter.findAll({
			where: models.Sequelize.or({
					name: {
						$ilike: '%' + query + '%'
					}
			},
			{
				description: {
					$ilike: '%' + query + '%'
				}
			}),
			limit: 50,
			order: ['name']
		}).then(function(filters) {
			filters.forEach(function(filter, i) {
				filters[i] = serviceSelf.convertToResponse(filter);
			});
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
