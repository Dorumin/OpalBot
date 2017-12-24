const Discord  = require('discord.js'),
config = require('./config.js'),
client = new Discord.Client();

module.exports = (OpalBot) => {
    OpalBot.client = client;

    require('./listeners.js')(OpalBot);

    client.login(config.token).catch(OpalBot.util.log);
};