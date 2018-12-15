// Local files
require('./DatabaseFetch.js')();
require('./CommonTools.js')();
let CommentSearchProcessor = require('./CommentFinder.js');
let RedditClient = require('./RedditClient.js');

let pg = require('pg');

let secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
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

let commentHistory = GetUniqueArray(3000);
let subredditModsList = GetUniqueArray(3000);

console.log('is local: ' + isLocal() + '\nconnecting to: ' + clientConnection);
console.log(process.env.DATABASE_URL);

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
		
		if (GetSecondsSinceTimeInSeconds(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
		{
			console.log('sending inactive message');
			client.publish('/messages', {inactive: '1'});
			lastMessageSentAt = new Date().getTime();
		}
	}, intervalToWaitInMillisecondsBetweenReadingComments);
}

function processComment(comment, replyMessage)
{
	// So we don't spam a subreddit with the same message
	let timeThisReplyWasLastSubmittedOnThisSubreddit = {id: (comment.subreddit +  ':' + replyMessage), created: comment.created };
	let thisSubredditModList = {id: comment.subreddit};
	
	if (subredditModsList.includes(thisSubredditModList))
	{
		if (subredditModsList.get(thisSubredditModList).modList.includes(comment.author))
		{
			console.log('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
			return;
		}
	}
	else
	{
		redditClient.getSubredditModList(thisSubredditModList.id, function(modList) { 
			thisSubredditModList.modList = modList;
		    subredditModsList.push(thisSubredditModList);
			console.log('pushed: ' + thisSubredditModList.id);
			processComment(comment, replyMessage);
			return;
		});
	}
	
	console.log('continue...');
	
	if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit))
	{
		publishComment(comment, replyMessage);
		commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
	}
	else
	{
		var existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
		
		if (GetSecondsSinceUTCTimestamp(existingComment.created) > secondsTimeToWaitBetweenPostingSameCommentToASubreddit)
		{
			publishComment(comment, replyMessage);
			commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
		}
		else 
		{
			console.log('skipping comment, we\'ve already posted to this subreddit recently!');
			console.log(comment);
			console.log(commentHistory);
		}
	}
}

function publishComment(comment, replyMessage)
{
	console.log('posting comment');
	client.publish('/messages', {comment: comment, reply: replyMessage});
	lastMessageSentAt = new Date().getTime();
	console.log(comment);
	console.log('reply: ' + replyMessage);
}

// TODO: Need better way
function isLocal()
{
	return process.env.username.includes('Dustytrash');
}