const DatabaseUtil = require('./DatabaseUtil.js');
const RedditCommentError = require('./RedditCommentError.js');

class ErrorHandler {
  constructor(databaseConnectionUrl) {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }
  
  handleError(error) {
    if (typeof error == RedditCommentError) {
      DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, error.error, error.error.stack, error.error.toString(), error.redditComment);
    } else {
      DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, error, error.stack, error.toString(), undefined);
    }
  }
}

module.exports = ErrorHandler;