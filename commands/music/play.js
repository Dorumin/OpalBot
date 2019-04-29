const request = require('request'),
ytdl = require('ytdl-core'),
config = require('../../src/config.js'),
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
    const voices = guild.channels.filter(chan => chan.type == 'voice'),
    music = voices.find(chan => chan.name.includes('music'));
    return music;
}

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.play = async (message, content, lang) => {
        const linkRegex = /https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9-_]{11})/g,
        match = content.match(linkRegex),
        storage = OpalBot.storage.music = OpalBot.storage.music || {};
        let channel = message.member.voiceChannel,
        id = match ? match[1] : content.length == 11 ? content : '',
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
                message.channel.send(i18n.msg('same-channel', 'play', lang));
                return;
            }
        } else if (!channel) {
            channel = find_music_channel(message.guild);
            if (!channel) {
                message.channel.send(i18n.msg('no-channel', 'play', lang));
                return;
            }
        }

        if (!channel.connection) {
            try {
                await channel.join();
            } catch(e) {
                console.log(e);
                message.channel.send(i18n.msg('cant-connect', 'play', lang));
                return;
            }
        }

        if (!id) {
            try {
                video = await pick_song(message, content);
                id = video.id.videoId;
            } catch(e) {
                message.channel.send(i18n.msg(e, 'play', lang));
                return;
            }
        } else {
            video = await pick_song(message, id);
        }

        console.log(video, id);

        channel.connection.playStream(ytdl(id, {
            audioonly: true
        }));

        message.channel.send(`Playing https://youtu.be/${id}`);
    };

    return out;
};