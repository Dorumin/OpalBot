module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    // out.peasants.r = 'rate';
    out.peasants.rate = (message, content, lang) => {
        result = Math.ceil(Math.random() * 10);
        if (!content.trim()) {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, message.author.username, result, lang)).catch(OpalBot.util.log);
        } else if (content == 'Doru' || 'Robyn' || message.mentions.users.has('187524257280950272') || message.mentions.users.has('155545848812535808')) {
            message.channel.send(i18n.msg('rigsult', 'rate', `<@${message.author.id}>`, content, lang)).catch(OpalBot.util.log);
        } else {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, content, result, lang)).catch(OpalBot.util.log);
        }
    } 
    return out;
};
