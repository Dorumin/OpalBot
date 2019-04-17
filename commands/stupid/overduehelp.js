module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.help = (message) => message.replay('https://opalbot.herokuapp.com/commands')

    return out;
};
