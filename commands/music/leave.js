module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.leave = (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller || !controller.connection) {
            message.channel.send(i18n.msg('not-playing', 'leave', lang));
            return;
        }

        controller.disconnect();
    };

    return out;
};