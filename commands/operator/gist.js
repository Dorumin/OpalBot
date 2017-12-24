const request = require('request');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.gist = (message, content, lang) => {
        let split = content.split('/');
        if (split.length == 1) {
            split.unshift('Dorumin'); // my GitHub follow ples
        } else if (split.length == 3) {
            split.pop(); // no need for /raw
        }
        request(`https://gist.github.com/${split.join('/')}/raw`, (err, r, body) => {
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