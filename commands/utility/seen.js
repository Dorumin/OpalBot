module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    function getTimes(t) {
        let f = Math.floor,
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
        k = a.join('-');

        return [k, o, a];
    }
    
    out.peasants = {};
    // out.peasants.s = 'seen';
    out.peasants.seen = async (message, content, lang) => {
        let user = message.mentions.users.first();
        if (!user) {
            if (/^\d+$/.test(content)) {
                user = OpalBot.client.users.get(content);
                if (!user) {
                    user = content;
                }
            } else {
                message.channel.send(i18n.msg('no-mention', 'seen', lang)).catch(OpalBot.util.log);
                return;
            }
        }
        let data = (await OpalBot.db).seen || {};

        const res = data[user.id || user];
        console.log(res);

        if (user.presence) {
            if (['online', 'dnd'].includes(user.presence.status)) {
                message.channel.send(i18n.msg('online', 'seen', user.username, lang)).catch(OpalBot.util.log);
                if (res[1]) {
                    const [key, values, times] = getTimes(Date.now() - res[1]);
                    if (!key) return;
                    const str = i18n.msg('l-' + key, 'seen', message.author, user.username || `<@${user}>`, ...times.map(n => values[n]), lang);
                    message.channel.send(str).catch(OpalBot.util.log);
                }
                return;
            }
            if (!res) {
                message.channel.send(i18n.msg('no-data', 'seen', user.username + '#' + user.discriminator, lang)).catch(OpalBot.util.log);
                return;
            }
        }
        let t;
        if (res instanceof Array) {
            t = res[0] || res[1];
        } else {
            t = res;
        }
        t = Date.now() - t;
        const [key, values, times] = getTimes(t);
        if (!key) return;
        let str = i18n.msg(key, 'seen', message.author, user.username || `<@${user}>`, ...times.map(n => values[n]), lang);
        if (typeof res == 'number' || !res[0] || !res[1]) {
            message.channel.send(str).catch(OpalBot.util.log);
        } else {
            const [key, values, times] = getTimes(Date.now() - res[1]);
            if (key) {
                str += '\n' + i18n.msg('l-' + key, 'seen', message.author, user.username || `<@${user}>`, ...times.map(n => values[n]), lang);
            }
            message.channel.send(str).catch(OpalBot.util.log);
        }
    };

    return out;
};