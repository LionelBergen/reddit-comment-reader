const DatabaseUtil = require('../../reddit_comment_Reader/tools/DatabaseUtil.js');

class ErrorHandler
{
  constructor(databaseConnectionUrl)
  {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }
  
  handleError(errorDescription, errorTrace, additionalInfo)
  {
    const tableValues = [errorDescription, errorTrace, additionalInfo];
    console.error('ERROR: ' + tableValues);
    
    DatabaseUtil.writeErrorToDatabase(this.databaseConnectionUrl, errorDescription, errorTrace, additionalInfo);
  }
}

module.exports = ErrorHandler;