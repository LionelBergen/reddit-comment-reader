class RedditCommentError {
  constructor(redditComment, error) {
    this.redditComment = redditComment;
    this.error = error;
  }
  
  toString() {
    return "reddit Comment: " + this.redditComment + " error: " + this.error;
  }
}

module.exports = RedditCommentError;