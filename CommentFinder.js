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
		
		var index = testTheyDidTheMath(this, 1);
		index = testNoU(this, index);
		
		
		console.log('tests finished');
	}
	
	searchComment(comment)
	{
		var foundPredicate = null;
		
		if (!this.commentCache.includes(comment))
		{
			for (var i=0; i < this.CommentObjects.length; i++)
			{
				var commentPredicateObj = this.CommentObjects[i];
				
				if (commentSearchObjMatchesComment(comment, commentPredicateObj))
				{
					foundPredicate = commentPredicateObj;
					break;
				}
			}
		}

		return foundPredicate == null ? null : foundPredicate.ReplyMessage;
	}
}

function testTheyDidTheMath(processor, index)
{
	var testComment = createTestComment('/r/theydidthemath', 'fdfdfdfdf');
	test(processor, testComment, '/r/theydidthemonstermath', index++);
	
	// Test case insensitive
	testComment = createTestComment('/r/ThEYDidTheMATH', 'theydidthemonstermath');
	test(processor, testComment, '/r/theydidthemonstermath', index++);
	
	// Test filter sub
	testComment = createTestComment('/r/theydidthemath', 'theydidthemath');
	test(processor, testComment, null, index++);
	
	// Test filter sub case insensitive
	testComment = createTestComment('/r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, null, index++);
	
	// Test match only exactly
	testComment = createTestComment('something /r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, null, index++);
	
	return index;
}

function testNoU(processor, index)
{
	var testComment = createTestComment('No you', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	
	testComment = createTestComment('no u', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	
	testComment = createTestComment('nou', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	
	// Test case insensitive
	testComment = createTestComment('no yOU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	testComment = createTestComment('noU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	testComment = createTestComment('NoU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', index++);
	
	// test exact match only
	testComment = createTestComment('something nou', 'fdfdfdfdf');
	test(processor, testComment, null, index++);
	testComment = createTestComment('something no you', 'fdfdfdfdf');
	test(processor, testComment, null, index++);
	testComment = createTestComment('no you something', 'fdfdfdfdf');
	test(processor, testComment, null, index++);
	
	return index;
}

function test(processor, comment, expectedResult, index)
{
	var actualResult = processor.searchComment(comment);
	
	if (expectedResult && !actualResult)
	{
		throw "FAILURE. returned null when expected a result. test failed: " + index;
	}
	else if (!expectedResult && actualResult)
	{
		throw "FAILURE Returned a result when expected null. test failed: " + index;
	}
	else
	{
		if (expectedResult != actualResult)
		{
			throw "FAILURE Did not match expected " + index;
		}
	}
}
























function commentSearchObjMatchesComment(comment, searcher)
{
	return searcher.SubredditMatch.test(comment.subreddit)
	&& searcher.CommentMatch.test(comment.body);
}

function createTestComment(comment, subreddit)
{
	return {body: comment, subreddit: subreddit };
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
