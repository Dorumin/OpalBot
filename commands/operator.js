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
        message.channel.send(e);
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
        message.channel.send(r.toString().trim());
    } catch(e) {
        message.channel.send(content);
    }
};

module.exports.operator.gist = (message, content) => {
    var split = content.split('/');
    if (split.length == 1) {
        split.unshift('Dorumin'); // my GitHub follow ples
    } else if (split.length == 3) {
        split.pop(); // no need for /raw
    }
    request(`https://gist.github.com/${split.join('/')}/raw`, (err, r, body) => {
        if (err) return;
        message.channel.send('Package loaded');
        try {
            eval(body);
        } catch(e) {
            message.channel.send(e.toString());
        }
    });
};

module.exports.operator.script = (message, content) => {
    request(content, (err, r, body) => {
        if (err) return;
        message.channel.send('Package loaded');
        try {
            eval(body);
        } catch(e) {
            message.channel.send(e.toString());
        }
    });
};