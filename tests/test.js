var request = require('supertest');
var should = require('should');

var app = require('../index');

describe('GET /json', function() {
	it('returns json', function(done) {
		request(app.app)
			.get('/json')
			.set('Accept', 'application/json')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				res.body.should.have.property('str', 'abc database');
				res.body.should.have.property('num', 123);
				res.body.should.have.property('bool', true);
			})
			.end(done);
	});

	it('intentional failure', function(done) {
		request(app.app)
			.get('/json')
			.set('Accept', 'application/json')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				res.body.should.have.property('str', 'abc databas');
				res.body.should.have.property('num', 123);
				res.body.should.have.property('bool', true);
			})
			.end(done);
	});
});


after(function() {
	app.server.close();
});
