// Local files
import { DatabaseUtil } from './reddit_comment_reader/tools/DatabaseUtil.js';
const ErrorHandler = require('./reddit_comment_reader/tools/ErrorHandler.js');
const CommentSearchProcessor = require('./reddit_comment_reader/tools/CommentFinder.js');
const ClientHandler = require('./reddit_comment_reader/messaging/ClientHandler.js');
const MessagingClients = require('./reddit_comment_reader/messaging/MessagingClient.js');
const RedditCommentProcessor = require('./reddit_comment_reader/RedditCommentProcessor.js');
const LogManager = require('./reddit_comment_reader/tools/Logger.js');

require('dotenv').config();
const rClient = require('./reddit_comment_reader/RedditClient.js');

const Logger = LogManager.createInstance('app.js');

const secondsTimeToWaitBetweenPostingSameCommentToASubreddit = 60 * 30;
// const secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord = 10;
const intervalToWaitInMillisecondsBetweenReadingComments = 1090;
const intervalToWaitBeforeSendingIdleMessage = 30;
const commentCacheSize = 2000;
const dissallowedSubreddits = ['suicidewatch', 'depression' ];

Logger.info('checking environment variables...');
if (!process.env.DATABASE_URL) {
  throw 'Please set process.env.DATABASE_URL! e.g SET DATABASE_URL=postgres://.....';
/* } else if (!process.env.DISCORD_TOKEN_PERSONAL) {
  throw 'please set process.env.DISCORD_TOKEN_PERSONAL!';
} else if (!process.env.DISCORD_TOKEN_DENTON) {
  throw 'Please set DISCORD_TOKEN_DENTON.';*/
} else if (!process.env.AGREE_WITH_YOU_URL) {
  throw 'Please set Reddit client URL.';
}

Logger.info('passed environment checks');

const errorHandler = new ErrorHandler(process.env.DATABASE_URL);

// Important: The clientTagName's, are referenced from the Database. (public.RegexpComment.Handle)
const agreeWithYouClient = new MessagingClients.FayeMessagingClient({
  clientTagName: 'Agree-with-you',
  blacklistedSubreddits: dissallowedSubreddits,
  receivingMessagesURL: process.env.AGREE_WITH_YOU_URL,
  timeBetweenSamePostInSubreddit: secondsTimeToWaitBetweenPostingSameCommentToASubreddit
});

// TODO: get discord clients from the database...
/* const discordClientPersonal = new MessagingClients.DiscordMessagingClient({clientTagName:'DISCORD_PERSONAL', blacklistedSubreddits:[], discordToken:process.env.DISCORD_TOKEN_PERSONAL,
  channelName: 'reddit-bot-test',
  timeBetweenSamePostInSubreddit:secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord});
const discordClientDenton = new MessagingClients.DiscordMessagingClient({clientTagName:'DISCORD', blacklistedSubreddits:[], discordToken:process.env.DISCORD_TOKEN_DENTON,
  channelName: 'reddit',
  timeBetweenSamePostInSubreddit:secondsTimeToWaitBetweenPostingSameCommentToASubredditForDiscord});
 */

// DatabaseUtil.getDiscordClientsFromDatabase(process.env.DATABASE_URL, isLocal()).then(console.log).catch(Logger.error);

ClientHandler.addClients(
  agreeWithYouClient // ,
//  discordClientPersonal,
//  discordClientDenton
);

// Read data from database, then start the application
// https://help.heroku.com/DR0TTWWD/seeing-fatal-no-pg_hba-conf-entry-errors-in-postgres
DatabaseUtil.getCommentSearchObjectsFromDatabase(process.env.DATABASE_URL, isLocal()).then(start).catch(Logger.error);

Logger.info('Authenticating Reddit Client');
const RedditClient = new rClient('agree-with-you', 'agreeDpp5588', start);

function start(commentSearchObjects) {
  Logger.info('starting application...');
  const commentFinder = new CommentSearchProcessor(commentSearchObjects, commentCacheSize);

  Logger.info('initializing clients...');
  ClientHandler.initializeClients();
  RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

  setInterval(function() {
    RedditClient.getLatestCommentsFromReddit(RedditClient.MAX_NUM_POSTS)
      .then(data => RedditCommentProcessor.processCommentsList(data))
      .catch(handleError);

    // Send a message every so often so Heroku or whatever doesn't auto-stop
    agreeWithYouClient.sendIdleMessageWhenInactive(intervalToWaitBeforeSendingIdleMessage);
  }, intervalToWaitInMillisecondsBetweenReadingComments);
}

function handleError(err) {
  if (Array.isArray(err)) {
    for (let i=0; i<err.length; i++) {
      errorHandler.handleError(err[i]);
    }
  } else {
    errorHandler.handleError(err);
    throw err;
  }
}

// Manually set a heroku variable to be able to check if we're running local or not
function isLocal() {
  return process.env.ON_HEROKU ? true : false;
}
