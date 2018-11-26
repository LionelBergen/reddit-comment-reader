module.exports = function() {
	this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;
};

function getCommentSearchObjectsFromDatabase(pg, url)
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

			if(err) {
				return console.error('Query error.', err);
			}
		});
	});
	
	return commentSearchPredicates;
}


function createCommentSearchObjectFromDatabaseObject(dbResult)
{
	// Always use case insensetive. Strip the case insensetive flag if it exists (JS doesnt support it)
	var subredditMatchExpression = new RegExp(dbResult.SubredditMatch.replace('(?i)', ''), 'i');
	var commentMatchExpression = new RegExp(dbResult.CommentMatch.replace('(?i)', ''), 'i');
	
	return {SubredditMatch: subredditMatchExpression, 
			CommentMatch: commentMatchExpression,
			ReplyMessage: dbResult.ReplyMessage,
			IsReplyRegexp: dbResult.IsReplyRegexp};
}