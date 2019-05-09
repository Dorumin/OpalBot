const sha256 = require('js-sha256'),
rand = seed => sha256(seed)
    .split('')
    .map(char => isNaN(char) ? String.fromCharCode(char.charCodeAt(0) - 39) : char)
    .map(char => Math.ceil(char.charCodeAt(0) / 1.6) - 30);

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    // out.peasants.r = 'rate';
    out.peasants.rate = (message, content, lang) => {
        const criteria = Math.floor(Math.random() * 8),
        user = message.mentions.members.first() || content.trim() || message.member,
        critName = i18n.msg('criteria-' + (criteria + 1), 'rate', lang),
        identifier = user.id || user.toLowerCase(),
        name = user.nickname || user.user && user.user.username || user,
        doru = [
            '-1',
            '10',
            '11',
            '8',
            '1',
            '9',
            'immeasurable',
            '0',
            '2',
            '10'
        ],
        robyn = [
            '11',
            '10',
            '7',
            '1',
            '1',
            '10',
            'not even trying',
            '11',
            '10',
            '5',
        ],
        opal = [
            '10',
            '10',
            '10',
            '10',
            '5',
            '10',
            'not today satan',
            '1',
            '10',
            '10'
        ],
        rigged = {
            doru,
            '155545848812535808': doru,
            robyn,
            '187524257280950272': robyn,
            opal,
            '348233224293449729': opal,
        },
        result = rigged[identifier] || rand(identifier);

        message.channel.send(i18n.msg('result', 'rate', `<@${message.author.id}>`, name, result[criteria], critName, lang));
    } 
    return out;
};
