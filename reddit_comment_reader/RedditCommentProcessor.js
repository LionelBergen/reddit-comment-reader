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
  
  async processCommentsList(comments) {
    // Don't use foreach here, because we're dealing with async
    for (let i=0; i<comments.length; i++) {
      const foundMessage = commentFinderr.searchComment(comments[i]);
      if (foundMessage)
      {
        await processComment(comments[i], foundMessage, redditClientt);
      }
    }
  }
}

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
        return;
      }
    }
    // Otherwise, populate the moderator list and re-run this function
    else
    {
      thisSubredditModList.modList = await redditClient.getSubredditModList(thisSubredditModList.id);
      subredditModsList.push(thisSubredditModList);
      console.log('pushed: ' + thisSubredditModList.id);
      await processComment(comment, commentObject, redditClient);
      
      return;
    }
    console.log('was it?: ' + subredditModsList.includes(thisSubredditModList));
  }
  console.log('PROCESSING COMMENT...');
	
  if (userIgnoreList.includes(comment.author))
  {
    console.log('Skipping comment, is posted by: ' + comment.author + ' comment: ' + comment.body);
    return;
  }
  
    // filter by disallowed subreddits
  if (messageClient.blacklistedSubreddits.includes(comment.subreddit.toLowerCase()))
  {
    console.log('Ignoring comment, disallowed subreddit found for comment: ');
    console.log(comment);
    return;
  }
	
  console.log('continue...');
	
  if (!commentHistory.includes(timeThisReplyWasLastSubmittedOnThisSubreddit))
  {
    publishComment(comment, commentObject, messageClient);
    commentHistory.push(timeThisReplyWasLastSubmittedOnThisSubreddit);
  }
  else
  {
    const existingComment = commentHistory.get(timeThisReplyWasLastSubmittedOnThisSubreddit);
		
    if (GetSecondsSinceUTCTimestamp(existingComment.created) > messageClient.timeBetweenSamePostInSubreddit)
    {
      publishComment(comment, commentObject, messageClient);
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

function publishComment(comment, commentObject, messagingClient)
{
  messagingClient.sendMessage({redditComment:comment, redditReply: commentObject.ReplyMessage});
}

module.exports = new RedditCommentProcessor();