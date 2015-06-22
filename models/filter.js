'use strict';

module.exports = function(sequelize, DataTypes) {
	var Filter = sequelize.define('filter', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: DataTypes.STRING,
		description: DataTypes.STRING,
		fromDate: {
			type: DataTypes.DATEONLY,
			field: 'from_date'
		},
		toDate: {
			type: DataTypes.DATEONLY,
			field: 'to_date'
		},
		includeFood: {
			type: DataTypes.BOOLEAN,
			field: 'include_food'
		},
		includeDrugs: {
			type: DataTypes.BOOLEAN,
			field: 'include_drugs'
		},
		includeDevices: {
			type: DataTypes.BOOLEAN,
			field: 'include_devices'
		}
	}, {
		timestamps: true,
		underscored: true
	});

	return Filter;
};