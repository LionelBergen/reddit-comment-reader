// Local files
const DatabaseUtil = require('./reddit_comment_reader/tools/DatabaseUtil.js');
const ErrorHandler = require('./reddit_comment_reader/tools/ErrorHandler.js');
const CommentSearchProcessor = require('./reddit_comment_reader/tools/CommentFinder.js');
const ClientHandler = require('./reddit_comment_reader/messaging/ClientHandler.js');
const MessagingClients = require('./reddit_comment_reader/messaging/MessagingClient.js');
const RedditCommentProcessor = require('./reddit_comment_reader/RedditCommentProcessor.js');

require('dotenv').config();
const RedditClient = require('reddit-simple-client');

const secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
const secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord = 10;
const intervalToWaitInMillisecondsBetweenReadingComments = 1100;
const intervalToWaitBeforeSendingIdleMessage = 30;
const commentCacheSize = 2000;
const dissallowedSubreddits = ['suicidewatch', 'depression' ];

if (!process.env.DATABASE_URL) {
  throw 'Please set process.env.DATABASE_URL! e.g SET DATABASE_URL=postgres://.....';
} else if (!process.env.DISCORD_TOKEN) {
  throw 'please set process.env.DISCORD_TOKEN!';
} else if (!process.env.AGREE_WITH_YOU_URL) {
  throw 'Please set Reddit client URL.';
}

const errorHandler = new ErrorHandler(process.env.DATABASE_URL);

// Important: The clientTagName's, are referenced from the Database. (public.RegexpComment.Handle)
const agreeWithYouClient = new MessagingClients.FayeMessagingClient({clientTagName:'Agree-with-you', blacklistedSubreddits:dissallowedSubreddits, receivingMessagesURL:process.env.AGREE_WITH_YOU_URL, 
  timeBetweenSamePostInSubreddit:secondsTimeToWaitBetweenPostingSameCommentToASubreddit});
const discordClient = new MessagingClients.DiscordMessagingClient({clientTagName:'DISCORD', blacklistedSubreddits:[], discordToken:process.env.DISCORD_TOKEN, 
  timeBetweenSamePostInSubreddit:secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord});
ClientHandler.addClients(
  agreeWithYouClient,
  discordClient
);

// Read data from database, then start the application 
DatabaseUtil.getCommentSearchObjectsFromDatabase(process.env.DATABASE_URL).then(start).catch(console.error);

function start(commentSearchObjects) {
  const commentFinder = new CommentSearchProcessor(commentSearchObjects, commentCacheSize);
  
  console.log('initializing clients...');
  ClientHandler.initializeClients();
  RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);
  
  setInterval(function() {
    RedditClient.getLatestCommentsFromReddit(RedditClient.MAX_NUM_POSTS)
      .then(data => RedditCommentProcessor.processCommentsList(data))
      .catch(err => {
        errorHandler.handleError(err, err.stack, err.toString());
      });
  
    // Send a message every so often so Heroku or whatever doesn't auto-stop
    agreeWithYouClient.sendIdleMessageWhenInactive(intervalToWaitBeforeSendingIdleMessage);
  }, intervalToWaitInMillisecondsBetweenReadingComments);
}