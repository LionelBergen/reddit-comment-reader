class ErrorHandler
{
  constructor(databaseConnectionUrl, databaseUtil)
  {
    this.databaseConnectionUrl = databaseConnectionUrl;
    this.databaseUtil = databaseUtil;
  }
  
  handleError(errorDescription, errorTrace, additionalInfo)
  {
    const tableValues = [errorDescription, errorTrace, additionalInfo];
    console.error('ERROR: ' + tableValues);
    
    this.databaseUtil.WriteErrorToDatabase(this.databaseConnectionUrl, errorDescription, errorTrace, additionalInfo);
  }
}

module.exports = ErrorHandler;