const request = require('request'),
ytdl = require('ytdl-core'),
installer = require('@ffmpeg-installer/ffmpeg'),
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

module.exports.peasants = {};

module.exports.peasants.hi = 'hello';
module.exports.peasants.hey = 'hello';
module.exports.peasants.hello = (message, content, lang, i18n, OpalBot) => {
    switch (message.author.username + '#' + message.author.discriminator) {
        case 'Dorumin#0969':
            message.reply('hello useless pile of goop!').catch(OpalBot.util.log);
        break;
        case 'Oasis#4730':
            message.reply('hello, loser!').catch(OpalBot.util.log);
            break;
        default:
            message.reply('hello!').catch(OpalBot.util.log);
    }
};

module.exports.peasants.a = 'avatar';
module.exports.peasants.avi = 'avatar';
module.exports.peasants.avatar = (message, content, lang, i18n, OpalBot) => {
    var user = message.mentions.users.first() || message.author;
    message.channel.send({
        embed: {
            color: OpalBot.color,
            title: i18n.msg('title', 'avatar', lang),
            image: {
                url: user.displayAvatarURL
            },
            description: i18n.msg('description', 'avatar', user.username, lang).replace(user.username.slice(0, -1) + "s's", user.username + "'")
        }
    }).catch(OpalBot.util.log);
};

module.exports.peasants.inspirational = 'inspiration';
module.exports.peasants.quote = 'inspiration';
module.exports.peasants.inspiration = (message, content, lang, i18n, OpalBot) => {
    request('http://inspirobot.me/api?generate=true', (err, r, body) => {
        message.channel.send({
            embed: {
                color: OpalBot.color,
                image: {
                    url: body
                }
            }
        });
    });
};

module.exports.peasants.lenny = 'me';
module.exports.peasants.me = (message, content, lang, i18n, OpalBot) => {
    message.channel.send('( ͡° ͜ʖ ͡°)').catch(OpalBot.util.log);
};

module.exports.peasants.pong = 'ping';
module.exports.peasants.ping = (message, content, lang, i18n, OpalBot) => {
    var ping = message.content.indexOf('ping') + 1 || 1000,
    pong = message.content.indexOf('pong') + 1 || 1001,
    d1 = Date.now(); // Don't tell me to use message.createdTimestamp. That can return negative values.
    message.reply(ping < pong ? i18n.msg('pong', 'ping', lang) : i18n.msg('ping', 'ping', lang)).then(msg => {
        var latency = Date.now() - d1;
        if (!msg.editable) {
            message.channel.send(i18n.msg('result', 'ping', latency, lang)).catch(OpalBot.util.log);
            return;
        }
        msg.edit(msg.content + '\n' + i18n.msg('result', 'ping', latency, lang)).catch(OpalBot.util.log);
    }).catch(OpalBot.util.log);
};

module.exports.peasants.runtime = (message, content, lang, i18n, OpalBot) => {
    var t = Date.now() - OpalBot.storage.last_downtime || OpalBot.uptime,
    f = Math.floor,
    s = f(t / 1000),
    m = f(s / 60),
    h = f(m / 60),
    d = f(h / 24),
    o = {
        s: s % 60,
        m: m % 60,
        h: h % 24,
        d: d
    },
    a = Object.keys(o).filter(n => o[n]).reverse(),
    k = a.join('-'),
    p = [
        OpalBot.v,
        ...a.map(n => o[n])
    ],
    str = i18n.msg(k, 'runtime', ...p, lang);
    message.channel.send(str).catch(OpalBot.util.log);
};

module.exports.peasants.status = 'test';
module.exports.peasants.test = (message, content, lang, i18n, OpalBot) => {
    message.reply(i18n.msg('online', 'test', lang)).catch(OpalBot.util.log);
};

module.exports.peasants.coinflip = 'flip';
module.exports.peasants.flip = (message, content, lang, i18n, OpalBot) => {
    var result = Math.round(Math.random()) == 1;
    message.channel.send(i18n.msg(result ? 'heads' : 'tails', 'flip', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
};

module.exports.peasants.choose = 'pick';
module.exports.peasants.pick = (message, content, lang, i18n, OpalBot) => {
    if (!content) {
        message.reply(i18n.msg('missing', 'pick', lang)).catch(OpalBot.util.log);
        return;
    }
    var reg = new RegExp('\\' + i18n.msg('delimiters', 'pick', lang).split(' ').join('|\\')),
    split = content.split(reg).filter(Boolean);
    if (!split.length) {
        message.reply(i18n.msg('missing', 'pick', lang)).catch(OpalBot.util.log);
    } else if (split.length == 1) {
        message.reply(i18n.msg('one', 'pick', lang)).catch(OpalBot.util.log);
    } else {
        var randum = split[Math.floor(Math.random() * split.length)].trim().replace(/(\\\*)|\*/g, (s, c) => c ? s : '\\*');
        message.reply(i18n.msg('result', 'pick', randum, lang)).catch(OpalBot.util.log);
    }
};

module.exports.peasants.d = 'dice';
module.exports.peasants.dice = (message, content, lang, i18n, OpalBot) => {
    if (!content || isNaN(content.charAt(0))) {
        content = '6';
    }
    var params = content.match(/\d+/g);
    if (params.length == 1) {
        params.unshift(1);
    }
    var [
        dice,
        sides
    ] = params;
    if (sides == 0 || dice == 0) {
        message.reply(i18n.msg('non-zero', 'dice', lang)).catch(OpalBot.util.log);
    } else if (dice == 1) {
        var result = Math.ceil(Math.random() * sides);
        message.channel.send(i18n.msg('result', 'dice', `<@${message.author.id}>`, result, lang)).catch(OpalBot.util.log);
    } else {
        var results = [],
        sum = 0;
        while (dice--) {
            var r = Math.ceil(Math.random() * sides);
            results.push(r);
            sum += r;
        }
        var msg = i18n.msg('results', 'dice', lang) + '```js\n' + results.join(', ') + '```' + i18n.msg('sum', 'dice', sum, lang);
        message.reply(msg).catch(() => {
            message.reply(i18n.msg('too-long', 'dice', lang)).catch(OpalBot.util.log);
        });
    }
};

module.exports.peasants.s = 'seen';
module.exports.peasants.seen = async (message, content, lang, i18n, OpalBot) => {
    var user = message.mentions.users.first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'seen', lang)).catch(OpalBot.util.log);
    }
    var data = (await OpalBot.db).seen || {};
    if (['online', 'dnd'].includes(user.presence.status)) {
        message.channel.send(i18n.msg('online', 'seen', user.username, lang)).catch(OpalBot.util.log);
        return;
    }
    if (!data[user.id]) {
        message.channel.send(i18n.msg('no-data', 'seen', user.username + '#' + user.discriminator, lang)).catch(OpalBot.util.log);
        return;
    }
    
    var t = Date.now() - data[user.id],
    f = Math.floor,
    s = f(t / 1000),
    m = f(s / 60),
    h = f(m / 60),
    d = f(h / 24),
    o = {
        s: s % 60,
        m: m % 60,
        h: h % 24,
        d: d
    },
    a = Object.keys(o).filter(n => o[n]).reverse(),
    k = a.join('-'),
    str = i18n.msg(k, 'seen', message.author, user.username, ...a.map(n => o[n]), lang);
    message.channel.send(str).catch(OpalBot.util.log);
}

module.exports.peasants.yt = 'youtube';
module.exports.peasants.youtube = async (message, content, lang, i18n, OpalBot) => {
    if (!content) {
        message.channel.send(i18n.msg('usage', 'youtube', lang)).catch(OpalBot.util.log);
        return;
    }

    var downloading = false,
    flags = i18n.msg('download-flags', 'youtube', lang).split('|')
    i = flags.length;
    while (i--) {
        if (
            downloading = content.startsWith('--' + flags[i])
        ) {
            content = content.slice(flags[i].length + 2);
            break;
        }
    }

    try {
        var {res, body} = await req({
            url: 'https://www.googleapis.com/youtube/v3/search',
            qs: {
                part: 'snippet',
                q: content,
                key: process.env.youtube_token,
                type: 'video'
            }
        });
    } catch(e) { return; }

    async function result(video) {
        if (downloading) {
            module.exports.peasants.mp3(message, video.id.videoId, lang, i18n, OpalBot);
            return;
        }
        var id = video.id.videoId,
        image = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        try {
            var { res } = await req({
                url: image,
                method: 'HEAD',
                followAllRedirects: true
            });
            if (res.statusCode == '404') throw new Error();
        } catch(e) {
            image = `https://img.youtube.com/vi/${id}/0.jpg`;
        }
        message.channel.send({
            embed: {
                title: video.snippet.title,
                url: `https://youtu.be/${video.id.videoId}`,
                description: video.snippet.description,
                color: OpalBot.color,
                image: {
                    url: image
                },
                author: {
                    name: video.snippet.channelTitle,
                    url: 'https://youtube.com/channel/' + video.snippet.channelId
                }
            }
        }).catch(OpalBot.util.log);
    }
    var r = JSON.parse(body).items,
    titles = r.map(obj => obj.snippet.title);
    if (!r.length) {
        message.channel.send(i18n.msg('no-results', 'youtube', lang)).catch(OpalBot.util.log);
        return;
    }
    var bot_message = null,
    blocked = OpalBot.unprefixed.push({
        type: 'youtube',
        triggers: Array(r.length).fill(undefined).map((n, i) => String(i + 1)),
        callback: (msg, index) => {
            result(r[index]);
            if (msg.deletable) {
                msg.delete();
            }
            if (bot_message && bot_message.deletable) {
                bot_message.delete();
            }
        },
        user: message.author.id,
        channel: message.channel.id,
        timeout: 20000,
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'youtube', lang)).catch(OpalBot.util.log);
        }
    });
    if (blocked === true) {
        result(r[0]);
    } else {
        var list = '';
        for (var i in titles) {
            list += `\n[${Number(i) + 1}] - ${titles[i]}`
        }
        bot_message = await message.channel.send('```' + list.slice(1) + '```').catch(OpalBot.util.log);
    }
};

module.exports.peasants.dl = 'mp3';
module.exports.peasants.download = 'mp3';
module.exports.peasants.mp3 = async (message, content, lang, i18n, OpalBot) => {
    // SoundCloud
    var sc = content.match(/https?:\/{2}soundcloud\.com\/[_\-\w\d]+\/[_\-\w\d]+/),
    masked = !content.includes('http') || /<https?:\/\//i.test(content);
    if (sc) {
        try {
            var { res, body } = await req('http://soundcloudmp3.org/');
        } catch(e) {
            return;
        }
        try {
            var token = body.match(/name="_token" type="hidden" value="([\d\w]+)"/)[1];
        } catch(e) {
            message.channel.send(i18n.msg('sc-server-error-token', 'mp3', lang)).catch(OpalBot.util.log);
            return;
        }
        try {
            var { res, body } = await req.post({
                url: 'http://soundcloudmp3.org/converter',
                form: {
                    _token: token,
                    url: sc[0],
                    submit: ''
                }
            });
        } catch(e) {
            return;
        }
        var dl = body.match(/href="([^"]+)" id="download-btn"/),
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
            var { res } = await req({
                uri: dl[1],
                method: 'HEAD',
                followAllRedirects: true
            });
        } catch(e) {
            return;
        }

        var size = res.headers['content-length'],
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

    // YouTube
    var id = content.match(/[-_A-Za-z0-9]{11,}/g);
    if (!id) {
        message.reply(i18n.msg('invalid', 'mp3', lang)).catch(OpalBot.util.log);
        return;
    }
    id = id[id.length - 1];
    
    var info = await ytdl.getInfo(id),
    filename = sanitize(info.title) + '.mp3',
    duration = ((s) => {
        var f = n => ('0' + Math.floor(n)).slice(-2);
        return [
            f(s / 3600),
            f(s / 60 % 60),
            f(s % 60)
        ].join(':').replace(/^(00:)+/g, '').replace(/^0+/, '');
    })(info.length_seconds);
    if (info.length_seconds > 5400) {
        message.reply(i18n.msg('too-long', 'mp3', lang));
        return;
    }
    var converting = await message.channel.send(i18n.msg('converting', 'mp3', lang));
    message.channel.startTyping();
    ffmpeg({
        source: ytdl(id, {
            quality: 'lowest' // Doesn't affect audio quality (or, at least, audio filesize)
        })
    })
    .noVideo()
    .format('mp3')
    .on('end', async () => {
        var stats = fs.statSync(filename);
        console.log(OpalBot.util.formatBytes(stats.size));
        converting.delete().catch(OpalBot.util.log);
        message.channel.stopTyping();
        try { // See if the maxresdefault thumbnail is available.
            var { res } = await req({
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
                url: 'http://opalbot.herokuapp.com/dl/' + encodeURIComponent(filename),
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
    .pipe(fs.createWriteStream(filename), {
        end: true
    });
};

module.exports.peasants.prefixes = 'prefix';
module.exports.peasants.prefix = async (message, content, lang, i18n, OpalBot) => {
    var list = i18n.msg('list', 'prefix', lang),
    add = i18n.msg('add', 'prefix', lang),
    remove = i18n.msg('remove', 'prefix', lang),
    mode = list,
    prefixes = OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default;
    if (content.slice(0, add.length) == add) mode = add;
    if (content.slice(0, remove.length) == remove) mode = remove;
    content = content.slice(mode.length).trim();
    switch (mode) {
        case list:
            if (!prefixes.length) {
                message.reply(i18n.msg('no-prefixes', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            message.reply(i18n.msg('list-prefixes', 'prefix', '`' + prefixes.join('` `') + '`', lang)).catch(OpalBot.util.log);
            break;
        case add:
            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                message.reply(i18n.msg('missing-permissions', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            if (!content.length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            if (!OpalBot.prefixes[message.guild.id]) {
                OpalBot.db = {
                    name: 'data',
                    value: {
                        ...(await OpalBot.db).data,
                        prefixes: {
                            ...(await OpalBot.db).data.prefixes,
                            [message.guild.id]: prefixes
                        }
                    }
                };
                OpalBot.prefixes[message.guild.id] = [...prefixes];
            }
            var arr = OpalBot.prefixes[message.guild.id],
            i = arr.indexOf(content);
            if (i != -1) {
                message.reply(i18n.msg('prefix-already-in-use', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            arr.push(content);
            OpalBot.db = {
                name: 'data',
                value: {
                    ...(await OpalBot.db).data,
                    prefixes: {
                        ...(await OpalBot.db).data.prefixes,
                        [message.guild.id]: arr
                    }
                }
            }
            message.reply(i18n.msg('prefix-added', 'prefix', content, lang)).catch(OpalBot.util.log);
            break;
        case remove:
            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                message.reply(i18n.msg('missing-permissions', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            if (!content.length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            if (!OpalBot.prefixes[message.guild.id]) {
                OpalBot.db = {
                    name: 'data',
                    value: {
                        ...(await OpalBot.db).data,
                        prefixes: {
                            ...(await OpalBot.db).data.prefixes,
                            [message.guild.id]: prefixes
                        }
                    }
                }
                OpalBot.prefixes[message.guild.id] = [...prefixes];
            }
            var arr = OpalBot.prefixes[message.guild.id],
            i = arr.indexOf(content);
            if (i == -1) {
                message.reply(i18n.msg('no-prefix-found', 'prefix', lang)).catch(OpalBot.util.log);
                return;
            }
            arr.splice(i, 1);
                OpalBot.db = {
                name: 'data',
                value: {
                    ...(await OpalBot.db).data,
                    prefixes: {
                        ...(await OpalBot.db).data.prefixes,
                        [message.guild.id]: arr
                    }
                }
            }
            message.reply(i18n.msg('prefix-removed', 'prefix', content, lang)).catch(OpalBot.util.log);
            break;
    }
};