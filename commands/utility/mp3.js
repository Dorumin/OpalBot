const request = require('request'),
ytdl = require('ytdl-core'),
installer = require('@ffmpeg-installer/ffmpeg'),
config = require('../../src/config.js'),
ffmpeg = require('fluent-ffmpeg'),
sanitize = require('sanitize-filename'),
fs = require('fs'),
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
req.post = (obj) => req(obj, true);
ffmpeg.setFfmpegPath(installer.path);

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.dl = 'mp3';
    out.peasants.download = 'mp3';
    out.peasants.mp3 = async (message, content, lang) => {
        // SoundCloud
        let sc = content.match(/https?:\/{2}soundcloud\.com\/[_\-\w\d]+\/[_\-\w\d]+/),
        masked = !content.includes('http') || /<https?:\/\//i.test(content);
        if (sc) {
            let token
            try {
                let { body } = await req('http://soundcloudmp3.org/');
                token = body.match(/name="_token" type="hidden" value="([\d\w]+)"/)[1];
            } catch(e) {
                message.channel.send(i18n.msg('sc-server-error-token', 'mp3', lang)).catch(OpalBot.util.log);
                return;
            }
            let { res, body } = await req.post({
                url: 'http://soundcloudmp3.org/converter',
                form: {
                    _token: token,
                    url: sc[0],
                    submit: ''
                }
            }),
            dl = body.match(/href="([^"]+)" id="download-btn"/),
            title = body.match(/<b>Title:<\/b>([^<]+)/),
            duration = body.match(/<b>Length:<\/b>([\d:]+)/),
            img = body.match(/src="([^"]+)" alt="preview image"/);
            if (!dl) {
                message.channel.send(i18n.msg('sc-server-error-download', 'mp3', lang)).catch(OpalBot.util.log);
                return;
            }
            if (!title) {
                message.channel.send(i18n.msg('sc-server-error-title', 'mp3', lang)).catch(OpalBot.util.log);
                return;
            }
            
            try {
                res = (await req({
                    uri: dl[1],
                    method: 'HEAD',
                    followAllRedirects: true
                })).res;
            } catch(e) {
                return;
            }
    
            let size = res.headers['content-length'],
            readable_size = parseFloat((size / 1024 / 1024).toFixed(2)) + 'mb',
            fields = [];
            if (size) {
                fields.push({
                    name: i18n.msg('size', 'mp3', lang),
                    value: readable_size
                });
            }
            if (duration) {
                fields.push({
                    name: i18n.msg('duration', 'mp3', lang),
                    value: duration[1].replace(/0(\d):/, '$1:')
                });
            }
    
            message.channel.send({
                embed: {
                    title: i18n.msg('download', 'mp3', lang),
                    description: title[1],
                    url: dl[1],
                    color: OpalBot.color,
                    image: img && masked ? {
                        url: img[1].replace('large', 't500x500')
                    } : null,
                    fields: fields
                }
            }).catch(OpalBot.util.log);
            return;
        }

        if (!config.SERVICE_URL) {
            console.log('Please set the SERVICE_URL configuration variable or server-dependant functions will not run. mp3 aborted.');
            return;
        }
    
        // YouTube
        let id = content.match(/[-_A-Za-z0-9]{11,}/g);
        if (!id) {
            message.reply(i18n.msg('invalid', 'mp3', lang)).catch(OpalBot.util.log);
            return;
        }
        id = id[id.length - 1];
        
        OpalBot.storage.mp3 = OpalBot.storage.mp3 || {};
        let info = await ytdl.getInfo(id),
        filename = id + '.mp3',
        title = content.match(new RegExp(i18n.msg('title-regex', 'mp3', lang), 'i')) || '',
        start = OpalBot.util.readDuration(content.match(new RegExp(i18n.msg('start-regex', 'mp3', lang), 'i'))),
        end = OpalBot.util.readDuration(content.match(new RegExp(i18n.msg('end-regex', 'mp3', lang), 'i')));
        // if (info.length_seconds > 5400) {
        //     message.reply(i18n.msg('too-long', 'mp3', lang));
        //     return;
        // }
        if (title) {
            title = title[1] || title[2];
        }
        OpalBot.storage.mp3[id] = (sanitize(title) || sanitize(info.title) || id).replace(/,/g, '') + '.mp3';
        let converting = await message.channel.send(i18n.msg('converting', 'mp3', lang));
        message.channel.startTyping();
        ffmpeg({
            source: ytdl(id, {
                quality: 'lowest' // Doesn't affect audio quality (or, at least, audio filesize)
            })
        })
        .noVideo()
        .setStartTime(start)
        .setDuration((end || info.length_seconds) - start)
        .format('mp3')
        .on('end', async () => {
            let stats = fs.statSync(filename),
            duration = OpalBot.util.formatDuration((end || info.length_seconds) - start);
            converting.delete().catch(OpalBot.util.log);
            message.channel.stopTyping();
            try { // See if the maxresdefault thumbnail is available.
                let { res } = await req({
                    url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                    method: 'HEAD',
                    followAllRedirects: true
                });
                if (res.statusCode == '404') throw new Error();
                info.thumbnail_url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
            } catch(e) {
                info.thumbnail_url = `https://img.youtube.com/vi/${id}/0.jpg`;
            }
            message.channel.send({
                embed: {
                    title: i18n.msg('download', 'mp3', lang),
                    description: info.title,
                    url: config.SERVICE_URL + '/dl/' + encodeURIComponent(id),
                    color: OpalBot.color,
                    image: masked ? {
                        url: info.thumbnail_url
                    } : null,
                    fields: [{
                        name: i18n.msg('size', 'mp3', lang),
                        value: OpalBot.util.formatBytes(stats.size)
                    }, {
                        name: i18n.msg('duration', 'mp3', lang),
                        value: duration
                    }]
                }
            }).catch(OpalBot.util.log);
        })
        .on('error', () => {
            converting.delete().catch(OpalBot.util.log);
            message.channel.stopTyping();
            message.channel.send(i18n.msg('failure', 'mp3', lang)).catch(OpalBot.util.log);
        })
        .pipe(fs.createWriteStream(filename));
    };

    return out;
};