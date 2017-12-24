const request = require('request');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.inspirational = 'inspiration';
    out.peasants.quote = 'inspiration';
    out.peasants.inspire = 'inspiration';
    out.peasants.inspiration = (message, content, lang) => {
        request('http://inspirobot.me/api?generate=true', (err, r, body) => {
            message.channel.send({
                embed: {
                    color: OpalBot.color,
                    image: {
                        url: body
                    }
                }
            });
        });
    };

    return out;
};