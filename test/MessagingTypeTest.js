const MessagingClients = require('../reddit_comment_reader/messaging/MessagingClient.js');
const assert = require('assert');

describe('Messaging Clients Class', () => {
  it('classes exist and can be instantiated', () => {
    assert.notEqual(undefined, new MessagingClients.MessagingClient());
    assert.notEqual(undefined, new MessagingClients.FayeMessagingClient());
    assert.notEqual(undefined, new MessagingClients.DiscordMessagingClient());
  });
  
  it('classes with properties', () => {
    const messagingClientGeneric = new MessagingClients.MessagingClient({clientTagName:'generic client', blacklistedSubreddits:[1, 2], shouldIgnoreModeratorComments:false});
    const messagingClientFaye = new MessagingClients.FayeMessagingClient({clientTagName:'Faye client', blacklistedSubreddits:[1, 2], receivingMessagesURL:'', shouldIgnoreModeratorComments:true});
    const messagingClientDiscord = new MessagingClients.DiscordMessagingClient({clientTagName:'Discord client', blacklistedSubreddits:[1, 2], discordToken:'', shouldIgnoreModeratorComments:false});
    
    assert.equal(2, messagingClientGeneric.blacklistedSubreddits.length);
    assert.equal(2, messagingClientFaye.blacklistedSubreddits.length);
    assert.equal(2, messagingClientDiscord.blacklistedSubreddits.length);
    
    assert.equal('generic client', messagingClientGeneric.clientTagName);
    assert.equal('Faye client', messagingClientFaye.clientTagName);
    assert.equal('Discord client', messagingClientDiscord.clientTagName);
    
    assert.equal(false, messagingClientGeneric.shouldIgnoreModeratorComments);
    assert.equal(true, messagingClientFaye.shouldIgnoreModeratorComments);
    assert.equal(false, messagingClientDiscord.shouldIgnoreModeratorComments);
  });
});