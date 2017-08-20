const Discord = require('discord.js');
const http = require('http');
const i18n = require(`./i18n/${process.env.lang || 'en'}.json`);
const client = new Discord.Client();

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
  var storage = null;
  if (!storage) {
    storage = '["!", "@", ">", "¬¬"]';
  }
  OpalBot.prefixes = JSON.parse(storage);
  OpalBot.prefixes.push(`<@${client.user.id}>`, i18n.msg('prefix', 'main', client.user.id));
  console.log(i18n.msg('online', 'main', OpalBot.v));
  var i = 0;
  setInterval(n => {
      client.guilds
        .find(n => n.id == 344422448403316748).channels
            .find(n => n.name == 'secret')
                .send(`Bot has been up for ${++i} hours without idling or crashing!`);
  }, 3600000);
});

client.on('message', message => {
    if (message.author.id == client.user.id) return;
    var content = message.content,
    name = message.author.username,
    i = OpalBot.prefixes.length;
    if (!content.trim()) return;
    console.log(name + ': ' + content + (message.channel.type == 'text' ? ' @ ' + message.guild.name : ''));
    if (message.channel.type == 'dm' || message.channel.type == 'group') {
        message.reply('Add me on your server: <https://discordapp.com/oauth2/authorize?client_id=348233224293449729&scope=bot>');
        return;
    }
    if (message.channel.type != 'text') return;
    while (i--) {
        if (content.startsWith(OpalBot.prefixes[i])) {
            var split = content.slice(OpalBot.prefixes[i].length).split(' ').filter(Boolean),
            command = split[0],
            params = split.slice(1).join(' ');
            console.log(split, OpalBot.prefixes[i]);
            //console.log(message.member.roles.find(n => n.name == 'admin');
            for (var role in OpalBot.commands) {
                if (message.member.roles.find(n => n.name.toLowerCase() == role) && OpalBot.commands[role].hasOwnProperty(command)) {
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
    v: '0.01'
};

OpalBot.commands = {
    admin: {},
    mods: {},
    peasants: {}
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
            message.channel.send(i18n.msg('cannot-edit', 'ping'));
            return;
        }
        msg.edit(msg.content + '\n' + i18n.msg('result', 'ping', msg.createdTimestamp - message.createdTimestamp));
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

OpalBot.commands.admin.kick = (message, reason) => {
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
    message.channel.send(i18n.msg('kicking' + (reason ? 'with-reason' : ''), 'kick', reason));
    guild_user.kick(reason).then(() => {
        message.channel.send(i18n.msg('success', 'kick', user.username));
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'kick', user.username, err));
        console.log('Error (commands.admin.kick):', err);
    });
};

OpalBot.commands.admin.ban = (message, reason) => {
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
        message.channel.send(`Failed while banning ${user.username}. ${err}`);
        console.log('Error (commands.admin.ban):', err);
    });
};

OpalBot.commands.admin.run = 'eval';
OpalBot.commands.admin.eval = (message, content) => {
    try {
        eval(content);
    } catch(e) {
        message.reply('ERROR: ' + e);
    }
};

OpalBot.commands.admin.destroy = () => {
    client.destroy().then(() => {
        client.login(process.env.token || 'MzQ4MjMzMjI0MjkzNDQ5NzI5.DHpZ_A.ABB3YsfVWglFXYcURh0GR1ZnXQU');
    });
};

OpalBot.commands.admin.say = (message, content) => {
    try {
        var r = eval(content);
        console.log(r);
        if (!r || !r.toString().trim()) throw r;
        message.channel.send(r.toString().trim());
    } catch(e) {
        message.channel.send(content);
    }
};

http.createServer((request, response) => {
  response.writeHead(200);
  response.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token || 'MzQ4MjMzMjI0MjkzNDQ5NzI5.DHpZ_A.ABB3YsfVWglFXYcURh0GR1ZnXQU');
