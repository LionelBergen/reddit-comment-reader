const RedditClient = require('reddit-simple-client');
const RedditCommentProcessor = require('../reddit_comment_reader/RedditCommentProcessor.js');
const ClientHandler = require('../reddit_comment_reader/messaging/ClientHandler.js');
const DatabaseUtil = require('../reddit_comment_reader/tools/DatabaseUtil.js');

const assert = require('assert');
require('dotenv').config();

let commentFinder;

before(function() {
  if (!process.env.DATABASE_URL_TEST) {
    throw 'Please set process.env.DATABASE_URL_TEST! e.g SET DATABASE_URL_TEST=postgres://.....';
  }
  DatabaseUtil.getCommentSearchObjectsFromDatabase(process.env.DATABASE_URL_TEST).then(function(data) {
    if (!data || data.length < 1) {
      throw 'Local database needs to be initialized with data';
    }
    
    commentFinder = new CommentSearchProcessor(data, 2000);
  });
  
  let agreeWithYouClient = null;
  let discordClient = null;
  
  ClientHandler.addClients(
    agreeWithYouClient,
    discordClient
  );
});

describe('Reddit Comment Processor Test', () => {
  it('class is not null/undefined', () => {
    assert.notEqual(undefined, RedditCommentProcessor);
    assert.notEqual(null, RedditCommentProcessor);
  });
  
  it('Reddit Comment Processor Full Test', () => {
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);
    
  });
});