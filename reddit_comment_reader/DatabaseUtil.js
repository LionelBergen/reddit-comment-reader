const { Pool, Client } = require('pg');

module.exports = function() {
  this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;
  this.WriteErrorToDatabase = writeErrorToDatabase;
};


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

function getCommentSearchObjectsFromDatabase(databaseConnectionString)
{
  return new Promise(function(resolve, reject) {
    let commentSearchPredicates = [];
    
    const client = createPgClient(databaseConnectionString);
    
    client.query('SELECT * FROM "RegexpComment"', function(err, result) {
      if (err) {
        reject(err);
      }
      
      let results = result.rows;

      for (let i=0; i<results.length; i++)
      {
        let commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
        commentSearchPredicates.push(commentSearchObject);
        console.log(commentSearchObject);
      }

      client.end();
      resolve(commentSearchPredicates);
    });
  });
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