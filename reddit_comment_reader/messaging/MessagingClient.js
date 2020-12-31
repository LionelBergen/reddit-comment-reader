const faye = require('faye');

/**
 *
*/
class MessagingClient {
  constructor(clientTagName, blacklistedSubreddits) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor(clientTagName, blacklistedSubreddits, receivingMessagesURL) {
    super(clientTagName, blacklistedSubreddits);
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
  initialize() {
    const client = new faye.Client(this.receivingMessagesURL);
    client.publish('/messages', {message: 'starting up.'});
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor(clientTagName, blacklistedSubreddits, discordToken) {
    super(clientTagName, blacklistedSubreddits);
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