module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.v = 'volume';
    out.peasants.vol = 'volume';
    out.peasants.volume = (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller) {
            message.channel.send(i18n.msg('not-playing', 'volume', lang));
            return;
        }

        const num = parseInt(content);

        if (isNaN(num) || num > 200 || num < 1) {
            message.channel.send(i18n.msg('invalid', 'volume', lang));
            return;
        }

        controller.setVolume(content);

        const vol = num < 50
            ? 'low'
            : vol < 80
                ? 'medium'
                : 'high';

        message.channel.send(i18n.msg(`volume-set-${vol}`, 'volume', num, lang));
    };

    return out;
}