let EXPECTED_NUMBER_OF_ROWS = 2;

class CommentSearchProcessor
{
	constructor(commentObjects, numberOfRowsInCache)
	{
		this.CommentObjects = commentObjects;
		this.commentCache = getArrayWithLimitedLength(numberOfRowsInCache, false);
		
		this.testComments();
	}
	
	testComments()
	{
		if (this.CommentObjects.length != EXPECTED_NUMBER_OF_ROWS)
		{
			throw "Expected rows: " + EXPECTED_NUMBER_OF_ROWS + " but was: " + this.CommentObjects.length;
		}
		
		testTheyDidTheMath(this);
	}
	
	searchComment(comment)
	{
		var foundPredicate = null;
		
		if (!commentCache.includes(comment))
		{
			for (var i=0; i < commentSearchPredicates.length; i++)
			{
				var commentPredicateObj = commentSearchPredicates[i];
				
				if (commentSearchObjMatchesComment(comment, commentPredicateObj))
				{
					foundPredicate = commentPredicateObj;
					break;
				}
			}
		}

		return foundPredicate;
	}
}

function testTheyDidTheMath(processor)
{
	var testComment = createTestDBObj('^/r/theydidthemath$', '/r/theydidthemonstermath');
	
	var result = processor.searchComment(testComment);
	if (!result)
	{
		throw "Comment did not succeed: " + testComment;
	}
}

























function createTestDBObj(commentRegexp, subredditRegexp)
{
	var subredditMatchExpression = new RegExp(subredditRegexp, 'i');
	var commentMatchExpression = new RegExp(commentRegexp, 'i');
	
	return {SubredditMatch: subredditMatchExpression, 
			CommentMatch: commentMatchExpression,
			ReplyMessage: '',
			IsReplyRegexp: false};
}

function getArrayWithLimitedLength(length, allowDuplicates) 
{
	var array = new Array();

	array.push = function () {
		if (!allowDuplicates && this.includes(arguments[0]))
		{
			return null;
		}
		if (this.length >= length) {
			this.shift();
		}
		return Array.prototype.push.apply(this,arguments);
	}

	return array;

}

module.exports = CommentSearchProcessor;
