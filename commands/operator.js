const request = require('request');

module.exports.operator = {};

module.exports.operator.run = 'eval';
module.exports.operator.eval = (message, content, lang, i18n, OpalBot) => {
    var send = msg => message.channel.send(msg);
    try {
        eval(`(async () => {
            try {
                ${content}
            } catch(e) {
                send('ERROR: ' + e);
            }
        })();`);
    } catch(e) {
        message.channel.send(e).catch(OpalBot.util.log);
    }
};

module.exports.operator.destroy = (a, b, c, d, OpalBot) => {
    OpalBot.client.destroy().then(() => {
        OpalBot.server.close();
    });
};

module.exports.operator.say = (message, content, lang, i18n, OpalBot) => {
    try {
        var r = eval(content);
        if (r == null || !r.toString().trim()) throw r;
        message.channel.send(r.toString().trim()).catch(OpalBot.util.log);
    } catch(e) {
        message.channel.send(content).catch(OpalBot.util.log);
    }
};

module.exports.operator.gist = (message, content, lang, i18n, OpalBot) => {
    var split = content.split('/');
    if (split.length == 1) {
        split.unshift('Dorumin'); // my GitHub follow ples
    } else if (split.length == 3) {
        split.pop(); // no need for /raw
    }
    request(`https://gist.github.com/${split.join('/')}/raw`, (err, r, body) => {
        if (err) return;
        message.channel.send('Package loaded').catch(OpalBot.util.log);
        try {
            eval(body);
        } catch(e) {
            message.channel.send(e.toString()).catch(OpalBot.util.log);
        }
    });
};

module.exports.operator.script = (message, content, lang, i18n, OpalBot) => {
    request(content, (err, r, body) => {
        if (err) return;
        message.channel.send('Package loaded').catch(OpalBot.util.log);
        try {
            eval(body);
        } catch(e) {
            message.channel.send(e.toString()).catch(OpalBot.util.log);
        }
    });
};

module.exports.operator.game = 'setgame';
module.exports.operator.setgame = (message, content, lang, i18n, OpalBot) => {
    var match = content.match(/(?:https?:\/\/)?twitch.tv\/(\w+)/),
    twitch = null;
    if (match) {
        content = content.slice(0, match.index) + content.slice(match.index + match[0].length);
        twitch = 'http://twitch.tv/' + match[1];
    }
    OpalBot.client.user.setGame(content, twitch);
};