const got = require('got'),
cheerio = require('cheerio'),
config = require('./config.js'),
start_activity = require('./activity.js');

module.exports = (OpalBot) => {
    async function update_mutuals(sessions, key) {
        const user = await sessions[key];
        user.non_mutuals = [];
        user.mutual_guilds = user.guilds.filter(guild => {
            const match = guild.mutual = OpalBot.client.guilds.get(guild.id);
            if (!match) {
                user.non_mutuals.push(guild);
            }
            return match;
        });
        sessions[key] = Promise.resolve(user);
    }

    async function updateSeen(id, i) {
        const { seen } = (await OpalBot.db);
        const old = seen[id],
        cur = [0, 0];
        if (typeof old == 'number') {
            cur[0] = old;
        } else if (old) {
            cur[0] = old[0];
            cur[1] = old[1];
        } else {
            cur[0] = Date.now();
            cur[1] = Date.now();
        }
        cur[i] = Date.now();
        OpalBot.util.extendDatabase('seen', {
            [id]: cur
        });
    }

    const client = OpalBot.client,
    i18n = OpalBot.i18n;

    client.on('ready', async () => {
        OpalBot.util.extendDatabase('data', {
            prefixes: {
                default: ['>', '¬¬', 'opal!']
            }
        });
        OpalBot.prefixes = (await OpalBot.db).data.prefixes;
        OpalBot.util.log(i18n.msg('online', 'main', OpalBot.v, 'en'));
        client.guilds
            .get('344422448403316748').channels
            .get('387039127083679753')
                .send(i18n.msg('online', 'main', OpalBot.v, 'en') + ' unit: ' + (
                    config.IS_BACKUP ? config.BACKUP_APP_NAME : config.APP_NAME
                ))
                    .catch(OpalBot.util.log);
        let i = 0;
        setInterval(n => {
            client.guilds
            .get('344422448403316748').channels
            .get('387039127083679753')
                .send(`Bot has been up for ${++i} hours without idling or crashing!`)
                    .catch(OpalBot.util.log);
        }, 3600000);

        start_activity(OpalBot);
    });

    client.on('presenceUpdate', async (old, newb) => {
        let oldstat = old.presence.status,
        newstat = newb.presence.status;
        if (['idle', 'offline'].includes(newstat) && ['online', 'dnd'].includes(oldstat)) {
            updateSeen(newb.user.id, 0);
        }
    });

    client.on('guildCreate', async (guild) => {
        client.guilds
            .get('344422448403316748').channels
            .get('344469764850319361')
                .send(`Joined guild ${guild} (${guild.id})`);

        // const prefixes = OpalBot.prefixes[guild.id] || OpalBot.prefixes.default,
        // channel = OpalBot.util.get_default_channel(guild);

        // if (channel) {
        //     channel.send(i18n.msg('on-enter', 'main', '`' + prefixes.join('`, `') + '`', 'en'));
        // }

        const sessions = OpalBot.storage.sessions = OpalBot.storage.sessions || {};

        for (var i in sessions) {
            const session = await sessions[i];
            if (session.non_mutuals.some(g => g.id == guild.id)) {
                update_mutuals(sessions, i);
            }
        }
    });

    client.on('guildDelete', async (guild) => {
        const sessions = OpalBot.storage.sessions = OpalBot.storage.sessions || {};

        for (var i in sessions) {
            const session = await sessions[i];
            if (session.mutual_guilds.some(g => g.id == guild.id)) {
                update_mutuals(sessions, i);
            }
        }
    })

    client.on('typingStart', (chan, user) => {
        OpalBot.handlers.typingStart = OpalBot.handlers.typingStart || [];

        OpalBot.handlers.typingStart.forEach(fn => fn(chan, user));

        OpalBot.storage.typingUsers = OpalBot.storage.typingUsers || {};
        if (!OpalBot.storage.typingUsers[chan.id]) {
            OpalBot.storage.typingUsers[chan.id] = [user];
        } else if (!OpalBot.storage.typingUsers[chan.id].includes(user)) {
            OpalBot.storage.typingUsers[chan.id].push(user);
        }
        updateSeen(user.id, 1);
    });

    client.on('typingStop', (chan, user) => {
        if (!OpalBot.storage.typingUsers || !OpalBot.storage.typingUsers[chan.id]) return;
        let i = OpalBot.storage.typingUsers[chan.id].indexOf(user);
        if (i != -1) {
            OpalBot.storage.typingUsers[chan.id].splice(i, 1);
        }
    });

    client.on('message', async (message) => {
        if (message.author.id == client.user.id) {
            OpalBot.util.log('→ ' + message.content);
            return;
        }
        if (message.author.bot || !OpalBot.prefixes) return;
        if (message.channel.type == 'dm' || message.channel.type == 'group') {
            OpalBot.util.log(message.author.username + ': ' + message.content.trim());
            message.reply('Add me on your server! <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot&permissions=60416>');
            return;
        }
        if (!message.member && message.channel.type == 'text') {
            OpalBot.util.log(`Fetching user ${message.author.username}${message.author.discriminator}...`);
            let d1 = Date.now();
            message.member = await message.guild.fetchMember(message.author);
            OpalBot.util.log(`Finished fetching ${message.author.username}! Time taken: ${Date.now() - d1}`);
            if (!message.member) return;
        }
        updateSeen(message.author.id, 1);
        let content = message.content.trim(),
        name = message.author.username,
        local = await OpalBot.util.getGuildLanguage(message.guild),
        prefixes = (OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default).concat([`<@${client.user.id}>`, `<@!${client.user.id}>`, `<@!${client.user.id}>, do`, `<@${client.user.id}>, do`]),
        i = prefixes.length,
        permissions = message.member.permissions.serialize(),
        tu = OpalBot.storage.typingUsers,
        d = message.createdAt,
        pad = n => ('0' + n).slice(-2);
        for (let key in OpalBot.permissionAliases) {
            permissions[key] = permissions[OpalBot.permissionAliases[key]];
        }
        if (!content) return;
        OpalBot.util.log(pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' ' + name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name + '#' + message.channel.name : '') + message.attachments.map(attachment => '\n' + attachment.url).join('\n'));
        if (message.channel.type != 'text') return;
        if (tu && tu[message.channel.id]) {
            let idx = tu[message.channel.id].indexOf(message.author);
            if (idx != -1) {
                tu[message.channel.id].splice(idx, 1);
            }
        }
        while (i--) {
            if (content.startsWith(prefixes[i])) {
                let split = content.slice(prefixes[i].length).split(/\s/).filter(Boolean),
                command = split[0].toLowerCase(),
                params = split.slice(1).join(' ');
                for (let role in OpalBot.commands) {
                    if (role == 'operator' && OpalBot.operators.includes(message.author.id) && OpalBot.commands.operator.hasOwnProperty(command)) {
                        try {
                            let command_fn = OpalBot.commands[role][command];
                            if (command_fn.constructor === String) {
                                OpalBot.commands[role][command_fn](message, params, local);
                                return;
                            }
                            command_fn(message, params, local);
                            break;
                        } catch(e) {
                            OpalBot.util.log(`Uncaught error (command operator.${command}):`, e);
                        }
                    }
                    if (permissions[role] && OpalBot.commands[role].hasOwnProperty(command)) {
                        try {
                            let command_fn = OpalBot.commands[role][command];
                            if (command_fn.constructor === String) {
                                OpalBot.commands[role][command_fn](message, params, local);
                                return;
                            }
                            command_fn(message, params, local);
                            break;
                        } catch(e) {
                            OpalBot.util.log(`Uncaught error (command ${role}.${command}):`, e);
                        }
                    }
                    if (role == 'peasants' && OpalBot.commands.peasants.hasOwnProperty(command)) {
                        try {
                            let command_fn = OpalBot.commands.peasants[command];
                            if (command_fn.constructor === String) {
                                OpalBot.commands.peasants[command_fn](message, params, local);
                                return;
                            }
                            command_fn(message, params, local);
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
            let cases = (obj.triggers || [obj.trigger]).filter(Boolean).map(hopefully_str => String(hopefully_str)),
            users = obj.users || [obj.user].filter(Boolean);
            if (obj.caseinsensitive) {
                cases = cases.map(str => str.toLowerCase());
                content = content.toLowerCase();
            }
            let index = cases.indexOf(content);
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


        if (message.author.id == '187524257280950272') {
            const matches = content.match(/https?:\/\/pokepast.es\/[0-9a-f]+/gi);
            if (matches) {
                matches.forEach(async link => {
                    const { body } = await got(link);
                    const $ = cheerio.load(body);
                    const title = $('aside h1').text();
                    const author = $('aside h2').text();
                    const articles = $('article')
                        .toArray()
                        .map(elem => $(elem).text().trim())
                        .map(text =>
                            text.split('\n')
                                .map(line => line.trim())
                                .sort((a, b) => {
                                    if (a.startsWith('-')) return 1;
                                    if (b.startsWith('-')) return -1;
                                    if (a.includes(':')) return 1;
                                    if (b.includes(':')) return -1;
                                    return 0;
                                })
                        )
                        .filter(lines => lines.length < 10)
                        .map(lines => '```ldif\n' + lines.join('\n') + '```');

                    if (title) {
                        if (author) {
                            articles.unshift('```coq\n' + title + author + '```');
                        } else {
                            articles.unshift('```' + title + '```');
                        }
                    } else if (author) {
                        articles.push('```coq\n' + author + '```');
                    }

                    message.channel.send(articles.join(''))
                });
            }
        }
    });
};
