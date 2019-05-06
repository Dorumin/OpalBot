module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    // out.peasants.r = 'rate';
    out.peasants.rate = (message, content, lang) => {
        result = Math.ceil(Math.random() * 10);
        if (!content.trim()) {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, message.author.username, result, lang)).catch(OpalBot.util.log);
        } else if (content == 'robyn') {
            message.channel.send(i18n.msg('rigsult', 'rate', `<@${message.author.id}>`, result, lang)).catch(OpalBot.util.log);
        } else {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, item, result, lang)).catch(OpalBot.util.log);
        }
    } 
    return out;
};
