const request = require('request'),
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

module.exports.peasants = {};

module.exports.peasants.hi = 'hello';
module.exports.peasants.hey = 'hello';
module.exports.peasants.hello = (message) => {
    switch (message.author.username + '#' + message.author.discriminator) {
        case 'Dorumin#0969':
            message.reply('hello useless pile of goop!');
        break;
        case 'Oasis#4730':
            message.reply('hello, loser!');
            break;
        default:
            message.reply('hello!');
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
    });
};

module.exports.peasants.lenny = 'me';
module.exports.peasants.me = message => {
    message.channel.send('( ͡° ͜ʖ ͡°)');
};

module.exports.peasants.pong = 'ping';
module.exports.peasants.ping = (message, content, lang, i18n) => {
    var ping = message.content.indexOf('ping') + 1 || 1000,
    pong = message.content.indexOf('pong') + 1 || 1001,
    d1 = Date.now();
    message.reply(ping < pong ? i18n.msg('pong', 'ping', lang) : i18n.msg('ping', 'ping', lang)).then(msg => {
        var latency = Date.now() - d1;
        if (!msg.editable) {
            message.channel.send(i18n.msg('result', 'ping', latency, lang));
            return;
        }
        msg.edit(msg.content + '\n' + i18n.msg('result', 'ping', latency, lang));
    });
};

module.exports.peasants.runtime = (message, content, lang, i18n, OpalBot) => {
    var f = Math.floor,
    s = f(OpalBot.uptime / 1000),
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
    message.channel.send(str);
};

module.exports.peasants.status = 'test';
module.exports.peasants.test = (message, content, lang, i18n) => {
    message.reply(i18n.msg('online', 'test', lang));
};

module.exports.peasants.coinflip = 'flip';
module.exports.peasants.flip = (message, content, lang, i18n) => {
    var result = Math.round(Math.random()) == 1;
    message.channel.send(i18n.msg(result ? 'heads' : 'tails', 'flip', `<@${message.author.id}>`, lang));
};

module.exports.peasants.choose = 'pick';
module.exports.peasants.pick = (message, content, lang, i18n) => {
    if (!content) {
        message.reply(i18n.msg('missing', 'pick', lang));
        return;
    }
    var split = content.split(i18n.msg('delimiter', 'pick', lang));
    if (split.length == 1) {
        message.reply(i18n.msg('one', 'pick', lang));
    } else {
        var randum = split[Math.floor(Math.random() * split.length)].replace(/(\\\*)|\*/g, (s, c) => c ? s : '\\*');
        message.reply(i18n.msg('result', 'pick', randum, lang));
    }
};

module.exports.peasants.yt = 'youtube';
module.exports.peasants.youtube = async (message, content, lang, i18n, OpalBot) => {
    if (!content) {
        message.channel.send(i18n.msg('usage', 'youtube', lang));
        return;
    }

    try {
        var {res, body} = await req({
            url: 'https://www.googleapis.com/youtube/v3/search',
            qs: {
                part: 'snippet',
                q: content,
                key: process.env.youtube_token
            }
        });
    } catch(e) { return; }

    function result(video) {
        message.channel.send({
            embed: {
                title: i18n.msg('result', 'youtube', lang),
                description: video.snippet.title,
                url: `https://youtu.be/${video.id.videoId}`,
                color: OpalBot.color,
                image: {
                    url: `https://img.youtube.com/vi/${video.id.videoId}/maxresdefault.jpg`
                },
                footer: {
                    text: video.snippet.channelTitle
                }
            }
        });
    }
    var r = JSON.parse(body).items,
    titles = r.map(obj => obj.snippet.title);
    if (!r.length) {
        message.channel.send(i18n.msg('no-results', 'youtube', lang));
        return;
    }
    var bot_message = null,
    blocked = OpalBot.unprefixed.push({
        type: 'youtube',
        triggers: new Array(r.length).fill(undefined).map((n, i) => String(i + 1)),
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
            message.channel.send(i18n.msg('timed-out', 'youtube', lang));
        }
    });
    if (blocked === true) {
        result(r[0]);
    } else {
        var list = '';
        for (var i in titles) {
            list += `\n[${Number(i) + 1}] - ${titles[i]}`
        }
        bot_message = await message.channel.send('```' + list.slice(1) + '```');
    }
};

module.exports.peasants.download = 'mp3';
module.exports.peasants.mp3 = async (message, content, lang, i18n, OpalBot) => {
    // SoundCloud
    var sc = content.match(/https?:\/{2}soundcloud\.com\/[_\-\w\d]+\/[_\-\w\d]+/),
    masked = /<https?:\/\//i.test(content);
    if (sc) {
        try {
            var { res, body } = await req('http://soundcloudmp3.org/');
        } catch(e) {
            return;
        }
        try {
            var token = main_content.match(/name="_token" type="hidden" value="([\d\w]+)"/)[1];
        } catch(e) {
            message.channel.send(i18n.msg('sc-server-error-token', 'mp3', lang));
            return;
        }
        try {
            var { res, body } = await req({
                url: 'http://soundcloudmp3.org/converter',
                form: {
                    _token: token,
                    url: sc[0]
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
            message.channel.send(i18n.msg('sc-server-error-download', 'mp3', lang));
            return;
        }
        if (!title) {
            message.channel.send(i18n.msg('sc-server-error-title', 'mp3', lang));
            return;
        }
        
        try {
            var { res, body } = await req({
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

        console.log(fields);
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
        });
        return;
    }

    // YouTube
    var id = content.match(/[-_A-Za-z0-9]{11,}/g);
    if (!id) {
        message.reply(i18n.msg('invalid', 'mp3', lang));
    }
    id = id[id.length - 1];
    var tries = 5;
    while (tries--) {
        try {
            var { body } = await req({
                uri: 'http://api.convert2mp3.cc/check.php',
                qs: {
                    api: true,
                    v: id,
                    h: Date.now()
                }
            });
            console.log(body);
            var s = body.split('|');
            if (s[0] == 'ERROR') {
                if (s[1] != 'PENDING') throw new Error(); // Screw it, the server isn't giving us the link anytime soon
                await new Promise((resolve) => {
                    setTimeout(() => resolve(), 1500);
                });
            }
        } catch(e) { break; }
    }
    if (typeof body != 'undefined' && body.slice(0, -2) == 'OK') {
        var [server, key, title] = body.split('|').slice(1),
        url = `http://dl${server}.downloader.space/dl.php?id=${key}`;

        // Get file size
        try {
            var { res } = await req({
                uri: url,
                method: 'HEAD',
                followAllRedirects: true
            });
            if (!res || !res.headers || !res.headers['content-length']) throw new Error();
        } catch(e) {
            message.channel.send(i18n.msg('size-404', 'mp3', lang));
            return;
        }
        var size = res.headers['content-length'],
        readable_size = parseFloat((size / 1024 / 1024).toFixed(2)) + 'mb',
        fields = [{
            name: i18n.msg('size', 'mp3', lang),
            value: readable_size
        }];
        
        // Get video duration with the YT API
        try {
            var { body } = await req({
                uri: 'https://www.googleapis.com/youtube/v3/videos',
                qs: {
                    id: id,
                    part: 'contentDetails',
                    key: process.env.youtube_token
                }
            });
        } catch(e) { body = undefined; }

        // Parse the STUPID ISO 8601 timestamp YT uses
        if (typeof body != 'undefined') {
            var items = JSON.parse(body).items;
            if (items && items.length) {
                var iso_duration = items[0].contentDetails.duration,
                split = iso_duration.split(/\D+/).filter(Boolean),
                duration = '';
                if (split.length > 3) {
                    if (split.length == 4) {
                        split[1] = Number(split[1]) + Number(split[0]) * 24;
                        split = split.slice(1);
                        duration = split.join(':');
                    } else if (split.length == 5) {
                        split[2] = Number(split[2]) + Number(split[1]) * 24;
                        split[2] = split[2] + Number(split[0]) * 24 * 7;
                        split = split.slice(2);
                        duration = split.join(':');
                    }
                } else {
                    duration = split.join(':');
                }
                fields.push({
                    name: i18n.msg('duration', 'mp3', lang),
                    value: duration
                });
            }
        }

        try { // See if the maxresdefault thumbnail is available.
            var { res } = await req({
                url: image,
                method: 'HEAD',
                followAllRedirects: true
            });
            if (res.statusCode == '404') throw new Error();
        } catch(e) {
            image = `https://img.youtube.com/vi/${id}/0.jpg`;
        }
        console.log(fields);
        message.channel.send({
            embed: {
                title: i18n.msg('download', 'mp3', lang),
                description: title,
                url: url,
                color: OpalBot.color,
                image: masked ? {
                    url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                } : null,
                fields: fields
            }
        });
    } else { // Main server is down, find a better one.
        var url = `http://www.youtubeinmp3.com/fetch/?video=https://www.youtube.com/watch?v=${id}`;
        try {
            var { res } = await req({
                uri: url,
                method: 'HEAD',
                followAllRedirects: true
            });
        } catch(e) {}
        if (typeof res != 'undefined' || obj.statusCode != '404') {
            var size = res.headers['content-length'],
            readable_size = parseFloat((size / 1024 / 1024).toFixed(2)) + 'mb',
            title = res.headers['content-disposition'].split('filename="')[1] || 'INVALID.',
            image = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            fields = [{
                name: i18n.msg('size', 'mp3', lang),
                value: readable_size
            }];
            try {
                var { body } = await req({
                    url: 'https://www.googleapis.com/youtube/v3/videos',
                    qs: {
                        id: id,
                        part: 'contentDetail',
                        key: process.env.youtube_token
                    }
                })
            } catch(e) {}
            if (typeof body != 'undefined') {
                var items = JSON.parse(body).items;
                if (items && items.length) {
                    var iso_duration = items[0].contentDetails.duration,
                    split = iso_duration.split(/\D+/).filter(Boolean),
                    duration = '';
                    if (split.length > 3) {
                        if (split.length == 4) {
                            split[1] = Number(split[1]) + Number(split[0]) * 24;
                            split = split.slice(1);
                            duration = split.join(':');
                        } else if (split.length == 5) {
                            split[2] = Number(split[2]) + Number(split[1]) * 24;
                            split[2] = split[2] + Number(split[0]) * 24 * 7;
                            split = split.slice(2);
                            duration = split.join(':');
                        }
                    } else {
                        duration = split.join(':');
                    }
                    fields.push({
                        name: i18n.msg('duration', 'mp3', lang),
                        value: duration
                    });
                }
            }
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
            console.log(fields);
            message.channel.send({
                embed: {
                    title: i18n.msg('download', 'mp3', lang),
                    description: title,
                    url: url,
                    color: OpalBot.color,
                    image: masked ? {
                        url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                    } : null,
                    fields: fields
                }
            });
        } else {
            message.channel.send(i18n.msg('servers-down', 'mp3', lang));
        }
    }
};

module.exports.peasants.prefixes = 'prefix'
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
                message.reply(i18n.msg('no-prefixes', 'prefix', lang));
                return;
            }
            message.reply(i18n.msg('list-prefixes', 'prefix', '`' + prefixes.join('` `') + '`', lang));
            break;
        case add:
            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                message.reply(i18n.msg('missing-permissions', 'prefix', lang));
                return;
            }
            if (!content.length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix', lang));
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
            if (i != -1) {
                message.reply(i18n.msg('prefix-already-in-use', 'prefix', lang));
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
            message.reply(i18n.msg('prefix-added', 'prefix', content, lang));
            break;
        case remove:
            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                message.reply(i18n.msg('missing-permissions', 'prefix', lang));
                return;
            }
            if (!content.length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix', lang));
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
                message.reply(i18n.msg('no-prefix-found', 'prefix', lang));
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
            message.reply(i18n.msg('prefix-removed', 'prefix', content, lang));
            break;
    }
};