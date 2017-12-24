module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.status = 'test';
    out.peasants.test = (message, content, lang) => {
        message.reply(i18n.msg('online', 'test', lang)).catch(OpalBot.util.log);
    };

    return out;
};