// Local files
require('./DatabaseFetch.js')();
require('./CommonTools.js')();
const CommentSearchProcessor = require('./CommentFinder.js');
const RedditClientImport = require('./RedditClient.js');

const pg = require('pg');

const secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
const intervalToWaitInMillisecondsBetweenReadingComments = 1100;
const intervalToWaitBeforeSendingIdleMessage = 30;
const commentCacheSize = 2000;
const dissallowedSubreddits = ['suicidewatch', 'depression' ];
const userIgnoreList = ['agree-with-you'];

var lastMessageSentAt = new Date().getTime();

const clientConnection = isLocal() ? 'http://localhost:8000/' : 'http://reddit-agree-with-you.herokuapp.com/';

const faye = require('faye');
const client = new faye.Client(clientConnection);

var CommentFinder;
var redditClient = new RedditClientImport();

let commentHistory = GetUniqueArray(3000);
let subredditModsList = GetUniqueArray(3000);

console.log('is local?: ' + isLocal());
console.log('connecting to: ' + clientConnection);
console.log('Database URL: ' + process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw 'Please set process.env.DATABASE_URL! e.g SET DATABASE_URL=postgres://.....';
}

// Execute 
GetCommentSearchObjectsFromDatabase(pg, process.env.DATABASE_URL, function(commentSearchObjects) {
	CommentFinder = new CommentSearchProcessor(commentSearchObjects, commentCacheSize);
	console.log('starting...');
	start();
});

function start()
{
	client.publish('/messages', {message: 'starting up.'});
	
	setInterval(function() {
		redditClient.getCommentsFromSubreddit(RedditClientImport.MAX_NUM_POSTS, 'all', 'comments', function(comments) {
			comments.forEach(
				comment => {
					var replyMessage = CommentFinder.searchComment(comment);

					if (replyMessage)
					{
						// filter by disallowed subreddits
						if (dissallowedSubreddits.includes(comment.subreddit.toLowerCase()))
						{
							console.log('Ignoring comment, disallowed subreddit found for comment: ');
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
	
	if (userIgnoreList.includes(comment.author))
	{
		console.log('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
		return;
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

/**
 * Checks if this program is currently running locally
 * We do this by checking if 'heroku' property is found in 'process.env._'
*/
function isLocal()
{
	return !(process.env._ && process.env._.indexOf("heroku"));
}