const Discord  = require('discord.js');
const Dropbox  = require('dropbox');
const request  = require('request');
const http     = require('http');
const i18n     = require(`./i18n`);
const client   = new Discord.Client();
const database = new Dropbox({accessToken: process.env.dropbox_token});

console.log(i18n);

i18n.msg = (message, obj, ...vars) => {
    var local = i18n[vars[vars.length - 1]],
    ref = obj;
    vars = vars.slice(0, -1);
    if (typeof obj == 'string') {
        obj = local[obj];
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
    }).replace(/\((\d+?\|.+?\|.+?)\)/g, (s, match) => { // Plural markdown, (1|singular|plural) => "1 singular"; (4|singular|plural) => "4 plural"
        var split = match.split('|');
        return split[0] == 1 ? split[1] : split[2];
    });
};

client.on('ready', async () => {
    var storage = (await OpalBot.db).data;
    if (!storage) {
        OpalBot.db = {
            name: 'data',
            value: {
                prefixes: {
                    default: ['>', '¬¬', 'opal!']
                }
            }
        };
    }
    OpalBot.prefixes = (await OpalBot.db).data.prefixes;
    console.log(i18n.msg('online', 'main', OpalBot.v, 'en'));
    client.guilds
        .get('344422448403316748').channels
        .find(n => n.name == 'secret')
            .send(i18n.msg('online', 'main', OpalBot.v, 'en'));
    var i = 0;
    setInterval(n => {
        client.guilds
            .find(n => n.id == 344422448403316748).channels
                .find(n => n.name == 'secret')
                    .send(`Bot has been up for ${++i} hours without idling or crashing!`);
    }, 3600000);
});

client.on('message', async (message) => {
    if (message.author.id == client.user.id || !message.member) return;
    var content = message.content.trim(),
    name = message.author.username,
    local = await OpalBot.util.getGuildLanguage(message.guild),
    prefixes = (OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default).concat([`<@${client.user.id}>`, i18n.msg('prefix', 'main', client.user.id, local)]),
    i = prefixes.length,
    permissions = message.member.permissions.serialize();
    for (var key in OpalBot.permissionAliases) {
        permissions[key] = permissions[OpalBot.permissionAliases[key]];
    }
    if (!content) return;
    console.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        message.reply('Add me on your server: <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot>');
        return;
    }
    if (message.channel.type != 'text') return;
    while (i--) {
        if (content.startsWith(prefixes[i])) {
            var split = content.slice(prefixes[i].length).split(/\s/).filter(Boolean),
            command = split[0],
            params = split.slice(1).join(' ');
            for (var role in OpalBot.commands) {
                if (role == 'operator' && OpalBot.operators.includes(message.author.id) && OpalBot.commands.operator.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params, local);
                            return;
                        }
                        command_fn(message, params, local);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command operator.${command}):`, e);
                    }
                }
                if (permissions[role] && OpalBot.commands[role].hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params, local);
                            return;
                        }
                        command_fn(message, params, local);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command ${role}.${command}):`, e);
                    }
                }
                if (role == 'peasants' && OpalBot.commands.peasants.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands.peasants[command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands.peasants[command_fn](message, params, local);
                            return;
                        }
                        command_fn(message, params, local);
                        break;
                    } catch(e) {
                        console.log(`Uncaught error (command peasants.${command}):`, e);
                    }
                }
            }
        }
    }
    // Unprefixed triggers, usually used by confirm and cancel commands.
    OpalBot.unprefixed.forEach(function(obj, idx) {
        var cases = obj.triggers || [obj.trigger],
        users = obj.users || [obj.user].filter(Boolean);
        if (cases.length == 1 && cases[0] == undefined) {
            console.log('Invalid unprefixed command: missing trigger');
            return;
        }
        if (obj.caseinsensitive) {
            cases = cases.map(str => str.toLowerCase());
            content = content.toLowerCase();
        }
        var index = cases.indexOf(content);
        if (index == -1) return;
        if (
            (users.length ? users.includes(message.author.id) : true) &&
            obj.channel == message.channel.id
        ) {
            if (obj.__timeoutID) {
                clearTimeout(obj.__timeoutID);
            }
            OpalBot.unprefixed.splice(idx, 1);
            obj.callback(message, index);
        }
    });
});

var OpalBot = {
    prefixes: [],
    unprefixed: [],
    v: '0.01',
    operators: ['155545848812535808', '195712766214930432'],
    util: {},
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
                        OpalBot._db[name] = JSON.parse(Buffer.from(r.fileBinary, 'base64').toString());
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
        //console.log('set db', JSON.stringify(OpalBot._db[obj.name]));
        OpalBot.timeouts.db[obj.name] = setTimeout(() => {
            //console.log('updating database', JSON.stringify(OpalBot._db[obj.name]));
            database.filesUpload({
                path: '/' + obj.name + '.json',
                contents: Buffer.from(JSON.stringify(OpalBot._db[obj.name])).toString('base64'),
                mode: 'overwrite'
            }).catch(console.log);
            delete OpalBot.timeouts.db[obj.name];
        }, 10000);
    },
    timeouts: {
        db: {}
    }
};

OpalBot.unprefixed.push = (...arr) => {     // It's hacky, but it works. Try not to access OpalBot.unprefixed by reference though. 
                                            // And also try to always provide a timeout. This isn't supposed to be a replacement for commands.
    for (var i in OpalBot.unprefixed) {
        var original = OpalBot.unprefixed[i];
        original.triggers = original.triggers || [original.trigger];
        for (var k in arr) {
            var item = arr[k];
            item.triggers = item.triggers || [item.trigger];
            var conflicts = false,
            l = item.triggers.length;
            while (l--) {
                if (original.triggers.includes(item.triggers[i])) {
                    conflicts = true;
                }
            }
            if (
                !item.channel ||
                (conflicts) &&
                (item.user ? original.user == item.user : false) && 
                (item.channel ? original.channel == item.channel : false)
            ) {
                arr.splice(k, 1);
            }
        }
    }
    if (!arr.length) return true;
    arr.forEach((obj, idx) => {
        if (obj.timeout) {
            obj.__timeoutID = setTimeout(() => {
                OpalBot.unprefixed.splice(idx, 1);
                try {
                    if (obj.ontimeout) {
                        obj.ontimeout();
                    }
                } catch(e) {
                    console.log('Error caught in unprefixed timeout callback', e);
                }
            }, obj.timeout);
        }
    });
    var obj = {};
    for (var i in OpalBot.unprefixed) { // Save methods
        if (isNaN(i)) {
            obj[i] = OpalBot.unprefixed[i];
        }
    }
    OpalBot.unprefixed = OpalBot.unprefixed.concat(arr);
    for (var k in obj) { // Port methods
        if (isNaN(k)) {
            OpalBot.unprefixed[k] = obj[k];
        }
    }
};

OpalBot.unprefixed.remove = (obj) => {
    var fn = typeof obj == 'function' ? obj : (el) => {
        for (var i in obj) {
            if (obj[i] != el[i]) {
                return false;
            }
        }
        return true;
    };
    var i = OpalBot.unprefixed.findIndex(fn);
    if (i == -1) return false;
    return OpalBot.unprefixed.splice(i, 1);
};


OpalBot.util.getChannelMessages = async (channel, before, break_function) => { // break function MUST return true for the message querying to stop, truthy values don't do the trick
    before = before || Date.now() - 1209600000; // 2 weeks
    return new Promise(async (res, rej) => {
        var LIMIT = 50,
        last_id = null,
        collection = null;
        while (LIMIT--) {
            try {
                var coll = await channel.fetchMessages({
                    limit: 100,
                    ...last_id
                });
            } catch(e) {
                rej(e);
            }
            if (!collection) {
                collection = coll;
            } else {
                collection = collection.concat(coll);
            }
            last_id = {before: coll.last().id};
            if (coll.last().createdTimestamp < before || (typeof break_function != 'function' || break_function(collection) === true)) {
                break;
            }
        }
        collection = collection.filter(model => {
            return model.createdTimestamp > before;
        });
        res(collection);
    });
};

OpalBot.util.getGuildLanguage = async (guild) => {
    var langs = (await OpalBot.db).data.languages;
    return langs[guild.id] || langs.default;
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

OpalBot.commands.peasants.avi = 'avatar';
OpalBot.commands.peasants.avatar = (message, content, lang) => {
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

OpalBot.commands.peasants.lenny = 'me';
OpalBot.commands.peasants.me = message => {
    message.channel.send('( ͡° ͜ʖ ͡°)');
};

OpalBot.commands.peasants.pong = 'ping';
OpalBot.commands.peasants.ping = (message, content, lang) => {
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

OpalBot.commands.peasants.runtime = (message, content, lang) => {
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

OpalBot.commands.peasants.status = 'test';
OpalBot.commands.peasants.test = (message, content, lang) => {
    message.reply(i18n.msg('online', 'test', lang));
};

OpalBot.commands.peasants.akinator = (message, content, lang) => {
    var ref = OpalBot.commands.peasants.akinator,
    id = message.author.id,
    mode = 'start',
    close = i18n.msg('close', 'akinator', lang);
    if (content.slice(0, close.length) == close) mode = close;
    if (mode == close) {
        if (ref.sessions[id]) {
            delete ref.sessions[id];
            OpalBot.unprefixed.remove({
                type: 'akinator',
                user: message.author.id,
                channel: message.channel.id
            });
            message.channel.send(i18n.msg('session-closed', 'akinator', lang));
        } else {
            message.channel.send(i18n.msg('no-session-open', 'akinator', lang));
        }
        return;
    }
    ref.sessions = ref.sessions || {};
    if (ref.sessions[id]) {
        message.channel.send(i18n.msg('session-open', 'akinator', lang));
        return;
    }
    request('http://api-en3.akinator.com/ws/new_session?partner=1&player=' + message.author.username, (err, r, body) => {
        if (err) {
            message.channel.send(i18n.msg('server-error', 'akinator', lang));
            return;
        }
        var json = JSON.parse(body);
        if (json.completion != 'OK') {
            message.channel.send(i18n.msg('unexpected-code', 'akinator', json.completion, lang));
            return;
        }
        ref.sessions[id] = json.parameters.identification;
        OpalBot.commands.peasants.akinator.ask(message, json.parameters.step_information, json.parameters.identification, lang);
    });
};

OpalBot.commands.peasants.akinator.ask = async (message, step, session, lang) => {
    var split = [
        i18n.msg('1', 'akinator', lang).split('|'), // Yes
        i18n.msg('2', 'akinator', lang).split('|'), // No
        i18n.msg('3', 'akinator', lang).split('|'), // I don't know
        i18n.msg('4', 'akinator', lang).split('|'), // Probably
        i18n.msg('5', 'akinator', lang).split('|')  // Probably not
    ],
    triggers = [].concat(...split),
    last_bot_message = null,
    blocked = OpalBot.unprefixed.push({
        type: 'akinator',
        triggers: triggers,
        channel: message.channel.id,
        user: message.author.id,
        caseinsensitive: true,
        callback: (message, index) => {
            var trigger = triggers[index],
            match = split.find(a => a.includes(trigger)),
            r = split.indexOf(match);
            request(
                `http://api-en3.akinator.com/ws/answer?step=${step.step}&answer=${r}&session=${session.session}&signature=${session.signature}`, 
                (err, r, body) => {
                if (err) {
                    message.channel.send(i18n.msg('server-error', 'akinator', lang));
                    return;
                }
                var json = JSON.parse(body);
                if (json.completion != 'OK') {
                    if (json.completion == 'KO - TIMEOUT') {
                        message.channel.send(i18n.msg('timed-out', 'akinator', lang));
                        return;
                    }
                    message.channel.send(i18n.msg('unexpected-code', 'akinator', json.completion, lang));
                    delete OpalBot.commands.peasants.akinator.sessions[message.author.id];
                    return;
                }
                message.channel.send(JSON.stringify(json, null, 2));
                OpalBot.commands.peasants.akinator.ask(message, json.parameters, session);
            })
        },
        timeout: 60000,
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'akinator', lang));
            delete OpalBot.commands.peasants.akinator.sessions[message.author.id];
            OpalBot.unprefixed.remove({
                type: 'akinator',
                user: message.author.id,
                channel: message.channel.id
            });
        }
    });
    if (blocked === true) {
        message.channel.send(i18n.msg('blocked', 'akinator', lang));
    } else {
        var reference = split.map((a, i) => {
            return a.join('|') + '=' + step.answers[i].answer;
        });
        reference = '```' + reference.join('\n') + '```';
        last_bot_message = await message.channel.send(i18n.msg('question', 'akinator', Number(step.step) + 1, step.question, lang) + reference);
    }
};

OpalBot.commands.kick.kick = (message, reason, lang) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'kick', lang));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    reason = reason.replace(`<@${user.id}>`, '').trim();
    if (!guild_user.kickable) {
        message.channel.send(i18n.msg('cannot-kick', 'kick', user.username, lang));
        return;
    }
    message.channel.send(i18n.msg('kicking' + (reason ? 'with-reason' : ''), 'kick', user.username, reason, lang));
    guild_user.kick(reason).then(() => {
        message.channel.send(i18n.msg('success', 'kick', user.username, lang));
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'kick', user.username, err, lang));
        console.log('Error (commands.admin.kick):', err);
    });
};

OpalBot.commands.ban.ban = (message, reason, lang) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'ban', lang));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    split = reason.replace(`<@${user.id}>`, '').trim().split('|'),
    days = split[0].trim(),
    reason = split.slice(1).join('|').trim(),
    ban;
    if (!guild_user.bannable) {
        message.channel.send(i18n.msg('cannot-ban', 'ban', user.username, lang));
        return;
    }
    if (reason && !isNaN(days)) {
        message.channel.send(i18n.msg('banning', 'ban', user.username, lang));
        ban = guild_user.ban({
            days: Number(days),
            reason: reason
        });
    } else {
        ban = guild_user.ban(isNaN(days) ? days : Number(days));
    }
    ban.then(() => {
        message.channel.send(
            i18n.msg('success', 'ban', user.username, lang) +
            (days && !isNaN(days) ? '\n' + i18n.msg('deleted-since', 'ban', days, lang) : '') + 
            (reason || isNaN(days) ? '\n' + i18n.msg('reason', 'ban', reason || days, lang) : '')
        );
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'ban', user.username, err, lang));
        console.log('Error (commands.admin.ban):', err);
    });
};

OpalBot.commands.ban.unban = async (message, content, lang) => {
    if (!content) {
        message.reply(i18n.msg('no-name', 'unban', lang));
        return;
    }
    var split = content.split('#'),
    name = split[0],
    id = split[1],
    bans = await message.guild.fetchBans(),
    filtered = bans.filter(n => n.username == name && (id ? n.discriminator == id : true));
    if (!filtered.size) {
        message.reply(i18n.msg('no-matches' + (id ? 'with-discriminator' : ''), 'unban', name, id, lang));
    } else if (filtered.size == 1) {
        message.guild.unban(filtered.first()).then(user => {
            message.channel.send(i18n.msg('success', 'unban', user.username, lang));
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'unban', username, err, lang));
            console.log('Error (commands.admin.ban):', err);
        });
    } else {
        var users = [];
        filtered.forEach(n => users.push(n));
        message.channel.send(i18n.msg('multiple-matches', 'unban', users.join(' '), lang));
    }
};

OpalBot.commands.peasants.prefixes = 'prefix'
OpalBot.commands.peasants.prefix = async (message, content, lang) => {
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

OpalBot.commands.admin.prune = async (message, content, lang) => {
    var count;
    if (!content) {
        content = 7;
    } else if (isNaN(count = parseInt(content, 10))) {
        message.reply(i18n.msg('invalid', 'prune', lang));
        return;
    } else if (count == 0) {
        message.reply(i18n.msg('non-zero', 'prune', lang));
        return;
    }
    try {
        var pruned = await message.guild.pruneMembers(count, true);
    } catch(e) {
        message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
        return;
    }
    if (!pruned) {
        message.reply(i18n.msg('lonely', 'prune', lang));
        return;
    }
    var blocked = OpalBot.unprefixed.push({
        type: 'prune',
        triggers: [
            i18n.msg('confirm', 'main', lang),
            i18n.msg('cancel', 'main', lang)
        ],
        user: message.author.id,
        channel: message.channel.id,
        caseinsensitive: true,
        timeout: 30000,
        callback: async (message, index) => {
            if (index == 0) { // confirm
                try {
                    message.channel.send(i18n.msg('pruning', 'prune', lang));
                    var pruned = await message.guild.pruneMembers(count);
                    message.channel.send(i18n.msg('pruned', 'prune', pruned, lang));
                } catch(e) {
                    message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
                }
            } else { // cancel
                message.channel.send(i18n.msg('cancelled', 'prune', lang));
            }
        },
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'prune', lang));
        }
    });
    if (blocked === true) {
        message.channel.send(i18n.msg('blocked', 'prune', lang));
    } else {
        message.channel.send(i18n.msg('prompt', 'prune', pruned, lang));
    }
};

OpalBot.commands.admin.bulkdelete = 'purge';
OpalBot.commands.admin.purge = async (message, content, lang) => {
    if (isNaN(parseInt(content, 10))) {
        message.reply(i18n.msg('usage', 'purge', lang));
        return;
    }
    var count = parseInt(content, 10),
    member = message.mentions.users.first() || content.replace(/^\d+/, '').trim(),
    isId = false;
    if (typeof member != 'string') {
        isId = true;
        member = member.id;
    }
    message.channel.send(i18n.msg('loading', 'purge', lang));
    var ids = new Set(),
    messages = await OpalBot.util.getChannelMessages(message.channel, null, coll => {
        var l = coll.filter(model => {
            return member ? (isId ? model.author.id == member : model.author.username + '#' + model.author.discriminator == member) : true;
        }).size;
        if (l > count) return true;
    });
    messages = messages.filter(model => {
        return member ? (isId ? model.author.id == member : model.author.username + '#' + model.author.discriminator == member) : true;
    });
    if (!messages.size) {
        message.channel.send(i18n.msg('no-messages', 'purge', lang));
        return;
    } else if (messages.size > count) {
        var i = messages.size - count;
        while (i--) {
            messages.delete(messages.lastKey());
        }
    }
    messages = messages.filter(msg => msg.deletable); // This is done separately to the main .filter to provide a helpful error message
    if (!messages.size) {
        message.channel.send(i18n.msg('missing-permissions', 'purge', lang));
        return;
    }
    messages.forEach(model => ids.add(model.author.id));
    var deletionStack = [],
    blocked = OpalBot.unprefixed.push({
        type: 'akinator',
        triggers: [
            i18n.msg('confirm', 'main', lang),
            i18n.msg('cancel', 'main', lang)
        ],
        user: message.author.id,
        channel: message.channel.id,
        caseinsensitive: true,
        timeout: 30000,
        callback: async (message, index) => {
            if (index == 0) { // confirm
                try {
                    deletionStack.push(message, await message.channel.send(i18n.msg('deleting', 'purge', lang)));
                    for (var msg of messages.values()) {
                        await msg.delete();
                    }
                    deletionStack.forEach(msg => msg.delete());
                    message.channel.send(i18n.msg('deleted', 'purge', messages.size, lang));
                } catch(e) {
                    message.channel.send(i18n.msg('missing-permissions', 'purge', lang));
                    console.log(e);
                }
            } else { // cancel
                message.channel.send(i18n.msg('cancelled', 'purge', lang));
            }
        },
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'purge', lang));
        }
    });
    if (blocked === true) {
        message.channel.send(i18n.msg('blocked', 'purge', lang));
    } else {
        deletionStack.push(await message.channel.send(i18n.msg('prompt', 'purge', messages.size, ids.size, lang)));
    }
};

OpalBot.commands.operator.run = 'eval';
OpalBot.commands.operator.eval = (message, content) => {
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

OpalBot.commands.operator.gist = (message, content) => {
    var split = content.split('/');
    if (split.length == 1) {
        split.unshift('Dorumin'); // my GitHub follow ples
    } else if (split.length == 3) {
        split.pop(); // no need for /raw
    }
    request(`https://gist.github.com/${split.join('/')}/raw`, (err, r, body) => {
        console.log(err, r, body);
        if (err) return;
        message.channel.send('Package loaded');
        try {
            eval(body);
        } catch(e) {
            message.channel.send(e.toString());
        }
    });
};

OpalBot.server = http.createServer((req, res) => {
  res.write('Hello, world!')
  res.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token);
