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
		status: {
			type: DataTypes.STRING,
			field: 'status'
		},
		recallingFirm: {
			type: DataTypes.STRING,
			field: 'recalling_firm'
		},
		city: {
			type: DataTypes.STRING,
			field: 'city'
		},
		state: {
			type: DataTypes.STRING,
			field: 'state'
		},
		country: {
			type: DataTypes.STRING,
			field: 'country'
		},
		voluntaryMandated: {
			type: DataTypes.STRING,
			field: 'voluntary_mandated'
		},
		initialFirmNotificationOfConsigneeOrPublic: {
			type: DataTypes.STRING,
			field: 'initial_firm_notification_of_consignee_or_public'
		},
		distributionPattern: {
			type: DataTypes.STRING,
			field: 'distribution_pattern'
		},
		recallNumber: {
			type: DataTypes.STRING,
			field: 'recall_number'
		},
		classification: {
			type: DataTypes.STRING,
			field: 'classification'
		},
		productDescription: {
			type: DataTypes.STRING,
			field: 'product_description'
		},
		codeInfo: {
			type: DataTypes.STRING,
			field: 'code_info'
		},
		codeInfoContinued: {
			type: DataTypes.STRING,
			field: 'code_info_continued'
		},
		productQuantity: {
			type: DataTypes.STRING,
			field: 'product_quantity'
		},
		reasonForRecall: {
			type: DataTypes.STRING,
			field: 'reason_for_recall'
		},
		recallInitiationDate: {
			type: DataTypes.DATEONLY,
			field: 'recall_initiation_date'
		},
		reportDate: {
			type: DataTypes.DATEONLY,
			field: 'report_date'
		},
		states: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			field: 'states'
		}
	}, {
		tableName: 'v_states_enforcements',
		timestamps: false,
		underscored: true
	});

	return Enforcement;
};