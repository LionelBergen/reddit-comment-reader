import DatabaseUtil from './database/database-util.js';
import NetworkDebugger from './network-debug.js';

import LogManager from './logger.js';
const Logger = LogManager.createInstance('error-handler.js');

class ErrorHandler {
  constructor(databaseConnectionUrl) {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }

  async handleError(error) {
    Logger.error(error);
    if (typeof error === 'object') {
      await DatabaseUtil.writeErrorToDatabase(
        this.databaseConnectionUrl,
        error.error,
        error.error?.stack,
        error.error,
        error.redditComment);
    } else {
      const databaseConnectionUrl = this.databaseConnectionUrl;
      // get network connectivity status
      const connectionStatus = await NetworkDebugger.getHostPingStatus();
      const connectionStatusAsString = connectionStatus.map((connectStatus) => {
        return connectStatus.inputHost + ' is alive?: ' + connectStatus.alive;
      }).join(",");
      await DatabaseUtil.writeErrorToDatabase(
        databaseConnectionUrl,
        error,
        error.stack,
        connectionStatusAsString,
        undefined
      );
    }
  }
}

export default ErrorHandler;
