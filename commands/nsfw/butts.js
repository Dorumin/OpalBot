const got = require('got');

module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.butt = 'butts';
    out.peasants.ass = 'butts';
    out.peasants.asses = 'butts';
    out.peasants.butts = async (message, content, lang) => {
        if (!message.channel.nsfw) {
            message.channel.send('This channel isn\'t flagged as NSFW!');
            return;
        }

        const { body } = await got('http://api.obutts.ru/butts/' + Math.floor(Math.random() * 6975), { json: true });

        if (body[0]) {
            message.channel.send('http://media.obutts.ru/' + body[0].preview);
        }
    };

    return out;
};