/*eslint-disable no-unused-vars*/
/*eslint-disable no-unused-expressions*/
'use strict';

var request = require('supertest');
var should = require('should');

var Promise = require('bluebird');
var app = require('../index');
var models = require('../models');

describe('Filter tests', function() {

	describe('POST /filters', function() {

		// Delete filter records named 'test' before running tests
		before(function(done) {
			models.filter.destroy({where: {name: 'test'}}).then(function() {
				done();
			}, function() {
				done();
			});
		});

		it('runs without error', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'test',
					fromDate: '2015-06-18',
					toDate: '2015-06-19',
					includeDrugs: true
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.false;
					res.body.result.should.have.property('name', 'test');
					(res.body.error === null).should.be.false;
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('errors about unique names', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'test',
					fromDate: '2015-06-18',
					toDate: '2015-06-19',
					includeDrugs: true
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					(res.body.status === null).should.be.false;
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Filter name must be unique');
				})
				.end(done);
		});

		it('errors about date order', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'zzzzzzzzzzzzz',
					fromDate: '2015-06-19',
					toDate: '2015-06-18',
					includeDrugs: true
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					(res.body.status === null).should.be.false;
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'fromDate is before toDate.');
				})
				.end(done);
		});

		it('errors about missing flags', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'zzzzzzzzzzzzz',
					fromDate: '2015-06-18',
					toDate: '2015-06-19'
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					(res.body.status === null).should.be.false;
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'At least one of includeFood, includeDrugs, or includeDevices must be true.');
				})
				.end(done);
		});

	});

	describe('GET /filters/:id', function() {

		var testId = -1;

		// Get id of known filter
		before(function(done) {
			models.filter.find({where: {name: 'test'}}).then(function(filter) {
				testId = filter.id;

				done();
			}, function() {
				done();
			});
		});

		it('returns the filter', function(done) {
			request(app.app)
				.get('/filters/' + testId)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.have.property('id', testId);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('returns nothing', function(done) {
			request(app.app)
				.get('/filters/999999')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

	});

	describe('GET /filters/search', function() {
		it('runs without error', function(done) {
			request(app.app)
				.get('/filters/search?q=test')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.be.instanceof(Array);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});
	});

});

describe('FDA data tests', function() {
	describe('GET /fda/counts', function() {
		it('returns results for all nouns', function(done) {
			request(app.app)
				.get('/fda/recalls/counts?includeDrugs=true&includeDevices=true&includeFood=true')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.false;
					res.body.result.should.have.property('aggregate');
					res.body.result.aggregate.should.have.property('md');
					res.body.result.should.have.property('byNoun');
					res.body.result.byNoun.should.have.property('drug');
					res.body.result.byNoun.drug.should.have.property('md');
					res.body.result.byNoun.should.have.property('device');
					res.body.result.byNoun.device.should.have.property('md');
					res.body.result.byNoun.should.have.property('food');
					res.body.result.byNoun.food.should.have.property('md');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('returns results for food', function(done) {
			request(app.app)
				.get('/fda/recalls/counts?includeFood=true')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.false;
					res.body.result.should.have.property('aggregate');
					res.body.result.aggregate.should.have.property('md');
					res.body.result.should.have.property('byNoun');
					res.body.result.byNoun.should.have.property('food');
					res.body.result.byNoun.food.should.have.property('md');
					res.body.result.byNoun.should.not.have.property('device');
					res.body.result.byNoun.should.not.have.property('drug');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('errors about fromDate', function(done) {
			request(app.app)
				.get('/fda/recalls/counts?includeFood=true&fromDate=2222-01-01')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', "Invalid fromDate.");
				})
				.end(done);
		});

		it('errors about toDate', function(done) {
			request(app.app)
				.get('/fda/recalls/counts?includeFood=true&toDate=2222-01-01')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', "Invalid toDate.");
				})
				.end(done);
		});
	});


	describe('GET /fda/autocomplete', function() {
		it('runs without error', function(done) {
			request(app.app)
				.get('/fda/autocomplete?field=recallingFirm&query=abc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.be.instanceof(Array);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('throws error about field', function(done) {
			request(app.app)
				.get('/fda/autocomplete?field=abc&query=abc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid field.');
				})
				.end(done);
		});

		it('throws error about query', function(done) {
			request(app.app)
				.get('/fda/autocomplete?field=recallingFirm')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid query.');
				})
				.end(done);
		});
	});

	describe('GET /fda/recalls', function() {
		it('runs without error', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=mn&limit=25&offset=0&orderBy=reasonForRecall&orderDir=desc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.total.should.be.a.Number;
					res.body.result.recalls.should.be.instanceof(Array);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('throws error about limit', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=mn&offset=0&orderBy=reasonForRecall&orderDir=desc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid limit (0 - 100).');
				})
				.end(done);
		});

		it('throws error about offset', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=mn&limit=25&&orderBy=reasonForRecall&orderDir=desc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid offset (> 0).');
				})
				.end(done);
		});

		it('throws error about orderBy', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=mn&limit=25&offset=0&orderDir=desc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid orderBy.');
				})
				.end(done);
		});

		it('throws error about orderDir', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=mn&limit=25&offset=0&orderBy=reasonForRecall')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid orderDir.');
				})
				.end(done);
		});

		it('throws error about stateAbbr', function(done) {
			request(app.app)
				.get('/fda/recalls?includeDrugs=true&stateAbbr=abc&limit=25&offset=0&orderBy=reasonForRecall&orderDir=asc')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid stateAbbr (abc).');
				})
				.end(done);
		});
	});

	describe('GET /fda/recalls/:noun/:id', function() {
		it('returns the recall', function(done) {
			request(app.app)
				.get('/fda/recalls/drug/D-560-2013')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.have.property('eventId', '65125');
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('returns nothing', function(done) {
			request(app.app)
				.get('/fda/recalls/drug/ZZZZZZ')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('throws error about noun', function(done) {
			request(app.app)
				.get('/fda/recalls/invalidnoun/"Z-2264-2014')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', "Invalid noun 'invalidnoun'.");
				})
				.end(done);
		});
	});

	describe('GET /fda/recalls/:noun/:id/states', function() {
		it('returns the states', function(done) {
			request(app.app)
				.get('/fda/recalls/device/Z-2194-2012/states')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.have.property('distributionStates', ['NATIONWIDE']);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('returns nothing', function(done) {
			request(app.app)
				.get('/fda/recalls/device/ZZZZZZZZZ/states')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('throws error about noun', function(done) {
			request(app.app)
				.get('/fda/recalls/invalidnoun/Z-2194-2012/states')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', "Invalid noun 'invalidnoun'.");
				})
				.end(done);
		});
	});

	describe('GET /fda/recalls/:noun/states', function() {
		it('returns the states', function(done) {
			request(app.app)
				.get('/fda/recalls/device/states')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result');
					res.body.result.should.have.property('distributionStates');
					res.body.should.have.property('status');
					res.body.status.error.should.be.false;
					(res.body.status.message === undefined).should.be.true;
				})
				.end(done);
		});

		it('throws error about noun', function(done) {
			request(app.app)
				.get('/fda/recalls/invalidnoun/states')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					res.body.should.have.property('result', null);
					res.body.should.have.property('status');
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', "Invalid noun 'invalidnoun'.");
				})
				.end(done);
		});
	});
});


after(function() {
	app.server.close();
});
