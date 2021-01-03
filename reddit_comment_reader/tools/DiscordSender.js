const Discord = require('discord.js');
const client = new Discord.Client();

function initNewDiscordClient(discordToken)
{
  client.on('ready', () => {
    console.log(`Client ready, user.tag is: ${client.user.tag}`);
  });
  
  return client.login(discordToken).then(function(e) {
	  console.log(`Logged in as ${client.user.tag}`);
  });
}

function Logout(discordToken) {
  return client.destroy(discordToken);
}

function sendDiscordMessage(channelName, redditComment) {
  const channelToCommunicateWith = findChannelByName(client.channels, channelName);
  
  if (!channelToCommunicateWith) {
    throw 'ChannelToComminicateWith is null!!';
  } else if (!redditComment || !redditComment.body || !redditComment.permalink) {
	  throw 'Comment not well formed!';
  } else {
    channelToCommunicateWith.send(`Comment: ${redditComment.body}\r\nlink: https://reddit.com${redditComment.permalink}`);
  }
}

function findChannelByName(listOfChannels, channelName)
{
  return listOfChannels.find(channel => channel.name == channelName);
}


module.exports = function() {
  this.DiscordInitNewClient = initNewDiscordClient;
  this.SendDiscordMessage = sendDiscordMessage;
  this.LogoutOfDiscord = Logout;
};