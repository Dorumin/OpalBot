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
module.exports.peasants.avatar = (message, content, lang, i18n) => {
    var user = message.mentions.users.first() || message.author;
    message.channel.send({
        embed: {
            color: 0x2196f3,
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
    s = f(client.uptime / 1000),
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