const DatabaseUtil = require('./DatabaseUtil.js');
const RedditCommentError = require('./RedditCommentError.js');
const NetworkDebugger = require('./NetworkDebug.js');

const LogManager = require('../tools/Logger.js');
const Logger = LogManager.createInstance('ErrorHandler.js');

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

module.exports = ErrorHandler;