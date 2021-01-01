const faye = require('faye');

/**
 *
*/
class MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], shouldIgnoreModeratorComments=false} = {}) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
    this.shouldIgnoreModeratorComments = shouldIgnoreModeratorComments;
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], receivingMessagesURL = undefined, shouldIgnoreModeratorComments = true} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments});
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
  initialize() {
    const client = new faye.Client(this.receivingMessagesURL);
    client.publish('/messages', {message: 'starting up.'});
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], discordToken = undefined, shouldIgnoreModeratorComments = false} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments});
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