const Util = require('../reddit_comment_reader/tools/CommonTools.js');

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
    return new Promise((resolve) => {
      let numberOfCommentsProcessed = 0;
      let numberOfCommentsRead = 0;
      
      // Don't use foreach here, because we're dealing with async
      for (let i=0; i<comments.length; i++) {
        const foundMessage = this.commentFinder.searchComment(comments[i]);
        if (foundMessage) {
          processComment(comments[i], foundMessage, this.redditClient, this.clientHandler).then(function(data) {
            numberOfCommentsRead++;
            numberOfCommentsProcessed += data;
            
            if (numberOfCommentsRead == comments.length) {
              return resolve(numberOfCommentsProcessed);
            }
          });
        } else {
          numberOfCommentsRead++;
          if (numberOfCommentsRead == comments.length) {
            return resolve(numberOfCommentsProcessed);
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
  
  if (!messageClient.shouldIgnoreModeratorComments) {
    // If we already have a moderator list for the comment, check if we should skip this comment
    if (subredditModsList.includes(thisSubredditModList)) {
      if (subredditModsList.get(thisSubredditModList).modList.includes(comment.author)) {
        console.log('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
        return Promise.resolve(0);
      }
    // Otherwise, populate the moderator list and re-run this function
    } else {
      thisSubredditModList.modList = await redditClient.getSubredditModList(thisSubredditModList.id);
      subredditModsList.push(thisSubredditModList);
      console.log('pushed: ' + thisSubredditModList.id);

      return processComment(comment, commentObject, redditClient, clientHandler);
    }
  }
  
  return new Promise((resolve) => { 
    if (userIgnoreList.includes(comment.author)) {
      console.log('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
      return resolve(0);
    }
    
    // filter by disallowed subreddits
    if (messageClient.blacklistedSubreddits.includes(comment.subreddit.toLowerCase())) {
      console.log('Ignoring comment, disallowed subreddit found for comment: ');
      console.log(comment);
      return resolve(0);
    }

    if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit)) {
      publishComment(comment, commentObject, messageClient);
      commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
      return resolve(1);
    } else {
      const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
      
      if (Util.getSecondsSinceUTCTimestamp(existingComment.created) > messageClient.timeBetweenSamePostInSubreddit) {
        publishComment(comment, commentObject, messageClient);
        commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
        return resolve(1);
      } else {
        console.log('skipping comment, we\'ve already posted to this subreddit recently!');
        console.log(comment);
        console.log(commentHistory);
        return resolve(0);
      }
    }
  });
}

function publishComment(comment, commentObject, messagingClient) {
  messagingClient.sendMessage({redditComment:comment, redditReply: commentObject.ReplyMessage});
}

module.exports = new RedditCommentProcessor();