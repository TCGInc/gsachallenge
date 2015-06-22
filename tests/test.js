/*eslint-disable no-unused-vars*/
/*eslint-disable no-unused-expressions*/
'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../index');
var models = require('../models');

describe('Filter tests', function() {

	describe('POST /filters', function() {

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


after(function() {
	app.server.close();
});
