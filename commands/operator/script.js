const request = require('request');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.script = (message, content, lang) => {
        request(content, (err, r, body) => {
            if (err) return;
            message.channel.send('Package loaded').catch(OpalBot.util.log);
            try {
                eval(body);
            } catch(e) {
                message.channel.send(e.toString()).catch(OpalBot.util.log);
            }
        });
    };

    return out;
};