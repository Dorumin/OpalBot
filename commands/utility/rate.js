module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.r = 'rate';
    out.peasants.rate = (message, content, lang) => {
        result = Math.ceil(Math.random() * 10);
        message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, content, result, lang)).catch(OpalBot.util.log);
    } 
    return out;
};
