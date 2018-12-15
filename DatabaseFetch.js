module.exports = function() {
	this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;
};

function getCommentSearchObjectsFromDatabase(pg, url, callbackFunction)
{
	var commentSearchPredicates = [];
	pg.connect(url, function(err, client, done) {
		if(err) {
			return console.error('Client error.', err);
		}

		client.query('SELECT * FROM "RegexpComment"', function(err, result) {
			var results = result.rows;

			for (var i=0; i<results.length; i++)
			{
				var commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
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
	var commentExpressionText = dbResult.CommentMatch;
	var subredditExpressionText = dbResult.SubredditMatch;
	
	// Always use case insensetive. Strip the case insensetive flag if it exists (JS doesnt support it)
	commentExpressionText = commentExpressionText.replace('(?i)', '');
	subredditExpressionText = subredditExpressionText.replace('(?i)', '');
	replyMessageText = dbResult.ReplyMessage;
	
	// Support reddit line break
	replyMessageText = replyMessageText.replace(/\\n/g, '  \r\n');
	console.log('****************************');
	console.log(replyMessageText);
	console.log('****************************');
	
	var subredditMatchExpression = new RegExp(subredditExpressionText, 'i');
	var commentMatchExpression = new RegExp(commentExpressionText, 'i');
	
	return {SubredditMatch: subredditMatchExpression, 
			CommentMatch: commentMatchExpression,
			ReplyMessage: replyMessageText,
			IsReplyRegexp: dbResult.IsReplyRegexp};
}