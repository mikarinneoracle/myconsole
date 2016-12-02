var server = require('../server');
var assert = require('assert');
var request = require('supertest');
var username = process.env.USER || 'demo';
var password = process.env.PASS || 'demo';
var testFail = process.env.TEST_FAIL || false;

describe('basic tests', function() {
  var lastUser;

  it('get jobs test', function (done) {
    request(server)
        .get('/jobs')
        .auth(username, password)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          var result = res.body;
          console.log(result);
          assert.equal(testFail, false);
          done();
        });
  });
});
