import { MessagingClient, FayeMessagingClient, DiscordMessagingClient } from '../reddit-comment-reader/messaging/messaging-client.js';
import assert from 'assert';

describe('Messaging Clients Class', () => {
  it('classes exist and can be instantiated', () => {
    assert.notEqual(undefined, new MessagingClient());
    assert.notEqual(undefined, new FayeMessagingClient());
    assert.notEqual(undefined, new DiscordMessagingClient());
  });

  it('classes with properties', () => {
    const messagingClientGeneric = new MessagingClient({ clientTagName: 'generic client', blacklistedSubreddits: [1, 2], shouldIgnoreModeratorComments: false, timeBetweenSamePostInSubreddit: 1 });
    const messagingClientFaye = new FayeMessagingClient({ clientTagName: 'Faye client', blacklistedSubreddits: [1, 2], receivingMessagesURL: '', shouldIgnoreModeratorComments: true, timeBetweenSamePostInSubreddit: 2 });
    const messagingClientDiscord = new DiscordMessagingClient({ clientTagName: 'Discord client', blacklistedSubreddits: [1, 2], discordToken: '', shouldIgnoreModeratorComments: false, timeBetweenSamePostInSubreddit: 3 });

    assert.equal(2, messagingClientGeneric.blacklistedSubreddits.length);
    assert.equal(2, messagingClientFaye.blacklistedSubreddits.length);
    assert.equal(2, messagingClientDiscord.blacklistedSubreddits.length);

    assert.equal('generic client', messagingClientGeneric.clientTagName);
    assert.equal('Faye client', messagingClientFaye.clientTagName);
    assert.equal('Discord client', messagingClientDiscord.clientTagName);

    assert.equal(false, messagingClientGeneric.shouldIgnoreModeratorComments);
    assert.equal(true, messagingClientFaye.shouldIgnoreModeratorComments);
    assert.equal(false, messagingClientDiscord.shouldIgnoreModeratorComments);

    assert.equal(1, messagingClientGeneric.timeBetweenSamePostInSubreddit);
    assert.equal(2, messagingClientFaye.timeBetweenSamePostInSubreddit);
    assert.equal(3, messagingClientDiscord.timeBetweenSamePostInSubreddit);
  });
});
