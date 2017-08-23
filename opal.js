const Discord = require('discord.js');
const Dropbox = require('dropbox');
const http = require('http');
const i18n = require(`./i18n/${process.env.lang || 'en'}.json`);
const client = new Discord.Client();
const database = new Dropbox({accessToken: process.env.dropbox_token});

i18n.msg = (message, obj, ...vars) => {
    var ref = obj;
    if (typeof obj == 'string') {
        obj = i18n[obj];
    }
    var msg = obj[message];
    if (!msg || typeof msg != 'string') {
        if (typeof ref == 'string') {
            throw new ReferenceError('(i18n) No key <${message}> in object <i18n.${ref}> found.');
        }
        throw new ReferenceError(`(i18n) No key <${message}> found.`);
    }
    if (!vars.length) return msg;
    return msg.replace(/\$(\d)/g, (s, n) => {
        return vars[n - 1] || s;
    });
};

client.on('ready', async () => {
    var storage = (await OpalBot.db).data;
    if (!storage) {
        OpalBot.db = {
            name: 'data',
            value: {
                prefixes: {
                    default: ['!', '>', '¬¬']
                }
            }
        };
    }
    OpalBot.prefixes = (await OpalBot.db).data.prefixes;
    console.log(i18n.msg('online', 'main', OpalBot.v));
    client.guilds
        .get('344422448403316748').channels
        .find(n => n.name == 'secret')
            .send(i18n.msg('online', 'main', OpalBot.v));
    var i = 0;
    setInterval(n => {
        client.guilds
            .find(n => n.id == 344422448403316748).channels
                .find(n => n.name == 'secret')
                    .send(`Bot has been up for ${++i} hours without idling or crashing!`);
    }, 3600000);
});

client.on('message', message => {
    if (message.author.id == client.user.id || !message.member) return;
    var content = message.content,
    name = message.author.username,
    prefixes = (OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default).concat([`<@${client.user.id}>`, i18n.msg('prefix', 'main', client.user.id)]),
    i = prefixes.length,
    permissions = message.member.permissions.serialize();
    for (var key in OpalBot.permissionAliases) {
        permissions[key] = permissions[OpalBot.permissionAliases[key]];
    }
    if (!content.trim()) return;
    console.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        message.reply('Add me on your server: <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot>');
        return;
    }
    if (message.channel.type != 'text') return;
    while (i--) {
        if (content.startsWith(prefixes[i])) {
            var split = content.slice(prefixes[i].length).split(' ').filter(Boolean),
            command = split[0],
            params = split.slice(1).join(' ');
            for (var role in OpalBot.commands) {
                if (role == 'operator' && OpalBot.operators.includes(message.author.id) && OpalBot.commands.operator.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params);
                            return;
                        }
                        command_fn(message, params);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command operator.${command}):`, e);
                    }
                }
                if (permissions[role] && OpalBot.commands[role].hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params);
                            return;
                        }
                        command_fn(message, params);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command ${role}.${command}):`, e);
                    }
                }
                if (role == 'peasants' && OpalBot.commands.peasants.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands.peasants[command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands.peasants[command_fn](message, params);
                            return;
                        }
                        command_fn(message, params);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command peasants.${command}):`, e);
                    }
                }
            }
        }
    }
});

var OpalBot = {
    prefixes: [],
    v: '0.01',
    operators: ['155545848812535808', '195712766214930432'],
    permissionAliases: {
        admin: 'ADMINISTRATOR',
        create_instant: 'CREATE_INSTANT_INVITE',
        kick: 'KICK_MEMBERS',
        ban: 'BAN_MEMBERS',
        channel: 'MANAGE_CHANNELS',
        guild: 'MANAGE_GUILD',
        react: 'ADD_REACTIONS',
        audit: 'VIEW_AUDIT_LOG',
        read: 'READ_MESSAGES',
        send: 'SEND_MESSAGES',
        tts: 'SEND_TTS_MESSAGES',
        messages: 'MANAGE_MESSAGES',
        embed: 'EMBED_LINKS',
        attach: 'ATTACH_FILES',
        history: 'READ_MESSAGE_HISTORY',
        everyone: 'MENTION_EVERYONE',
        external: 'EXTERNAL_EMOJIS',
        use_external: 'USE_EXTERNAL_EMOJIS',
        connect: 'CONNECT',
        speak: 'SPEAK',
        mute: 'MUTE_MEMBERS',
        deafen: 'DEAFEN_MEMBERS',
        move: 'MOVE_MEMBERS',
        vad: 'USE_VAD',
        nick: 'CHANGE_NICKNAME',
        manage_nicks: 'MANAGE_NICKNAMES',
        roles: 'MANAGE_ROLES',
        permissions: 'MANAGE_ROLES_OR_PERMISSIONS',
        webhooks: 'MANAGE_WEBHOOKS',
        emojis: 'MANAGE_EMOJIS'
    },
    _db: {},
    get db() {
        return new Promise((res, rej) => {
            if (Object.keys(OpalBot._db).length) { // cache that stuff so we're not a pain to the nice guys at dropbox, they provide a really nice free api ^^
                res(OpalBot._db);
                return;
            }
            database.filesListFolder({path: ''}).then(files => {
                if (!files.entries.length) {
                    res(OpalBot._db);
                    return;
                }
                var promises = [];
                files.entries.forEach(entry => {
                    promises.push(
                        database.filesDownload({
                            path: entry.path_lower
                        })
                    );
                });
                Promise.all(promises).then(a => {
                    a.forEach(r => {
                        var name = r.name;
                        if (name.slice(-5) != '.json') return;
                        name = name.slice(0, -5);
                        OpalBot._db[name] = JSON.parse(r.fileBinary);
                    });
                    res(OpalBot._db);
                }).catch(rej);
            }).catch(rej);
        });
    },
    set db(obj) {
        if (!obj.name) return;
        OpalBot._db[obj.name] = obj.value;
        if (OpalBot.timeouts.db[obj.name]) return;
        console.log('set db', JSON.stringify(OpalBot._db[obj.name]));
        OpalBot.timeouts.db[obj.name] = setTimeout(() => {
            console.log('updating database', JSON.stringify(OpalBot._db[obj.name]));
            database.filesUpload({
                path: '/' + obj.name + '.json',
                contents: JSON.stringify(OpalBot._db[obj.name]),
                mode: 'overwrite'
            }).then(console.log).catch(console.log);
            delete OpalBot.timeouts.db[obj.name];
        }, 10000);
    },
    timeouts: {
        db: {}
    }
};

OpalBot.commands = {
    roles: {}, // role-specific commands. case-insensitive
    peasants: {}, // commands that everyone can use
    operator: {}, // commands that only the users with ID declared in OpalBot.operators can use
    // permission commands
    admin: {},
    create_instant: {},
    kick: {},
    ban: {},
    channel: {},
    guild: {},
    react: {},
    audit: {},
    read: {},
    send: {},
    tts: {},
    messages: {},
    embed: {},
    attach: {},
    history: {},
    everyone: {},
    external: {},
    use_external: {},
    connect: {},
    speak: {},
    mute: {},
    deafen: {},
    move: {},
    vad: {},
    nick: {},
    manage_nicks: {},
    roles: {},
    permissions: {},
    webhooks: {},
    emojis: {}
};

OpalBot.commands.peasants.hi = 'hello';
OpalBot.commands.peasants.hey = 'hello';
OpalBot.commands.peasants.hello = (message) => {
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

OpalBot.commands.peasants.lenny = 'me';
OpalBot.commands.peasants.me = message => {
    message.channel.send('( ͡° ͜ʖ ͡°)');
};

OpalBot.commands.peasants.pong = 'ping';
OpalBot.commands.peasants.ping = (message, content) => {
    var ping = message.content.indexOf('ping') + 1 || 1000,
    pong = message.content.indexOf('pong') + 1 || 1001;
    message.reply(ping < pong ? i18n.msg('pong', 'ping') : i18n.msg('ping', 'ping')).then(msg => {
        if (!msg.editable) {
            message.channel.send(i18n.msg('result', 'ping', latency));
            return;
        }
        var latency = Math.abs(msg.createdTimestamp - message.createdTimestamp);
        msg.edit(msg.content + '\n' + i18n.msg('result', 'ping', latency));
    });
};

OpalBot.commands.peasants.runtime = message => {
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
    str = i18n.msg(k, 'runtime', ...p).replace(/\((\d+?\|.+?\|.+?)\)/g, (s, match) => {
        var split = match.split('|');
        return split[0] == 1 ? split[1] : split[2];
    });
    message.channel.send(str);
};

OpalBot.commands.peasants.status = 'test';
OpalBot.commands.peasants.test = message => {
    message.reply(i18n.msg('online', 'test'));
};

OpalBot.commands.kick.kick = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'kick'));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    reason = reason.replace(`<@${user.id}>`, '').trim();
    if (!guild_user.kickable) {
        message.channel.send(i18n.msg('cannot-kick', 'kick', user.username));
        return;
    }
    message.channel.send(i18n.msg('kicking' + (reason ? 'with-reason' : ''), 'kick', user.username, reason));
    guild_user.kick(reason).then(() => {
        message.channel.send(i18n.msg('success', 'kick', user.username));
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'kick', user.username, err));
        console.log('Error (commands.admin.kick):', err);
    });
};

OpalBot.commands.ban.ban = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'ban'));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    split = reason.replace(`<@${user.id}>`, '').trim().split('|'),
    days = split[0].trim(),
    reason = split.slice(1).join('|').trim(),
    ban;
    if (!guild_user.bannable) {
        message.channel.send(i18n.msg('cannot-ban', 'ban', user.username));
        return;
    }
    if (reason && !isNaN(days)) {
        message.channel.send(i18n.msg('banning', 'ban', user.username));
        ban = guild_user.ban({
            days: Number(days),
            reason: reason
        });
    } else {
        ban = guild_user.ban(isNaN(days) ? days : Number(days));
    }
    ban.then(() => {
        message.channel.send(
            i18n.msg('success', 'ban', user.username) +
            (days && !isNaN(days) ? '\n' + i18n.msg('deleted-since', 'ban', days) : '') + 
            (reason || isNaN(days) ? '\n' + i18n.msg('reason', 'ban', reason || days) : '')
        );
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'ban', user.username, err));
        console.log('Error (commands.admin.ban):', err);
    });
};

OpalBot.commands.ban.unban = async (message, content) => {
    if (!content.trim()) {
        message.reply(i18n.msg('no-name', 'unban'));
        return;
    }
    var split = content.split('#'),
    name = split[0],
    id = split[1],
    bans = await message.guild.fetchBans(),
    filtered = bans.filter(n => n.username == name && (id ? n.discriminator == id : true));
    if (!filtered.size) {
        message.reply(i18n.msg('no-matches' + (id ? 'with-discriminator' : ''), 'unban', name, id));
    } else if (filtered.size == 1) {
        message.guild.unban(filtered.first()).then(user => {
            message.channel.send(i18n.msg('success', 'unban', user.username));
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'unban', username, err));
            console.log('Error (commands.admin.ban):', err);
        });
    } else {
        var users = [];
        filtered.forEach(n => users.push(n));
        message.channel.send(i18n.msg('multiple-matches', 'unban', users.join(' ')));
    }
};

OpalBot.commands.peasants.prefixes = 'prefix'
OpalBot.commands.peasants.prefix = async (message, content) => {
    var list = i18n.msg('list', 'prefix'),
    add = i18n.msg('add', 'prefix'),
    remove = i18n.msg('remove', 'prefix'),
    mode = list,
    prefixes = OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default;
    if (content.slice(0, add.length) == add) mode = add;
    if (content.slice(0, remove.length) == add) mode = remove;
    content = content.slice(mode.length);
    switch (mode) {
        case list:
            if (!prefixes.length) {
                message.reply(i18n.msg('no-prefixes', 'prefix'));
                return;
            }
            message.reply(i18n.msg('list-prefixes', 'prefix', '`' + prefixes.join('` `') + '`'));
            break;
        case add:
            if (!content.trim().length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix'));
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
                OpalBot.prefixes[message.guild.id] = prefixes;
            }
            var arr = OpalBot.prefixes[message.guild.id],
            i = arr.indexOf(content.trim());
            if (i != -1) {
                message.reply(i18n.msg('prefix-already-in-use', 'prefix'));
                return;
            }
            arr.push(content.trim());
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
            message.reply(i18n.msg('prefix-added', 'prefix', content.trim()));
            break;
        case remove:
            if (!content.trim().length) {
                message.reply(i18n.msg('no-prefix-add', 'prefix'));
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
                OpalBot.prefixes[message.guild.id] = prefixes;
            }
            var arr = OpalBot.prefixes[message.guild.id],
            i = arr.indexOf(content.trim());
            if (i == -1) {
                message.reply(i18n.msg('no-prefix-found', 'prefix'));
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
            message.reply(i18n.msg('prefix-removed', 'prefix', content.trim()));
            break;
    }
};

OpalBot.commands.operator.run = 'eval';
OpalBot.commands.operator.eval = (message, content) => {
    try {
        eval(content);
    } catch(e) {
        message.reply('ERROR: ' + e);
    }
};

OpalBot.commands.operator.destroy = () => {
    client.destroy().then(() => {
        OpalBot.server.close();
    });
};

OpalBot.commands.operator.say = (message, content) => {
    try {
        var r = eval(content);
        console.log(r);
        if (r == null || !r.toString().trim()) throw r;
        message.channel.send(r.toString().trim());
    } catch(e) {
        message.channel.send(content);
    }
};

OpalBot.server = http.createServer((req, res) => {
  res.write('Hello, world!')
  res.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token);
