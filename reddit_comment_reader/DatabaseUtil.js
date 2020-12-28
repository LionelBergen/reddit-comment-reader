module.exports = function() {
  this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;
  this.WriteErrorToDatabase = writeErrorToDatabase;
};

const { Pool, Client } = require('pg');

function writeErrorToDatabase(databaseConnectionString, errorDescription, errorTrace, additionalInfo) {
  const client = createPgClient(databaseConnectionString);
  const queryText = 'INSERT INTO "ErrorTable"(ErrorDescription, ErrorTrace, AdditionalInfo) VALUES($1, $2, $3)';
  const tableValues = [errorDescription, errorTrace, additionalInfo];
  
  client.query(queryText, tableValues, (err, res) => {
    if (err) {
      console.error(err.stack);
    } else {
      console.error(res.rows[0]);
    }
    client.end();
  });
}

function getCommentSearchObjectsFromDatabase(databaseConnectionString, callbackFunction)
{
  let commentSearchPredicates = [];
  
  const client = createPgClient(databaseConnectionString);
  
  client.query('SELECT * FROM "RegexpComment"', function(err, result) {
    let results = result.rows;

    for (let i=0; i<results.length; i++)
    {
      let commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
      commentSearchPredicates.push(commentSearchObject);
      console.log(commentSearchObject);
    }
    
    callbackFunction(commentSearchPredicates);

    if(err) {
      return console.error('Query error.', err);
    }
    client.end();
  });
	
  return commentSearchPredicates;
}

function createPgClient(databaseConnectionString) {
  const client = new Client(databaseConnectionString);
  client.connect();
  
  return client;
}

function createCommentSearchObjectFromDatabaseObject(dbResult)
{
  let commentExpressionText = dbResult.CommentMatch;
  let subredditExpressionText = dbResult.SubredditMatch;
	
  // Always use case insensetive. Strip the case insensetive flag if it exists (JS doesnt support it)
  commentExpressionText = commentExpressionText.replace('(?i)', '');
  subredditExpressionText = subredditExpressionText.replace('(?i)', '');
  replyMessageText = dbResult.ReplyMessage;
	
  // Support reddit line break
  replyMessageText = replyMessageText.replace(/\\n/g, '  \r\n');
  console.log('****************************');
  console.log(replyMessageText);
  console.log('****************************');
	
  let subredditMatchExpression = new RegExp(subredditExpressionText, 'i');
  let commentMatchExpression = new RegExp(commentExpressionText, 'i');
	
  return {SubredditMatch: subredditMatchExpression, 
    CommentMatch: commentMatchExpression,
    ReplyMessage: replyMessageText,
    IsReplyRegexp: dbResult.IsReplyRegexp,
    ClientHandler: dbResult.Handle};
}