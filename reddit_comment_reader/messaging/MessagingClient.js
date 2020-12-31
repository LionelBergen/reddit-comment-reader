/**
 *
*/
class MessagingClient {
}

class FayeMessagingClient extends MessagingClient {
  constructor(receivingMessagesURL) {
    super();
    this.receivingMessagesURL = receivingMessagesURL;
  }
  
}

class DiscordMessagingClient extends MessagingClient {
  
}

module.exports = {
  MessagingClient : MessagingClient,
  FayeMessagingClient : FayeMessagingClient,
  DiscordMessagingClient : DiscordMessagingClient
}