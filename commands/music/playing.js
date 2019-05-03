/* Currently playing song */
module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.np = 'playing';
    out.peasants.playing = (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id];

        if (!controller || !controller.connection) {
            message.channel.send(i18n.msg('not-connected', 'playing', lang));
            return;
        }

        const video = controller.currentVideo();

        if (!controller.playing || !video) {
            message.channel.send(i18n.msg('not-playing', 'playing', lang));
        }

        controller.sendSongEmbed({
            channel: message.channel,
            playing: true,
            user: message.author,
            title: video.cleanTitle,
            video,
            addEstimation: false,
            bigImage: true,
            progressBar: true,
        })
    };

    return out;
};