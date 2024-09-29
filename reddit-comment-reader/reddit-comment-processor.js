import Util from './tools/common-tools.js';
import RedditCommentError from './tools/reddit-comment-error.js';
import LogManager from './tools/logger.js';

const Logger = LogManager.createInstance('RedditCommentProcessor.js');

const userIgnoreList = ['agree-with-you'];
const commentHistory = Util.getUniqueArray(3000);
const subredditModsList = Util.getUniqueArray(3000);

class RedditCommentProcessor {
  init(commentFinder, redditClient, clientHandler) {
    this.commentFinder = commentFinder;
    this.redditClient = redditClient;
    this.clientHandler = clientHandler;
  }

  /**
   * Processes the comments passed
   *
   * @param comments To process
   * @return A promise containing number of comments processed
  */
  async processCommentsList(comments) {
    let numberOfCommentsProcessed = 0;
    const errors = [];

    // Don't use foreach here, because we're dealing with async
    for (let i=0; i<comments.length; i++) {
      const foundMessage = this.commentFinder.searchComment(comments[i]);

      if (foundMessage) {
        try {
          const commentsProcessed =
            await processComment(comments[i], foundMessage, this.redditClient, this.clientHandler);
          numberOfCommentsProcessed += commentsProcessed;
        } catch(error) {
          // If there's an error with a comment, we still want to continue with the rest of the comments
          handleError(comments[i], error, errors);
        }
      }
    }

    return errors.length == 0 ? numberOfCommentsProcessed : errors;
  }
}

/**
 * Returns A promise containing the number of processed comments (0-1)
*/
async function processComment(comment, commentObject, redditClient, clientHandler) {
  // So we don't spam a subreddit with the same message
  const timeThisReplyWasLastSubmittedOnThisSubreddit =
    { id: (comment.subreddit + ':' + commentObject.ReplyMessage), created: comment.created };
  const messageClient = clientHandler.getClientByTagName(commentObject.ClientHandler);
  const thisSubredditModList = { id: comment.subreddit };

  if (messageClient.shouldIgnoreModeratorComments) {
    // If we already have a moderator list for the subreddit, check if we should skip this comment
    if (subredditModsList.includes(thisSubredditModList)) {
      if (subredditModsList.get(thisSubredditModList).modList.includes(comment.author)) {
        Logger.info('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
        return 0;
      }
    // Otherwise, populate the moderator list and re-run this function
    } else {
      thisSubredditModList.modList = await redditClient.getSubredditModList(thisSubredditModList.id);
      subredditModsList.push(thisSubredditModList);
      Logger.info('pushed: ' + thisSubredditModList.id);

      return processComment(comment, commentObject, redditClient, clientHandler);
    }
  }

  if (userIgnoreList.includes(comment.author)) {
    Logger.info('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
    return 0;
  }

  // filter by disallowed subreddits
  if (messageClient.blacklistedSubreddits.includes(comment.subreddit.toLowerCase())) {
    Logger.info('Ignoring comment, disallowed subreddit found for comment: ');
    Logger.info(comment);
    return 0;
  }

  if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit)) {
    await publishComment(comment, commentObject, messageClient);
    commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
    return 1;
  } else {
    const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);

    if (Util.getSecondsSinceUTCTimestamp(existingComment.created) > messageClient.timeBetweenSamePostInSubreddit) {
      await publishComment(comment, commentObject, messageClient);

      commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
      return 1;
    } else {
      Logger.info('skipping comment, we\'ve already posted to this subreddit recently!');
      return 0;
    }
  }
}

async function publishComment(comment, commentObject, messagingClient) {
  return messagingClient.sendMessage({ redditComment: comment, redditReply: commentObject.ReplyMessage });
}

// TODO: this method
function handleError(comment, error, errors) {
  Logger.error('error with comment: ');
  Logger.error(comment);
  Logger.error(error);
  errors.push(new RedditCommentError(comment, error));
}

export default new RedditCommentProcessor();
