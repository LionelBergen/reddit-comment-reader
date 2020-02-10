let EXPECTED_NUMBER_OF_ROWS = 16;
let NO_REPLY = null;

module.exports = function() {
	this.TestAll = testComments;
};

function testComments(commentPredicateObjects, commentFinder)
{
	if (commentPredicateObjects.length != EXPECTED_NUMBER_OF_ROWS)
	{
		throw "Expected rows: " + EXPECTED_NUMBER_OF_ROWS + " but was: " + commentPredicateObjects.length;
	}
	
	testTheyDidTheMath(commentFinder);
	testNoU(commentFinder);
	testThatSeemsPossible(commentFinder);
	testSeemsPossible(commentFinder);
	testNotPossible(commentFinder);
	testPokemonBulbasaur(commentFinder);
	testPokemonCharmander(commentFinder);
	testPokemonSquirtle(commentFinder);
	testThisDefinition(commentFinder);
	testThatDefinition(commentFinder);
	testILoveYou(commentFinder);
	testEveryoneClapped(commentFinder);
  
  // not agree-with-you
	testDAD(commentFinder);
	
	testUsernameFilter(commentFinder);
  
	console.log('tests finished');
}

/**
 * Tests that replies to other users don't trigger our regularExpression.
 * E.G: /u/noU
*/
function testUsernameFilter(processor)
{
  testComment = createTestComment('/u/nou', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 1000);
  
  testComment = createTestComment('/u/nouser', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 1001);
  
  testComment = createTestComment('/u/charmander', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 1002);
  
  testComment = createTestComment('u/charmander', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 1003);
  
  testComment = createTestComment('something /u/charmander something', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 1004);
  
  // unrelated username mention should still work
  let expectedReply = 'Whenever I play Pokemon I need 3 save spots, one for my Squirtle, one for my Bulbasaur, and one for my second Squirtle.';
  testComment = createTestComment('/u/somedumbUser charmander', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 1005);
  testComment = createTestComment('something u/somedumbUser charmander', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 1006);
}

function testEveryoneClapped(processor)
{
	let expectedReply = 'Can confirm this is true. I was also applauding.';
	
	let testComment = createTestComment('then everyone clapped', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 700);
	
	testComment = createTestComment('then everbody stood up and appluaded', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 701);
	
	testComment = createTestComment('then everybody stood up and applauded', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 702);
	
	testComment = createTestComment('dfgfd gfdg fdgdfgdfthen everyone clapped gfdg fdg dfg', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 703);
	
	testComment = createTestComment('df gdf gdf gdf then everbody stood up and appluaded fgdf g df gdf g\r\ngfkjldgjdfglk', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 704);
}

function testDAD(processor)
{
	let expectedReply = 'hello';
	
	let testComment = createTestComment('Denton Alcohol Delivery', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 5500);
	
	testComment = createTestComment('something Denton something Alcohol something Delivery something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 5501);
	
	testComment = createTestComment('something Deliver something Alcohol something Denton something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 5502);
	
	testComment = createTestComment('something Denton something Alcohol something Deliver something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 5503);
  
  testComment = createTestComment('something Denton something beer something DeliVer something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 5503);
}

function testPokemonBulbasaur(processor)
{
	let expectedReply = 'Whenever I play Pokemon I need 3 save spots, one for my Charmander, one for my Squirtle, and one for my second Charmander.';
	let testComment = createTestComment('bulbasauR', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 600);
	testComment = createTestComment('something something bulBasaur', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 601);
	testComment = createTestComment('bulbasaur something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 602);
	testComment = createTestComment('something something bUlbasaur something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 603);
	
	// Test subreddit filter
	testComment = createTestComment('bulbasauR', 'pokemon');
	test(processor, testComment, NO_REPLY, 604);
	testComment = createTestComment('bulbasauR', 'something somethingpokemon');
	test(processor, testComment, NO_REPLY, 605);
	testComment = createTestComment('bulbasauR', 'pokemonsomething something');
	test(processor, testComment, NO_REPLY, 606);
	testComment = createTestComment('bulbasauR', 'something something bUlbasaur something something');
	test(processor, testComment, NO_REPLY, 607);
	testComment = createTestComment('bulbasauR', 'something something charmander something something');
	test(processor, testComment, NO_REPLY, 608);
	testComment = createTestComment('bulbasauR', 'something something squirtle something something');
	test(processor, testComment, NO_REPLY, 609);
}

function testPokemonCharmander(processor)
{
	let expectedReply = 'Whenever I play Pokemon I need 3 save spots, one for my Squirtle, one for my Bulbasaur, and one for my second Squirtle.';
	let testComment = createTestComment('chARMANDER', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 600);
	testComment = createTestComment('something something chARMANDER', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 601);
	testComment = createTestComment('chARMANDER something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 602);
	testComment = createTestComment('something something chARMANDER something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 603);
	
	// Test subreddit filter
	testComment = createTestComment('chARMANDER', 'pokemon');
	test(processor, testComment, NO_REPLY, 604);
	testComment = createTestComment('chARMANDER', 'something somethingpokemon');
	test(processor, testComment, NO_REPLY, 605);
	testComment = createTestComment('chARMANDER', 'pokemonsomething something');
	test(processor, testComment, NO_REPLY, 606);
	testComment = createTestComment('chARMANDER', 'something something bUlbasaur something something');
	test(processor, testComment, NO_REPLY, 607);
	testComment = createTestComment('chARMANDER', 'something something charmander something something');
	test(processor, testComment, NO_REPLY, 608);
	testComment = createTestComment('chARMANDER', 'something something squirtle something something');
	test(processor, testComment, NO_REPLY, 609);
}

function testPokemonSquirtle(processor)
{
	let expectedReply = 'Whenever I play Pokemon I need 3 save spots, one for my Bulbasaur, one for my Charmander, and one for my second Bulbasaur.';
	let testComment = createTestComment('Squirtle', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 600);
	testComment = createTestComment('something something Squirtle', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 601);
	testComment = createTestComment('Squirtle something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 602);
	testComment = createTestComment('something something Squirtle something something', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 603);
	
	// Test subreddit filter
	testComment = createTestComment('Squirtle', 'pokemon');
	test(processor, testComment, NO_REPLY, 604);
	testComment = createTestComment('Squirtle', 'something somethingpokemon');
	test(processor, testComment, NO_REPLY, 605);
	testComment = createTestComment('Squirtle', 'pokemonsomething something');
	test(processor, testComment, NO_REPLY, 606);
	testComment = createTestComment('Squirtle', 'something something bUlbasaur something something');
	test(processor, testComment, NO_REPLY, 607);
	testComment = createTestComment('Squirtle', 'something something charmander something something');
	test(processor, testComment, NO_REPLY, 608);
	testComment = createTestComment('Squirtle', 'something something squirtle something something');
	test(processor, testComment, NO_REPLY, 609);
}

function testILoveYou(processor)
{
	let expectedReply = 'I love you both';
	let testComment = createTestComment('I love you', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 500);
	
	testComment = createTestComment('I luv you', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 501);
	
	testComment = createTestComment('I love u', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 502);
	
	testComment = createTestComment('I luv u', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 503);
	
	testComment = createTestComment('I love you', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 504);
	
	testComment = createTestComment('I love you so much gkljsdfgklsdjglksdghj', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 505);
}

function testNotPossible(processor)
{
	let expectedReply = 'I agree, this does not seem possible.';
	let testComment = createTestComment('this isn\'t possible', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 400);
	
	testComment = createTestComment('that isn\'t possible', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 401);
	
	testComment = createTestComment('it\'s not possible', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 402);
	
	testComment = createTestComment('it\'s impossible', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 403);
}

function testSeemsPossible(processor)
{
	let expectedReply = 'I agree, this does seem possible.';
	let testComment = createTestComment('That seems possible', 'fdfdfdfdf');
	test(processor, testComment, expectedReply, 300);
	
	testComment = createTestComment('ya That seems possible', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 301);
	
	testComment = createTestComment('yeah this sEeMs pOssible, it could happen blah blah', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 302);
	
	testComment = createTestComment('I think this could happen', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 303);
	
	testComment = createTestComment('I believe this could happen', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 304);
	
	testComment = createTestComment('It could happen', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 305);
	
	testComment = createTestComment('it is possible this is true sghfjkdghk fgjhdkgl\n\rbfjdhgkjd', 'theydidthemonstermath');
	test(processor, testComment, expectedReply, 306);
}

function testTheyDidTheMath(processor)
{
	let testComment = createTestComment('/r/theydidthemath', 'fdfdfdfdf');
	test(processor, testComment, '/r/theydidthemonstermath', 1);
	
	// Test case insensitive
	testComment = createTestComment('/r/ThEYDidTheMATH', 'theydidthemonstermath');
	test(processor, testComment, '/r/theydidthemonstermath', 2);
	
	// Test filter sub
	testComment = createTestComment('/r/theydidthemath', 'theydidthemath');
	test(processor, testComment, NO_REPLY, 3);
	
	// Test filter sub case insensitive
	testComment = createTestComment('/r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, NO_REPLY, 4);
	
	// Test match only exactly
	testComment = createTestComment('something /r/theydidthemath', 'THeyDIDthEMATH');
	test(processor, testComment, NO_REPLY, 5);
}

function testNoU(processor)
{
	let testComment = createTestComment('No you', 'fdfdfdfdf');
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
	test(processor, testComment, NO_REPLY, 12);
	testComment = createTestComment('something no you', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 13);
	testComment = createTestComment('no you something', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 14);
}

function testThatSeemsPossible(processor)
{
	let testComment = createTestComment('That seems possible', 'fdfdfdfdf');
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
	test(processor, testComment, NO_REPLY, 22);
	testComment = createTestComment('somethjing That seems possible', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 23);
	testComment = createTestComment('something ya That seems possible', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 24);
	testComment = createTestComment('something I bElieve this could happen', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 25);
	testComment = createTestComment('something I tHink this could happen', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 26);
	testComment = createTestComment('something yeAh thIs sEeMs pOssible, it could happen Blah blaH', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 27);
	testComment = createTestComment('something it is possible this is true sghfjkdghk fgjhdkgl\n\rbfjdhgkjd', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 28);
	testComment = createTestComment('something I believe this could happen', 'fdfdfdfdf');
	test(processor, testComment, NO_REPLY, 29);
}

function testThisDefinition(processor)
{
	let expectedResponseText = ">this\r\n" + 
			">[th is]  \r\n" + 
			">1.  \r\n" + 
			">*(used to indicate a person, thing, idea, state, event, time, remark, etc., as present, near, just mentioned or pointed out, supposed to be understood, or by way of emphasis):    " +
			"e.g **This is my coat.**";

	let testComment = createTestComment('what is tHis supposed to mean?', 'fdfdfdfdf');
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

function testThatDefinition(processor)
{
	let expectedResponseText = ">that\r\n" + 
			">[th at; unstressed th uh t]  \r\n" + 
			">1.  \r\n" + 
			">*(used to indicate a person, thing, idea, state, event, time, remark, etc., as pointed out or present, mentioned before, supposed to be understood, or by way of emphasis):*    " +
			"e.g **That is her mother. After that we saw each other.**";

	let testComment = createTestComment('what is that supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1000);
	
	testComment = createTestComment('what is that suPPosed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1001);
	
	testComment = createTestComment('whats that supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1002);
	
	testComment = createTestComment('wHats that supposed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1003);
	
	testComment = createTestComment('what that mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1004);
	
	testComment = createTestComment('whats that meaN?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1005);
	
	testComment = createTestComment('whats that supposed to mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1006);
	
	testComment = createTestComment('whats that supposed to mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1007);
	
	testComment = createTestComment('whats that mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1008);
	
	testComment = createTestComment('whats that mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1009);
	
	testComment = createTestComment('whats the fuck does that mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1100);
	
	testComment = createTestComment('whats the fuck does that mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1110);
	
	testComment = createTestComment('whats that supposed to fucking mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1120);
	
	testComment = createTestComment('whats that supposed to flipping mean?', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1130);
	
	testComment = createTestComment('what the heck does that mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1140);
	
	testComment = createTestComment('what the fudge does that mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1150);
	
	testComment = createTestComment('what the hell does that mean', 'fdfdfdfdf');
	test(processor, testComment, expectedResponseText, 1160);
}

function test(processor, comment, expectedResult, index)
{
	let actualResult = processor.searchComment(comment);
	
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
		// Actual result has spaces before line breaks.
		expectedResult = expectedResult == null ? null : expectedResult.replace(/(?:\r\n|\r|\n)/g, '  ');
		actualResult = actualResult == null ? null : actualResult.ReplyMessage.replace(/(?:\r\n|\r|\n)/g, '');
		
		if (expectedResult != actualResult)
		{
			throw "FAILURE expected: \r\n" + expectedResult + "\r\n but was: \r\n" + actualResult + " \r\nindex: " + index;
		}
	}
}

function createTestComment(comment, subreddit)
{
	return {body: comment, subreddit: subreddit, id: 'gfdgdfgdfg' + Math.random() };
}