module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.help = (message) => message.reply('https://opalbot.herokuapp.com/commands')

    return out;
};
