module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.me = 'lenny';
    out.peasants.lanny = 'lenny';
    out.peasants.lenny = (message, content, lang) => {
        message.channel.send('( ͡° ͜ʖ ͡°)').catch(OpalBot.util.log);
    };

    return out;
};