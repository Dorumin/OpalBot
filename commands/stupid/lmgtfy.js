module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.google = 'lmgtfy';
    out.peasants.lmgtfy = (message, content, lang) => {
        var encoded = encodeURIComponent(content).split('%20').join('+'),
        link = `http://lmgtfy.com/?q=${encoded}`
        message.channel.send(link).catch(OpalBot.util.log);
    };

    return out;
};