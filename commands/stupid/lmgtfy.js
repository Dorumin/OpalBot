module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.google = 'search';
    out.peasants.search = (message, content, lang) => {
        var encoded = encodeURIComponent(content).split('%20').join('+'),
        link = `https://www.google.com/search?q=${encoded}`
        message.channel.send(link).catch(OpalBot.util.log);
    };

    return out;
};
