const faye = require('faye');

/**
 *
*/
class MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], shouldIgnoreModeratorComments = false, timeBetweenSamePostInSubreddit = 0} = {}) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
    this.shouldIgnoreModeratorComments = shouldIgnoreModeratorComments;
    this.timeBetweenSamePostInSubreddit = timeBetweenSamePostInSubreddit;
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], receivingMessagesURL = undefined, shouldIgnoreModeratorComments = true, timeBetweenSamePostInSubreddit = 0} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit});
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
  initialize() {
    const client = new faye.Client(this.receivingMessagesURL);
    client.publish('/messages', {message: 'starting up.'});
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], discordToken = undefined, shouldIgnoreModeratorComments = false, timeBetweenSamePostInSubreddit = 0} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit});
    this.discordToken = discordToken;
  }
  
  initialize() {
    DiscordInitNewClient(this.discordToken);
  }
}

module.exports = {
  MessagingClient : MessagingClient,
  FayeMessagingClient : FayeMessagingClient,
  DiscordMessagingClient : DiscordMessagingClient
}