let EXPECTED_NUMBER_OF_ROWS = 4;

class CommentSearchProcessor
{
	constructor(commentPredicateObjects, numberOfRowsInCache)
	{
		this.CommentPredicateObjects = commentPredicateObjects;
		// TODO: Rename this variable. IT's not a cache, just a way of removing duplicates
		this.commentCache = getArrayWithLimitedLength(numberOfRowsInCache, false);
		
		this.testComments();
	}
	
	testComments()
	{
		if (this.CommentPredicateObjects.length != EXPECTED_NUMBER_OF_ROWS)
		{
			throw "Expected rows: " + EXPECTED_NUMBER_OF_ROWS + " but was: " + this.CommentPredicateObjects.length;
		}
		
		testTheyDidTheMath(this);
		testNoU(this);
		testThatSeemsPossible(this);
		
		
		console.log('tests finished');
	}
	
	searchComment(comment)
	{
		var foundPredicate = null;
		
		if (!this.commentCache.includes(comment.id))
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
				this.commentCache.push(comment.id);
			}
		}

		return foundPredicate == null ? null : foundPredicate.ReplyMessage;
	}
}

function testTheyDidTheMath(processor)
{
	var testComment = createTestComment('/r/theydidthemath', 'fdfdfdfdf');
	test(processor, testComment, '/r/theydidthemonstermath', 1);
	
	// Test case insensitive
	testComment = createTestComment('/r/ThEYDidTheMATH', 'theydidthemonstermath');
	test(processor, testComment, '/r/theydidthemonstermath', 2);
	
	// Test filter sub
	testComment = createTestComment('/r/theydidthemath', 'theydidthemath');
	test(processor, testComment, null, 3);
	
	// Test filter sub case insensitive
	testComment = createTestComment('/r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, null, 4);
	
	// Test match only exactly
	testComment = createTestComment('something /r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, null, 5);
}

function testNoU(processor)
{
	var testComment = createTestComment('No you', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 6);
	
	testComment = createTestComment('no u', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 7);
	
	testComment = createTestComment('nou', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 8);
	
	// Test case insensitive
	testComment = createTestComment('no yOU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 9);
	testComment = createTestComment('noU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 10);
	testComment = createTestComment('NoU', 'fdfdfdfdf');
	test(processor, testComment, 'No you both', 11);
	
	// test exact match only
	testComment = createTestComment('something nou', 'fdfdfdfdf');
	test(processor, testComment, null, 12);
	testComment = createTestComment('something no you', 'fdfdfdfdf');
	test(processor, testComment, null, 13);
	testComment = createTestComment('no you something', 'fdfdfdfdf');
	test(processor, testComment, null, 14);
}

function testThatSeemsPossible(processor)
{
	var testComment = createTestComment('That seems possible', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 15);
	testComment = createTestComment('ya thAt seems possible', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 16);
	testComment = createTestComment('yeah this sEeMs pOssible, it could hapPen blah blah', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 17);
	testComment = createTestComment('I tHink this could happen', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 18);
	testComment = createTestComment('I believe this cOuld happen', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 19);
	testComment = createTestComment('It could hAppen', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 20);
	testComment = createTestComment('it is possible this is true sghfjkdghk fgjhdkgl\n\rbfjdhgkjd', 'fdfdfdfdf');
	test(processor, testComment, 'I agree, this does seem possible.', 21);

	testComment = createTestComment('somethjing That seems possible something', 'fdfdfdfdf');
	test(processor, testComment, null, 22);
	testComment = createTestComment('somethjing That seems possible', 'fdfdfdfdf');
	test(processor, testComment, null, 23);
	testComment = createTestComment('something ya That seems possible', 'fdfdfdfdf');
	test(processor, testComment, null, 24);
	testComment = createTestComment('something I bElieve this could happen', 'fdfdfdfdf');
	test(processor, testComment, null, 25);
	testComment = createTestComment('something I tHink this could happen', 'fdfdfdfdf');
	test(processor, testComment, null, 26);
	testComment = createTestComment('something yeAh thIs sEeMs pOssible, it could happen Blah blaH', 'fdfdfdfdf');
	test(processor, testComment, null, 27);
	testComment = createTestComment('something it is possible this is true sghfjkdghk fgjhdkgl\n\rbfjdhgkjd', 'fdfdfdfdf');
	test(processor, testComment, null, 28);
	testComment = createTestComment('something I believe this could happen', 'fdfdfdfdf');
	test(processor, testComment, null, 29);
}

function testThisDefinition(processor)
{
	let expectedResponseText = ">this\r\n" + 
			">[th is]  \r\n" + 
			">1.  \r\n" + 
			">*(used to indicate a person, thing, idea, state, event, time, remark, etc., as present, near, just mentioned or pointed out, supposed to be understood, or by way of emphasis):*    " +
			"e.g **This is my coat.**";

	var testComment = createTestComment('what is tHis supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 100);
	
	testComment = createTestComment('what is this suPPosed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 101);
	
	testComment = createTestComment('whats this supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 102);
	
	testComment = createTestComment('wHats this supposed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 103);
	
	testComment = createTestComment('what this mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 104);
	
	testComment = createTestComment('whats tHis meaN?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 105);
	
	testComment = createTestComment('whats this supposed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 106);
	
	testComment = createTestComment('whats this supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 107);
	
	testComment = createTestComment('whats this mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 108);
	
	testComment = createTestComment('whats this mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 109);
	
	testComment = createTestComment('whats the fuck does this mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 110);
	
	testComment = createTestComment('whats the fuck does this mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 111);
	
	testComment = createTestComment('whats this supposed to fucking mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 112);
	
	testComment = createTestComment('whats this supposed to flipping mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 113);
	
	testComment = createTestComment('what the heck does this mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 114);
	
	testComment = createTestComment('what the fudge does this mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 115);
	
	testComment = createTestComment('what the hell does this mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 116);
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
	return {body: comment, subreddit: subreddit, id: 'gfdgdfgdfg' + Math.random() };
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
