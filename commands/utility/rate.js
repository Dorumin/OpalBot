module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    // out.peasants.r = 'rate';
    out.peasants.rate = (message, content, lang) => {
        result = Math.ceil(Math.random() * 10);
        item = content;
        if (!item.trim()) {
            message.channel.send(i18n.msg('result', 'rate', `message.member.nickname`, item, lang)).catch(OpalBot.util.log);
        } else if (item === ['Doru', 'Robyn']) {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, item, result, lang)).catch(OpalBot.util.log);
        } else {
            message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, item, result, lang)).catch(OpalBot.util.log);
        }
    } 
    return out;
};
