const DatabaseUtil = require('./DatabaseUtil.js');
const RedditCommentError = require('./RedditCommentError.js');
const NetworkDebugger = require('./NetworkDebug.js');

class ErrorHandler {
  constructor(databaseConnectionUrl) {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }
  
  handleError(error) {
    // Write network status to DB error table
    
    if (typeof error == RedditCommentError) {
      DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, error.error, error.error.stack, error.error.toString(), error.redditComment);
    } else {
      // get network connectivity status
      NetworkDebugger.getHostPingStatus().then(function(connectionStatus) {
        DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, error, error.stack, connectionStatus.toString(), undefined);
      });
    }
  }
}

module.exports = ErrorHandler;