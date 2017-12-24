module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.online = 'runtime';
    out.peasants.uptime = 'runtime';
    out.peasants.runtime = (message, content, lang) => {
        let t = Date.now() - OpalBot.storage.last_downtime || OpalBot.client.uptime,
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
        p = [
            OpalBot.v,
            ...a.map(n => o[n])
        ],
        str = i18n.msg(k, 'runtime', ...p, lang);
        message.channel.send(str).catch(OpalBot.util.log);
    };

    return out;
};