module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.pick = 'choose';
    out.peasants.choose = (message, content, lang) => {
        if (!content) {
            message.reply(i18n.msg('missing', 'pick', lang)).catch(OpalBot.util.log);
            return;
        }
        let reg = new RegExp('\\' + i18n.msg('delimiters', 'pick', lang).split(' ').join('|\\')),
        split = content.split(reg).filter(Boolean);
        if (!split.length) {
            message.reply(i18n.msg('missing', 'pick', lang)).catch(OpalBot.util.log);
        } else if (split.length == 1) {
            message.reply(i18n.msg('one', 'pick', lang)).catch(OpalBot.util.log);
        } else {
            let randum = split[Math.floor(Math.random() * split.length)].trim().replace(/(\\\*)|\*/g, (s, c) => c ? s : '\\*');
            message.reply(i18n.msg('result', 'pick', randum, lang)).catch(OpalBot.util.log);
        }
    };

    return out;
};