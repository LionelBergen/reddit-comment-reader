import DatabaseUtil from './reddit-comment-reader/tools/database/database-util.js';
import ErrorHandler from './reddit-comment-reader/tools/error-handler.js';
import CommentSearchProcessor from './reddit-comment-reader/tools/comment-finder.js';
import ClientHandler from './reddit-comment-reader/messaging/client-handler.js';
import { FayeMessagingClient } from './reddit-comment-reader/messaging/messaging-client.js';
import RedditCommentProcessor from './reddit-comment-reader/reddit-comment-processor.js';
import LogManager from './reddit-comment-reader/tools/logger.js';

import { CreateAuthedClient } from 'reddit-simple-client';
import 'dotenv/config';

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
const agreeWithYouClient = new FayeMessagingClient({
  clientTagName: 'Agree-with-you',
  blacklistedSubreddits: dissallowedSubreddits,
  receivingMessagesURL: process.env.AGREE_WITH_YOU_URL,
  timeBetweenSamePostInSubreddit: secondsTimeToWaitBetweenPostingSameCommentToASubreddit
});

const redditAuth = {
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_APP_ID,
  appSecret: process.env.REDDIT_APP_SECRET,
  redirectUrl: 'https://github.com/LionelBergen/reddit-comment-reader',
  accessToken: null,
  userAgent: 'u/dusty-trash reddit-client/2.0.0 by Lionel Bergen'
};

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

(async () => {
  const commentSearchObjects =
    await DatabaseUtil.getCommentSearchObjectsFromDatabase(process.env.DATABASE_URL, isLocal());
  Logger.info('Authenticating Reddit Client');
  const RedditClient = await CreateAuthedClient({ redditAuth });

  Logger.info('starting application...');
  const commentFinder = new CommentSearchProcessor(commentSearchObjects, commentCacheSize);

  Logger.info('initializing clients...');
  ClientHandler.initializeClients();
  RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

  setInterval(async function() {
    try {
      const latestComments = await RedditClient.getLatestCommentsFromReddit(RedditClient.MAX_NUM_POSTS);
      await RedditCommentProcessor.processCommentsList(latestComments);
    } catch (e) {
      handleError(e);
    }

    // Send a message every so often so Heroku or whatever doesn't auto-stop
    agreeWithYouClient.sendIdleMessageWhenInactive(intervalToWaitBeforeSendingIdleMessage);
  }, intervalToWaitInMillisecondsBetweenReadingComments);
})();
