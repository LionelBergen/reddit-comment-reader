const Discord = require('discord.js');
const client = new Discord.Client();

const REDDIT_CHANNEL_NAME = 'reddit';

var channelToCommunicateWith;

function discordInit()
{
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    channelToCommunicateWith = findChannelByName(client.channels, REDDIT_CHANNEL_NAME)
    
    if (!channelToCommunicateWith) {
      throw 'Could not find channel: ' + REDDIT_CHANNEL_NAME;
    }
    else {
      console.log('channel has been set.');
    }
  });

  client.login(process.env.DISCORD_TOKEN);

  function findChannelByName(listOfChannels, channelName)
  {
    return listOfChannels.find(channel => channel.name == channelName);
  }
}

function sendDiscordMessage(comment) {
  if (!channelToCommunicateWith) {
    throw 'ChannelToComminicateWith is null!!';
  }
  else {
    channelToCommunicateWith.send(`Comment: ${comment.body}\r\nlink: https://reddit.com${comment.permalink}`);
  }
}


module.exports = function() {
  // TODO: init is stupid
  this.DiscordInit = discordInit;
  this.SendDiscordMessage = sendDiscordMessage;
}