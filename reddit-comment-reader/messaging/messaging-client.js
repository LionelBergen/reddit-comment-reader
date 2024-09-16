const faye = require('faye');
const Util = require('../tools/common-tools.js');
const LogManager = require('../tools/logger.js');
const DiscordSender = require('discord-multi-bot');

const Logger = LogManager.createInstance('RedditCommentProcessor.js');

/**
 *
*/
class MessagingClient {
  constructor({ clientTagName = undefined, blacklistedSubreddits = [], shouldIgnoreModeratorComments = true, timeBetweenSamePostInSubreddit = 0 } = {}) {
    this.clientTagName = clientTagName;
    this.blacklistedSubreddits = blacklistedSubreddits;
    this.shouldIgnoreModeratorComments = shouldIgnoreModeratorComments;
    this.timeBetweenSamePostInSubreddit = timeBetweenSamePostInSubreddit;
    this.lastMessageSentAt;
  }

  async initialize() {}

  sendMessage() {
    this.lastMessageSentAt = new Date().getTime();
  }
}

class FayeMessagingClient extends MessagingClient {
  constructor({ clientTagName = undefined, blacklistedSubreddits = [], receivingMessagesURL = undefined, shouldIgnoreModeratorComments = true, timeBetweenSamePostInSubreddit = 0, fayeMessagesUrl = '/messages' } = {}) {
    super({ clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit });
    this.receivingMessagesURL = receivingMessagesURL;
    this.fayeMessagesUrl = fayeMessagesUrl;
  }

  async initialize() {
    await super.initialize();
    this.client = new faye.Client(this.receivingMessagesURL);
    this.client.publish(this.fayeMessagesUrl, { message: 'starting up.' });
  }

  sendMessage({ fayeMessagesUrl = this.fayeMessagesUrl, redditComment = undefined, redditReply = undefined } = {}) {
    super.sendMessage();
    this.client.publish(fayeMessagesUrl, { comment: redditComment, reply: redditReply });
    return Promise.resolve(1);
  }

  sendIdleMessageWhenInactive(secondsOfIdleToTriggerMessage) {
    if (Util.getSecondsSinceTimeInSeconds(this.lastMessageSentAt) > secondsOfIdleToTriggerMessage) {
      Logger.info('sending active message');
      this.client.publish(this.fayeMessagesUrl, { active: '1' });
      this.lastMessageSentAt = new Date().getTime();
    }
  }
}

class DiscordMessagingClient extends MessagingClient {
  constructor({ clientTagName = undefined, channelName = undefined, blacklistedSubreddits = [], discordToken = undefined, shouldIgnoreModeratorComments = false, timeBetweenSamePostInSubreddit = 0 } = {}) {
    super({ clientTagName, blacklistedSubreddits, shouldIgnoreModeratorComments, timeBetweenSamePostInSubreddit });
    this.discordToken = discordToken;
    this.channelName = channelName;
  }

  async initialize() {
    await super.initialize();
    this.discordTagName = await DiscordSender.initNewDiscordClient(this.discordToken);
  }

  sendMessage({ redditComment = undefined } = {}) {
    super.sendMessage();
    let messageToSendToDiscord = `comment: ${redditComment.body}\r\nlink: https://www.reddit.com${redditComment.permalink}`;
    // Discord does not allow messages over 2000.
    if (messageToSendToDiscord.length >= 2000) {
      const numberOfCharactersToTrim = (messageToSendToDiscord.length - 2000) + 1;
      const trimmedBody = redditComment.body.substring(0, redditComment.body.length - numberOfCharactersToTrim);
      messageToSendToDiscord = `comment: ${trimmedBody}\r\nlink: https://www.reddit.com${redditComment.permalink}`;
      Logger.debug('Comment trimmed to new size of: ' + messageToSendToDiscord.length);
    }

    return DiscordSender.sendDiscordMessage(this.discordTagName, this.channelName, messageToSendToDiscord);
  }
}

module.exports = {
  MessagingClient: MessagingClient,
  FayeMessagingClient: FayeMessagingClient,
  DiscordMessagingClient: DiscordMessagingClient
};
