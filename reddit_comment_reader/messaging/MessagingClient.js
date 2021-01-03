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
  
  sendIdleMessageWhenInactive(secondsOfIdleToTriggerMessage) {
    
  }
  
  initialize() {}
}

class FayeMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], receivingMessagesURL = undefined, shouldIgnoreModeratorComments = true, timeBetweenSamePostInSubreddit = 0, fayeMessagesUrl = '/messages'} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit});
    this.receivingMessagesURL = receivingMessagesURL;
    this.fayeMessagesUrl = fayeMessagesUrl;
  }
  
  initialize() {
    this.client = new faye.Client(this.receivingMessagesURL);
    this.client.publish(this.fayeMessagesUrl, {message: 'starting up.'});
  }
  
  sendMessage({fayeMessagesUrl = this.fayeMessagesUrl, redditComment = undefined, redditReply = undefined} = {}) {
    this.client.publish(this.fayeMessagesUrl, {comment: redditComment, reply: redditReply});
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
  
  sendMessage({redditComment = undefined} = {}) {
    SendDiscordMessage(redditComment);
  }
}

module.exports = {
  MessagingClient : MessagingClient,
  FayeMessagingClient : FayeMessagingClient,
  DiscordMessagingClient : DiscordMessagingClient
};