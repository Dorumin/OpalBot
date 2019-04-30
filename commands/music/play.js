const request = require('request'),
ytdl = require('ytdl-core'),
config = require('../../src/config.js'),
MusicController = require('./MusicController.js').MusicController,
req = (obj, POST) => {
    return new Promise((res, rej) => {
        (POST ? request.post : request)(obj, (e, r, body) => {
            if (e || r.statusCode == '404') {
                rej(e);
                return;
            }
            res({res: r, body: body});
        });
    });
};

function pick_song(message, query) {
    return new Promise(async (resolve, reject) => {
        let res,
        body;
        try {
            let re = await req({
                url: 'https://www.googleapis.com/youtube/v3/search',
                qs: {
                    part: 'snippet',
                    q: query,
                    key: config.YOUTUBE_TOKEN,
                    type: 'video'
                }
            });
            res = re.res;
            body = re.body;
        } catch(e) { return; }

        let r = JSON.parse(body).items;
        if (!r.length) {
            reject('no-results');
            message.channel.send(i18n.msg('no-results', 'play', lang)).catch(OpalBot.util.log);
            return;
        }
        resolve(r[0]);
    });
}

function find_music_channel(guild) {
}

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.p = 'play';
    out.peasants.play = async (message, content, lang) => {
        const storage = OpalBot.storage.music = OpalBot.storage.music || {},
        controller = storage[message.guild.id] = storage[message.guild.id] || new MusicController({
            lang,
            i18n: OpalBot.i18n
        });
        let channel = message.member.voiceChannel,
        video;

        if (!content.trim()) {
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

        if (!channel.connection) {
            try {
                await channel.join();
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

        controller.push(video);

        controller.sendEmbed(message.channel);
    };

    return out;
};