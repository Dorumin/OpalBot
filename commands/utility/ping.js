module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.pong = 'ping';
    out.peasants.ping = (message, content, lang) => {
        let ping = message.content.indexOf('ping') + 1 || 1000,
        pong = message.content.indexOf('pong') + 1 || 1001,
        d1 = Date.now(); // Don't tell me to use message.createdTimestamp. That can return negative values.
        message.channel.send(ping < pong ? i18n.msg('pong', 'ping', lang) : i18n.msg('ping', 'ping', lang)).then(msg => {
            let latency = Date.now() - d1;
            if (!msg.editable) {
                message.channel.send(i18n.msg('result', 'ping', latency, lang)).catch(OpalBot.util.log);
                return;
            }
            msg.edit(msg.content + '\n' + i18n.msg('result', 'ping', latency, lang)).catch(OpalBot.util.log);
        }).catch(OpalBot.util.log);
    };

    return out;
};