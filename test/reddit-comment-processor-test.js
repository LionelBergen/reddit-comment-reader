import { RedditClient } from 'reddit-simple-client';
import RedditCommentProcessor from '../reddit-comment-reader/reddit-comment-processor.js';
import ClientHandler from '../reddit-comment-reader/messaging/client-handler.js';
import DatabaseUtil from '../reddit-comment-reader/tools/database/database-util.js';
import { FayeMessagingClient, DiscordMessagingClient } from '../reddit-comment-reader/messaging/messaging-client.js';
import CommentSearchProcessor from '../reddit-comment-reader/tools/comment-finder.js';

import sinon from 'sinon';
import assert from 'assert';
import 'dotenv/config';

const sandbox = sinon.createSandbox();
let commentFinder;
const agreeWithYouClient = new FayeMessagingClient({ clientTagName: 'Agree-with-you' });
const discordClient = new DiscordMessagingClient({ clientTagName: 'DISCORD' });

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

describe.skip('Reddit Comment Processor Test', function() {
  this.timeout(20000);

  it('class is not null/undefined', () => {
    assert.notEqual(undefined, RedditCommentProcessor);
    assert.notEqual(null, RedditCommentProcessor);
  });

  it('Reddit Comment Processor Full Test', async function() {
    let numberOfClientStubCalls = 0;
    // Create test comments
    const testCommentList = [
      { subreddit: 'learnProgramming', body: 'then everyone clapped', id: 1 },
      { subreddit: 'learnProgramming', body: 'Denton Alcohol Delivery', id: 2 },
      { subreddit: 'learnProgramming', body: 'None sense comment', id: 3 },
      { subreddit: 'learnProgramming', body: 'should be ignored', id: 4 }
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
      { subreddit: 'learnProgramming', body: 'nothing burger', id: 1 }
    ];
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

    const sendMessageAgreeClientStub = sandbox.stub(agreeWithYouClient, 'sendMessage');
    const sendMessageDiscordClientStub = sandbox.stub(discordClient, 'sendMessage');

    sendMessageAgreeClientStub.onCall(0).callsFake(function() {
      assert.fail("should not have been called");
    });

    sendMessageDiscordClientStub.onCall(0).callsFake(function() {
      assert.fail("should not have been called");
    });

    const numberOfCommentsProcessed = await RedditCommentProcessor.processCommentsList(testCommentList);
    assert.equal(0, numberOfCommentsProcessed);
  });

  it('Reddit Comment, ignore Agree-with-you comments', async function() {
    // Create test comments
    const testCommentList = [
      { subreddit: 'learnProgramming', body: 'spaghetti', id: 1, author: 'agree-with-you' }
    ];
    RedditCommentProcessor.init(commentFinder, RedditClient, ClientHandler);

    const sendMessageAgreeClientStub = sandbox.stub(agreeWithYouClient, 'sendMessage');
    const sendMessageDiscordClientStub = sandbox.stub(discordClient, 'sendMessage');

    sendMessageAgreeClientStub.onCall(0).callsFake(function() {
      assert.fail("should not have been called");
    });

    sendMessageDiscordClientStub.onCall(0).callsFake(function() {
      assert.fail("should not have been called");
    });

    const numberOfCommentsProcessed = await RedditCommentProcessor.processCommentsList(testCommentList);
    assert.equal(0, numberOfCommentsProcessed);
  });
});

// TODO: !IMPORTANT Add tests for failures, such as Agree-with-you failing, then continuing to process comments.
//  Test for failure with Discord, failure with Faye. Ensure others are not affected.
