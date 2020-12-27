module.exports = function() {
  this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;
};

function getCommentSearchObjectsFromDatabase(pg, url, callbackFunction)
{
  let commentSearchPredicates = [];
  pg.connect(url, function(err, client, done) {
    if(err) {
      return console.error('Client error.', err);
    }

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
    });
  });
	
  return commentSearchPredicates;
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