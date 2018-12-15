require('./tests/CommentFinderTest.js')();
require('./CommonTools.js')();

class CommentSearchProcessor
{
	constructor(commentPredicateObjects, numberOfRowsInCache)
	{
		this.CommentPredicateObjects = commentPredicateObjects;
		this.commentHistory = GetArrayWithLimitedLength(numberOfRowsInCache, false);
		//
		TestAll(commentPredicateObjects, this);
	}
	
	searchComment(comment)
	{
		var foundPredicate = null;
		
		if (!this.commentHistory.includes(comment.id))
		{
			for (var i=0; i < this.CommentPredicateObjects.length; i++)
			{
				var commentPredicateObj = this.CommentPredicateObjects[i];
				
				if (commentSearchObjMatchesComment(comment, commentPredicateObj))
				{
					foundPredicate = commentPredicateObj;
					break;
				}
			}
			
			if (foundPredicate != null)
			{
				this.commentHistory.push(comment.id);
			}
		}

		return foundPredicate == null ? null : foundPredicate.ReplyMessage;
	}
}

function commentSearchObjMatchesComment(comment, searcher)
{
	return searcher.SubredditMatch.test(comment.subreddit)
	&& searcher.CommentMatch.test(comment.body);
}

module.exports = CommentSearchProcessor;
