/*eslint-disable no-unused-vars*/
/*eslint-disable no-unused-expressions*/
'use strict';

var request = require('supertest');
var should = require('should');

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

		it('errors about fromDate', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'zzzzzzzzzzzzz',
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
					res.body.status.should.have.property('message', 'Invalid fromDate.');
				})
				.end(done);
		});

		it('errors about toDate', function(done) {
			request(app.app)
				.post('/filters')
				.send({
					name: 'zzzzzzzzzzzzz',
					fromDate: '2015-06-19',
					includeDrugs: true
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					(res.body.result === null).should.be.true;
					(res.body.status === null).should.be.false;
					res.body.status.error.should.be.true;
					res.body.status.should.have.property('message', 'Invalid toDate.');
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

});

describe('FDA data tests', function() {
	describe('GET /fda/counts/:nouns', function() {
		it('returns results for all nouns', function(done) {
			request(app.app)
				.get('/fda/counts?includeDrugs=true&includeDevices=true&includeFood=true')
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
				.get('/fda/counts?includeFood=true')
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
				.get('/fda/counts?includeFood=true&fromDate=2222-01-01')
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
				.get('/fda/counts?includeFood=true&toDate=2222-01-01')
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
});


after(function() {
	app.server.close();
});
