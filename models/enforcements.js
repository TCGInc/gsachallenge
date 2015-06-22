'use strict';

module.exports = function(sequelize, DataTypes) {
	var Enforcement = sequelize.define('enforcements', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		eventId: {
			type: DataTypes.STRING,
			field: 'event_id'
		},
		productType: {
			type: DataTypes.STRING,
			field: 'product_type'
		},
		reasonForRecall: {
			type: DataTypes.STRING,
			field: 'reason_for_recall'
		},
		recallingFirm: {
			type: DataTypes.STRING,
			field: 'recalling_firm'
		},
		productDescription: {
			type: DataTypes.STRING,
			field: 'product_description'
		},
		recallInitiationDate: {
			type: DataTypes.DATEONLY,
			field: 'recall_initiation_date'
		},
		reportDate: {
			type: DataTypes.DATEONLY,
			field: 'report_date'
		},
		stateAbbr: {
			type: DataTypes.STRING,
			field: 'state_abbr'
		}
	}, {
		tableName: 'v_state_enforcements',
		timestamps: false,
		underscored: true
	});

	return Enforcement;
};