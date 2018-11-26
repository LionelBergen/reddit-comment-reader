let Snoowrap = require('snoowrap');

let requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

let pg = require('pg');

// load all env variables from .env file into process.env object.
require('dotenv').config();
//

let intervalToWaitInMillisecondsBetweenReadingComments = 5200;
let intervalToWaitBeforeSendingIdleMessage = 10;

var lastMessageSentAt = new Date().getTime();

let faye = require('faye');
let client = new faye.Client('http://reddit-agree-with-you.herokuapp.com/');

let commentCache = getArrayWithLimitedLength(2400, false);

require('./DatabaseFetch.js')();

let commentSearchPredicates = GetCommentSearchObjectsFromDatabase(pg, process.env.DATABASE_URL);

setInterval(function() {
	//requestor.getNewComments('all').filter(filterCondition).forEach(comment => processComment(comment));
	
	if (getSecondsSince(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
	{
		console.log('sending inactive message');
		client.publish('/messages', {inactive: '1'});
		lastMessageSentAt = new Date().getTime();
	}
}, intervalToWaitInMillisecondsBetweenReadingComments);

function commentSearchObjMatchesComment(comment, searcher)
{
	return searcher.SubredditMatch.test(comment.subreddit)
	&& searcher.CommentMatch.test(comment.body);
}

function filterCondition(comment)
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
		
	return foundPredicate != null;
}

function processComment(comment)
{
	commentCache.push(comment);
	
	client.publish('/messages', {comment: comment});
	//lastMessageSentAt = new Date().getTime();
	console.log('FOUND!!!!');
	console.log(comment);
}

function getSecondsSince(time)
{
	var distance = new Date().getTime() - time;
	return Math.floor((distance % (1000 * 60)) / 1000);
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