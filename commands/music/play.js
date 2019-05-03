const MusicController = require('./MusicController.js').MusicController;

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.p = 'play';
    out.peasants.add = 'play';
    out.peasants.pause = 'play';
    out.peasants.play = async (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id] = storage[message.guild.id] || new MusicController({
            lang,
            i18n: OpalBot.i18n
        });
        let channel = message.member.voiceChannel,
        video;

        if (!content.trim()) {
            if (controller) {
                controller.playPause(message.author);
                controller.sendEmbed(message.channel);
                return;
            }
            message.channel.send(i18n.msg('no-content', 'play', lang));
            return;
        }

        if (message.guild.voiceConnection) {
            if (!channel) {
                message.channel.send(i18n.msg('join-channel', 'play', lang));
                return;
            }
            if (message.guild.voiceConnection.channel !== channel) {
                message.channel.send(i18n.msg('same-channel', 'play', message.guild.voiceConnection.channel.id, lang));
                return;
            }
        } else if (!channel) {
            channel = controller.findMusicChannel(message.guild);
            if (!channel) {
                message.channel.send(i18n.msg('no-channel', 'play', lang));
                return;
            } else {
                message.channel.send(i18n.msg('joined-channel', 'play', channel.id, lang));
            }
        }

        if (!controller.connection) {
            try {
                await controller.connect(channel);
            } catch(e) {
                console.log('error', e);
                message.channel.send(i18n.msg('cant-connect', 'play', lang));
                return;
            }
        }

        video = await controller.searchVideo(content, {
            wait: true, // TODO: Make it not wait if it's not gonna play asap?
            addedBy: message.author
        });

        if (!video) {
            message.channel.send(i18n.msg('no-results', 'play', lang));
            return;
        }

        const playing = controller.push(video);

        await controller.sendSongEmbed({
            channel: message.channel,
            video,
            user: message.author,
            title: i18n.msg('queued-title', 'play', video.cleanTitle, lang),
            playing,
        })

        if (playing) {
            controller.sendEmbed(message.channel);
        }
    };

    return out;
};