const config = require('./config.js');

module.exports = (OpalBot) => {
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
                    config.is_backup ? config.backup_app_name : config.app_name
                ))
                    .catch(OpalBot.util.log);
        client.user.setGame('v' + OpalBot.v);
        let i = 0;
        setInterval(n => {
            client.guilds
            .get('344422448403316748').channels
            .get('387039127083679753')
                .send(`Bot has been up for ${++i} hours without idling or crashing!`)
                    .catch(OpalBot.util.log);
        }, 3600000);
    });
    
    client.on('presenceUpdate', async (old, newb) => {
        let oldstat = old.presence.status,
        newstat = newb.presence.status;
        if (['idle', 'offline'].includes(newstat) && ['online', 'dnd'].includes(oldstat)) {
            OpalBot.util.extendDatabase('seen', {
                [newb.user.id]: Date.now()
            });
        }
    });
    
    client.on('guildCreate', (guild) => {
        client.guilds
            .get('344422448403316748').channels
            .get('387039127083679753')
                .send(`Joined guild ${guild} (${guild.id})`);
    
        let prefixes = OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default;
    
        guild.defaultChannel.send(i18n.msg('on-enter', 'main', '`' + prefixes.join('`, `') + '`', 'en'));
    });
    
    client.on('message', async (message) => {
        if (message.author.id == client.user.id || (!message.member && message.channel.type == 'text')) return;
        if (message.channel.type == 'dm' || message.channel.type == 'group') {
            OpalBot.util.log(message.author.username + ': ' + message.content.trim());
            message.reply('Add me on your server! <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot&permissions=60416>');
            return;
        }
        let content = message.content.trim(),
        name = message.author.username,
        local = await OpalBot.util.getGuildLanguage(message.guild),
        prefixes = (OpalBot.prefixes[message.guild.id] || OpalBot.prefixes.default).concat([`<@${client.user.id}>`, i18n.msg('prefix', 'main', client.user.id, local)]),
        i = prefixes.length,
        permissions = message.member.permissions.serialize();
        for (let key in OpalBot.permissionAliases) {
            permissions[key] = permissions[OpalBot.permissionAliases[key]];
        }
        if (!content) return;
        OpalBot.util.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
        if (message.channel.type != 'text') return;
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
    });
};