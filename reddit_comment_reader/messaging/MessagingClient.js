const faye = require('faye');

/**
 *
*/
class MessagingClient {
  constructor(clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
    this.shouldIgnoreModeratorComments = shouldIgnoreModeratorComments;
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor(clientTagName, blacklistedSubreddits, receivingMessagesURL, shouldIgnoreModeratorComments) {
    super(clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments);
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
  initialize() {
    const client = new faye.Client(this.receivingMessagesURL);
    client.publish('/messages', {message: 'starting up.'});
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor(clientTagName, blacklistedSubreddits, discordToken, shouldIgnoreModeratorComments) {
    super(clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments);
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