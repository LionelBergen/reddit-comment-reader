const ClientHandler = require('../reddit_comment_reader/messaging/ClientHandler.js');
const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const assert = require('assert');

describe('Client Handler', () => {
  it('should add to a list of clients', () => {
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient([], 'test'));
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient([], 'test'));
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient([], 'test'), new MessagingClients.FayeMessagingClient([], 'test'));
    
    assert.equal(4, ClientHandler.clients.length);
  });
});