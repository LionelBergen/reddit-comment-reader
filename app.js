// Local files
require('./reddit_comment_reader/DatabaseUtil.js')();
require('./reddit_comment_reader/CommonTools.js')();
require('./reddit_comment_reader/DiscordSender.js')();
const ErrorHandler = require('./reddit_comment_reader/ErrorHandler.js');
const CommentSearchProcessor = require('./reddit_comment_reader/CommentFinder.js');
const ClientHandler = require('./reddit_comment_reader/ClientHandler.js');
const MessagingClients = require('./reddit_comment_reader/messaging/MessagingClient.js');

require('dotenv').config();
const RedditClient = require('reddit-simple-client');

const secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
const secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord = 10;
const intervalToWaitInMillisecondsBetweenReadingComments = 1100;
const intervalToWaitBeforeSendingIdleMessage = 30;
const commentCacheSize = 2000;
const dissallowedSubreddits = ['suicidewatch', 'depression' ];
const userIgnoreList = ['agree-with-you'];

let lastMessageSentAt = new Date().getTime();

// TODO: remove these comments. Just keeping it here for reference
// const clientConnection = isLocal() ? 'http://localhost:8000/' : 'http://reddit-agree-with-you.herokuapp.com/';
// new faye.Client(clientConnection);
// client.publish('/messages', {message: 'starting up.'});

let CommentFinder;

let commentHistory = GetUniqueArray(3000);
let subredditModsList = GetUniqueArray(3000);

if (!process.env.DATABASE_URL) {
  throw 'Please set process.env.DATABASE_URL! e.g SET DATABASE_URL=postgres://.....';
} else if (!process.env.DISCORD_TOKEN) {
  throw 'please set process.env.DISCORD_TOKEN!';
} else if (!process.env.AGREE_WITH_YOU_URL) {
  throw 'Please set Reddit client URL.';
}

// Important: The client names (first arg), are referenced from the Database. (public.RegexpComment.Handle)
ClientHandler.addClients(
  new MessagingClients.FayeMessagingClient('Agree-with-you', dissallowedSubreddits, process.env.AGREE_WITH_YOU_URL),
  new MessagingClients.DiscordMessagingClient('DISCORD', [], process.env.DISCORD_TOKEN)
);

/*
console.log('is local?: ' + isLocal());
console.log('connecting to: ' + clientConnection);
console.log('Database URL: ' + process.env.DATABASE_URL);*/

// Read data from database, then start the application 
GetCommentSearchObjectsFromDatabase(process.env.DATABASE_URL).then(start).catch(console.error);

function start(commentSearchObjects) {
  CommentFinder = new CommentSearchProcessor(commentSearchObjects, commentCacheSize);
  
  console.log('initializing clients...');
  clients.forEach(function(client) {
    client.initialize();
  });
  
  setInterval(function() {
    RedditClient.getLatestCommentsFromReddit(RedditClient.MAX_NUM_POSTS).then(readAndProcessCommentsList);
		
    // Send a message every so often so Heroku or whatever doesn't auto-stop
    if (GetSecondsSinceTimeInSeconds(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
    {
      console.log('sending active message');
      client.publish('/messages', {active: '1'});
      lastMessageSentAt = new Date().getTime();
    }
  }, intervalToWaitInMillisecondsBetweenReadingComments);
};

function readAndProcessCommentsList(comments) {
  if (comments) 
  {
    comments.forEach(comment => {
      const foundMessage = CommentFinder.searchComment(comment);

      if (foundMessage)
      {
        processComment(comment, foundMessage);
      }
    });
  }
  else
  {
    console.log('comments was undefined, skipping.');
  }
}

function processComment(comment, commentObject)
{
  // So we don't spam a subreddit with the same message
  let timeThisReplyWasLastSubmittedOnThisSubreddit = {id: (comment.subreddit +  ':' + commentObject.ReplyMessage), created: comment.created };
  let thisSubredditModList = {id: comment.subreddit};
	
  // If we already have a moderator list for the comment, check if we should skip this comment
  if (subredditModsList.includes(thisSubredditModList))
  {
    if (commentObject.ClientHandler != "DISCORD" && subredditModsList.get(thisSubredditModList).modList.includes(comment.author))
    {
      console.log('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
      return;
    }
  }
  // Otherwise, populate the moderator list and re-run this function
  else
  {
    RedditClient.getSubredditModList(thisSubredditModList.id).then(function(modList) {
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
		
    let waitAmount = commentObject.ClientHandler != "DISCORD" ? secondsTimeToWaitBetweenPostingSameCommentToASubreddit : secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord;
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