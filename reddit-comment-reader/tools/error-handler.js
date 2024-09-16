import DatabaseUtil from './database-util.js';
import NetworkDebugger from './network-debug.js';

import LogManager from './logger.js';
const Logger = LogManager.createInstance('error-handler.js');

class ErrorHandler {
  constructor(databaseConnectionUrl) {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }

  handleError(error) {
    Logger.error(error);
    if (typeof error === 'object') {
      DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, error.error, error.error.stack, error.error, error.redditComment);
    } else {
      const databaseConnectionUrl = this.databaseConnectionUrl;
      // get network connectivity status
      NetworkDebugger.getHostPingStatus().then(function(connectionStatus) {
        DatabaseUtil.writeErrorToDatabase(databaseConnectionUrl, error, error.stack, connectionStatus.toString(), undefined);
      });
    }
  }
}

export default ErrorHandler;
