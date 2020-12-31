const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const assert = require('assert');

describe('Messaging Clients Class', () => {
  it('classes exist and can be instantiated', () => {
    assert.notEqual(undefined, new MessagingClients.MessagingClient());
    assert.notEqual(undefined, new MessagingClients.FayeMessagingClient());
    assert.notEqual(undefined, new MessagingClients.DiscordMessagingClient());
  });
  
  it('classes with properties', () => {
    assert.notEqual([1, 2], new MessagingClients.MessagingClient([1, 2]).blacklistedSubreddits);
    assert.notEqual([1, 2], new MessagingClients.FayeMessagingClient([1, 2]).blacklistedSubreddits);
    assert.notEqual([1, 2], new MessagingClients.DiscordMessagingClient([1, 2]).blacklistedSubreddits);
  });
});