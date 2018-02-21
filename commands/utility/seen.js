module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.s = 'seen';
    out.peasants.seen = async (message, content, lang) => {
        let user = message.mentions.users.first();
        if (!user) {
            user = message.content.match(/<@!?(\d+)>/);
            user = user && OpalBot.client.users.get(user[1]);
            if (!user) {
                message.channel.send(i18n.msg('no-mention', 'seen', lang)).catch(OpalBot.util.log);
                return;
            }
        }
        let data = (await OpalBot.db).seen || {};
        if (['online', 'dnd'].includes(user.presence.status)) {
            message.channel.send(i18n.msg('online', 'seen', user.username, lang)).catch(OpalBot.util.log);
            return;
        }
        if (!data[user.id]) {
            message.channel.send(i18n.msg('no-data', 'seen', user.username + '#' + user.discriminator, lang)).catch(OpalBot.util.log);
            return;
        }
        
        let t = Date.now() - data[user.id],
        f = Math.floor,
        s = f(t / 1000),
        m = f(s / 60),
        h = f(m / 60),
        d = f(h / 24),
        o = {
            s: s % 60,
            m: m % 60,
            h: h % 24,
            d: d
        },
        a = Object.keys(o).filter(n => o[n]).reverse(),
        k = a.join('-'),
        str = i18n.msg(k, 'seen', message.author, user.username, ...a.map(n => o[n]), lang);
        message.channel.send(str).catch(OpalBot.util.log);
    };

    return out;
};