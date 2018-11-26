// Local files
require('./DatabaseFetch.js')();
let CommentSearchProcessor = require('./CommentFinder.js');

let Snoowrap = require('snoowrap');

let requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123',
  debug: true
});

let pg = require('pg');

// load all env variables from .env file into process.env object.
require('dotenv').config();

let intervalToWaitInMillisecondsBetweenReadingComments = 1200;
let intervalToWaitBeforeSendingIdleMessage = 10;
let commentCacheSize = 2400;

var lastMessageSentAt = new Date().getTime();

let faye = require('faye');
let client = new faye.Client('http://reddit-agree-with-you.herokuapp.com/');

var CommentFinder;
GetCommentSearchObjectsFromDatabase(pg, process.env.DATABASE_URL, function(x) { 
	CommentFinder = new CommentSearchProcessor(x, commentCacheSize);
});

setInterval(function() {
	//requestor.getNewComments('all').filter(filterCondition).forEach(comment => processComment(comment));
	
	if (getSecondsSince(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
	{
		console.log('sending inactive message');
		client.publish('/messages', {inactive: '1'});
		lastMessageSentAt = new Date().getTime();
	}
}, intervalToWaitInMillisecondsBetweenReadingComments);

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