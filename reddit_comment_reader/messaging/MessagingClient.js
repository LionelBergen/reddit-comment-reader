const faye = require('faye');
const DiscordSender = require('../tools/DiscordSender.js');
const Util = require('../tools/CommonTools.js');

/**
 *
*/
class MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], shouldIgnoreModeratorComments = false, timeBetweenSamePostInSubreddit = 0} = {}) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
    this.shouldIgnoreModeratorComments = shouldIgnoreModeratorComments;
    this.timeBetweenSamePostInSubreddit = timeBetweenSamePostInSubreddit;
    this.lastMessageSentAt;
  }
  
  initialize() {}
  
  sendMessage() { 
    this.lastMessageSentAt = new Date().getTime();
  }
}

class FayeMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], receivingMessagesURL = undefined, shouldIgnoreModeratorComments = true, timeBetweenSamePostInSubreddit = 0, fayeMessagesUrl = '/messages'} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit});
    this.receivingMessagesURL = receivingMessagesURL;
    this.fayeMessagesUrl = fayeMessagesUrl;
  }
  
  initialize() {
    super.initialize();
    this.client = new faye.Client(this.receivingMessagesURL);
    this.client.publish(this.fayeMessagesUrl, {message: 'starting up.'});
  }
  
  sendMessage({fayeMessagesUrl = this.fayeMessagesUrl, redditComment = undefined, redditReply = undefined} = {}) {
    super.sendMessage();
    this.client.publish(fayeMessagesUrl, {comment: redditComment, reply: redditReply});
  }
  
  sendIdleMessageWhenInactive(secondsOfIdleToTriggerMessage) {
    if (Util.getSecondsSinceTimeInSeconds(this.lastMessageSentAt) > secondsOfIdleToTriggerMessage) {
      console.log('sending active message');
      this.client.publish(this.fayeMessagesUrl, {active: '1'});
      this.lastMessageSentAt = new Date().getTime();
    }
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor({clientTagName = undefined, blacklistedSubreddits = [], discordToken = undefined, shouldIgnoreModeratorComments = false, timeBetweenSamePostInSubreddit = 0} = {}) {
    super({clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit});
    this.discordToken = discordToken;
  }
  
  initialize() {
    super.initialize();
    DiscordSender.initNewDiscordClient(this.discordToken);
  }
  
  sendMessage({redditComment = undefined} = {}) {
    super.sendMessage();
    DiscordSender.sendDiscordMessage(redditComment);
  }
}

module.exports = {
  MessagingClient : MessagingClient,
  FayeMessagingClient : FayeMessagingClient,
  DiscordMessagingClient : DiscordMessagingClient
};