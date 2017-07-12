const should = require('chai').should();
const request = require('request');
const exec = require('child_process').exec;
const killcmd = 'npm run kill';
const PORT = process.env.PORT || 16789;

describe('http-shutdown', function () {

  before((done) => {
    setTimeout(function () {
      done();
    }, 1000)
  });

  after((done) => {
    done();
  });

  it('Should start with 200 and respond with 503 when running shutdown graceful', function (done) {


    request.get(`http://localhost:${PORT}/`, function (err, response) {
      should.not.exist(err);
      response.statusCode.should.equal(200);

      exec(killcmd, function (error, stdout, stderr) {
        should.not.exist(error);

        request.get('http://localhost:16789/', function (err, response) {
          should.not.exist(err);
          response.statusCode.should.equal(503);
          done()
        });

      });
    });

  });


});
