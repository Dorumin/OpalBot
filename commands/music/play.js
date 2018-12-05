const request = require('request'),
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

function sanitize(str) {
    const char_table = {
        ';': '⍮',
        '[': '⦋',
        ']': '⦌'
    },
    keys = Object.keys(char_table);
    return str.replace(new RegExp(keys.join('|\\'), 'g'), char => char_table[char]);
}

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
        let bot_message = null,
        blocked = OpalBot.unprefixed.push({
            type: 'youtube',
            triggers: Array(r.length).fill(undefined).map((n, i) => String(i + 1)),
            callback: (msg, index) => {
                resolve(r[index]);
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
                reject('timed-out');
            }
        });

        if (blocked === true) {
            resolve(r[0]);
        } else {
            let list = '';
            for (let i in r) {
                list += `\n[${Number(i) + 1}] - ${sanitize(r[i].snippet.title)}`
            }
            bot_message = await message.channel.send('```ini' + list + '```').catch(OpalBot.util.log);
        }
    });
}

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.play = async (message, content, lang) => {
        const channel = message.member.voiceChannel,
        linkRegex = /https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9-_]{11})/g,
        match = content.match(linkRegex);
        let id = match ? match[1] : '';

        if (!content.trim()) {
            message.channel.send(i18n.msg('no-content', 'play', lang));
            return;
        }

        if (!channel) {
            message.channel.send(i18n.msg('no-channel', 'play', lang));
            return;
        }

        if (!id) {
            try {
                id = await pick_song(message, content);
            } catch(e) {
                message.channel.send(i18n.msg(e, 'play', lang));
                return;
            }
        }

        message.channel.send('test');
    };

    return out;
};