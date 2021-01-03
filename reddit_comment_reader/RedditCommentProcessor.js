let commentFinderr;
let redditClientt;
let clientHandlerr;

const userIgnoreList = ['agree-with-you'];
let commentHistory = GetUniqueArray(3000);
let subredditModsList = GetUniqueArray(3000);

class RedditCommentProcessor {
  init(commentFinder, redditClient, clientHandler) {
    commentFinderr = commentFinder;
    redditClientt = redditClient;
    clientHandlerr = clientHandler;
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
      
      // Don't use foreach here, because we're dealing with async
      for (let i=0; i<comments.length; i++) {
        const foundMessage = commentFinderr.searchComment(comments[i]);
        if (foundMessage)
        {
          console.log('running function');
          processComment(comments[i], foundMessage, redditClientt).then(function(data) {
            console.log('finished function');
            numberOfCommentsRead++;
            numberOfCommentsProcessed += data;
            
            if (numberOfCommentsRead == comments.length) {
              resolve(numberOfCommentsProcessed);
            }
          });
        } else {
          numberOfCommentsRead++;
        }
      }
    });
  }
}

/**
 * Returns A promise containing the number of processed comments (0-1)
*/
async function processComment(comment, commentObject, redditClient)
{
  // So we don't spam a subreddit with the same message
  const timeThisReplyWasLastSubmittedOnThisSubreddit = {id: (comment.subreddit +  ':' + commentObject.ReplyMessage), created: comment.created };
  const messageClient = clientHandlerr.getClientByTagName(commentObject.ClientHandler);
  let thisSubredditModList = {id: comment.subreddit};
  
  if (!messageClient.shouldIgnoreModeratorComments) 
  {
    // If we already have a moderator list for the comment, check if we should skip this comment
    if (subredditModsList.includes(thisSubredditModList))
    {
      if (subredditModsList.get(thisSubredditModList).modList.includes(comment.author))
      {
        console.log('Modderator comment!!! :' + comment.author + ' comment: ' + comment.body);
        resolve(0);
      }
    }
    // Otherwise, populate the moderator list and re-run this function
    else
    {
      thisSubredditModList.modList = await redditClient.getSubredditModList(thisSubredditModList.id);
      subredditModsList.push(thisSubredditModList);
      console.log('pushed: ' + thisSubredditModList.id);

      return processComment(comment, commentObject, redditClient);
    }
  }
  
  return new Promise((resolve, reject) => {
    console.log('PROCESSING COMMENT...');
    
    if (userIgnoreList.includes(comment.author))
    {
      console.log('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
      resolve(0);
    }
    
      // filter by disallowed subreddits
    if (messageClient.blacklistedSubreddits.includes(comment.subreddit.toLowerCase()))
    {
      console.log('Ignoring comment, disallowed subreddit found for comment: ');
      console.log(comment);
      resolve(0);
    }
    
    console.log('continue...');
    
    if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit))
    {
      publishComment(comment, commentObject, messageClient);
      commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
      resolve(1);
    }
    else
    {
      const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
      
      if (GetSecondsSinceUTCTimestamp(existingComment.created) > messageClient.timeBetweenSamePostInSubreddit)
      {
        publishComment(comment, commentObject, messageClient);
        commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
        resolve(1);
      }
      else 
      {
        console.log('skipping comment, we\'ve already posted to this subreddit recently!');
        console.log(comment);
        console.log(commentHistory);
        resolve(0);
      }
    }
  });
}

function publishComment(comment, commentObject, messagingClient)
{
  messagingClient.sendMessage({redditComment:comment, redditReply: commentObject.ReplyMessage});
}

module.exports = new RedditCommentProcessor();