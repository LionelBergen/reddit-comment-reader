const DiscordSender = require('../../reddit_comment_reader/tools/DiscordSender.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN_TEST;

// A live test for sending a Discord message
async function testDiscordSendMessage() {
  const tagName = await DiscordSender.initNewDiscordClient(DISCORD_TOKEN);

  DiscordSender.sendDiscordMessage(
    tagName,
    'reddit-bot-test',
    { 'body': 'test comment', 'permalink': 'test permalink' }
  );
  await DiscordSender.logoutOfDiscord(tagName);
}

testDiscordSendMessage();
