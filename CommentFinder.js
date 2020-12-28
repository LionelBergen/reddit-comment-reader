require('./CommonTools.js')();

class CommentSearchProcessor
{
  constructor(commentPredicateObjects, numberOfRowsInCache)
  {
    this.CommentPredicateObjects = commentPredicateObjects;
    this.commentHistory = GetArrayWithLimitedLength(numberOfRowsInCache, false);
  }
	
  searchComment(comment)
  {
    let foundPredicate = null;
		
    if (!this.commentHistory.includes(comment.id))
    {
      for (let i=0; i < this.CommentPredicateObjects.length; i++)
      {
        let commentPredicateObj = this.CommentPredicateObjects[i];
				
        if (commentSearchObjMatchesComment(comment, commentPredicateObj))
        {
          foundPredicate = commentPredicateObj;
          break;
        }
      }
			
      if (foundPredicate != null)
      {
        this.commentHistory.push(comment.id);
      }
    }

    return foundPredicate;
  }
}

/**
 * removes a username mention and returns the modified comment.
 * For example 'u/someUser' would be removed.
*/
function stripCommentOfUserMentions(comment)
{
  if (comment.includes('u/')) {
    return comment.replace(/u\/[A-Za-z0-9_-]+/, '');
  }
  
  return comment;
}

function commentSearchObjMatchesComment(comment, searcher)
{
  if (searcher.SubredditMatch.test(comment.subreddit)) {
    return searcher.CommentMatch.test(stripCommentOfUserMentions(comment.body));
  }
  
  return false;
}

module.exports = CommentSearchProcessor;
