const Util = require('./tools/common-tools.js');
const RedditCommentError = require('./tools/reddit-comment-error.js');
const LogManager = require('./tools/logger.js');

const Logger = LogManager.createInstance('RedditCommentProcessor.js');

const userIgnoreList = ['agree-with-you'];
let commentHistory = Util.getUniqueArray(3000);
let subredditModsList = Util.getUniqueArray(3000);

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
  processCommentsList(comments) {
    return new Promise((resolve, reject) => {
      let numberOfCommentsProcessed = 0;
      let numberOfCommentsRead = 0;
      let errors = [];
      
      // Don't use foreach here, because we're dealing with async
      for (let i=0; i<comments.length; i++) {
        const foundMessage = this.commentFinder.searchComment(comments[i]);
        if (foundMessage) {
          try {
            processComment(comments[i], foundMessage, this.redditClient, this.clientHandler).then(function(data) {
              numberOfCommentsRead++;
              numberOfCommentsProcessed += data;
              
              if (numberOfCommentsRead == comments.length) {
                return errors.length == 0 ? resolve(numberOfCommentsProcessed) : reject(errors);
              }
            }).catch(function(error) {
              numberOfCommentsRead++;
              // If there's an error with a comment, we still want to continue with the rest of the comments
              handleError(comments[i], error, errors);
              if (numberOfCommentsRead == comments.length) {
                return errors.length == 0 ? resolve(numberOfCommentsProcessed) : reject(errors);
              }
            });
          } catch(error) {
            numberOfCommentsRead++;
            // If there's an error with a comment, we still want to continue with the rest of the comments
            handleError(comments[i], error, errors);
            if (numberOfCommentsRead == comments.length) {
              return errors.length == 0 ? resolve(numberOfCommentsProcessed) : reject(errors);
            }
          }
        } else {
          numberOfCommentsRead++;
          if (numberOfCommentsRead == comments.length) {
            return errors.length == 0 ? resolve(numberOfCommentsProcessed) : reject(errors);
          }
        }
      }
    });
  }
}

/**
 * Returns A promise containing the number of processed comments (0-1)
*/
async function processComment(comment, commentObject, redditClient, clientHandler) {
  // So we don't spam a subreddit with the same message
  const timeThisReplyWasLastSubmittedOnThisSubreddit = {id: (comment.subreddit +  ':' + commentObject.ReplyMessage), created: comment.created };
  const messageClient = clientHandler.getClientByTagName(commentObject.ClientHandler);
  let thisSubredditModList = {id: comment.subreddit};
  
  if (messageClient.shouldIgnoreModeratorComments) {
    // If we already have a moderator list for the comment, check if we should skip this comment
    if (subredditModsList.includes(thisSubredditModList)) {
      if (subredditModsList.get(thisSubredditModList).modList.includes(comment.author)) {
        Logger.info('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
        return Promise.resolve(0);
      }
    // Otherwise, populate the moderator list and re-run this function
    } else {
      thisSubredditModList.modList = await redditClient.getSubredditModList(thisSubredditModList.id);
      subredditModsList.push(thisSubredditModList);
      Logger.info('pushed: ' + thisSubredditModList.id);

      return processComment(comment, commentObject, redditClient, clientHandler);
    }
  }
  
  return new Promise((resolve, reject) => {
    if (userIgnoreList.includes(comment.author)) {
      Logger.info('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
      return resolve(0);
    }
    
    // filter by disallowed subreddits
    if (messageClient.blacklistedSubreddits.includes(comment.subreddit.toLowerCase())) {
      Logger.info('Ignoring comment, disallowed subreddit found for comment: ');
      Logger.info(comment);
      return resolve(0);
    }

    if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit)) {
      publishComment(comment, commentObject, messageClient).then(function() {
        commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
        return resolve(1);
      }).catch(reject);
    } else {
      const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
      
      if (Util.getSecondsSinceUTCTimestamp(existingComment.created) > messageClient.timeBetweenSamePostInSubreddit) {
        publishComment(comment, commentObject, messageClient).then(function() {
          commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
          return resolve(1);
        }).catch(reject);
      } else {
        console.log('skipping comment, we\'ve already posted to this subreddit recently!');
        return resolve(0);
      }
    }
  });
}

function publishComment(comment, commentObject, messagingClient) {
  return messagingClient.sendMessage({redditComment:comment, redditReply: commentObject.ReplyMessage});
}

// TODO: this method
function handleError(comment, error, errors) {
  Logger.error('error with comment: ');
  Logger.error(comment);
  Logger.error(error);
  errors.push(new RedditCommentError(comment, error));
}

module.exports = new RedditCommentProcessor();