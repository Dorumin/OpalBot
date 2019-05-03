module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.s = 'skip';
    out.peasants.next = 'skip';
    out.peasants.skip = async (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller || !controller.connection) {
            message.channel.send(i18n.msg('not-playing', 'skip', lang));
            return;
        }

        if (controller.queue[controller.currentIndex + 1]) {
            await message.channel.send(i18n.msg('skipped', 'skip', lang));
            if (Math.random() < .1) {
                await message.channel.send(i18n.msg('random', 'skip', lang));
            }
        } else {
            await message.channel.send(
                i18n.msg(
                    controller.loop == 2
                        ? 'skipped-loop'
                        : 'skipped-end',
                    'skip',
                    lang
                )
            );
        }

        controller.next();
    };

    return out;
}