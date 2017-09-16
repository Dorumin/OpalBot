const Discord  = require('discord.js');
const Dropbox  = require('dropbox');
const request  = require('request');
const http     = require('http');
const util     = require('util');
const i18n     = require(`./i18n`);
const client   = new Discord.Client();
const database = new Dropbox({accessToken: process.env.dropbox_token});

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
    OpalBot.util.log(i18n.msg('online', 'main', OpalBot.v, 'en'));
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

client.on('guildCreate', (guild) => {
    client.guilds
        .get('344422448403316748').channels
        .find(n => n.name == 'secret')
            .send(`Joined guild ${guild} (${guild.id})`);
});

client.on('message', async (message) => {
    if (message.author.id == client.user.id || (!message.member && message.channel.type == 'text')) return;
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        OpalBot.util.log(message.author.username + ': ' + message.content.trim());
        message.reply('Add me on your server! <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot&permissions=60416>');
        return;
    }
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
    OpalBot.util.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
    if (message.channel.type != 'text') return;
    while (i--) {
        if (content.startsWith(prefixes[i])) {
            var split = content.slice(prefixes[i].length).split(/\s/).filter(Boolean),
            command = split[0].toLowerCase(),
            params = split.slice(1).join(' ');
            for (var role in OpalBot.commands) {
                if (role == 'operator' && OpalBot.operators.includes(message.author.id) && OpalBot.commands.operator.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params, local, i18n, OpalBot);
                            return;
                        }
                        command_fn(message, params, local, i18n, OpalBot);
                        break;
                    } catch(e) {
                        OpalBot.util.log(`Uncaught error (command operator.${command}):`, e);
                    }
                }
                if (permissions[role] && OpalBot.commands[role].hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands[role][command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands[role][command_fn](message, params, local, i18n, OpalBot);
                            return;
                        }
                        command_fn(message, params, local, i18n, OpalBot);
                        break;
                    } catch(e) {
                        OpalBot.util.log(`Uncaught error (command ${role}.${command}):`, e);
                    }
                }
                if (role == 'peasants' && OpalBot.commands.peasants.hasOwnProperty(command)) {
                    try {
                        var command_fn = OpalBot.commands.peasants[command];
                        if (command_fn.constructor === String) {
                            OpalBot.commands.peasants[command_fn](message, params, local, i18n, OpalBot);
                            return;
                        }
                        command_fn(message, params, local, i18n, OpalBot);
                        break;
                    } catch(e) {
                        OpalBot.util.log(`Uncaught error (command peasants.${command}):`, e);
                    }
                }
            }
        }
    }
    // Unprefixed triggers, usually used by confirm and cancel commands.
    OpalBot.unprefixed.forEach(function(obj, idx) {
        var cases = (obj.triggers || [obj.trigger]).filter(Boolean).map(hopefully_str => String(hopefully_str)),
        users = obj.users || [obj.user].filter(Boolean);
        if (obj.caseinsensitive) {
            cases = cases.map(str => str.toLowerCase());
            content = content.toLowerCase();
        }
        var index = cases.indexOf(content);
        if (cases.length && index == -1) return;
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
    v: '0.02',
    log: 'Debug log for OpalBot v0.02\n',
    log_count: 0,
    color: 0x2196f3,
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
        OpalBot.timeouts.db[obj.name] = setTimeout(() => {
            database.filesUpload({
                path: '/' + obj.name + '.json',
                contents: Buffer.from(JSON.stringify(OpalBot._db[obj.name])).toString('base64'),
                mode: 'overwrite'
            }).catch(OpalBot.util.log);
            delete OpalBot.timeouts.db[obj.name];
        }, 10000);
    },
    get uptime() {
        return client.uptime;
    },
    get client() {
        return client;
    },
    get Discord() {
        return Discord;
    },
    timeouts: {
        db: {}
    },
    storage: {}
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
                    OpalBot.util.log('Error caught in unprefixed timeout callback', e);
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
    var elem = OpalBot.unprefixed.splice(i, 1)[0]
    if (elem.__timeoutID) {
        clearTimeout(elem.__timeoutID);
    }
    if (elem.oncancel) {
        elem.oncancel();
    }
    return elem;
};

OpalBot.unprefixed.expect = (obj) => {
    return new Promise((res, rej) => {
        var blocked = OpalBot.unprefixed.push({
            caseinsensitive: true,
            callback: (message, index) => res({message: message, index: index}),
            timeout: 60000,
            ontimeout: () => {
                rej('timeout');
            },
            ...obj
        });
        if (blocked === true) {
            rej('blocked');
        }
    });
};

OpalBot.util.pad = (n) => {
    if (typeof n != 'number') throw new TypeError('n must be a number');
    return ('0000' + n).slice(-4);
};

OpalBot.util.log = (...args) => {
    console.log(...args);
    var pad = OpalBot.util.pad;
    args.forEach(arg => {
        OpalBot.log_count++
        if (typeof arg == 'object') {
            OpalBot.log += '______\n' + pad(OpalBot.log_count) + ': ' + util.inspect(arg) + '\n______\n';
        } else {
            OpalBot.log += pad(OpalBot.log_count) + ': ' + arg + '\n';
        }
    });
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
    try {
        return langs[guild.id] || langs.default;
    } catch(e) {
        return langs.default;
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
    emojis: {},
    ...require('./commands')
};

OpalBot.serv_paths = require('./plugins/server');
OpalBot.server = http.createServer((req, res) => {
    OpalBot.util.log('Server request: ' + req.url);
    var path = req.url.slice(1).split('?')[0];
    if (OpalBot.serv_paths[path]) {
        OpalBot.serv_paths[path](req, res, OpalBot);
        return;
    }
    res.write(OpalBot.log);
    res.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token);
