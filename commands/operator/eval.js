module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.run = 'eval';
    out.operator.eval = (message, content, lang) => {
        let send = msg => message.channel.send(msg);
        try {
            eval(`(async () => {
                try {
                    ${content}
                } catch(e) {
                    send('ERROR: ' + e);
                }
            })();`);
        } catch(e) {
            message.channel.send(e).catch(OpalBot.util.log);
        }
    };

    return out;
};