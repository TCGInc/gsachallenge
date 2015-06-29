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
			field: 'include_food',
			defaultValue: false
		},
		includeDrugs: {
			type: DataTypes.BOOLEAN,
			field: 'include_drugs',
			defaultValue: false
		},
		includeDevices: {
			type: DataTypes.BOOLEAN,
			field: 'include_devices',
			defaultValue: false
		},
		productDescription: {
			type: DataTypes.STRING,
			field: 'product_description'
		},
		reasonForRecall: {
			type: DataTypes.STRING,
			field: 'reason_for_recall'
		},
		recallingFirm: {
			type: DataTypes.STRING,
			field: 'recalling_firm'
		},
		includeClass1: {
			type: DataTypes.BOOLEAN,
			field: 'include_class1',
			defaultValue: false
		},
		includeClass2: {
			type: DataTypes.BOOLEAN,
			field: 'include_class2',
			defaultValue: false
		},
		includeClass3: {
			type: DataTypes.BOOLEAN,
			field: 'include_class3',
			defaultValue: false
		},
		stateAbbr: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			field: 'state_abbr'
		}
	}, {
		timestamps: true,
		underscored: true
	});

	return Filter;
};