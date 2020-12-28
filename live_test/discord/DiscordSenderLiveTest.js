require('../../reddit_comment_reader/DiscordSender.js')();
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN_TEST;

// A live test for sending a Discord message
function testDiscordSendMessage() {
  LogoutOfDiscord(DISCORD_TOKEN).then(function() {
    DiscordInitNewClient(DISCORD_TOKEN).then(function() {
      SendDiscordMessage('reddit-bot-test', {'body': 'test comment', 'permalink': 'test permalink'});
    });
  });
}

testDiscordSendMessage();