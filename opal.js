const Discord = require('discord.js');
const http = require('http');
const client = new Discord.Client();

client.on('ready', async () => {
  var storage = null;
  if (!storage) {
    storage = '["!", "@", ">", "¬¬"]';
  }
  OpalBot.prefixes = JSON.parse(storage);
  OpalBot.prefixes.push(`<@${client.user.id}>`, `<@${client.user.id}>, do `);
  console.log(`OpalBot v${OpalBot.v} is online!`);
  var i = 0;
  setInterval(n => {
      client.guilds
        .find(n => n.id == 344422448403316748).channels
            .find(n => n.name == 'secret')
                .send(`Bot has been up for ${++i} hours (not really, more like 6 minutes) without idling or crashing!`);
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
            message.reply('Hello, {data-error: user-not-implemented}');
            break;
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
    message.reply(ping < pong ? 'Pong!' : 'Ping!').then(msg => {
        if (!msg.editable) {
            message.channel.send('I cannot edit my own messages. :(');
            return;
        }
        msg.edit(msg.content + '\n' + (msg.createdTimestamp - message.createdTimestamp) + 'ms!');
    });
};

OpalBot.commands.peasants.runtime = message => {
    var f = Math.floor,
    s = f(client.uptime / 1000),
    m = f(s / 60),
    h = f(m / 60),
    d = f(h / 24),
    w = f(d / 7),
    a = [
        s % 60,
        m % 60,
        h % 24,
        d % 7,
        w
    ],
    i = {
        s: 0,
        m: 1,
        h: 2,
        d: 3,
        w: 4
    },
    str = 'OpalBot v${v} has been running for ${w "$1 weeks," "$1 week,"} ${d "$1 days," "$1 day,"} ${h "$1 hours," "$1 hour,"} ${m "$1 minutes," "$1 minute,"} ${s "and $1 seconds" "and $1 second"}.';
    str = str.replace(/\${(.+?)}/g, (s, match) => {
        var type = match.charAt(0);
        if (type == 'v') {
            return OpalBot.v;
        }
        var cases = match.match(/".+?"/g),
        item = a[i[type]];
        if (!cases) {
            return '#invalid cases#';
        } else if (cases.length = 1) {
            cases = [cases[0], cases[0]];
        }
        cases = cases.map(str => str.slice(1, -1)); // rm quotes
        if (item) {
            var which = (item == 1 ? cases[0] : cases[1]).replace('$1', item);
            return which;
        } else if (item === 0) {
            return '';
        }
        return '#invalid type#';
    }).replace(/,\s*\./g, '.').replace(/(\s)+/, '$1');
    message.channel.send(str);
};

OpalBot.commands.admin.kick = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send('No user mention found. Please @ the user you want to kick!');
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    reason = reason.replace(`<@${user.id}>`, '').trim();
    if (!guild_user.kickable) {
        message.channel.send(`Cannot kick ${user.username}: missing permissions.`);
        return;
    }
    message.channel.send(`Kicking ${user.username}${reason && ': ' + reason}...`);
    guild_user.kick(reason).then(() => {
        message.channel.send(`Successfully kicked ${user.username}!`);
    }).catch(err => {
        message.channel.send(`Failed while kicking ${user.username}. ${err}`);
        console.log('Error (commands.admin.kick):', err);
    });
};

OpalBot.commands.admin.ban = (message, reason) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send('No user mention found. Please @ the user you want to ban!');
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    split = reason.replace(`<@${user.id}>`, '').trim().split('|'),
    days = split[0].trim(),
    reason = split.slice(1).join('|').trim(),
    ban;
    if (!guild_user.bannable) {
        message.channel.send(`Cannot ban ${user.username}: missing permissions.`);
        return;
    }
    if (reason && !isNaN(days)) {
        message.channel.send(`Banning ${user.username}...`);
        ban = guild_user.ban({
            days: Number(days),
            reason: reason
        });
    } else {
        ban = guild_user.ban(isNaN(days) ? days : Number(days));
    }
    ban.then(() => {
        message.channel.send(
            `Successfully banned ${user.username}!` +
            (days && !isNaN(days) ? `\nDeleted messages since ${days} days ago.` : '') + 
            (reason || isNaN(days) ? `\nReason: ${reason || days}` : '')
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
  console.log('SERVER REQUEST CAUGHT.');
  response.writeHead(200);
  response.end();
}).listen(process.env.PORT || 5000);

client.login(process.env.token || 'MzQ4MjMzMjI0MjkzNDQ5NzI5.DHpZ_A.ABB3YsfVWglFXYcURh0GR1ZnXQU');
