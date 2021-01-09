const RedditClient = require('reddit-simple-client');
const RedditCommentProcessor = require('../reddit_comment_reader/RedditCommentProcessor.js');
const ClientHandler = require('../reddit_comment_reader/messaging/ClientHandler.js');
const DatabaseUtil = require('../reddit_comment_reader/tools/DatabaseUtil.js');
const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const CommentSearchProcessor = require('../reddit_comment_reader/tools/CommentFinder.js');

require('dotenv').config();
const sinon = require('sinon');
const assert = require('assert');

const sandbox = sinon.createSandbox();
let commentFinder;
let agreeWithYouClient = new MessagingClients.FayeMessagingClient({clientTagName:'Agree-with-you'});
let discordClient = new MessagingClients.DiscordMessagingClient({clientTagName:'DISCORD'});

before(() => {
  return new Promise((resolve) => {
    if (!process.env.DATABASE_URL_TEST) {
      throw 'Please set process.env.DATABASE_URL_TEST! e.g SET DATABASE_URL_TEST=postgres://.....';
    }
    
    DatabaseUtil.getCommentSearchObjectsFromDatabase(process.env.DATABASE_URL_TEST).then(function(data) {
      if (!data || data.length < 1) {
        throw 'Local database needs to be initialized with data';
      }
      
      commentFinder = new CommentSearchProcessor(data, 2000);
      resolve();
    });

    ClientHandler.addClients(
      agreeWithYouClient,
      discordClient
    );
  });
});

afterEach(() => {
  sandbox.resetBehavior();
  sandbox.restore();
});

describe('Reddit Comment Processor Test', function() {
  this.timeout(20000);
  
  it('class is not null/undefined', () => {
    assert.notEqual(undefined, RedditCommentProcessor);
    assert.notEqual(null, RedditCommentProcessor);
  });
  
  it('Reddit Comment Processor Full Test', async function() {
    let numberOfClientStubCalls = 0;
    // Create test comments
    const testCommentList = [
      {subreddit: 'learnProgramming', body: 'then everyone clapped', id: 1},
      {subreddit: 'learnProgramming', body: 'Denton Alcohol Delivery', id: 2},
      {subreddit: 'learnProgramming', body: 'None sense comment', id: 3},
      {subreddit: 'learnProgramming', body: 'should be ignored', id: 4}
    ];
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);
    
    const sendMessageAgreeClientStub = sandbox.stub(agreeWithYouClient, 'sendMessage');
    const sendMessageDiscordClientStub = sandbox.stub(discordClient, 'sendMessage');
    
    sendMessageAgreeClientStub.onCall(0).callsFake(function(returnObject) {
      assert.equal('then everyone clapped', returnObject.redditComment.body);
      numberOfClientStubCalls++;
      return Promise.resolve();
    });
    
    sendMessageDiscordClientStub.onCall(0).callsFake(function(returnObject) {
      assert.equal('Denton Alcohol Delivery', returnObject.redditComment.body);
      numberOfClientStubCalls++;
      return Promise.resolve();
    });
    
    
    const numberOfCommentsProcessed = await RedditCommentProcessor.processCommentsList(testCommentList);
    assert.equal(2, numberOfCommentsProcessed);
    assert.equal(2, numberOfClientStubCalls);
  });
  
  it('should not process any comments', async function() {
    // None of these comments should trigger anything
    const testCommentList = [
      {subreddit: 'learnProgramming', body: 'nothing burger', id: 1}
    ];
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

    const sendMessageAgreeClientStub = sandbox.stub(agreeWithYouClient, 'sendMessage');
    const sendMessageDiscordClientStub = sandbox.stub(discordClient, 'sendMessage');
    
    sendMessageAgreeClientStub.onCall(0).callsFake(function(returnObject) {
      fail("should not have been called");
    });
    
    sendMessageDiscordClientStub.onCall(0).callsFake(function(returnObject) {
      fail("should not have been called");
    });

    const numberOfCommentsProcessed = await RedditCommentProcessor.processCommentsList(testCommentList);
    assert.equal(0, numberOfCommentsProcessed);
  });
  
  it('Reddit Comment, ignore Agree-with-you comments', async function() {
    let numberOfClientStubCalls = 0;
    // Create test comments
    const testCommentList = [
      {subreddit: 'learnProgramming', body: 'spaghetti', id: 1, author: 'agree-with-you'}
    ];
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

    const sendMessageAgreeClientStub = sandbox.stub(agreeWithYouClient, 'sendMessage');
    const sendMessageDiscordClientStub = sandbox.stub(discordClient, 'sendMessage');
    
    sendMessageAgreeClientStub.onCall(0).callsFake(function(returnObject) {
      fail("should not have been called");
    });
    
    sendMessageDiscordClientStub.onCall(0).callsFake(function(returnObject) {
      fail("should not have been called");
    });
    
    const numberOfCommentsProcessed = await RedditCommentProcessor.processCommentsList(testCommentList);
    assert.equal(0, numberOfCommentsProcessed);
  });
});