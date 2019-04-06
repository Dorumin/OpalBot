module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.ud = 'urban';
    out.peasants.urban = (message, content, lang) => {
        message.channel.send(`https://www.urbandictionary.com/define.php?term=${encodeURIComponent(content)}`);
    };

    return out;
};