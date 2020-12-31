const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const assert = require('assert');

describe('Messaging Clients Class', () => {
  it('classes exist and can be instantiated', () => {
    assert.notEqual(undefined, new MessagingClients.MessagingClient());
    assert.notEqual(undefined, new MessagingClients.FayeMessagingClient());
    assert.notEqual(undefined, new MessagingClients.DiscordMessagingClient());
  });
});