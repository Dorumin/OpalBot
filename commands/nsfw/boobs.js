const got = require('got');

module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.boob = 'boobs';
    out.peasants.breasts = 'boobs';
    out.peasants.breast = 'boobs';
    out.peasants.tits = 'boobs';
    out.peasants.boobs = async (message, content, lang) => {
        if (!message.channel.nsfw) {
            message.channel.send('This channel isn\'t flagged as NSFW!');
            return;
        }

        const { body } = await got('http://api.oboobs.ru/boobs/' + Math.floor(Math.random() * 13309), { json: true });

        if (body[0]) {
            message.channel.send('http://media.oboobs.ru/' + body[0].preview);
        }
    };

    return out;
};