// Local files
require('./DatabaseFetch.js')();
let CommentSearchProcessor = require('./CommentFinder.js');
let RedditClient = require('./RedditClient.js');

let pg = require('pg');

let intervalToWaitInMillisecondsBetweenReadingComments = 1100;
let intervalToWaitBeforeSendingIdleMessage = 30;
let commentCacheSize = 2000;
let dissallowedSubreddits = ['suicidewatch', 'depression' ];

var lastMessageSentAt = new Date().getTime();

let clientConnection = isLocal() ? 'http://localhost:8000/' : 'http://reddit-agree-with-you.herokuapp.com/';

let faye = require('faye');
let client = new faye.Client(clientConnection);

var CommentFinder;
var redditClient = new RedditClient();

console.log('is local: ' + isLocal() + '\nconnecting to: ' + clientConnection);

GetCommentSearchObjectsFromDatabase(pg, process.env.DATABASE_URL, function(x) { 
	CommentFinder = new CommentSearchProcessor(x, commentCacheSize);
	console.log('starting...');
	start();
});

function start()
{
	client.publish('/messages', {message: 'starting up.'});
	
	setInterval(function() {
		redditClient.getCommentsFromSubreddit(100, 'all', 'comments', function(comments) {
			comments.forEach(
				comment => {
					var replyMessage = CommentFinder.searchComment(comment);

					if (replyMessage)
					{
						// filter by disallowed subreddits
						if (dissallowedSubreddits.includes(comment.subreddit.toLowerCase()))
						{
							console.log('disallowed subreddit found: ');
							console.log(comment);
						}
						else
						{
							processComment(comment, replyMessage);
						}
					}
				});
		});
		
		if (getSecondsSince(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
		{
			console.log('sending inactive message');
			client.publish('/messages', {inactive: '1'});
			lastMessageSentAt = new Date().getTime();
		}
	}, intervalToWaitInMillisecondsBetweenReadingComments);
}

function processComment(comment, replyMessage)
{
	client.publish('/messages', {comment: comment, reply: replyMessage});
	lastMessageSentAt = new Date().getTime();
	console.log('FOUND!!!!');
	console.log(comment);
	console.log('reply: ' + replyMessage);
}

function getSecondsSince(time)
{
	var distance = new Date().getTime() - time;
	return Math.floor((distance % (1000 * 60)) / 1000);
}

// TODO: Need better way
function isLocal()
{
	return process.env.username.includes('Dustytrash');
}