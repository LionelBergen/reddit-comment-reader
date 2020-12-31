/**
 *
*/
class MessagingClient {
}

class FayeMessagingClient extends MessagingClient {
  
}

class DiscordMessagingClient extends MessagingClient {
  
}

module.exports = {
  MessagingClient : MessagingClient,
  FayeMessagingClient : FayeMessagingClient,
  DiscordMessagingClient : DiscordMessagingClient
}