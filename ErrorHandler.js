class ErrorHandler
{
	constructor(pg, databaseConnectionUrl)
	{
		this.pg = pg;
		this.databaseConnectionUrl = databaseConnectionUrl;
	}
  
  handleError(errorDescription, errorTrace, additionalInfo)
  {
    const tableValues = [errorDescription, errorTrace, additionalInfo];
    console.log('ERROR: ' + tableValues);
    
    this.pg.connect(this.databaseConnectionUrl, function(err, client, done) {
      if(err) {
        return console.error('Client error.', err);
      }
      const queryText = 'INSERT INTO "ErrorTable"(ErrorDescription, ErrorTrace, AdditionalInfo) VALUES($1, $2, $3)';
      
      client.query(queryText, tableValues, (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows[0]);
        }
      })
    });
  }
}

module.exports = ErrorHandler;