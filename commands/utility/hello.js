module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.hi = 'hello';
    out.peasants.hey = 'hello';
    out.peasants.hello = (message, content, lang) => {
        switch (message.author.username + '#' + message.author.discriminator) {
            case 'Dorumin#0969':
                message.reply('hello useless pile of goop!').catch(OpalBot.util.log);
            break;
            case 'Oasis#4730':
                message.reply('hello, loser!').catch(OpalBot.util.log);
                break;
            default:
                message.reply(i18n.msg(i18n.msg('default', 'hello', message.author, lang))).catch(OpalBot.util.log);
        }
    };

    return out;
};