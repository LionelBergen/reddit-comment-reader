const Discord = require('discord.js');
const client = new Discord.Client();

class DiscordSender {
  initNewDiscordClient(discordToken)
  {
    client.on('ready', () => {
      console.log(`Client ready, user.tag is: ${client.user.tag}`);
    });
    
    return client.login(discordToken).then(function() {
      console.log(`Logged in as ${client.user.tag}`);
    });
  }
  
  sendDiscordMessage(channelName, redditComment) {
    const channelToCommunicateWith = findChannelByName(client.channels, channelName);
    
    if (!channelToCommunicateWith) {
      throw 'ChannelToComminicateWith is null!!';
    } else if (!redditComment || !redditComment.body || !redditComment.permalink) {
      throw 'Comment not well formed!';
    } else {
      channelToCommunicateWith.send(`Comment: ${redditComment.body}\r\nlink: https://reddit.com${redditComment.permalink}`);
    }
  }

  logoutOfDiscord(discordToken) {
    return client.destroy(discordToken);
  }
}

function findChannelByName(listOfChannels, channelName)
{
  return listOfChannels.find(channel => channel.name == channelName);
}

module.exports = new DiscordSender();