module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.say = (message, content, lang) => {
        try {
            var r = eval(content);
            if (r == null || !r.toString().trim()) throw r;
            message.channel.send(r.toString().trim()).catch(OpalBot.util.log);
        } catch(e) {
            message.channel.send(content).catch(OpalBot.util.log);
        }
    };

    return out;
};