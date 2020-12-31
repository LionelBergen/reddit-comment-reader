const faye = require('faye');

/**
 *
*/
class MessagingClient {
  constructor(blacklistedSubreddits) {
    this.blacklistedSubreddits = blacklistedSubreddits;
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor(blacklistedSubreddits, receivingMessagesURL) {
    super(blacklistedSubreddits);
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
  initialize() {
    const client = new faye.Client(this.receivingMessagesURL);
    client.publish('/messages', {message: 'starting up.'});
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor(blacklistedSubreddits, discordToken) {
    super(blacklistedSubreddits);
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