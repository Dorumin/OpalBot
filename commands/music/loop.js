module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.loop = (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller || !controller.connection) {
            message.channel.send(i18n.msg('not-playing', 'loop', lang));
            return;
        }

        controller.loop++;
        if (controller.loop > 2) {
            controller.loop = 0;
        }

        message.channel.send(i18n.msg('looping-' + controller.loop, 'loop', lang));
    };

    return out;
}