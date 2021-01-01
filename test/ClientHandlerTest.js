const ClientHandler = require('../reddit_comment_reader/messaging/ClientHandler.js');
const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const assert = require('assert');

describe('Client Handler addClients', () => {
  it('should add to a list of clients', () => {
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient());
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient());
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient(), new MessagingClients.FayeMessagingClient());
    
    assert.equal(4, ClientHandler.clients.length);
  });
});

describe('Client Handler getClientByTagName', () => {
  it('should find client by name', () => {
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient({clientTagName:'test1'}));
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient({clientTagName:'test2'}));
    ClientHandler.addClients(new MessagingClients.FayeMessagingClient({clientTagName:'test3'}), new MessagingClients.FayeMessagingClient({clientTagName:'test4'}));
    
    assert.equal('test3', ClientHandler.getClientByTagName('test3').clientTagName);
    assert.equal('test2', ClientHandler.getClientByTagName('test2').clientTagName);
    assert.equal('test1', ClientHandler.getClientByTagName('test1').clientTagName);
    assert.equal('test4', ClientHandler.getClientByTagName('test4').clientTagName);
  });
});