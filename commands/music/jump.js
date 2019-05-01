module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.jump = (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller || !controller.connection) {
            message.channel.send(i18n.msg('not-playing', 'jump', lang));
            return;
        }

        if (controller.currentIndex == controller.queue.length - 1) {
            message.channel.send(i18n.msg('already-last', 'jump', lang));
            return;
        }

        controller.queue.splice(controller.currentIndex + 1, 0, controller.queue.pop());

        controller.next();

        message.channel.send(i18n.msg('jumping', 'jump', lang));
    };

    return out;
};