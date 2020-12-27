// Local files
require('./DatabaseFetch.js')();
require('./CommonTools.js')();
require('./DiscordSender.js')();
const ErrorHandler = require('./ErrorHandler.js');
const CommentSearchProcessor = require('./CommentFinder.js');
const RedditClientImport = require('./RedditClient.js');

const pg = require('pg');

const secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
const secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord = 10;
const intervalToWaitInMillisecondsBetweenReadingComments = 1100;
const intervalToWaitBeforeSendingIdleMessage = 30;
const commentCacheSize = 2000;
const dissallowedSubreddits = ['suicidewatch', 'depression' ];
const userIgnoreList = ['agree-with-you'];

let lastMessageSentAt = new Date().getTime();

const clientConnection = isLocal() ? 'http://localhost:8000/' : 'http://reddit-agree-with-you.herokuapp.com/';

const faye = require('faye');
const client = new faye.Client(clientConnection);

let CommentFinder;

let commentHistory = GetUniqueArray(3000);
let subredditModsList = GetUniqueArray(3000);

// process.env.DISCORD_TOKEN
DiscordInit();

// read from .env
require('dotenv').config();

console.log('is local?: ' + isLocal());
console.log('connecting to: ' + clientConnection);
console.log('Database URL: ' + process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw 'Please set process.env.DATABASE_URL! e.g SET DATABASE_URL=postgres://.....';
}

let redditClient = new RedditClientImport(new ErrorHandler(pg, process.env.DATABASE_URL));

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
      if (comments) 
      {
			comments.forEach(
				comment => {
          const foundMessage = CommentFinder.searchComment(comment)

					if (foundMessage)
					{
						// filter by disallowed subreddits
						if (dissallowedSubreddits.includes(comment.subreddit.toLowerCase()))
						{
							console.log('Ignoring comment, disallowed subreddit found for comment: ');
							console.log(comment);
						}
						else
						{
							processComment(comment, foundMessage);
						}
					}
				});
      }
      else
      {
        console.log('comments was undefined, skipping.');
      }
		});
		
    // Send a message every so often so Heroku or whatever doesn't auto-stop
		if (GetSecondsSinceTimeInSeconds(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
		{
			console.log('sending active message');
			client.publish('/messages', {active: '1'});
			lastMessageSentAt = new Date().getTime();
		}
	}, intervalToWaitInMillisecondsBetweenReadingComments);
}

function processComment(comment, commentObject)
{
	// So we don't spam a subreddit with the same message
	let timeThisReplyWasLastSubmittedOnThisSubreddit = {id: (comment.subreddit +  ':' + commentObject.ReplyMessage), created: comment.created };
	let thisSubredditModList = {id: comment.subreddit};
	
	if (subredditModsList.includes(thisSubredditModList))
	{
		if (commentObject.ClientHandler != "DISCORD" && subredditModsList.get(thisSubredditModList).modList.includes(comment.author))
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
			processComment(comment, commentObject);
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
		publishComment(comment, commentObject);
		commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
	}
	else
	{
		const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
		
    let waitAmount = commentObject.ClientHandler != "DISCORD" ? secondsTimeToWaitBetweenPostingSameCommentToASubreddit : secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord
		if (GetSecondsSinceUTCTimestamp(existingComment.created) > waitAmount)
		{
			publishComment(comment, commentObject);
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

function publishComment(comment, commentObject)
{
  if (commentObject.ClientHandler == "Agree-with-you") {
    console.log('posting comment to agree-with-you');
    client.publish('/messages', {comment: comment, reply: commentObject.ReplyMessage});
    lastMessageSentAt = new Date().getTime();
    console.log(comment);
    console.log('reply: ' + commentObject);
  } else if (commentObject.ClientHandler == "DISCORD") {
    SendDiscordMessage(comment);
  } else {
    throw 'unrecognized handler: ' + commentObject.ClientHandler ;
  }
}

/**
 * Checks if this program is currently running locally
 * We do this by checking if 'heroku' property is found in 'process.env._'
*/
function isLocal()
{
	return !(process.env._ && process.env._.indexOf("heroku"));
}