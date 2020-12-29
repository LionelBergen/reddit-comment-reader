require('./DatabaseUtil.js')();

class ErrorHandler
{
  constructor(databaseConnectionUrl)
  {
    this.databaseConnectionUrl = databaseConnectionUrl;
  }
  
  handleError(errorDescription, errorTrace, additionalInfo)
  {
    const tableValues = [errorDescription, errorTrace, additionalInfo];
    console.log('ERROR: ' + tableValues);
    
    WriteErrorToDatabase(this.databaseConnectionUrl, errorDescription, errorTrace, additionalInfo);
  }
}

module.exports = ErrorHandler;