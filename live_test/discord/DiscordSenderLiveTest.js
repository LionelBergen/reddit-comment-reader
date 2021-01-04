const DiscordSender = require('../../reddit_comment_reader/tools/DiscordSender.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN_TEST;

// A live test for sending a Discord message
function testDiscordSendMessage() {
  DiscordSender.logoutOfDiscord(DISCORD_TOKEN).then(function() {
    DiscordSender.initNewDiscordClient(DISCORD_TOKEN).then(function() {
      DiscordSender.sendDiscordMessage('reddit-bot-test', {'body': 'test comment', 'permalink': 'test permalink'});
    });
  });
}

testDiscordSendMessage();