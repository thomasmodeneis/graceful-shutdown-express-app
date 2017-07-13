'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverDestroy = require('server-destroy');

var _serverDestroy2 = _interopRequireDefault(_serverDestroy);

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExpressGracefulShutdown = function () {
  function ExpressGracefulShutdown() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ExpressGracefulShutdown);

    // Parse options
    this.middleware = this.middleware.bind(this);
    this.gracefulShutdownMode = false;
    this.READINESS_PROBE_DELAY = options.READINESS_PROBE_DELAY || 2 * 2 * 1000;
    this.DEBUG_DELAY = options.DEBUG_DELAY || 2000;
    this.logger = options.logger || console;
  }

  _createClass(ExpressGracefulShutdown, [{
    key: 'setServer',
    value: function setServer(httpServer) {
      var _this = this;

      this.httpServer = httpServer;
      (0, _serverDestroy2.default)(this.httpServer);

      process.on('SIGTERM', function () {
        _this.logger.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
        _this.gracefulShutdownMode = true;

        // Wait a little bit to give enough time for Kubernetes readiness probe to fail (we don't want more traffic)
        // Don't worry livenessProbe won't kill it until (failureThreshold: 3) => 30s
        // http://www.bite-code.com/2015/07/27/implementing-graceful-shutdown-for-docker-containers-in-go-part-2/
        // Graceful stop
        setTimeout(function () {
          var serverDestroy = (0, _es6Promisify2.default)(_this.httpServer.destroy, _this.httpServer);
          _this.logger.info('Server is shutting down...', new Date().toISOString());

          serverDestroy() // close server first (ongoing requests)
          .then(function () {
            _this.logger.info('Successful graceful shutdown', new Date().toISOString());
            process.exit(0);
          }).catch(function (err) {
            _this.logger.error('Error happened during graceful shutdown', err);
            process.exit(1);
          });
        }, _this.READINESS_PROBE_DELAY + _this.DEBUG_DELAY);
      });
    }

    // Middleware

  }, {
    key: 'middleware',
    value: function middleware() {
      var _this2 = this;

      return function (req, res, next) {
        _this2.logger.log('Middleware -> gracefulShutdownMode:' + _this2.gracefulShutdownMode);
        if (_this2.gracefulShutdownMode) {
          return res.sendStatus(503);
        }
        return next();
      };
    }
  }]);

  return ExpressGracefulShutdown;
}();

function Startup(options) {
  return new ExpressGracefulShutdown(options);
}

module.exports.Startup = Startup;
module.exports.ExpressGracefulShutdown = ExpressGracefulShutdown;