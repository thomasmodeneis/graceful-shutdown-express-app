import enableDestroy from 'server-destroy';
import promisify from 'es6-promisify';

class ExpressGracefulShutdown {

  constructor(options = {}) {
    // Parse options
    this.middleware = this.middleware.bind(this);
    this.gracefulShutdownMode = false;
    this.READINESS_PROBE_DELAY = options.READINESS_PROBE_DELAY || 2 * 2 * 1000;
    this.DEBUG_DELAY = options.DEBUG_DELAY || 2000;
    this.logger = options.logger || console;
  }

  setServer(httpServer) {
    this.httpServer = httpServer;
    enableDestroy(this.httpServer);

    process.on('SIGTERM', () => {
      this.logger.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
      this.gracefulShutdownMode = true;

      // Wait a little bit to give enough time for Kubernetes readiness probe to fail (we don't want more traffic)
      // Don't worry livenessProbe won't kill it until (failureThreshold: 3) => 30s
      // http://www.bite-code.com/2015/07/27/implementing-graceful-shutdown-for-docker-containers-in-go-part-2/
      // Graceful stop
      setTimeout(() => {
        const serverDestroy = promisify(this.httpServer.destroy, this.httpServer);
        this.logger.info('Server is shutting down...', new Date().toISOString());

        serverDestroy()// close server first (ongoing requests)
        .then(() => {
          this.logger.info('Successful graceful shutdown', new Date().toISOString());
          process.exit(0);
        })
        .catch((err) => {
          this.logger.error('Error happened during graceful shutdown', err);
          process.exit(1);
        });
      }, this.READINESS_PROBE_DELAY + this.DEBUG_DELAY);
    });
  }


  // Middleware
  middleware() {
    return (req, res, next) => {
      if (this.gracefulShutdownMode) {
        return res.sendStatus(503);
      }
      return next();
    };
  }

}

function Startup(options) {
  return new ExpressGracefulShutdown(options);
}

module.exports.Startup = Startup;
module.exports.ExpressGracefulShutdown = ExpressGracefulShutdown;

